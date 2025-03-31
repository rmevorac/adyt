import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { prisma } from './prisma';

export async function getAuthUser() {
  try {
    // Get cookies, this returns ReadonlyRequestCookies in Next.js 15.x
    const cookieJar = cookies();
    
    // Note: TypeScript thinks this doesn't exist, but it does in Next.js 15
    // @ts-ignore - TypeScript definitions may be out of date
    const token = cookieJar.get('auth-token')?.value;
    
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