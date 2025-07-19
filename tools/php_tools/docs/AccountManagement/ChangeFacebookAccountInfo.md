# Change Facebook Account Information

**Script:** `change-fb-acc-info.php`

This tool is intended to modify information on a Facebook account. The specific information that can
be changed will depend on the script's capabilities (e.g., name, password, bio, etc.).

## How to Use via Web UI

_(Note: The following is a general guideline, as this tool's UI integration status is not fully
detailed. Specific fields and steps might vary.)_

1.  **Navigate to the Tool:**
    - On the main page of the PHP Facebook Tools Web App, locate and select the "Change Facebook
      Account Info" tool (or a similar name).

2.  **Authentication / Account Identification:**
    - You will likely need to provide an access token or session cookies for the Facebook account
      you wish to modify.
    - Alternatively, it might ask for a User ID and then separate credentials.

3.  **Specify Changes:**
    - The UI should present fields for the information you can change (e.g., "New Name", "New
      Password", "Update Bio").
    - Fill in only the fields corresponding to the information you want to update.

4.  **Submit:**
    - Click the "Update Info", "Save Changes", or a similarly labeled button.

## Inputs Required

- **Account Credentials/Token:** Valid access token or session cookies with permissions to modify
  account information.
- **Target Information:** The new values for the account details you wish to change.
- Potentially current password if changing password or sensitive info.

## Expected Output

- **Success:** A confirmation message indicating that the account information has been updated.
- **Failure:** An error message detailing why the update failed (e.g., incorrect password, invalid
  token, permission issues, Facebook security blocks).

## Notes

- **Security:** Modifying account information is a sensitive operation. Ensure you are using a
  secure connection and trust the application environment.
- **Permissions:** The provided token/credentials must have the necessary permissions.
- **Facebook Policies:** Automated changes to account information might be against Facebook's terms
  of service depending on the method and frequency. Use responsibly.
- The exact fields that can be modified are dependent on the `change-fb-acc-info.php` script's
  implementation.
