import { NextRequest, NextResponse } from 'next/server';
import { updateLiveData } from '@/lib/data';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { live_pt, live_es } = body.acf;

    // Atualizar dados PT
    if (live_pt) {
      await updateLiveData('pt', live_pt);
    }

    // Atualizar dados ES
    if (live_es) {
      await updateLiveData('es', live_es);
    }

    return NextResponse.json({ 
      message: 'Dados atualizados com sucesso',
      data: body 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 