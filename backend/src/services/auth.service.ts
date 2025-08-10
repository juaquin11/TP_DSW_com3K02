import prisma from '../prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'change_me';
const SALT_ROUNDS = 10;

export async function registerUser(name: string | null, email: string, phone: string | null, password: string, type: 'client' | 'owner' = 'client') {
  const existing = await prisma.useraccount.findUnique({ where: { email } });
  if (existing) throw new Error('Email already registered');

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.useraccount.create({
    data: {
      name,
      email,
      phone: phone ?? '',
      type,
      // field names must exist in your model; we assume password_hash was added
      password_hash: hashed,
    },
  });

  const token = jwt.sign({ id_user: user.id_user, type: user.type }, JWT_SECRET, { expiresIn: '2h' });

  return { user, token };
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.useraccount.findUnique({ where: { email } });
  if (!user || !user.password_hash) throw new Error('Invalid credentials');

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) throw new Error('Invalid credentials');

  const token = jwt.sign({ id_user: user.id_user, type: user.type }, JWT_SECRET, { expiresIn: '2h' });
  return { user, token };
}
