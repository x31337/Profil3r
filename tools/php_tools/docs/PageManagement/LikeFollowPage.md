# Like/Follow Facebook Page

**Script:** `like-follow-page.php`

This tool allows a Facebook account (identified by an access token) to like or follow a specified
Facebook Page.

## How to Use via Web UI

_(Note: The following is a general guideline, as this tool's UI integration status is not fully
detailed. Specific fields and steps might vary.)_

1.  **Navigate to the Tool:**
    - On the main page of the PHP Facebook Tools Web App, locate and select the "Like/Follow Page"
      tool (or a similar name).

2.  **Provide Necessary Information:**
    - **Access Token:** Input a valid Facebook access token for the account that will perform the
      like/follow action.
    - **Page ID or URL:** Enter the Facebook Page ID or the full URL of the page you want to
      like/follow.
    - **Action Type (if applicable):** The UI might have a selector for "Like" or "Follow" if the
      script distinguishes between them or if Facebook's API requires specifying the action. Often,
      "liking" a page automatically "follows" it.

3.  **Submit:**
    - Click the "Like Page", "Follow Page", "Submit", or a similarly labeled button.

## Inputs Required

- **Access Token:** A valid Facebook access token for the acting user.
- **Target Page ID or URL:** The unique identifier or web address of the Facebook Page.
- **Action Type (Possibly):** Specification of whether to "Like" or "Follow".

## Expected Output

- **Success:** A confirmation message stating that the page has been successfully liked/followed.
- **Failure:** An error message indicating why the action failed. Reasons could include:
  - Invalid or expired access token.
  - Invalid Page ID or URL.
  - The account has already liked/followed the page.
  - The page's settings prevent liking/following by the account or in general.
  - Facebook API restrictions or rate limiting.

## Notes

- **Permissions:** The access token needs appropriate permissions to perform social actions like
  liking or following pages.
- **Facebook's Policies:** Automating likes/follows, especially in large volumes, can be against
  Facebook's terms of service and may lead to account restrictions. Use responsibly.
- The exact behavior (e.g., if "like" also means "follow") depends on the `like-follow-page.php`
  script and Facebook's API implementation at the time.
