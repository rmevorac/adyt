import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { prisma } from './prisma';

/**
 * Server-side authentication utilities
 */

export async function getAuthUser() {
  try {
    // In Next.js 15.2, cookies() returns a Promise
    const cookieStore = await cookies();
    
    // Now we can safely access the get method
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return null;
    }
    
    // Decode token
    const decoded = verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true }
    });
    
    return user;
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
} 