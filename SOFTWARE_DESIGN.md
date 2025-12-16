# OAuth API - Software Design Document

## 1. Product Information

### Product Name
OAuth Authentication Service

### Description
A comprehensive OAuth 2.0 authentication service that enables users to authenticate using third-party providers (Google, GitHub, Facebook) alongside traditional email/password authentication. This service provides secure token-based authentication and user management.

### Key Features
- Traditional email/password authentication
- OAuth 2.0 integration with multiple providers (Google, GitHub, Facebook)
- JWT token-based session management
- User profile management
- Secure password hashing
- Account linking (link multiple OAuth providers to one account)
- Refresh token mechanism

### Technology Stack
- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **Authentication**: Passport.js, JWT
- **Password Hashing**: bcrypt
- **OAuth Providers**: Google, GitHub, Facebook
- **Environment Management**: dotenv

---

## 2. Use Case Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    OAuth Authentication System               │
│                                                              │
│  ┌──────────┐                                               │
│  │   User   │                                               │
│  └────┬─────┘                                               │
│       │                                                      │
│       ├──────► Register with Email/Password                 │
│       │                                                      │
│       ├──────► Login with Email/Password                    │
│       │                                                      │
│       ├──────► Login with Google OAuth ◄────┐               │
│       │                              ┌───────┴────────┐     │
│       ├──────► Login with GitHub OAuth      │ Google  │     │
│       │                              │  API   │     │
│       ├──────► Login with Facebook OAuth     └────────┘     │
│       │                              ┌────────┐             │
│       ├──────► View Profile          │ GitHub │             │
│       │                              │  API   │             │
│       ├──────► Update Profile        └────────┘             │
│       │                              ┌────────┐             │
│       ├──────► Link OAuth Account    │Facebook│             │
│       │                              │  API   │             │
│       ├──────► Unlink OAuth Account  └────────┘             │
│       │                                                      │
│       ├──────► Refresh Access Token                         │
│       │                                                      │
│       └──────► Logout                                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Use Case Descriptions

### UC-01: Register with Email/Password
**Actor**: User  
**Precondition**: User does not have an account  
**Flow**:
1. User provides username, email, and password
2. System validates input (email format, password strength)
3. System checks if email is already registered
4. System hashes password using bcrypt
5. System creates user account
6. System returns success message and user details

**Postcondition**: User account is created in the database

---

### UC-02: Login with Email/Password
**Actor**: User  
**Precondition**: User has a registered account  
**Flow**:
1. User provides email and password
2. System validates input
3. System finds user by email
4. System compares provided password with hashed password
5. System generates JWT access token and refresh token
6. System returns tokens and user details

**Postcondition**: User is authenticated and receives tokens

---

### UC-03: Login with OAuth Provider (Google/GitHub/Facebook)
**Actor**: User  
**Precondition**: None  
**Flow**:
1. User clicks on OAuth provider login button
2. System redirects to OAuth provider's authorization page
3. User authenticates with OAuth provider
4. OAuth provider redirects back with authorization code
5. System exchanges code for access token
6. System retrieves user profile from OAuth provider
7. System checks if user exists by OAuth provider ID
8. If new user: System creates account and links OAuth provider
9. If existing user: System updates OAuth tokens
10. System generates JWT tokens
11. System returns tokens and user details

**Postcondition**: User is authenticated via OAuth

---

### UC-04: Link OAuth Account
**Actor**: Authenticated User  
**Precondition**: User is logged in  
**Flow**:
1. User initiates OAuth linking for a provider
2. System redirects to OAuth provider
3. User authorizes the application
4. OAuth provider redirects back with authorization code
5. System retrieves OAuth profile
6. System links OAuth provider to existing user account
7. System saves OAuth tokens

**Postcondition**: OAuth provider is linked to user account

---

### UC-05: View/Update Profile
**Actor**: Authenticated User  
**Precondition**: User is logged in  
**Flow**:
1. User requests profile information
2. System validates JWT token
3. System retrieves user profile with linked OAuth providers
4. System returns profile data
5. (Optional) User updates profile fields
6. System validates and saves changes

**Postcondition**: User profile is retrieved/updated

---

## 4. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  (Web Browser / Mobile App / Desktop Application)           │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTPS
                        │ REST API
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway / Router                      │
│                     (Express.js Routes)                      │
└───────────────────────┬─────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Auth         │ │ User         │ │ OAuth        │
│ Middleware   │ │ Controller   │ │ Controller   │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │
       │    ┌───────────┼────────────┐   │
       │    │           │            │   │
       ▼    ▼           ▼            ▼   ▼
