import { NextRequest, NextResponse } from 'next/server';
import { updateLiveData, getStorageStatus } from '@/lib/data';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Iniciando atualização de dados...');
    
    const body = await request.json();
    console.log('📥 Dados recebidos:', JSON.stringify(body, null, 2));
    
    const { live_pt, live_es } = body.acf;

    // Atualizar dados PT
    if (live_pt) {
      console.log('🇧🇷 Atualizando dados PT:', live_pt);
      await updateLiveData('pt', live_pt);
    }

    // Atualizar dados ES
    if (live_es) {
      console.log('🇪🇸 Atualizando dados ES:', live_es);
      await updateLiveData('es', live_es);
    }

    console.log('✅ Dados atualizados com sucesso');

    const storageStatus = getStorageStatus();

    return NextResponse.json({ 
      message: 'Dados atualizados com sucesso',
      data: body,
      environment: process.env.NODE_ENV,
      isVercel: process.env.VERCEL === '1',
      storage: storageStatus
    });
  } catch (error) {
    console.error('❌ Erro na atualização:', error);
    
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