import { Request, Response } from 'express';
import * as svc from './auth.service';

export async function signUp(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    const user = await svc.signUp(email, password);
    res.status(201).json({ user });
  } catch (err: any) {
    console.error("SIGNUP ERROR:", err);
    res.status(400).json({ message: err.message || "Signup failed" });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    const out = await svc.login(email, password);
    res.json(out);
  } catch (err: any) {
    console.error("LOGIN ERROR:", err);
    res.status(400).json({ message: err.message || "Login failed" });
  }
}

export async function refreshToken(req: Request, res: Response) {
  const { refresh } = req.body;

  try {
    const out = await svc.refresh(refresh);
    res.json(out);
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
}

export async function logout(req: Request, res: Response) {
  const { refresh } = req.body;

  try {
    await svc.logout(refresh);
    res.json({ message: 'Logged out successfully' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false,
        message: 'Email is required' 
      });
    }

    const result = await svc.forgotPassword(email);
    res.json(result);

  } catch (err: any) {
    console.error("FORGOT PASSWORD ERROR:", err);
    res.status(500).json({ 
      success: false,
      message: 'An error occurred. Please try again later.' 
    });
  }
}

export async function resetPassword(req: Request, res: Response) {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ 
        success: false,
        message: 'Token and new password are required' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: 'Password must be at least 6 characters' 
      });
    }

    const result = await svc.resetPassword(token, newPassword);
    res.json(result);

  } catch (err: any) {
    console.error("RESET PASSWORD ERROR:", err);
    res.status(400).json({ 
      success: false,
      message: err.message || 'Failed to reset password' 
    });
  }
}