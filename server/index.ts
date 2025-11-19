import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import pkg from 'pg';
const { Pool } = pkg;
import { users } from '../shared/schema.js';

const app = express();
const PORT = process.env.API_PORT || 3001;

if (!process.env.JWT_SECRET) {
  console.error('❌ FATAL: JWT_SECRET environment variable is not set!');
  console.error('Please set JWT_SECRET in your environment variables.');
  process.exit(1);
}

const JWT_SECRET = process.env.JWT_SECRET;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

interface AuthenticatedRequest extends express.Request {
  userId?: number;
}

const jwtAuth = async (req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies?.auth_token;
    
    const token = authHeader?.replace('Bearer ', '') || cookieToken;
    
    if (!token) {
      return res.status(401).json({ message: 'Kimlik doğrulaması gerekli' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Geçersiz veya süresi dolmuş token' });
  }
};

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: 'Tüm alanlar zorunludur' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Şifre en az 8 karakter olmalıdır' });
    }

    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Bu e-posta adresi zaten kullanılıyor' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [newUser] = await db.insert(users).values({
      email,
      password: hashedPassword,
      firstName,
      lastName,
    }).returning();

    const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '7d' });

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const userResponse = {
      id: newUser.id.toString(),
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      profileImageUrl: newUser.profileImageUrl,
      phone: newUser.phone,
      dateOfBirth: newUser.dateOfBirth,
      gender: newUser.gender,
      occupation: newUser.occupation,
      bio: newUser.bio,
      verificationStatus: newUser.verificationStatus,
    };

    res.status(201).json({ user: userResponse, token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Kayıt sırasında bir hata oluştu' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'E-posta ve şifre gereklidir' });
    }

    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!user) {
      return res.status(401).json({ message: 'Geçersiz e-posta veya şifre' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Geçersiz e-posta veya şifre' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const userResponse = {
      id: user.id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
      phone: user.phone,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      occupation: user.occupation,
      bio: user.bio,
      verificationStatus: user.verificationStatus,
    };

    res.json({ user: userResponse, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Giriş sırasında bir hata oluştu' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('auth_token');
  res.json({ message: 'Çıkış başarılı' });
});

app.get('/api/auth/me', jwtAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, req.userId!)).limit(1);

    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    const userResponse = {
      id: user.id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
      phone: user.phone,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      occupation: user.occupation,
      bio: user.bio,
      verificationStatus: user.verificationStatus,
    };

    res.json(userResponse);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Kullanıcı bilgileri alınamadı' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

app.listen(PORT, () => {
  console.log(`✅ API server is running on http://localhost:${PORT}`);
});
