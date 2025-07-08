# Browser Enhancements - User Scripts

This directory is intended to hold user scripts that enhance browser functionality, particularly for interacting with Facebook.

## fb-ban-dsd.user.js

- **Original Location:** Root directory of the repository.
- **Type:** User Script (for Tampermonkey/Greasemonkey).
- **Purpose:** This script appears to add UI elements directly onto the Facebook interface to facilitate banning/unbanning users within groups and removing members from comments. It likely interacts with Facebook's internal AJAX calls or modifies the DOM to add its own buttons and functionality.

### Functionality (inferred):

    *   Adds "Remove Member" buttons to comments in groups.
    *   Provides an interface (possibly a fixed overlay) to:
        *   Unban users by profile URL, username, or ID by interacting with group admin AJAX endpoints.
        *   Ban users similarly.
    *   Uses jQuery and Mousetrap.js for keyboard shortcuts.

### Installation & Usage:

1.  Install a user script manager extension in your browser (e.g., Tampermonkey for Chrome/Firefox, Greasemonkey for older Firefox).
2.  Open `fb-ban-dsd.user.js` in your browser, or copy its content into a new script in your user script manager.
3.  The script manager should prompt you to install it.
4.  Once installed, it should automatically run on Facebook pages, adding its custom UI elements.

### Note:

User scripts that directly modify a website's DOM or use its internal AJAX endpoints are highly susceptible to breaking when the website updates its structure or code. This script's continued functionality would depend on Facebook's interface remaining compatible with its selectors and methods.

**File System Anomaly:** During the refactoring process, repeated attempts to move, rename, or even read the `fb-ban-dsd.user.js` file failed due to the sandbox environment inconsistently reporting the file as non-existent, despite `ls` output showing it. This README is created in the target directory assuming the file would be moved here if operations were successful. The original file's status at the root is uncertain due to these issues.
