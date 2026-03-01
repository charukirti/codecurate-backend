# Hey there, welcome to CodeCurate! 👋

So I built this little API where developers can share and review YouTube coding tutorials. Think of it like a rating system for coding videos — you know how sometimes you find an amazing tutorial, or sometimes you waste an hour on a bad one? Yeah, this is where we keep track of the good ones.

People can sign up, find coding videos, rate them, write reviews, and even reply to other people's reviews. It's basically a community-driven guide to the best coding content on YouTube.

## Key features

## ✨ Key Features

### Security & Authentication

- Dual-token architecture using short-lived Access Tokens and highly secure, `httpOnly` Refresh Tokens.
- Cryptographically secure email verification and password reset flows.
- Strict Role-Based Access Control (RBAC) separating `user` and `admin` privileges.

### Resource Curation

- Direct integration with the YouTube Data API to extract, and store video/playlist metadata.
- Support for custom descriptions and specific instructor name.
- Supports pagination, search filtering, and related-resource recommendations.

### Community Interaction

- **Reviews:** Users can leave detailed reviews on specific resources.
- **Social Engagement:** People can reply to the review or they can like the review.
- **Tagging System:** Reviews can be categorized using predefined tags (e.g., "Beginner Friendly", "Outdated").

### Developer Experience

- **Strict Validation:** Every incoming payload and parameter is strictly sanitized via Zod schemas before reaching the controllers.
- **Repository Pattern:** Clean separation of concerns with database logic abstracted into dedicated repository layers.
- **Centralized Error Handling:** Custom error classes and global middleware ensure the API never crashes ungracefully and always returns standardized JSON error responses.

## 🚀 Tech Stack

- **Runtime & Framework:** Node.js, Express.js
- **Language:** TypeScript
- **Database & ORM:** PostgreSQL (Neon Serverless), Drizzle ORM
- **Validation:** Zod
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs
- **Mailing:** Nodemailer

## Getting started 🚀

Pretty easy. Just follow these steps:

**1. Clone the repo:**

```bash
git clone <repo-url>
cd codecurate-backend
```

**2. Install dependencies:**

```bash
npm install
```

**3. Set up your environment:**
Create a `.env` file in the root folder and add your settings (database URL, API keys, session secret, etc.). Check the `.env.example` file if there's one to see what you need.

**4. Generate migration files:**

```bash
npm run db:generate
```

**5. Run the database migration:**

```bash
npm run db:migrate
```

**5. Start the dev server:**

```bash
npm run dev
```

That's it! The server should be running and ready to go.
