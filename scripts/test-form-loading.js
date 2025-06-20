const BASE_URL = process.argv[2] || 'http://localhost:3000';

async function testFormLoading() {
  console.log('🧪 Testando carregamento de dados do formulário...\n');
  console.log(`📍 URL base: ${BASE_URL}\n`);

  try {
    // 1. Verificar informações de armazenamento
    console.log('1. Verificando informações de armazenamento...');
    const debugResponse = await fetch(`${BASE_URL}/api/debug/data`);
    const debugData = await debugResponse.json();
    
    console.log('   Ambiente:', debugData.environment);
    console.log('   É Vercel:', debugData.isVercel);
    console.log('   Tipo de armazenamento:', debugData.storage.storageType);
    console.log('   Banco disponível:', debugData.storage.hasDatabase);
    console.log('');

    // 2. Carregar dados do formulário
    console.log('2. Carregando dados do formulário...');
    const dataResponse = await fetch(`${BASE_URL}/api/live/all`);
    const formData = await dataResponse.json();
    
    console.log('   ✅ Dados carregados com sucesso:');
    console.log('   PT:', {
      enabled: formData.pt.enabled,
      title: formData.pt.title,
      videoID: formData.pt.videoID,
      description: formData.pt.description?.substring(0, 50) + '...'
    });
    console.log('   ES:', {
      enabled: formData.es.enabled,
      title: formData.es.title,
      videoID: formData.es.videoID,
      description: formData.es.description?.substring(0, 50) + '...'
    });
    console.log('');

    // 3. Testar recarregamento forçado
    console.log('3. Testando recarregamento forçado...');
    const reloadResponse = await fetch(`${BASE_URL}/api/debug/reload`, {
      method: 'POST'
    });
    
    if (reloadResponse.ok) {
      const reloadData = await reloadResponse.json();
      console.log('   ✅ Recarregamento bem-sucedido');
      console.log('   Banco disponível:', reloadData.databaseAvailable);
      console.log('   Dados recarregados:', {
        pt: reloadData.data.pt,
        es: reloadData.data.es
      });
    } else {
      console.log('   ❌ Erro no recarregamento:', reloadResponse.status);
    }
    console.log('');

    // 4. Carregar dados novamente após recarregamento
    console.log('4. Carregando dados após recarregamento...');
    const dataResponse2 = await fetch(`${BASE_URL}/api/live/all`);
    const formData2 = await dataResponse2.json();
    
    console.log('   ✅ Dados após recarregamento:');
    console.log('   PT:', {
      enabled: formData2.pt.enabled,
      title: formData2.pt.title,
      videoID: formData2.pt.videoID,
      description: formData2.pt.description?.substring(0, 50) + '...'
    });
    console.log('   ES:', {
      enabled: formData2.es.enabled,
      title: formData2.es.title,
      videoID: formData2.es.videoID,
      description: formData2.es.description?.substring(0, 50) + '...'
    });
    console.log('');

    // 5. Verificar se os dados mudaram
    console.log('5. Comparando dados antes e depois do recarregamento...');
    const ptChanged = JSON.stringify(formData.pt) !== JSON.stringify(formData2.pt);
    const esChanged = JSON.stringify(formData.es) !== JSON.stringify(formData2.es);
    
    if (ptChanged || esChanged) {
      console.log('   ⚠️ Dados mudaram após recarregamento');
      if (ptChanged) console.log('   - PT: Dados diferentes');
      if (esChanged) console.log('   - ES: Dados diferentes');
    } else {
      console.log('   ✅ Dados consistentes antes e depois do recarregamento');
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }

  console.log('\n🏁 Teste de carregamento do formulário concluído!');
  console.log('\n💡 Próximos passos:');
  console.log('1. Verifique se os dados aparecem corretamente no formulário');
  console.log('2. Use o botão "🔄 Recarregar Dados" na interface');
  console.log('3. Verifique os logs do servidor para mais detalhes');
}

// Executar teste
testFormLoading().catch(console.error); 