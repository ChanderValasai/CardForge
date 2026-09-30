import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.ts';
import { AuthRequest } from '../middleware/auth.ts';

const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET || 'cardforge_dev_jwt_secret_key_123';
  return jwt.sign({ userId }, secret, { expiresIn: '7d' });
};

// POST /api/auth/register
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Validation
    if (!name || !email || !password) {
      res.status(400).json({ error: 'Please provide all required fields.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        error: 'Password must be at least 6 characters long.',
      });
      return;
    }

    if (confirmPassword && password !== confirmPassword) {
      res.status(400).json({ error: 'Passwords do not match.' });
      return;
    }

    // Check if email already exists
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      res.status(400).json({
        error: 'An account with this email address already exists.',
      });
      return;
    }

    // Create user
    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      password,
    });

    await user.save();

    const token = generateToken(user._id.toString());

    res.status(201).json({
      message: 'Account registered successfully.',
      token,
      user: user.toJSON(),
    });
  } catch (error: any) {
    console.error('[CardForge Auth] Registration error:', error);
    res.status(500).json({
      error: error.message || 'An error occurred while creating your account.',
    });
  }
};

// POST /api/auth/login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Please provide both email and password.' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = generateToken(user._id.toString());

    res.json({
      message: 'Signed in successfully.',
      token,
      user: user.toJSON(),
    });
  } catch (error: any) {
    console.error('[CardForge Auth] Login error:', error);
    res.status(500).json({
      error: error.message || 'An error occurred while signing in.',
    });
  }
};

// GET /api/auth/me
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    res.json({
      user: req.user.toJSON ? req.user.toJSON() : req.user,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve user profile.' });
  }
};

// PUT /api/auth/profile
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const { name } = req.body;
    if (!name || !name.trim()) {
      res.status(400).json({ error: 'Name cannot be empty.' });
      return;
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    user.name = name.trim();
    await user.save();

    res.json({
      message: 'Profile updated successfully.',
      user: user.toJSON(),
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update profile.' });
  }
};
