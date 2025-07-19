# Check Facebook Account Status

**Script:** `check-fb-acc.php`

This tool allows you to check the status of a Facebook account (e.g., if it's active or potentially
disabled/deleted) by providing its User ID.

## How to Use via Web UI

1.  **Navigate to the Tool:**
    - On the main page of the PHP Facebook Tools Web App, locate and click on the "Check Facebook
      Account Status" tool.

2.  **Enter User ID:**
    - You will be presented with an input field labeled something like "Facebook User ID" or "Enter
      User ID".
    - Type or paste the numerical Facebook User ID of the account you wish to check.

3.  **Submit:**
    - Click the "Check Status", "Submit", or a similarly labeled button.

## Inputs Required

- **Facebook User ID:** The unique numerical identifier for the Facebook account.

## Expected Output

- The UI will display the status of the account. This might include:
  - Confirmation that the account is live/active.
  - Indication if the account cannot be found or is otherwise inaccessible.
  - The raw output or a summarized status from the underlying `check-fb-acc.php` script.

## Notes

- The accuracy and detail of the status depend on the method used by the `check-fb-acc.php` script
  and Facebook's current platform behavior.
- Ensure the User ID is correct and for the intended Facebook profile.
