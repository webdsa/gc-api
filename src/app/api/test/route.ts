import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'API pública funcionando!',
    timestamp: new Date().toISOString(),
    status: 'success'
  }, {
    headers: {
      'Cache-Control': 'public, max-age=5',
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
} 