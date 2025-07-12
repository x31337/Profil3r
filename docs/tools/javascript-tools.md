# JavaScript Tools Documentation

## Overview

The JavaScript tools provide web-based interfaces and Node.js applications for Facebook automation
and messaging. All tools are located in the `tools/js_tools/` directory.

## Facebook Mass Messenger

### Location

`tools/js_tools/facebook_mass_messenger/`

### Description

A Node.js web application for sending mass messages through Facebook Messenger with a user-friendly
interface.

### Features

- **Web Interface**: Easy-to-use web dashboard
- **Bulk Messaging**: Send messages to multiple recipients
- **Message Templates**: Pre-defined message formats
- **Scheduling**: Schedule messages for later delivery
- **Analytics**: Track message delivery and responses

### Installation

```bash
cd tools/js_tools/facebook_mass_messenger
npm install
```

### Configuration

Create a `config/config.json` file:

```json
{
  "port": 4444,
  "facebook": {
    "appId": "your_app_id",
    "appSecret": "your_app_secret",
    "accessToken": "your_access_token"
  },
  "database": {
    "host": "localhost",
    "port": 5432,
    "database": "profil3r",
    "username": "profil3r",
    "password": "password"
  },
  "logging": {
    "level": "info",
    "file": "logs/messenger.log"
  }
}
```

### Usage

```bash
# Start the application
npm start

# Or use PM2 for production
pm2 start npm --name "facebook-messenger" -- start

# Access web interface
open http://localhost:4444
```

### API Endpoints

- `GET /` - Main dashboard
- `POST /send-message` - Send individual message
- `POST /send-bulk` - Send bulk messages
- `GET /api/health` - Health check endpoint
- `GET /api/stats` - Message statistics

### Docker Usage

```bash
# Build image
docker build -t facebook-messenger .

# Run container
docker run -p 4444:4444 facebook-messenger

# Or use docker-compose
docker-compose up facebook-messenger
```

## Messenger Bot Framework

### Location

`tools/js_tools/messenger_bot_framework/fbbot/`

### Description

A comprehensive Node.js library for creating Facebook Messenger bots with advanced features.

### Features

- **Webhook Handling**: Process Facebook webhook events
- **Message Processing**: Handle text, images, and attachments
- **Templates**: Rich message templates (buttons, carousels, etc.)
- **Persistent Menu**: Configure bot menu options
- **Natural Language**: Integration with NLP services
- **Analytics**: Bot interaction tracking

### Installation

```bash
cd tools/js_tools/messenger_bot_framework/fbbot
npm install
```

### Basic Bot Setup

```javascript
const FBBot = require('./lib/fbbot');

const bot = new FBBot({
  pageAccessToken: 'your_page_access_token',
  verifyToken: 'your_verify_token',
  webhookUrl: 'https://your-domain.com/webhook'
});

// Handle text messages
bot.on('message', event => {
  const senderId = event.sender.id;
  const messageText = event.message.text;

  bot.sendTextMessage(senderId, `You said: ${messageText}`);
});

// Handle postback events
bot.on('postback', event => {
  const senderId = event.sender.id;
  const payload = event.postback.payload;

  bot.sendTextMessage(senderId, `Postback: ${payload}`);
});

// Start the bot
bot.start(3000);
```

### Advanced Features

```javascript
// Send rich templates
bot.sendGenericTemplate(senderId, [
  {
    title: 'Option 1',
    subtitle: 'Description',
    image_url: 'https://example.com/image.jpg',
    buttons: [
      {
        type: 'postback',
        title: 'Select',
        payload: 'OPTION_1'
      }
    ]
  }
]);

// Send quick replies
bot.sendQuickReplies(senderId, 'Choose an option:', [
  {
    content_type: 'text',
    title: 'Option 1',
    payload: 'OPTION_1'
  },
  {
    content_type: 'text',
    title: 'Option 2',
    payload: 'OPTION_2'
  }
]);

// Handle file uploads
bot.on('attachment', event => {
  const attachment = event.message.attachments[0];
  console.log('Received attachment:', attachment);
});
```

### Configuration

Create a `config/config.json` file:

```json
{
  "facebook": {
    "pageAccessToken": "your_page_access_token",
    "verifyToken": "your_verify_token",
    "appSecret": "your_app_secret"
  },
  "webhook": {
    "url": "https://your-domain.com/webhook",
    "port": 3000
  },
  "features": {
    "nlp": true,
    "analytics": true,
    "persistentMenu": true
  }
}
```

## Browser Enhancements

### Location

`tools/js_tools/browser_enhancements/`

### Description

User scripts and browser extensions for enhanced Facebook functionality.

### Facebook Ban/Unban Script

#### Features

- Add ban/unban buttons to Facebook group interfaces
- Bulk member management
- Enhanced admin controls
- Custom styling and animations

#### Installation

```javascript
// ==UserScript==
// @name         Facebook Ban/Unban Enhanced
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Enhanced Facebook group management
// @author       You
// @match        https://www.facebook.com/groups/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  // Add ban/unban buttons
  function addBanButtons() {
    const memberElements = document.querySelectorAll(
      '[data-testid="member-item"]'
    );

    memberElements.forEach(element => {
      if (!element.querySelector('.ban-button')) {
        const banButton = document.createElement('button');
        banButton.className = 'ban-button';
        banButton.textContent = 'Ban';
        banButton.onclick = () => banMember(element);
        element.appendChild(banButton);
      }
    });
  }

  // Ban member function
  function banMember(memberElement) {
    // Implementation for banning member
    console.log('Banning member:', memberElement);
  }

  // Initialize
  setInterval(addBanButtons, 2000);
})();
```

## Common Patterns

### Error Handling

```javascript
// Proper error handling
try {
  await bot.sendTextMessage(senderId, message);
} catch (error) {
  console.error('Error sending message:', error);
  // Handle error appropriately
}
```

### Logging

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### Environment Variables

```javascript
// Use environment variables for sensitive data
const config = {
  pageAccessToken: process.env.PAGE_ACCESS_TOKEN,
  verifyToken: process.env.VERIFY_TOKEN,
  appSecret: process.env.APP_SECRET
};
```

## Best Practices

1. **Security**: Never hardcode tokens or secrets
2. **Rate Limiting**: Respect Facebook's rate limits
3. **Error Handling**: Implement comprehensive error handling
4. **Logging**: Log important events and errors
5. **Validation**: Validate all incoming data
6. **Testing**: Write unit tests for critical functions

## Dependencies

Common Node.js packages used:

- `express` - Web framework
- `body-parser` - Request body parsing
- `axios` - HTTP requests
- `winston` - Logging
- `joi` - Data validation
- `dotenv` - Environment variables
- `helmet` - Security headers

Install with:

```bash
npm install express body-parser axios winston joi dotenv helmet
```

## Deployment

### Production Setup

```bash
# Install PM2 for process management
npm install -g pm2

# Create ecosystem file
echo "module.exports = {
  apps: [{
    name: 'facebook-messenger',
    script: 'app.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 4444
    }
  }]
}" > ecosystem.config.js

# Start with PM2
pm2 start ecosystem.config.js
```

### Docker Production

```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 4444

CMD ["node", "app.js"]
```
