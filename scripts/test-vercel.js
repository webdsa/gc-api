const BASE_URL = process.argv[2] || 'http://localhost:3000';

async function testVercel() {
  console.log('🧪 Testando funcionalidade na Vercel com Neon Database...\n');
  console.log(`📍 URL base: ${BASE_URL}\n`);

  // 1. Verificar ambiente e dados atuais
  console.log('1. Verificando ambiente e dados atuais...');
  try {
    const debugResponse = await fetch(`${BASE_URL}/api/debug/data`);
    const debugData = await debugResponse.json();
    
    console.log('   Ambiente:', debugData.environment);
    console.log('   É Vercel:', debugData.isVercel);
    console.log('   Conexão com banco:', debugData.databaseConnection ? '✅ Conectado' : '❌ Não conectado');
    console.log('   Tipo de armazenamento:', debugData.storage.storageType);
    console.log('   Dados atuais:', JSON.stringify(debugData.currentData, null, 2));
    console.log('');
  } catch (error) {
    console.log('   ❌ Erro ao verificar debug:', error.message);
    console.log('');
  }

  // 2. Inicializar banco se necessário
  console.log('2. Verificando inicialização do banco...');
  try {
    const initResponse = await fetch(`${BASE_URL}/api/init-db`, {
      method: 'POST',
    });
    const initResult = await initResponse.json();
    
    if (initResponse.ok) {
      console.log('   ✅ Banco inicializado com sucesso');
    } else {
      console.log('   ⚠️ Banco já inicializado ou erro:', initResult.message);
    }
    console.log('');
  } catch (error) {
    console.log('   ❌ Erro ao inicializar banco:', error.message);
    console.log('');
  }

  // 3. Testar atualização de dados
  console.log('3. Testando atualização de dados...');
  const testData = {
    acf: {
      live_pt: {
        enabled: true,
        title: "Teste PT - " + new Date().toISOString(),
        videoID: "test_pt_123",
        description: "Descrição de teste PT"
      },
      live_es: {
        enabled: false,
        title: "Teste ES - " + new Date().toISOString(),
        videoID: "test_es_456",
        description: "Descripción de prueba ES"
      }
    }
  };

  try {
    const updateResponse = await fetch(`${BASE_URL}/api/live/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const updateResult = await updateResponse.json();
    
    if (updateResponse.ok) {
      console.log('   ✅ Atualização bem-sucedida!');
      console.log('   Tipo de armazenamento usado:', updateResult.storage.storageType);
      console.log('   Resposta:', JSON.stringify(updateResult, null, 2));
    } else {
      console.log('   ❌ Erro na atualização:');
      console.log('   Status:', updateResponse.status);
      console.log('   Resposta:', JSON.stringify(updateResult, null, 2));
    }
    console.log('');
  } catch (error) {
    console.log('   ❌ Erro na requisição de atualização:', error.message);
    console.log('');
  }

  // 4. Verificar dados após atualização
  console.log('4. Verificando dados após atualização...');
  try {
    const debugResponse2 = await fetch(`${BASE_URL}/api/debug/data`);
    const debugData2 = await debugResponse2.json();
    
    console.log('   Dados após atualização:', JSON.stringify(debugData2.currentData, null, 2));
    console.log('');
  } catch (error) {
    console.log('   ❌ Erro ao verificar dados após atualização:', error.message);
    console.log('');
  }

  // 5. Testar APIs de dados
  console.log('5. Testando APIs de dados...');
  
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

  console.log('\n🏁 Teste concluído!');
}

// Executar teste
testVercel().catch(console.error); 