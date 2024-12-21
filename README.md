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
Replace your email id that you want to listen to the variable `EMAIL_USER` and app password as `EMAIL_PASS`. `EMAIL_PASS` is not your actual email password but it is app password ( You can use the [link](https://knowledge.workspace.google.com/kb/how-to-create-app-passwords-000009237) to create one.), remove any space between them. Put a link of working API at `API_ENDPOINT`.

3. Run `node index.js` to run the code. Now you can send any email to the respective email id and you will get reply of the API to the same thread.

### Request to API

```
FormData {
  _overheadLength: 492,
  _valueLength: 177954,
  _valuesToMeasure: [],
  writable: false,
  readable: true,
  dataSize: 0,
  maxDataSize: 2097152,
  pauseStreams: true,
  _released: false,
  _streams: [
    '----------------------------674727160874494646335817\r\n' +
      'Content-Disposition: form-data; name="emailData"\r\n' +
      '\r\n',
    '{"subject":"This is subject.","sender":"kumar.235@alumni.iitj.ac.in","senderName":"Abhishek Kumar (B20EE004)","time":"2024-12-21T12:48:51.000Z","body":"This is body."}',
    [Function: bound ],
    '----------------------------674727160874494646335817\r\n' +
      'Content-Disposition: form-data; name="attachments"; filename="Bill_Payment_Abhishek_Kumar.pdf"\r\n' +
      'Content-Type: application/pdf\r\n' +
      '\r\n',
    <Buffer 25 50 44 46 2d 31 2e 34 0d 0a 25 e2 e3 cf d3 0d 0a 31 20 30 20 6f 62 6a 0d 0a 3c 3c 0d 0a 2f 54 79 70 65 20 2f 50 61 67 65 0d 0a 2f 4d 65 64 69 61 42 ... 43898 more bytes>,
    [Function: bound ],
    '----------------------------674727160874494646335817\r\n' +
      'Content-Disposition: form-data; name="attachments"; filename="WhatsApp Image 2024-12-19 at 18.49.36_390a1ad8.jpg"\r\n' +
      'Content-Type: image/jpeg\r\n' +
      '\r\n',
    <Buffer ff d8 ff e0 00 10 4a 46 49 46 00 01 01 00 00 01 00 01 00 00 ff db 00 84 00 06 06 06 06 07 06 07 08 08 07 0a 0b 0a 0b 0a 0f 0e 0c 0c 0e 0f 16 10 11 10 ... 133789 more bytes>,
    [Function: bound ]
  ],
  _currentStream: null,
  _insideLoop: false,
  _pendingNext: false,
  _boundary: '--------------------------674727160874494646335817'
}
```

### API Response

```
{
  data: {
    message: 'API Response: This is body.',
    attachments: [ [Object], [Object] ]
  },
  attachments: [
    {
      filename: 'Bill_Payment_Abhishek_Kumar.pdf',
      mimeType: 'application/pdf',
      size: 43948,
      content: 'JVBERi0xLjQNCiXi48/TDQoxIDAgb2JqDQo8PA0KL1R5cGUgL1BhZ2UNCi9NZWRpYUJveCBbIDAgMCA1OTUuNSA4NDEuOTIgXQ0KL1Jlc291cmNlcyA8PCAvRXh0R1N0YXRlIDw8IC9HMyAyIDAgUiAvRzUgMyAwIFIgPj4gL0ZvbnQgPDwgL0Y0IDQgMCBSIC9GNg0KNSAwIFIgL0Y3IDYgMCBSIC9GOCA3IDAgUiAvRjkgOCAwIFIgPj4gPj4NCi9Db250ZW50cyA5IDAgUg0KL1N0cnVjdFBhcmVudHMgMA0KL1RhYnMgL1MNCi9CbGVlZEJveCBbIDAgMCA1OTUuNSA4NDEuOTIgXQ0KL1RyaW1Cb3ggWyAwIDAgNTk1LjUgODQxLjkyIF0NCi9Bbm5vdHMgWyBdDQovUGFyZW50IDEwIDAgUg0KL1JvdGF0ZSAzNjANCj4+DQplbmRvYmoNCjIgMCBvYmoNCjw8DQovY2EgMQ0KL0JNIC9Ob3JtYWwNCj4+D1r5OSniQmN+C4HRNh4l97J+KFr8pJOfFkwgv/Nfkf4cEsfA0KZW5kc3RyZWFtDQplbmRvYmoNCjE2IDAgb2JqDQo8PA0KL0xlbmd0aCAyMjgNCi9GaWx0ZXIgL0ZsYXRlRGVjb2RlDQo+Pg0Kc3RyZWFtDQp4nF2QTWrEMAyF9z6FljOLwZ50awwlQ8CL/lB3DuDYSmpoZOM4i9y+2A1T6EICSe+Dp8d7fdMUCvD3HJ3BAlMgn3GNW3YII86B2LUDH1w5ptbdYhPjvb6ZfS24aJoikxKAf+Ac1pJ3OD37OOKZ8bfsMQea4XTvzZlxs6X0jQtSAcGUAo8T4/2LTa92QeANu2iPVELZL/fe/Ck+94TQtfn668ZFj2uyDrOlGZkUQggFchiGQTEk/+9+UOPkvmxu6icFUohONPWxr1z972HKbTkjlRZCM1ItBMJHTimmStX6AUBjbzkNCmVuZHN0cmVhbQ0KZW5kb2JqDQo2IDAgb2JqDQo8PA0KL1R5cGUgL0ZvbnQNCi9TdWJ0eXBlIC9UeXBlMA0KL0Jhc2VGb250IC9DQUFBQUErSGVsaW9zLVJlZ3VsYXINCi9FbmNvZGluZyAv'... 48600 more characters
    },
    {
      filename: 'WhatsApp Image 2024-12-19 at 18.49.36_80669834.jpg',
      mimeType: 'image/jpeg',
      size: 144563,
      content: '/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAYGBgYHBgcICAcKCwoLCg8ODAwODxYQERAREBYiFRkVFRkVIh4kHhweJB42KiYmKjY+NDI0PkxERExfWl98fKcBBgYGBgcGBwgIBwoLCgsKDw4MDA4PFhAREBEQFiIVGRUVGRUiHiQeHB4kHjYqJiYqNj40MjQ+TERETF9aX3x8p//CABEIBj8DgwMBIgACEQEDEQH/xAAxAAACAwEBAAAAAAAAAAAAAAAAAQIDBAUGAQEBAQEBAQAAAAAAAAAAAAAAAQIDBAX/2gAMAwEAAhADEAAAAuXXZXc2WQsDRRadaym6UGQhkqUghGxZtcbVnVVGjmRCrVh78wapDQJgkwSZCjJRBSSgOHOMoBipMEmESSsQ2RGCGAmCGCYxDCI0AASUobHCGAAIZCGCUgQ0CkgTAAEMEMVDBDBAxKShDBDBAWCYIYRYAAW12V9pbOM0lKLOtoya5RhAAAEqGCUiMnL25mqaWumBNAAJMENAmRFSRACBjlbHKDBDCJJCUkIYkSRUW2RGCGyLbEpISkECQKRKBjhEgiMENxFjIjBKQRJBEkESQRJIQxUNkCQIYRJIQyEMqJISJIIjCJIIkgIM6y6cJ2SHE6W3ndCJgSgwAAAgTivGjCdZAe4kyEMEMiJIIjCMZxIEiFJzliSJYkmRJsrLAqLQqLQpdrSl3C0q8SlXuqDRIyvSzKtjMJua4ZbpRhOgJzzos5x0mcs6jOWdVy8k6zrkHYacY7LOKdsOG+414R3WcE74cA9AHAXoWedPRB549EHnT0YedfoQ88/Qh5994s4R3ReG+0HGOyHlE1rN84zslGcTV0uT1IuacoAAwAIITgvnrartMonqAbIzv0sl8y/TB5t+jI88/QBwDvo4Uu2HGl1w5T6gc2XQZz3vDE9gZHqDM9AUu1lTsCDkCGAwAAAEYgYgYgYAAhoAAAAAYiwlrJkQLBaywKyxECYQUwgTCBIIEwgSCKmiJIIqRERghh4i7Nq3m2yFlThOJLqcnpybHGUo0wAACCE4r56alWVp6ybMmpe+0EhBIQMQAAAAAAULe4RzbRR1mZAJkYFpCJaVhaVIuKmWGawtM8i4pC9RoNRnZeZpF5Ck0me4kQZIARXnNoAThPNq4XczRytOirlz7MJ5unXRHJI1rBcaY52aDBYa45rizPbAmZpFkqA0PJeQcQsqAQMkDTlJRkQUo0pwr1O5LDdZoqcqmyA56chfzN3NMPU5fdMy2VSzq0KzDvpRdz6d5tw3wKo8fqy07c7s01V8oO1z8p3KbKxR7FRih07DgnYgY8e7XLy131ZwZ9O45mL0NVcCXpudFJn5xFaKLEOMS3Ydi4kyxNEMLFrd8LIKcAnXKUWrIOdcrNSrNTSYiX0BI83WEbUUR0hkjsRlelFBeGaGxGGHRDnvczE9hVMdWeKcHQ5vXDE8HNFTcZLJxcKUZE'... 182752 more characters
    }
  ]
}

```
