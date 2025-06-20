const { sql } = require('@vercel/postgres');

async function testDatabaseUpdate() {
  console.log('🧪 Testando atualização no banco de dados...');
  
  try {
    // Testar conexão
    console.log('1. Testando conexão...');
    const connectionTest = await sql`SELECT 1 as test`;
    console.log('✅ Conexão OK:', connectionTest.rows[0]);
    
    // Verificar dados atuais
    console.log('\n2. Dados atuais no banco:');
    const currentData = await sql`
      SELECT language, enabled, title, video_id, description, updated_at
      FROM live_data 
      ORDER BY language
    `;
    console.log('📊 Dados atuais:', JSON.stringify(currentData.rows, null, 2));
    
    // Testar atualização PT
    console.log('\n3. Testando atualização PT...');
    const testDataPT = {
      enabled: true,
      title: 'Teste PT - ' + new Date().toISOString(),
      videoID: 'test_video_pt_' + Date.now(),
      description: 'Descrição de teste PT - ' + new Date().toISOString()
    };
    
    await sql`
      UPDATE live_data 
      SET 
        enabled = ${testDataPT.enabled},
        title = ${testDataPT.title},
        video_id = ${testDataPT.videoID},
        description = ${testDataPT.description},
        updated_at = NOW()
      WHERE language = 'pt'
    `;
    console.log('✅ Dados PT atualizados:', testDataPT);
    
    // Testar atualização ES
    console.log('\n4. Testando atualização ES...');
    const testDataES = {
      enabled: true,
      title: 'Teste ES - ' + new Date().toISOString(),
      videoID: 'test_video_es_' + Date.now(),
      description: 'Descripción de prueba ES - ' + new Date().toISOString()
    };
    
    await sql`
      UPDATE live_data 
      SET 
        enabled = ${testDataES.enabled},
        title = ${testDataES.title},
        video_id = ${testDataES.videoID},
        description = ${testDataES.description},
        updated_at = NOW()
      WHERE language = 'es'
    `;
    console.log('✅ Dados ES atualizados:', testDataES);
    
    // Verificar dados após atualização
    console.log('\n5. Dados após atualização:');
    const updatedData = await sql`
      SELECT language, enabled, title, video_id, description, updated_at
      FROM live_data 
      ORDER BY language
    `;
    console.log('📊 Dados atualizados:', JSON.stringify(updatedData.rows, null, 2));
    
    console.log('\n🎉 Teste de atualização concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    console.error('Detalhes do erro:', {
      message: error.message,
      code: error.code,
      detail: error.detail
    });
  }
}

// Executar teste
testDatabaseUpdate(); 