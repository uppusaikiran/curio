import Fastify from 'fastify';
import cors from '@fastify/cors';
import { routes } from './routes';
import { config } from './config';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const fastify = Fastify({
  logger: true
});

// Register plugins
fastify.register(cors, config.cors);

// Register routes
fastify.register(routes);

// Health check endpoint
fastify.get('/health', async () => {
  return { status: 'ok' };
});

// Run the server
const start = async () => {
  try {
    await fastify.listen({
      port: config.server.port,
      host: config.server.host
    });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start(); 