import { NextResponse } from 'next/server';
import { getMemoryData, getAllLiveData } from '@/lib/data';

export async function GET() {
  try {
    const allData = await getAllLiveData();
    const memoryData = getMemoryData();
    
    return NextResponse.json({
      success: true,
      environment: process.env.NODE_ENV,
      isVercel: process.env.VERCEL === '1',
      currentData: allData,
      memoryData: memoryData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Erro ao obter dados de debug:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to get debug data',
        details: error instanceof Error ? error.message : 'Unknown error',
        environment: process.env.NODE_ENV,
        isVercel: process.env.VERCEL === '1'
      },
      { status: 500 }
    );
  }
} 