import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = cookies();
  
  // Clear the authentication cookie
  cookieStore.delete('auth-token');

  return NextResponse.json({ message: 'Logout successful' });
} 