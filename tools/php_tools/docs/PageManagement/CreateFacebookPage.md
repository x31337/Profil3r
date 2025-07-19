# Create Facebook Page

**Script:** `create-fb-page.php`

This tool attempts to create a new Facebook Page under an account associated with the provided
access token.

## How to Use via Web UI

1.  **Navigate to the Tool:**
    - On the main page of the PHP Facebook Tools Web App, find and select the "Create Facebook Page"
      tool.

2.  **Enter Required Information:**
    - **Access Token:** Input a valid Facebook access token that has the necessary permissions to
      create pages. This token should belong to the account under which you want to create the page.
    - **Page Name:** Specify the desired name for the new Facebook Page.

3.  **Submit:**
    - Click the "Create Page", "Submit", or a similarly labeled button.

## Inputs Required

- **Access Token:** A valid Facebook access token with page creation permissions.
- **Desired Page Name:** The name for the new Facebook Page.

## Expected Output

- **Success:** If page creation is successful, the UI will likely display a confirmation message,
  possibly including the new Page ID or a link to the page.
- **Failure:** If page creation fails, an error message will be displayed. This could be due to
  various reasons:
  - Invalid or expired access token.
  - Insufficient permissions associated with the token.
  - The page name being invalid or already in use in a conflicting way.
  - Facebook API changes or rate limiting.
  - The underlying script `create-fb-page.php` encountering issues.

## Notes

- **API Stability:** This tool relies on Facebook API calls that can be unstable or change without
  notice. Its functionality may be affected by Facebook's platform updates.
- **Token Permissions:** A standard user access token might not be sufficient. You might need a
  token with specific `page_management` or similar permissions.
- **Security (from main README):** The original `create-fb-page.php` script (and its refactored
  version `PageCreator.php`) might use `CURLOPT_SSL_VERIFYPEER = FALSE` and
  `CURLOPT_SSL_VERIFYHOST = FALSE`. This is a security risk and should ideally be addressed by
  enabling SSL verification and ensuring proper certificate handling in a production environment.
- Refer to the main project documentation or Facebook's developer resources for the most up-to-date
  information on required token permissions and API usage for page creation.
