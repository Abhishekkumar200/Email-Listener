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


async function sendEmailDataWithAttachments(email, attachments) {
  const emailBody = await processEmail(email.text);

  try {
    // Prepare form-data to send to the API
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

    // Make the API request
    const response = await axios({
      method: "post",
      url: process.env.API_ENDPOINT,
      headers: {
        ...formData.getHeaders(),
        "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
      },
      data: formData,
    });

    // Parse response data
    const responseData = response.data;
    const replyMessage = responseData.data.message || "No reply message";

    // Decode attachments
    const responseAttachments = responseData.attachments.map((attachment) => ({
      filename: attachment.filename,
      mimeType: attachment.mimeType,
      size: attachment.size,
      content: Buffer.from(attachment.content, "base64"), // Decode Base64 to binary Buffer
    }));

    console.log("Reply Message:", replyMessage);
    console.log("Response Attachments:", responseAttachments);

    // Send reply email with the received attachments
    await sendReply(email, replyMessage, responseAttachments);
  } catch (error) {
    console.error("Error sending email data with attachments:", error.message);
  }
}


// Function to send a reply email
async function sendReply(originalEmail, replyMessage, responseAttachments = []) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const subject = originalEmail.subject
    ? `Re: ${originalEmail.subject}`
    : "Re: (no subject)";
  const references = originalEmail.references || originalEmail.messageId;

  // Map the API response attachments to Nodemailer format
  const mailAttachments = responseAttachments.map((attachment) => ({
    filename: attachment.filename,
    content: attachment.content,
    contentType: attachment.mimeType,
  }));


  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: originalEmail.from.value[0].address,
    subject,
    text: replyMessage,
    inReplyTo: originalEmail.messageId,
    references,
    attachments: mailAttachments,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Reply sent successfully!");
  } catch (error) {
    console.error("Error sending reply to email: ", error.message);
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

//Function to process date and return yesterday date in proper format.
function returnYesterdayDate()
{
  const today = new Date();
  today.setDate(today.getDate() - 1)

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = date.toLocaleString("en-US", { month: "short" }); // IMAP expects abbreviated month names
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  };

  return yesterdayDate = formatDate(today);
}

// Function to fetch and process unseen emails
function fetchUnseenEmails() {
  const yesterday = returnYesterdayDate();
  imap.search(["UNSEEN", ["SINCE", yesterday] ], (err, results) => {
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

// Function to initialize processed UIDs with unseen emails from today and yesterday
function initializeProcessedUIDs(callback) { 
  const yesterday = returnYesterdayDate();
  imap.search(["UNSEEN", ["SINCE", yesterday]], (err, results) => {
    if (err) {
      console.error("Error initializing processed UIDs:", err.message);
      callback(err);
      return;
    }

    processedUIDs = results || [];
    console.log("Initialized processed UIDs with unseen emails from today and yesterday.");
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
