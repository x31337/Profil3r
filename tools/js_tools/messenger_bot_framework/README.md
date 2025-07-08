# Facebook Messenger Bot Framework (fbbot)

This directory contains `fbbot`, a Node.js library likely designed for creating Facebook Messenger bots.

## Original Location

This tool was originally located in the `fbbot` directory at the root of the repository.

## Functionality

From a brief analysis, `fbbot` appears to provide a framework for:

- Handling incoming messages and events from the Facebook Messenger Platform.
- Processing different types of messages (text, postbacks, quick replies).
- A middleware-based architecture for incoming and outgoing message processing.
- Helper utilities for constructing various Messenger API message types (buttons, templates, quick replies).
- A `Traverse` utility, possibly for navigating complex message objects or defining conversation flows.

It seems to be built to work with HTTP servers (Express, Hapi, Node's native http) to receive webhook events from Facebook.

## How to Use

Refer to the original documentation or source code of `fbbot` (specifically `index.js` and the files in `incoming/`, `outgoing/`, and `templates/`) for details on how to integrate and use this framework for building a Messenger bot.

A typical use case would involve:

1.  Setting up an HTTP server.
2.  Initializing `Fbbot` with your Facebook Page Access Token and a Verify Token.
3.  Using `fbbot.requestHandler` as a middleware for your server to process incoming webhook requests from Facebook.
4.  Registering middleware functions with `fbbot.use()` to handle specific message types or events.
5.  Using `fbbot.send()` methods to send messages back to users.

## Dependencies

Key dependencies likely include:

- `agnostic` (for HTTP server compatibility)
- `bole` (for logging)
- `deeply` (for merging objects)
- `asynckit`

Refer to `package.json` within the `fbbot` directory for a full list.

## Note

This framework interacts with the Facebook Messenger Platform. Its functionality is dependent on Facebook's APIs and policies. Ensure compliance with Facebook's terms of service when developing bots.
