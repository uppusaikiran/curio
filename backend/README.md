# Curio Backend

This is the backend server for the Curio application, built with Fastify and TypeScript.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Update values as needed

3. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

4. Create and seed the database:
   ```bash
   npx prisma migrate dev --name init
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login and get a token
- `GET /api/users/me` - Get current user info (requires authentication)

### Audio Processing
- `POST /api/audio/process` - Process audio and get AI response
- `GET /api/audio/history` - Get conversation history

### Health Check
- `GET /health` - Check if the server is running

## Project Structure

```
src/
├── config/         # Configuration settings
├── middleware/     # Middleware functions
├── routes/         # API routes
├── services/       # Business logic
└── index.ts        # Entry point
``` 