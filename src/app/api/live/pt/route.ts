import { NextResponse } from 'next/server';
import { getLiveData } from '@/lib/data';

export async function GET() {
  try {
    const ptData = await getLiveData('pt');
    
    const response = {
      acf: {
        live: ptData
      }
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=5, s-maxage=5', // Cache por 5 segundos
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Erro na API PT:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/json',
        }
      }
    );
  }
} 