# API Documentation

## Authentication Endpoints

### POST /api/auth/login
Authenticate user with email and password.

**Parameters:**
- email (string, required): User email
- password (string, required): User password

**Response:**
- 200 OK: Returns JWT token
- 401 Unauthorized: Invalid credentials
- 429 Too Many Requests: Rate limit exceeded

## User Endpoints

### GET /api/users/{id}
Get user details.

**Parameters:**
- id (string, required): User ID

**Response:**
- 200 OK: User object
- 404 Not Found: User not found