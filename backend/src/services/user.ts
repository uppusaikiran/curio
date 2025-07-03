import { prisma } from './db';
import { User } from '@prisma/client';

export interface UserCreateInput {
  email: string;
  password: string;
}

export interface UserService {
  findByEmail(email: string): Promise<User | null>;
  create(data: UserCreateInput): Promise<User>;
}

export const userService: UserService = {
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  async create(data: UserCreateInput) {
    // In a real implementation, you would hash the password before storing it
    return prisma.user.create({
      data,
    });
  },
}; 