┌─────────────────────────────────────────────────────────────┐
│                      Service Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Auth Service │  │ User Service │  │OAuth Service │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└───────────────────────┬─────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ JWT Helper   │ │ bcrypt       │ │ Passport.js  │
│              │ │ Helper       │ │ Strategies   │
└──────────────┘ └──────────────┘ └──────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
│                   (Sequelize ORM)                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ User Model   │  │ OAuth Model  │  │ Token Model  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                  PostgreSQL Database                         │
│     Tables: users, oauth_providers, refresh_tokens           │
└─────────────────────────────────────────────────────────────┘

External Services:
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Google OAuth │  │ GitHub OAuth │  │Facebook OAuth│
│     API      │  │     API      │  │     API      │
└──────────────┘  └──────────────┘  └──────────────┘
```

---

## 5. Class Diagram

```
┌─────────────────────────────────────────┐
│              User                        │
├─────────────────────────────────────────┤
│ - id: INTEGER (PK)                      │
│ - username: STRING (UNIQUE)             │
│ - email: STRING (UNIQUE)                │
│ - password: STRING (nullable)           │
│ - fullName: STRING                      │
│ - profilePicture: STRING                │
│ - isEmailVerified: BOOLEAN              │
│ - createdAt: DATE                       │
│ - updatedAt: DATE                       │
├─────────────────────────────────────────┤
│ + hasMany(OAuthProvider)                │
│ + hasMany(RefreshToken)                 │
│ + validatePassword(password): Boolean   │
│ + toJSON(): Object                      │
└─────────────────────────────────────────┘
                    │
                    │ 1
                    │
                    │ *
                    ▼
┌─────────────────────────────────────────┐
│          OAuthProvider                   │
├─────────────────────────────────────────┤
│ - id: INTEGER (PK)                      │
│ - userId: INTEGER (FK)                  │
│ - provider: STRING                      │
│   (google, github, facebook)            │
│ - providerId: STRING                    │
│ - accessToken: STRING                   │
│ - refreshToken: STRING (nullable)       │
│ - profile: JSON                         │
│ - createdAt: DATE                       │
│ - updatedAt: DATE                       │
├─────────────────────────────────────────┤
│ + belongsTo(User)                       │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│          RefreshToken                    │
├─────────────────────────────────────────┤
│ - id: INTEGER (PK)                      │
│ - userId: INTEGER (FK)                  │
│ - token: STRING (UNIQUE)                │
│ - expiresAt: DATE                       │
│ - isRevoked: BOOLEAN                    │
│ - createdAt: DATE                       │
├─────────────────────────────────────────┤
│ + belongsTo(User)                       │
│ + isExpired(): Boolean                  │
│ + revoke(): void                        │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│        UserController                    │
├─────────────────────────────────────────┤
│ + register(req, res, next)              │
│ + login(req, res, next)                 │
│ + getProfile(req, res, next)            │
│ + updateProfile(req, res, next)         │
│ + refreshToken(req, res, next)          │
│ + logout(req, res, next)                │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│        OAuthController                   │
├─────────────────────────────────────────┤
│ + googleAuth(req, res, next)            │
│ + googleCallback(req, res, next)        │
│ + githubAuth(req, res, next)            │
│ + githubCallback(req, res, next)        │
│ + facebookAuth(req, res, next)          │
│ + facebookCallback(req, res, next)      │
│ + linkProvider(req, res, next)          │
│ + unlinkProvider(req, res, next)        │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│          JWTHelper                       │
├─────────────────────────────────────────┤
│ + generateAccessToken(payload): String  │
│ + generateRefreshToken(payload): String │
│ + verifyToken(token): Object            │
│ + decodeToken(token): Object            │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│         BcryptHelper                     │
├─────────────────────────────────────────┤
│ + hash(password): String                │
│ + compare(password, hash): Boolean      │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│      AuthenticationMiddleware            │
├─────────────────────────────────────────┤
│ + authenticate(req, res, next)          │
│ + optionalAuth(req, res, next)          │
└─────────────────────────────────────────┘
```

---

## 6. Entity Relationship Diagram (ERD)

```
┌─────────────────────────────────────────┐
│              users                       │
├─────────────────────────────────────────┤
│ PK │ id              SERIAL              │
│    │ username        VARCHAR(255) UNIQUE │
│    │ email           VARCHAR(255) UNIQUE │
│    │ password        VARCHAR(255) NULL   │
│    │ full_name       VARCHAR(255)        │
│    │ profile_picture VARCHAR(500)        │
│    │ is_email_verified BOOLEAN           │
│    │ created_at      TIMESTAMP           │
│    │ updated_at      TIMESTAMP           │
└──────────┬──────────────────────────────┘
           │
           │ 1
           │
           │ *
           │
