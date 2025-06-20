import { NextResponse } from 'next/server';
import { getAllLiveData, clearCache, getStorageStatus } from '@/lib/data';
import { checkDatabaseConnection, getAllLiveDataFromDB } from '@/lib/db';

export async function POST() {
  try {
    console.log('🔄 Forçando recarregamento dos dados...');
    
    // Limpar cache
    clearCache();
    console.log('🗑️ Cache limpo');
    
    // Verificar status do banco
    const dbAvailable = await checkDatabaseConnection();
    console.log('🔍 Status do banco:', dbAvailable);
    
    // Recarregar dados
    const data = await getAllLiveData();
    console.log('📊 Dados recarregados:', data);
    
    const storageStatus = getStorageStatus();

    return NextResponse.json({ 
      message: 'Dados recarregados com sucesso',
      data,
      databaseAvailable: dbAvailable,
      storage: storageStatus
    });
  } catch (error) {
    console.error('❌ Erro ao recarregar dados:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 