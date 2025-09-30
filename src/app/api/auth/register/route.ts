import { NextResponse } from 'next/server';
import { usersDB } from '@/app/lib/users';
import bcrypt from 'bcryptjs';

// WARNING: This is a mock registration endpoint for demonstration purposes.
// Do NOT use this in a production environment.
// Passwords are not hashed and are stored in-memory.

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
    }

    const existingUser = usersDB.findByEmail(email);
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 409 });
    }

  // Hash the password before saving.
  const salt = bcrypt.genSaltSync(10);
  const hashed = bcrypt.hashSync(password, salt);
  usersDB.create({ name, email, password: hashed });

    return NextResponse.json({ message: 'User created successfully' }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ message: msg || 'Something went wrong' }, { status: 500 });
  }
}