┌──────────▼──────────────────────────────┐
│         oauth_providers                  │
├─────────────────────────────────────────┤
│ PK │ id              SERIAL              │
│ FK │ user_id         INTEGER             │
│    │ provider        VARCHAR(50)         │
│    │                 (google|github|     │
│    │                  facebook)          │
│    │ provider_id     VARCHAR(255)        │
│    │ access_token    TEXT                │
│    │ refresh_token   TEXT NULL           │
│    │ profile         JSONB               │
│    │ created_at      TIMESTAMP           │
│    │ updated_at      TIMESTAMP           │
│    │                                     │
│    │ UNIQUE(user_id, provider)           │
│    │ UNIQUE(provider, provider_id)       │
└─────────────────────────────────────────┘

┌──────────┬──────────────────────────────┐
│         refresh_tokens                   │
├─────────────────────────────────────────┤
│ PK │ id              SERIAL              │
│ FK │ user_id         INTEGER             │
│    │ token           TEXT UNIQUE         │
│    │ expires_at      TIMESTAMP           │
│    │ is_revoked      BOOLEAN             │
│    │ created_at      TIMESTAMP           │
└──────────┴──────────────────────────────┘
           │
           │ *
           │
           │ 1
           │
           └──────────────────────────────┐
                                          │
                                    ┌─────▼──────┐
                                    │   users    │
                                    └────────────┘

Relationships:
- users (1) ──< (*) oauth_providers
- users (1) ──< (*) refresh_tokens
```

---

## 7. User Interface Mockup

### 7.1 Login Page
```
┌─────────────────────────────────────────────────────┐
│                                                      │
│              OAuth Authentication App                │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │                                             │    │
│  │  Email:    [________________________]      │    │
│  │                                             │    │
│  │  Password: [________________________]      │    │
│  │                                             │    │
│  │         [    Login    ]                    │    │
│  │                                             │    │
│  │  ────────────── OR ──────────────          │    │
│  │                                             │    │
│  │  [ 🔵 Continue with Google    ]            │    │
│  │                                             │    │
│  │  [ 🐙 Continue with GitHub    ]            │    │
│  │                                             │    │
│  │  [ 📘 Continue with Facebook  ]            │    │
│  │                                             │    │
│  │  Don't have an account? [Sign up]          │    │
│  │                                             │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### 7.2 Registration Page
```
┌─────────────────────────────────────────────────────┐
│                                                      │
│                  Create Account                      │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │                                             │    │
│  │  Username: [________________________]      │    │
│  │                                             │    │
│  │  Email:    [________________________]      │    │
│  │                                             │    │
│  │  Password: [________________________]      │    │
│  │            (min 8 characters)               │    │
│  │                                             │    │
│  │  Confirm:  [________________________]      │    │
│  │                                             │    │
│  │         [   Register   ]                   │    │
│  │                                             │    │
│  │  ────────────── OR ──────────────          │    │
│  │                                             │    │
│  │  [ 🔵 Sign up with Google    ]             │    │
│  │                                             │    │
│  │  [ 🐙 Sign up with GitHub    ]             │    │
│  │                                             │    │
│  │  [ 📘 Sign up with Facebook  ]             │    │
│  │                                             │    │
│  │  Already have an account? [Login]          │    │
│  │                                             │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### 7.3 Profile Page
```
┌─────────────────────────────────────────────────────┐
│  [☰ Menu]              Profile         [Logout]     │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │                                             │    │
│  │      ┌────────┐                            │    │
│  │      │  👤    │   John Doe                 │    │
│  │      └────────┘   john@example.com         │    │
│  │                                             │    │
│  │  Username:  [john_doe_______________]      │    │
│  │                                             │    │
│  │  Email:     [john@example.com_______]      │    │
│  │                                             │    │
│  │  Full Name: [John Doe_______________]      │    │
│  │                                             │    │
│  │         [ Update Profile ]                 │    │
│  │                                             │    │
│  │  ──────── Connected Accounts ─────────     │    │
│  │                                             │    │
│  │  🔵 Google      ✓ Connected [Unlink]       │    │
│  │  🐙 GitHub      ✗ Not linked [Link]        │    │
│  │  📘 Facebook    ✓ Connected [Unlink]       │    │
│  │                                             │    │
│  │  ──────── Security ─────────────────       │    │
│  │                                             │    │
│  │  [ Change Password ]                       │    │
│  │                                             │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## 8. API Specification

### Base URL
```
http://localhost:3000/api
```

### 8.1 Authentication Endpoints

#### Register with Email/Password
```
POST /auth/register

Request Body:
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}

Response (201):
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

#### Login with Email/Password
```
POST /auth/login

Request Body:
{
  "email": "john@example.com",
  "password": "SecurePass123"
}

Response (200):
{
  "message": "Login successful",
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "profilePicture": "https://..."
  }
}
```

#### Refresh Token
```
POST /auth/refresh

Request Body:
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}

