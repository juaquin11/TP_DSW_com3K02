// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import { registerUser, loginUser } from '../services/auth.service';

export async function register(req: Request, res: Response) {
  try {
    const { name, email, phone, password, type } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });

    const { user, token } = await registerUser(name ?? null, email, phone ?? null, password, type ?? 'client');
    res.status(201).json({ user, token });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });

    const data = await loginUser(email, password);
    res.json(data);
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
}
