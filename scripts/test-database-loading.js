const BASE_URL = process.argv[2] || 'http://localhost:3000';

async function testDatabaseLoading() {
  console.log('🧪 Testando carregamento de dados do banco...\n');
  console.log(`📍 URL base: ${BASE_URL}\n`);

  // 1. Verificar informações de armazenamento
  console.log('1. Verificando informações de armazenamento...');
  try {
    const debugResponse = await fetch(`${BASE_URL}/api/debug/data`);
    const debugData = await debugResponse.json();
    
    console.log('   Ambiente:', debugData.environment);
    console.log('   É Vercel:', debugData.isVercel);
    console.log('   Tipo de armazenamento:', debugData.storage.storageType);
    console.log('   Banco disponível:', debugData.storage.hasDatabase);
    console.log('');
  } catch (error) {
    console.log('   ❌ Erro ao verificar debug:', error.message);
    console.log('');
  }

  // 2. Carregar dados do formulário
  console.log('2. Carregando dados do formulário...');
  try {
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
  } catch (error) {
    console.log('   ❌ Erro ao carregar dados:', error.message);
    console.log('');
  }

  // 3. Testar APIs individuais
  console.log('3. Testando APIs individuais...');
  
  try {
    const ptResponse = await fetch(`${BASE_URL}/api/live/pt`);
    const ptData = await ptResponse.json();
    console.log('   API PT:', ptResponse.status, ptData.acf ? '✅ Dados encontrados' : '❌ Sem dados');
  } catch (error) {
    console.log('   ❌ Erro API PT:', error.message);
  }

  try {
    const esResponse = await fetch(`${BASE_URL}/api/live/es`);
    const esData = await esResponse.json();
    console.log('   API ES:', esResponse.status, esData.acf ? '✅ Dados encontrados' : '❌ Sem dados');
  } catch (error) {
    console.log('   ❌ Erro API ES:', error.message);
  }

  console.log('');

  // 4. Simular carregamento de dados do formulário (como a página faz)
  console.log('4. Simulando carregamento de dados do formulário...');
  try {
    const response = await fetch(`${BASE_URL}/api/live/all`);
    if (response.ok) {
      const data = await response.json();
      const { pt, es } = data;
      
      console.log('   ✅ Dados carregados para o formulário:');
      console.log('   PT - Enabled:', pt.enabled);
      console.log('   PT - Title:', pt.title);
      console.log('   PT - VideoID:', pt.videoID);
      console.log('   ES - Enabled:', es.enabled);
      console.log('   ES - Title:', es.title);
      console.log('   ES - VideoID:', es.videoID);
    } else {
      console.log('   ❌ Erro ao carregar dados para formulário:', response.status);
    }
  } catch (error) {
    console.log('   ❌ Erro ao simular carregamento:', error.message);
  }

  console.log('\n🏁 Teste de carregamento concluído!');
}

// Executar teste
testDatabaseLoading().catch(console.error); 