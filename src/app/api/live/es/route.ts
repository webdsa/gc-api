import { NextResponse } from 'next/server';
import { getLiveData, clearCache } from '@/lib/data';
import { recordESRequest, recordESError } from '@/lib/metrics';
import { performance } from 'perf_hooks';

export async function GET() {
  const startTime = performance.now();
  
  try {
    // Limpar cache para garantir dados mais recentes
    clearCache();
    console.log('🔄 Cache limpo para API ES - buscando dados mais recentes');
    
    const esData = await getLiveData('es', true); // Forçar dados frescos
    console.log('📊 Dados ES carregados:', esData);
    
    const response = {
      acf: {
        live: esData
      }
    };

    // Registrar métricas de sucesso
    const responseTime = performance.now() - startTime;
    recordESRequest(responseTime);

    return NextResponse.json(response, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Erro na API ES:', error);
    recordESError(); // Registrar erro nas métricas
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