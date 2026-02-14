'use server';

import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { registerSchema, type RegisterInput } from '@/lib/validation/auth-schemas';

export async function registerUser(input: RegisterInput): Promise<
  | { success: true }
  | { error: string }
> {
  try {
    const parsed = registerSchema.safeParse(input);

    if (!parsed.success) {
      return { error: 'Invalid input data' };
    }

    const { name, email, password } = parsed.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: 'User with this email already exists' };
    }

    const hashedPassword = await hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('[registerUser] Error:', error);
    return { error: 'An error occurred during registration' };
  }
}
