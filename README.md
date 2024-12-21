# About
This assignment is about creating an email listener that trigger when any new mail comes in the inbox. The email data and attachments should be sent to an API and the response data and response attachments should be replied back to the same mail thread.

# Folder structure
![image](https://github.com/user-attachments/assets/39f1a365-0ab1-4e80-9767-36e20d889ca7)

# Setup
1. Download the repo. and open it in any code editor. Open the terminal and run `npm install` to download all dependencies.
2. Create a file name .env and put environment variables like below
```
EMAIL_USER=abc@gmail.com
EMAIL_PASS=inkbzctjddwmqdtq
API_ENDPOINT=http://127.0.0.1:8080
```
Put your email id that you want to listen to the variable `EMAIL_USER` and app password as `EMAIL_PASS`. `EMAIL_PASS` is not your actual email password but it is app password ( You can use the [link](https://knowledge.workspace.google.com/kb/how-to-create-app-passwords-000009237) to create one.), remove any space between them.

