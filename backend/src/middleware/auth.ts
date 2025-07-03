import { FastifyRequest, FastifyReply } from 'fastify';

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    // Get the Authorization header
    const authHeader = request.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      reply.code(401).send({ error: 'Unauthorized: Missing or invalid token' });
      return;
    }
    
    // Extract the token
    const token = authHeader.split(' ')[1];
    
    // In a real implementation, you would verify the JWT token here
    // For now, we'll just check if it exists
    if (!token) {
      reply.code(401).send({ error: 'Unauthorized: Invalid token' });
      return;
    }
    
    // In a real implementation, you would decode the token and set the user on the request
    // request.user = decodedToken.user;
    
  } catch (error) {
    reply.code(401).send({ error: 'Unauthorized: Invalid token' });
  }
} 