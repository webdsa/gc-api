import { NextResponse } from 'next/server';
import { getLiveData, clearCache } from '@/lib/data';
import { recordPTRequest, recordPTError } from '@/lib/metrics';
import { performance } from 'perf_hooks';

export async function GET() {
  const startTime = performance.now();
  
  try {
    // Limpar cache para garantir dados mais recentes
    clearCache();
    console.log('🔄 Cache limpo para API PT - buscando dados mais recentes');
    
    const ptData = await getLiveData('pt', true); // Forçar dados frescos
    console.log('📊 Dados PT carregados:', ptData);
    
    const response = {
      acf: {
        live: ptData
      }
    };

    // Registrar métricas de sucesso
    const responseTime = performance.now() - startTime;
    recordPTRequest(responseTime);

    return NextResponse.json(response, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Erro na API PT:', error);
    recordPTError(); // Registrar erro nas métricas
    return NextResponse.json(
      { error: 'Internal server error' },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Content-Type': 'application/json',
        }
      }
    );
  }
} 