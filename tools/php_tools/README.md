# PHP Facebook Tools Web App

This project converts a collection of PHP scripts located in `tools/php_tools/facebook_scripts/` into a web application with a modern UI, running inside a Docker container. This web app is a component of the larger "Comprehensive Facebook & OSINT Automation Toolkit".

<details>
<summary>Features</summary>

- Web interface for interacting with various Facebook-related PHP scripts.
- Dockerized for easy setup and deployment (via the main project's Docker Compose setup or standalone).
- Built with Slim PHP framework.
- Styled with Bootstrap for a responsive UI.
- Dynamically discovers PHP scripts from the `tools/php_tools/facebook_scripts/` directory and lists them.
    - Integrated tools are documented in detail in the [Available Tools](#available-tools) section.
    - Other detected scripts are listed as "Coming Soon" in the UI.
</details>

<details>
<summary>Prerequisites</summary>

- Docker installed and running on your system.
</details>

<details>
<summary>Structure (within `tools/php_tools/` and project root)</summary>

- `tools/php_tools/Dockerfile`: Defines the Docker image for this specific PHP application.
- `tools/php_tools/facebook_scripts/`: The original PHP scripts that are being wrapped by this web app.
- `tools/php_tools/docs/`: Contains detailed documentation for each tool, organized by category.
- `src/`: (Project root) Contains the refactored PHP tool logic (e.g., `AccountChecker.php`, `PageCreator.php`).
- `public/`: (Project root) Web server document root for this app, contains `index.php` (Slim front controller).
- `templates/`: (Project root) HTML templates for the UI.
- `composer.json`: (Project root) PHP dependencies for this app.
</details>

<details>
<summary>Getting Started (Standalone)</summary>

While this service is typically managed by the main project's `docker-compose.yml`, you can also build and run it standalone for development or testing.

### 1. Build the Docker Image

Navigate to the `tools/php_tools/` directory (where this `Dockerfile` is located) in your terminal:

```bash
# Assuming you are in the project root:
cd tools/php_tools
```

Then, build the Docker image. You can tag it with a name, for example, `php-fb-tools-app`:

```bash
docker build -t php-fb-tools-app .
```
*(Note: The `.` indicates that the build context is the current directory `tools/php_tools/`)*

### 2. Run the Docker Container (Standalone)

Once the image is built, you can run it as a container:

```bash
docker run -d -p 8080:8080 --name php-fb-tools-container php-fb-tools-app
```

Explanation of flags:
- `-d`: Run the container in detached mode (in the background).
- `-p 8080:8080`: Map port 8080 on your host machine to port 8080 in the container (where the app is running). This matches the port specified in the main project's README.
- `--name php-fb-tools-container`: Assign a name to the running container for easier management.
- `php-fb-tools-app`: The name of the image you built.

### 3. Access the Application

Open your web browser and navigate to:

[http://localhost:8080](http://localhost:8080)

You should see the homepage listing the available tools. The `/health` endpoint is also available at [http://localhost:8080/health](http://localhost:8080/health).
</details>

## Available Tools

The application provides a web UI for various PHP scripts. Each tool is detailed below in its own collapsible section, including a summary from its original PHP script, how to use it via the web UI, and links to more detailed documentation.

### Account Management
Tools related to managing Facebook user accounts.

<details>
<summary><strong>Change Facebook Account Information</strong> (Script: <code>change-fb-acc-info.php</code>)</summary>

**Original Script Description:**

This PHP script is designed to change Facebook account information using the Facebook Graph API. Here's a breakdown of what it does:

### Key Features:
1. **Account Information Modification**:
   - Changes work history (randomly selects from a predefined list of company IDs)
   - Updates education information (randomly selects from a predefined list of school IDs)
   - Modifies current location and hometown (randomly selects from predefined location IDs)

2. **Profile Photo Management**:
   - Updates profile picture (`avatar`)
   - Updates cover photo (`cover`)

3. **Technical Implementation**:
   - Uses cURL for API requests
   - Requires PHP 7.4 or higher
   - Includes error handling and debug mode

### Security Concerns:
1. **Access Token Exposure**:
   - The script requires a Facebook access token which is hardcoded as `$token = "here is your fb access token";`
   - Storing access tokens in plain text is a security risk

2. **Privacy Settings**:
   - All changes are set to `"EVERYONE"` visibility, making information public

3. **Randomized Data**:
   - The script uses randomly selected IDs from predefined lists for work, education, and location

### Usage Notes:
- The script appears to be part of a larger toolset (`facebook_scripts`)
- It's designed to automate profile changes rather than make specific edits
- The predefined lists contain hundreds of company/school/location IDs

### Recommendations:
1. **Security Improvements**:
   - Remove hardcoded access token
   - Implement proper token storage/retrieval
   - Add rate limiting to avoid API abuse flags

2. **Functionality Improvements**:
   - Allow custom inputs rather than random selection
   - Make privacy settings configurable
   - Add validation for photo URLs

3. **Legal Considerations**:
   - Automated profile modification may violate Facebook's Terms of Service
   - Bulk changes could trigger account security checks

### How to Use via Web UI

*(Note: The following is a general guideline, as this tool's UI integration status is not fully detailed. Specific fields and steps might vary.)*

1.  **Navigate to the Tool:**
    *   On the main page of the PHP Facebook Tools Web App, locate and select the "Change Facebook Account Info" tool (or a similar name).

2.  **Authentication / Account Identification:**
    *   You will likely need to provide an access token or session cookies for the Facebook account you wish to modify.
    *   Alternatively, it might ask for a User ID and then separate credentials.

3.  **Specify Changes:**
    *   The UI should present fields for the information you can change (e.g., "New Name", "New Password", "Update Bio").
    *   Fill in only the fields corresponding to the information you want to update.

4.  **Submit:**
    *   Click the "Update Info", "Save Changes", or a similarly labeled button.

### Inputs Required

*   **Account Credentials/Token:** Valid access token or session cookies with permissions to modify account information.
*   **Target Information:** The new values for the account details you wish to change.
*   Potentially current password if changing password or sensitive info.

### Expected Output

*   **Success:** A confirmation message indicating that the account information has been updated.
*   **Failure:** An error message detailing why the update failed (e.g., incorrect password, invalid token, permission issues, Facebook security blocks).

### Notes & Considerations

*   **Security:** Modifying account information is a sensitive operation. Ensure you are using a secure connection and trust the application environment.
*   **Permissions:** The provided token/credentials must have the necessary permissions.
*   **Facebook Policies:** Automated changes to account information might be against Facebook's terms of service depending on the method and frequency. Use responsibly.
*   The exact fields that can be modified are dependent on the `change-fb-acc-info.php` script's implementation.

For more details, see the full documentation page: [Change Facebook Account Information](./docs/AccountManagement/ChangeFacebookAccountInfo.md)
</details>

<details>
<summary><strong>Check Facebook Account Status</strong> (Script: <code>check-fb-acc.php</code>)</summary>

**Original Script Description:**

This PHP script checks whether a Facebook account is active ("live") or disabled ("died") by querying the Facebook Graph API for the account's profile picture. Here's a breakdown of how it works:

1. **Setup**:
   - The script defines a Facebook user ID (`$uid`) that needs to be checked
   - Constructs a URL to query the Graph API for that user's profile picture

2. **API Request**:
   - Uses cURL to make a request to `https://graph2.facebook.com/v3.3/{user_id}/picture?redirect=0`
   - The `redirect=0` parameter tells the API to return JSON data rather than redirect to the image

3. **Response Handling**:
   - Checks if the HTTP response code is 200 (success)
   - If successful, decodes the JSON response
   - The script then checks two conditions to determine if the account is active:
     a) If the response contains valid `data` and `url` fields
     b) If the URL is not pointing to Facebook's default placeholder image

4. **Output**:
   - If both conditions are met: "ID is: {uid} live."
   - If not: "ID is: {uid} died."
   - If the HTTP request fails: "Error {uid}."

**Important Notes**:
1. This script uses an older version of the Graph API (v3.3) which may be deprecated
2. The default placeholder image URL might change over time
3. Facebook's API policies may require authentication tokens for such requests
4. The script would be more useful if it accepted the UID as a parameter rather than having it hardcoded

To improve this script, you might want to:
1. Add error handling for the JSON decoding
2. Make the UID a command-line or GET parameter
3. Update to a current API version
4. Add rate limiting to avoid being blocked by Facebook
5. Consider adding proper authentication if needed

### How to Use via Web UI

1.  **Navigate to the Tool:**
    *   On the main page of the PHP Facebook Tools Web App, locate and click on the "Check Facebook Account Status" tool.

2.  **Enter User ID:**
    *   You will be presented with an input field labeled something like "Facebook User ID" or "Enter User ID".
    *   Type or paste the numerical Facebook User ID of the account you wish to check.

3.  **Submit:**
    *   Click the "Check Status", "Submit", or a similarly labeled button.

### Inputs Required

*   **Facebook User ID:** The unique numerical identifier for the Facebook account.

### Expected Output

*   The UI will display the status of the account. This might include:
    *   Confirmation that the account is live/active.
    *   Indication if the account cannot be found or is otherwise inaccessible.
    *   The raw output or a summarized status from the underlying `check-fb-acc.php` script.

### Notes & Considerations

*   The accuracy and detail of the status depend on the method used by the `check-fb-acc.php` script and Facebook's current platform behavior.
*   Ensure the User ID is correct and for the intended Facebook profile.

For more details, see the full documentation page: [Check Facebook Account Status](./docs/AccountManagement/CheckFacebookAccountStatus.md)
</details>

<details>
<summary><strong>Register Facebook Account</strong> (Script: <code>reg-fb-acc.php</code>)</summary>

**Original Script Description:**

# Refactored Facebook Account Registration Script

I'll refactor this to work with a local Docker-based API service instead of the external `api.tuberboy.com`. This approach gives you more control and security over the registration process.

## Dockerized API Solution

### 1. First, create a `docker-compose.yml` file:

```yaml
version: '3.8'

services:
  fb-reg-api:
    image: node:16
    container_name: fb-reg-api
    ports:
      - "3000:3000"
    volumes:
      - ./api:/app
    working_dir: /app
    command: sh -c "npm install && node server.js"
    environment:
      - NODE_ENV=development
```

### 2. Create an API server (`api/server.js`):

```javascript
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Mock database
const accounts = [];

app.post('/fb/reg', (req, res) => {
    const { name, email, password, gender, proxy } = req.body;

    // Basic validation
    if (!name || !email || !password || !gender) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create account object
    const newAccount = {
        id: accounts.length + 1,
        name,
        email,
        password, // Note: In production, you would hash this
        gender: gender === 1 ? 'female' : 'male',
        proxy,
        created_at: new Date().toISOString(),
        status: 'pending_verification'
    };

    accounts.push(newAccount);

    res.json({
        success: true,
        account_id: newAccount.id,
        message: 'Account created successfully. Verification required.'
    });
});

app.get('/fb/accounts', (req, res) => {
    res.json(accounts);
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`FB Registration API running on port ${PORT}`);
});
```

### 3. Create a `package.json` for the API:

```json
{
  "name": "fb-reg-api",
  "version": "1.0.0",
  "description": "Local Facebook Registration API",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.17.1",
    "body-parser": "^1.19.0"
  }
}
```

### 4. Refactored PHP Client (`reg-fb-acc.php`):

```php
<?php
set_time_limit(0);

class FacebookAccountRegistrar {
    private $apiUrl;
    private $useProxy;
    private $proxy;

    public function __construct($useProxy = false, $proxy = '') {
        $this->apiUrl = 'http://fb-reg-api:3000/fb/reg'; // Using Docker service name
        $this->useProxy = $useProxy;
        $this->proxy = $proxy;
    }

    public function generateRandomName() {
        $firstNames = ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Emma', 'Olivia', 'Ava', 'Sophia'];
        $lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Rodriguez'];
        return $firstNames[array_rand($firstNames)] . ' ' . $lastNames[array_rand($lastNames)];
    }

    public function generateRandomEmail($name) {
        $domains = ['outlook.com', 'gmail.com', 'yahoo.com', 'protonmail.com'];
        $cleanName = strtolower(str_replace(' ', '', $name));
        return $cleanName . rand(100, 999) . '@' . $domains[array_rand($domains)];
    }

    public function generateRandomPassword() {
        $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
        return substr(str_shuffle($chars), 0, 12);
    }

    public function registerAccount() {
        $name = $this->generateRandomName();
        $data = [
            'name' => $name,
            'email' => $this->generateRandomEmail($name),
            'password' => $this->generateRandomPassword(),
            'gender' => rand(1, 2), // 1 for female, 2 for male
        ];

        if ($this->useProxy) {
            $data['proxy'] = $this->proxy;
        }

        $ch = curl_init($this->apiUrl);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/x-www-form-urlencoded'
        ]);

        if ($this->useProxy && !empty($this->proxy)) {
            curl_setopt($ch, CURLOPT_PROXY, $this->proxy);
        }

        $response = curl_exec($ch);

        if (curl_errno($ch)) {
            return ['error' => 'cURL error: ' . curl_error($ch)];
        }

        curl_close($ch);
        return json_decode($response, true);
    }
}

// Usage example
$useProxy = false; // Set to true if you need proxy
$proxy = 'http://username:password@host:port'; // Your proxy details if needed

$registrar = new FacebookAccountRegistrar($useProxy, $proxy);
$result = $registrar->registerAccount();

echo "<pre>";
print_r($result);
echo "</pre>";
?>
```

## How to Use This Solution

1. **Set up the Docker environment**:
   - Create the files as shown above
   - Run `docker-compose up` in your project directory
   - The API will be available at `http://localhost:3000`

2. **Run the PHP script**:
   - Place the PHP script where it can be executed
   - Access it through a web browser or command line

3. **API Endpoints**:
   - POST `/fb/reg` - Register new account
   - GET `/fb/accounts` - List all registered accounts (for debugging)

## Key Improvements

1. **Local Control**: All processing happens within your Docker environment
2. **Better Structure**: OOP approach with proper separation of concerns
3. **Security**: Removes dependency on external, potentially untrustworthy API
4. **Extensibility**: Easy to add more features like verification, rate limiting, etc.
5. **Transparency**: You control all aspects of the registration process

## Important Notes

- This is still a mock implementation - you'll need to add actual Facebook integration if needed
- Consider adding proper validation, error handling, and logging
- For production use, implement proper security measures (HTTPS, authentication, etc.)

### How to Use via Web UI

*(Note: The following is a general guideline, as this tool's UI integration status is not fully detailed. Specific fields and steps might vary. Automating account registration is complex and often subject to CAPTCHAs and other anti-bot measures by Facebook.)*

1.  **Navigate to the Tool:**
    *   On the main page of the PHP Facebook Tools Web App, find and select the "Register Facebook Account" tool (or a similar name).

2.  **Enter Registration Details:**
    *   The UI will likely present a form with fields for necessary registration information, such as:
        *   First Name
        *   Last Name
        *   Email Address or Phone Number (for verification)
        *   Password
        *   Date of Birth
        *   Gender
    *   Fill in all required details for the new account.

3.  **Handle Verification (Potentially):**
    *   The script might require a step to handle email or phone verification. The UI may prompt for a verification code sent to the provided email/phone.
    *   It might also involve CAPTCHA solving, which could be manual or require a third-party service integration.

4.  **Submit:**
    *   Click the "Register", "Create Account", or a similarly labeled button.

### Inputs Required

*   **Registration Information:** All details required by Facebook for account creation (name, email/phone, password, DOB, gender).
*   **Verification Codes (if applicable):** Codes sent to email or phone.
*   **CAPTCHA solutions (if applicable).**

### Expected Output

*   **Success:** A confirmation message indicating that the account has been successfully registered. It might provide some details of the new account.
*   **Failure:** An error message detailing why the registration failed. Common reasons include:
    *   Information already in use (email, phone).
    *   Weak password.
    *   Facebook's anti-fraud systems blocking the registration.
    *   CAPTCHA failure.
    *   Incomplete or invalid information.
    *   Changes in Facebook's registration process not reflected in the script.

### Notes & Considerations

*   **Facebook's Terms of Service:** Automating account creation is often against Facebook's Terms of Service. Accounts created this way may be quickly flagged or disabled. Use with extreme caution and responsibility.
*   **Reliability:** This is a very sensitive script. Facebook actively works to prevent automated registrations, so the script's success rate can be very low and it may require frequent updates.
*   **Data Privacy:** Be mindful of the personal information used for registration.
*   The `reg-fb-acc.php` script's capabilities and requirements will dictate the exact UI flow.

For more details, see the full documentation page: [Register Facebook Account](./docs/AccountManagement/RegisterFacebookAccount.md)
</details>

### Page Management
Tools related to managing Facebook pages.

<details>
<summary><strong>Create Facebook Page</strong> (Script: <code>create-fb-page.php</code>)</summary>

**Original Script Description:**

This PHP script appears to be designed to create a Facebook Page programmatically using Facebook's Graph API. Here's an analysis of what it does:

### Key Components:
1. **Access Token Requirement**:
   - Requires a Facebook access token (`$token`) from a main profile
   - Requires a full name for the new page (`$full_name`)

2. **API Request**:
   - Makes a POST request to Facebook's GraphQL endpoint (`graph.facebook.com/graphql`)
   - Uses a specific GraphQL mutation for page creation
   - Includes extensive headers to mimic a mobile app request

3. **Parameters**:
   - Sets the page category to ID "2214" (which is typically "Local Business")
   - Specifies creation source as "android" to mimic mobile creation
   - Includes various Facebook-specific parameters and tracking IDs

4. **Response Handling**:
   - Checks for success or rate-limiting error ("You have created too many Pages...")
   - Outputs success/failure message

### Potential Issues:
1. **Security Risks**:
   - SSL verification is disabled (`VERIFYPEER` and `VERIFYHOST` set to FALSE)
   - The access token would need proper permissions

2. **Rate Limiting**:
   - Facebook has strict limits on page creation frequency
   - The script checks for this but doesn't handle retries

3. **Hardcoded Values**:
   - Many parameters are hardcoded to specific values that might change

4. **Facebook Policy**:
   - Automated page creation may violate Facebook's Terms of Service

### Suggested Improvements:
1. Add error handling for other types of failures
2. Implement rate limiting and retries
3. Make category ID configurable
4. Remove SSL verification disablement for production use
5. Add proper authentication flow rather than hardcoding tokens

### How to Use via Web UI

1.  **Navigate to the Tool:**
    *   On the main page of the PHP Facebook Tools Web App, find and select the "Create Facebook Page" tool.

2.  **Enter Required Information:**
    *   **Access Token:** Input a valid Facebook access token that has the necessary permissions to create pages. This token should belong to the account under which you want to create the page.
    *   **Page Name:** Specify the desired name for the new Facebook Page.

3.  **Submit:**
    *   Click the "Create Page", "Submit", or a similarly labeled button.

### Inputs Required

*   **Access Token:** A valid Facebook access token with page creation permissions.
*   **Desired Page Name:** The name for the new Facebook Page.

### Expected Output

*   **Success:** If page creation is successful, the UI will likely display a confirmation message, possibly including the new Page ID or a link to the page.
*   **Failure:** If page creation fails, an error message will be displayed. This could be due to various reasons:
    *   Invalid or expired access token.
    *   Insufficient permissions associated with the token.
    *   The page name being invalid or already in use in a conflicting way.
    *   Facebook API changes or rate limiting.
    *   The underlying script `create-fb-page.php` encountering issues.

### Notes & Considerations

*   **API Stability:** This tool relies on Facebook API calls that can be unstable or change without notice. Its functionality may be affected by Facebook's platform updates.
*   **Token Permissions:** A standard user access token might not be sufficient. You might need a token with specific `page_management` or similar permissions.
*   **Security (from main README):** The original `create-fb-page.php` script (and its refactored version `PageCreator.php`) might use `CURLOPT_SSL_VERIFYPEER = FALSE` and `CURLOPT_SSL_VERIFYHOST = FALSE`. This is a security risk and should ideally be addressed by enabling SSL verification and ensuring proper certificate handling in a production environment.
*   Refer to the main project documentation or Facebook's developer resources for the most up-to-date information on required token permissions and API usage for page creation.

For more details, see the full documentation page: [Create Facebook Page](./docs/PageManagement/CreateFacebookPage.md)
</details>

<details>
<summary><strong>Get All Pages</strong> (Script: <code>get-all-pages.php</code>)</summary>

**Original Script Description:**

This PHP script appears to be designed to fetch Facebook pages associated with a user account using the Facebook Graph API. Here's a breakdown of what it does:

1. It sets up a GraphQL request to Facebook's API endpoint (`graph.facebook.com/graphql`)
2. The request includes various parameters and headers that mimic a request from the Facebook mobile app
3. It requires a valid access token (currently empty in the script)
4. The script makes a POST request with specific GraphQL query parameters
5. It processes the response to extract page information including:
   - Access tokens for each page
   - Page IDs
   - Page names
   - Profile picture URIs

Important notes about this script:

1. **Security Concern**: The script is currently missing the required access token (`$token = ""`). To work, you would need a valid Facebook access token with the appropriate permissions.
2. **Facebook API Usage**: This appears to be using Facebook's internal/non-public API endpoints (notice the GraphQL query with specific client doc ID and other internal parameters).
3. **Potential Issues**:
   - Facebook frequently changes its internal APIs
   - Using internal APIs may violate Facebook's Terms of Service
   - The script doesn't include proper error handling for API rate limits or invalid tokens
4. Without elimininate anything, Add a new function to work using Facebook's official Graph API with proper authentication and permissions.

### How to Use via Web UI

*(Note: The following is a general guideline, as this tool's UI integration status is not fully detailed. Specific fields and steps might vary.)*

1.  **Navigate to the Tool:**
    *   On the main page of the PHP Facebook Tools Web App, locate and select the "Get All Pages" tool (or a similar name).

2.  **Provide Account Identifier:**
    *   The UI will likely require an **Access Token** for the Facebook account whose pages you want to list.
    *   Alternatively, it might ask for other forms of authentication or user identification if the script supports them.

3.  **Submit:**
    *   Click the "Get Pages", "Fetch Pages", or a similarly labeled button.

### Inputs Required

*   **Access Token:** A valid Facebook access token with permissions to view the user's pages (e.g., `pages_show_list` or similar).

### Expected Output

*   **Success:** A list of Facebook Pages will be displayed. This list might include:
    *   Page Name
    *   Page ID
    *   Potentially other details like page category or number of likes, depending on the script's implementation.
*   **Failure:** An error message indicating why the pages could not be retrieved. This could be due to:
    *   Invalid or expired access token.
    *   Insufficient permissions for the token.
    *   The account having no associated pages.
    *   Facebook API issues.

### Notes & Considerations

*   **Token Permissions:** Ensure the access token has the necessary permissions to access the list of pages.
*   **Pagination:** If an account manages a very large number of pages, the script or UI might implement pagination to display the results.
*   The specific details returned for each page are dependent on the `get-all-pages.php` script and the Facebook API endpoints it uses.

For more details, see the full documentation page: [Get All Pages](./docs/PageManagement/GetAllPages.md)
</details>

<details>
<summary><strong>Like/Follow Facebook Page</strong> (Script: <code>like-follow-page.php</code>)</summary>

**Original Script Description:**

This PHP script is designed to like and follow a Facebook page using Facebook's Graph API. Here's a breakdown of what it does:

### Key Components:
1. **Variables Setup**:
   - `$pageid`: The ID of the Facebook page you want to like/follow.
   - `$actorid`: The ID of the Facebook profile that will perform the like/follow action.
   - `$token`: The Facebook access token with permissions to like/follow pages.

2. **POST Request Setup**:
   - The script constructs a GraphQL mutation request (`PageLike`) to like/follow the page.
   - The request includes various Facebook-specific headers and parameters to mimic a legitimate API call.

3. **cURL Configuration**:
   - The script uses cURL to send the request to Facebook's GraphQL endpoint (`https://graph.facebook.com/graphql`).
   - It includes headers that simulate a request from the Facebook mobile app (e.g., `user-agent` mimics the Facebook Android app).
   - The `authorization` header includes the access token for authentication.

4. **Response Handling**:
   - After sending the request, the script checks the response to see if the like/follow was successful.
   - If `does_viewer_like` is `true` in the response, it confirms success. Otherwise, it reports failure.

### Security and Ethical Considerations:
- **Access Token Security**: The script requires a valid Facebook access token, which should be kept private. Hardcoding tokens in scripts is unsafe (they could be exposed in logs or version control).
- **Rate Limits**: Facebook imposes rate limits on API calls. Excessive automated likes/follows could trigger restrictions.
- **Terms of Service**: Automated liking/following may violate Facebook's policies unless explicitly allowed (e.g., for testing with explicit permission).

### Improvements:
1. **Environment Variables**: Store sensitive data (like `$token`) in environment variables instead of hardcoding.
2. **Error Handling**: Add more detailed error handling (e.g., invalid token, rate limits).
3. **Logging**: Log responses for debugging without exposing sensitive data.
4. **Validation**: Validate `$pageid` and `$actorid` before making the request.

### How to Use via Web UI

*(Note: The following is a general guideline, as this tool's UI integration status is not fully detailed. Specific fields and steps might vary.)*

1.  **Navigate to the Tool:**
    *   On the main page of the PHP Facebook Tools Web App, locate and select the "Like/Follow Page" tool (or a similar name).

2.  **Provide Necessary Information:**
    *   **Access Token:** Input a valid Facebook access token for the account that will perform the like/follow action.
    *   **Page ID or URL:** Enter the Facebook Page ID or the full URL of the page you want to like/follow.
    *   **Action Type (if applicable):** The UI might have a selector for "Like" or "Follow" if the script distinguishes between them or if Facebook's API requires specifying the action. Often, "liking" a page automatically "follows" it.

3.  **Submit:**
    *   Click the "Like Page", "Follow Page", "Submit", or a similarly labeled button.

### Inputs Required

*   **Access Token:** A valid Facebook access token for the acting user.
*   **Target Page ID or URL:** The unique identifier or web address of the Facebook Page.
*   **Action Type (Possibly):** Specification of whether to "Like" or "Follow".

### Expected Output

*   **Success:** A confirmation message stating that the page has been successfully liked/followed.
*   **Failure:** An error message indicating why the action failed. Reasons could include:
    *   Invalid or expired access token.
    *   Invalid Page ID or URL.
    *   The account has already liked/followed the page.
    *   The page's settings prevent liking/following by the account or in general.
    *   Facebook API restrictions or rate limiting.

### Notes & Considerations

*   **Permissions:** The access token needs appropriate permissions to perform social actions like liking or following pages.
*   **Facebook's Policies:** Automating likes/follows, especially in large volumes, can be against Facebook's terms of service and may lead to account restrictions. Use responsibly.
*   The exact behavior (e.g., if "like" also means "follow") depends on the `like-follow-page.php` script and Facebook's API implementation at the time.

For more details, see the full documentation page: [Like/Follow Facebook Page](./docs/PageManagement/LikeFollowPage.md)
</details>

### Token & ID Utilities
Tools for working with access tokens and Facebook IDs.

<details>
<summary><strong>Check Token Liveliness</strong> (Script: <code>check-token-live.php</code>)</summary>

**Original Script Description:**

This PHP script checks whether Facebook access tokens stored in a file are still valid or need to be removed. Here's a breakdown of what it does:

1. **Initial Setup**:
   - Sets no time limit (`set_time_limit(0)`)
   - Turns off error reporting (`error_reporting(0)`)

2. **Token Processing**:
   - Reads tokens from `access_token.txt` (expected format: token|value1|value2 per line)
   - For each token:
     - Splits the line by pipe character (`|`)
     - Calls the `check()` function with the token
     - Checks if the response indicates the token is blocked/invalid
     - If invalid, removes the entire line from the file

3. **check() Function**:
   - Makes a cURL request to Facebook's Graph API (`/me` endpoint)
   - Configures cURL with various options (SSL verification off, follow redirects, etc.)
   - Returns the API response

4. **remove() Function**:
   - Finds and removes lines containing a specific pattern (the invalid token line)
   - Handles file permissions (setting to 0777 before and after modification)

**Key Observations**:
- The script specifically looks for tokens that return an OAuthException with the message "The user is enrolled in a blocking, logged-in checkpoint"
- Only completely removes tokens that meet this specific error condition
- Doesn't handle other potential error cases or successful responses
- Has very permissive file permissions (0777) which could be a security concern
- Lacks proper error handling for file operations

**Potential Improvements**:
1. Add more comprehensive error checking for the file operations
2. Consider more granular file permissions
3. Handle other types of token failures beyond just this specific error
4. Add logging for tracking which tokens were removed
5. Consider rate limiting the API checks to avoid hitting Facebook's limits

### How to Use via Web UI

*(Note: The following is a general guideline, as this tool's UI integration status is not fully detailed. Specific fields and steps might vary.)*

1.  **Navigate to the Tool:**
    *   On the main page of the PHP Facebook Tools Web App, find and select the "Check Token Liveliness" or "Validate Access Token" tool (or a similar name).

2.  **Enter Access Token:**
    *   You will be presented with an input field labeled "Access Token".
    *   Paste the Facebook access token you wish to check into this field.

3.  **Submit:**
    *   Click the "Check Token", "Validate", or a similarly labeled button.

### Inputs Required

*   **Access Token:** The Facebook access token to be validated.

### Expected Output

*   **Valid Token:** If the token is live and valid, the UI will display a confirmation message. It might also show some basic information associated with the token, such as:
    *   User ID it belongs to.
    *   Application ID it's associated with.
    *   Scopes/permissions granted.
    *   Expiration time.
*   **Invalid Token:** If the token is invalid, expired, or revoked, the UI will display an error message or a status indicating it's not active.

### Notes & Considerations

*   **Token Information:** The amount of detail shown for a valid token depends on the `check-token-live.php` script's implementation and what Facebook's Graph API Debugger (or similar mechanism) returns.
*   This tool is useful for quickly verifying if a token can be used for other operations.

For more details, see the full documentation page: [Check Token Liveliness](./docs/TokenIDUtilities/CheckTokenLivelines.md)
</details>

<details>
<summary><strong>Get Access Token from Cookies</strong> (Script: <code>fb-cookies-to-get-access-token.php</code>)</summary>

**Original Script Description:**

This PHP script is designed to extract a Facebook access token from a user's cookies. Here's a breakdown of what it does:

1. **Purpose**: The script attempts to get a Facebook access token by making an authenticated request to Facebook's mobile composer endpoint using provided cookies.
2. **Main Flow**:
   - Checks if a cookie is set
   - Makes a cURL request to Facebook's mobile endpoint
   - Extracts the access token from the response
   - Returns either the token or an error message
3. **Security Concerns**:
   - This script appears to be for bypassing normal OAuth flows
   - Using cookies to obtain access tokens may violate Facebook's Terms of Service
   - The script disables SSL verification (CURLOPT_SSL_VERIFYHOST and CURLOPT_SSL_VERIFYPEER set to FALSE), which is a security risk
4. **Technical Details**:
   - Uses the mobile Facebook endpoint (m.facebook.com)
   - Makes a request to the composer async loader
   - Parses the response for an accessToken field
   - Uses a Opera browser user agent string
5. **Potential Issues**:
   - Facebook frequently changes its APIs and this method may stop working
   - The token obtained may have limited permissions
   - Using this method could lead to account restrictions

### How to Use via Web UI

*(Note: The following is a general guideline, as this tool's UI integration status is not fully detailed. Specific fields and steps might vary. This method is highly dependent on Facebook's internal authentication mechanisms and may be unreliable or require specific cookie formats.)*

1.  **Navigate to the Tool:**
    *   On the main page of the PHP Facebook Tools Web App, locate and select the "Get Access Token from Cookies" tool (or a similar name).

2.  **Input Cookies:**
    *   The UI will provide a text area or input field where you can paste the Facebook cookies.
    *   These cookies should typically be in a format recognized by the script (e.g., JSON, Netscape cookie format, or a simple string of `name=value` pairs). The UI should specify the expected format if possible.

3.  **Submit:**
    *   Click the "Get Token", "Extract Token", or a similarly labeled button.

### Inputs Required

*   **Facebook Cookies:** A string or structured representation of the browser cookies for `facebook.com` associated with an active session.

### Expected Output

*   **Success:** If an access token can be extracted, the UI will display the token. It might also provide options to copy the token.
*   **Failure:** An error message indicating that an access token could not be extracted. This could be due to:
    *   Invalid or expired cookies.
    *   Incorrect cookie format.
    *   Changes in Facebook's authentication flow that the script cannot handle.
    *   The cookies not containing the necessary information to derive a token.

### Notes & Considerations

*   **Security Risk:** Handling cookies, especially for authentication, is a significant security risk. Ensure you trust the application and the environment where you are inputting these cookies. Cookies can grant full access to your Facebook account.
*   **Reliability:** This method is prone to breakages as Facebook updates its platform. Official OAuth 2.0 flows are the recommended way to obtain access tokens.
*   **Cookie Format:** The success of this tool heavily depends on the `fb-cookies-to-get-access-token.php` script's ability to parse the provided cookie string and the specific cookies Facebook uses at any given time to represent an authenticated session from which a token can be derived.
*   Use this tool with extreme caution and only with cookies you have obtained legitimately and understand the implications of sharing.

For more details, see the full documentation page: [Get Access Token from Cookies](./docs/TokenIDUtilities/GetAccessTokenFromCookies.md)
</details>

<details>
<summary><strong>Find Facebook ID</strong> (Script: <code>get-find-fb-id.php</code>)</summary>

**Original Script Description:**

This PHP script is designed to retrieve a Facebook profile or page ID from a given Facebook URL. Here's a breakdown of how it works:

1. **Function `getFBID($url)`**:
   - Takes a Facebook URL as input (e.g., 'https://www.facebook.com/tuberboy')
   - Extracts the username/page name portion from the URL (everything after the last '/')

2. **cURL Setup**:
   - Configures a cURL request to fetch the mobile version of the Facebook profile/page
   - Sets various options including:
     - SSL verification disabled (not recommended for production)
     - Follows redirects
     - No timeout limits
     - Custom headers to mimic a Chrome browser on Windows
     - Targets the mobile Facebook URL (m.facebook.com)

3. **ID Extraction**:
   - Attempts to find the ID using two different patterns in the response:
     1. Looks for `entity_id:XXXXX}` pattern in the HTML
     2. Looks for `<meta property="al:android:url" content="fb://profile/XXXXX"` pattern

4. **Return**:
   - Returns the found ID (or empty string if not found)

**Potential Issues**:
1. **Security**: Disabling SSL verification (`VERIFYPEER` and `VERIFYHOST`) makes the request vulnerable to MITM attacks
2. **Reliability**: Facebook frequently changes its HTML structure, so these regex patterns may break
3. **Rate Limiting**: Facebook may block repeated requests from the same IP
4. **Mobile Site**: The script relies on m.facebook.com which might not always be available

**Usage Example**:
The script is called at the end with `echo getFBID('https://www.facebook.com/tuberboy');` to demonstrate its use.

For production use, you might want to:
1. Add error handling
2. Implement proper SSL verification
3. Add rate limiting
4. Consider using Facebook's Graph API instead of scraping
5. Handle cases where the profile/page doesn't exist or is private

### How to Use via Web UI

*(Note: The following is a general guideline, as this tool's UI integration status is not fully detailed. Specific fields and steps might vary.)*

1.  **Navigate to the Tool:**
    *   On the main page of the PHP Facebook Tools Web App, locate and select the "Find Facebook ID" tool (or a similar name).

2.  **Enter Profile Identifier:**
    *   The UI will have an input field for a "Facebook Profile URL" or "Username".
    *   Enter the full URL of the Facebook profile (e.g., `https://www.facebook.com/username`) or just the username.

3.  **Submit:**
    *   Click the "Find ID", "Get ID", or a similarly labeled button.

### Inputs Required

*   **Facebook Profile URL or Username:** The web address of the Facebook profile or its unique username.

### Expected Output

*   **Success:** If the User ID can be found, the UI will display the numerical ID.
*   **Failure:** An error message indicating that the User ID could not be found. This might happen if:
    *   The profile URL or username is invalid or does not exist.
    *   The profile is private and its ID cannot be easily discovered.
    *   Facebook's structure has changed, and the script can no longer find the ID using its current method.

### Notes & Considerations

*   **Vanity URLs:** Facebook allows users to have vanity URLs (e.g., `/username`) in addition to their numerical ID-based URLs. This tool is useful for resolving vanity URLs back to the underlying User ID.
*   **Graph API:** Some methods of finding User IDs might involve querying Facebook's Graph API or parsing page source, which can be subject to changes and rate limits.
*   The reliability of the `get-find-fb-id.php` script depends on the stability of Facebook's profile page structure or API access for this information.

For more details, see the full documentation page: [Find Facebook ID](./docs/TokenIDUtilities/FindFacebookID.md)
</details>

Scripts from the `tools/php_tools/facebook_scripts/` directory that are not yet fully integrated into the web UI or documented above may be listed with a "Coming Soon" notice in the application. To integrate them, their logic needs to be refactored into classes within the `src/FacebookTools/` directory (project root) and corresponding routes/handlers added in `public/index.php` (project root), along with creating their documentation page in `tools/php_tools/docs/`.

<details>
<summary>Development Notes</summary>

- **PHP Built-in Server**: The application runs on PHP's built-in web server inside the Docker container. This is suitable for development and light usage. The main project might use a different setup when orchestrating with Docker Compose.
- **Facebook API Calls**: Some scripts, particularly those related to page creation or account modification, interact with Facebook APIs that might be unofficial or subject to change. Functionality can be affected by Facebook's updates.
- **Error Handling**: Basic error handling is in place. For production, more comprehensive logging and error management would be recommended.
- **Security**:
    - Scripts like `PageCreator.php` (derived from `create-fb-page.php`) may use `CURLOPT_SSL_VERIFYPEER = FALSE` and `CURLOPT_SSL_VERIFYHOST = FALSE`. This is a security risk and should be addressed for production use by enabling SSL verification and ensuring proper certificate handling.
    - Input validation and sanitization are basic. Enhance as needed for security.
    - Be cautious when using tools that handle sensitive data like access tokens or cookies (e.g., "Get Access Token from Cookies").
</details>

<details>
<summary>Stopping the Standalone Container</summary>

To stop the running standalone container:

```bash
docker stop php-fb-tools-container
```

To remove the container (if you want to start fresh later):

```bash
docker rm php-fb-tools-container
```
</details>
