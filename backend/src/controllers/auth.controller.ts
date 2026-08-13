import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { OAuth2Client } from 'google-auth-library';

const prisma = new PrismaClient();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    res.status(201).json({ message: 'User registered successfully', userId: user.id });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const business = await prisma.business.findFirst({ where: { userId: user.id } });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      hasBusiness: !!business
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const googleLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      res.status(400).json({ error: 'accessToken is required' });
      return;
    }

    // Fetch user info using access_token
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userInfoRes.ok) {
      res.status(400).json({ error: 'Invalid Google token' });
      return;
    }

    const payload = await userInfoRes.json();
    const { email, name, sub: googleId } = payload;

    if (!email) {
      res.status(400).json({ error: 'Email not found in Google account' });
      return;
    }

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: name || '',
          googleId,
        },
      });
    } else if (!user.googleId) {
      // Link Google ID if email exists but no googleId
      user = await prisma.user.update({
        where: { email },
        data: { googleId },
      });
    }

    // Generate our own JWT for the session
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    const business = await prisma.business.findFirst({ where: { userId: user.id } });

    res.status(200).json({
      message: 'Google login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      hasBusiness: !!business
    });
  } catch (error: any) {
    console.error('Google login error:', error);
    res.status(500).json({ error: 'Internal server error during Google login', details: error.message || error.toString() });
  }
};

export const seedTestAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    const testEmail = 'test@example.com';
    const testPassword = 'password123';
    
    let user = await prisma.user.findUnique({ where: { email: testEmail } });

    if (user) {
      res.status(200).json({ message: 'Test account already exists', user: { email: user.email } });
      return;
    }

    const hashedPassword = await bcrypt.hash(testPassword, 10);
    user = await prisma.user.create({
      data: {
        email: testEmail,
        password: hashedPassword,
        name: 'Test Account',
      },
    });

    res.status(201).json({
      message: 'Test account created successfully',
      credentials: {
        email: testEmail,
        password: testPassword
      }
    });
  } catch (error) {
    console.error('Seed test account error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
