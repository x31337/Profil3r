# Get All Pages

**Script:** `get-all-pages.php`

This tool retrieves a list of all Facebook Pages associated with a given user account or access
token.

## How to Use via Web UI

_(Note: The following is a general guideline, as this tool's UI integration status is not fully
detailed. Specific fields and steps might vary.)_

1.  **Navigate to the Tool:**
    - On the main page of the PHP Facebook Tools Web App, locate and select the "Get All Pages" tool
      (or a similar name).

2.  **Provide Account Identifier:**
    - The UI will likely require an **Access Token** for the Facebook account whose pages you want
      to list.
    - Alternatively, it might ask for other forms of authentication or user identification if the
      script supports them.

3.  **Submit:**
    - Click the "Get Pages", "Fetch Pages", or a similarly labeled button.

## Inputs Required

- **Access Token:** A valid Facebook access token with permissions to view the user's pages (e.g.,
  `pages_show_list` or similar).

## Expected Output

- **Success:** A list of Facebook Pages will be displayed. This list might include:
  - Page Name
  - Page ID
  - Potentially other details like page category or number of likes, depending on the script's
    implementation.
- **Failure:** An error message indicating why the pages could not be retrieved. This could be due
  to:
  - Invalid or expired access token.
  - Insufficient permissions for the token.
  - The account having no associated pages.
  - Facebook API issues.

## Notes

- **Token Permissions:** Ensure the access token has the necessary permissions to access the list of
  pages.
- **Pagination:** If an account manages a very large number of pages, the script or UI might
  implement pagination to display the results.
- The specific details returned for each page are dependent on the `get-all-pages.php` script and
  the Facebook API endpoints it uses.
