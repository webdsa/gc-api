import { NextResponse } from 'next/server';
import { getMemoryData, getAllLiveData, getStorageStatus } from '@/lib/data';
import { checkDatabaseConnection } from '@/lib/db';

export async function GET() {
  try {
    const allData = await getAllLiveData();
    const memoryData = getMemoryData();
    const storageStatus = getStorageStatus();
    const dbConnection = await checkDatabaseConnection();
    
    return NextResponse.json({
      success: true,
      environment: process.env.NODE_ENV,
      isVercel: process.env.VERCEL === '1',
      storage: storageStatus,
      databaseConnection: dbConnection,
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