Response (200):
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### Logout
```
POST /auth/logout
Headers: Authorization: Bearer <token>

Request Body:
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}

Response (200):
{
  "message": "Logout successful"
}
```

---

### 8.2 OAuth Endpoints

#### Google OAuth - Initiate
```
GET /auth/google

Response: Redirects to Google OAuth consent screen
```

#### Google OAuth - Callback
```
GET /auth/google/callback?code=...

Response: Redirects to frontend with tokens
Redirect URL: http://frontend.com/auth/callback?
  access_token=xxx&refresh_token=yyy
```

#### GitHub OAuth - Initiate
```
GET /auth/github

Response: Redirects to GitHub OAuth consent screen
```

#### GitHub OAuth - Callback
```
GET /auth/github/callback?code=...

Response: Redirects to frontend with tokens
```

#### Facebook OAuth - Initiate
```
GET /auth/facebook

Response: Redirects to Facebook OAuth consent screen
```

#### Facebook OAuth - Callback
```
GET /auth/facebook/callback?code=...

Response: Redirects to frontend with tokens
```

---

### 8.3 User Profile Endpoints

#### Get Current User Profile
```
GET /users/profile
Headers: Authorization: Bearer <token>

Response (200):
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "fullName": "John Doe",
  "profilePicture": "https://...",
  "isEmailVerified": true,
  "oauthProviders": [
    {
      "provider": "google",
      "profile": {
        "name": "John Doe",
        "email": "john@gmail.com"
      }
    }
  ]
}
```

#### Update User Profile
```
PUT /users/profile
Headers: Authorization: Bearer <token>

Request Body:
{
  "fullName": "John Smith",
  "profilePicture": "https://..."
}

Response (200):
{
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "username": "john_doe",
    "fullName": "John Smith",
    "profilePicture": "https://..."
  }
}
```

---

### 8.4 OAuth Provider Management

#### Link OAuth Provider
```
GET /auth/link/:provider
Headers: Authorization: Bearer <token>

Provider: google | github | facebook

Response: Redirects to OAuth provider
```

#### Link OAuth Provider Callback
```
GET /auth/link/:provider/callback?code=...
Headers: Authorization: Bearer <token>

Response (200):
{
  "message": "Google account linked successfully",
  "provider": {
    "provider": "google",
    "profile": {
      "name": "John Doe",
      "email": "john@gmail.com"
    }
  }
}
```

#### Unlink OAuth Provider
```
DELETE /auth/unlink/:provider
Headers: Authorization: Bearer <token>

Provider: google | github | facebook

Response (200):
{
  "message": "Google account unlinked successfully"
}
```

---

### 8.5 Error Responses

All error responses follow this format:
```json
{
  "message": "Error description",
  "errors": ["Detailed error 1", "Detailed error 2"]
}
```

**HTTP Status Codes:**
- `200`: OK
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid/missing token)
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict (duplicate email/username)
- `500`: Internal Server Error

---

## 9. Security Considerations

### 9.1 Password Security
- Passwords hashed using bcrypt with salt rounds of 10
- Minimum password length: 8 characters
- Password complexity requirements enforced

### 9.2 Token Security
- Access tokens expire in 1 hour
- Refresh tokens expire in 7 days
- Tokens are revoked on logout
- JWT tokens signed with HS256 algorithm

### 9.3 OAuth Security
- State parameter used to prevent CSRF attacks
- OAuth tokens encrypted before storage
- Secure callback URLs with HTTPS in production
- Regular token refresh for OAuth providers

### 9.4 API Security
- CORS configured for allowed origins
- Rate limiting on authentication endpoints
- Input validation and sanitization
- SQL injection prevention via Sequelize ORM
- XSS prevention via proper escaping

---

## 10. Environment Variables

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/oauth_db

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_ACCESS_EXPIRY=1h
JWT_REFRESH_EXPIRY=7d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:3000/api/auth/github/callback

# Facebook OAuth
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_CALLBACK_URL=http://localhost:3000/api/auth/facebook/callback

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

---

## 11. Project Structure

```
oauth-api/
├── config/
│   ├── database.js
│   ├── passport.js
│   └── oauth.js
├── controllers/
│   ├── AuthController.js
│   ├── UserController.js
│   └── OAuthController.js
├── middlewares/
│   ├── authentication.js
│   ├── validation.js
│   └── errorHandler.js
├── models/
│   ├── index.js
│   ├── User.js
│   ├── OAuthProvider.js
│   └── RefreshToken.js
├── routes/
│   ├── index.js
│   ├── auth.js
│   └── users.js
├── helpers/
│   ├── bcrypt.js
│   └── jwt.js
├── validators/
│   ├── authValidator.js
│   └── userValidator.js
├── migrations/
├── seeders/
├── .env
├── .gitignore
├── app.js
├── server.js
└── package.json
```
