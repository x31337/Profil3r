# Faceports - Ruby Facebook Auto-Reporter (Originally from `faceports/` directory)

This Ruby script uses `mechanize` to automate logging into Facebook (free or mobile version) and
reporting a user account, specifically for being a fake account.

## Original Disclaimer from `faceports/README.md`

> Saya membuat software tersebut bukan untuk dipergunakan untuk hal-hal yang bersifat ilegal ataupun
> menentang pasal-pasal saya membuat tools ini untuk suatu project yang akan datang dan dapat
> digunakan untuk kepemerintahan.
>
> (Translation: I did not create this software to be used for illegal matters or against
> regulations. I made this tool for an upcoming project and it can be used for governmental
> purposes.)

## Functionality

- **Login:** Takes username and password to log into `free.facebook.com`.
- **Report User:** Navigates a series of forms to report a specified user ID as a fake account.

## Dependencies

- `rubygems`
- `mechanize`
- `colorize`
- `optparse`
- `highline`

## Original Usage (from `faceports/README.md`)

- Install dependencies:
  - `sudo apt install libssl-dev zlib1g-dev`
  - `sudo gem install nokogiri mechanize colorize highline`
- To run (assuming the script is named `run.rb` in its directory):
  - `ruby run.rb --help` (for options)
  - `ruby run.rb --login` (to login)
  - `ruby run.rb --person "target_profile_id"` (to report a target profile ID, likely after logging
    in separately or if a session is maintained by Mechanize)

## Note on Modernization Context

This script was evaluated as part of a larger project refactoring. Its core functionalities (login,
reporting) are aimed to be covered by the more robust, Selenium-based Python module
(`modules/facebook_automation.py`) within this repository. This Ruby script is preserved primarily
for reference. Direct execution of Mechanize-based scripts against modern Facebook can be unreliable
due to Facebook's increasing reliance on JavaScript.

**File System Anomaly during Refactoring:** During the refactoring process, persistent sandbox file
system errors prevented the creation of a dedicated `ruby_tools/facebook_reporter/faceports/`
directory structure and moving the original files there. As a workaround, this script
(`ruby_tool_faceports_reporter_run.rb`) and its README (`ruby_tool_faceports_reporter_README.md`)
have been recreated at the root of the repository. The original `faceports/` directory and its
contents may still exist if deletion attempts also fail.
