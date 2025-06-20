const BASE_URL = process.argv[2] || 'http://localhost:3000';

async function testApiCache() {
  console.log('🧪 Testando APIs sem cache...\n');
  console.log(`📍 URL base: ${BASE_URL}\n`);

  try {
    // 1. Primeira chamada - dados iniciais
    console.log('1. Primeira chamada - dados iniciais');
    
    const ptResponse1 = await fetch(`${BASE_URL}/api/live/pt`);
    const ptData1 = await ptResponse1.json();
    console.log('   API PT:', {
      status: ptResponse1.status,
      cacheControl: ptResponse1.headers.get('cache-control'),
      data: ptData1.acf?.live
    });
    
    const esResponse1 = await fetch(`${BASE_URL}/api/live/es`);
    const esData1 = await esResponse1.json();
    console.log('   API ES:', {
      status: esResponse1.status,
      cacheControl: esResponse1.headers.get('cache-control'),
      data: esData1.acf?.live
    });
    console.log('');

    // 2. Atualizar dados via API de update
    console.log('2. Atualizando dados via API de update...');
    const updateData = {
      acf: {
        live_pt: {
          enabled: true,
          title: 'Teste Cache PT - ' + new Date().toISOString(),
          videoID: 'cache_test_pt_' + Date.now(),
          description: 'Teste de cache PT - ' + new Date().toISOString()
        },
        live_es: {
          enabled: true,
          title: 'Teste Cache ES - ' + new Date().toISOString(),
          videoID: 'cache_test_es_' + Date.now(),
          description: 'Teste de cache ES - ' + new Date().toISOString()
        }
      }
    };
    
    const updateResponse = await fetch(`${BASE_URL}/api/live/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });
    
    if (updateResponse.ok) {
      console.log('   ✅ Dados atualizados com sucesso');
    } else {
      console.log('   ❌ Erro ao atualizar dados:', updateResponse.status);
    }
    console.log('');

    // 3. Segunda chamada - verificar se dados foram atualizados
    console.log('3. Segunda chamada - verificando dados atualizados');
    
    const ptResponse2 = await fetch(`${BASE_URL}/api/live/pt`);
    const ptData2 = await ptResponse2.json();
    console.log('   API PT:', {
      status: ptResponse2.status,
      cacheControl: ptResponse2.headers.get('cache-control'),
      data: ptData2.acf?.live
    });
    
    const esResponse2 = await fetch(`${BASE_URL}/api/live/es`);
    const esData2 = await esResponse2.json();
    console.log('   API ES:', {
      status: esResponse2.status,
      cacheControl: esResponse2.headers.get('cache-control'),
      data: esData2.acf?.live
    });
    console.log('');

    // 4. Comparar dados antes e depois
    console.log('4. Comparando dados antes e depois da atualização...');
    
    const ptChanged = JSON.stringify(ptData1.acf?.live) !== JSON.stringify(ptData2.acf?.live);
    const esChanged = JSON.stringify(esData1.acf?.live) !== JSON.stringify(esData2.acf?.live);
    
    if (ptChanged) {
      console.log('   ✅ Dados PT foram atualizados corretamente');
    } else {
      console.log('   ❌ Dados PT não foram atualizados (possível cache)');
    }
    
    if (esChanged) {
      console.log('   ✅ Dados ES foram atualizados corretamente');
    } else {
      console.log('   ❌ Dados ES não foram atualizados (possível cache)');
    }

    // 5. Verificar headers de cache
    console.log('\n5. Verificando headers de cache...');
    console.log('   PT Cache-Control:', ptResponse2.headers.get('cache-control'));
    console.log('   PT Pragma:', ptResponse2.headers.get('pragma'));
    console.log('   PT Expires:', ptResponse2.headers.get('expires'));
    console.log('   ES Cache-Control:', esResponse2.headers.get('cache-control'));
    console.log('   ES Pragma:', esResponse2.headers.get('pragma'));
    console.log('   ES Expires:', esResponse2.headers.get('expires'));

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }

  console.log('\n🏁 Teste de cache das APIs concluído!');
  console.log('\n💡 Resultado esperado:');
  console.log('- Headers devem ter no-cache, no-store, must-revalidate');
  console.log('- Dados devem ser atualizados imediatamente após mudança');
  console.log('- Não deve haver cache do Vercel ou navegador');
}

// Executar teste
testApiCache().catch(console.error); 