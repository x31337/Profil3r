# API Reference

## Health Check Endpoints

### OSINT Service
- **URL**: `http://localhost:8000/api/health`
- **Method**: GET
- **Response**: 
  ```json
  {
    "status": "ok",
    "service": "osint-framework",
    "port": 8000
  }
  ```

### JS Tools Service
- **URL**: `http://localhost:3000/api/health`
- **Method**: GET
- **Response**:
  ```json
  {
    "status": "ok",
    "service": "js-tools-bot-framework",
    "port": 3000,
    "uptime": 1515.732206401,
    "timestamp": "2025-07-08T20:53:03.761Z"
  }
  ```

### Facebook Mass Messenger
- **URL**: `http://localhost:4444/api/health`
- **Method**: GET
- **Response**:
  ```json
  {
    "status": "ok",
    "service": "facebook-mass-messenger",
    "port": 4444
  }
  ```

## OSINT API Endpoints

### Username Search
- **URL**: `http://localhost:8000/api/osint/username/{username}`
- **Method**: GET
- **Parameters**: 
  - `username` (string): Username to search
- **Response**: JSON object with platform results

### Email Lookup
- **URL**: `http://localhost:8000/api/osint/email/{email}`
- **Method**: GET
- **Parameters**: 
  - `email` (string): Email address to validate
- **Response**: JSON object with validation results

### Domain Information
- **URL**: `http://localhost:8000/api/network/domain/{domain}`
- **Method**: GET
- **Parameters**: 
  - `domain` (string): Domain to analyze
- **Response**: JSON object with domain information

## JavaScript Tools API

### Mass Messenger Interface
- **URL**: `http://localhost:3000/messenger`
- **Method**: GET/POST
- **Description**: Web interface for sending mass messages

### Bot Framework
- **URL**: `http://localhost:3000/bot`
- **Method**: GET/POST
- **Description**: Facebook Messenger bot management interface

## Authentication

Most endpoints require authentication via:
- API Keys (configured in environment variables)
- Session cookies (for Facebook-related operations)
- Bearer tokens (for protected endpoints)

## Rate Limiting

- OSINT endpoints: 60 requests per minute
- Facebook operations: 10 requests per minute
- Health checks: No rate limiting

## Error Responses

All APIs return standardized error responses:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": "Additional error details"
  }
}
```

Common error codes:
- `INVALID_REQUEST`: Malformed request
- `UNAUTHORIZED`: Authentication required
- `RATE_LIMITED`: Too many requests
- `SERVICE_UNAVAILABLE`: Service temporarily down
