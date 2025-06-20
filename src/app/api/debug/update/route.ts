import { NextRequest, NextResponse } from 'next/server';
import { updateLiveData, getStorageStatus } from '@/lib/data';
import { checkDatabaseConnection, getAllLiveDataFromDB } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Iniciando teste de atualização no banco...');
    
    const body = await request.json();
    console.log('📥 Dados recebidos:', JSON.stringify(body, null, 2));
    
    // Verificar status do banco
    const dbAvailable = await checkDatabaseConnection();
    console.log('🔍 Status do banco:', dbAvailable);
    
    // Verificar dados atuais
    console.log('📊 Dados atuais no banco:');
    const currentData = await getAllLiveDataFromDB();
    console.log('Dados atuais:', JSON.stringify(currentData, null, 2));
    
    const { live_pt, live_es } = body.acf;

    // Atualizar dados PT
    if (live_pt) {
      console.log('🇧🇷 Testando atualização PT:', live_pt);
      await updateLiveData('pt', live_pt);
    }

    // Atualizar dados ES
    if (live_es) {
      console.log('🇪🇸 Testando atualização ES:', live_es);
      await updateLiveData('es', live_es);
    }

    // Verificar dados após atualização
    console.log('📊 Dados após atualização:');
    const updatedData = await getAllLiveDataFromDB();
    console.log('Dados atualizados:', JSON.stringify(updatedData, null, 2));

    const storageStatus = getStorageStatus();

    return NextResponse.json({ 
      message: 'Teste de atualização concluído',
      data: body,
      environment: process.env.NODE_ENV,
      isVercel: process.env.VERCEL === '1',
      storage: storageStatus,
      databaseAvailable: dbAvailable,
      currentData,
      updatedData
    });
  } catch (error) {
    console.error('❌ Erro no teste de atualização:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        environment: process.env.NODE_ENV,
        isVercel: process.env.VERCEL === '1'
      },
      { status: 500 }
    );
  }
} 