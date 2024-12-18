require("dotenv").config();
const Imap = require("imap");
const simpleParser = require("mailparser").simpleParser;
const nodemailer = require("nodemailer");
const axios = require("axios");
const FormData = require("form-data");

// Configure IMAP
const imap = new Imap({
  user: process.env.EMAIL_USER,
  password: process.env.EMAIL_PASS,
  host: "imap.gmail.com",
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false },
});

// Arrays for email processing
let processedUIDs = []; // Stores processed UIDs
let emailQueue = []; // Queue for processing upcoming emails
let isProcessing = false; // To prevent overlapping queue processing

// function to process email body text.
function processEmail(emailBody) {
  // Regex to remove quoted content starting from "On <date> <name> wrote:"
  const mainContent = emailBody.split(/\nOn .*? wrote:/)[0].trim();
  return mainContent;
}

// Function to send email data with attachments
async function sendEmailDataWithAttachments(email, attachments) {
  const emailBody = await processEmail(email.text);
  try {
    const formData = new FormData();
    const emailData = {
      subject: email.subject || "No Subject",
      sender: email.from.value[0].address,
      senderName: email.from.value[0].name || "Unknown Sender",
      time: email.date || new Date(),
      body: emailBody || "No Body",
    };
    formData.append("emailData", JSON.stringify(emailData));
    for (const attachment of attachments) {
      formData.append(
        "attachments",
        Buffer.from(attachment.content),
        attachment.filename || "attachment"
      );
    }

    const response = await axios.post(process.env.API_ENDPOINT, formData, {
      headers: formData.getHeaders(),
    });

    const responseData = response.data;
    console.log("API Response:", responseData);
    const replyMessage = responseData.data;
    await sendReply(email, replyMessage);
  } catch (error) {
    console.error("Error sending email data with attachments:", error.message);
  }
}

// Function to handle new emails
async function handleNewEmail(email) {
  try {
    console.log("Processing email:", email.subject || "No Subject");
    const attachments = email.attachments || [];
    await sendEmailDataWithAttachments(email, attachments);
  } catch (error) {
    console.error("Error handling email:", error.message);
  }
}

// Function to send a reply email
async function sendReply(originalEmail, replyMessage) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Ensure a consistent subject for emails without a subject
  const subject = originalEmail.subject
    ? `Re: ${originalEmail.subject}`
    : "Re: (no subject)";

  // Handle undefined references by creating a proper chain
  const references = originalEmail.references
    ? originalEmail.references
    : originalEmail.messageId; // Use messageId as the start of the chain if references is missing

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: originalEmail.from.value[0].address,
    subject: subject,
    text: replyMessage,
    inReplyTo: originalEmail.messageId, // Explicitly link to the original message
    references: references, // Ensure references are always included
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Reply sent successfully!");
  } catch (error) {
    console.error("Error sending reply email:", error.message);
  }
}


// Function to process the email queue
async function processQueue() {
  if (isProcessing || emailQueue.length === 0) return;
  isProcessing = true;
  while (emailQueue.length > 0) {
    const uid = emailQueue.shift();
    const fetch = imap.fetch([uid], { bodies: "" });
    fetch.on("message", (msg) => {
      msg.on("body", async (stream) => {
        const parsed = await simpleParser(stream);
        await handleNewEmail(parsed);
      });
    });
    fetch.on("end", () => {
      console.log(`Finished processing email UID: ${uid}`);
      processedUIDs.push(uid); // Mark UID as processed
    });
  }
  isProcessing = false;
}

// Function to fetch and process unseen emails
function fetchUnseenEmails() {
  imap.search(["UNSEEN"], (err, results) => {
    if (err) {
      console.error("Error searching for emails:", err.message);
      return;
    }

    if (!results || results.length === 0) {
      console.log("No unseen emails found.");
      return;
    }

    const newEmails = results.filter((uid) => !processedUIDs.includes(uid));

    if (newEmails.length > 0) {
      console.log("New unseen emails detected:", newEmails);
      emailQueue.push(...newEmails);
      processQueue();
    }

    if (!newEmails || newEmails.length === 0) {
      console.log("Please! Do not open the mail until processing finished. If opened, send mail again.");
      return;
    }
  });
}

// Function to initialize processedUIDs with previous unread emails
function initializeProcessedUIDs(callback) {
  imap.search(["UNSEEN"], (err, results) => {
    if (err) {
      console.error("Error initializing processed UIDs:", err.message);
      callback(err);
      return;
    }

    processedUIDs = results || [];
    console.log("Initialized processed UIDs with previous unseen emails.");
    callback(null);
  });
}

// Open IMAP inbox
function openInbox(callback) {
  imap.openBox("INBOX", false, callback);
}

// Function to set up IMAP handlers
function setupIMAPHandlers() {
  imap.once("ready", () => {
    console.log("IMAP client is ready.");
    openInbox((err) => {
      if (err) throw err;

      initializeProcessedUIDs((initErr) => {
        if (initErr) {
          console.error("Error during initialization:", initErr.message);
          return;
        }

        console.log("Waiting for new emails...");
        imap.on("mail", () => {
          console.log("Mail event triggered. Checking for unseen emails...");
          fetchUnseenEmails();
        });
      });
    });
  });

  imap.once("error", (err) => {
    if (err.code === "ECONNRESET") {
      console.error("IMAP Error: Connection reset, attempting to reconnect...");
      reconnectIMAP();
    } else {
      console.error("IMAP Error:", err);
    }
  });

  imap.once("end", () => {
    console.log("IMAP connection ended.");
  });
}

// Function to reconnect IMAP client
function reconnectIMAP() {
  console.log("Reconnecting IMAP client...");
  imap.removeAllListeners(); // Remove all previous listeners
  setupIMAPHandlers(); // Reinitialize handlers
  imap.connect(); // Reconnect IMAP client
}

// Initialize IMAP handlers and connect
setupIMAPHandlers();
imap.connect();
