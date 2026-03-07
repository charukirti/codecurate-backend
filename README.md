# CodeCurate — Backend API

A REST API for discovering and reviewing YouTube coding tutorials. Developers can find videos, rate them, write reviews, reply to others, and collectively build a guide to the best coding content on YouTube.

## ✨ Key Features

### Security & Authentication

- Dual-token architecture using short-lived Access Tokens and highly secure, `httpOnly` Refresh Tokens.
- Cryptographically secure email verification and password reset flows.
- Strict Role-Based Access Control (RBAC) separating `user` and `admin` privileges.

### Resource Curation

- Direct integration with the YouTube Data API to extract and store video/playlist metadata.
- Support for custom descriptions and specific instructor names.
- Supports pagination, search filtering, and related-resource recommendations.

### Community Interaction

- **Reviews:** Users can leave detailed reviews on specific resources.
- **Social Engagement:** Like reviews or reply to them.
- **Tagging System:** Reviews can be categorized using predefined tags (e.g., "Beginner Friendly", "Outdated").

### Developer Experience

- **Strict Validation:** Every incoming payload and parameter is validated via Zod schemas before reaching the controllers.
- **Repository Pattern:** Clean separation of concerns with database logic abstracted into dedicated repository layers.
- **Centralized Error Handling:** Custom error classes and global middleware ensure standardized JSON error responses.
- **Structured Logging:** Winston-based logging with log files for persistent observability.

## 🚀 Tech Stack

- **Runtime & Framework:** Node.js (v18+), Express.js
- **Language:** TypeScript
- **Database & ORM:** PostgreSQL (Neon Serverless), Drizzle ORM
- **Validation:** Zod
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs
- **Security:** Helmet, express-rate-limit
- **Mailing:** Nodemailer
- **Logging:** Winston
- **API Docs:** Swagger UI (swagger-ui-express)
- **Others:** Axios, CORS, cookie-parser

## 📁 Project Structure

```
src/
├── config/          # App configuration (env vars, constants)
├── db/              # Drizzle ORM setup and migrations
├── middlewares/     # Global middleware (auth, error handling, rate limiting)
├── modules/
│   ├── auth/        # Registration, login, token refresh, email verification
│   ├── resource/    # YouTube resource ingestion and management
│   ├── reviews/     # Reviews, replies, likes, tags
│   └── users/       # User profiles, history, account management
├── scripts/         # Seed scripts (admin, tags)
├── shared/          # Shared types and utilities
├── utils/           # Logger and helper functions
├── app.ts           # Express app setup
└── server.ts        # Server entry point
```

## 🛠️ Getting Started

### Prerequisites

- Node.js v18 or higher
- A [Neon](https://neon.tech) serverless PostgreSQL database
- A [YouTube Data API v3](https://console.cloud.google.com) key
- An SMTP email account (e.g. Gmail with an app password)

### 1. Clone the repo

```bash
git clone https://github.com/charukirti/codecurate-backend.git
cd codecurate-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory and populate it with the following:

```env
# Server
PORT=3000
NODE_ENV=development
BASE_URL=http://localhost:3000
CLIENT_URL=http://localhost:5173

# Database (Neon)
DATABASE_URL=your_neon_postgres_connection_string

# YouTube API
YT_API_KEY=your_youtube_data_api_v3_key
YOUTUBE_API_URL=https://www.googleapis.com/youtube/v3

# JWT
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Admin seed credentials
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_admin_password

# SMTP (Nodemailer)
SMTP_USER=your_email@example.com
SMTP_PASS=your_smtp_app_password
```

### 4. Run database migrations

```bash
npm run db:generate
npm run db:migrate
```

### 5. Seed initial data

Seed the predefined review tags:

```bash
npm run seed:tags
```

Create the initial admin account (uses `ADMIN_EMAIL` and `ADMIN_PASSWORD` from your `.env`):

```bash
npm run seed:admin
```

### 6. Start the development server

```bash
npm run dev
```

The server will be available at `http://localhost:3000` (or your configured `PORT`).

- **Health check:** `GET /health`
- **API documentation:** `GET /docs`

## 📦 Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled production build |
| `npm run db:generate` | Generate Drizzle migration files |
| `npm run db:migrate` | Apply migrations to the database |
| `npm run seed:admin` | Create the initial admin user |
| `npm run seed:tags` | Seed predefined review tags |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Run ESLint with auto-fix |
| `npm run format` | Format source files with Prettier |

## 🚢 Production

```bash
npm run build
npm start
```

Make sure `NODE_ENV=production` is set in your production environment.

## 📄 License

This project is licensed under the [MIT License](./LICENSE).
