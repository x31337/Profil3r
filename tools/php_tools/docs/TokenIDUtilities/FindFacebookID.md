# Find Facebook ID

**Script:** `get-find-fb-id.php`

This tool helps discover the numerical Facebook User ID from a Facebook profile URL or username.

## How to Use via Web UI

_(Note: The following is a general guideline, as this tool's UI integration status is not fully detailed. Specific fields and steps might vary.)_

1.  **Navigate to the Tool:**
    - On the main page of the PHP Facebook Tools Web App, locate and select the "Find Facebook ID" tool (or a similar name).

2.  **Enter Profile Identifier:**
    - The UI will have an input field for a "Facebook Profile URL" or "Username".
    - Enter the full URL of the Facebook profile (e.g., `https://www.facebook.com/username`) or just the username.

3.  **Submit:**
    - Click the "Find ID", "Get ID", or a similarly labeled button.

## Inputs Required

- **Facebook Profile URL or Username:** The web address of the Facebook profile or its unique username.

## Expected Output

- **Success:** If the User ID can be found, the UI will display the numerical ID.
- **Failure:** An error message indicating that the User ID could not be found. This might happen if:
  - The profile URL or username is invalid or does not exist.
  - The profile is private and its ID cannot be easily discovered.
  - Facebook's structure has changed, and the script can no longer find the ID using its current method.

## Notes

- **Vanity URLs:** Facebook allows users to have vanity URLs (e.g., `/username`) in addition to their numerical ID-based URLs. This tool is useful for resolving vanity URLs back to the underlying User ID.
- **Graph API:** Some methods of finding User IDs might involve querying Facebook's Graph API or parsing page source, which can be subject to changes and rate limits.
- The reliability of the `get-find-fb-id.php` script depends on the stability of Facebook's profile page structure or API access for this information.
