import { NextResponse } from 'next/server';
import { initDatabase, checkDatabaseConnection } from '@/lib/db';

export async function POST() {
  try {
    console.log('🔄 Inicializando banco de dados...');
    
    // Verificar conexão
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      return NextResponse.json(
        { 
          error: 'Database connection failed',
          message: 'Não foi possível conectar ao banco de dados. Verifique as variáveis de ambiente.'
        },
        { status: 500 }
      );
    }
    
    // Inicializar banco
    await initDatabase();
    
    console.log('✅ Banco de dados inicializado com sucesso');
    
    return NextResponse.json({ 
      message: 'Database initialized successfully',
      environment: process.env.NODE_ENV,
      isVercel: process.env.VERCEL === '1'
    });
  } catch (error) {
    console.error('❌ Erro ao inicializar banco:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to initialize database',
        details: error instanceof Error ? error.message : 'Unknown error',
        environment: process.env.NODE_ENV,
        isVercel: process.env.VERCEL === '1'
      },
      { status: 500 }
    );
  }
} 