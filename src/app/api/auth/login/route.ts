import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// ==========================================
// ALTERE AQUI O USUÁRIO E SENHA DE LOGIN
// ==========================================
const VALID_CREDENTIALS = {
  username: 'admin',        // ← Altere o usuário aqui
  password: 'password123',  // ← Altere a senha aqui
};
// ==========================================

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Validate credentials
    if (
      username === VALID_CREDENTIALS.username &&
      password === VALID_CREDENTIALS.password
    ) {
      // Set authentication cookie
      const cookieStore = cookies();
      cookieStore.set('auth-token', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return NextResponse.json({ message: 'Login successful' });
    } else {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 