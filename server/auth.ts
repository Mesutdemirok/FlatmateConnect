import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import type { RequestHandler } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const TOKEN_EXPIRY = '7d';
const BCRYPT_ROUNDS = 10;

export interface JwtPayload {
  userId: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export function generateToken(userId: string, email: string): string {
  return jwt.sign(
    { userId, email } as JwtPayload,
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export const jwtAuth: RequestHandler = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    // Check both 'token' and 'auth_token' cookies (OAuth uses 'auth_token')
    const cookieToken = req.cookies?.auth_token || req.cookies?.token;
    
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : cookieToken;

    console.log('🔐 JWT Auth Check:', {
      hasAuthHeader: !!authHeader,
      hasAuthTokenCookie: !!req.cookies?.auth_token,
      hasTokenCookie: !!req.cookies?.token,
      tokenFound: !!token,
      path: req.path
    });

    if (!token) {
      console.log('❌ No JWT token found in Authorization header or cookies');
      return res.status(401).json({ message: 'Yetkisiz erişim' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.userId = decoded.userId;
    
    console.log('✅ JWT verified successfully for user:', decoded.userId);
    next();
  } catch (error) {
    console.error('❌ JWT verification error:', error);
    return res.status(401).json({ message: 'Geçersiz veya süresi dolmuş token' });
  }
};
