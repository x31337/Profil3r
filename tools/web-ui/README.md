# Facebook Mass Reporting Web UI Backend

This Flask backend automates mass reporting of Facebook posts, pages, and profiles for privacy violations using multiple Facebook accounts.

## Features

- Accepts Facebook URLs, justification, and evidence (screenshots) via API.
- Rotates through multiple pre-configured Facebook accounts for reporting.
- Uses Selenium (headless Chrome) for automation.
- Dockerized for easy deployment.

## Setup

### 1. Configure Facebook Accounts

Create a `fb_accounts.json` file in this directory:

```json
[
  { "email": "fb_account1@example.com", "password": "changeme" },
  { "email": "fb_account2@example.com", "password": "changeme" }
]
```

Or set the environment variable `FB_ACCOUNTS_JSON` with the same JSON array.

### 2. Build Docker Image

```
docker build -t fb-mass-report-backend .
```

### 3. Run the Container

```
docker run -p 5000:5000 -v $(pwd)/fb_accounts.json:/app/tools/web-ui/fb_accounts.json fb-mass-report-backend
```

## API Usage

POST `/api/report`

- `target_url`: Facebook post, page, or profile URL to report
- `justification`: Justification text for the report
- `evidence`: (optional) One or more screenshot files (multipart/form-data)

**Example cURL:**

```
curl -F "target_url=https://www.facebook.com/EXAMPLE" \
     -F "justification=Privacy violation justification here" \
     -F "evidence=@/path/to/screenshot1.png" \
     -F "evidence=@/path/to/screenshot2.jpg" \
     http://localhost:5000/api/report
```

**Response:**

```json
{
  "results": [
    { "email": "fb_account1@example.com", "success": true },
    {
      "email": "fb_account2@example.com",
      "success": false,
      "error": "Login failed"
    }
  ]
}
```

## Production Deployment

### 1. Environment Variables

- Copy `.env.example` to `.env` and set your secrets:
  - `FLASK_SECRET_KEY` (required)
  - `DATABASE_URL` (optional, defaults to Postgres in Docker Compose)

### 2. Build and Run with Docker Compose

```
docker compose --env-file .env up --build -d
```

- This will start the backend (Gunicorn), frontend (Nginx), and database (PostgreSQL) with persistent storage.

### 3. Security Best Practices

- Set a strong `FLASK_SECRET_KEY` in your `.env`.
- Restrict CORS in `api.py` to your frontend domain for production.
- Use secure file upload practices and review evidence access.
- Use strong DB credentials and restrict DB access to trusted networks.

### 4. Persistent Storage

- Database data is stored in `./pgdata` (PostgreSQL volume).
- Evidence files are stored in `/tmp/fb_evidence_uploads` inside the backend container.

### 5. Gunicorn and Nginx

- The backend runs with Gunicorn for production WSGI serving.
- The frontend is served by Nginx with security headers and caching.

### 6. E2E Testing in Production

- You can run Cypress tests against the production stack:

```
docker compose exec frontend npx cypress run --headless --browser chrome
```

---
