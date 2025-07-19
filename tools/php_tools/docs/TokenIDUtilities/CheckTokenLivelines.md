# Check Token Liveliness

**Script:** `check-token-live.php`

This tool verifies if a given Facebook access token is currently active and valid.

## How to Use via Web UI

_(Note: The following is a general guideline, as this tool's UI integration status is not fully
detailed. Specific fields and steps might vary.)_

1.  **Navigate to the Tool:**
    - On the main page of the PHP Facebook Tools Web App, find and select the "Check Token
      Liveliness" or "Validate Access Token" tool (or a similar name).

2.  **Enter Access Token:**
    - You will be presented with an input field labeled "Access Token".
    - Paste the Facebook access token you wish to check into this field.

3.  **Submit:**
    - Click the "Check Token", "Validate", or a similarly labeled button.

## Inputs Required

- **Access Token:** The Facebook access token to be validated.

## Expected Output

- **Valid Token:** If the token is live and valid, the UI will display a confirmation message. It
  might also show some basic information associated with the token, such as:
  - User ID it belongs to.
  - Application ID it's associated with.
  - Scopes/permissions granted.
  - Expiration time.
- **Invalid Token:** If the token is invalid, expired, or revoked, the UI will display an error
  message or a status indicating it's not active.

## Notes

- **Token Information:** The amount of detail shown for a valid token depends on the
  `check-token-live.php` script's implementation and what Facebook's Graph API Debugger (or similar
  mechanism) returns.
- This tool is useful for quickly verifying if a token can be used for other operations.
