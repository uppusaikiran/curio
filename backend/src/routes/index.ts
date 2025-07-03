import { FastifyInstance } from 'fastify';
import { userRoutes } from './user';
import { audioRoutes } from './audio';

export async function routes(fastify: FastifyInstance) {
  // Register route groups
  fastify.register(userRoutes, { prefix: '/api/users' });
  fastify.register(audioRoutes, { prefix: '/api/audio' });
  
  // Root route
  fastify.get('/', async () => {
    return { message: 'Welcome to Curio API' };
  });
} 