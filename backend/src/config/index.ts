// Configuration settings for the application

export const config = {
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 3001,
    host: '0.0.0.0',
  },
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default-dev-secret-change-in-production',
    expiresIn: '1d',
  },
  db: {
    url: process.env.DATABASE_URL || 'file:./dev.db',
  },
}; 