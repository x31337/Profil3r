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

The application provides a web UI for various PHP scripts. Detailed instructions on how to use each tool via the web UI, including required inputs and expected outputs, are available in the `tools/php_tools/docs/` directory, categorized as follows:

### Account Management
Tools related to managing Facebook user accounts.
- **[Check Facebook Account Status](./docs/AccountManagement/CheckFacebookAccountStatus.md)** (Script: `check-fb-acc.php`)
- **[Change Facebook Account Information](./docs/AccountManagement/ChangeFacebookAccountInfo.md)** (Script: `change-fb-acc-info.php`)
- **[Register Facebook Account](./docs/AccountManagement/RegisterFacebookAccount.md)** (Script: `reg-fb-acc.php`)

### Page Management
Tools related to managing Facebook pages.
- **[Create Facebook Page](./docs/PageManagement/CreateFacebookPage.md)** (Script: `create-fb-page.php`)
- **[Get All Pages](./docs/PageManagement/GetAllPages.md)** (Script: `get-all-pages.php`)
- **[Like/Follow Facebook Page](./docs/PageManagement/LikeFollowPage.md)** (Script: `like-follow-page.php`)

### Token & ID Utilities
Tools for working with access tokens and Facebook IDs.
- **[Check Token Liveliness](./docs/TokenIDUtilities/CheckTokenLivelines.md)** (Script: `check-token-live.php`)
- **[Get Access Token from Cookies](./docs/TokenIDUtilities/GetAccessTokenFromCookies.md)** (Script: `fb-cookies-to-get-access-token.php`)
- **[Find Facebook ID](./docs/TokenIDUtilities/FindFacebookID.md)** (Script: `get-find-fb-id.php`)

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
