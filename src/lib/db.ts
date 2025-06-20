import { sql } from '@vercel/postgres';

export async function initDatabase() {
  try {
    // Criar tabela se não existir
    await sql`
      CREATE TABLE IF NOT EXISTS live_data (
        id SERIAL PRIMARY KEY,
        language VARCHAR(2) NOT NULL UNIQUE,
        enabled BOOLEAN DEFAULT false,
        title TEXT,
        video_id TEXT,
        description TEXT,
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Inserir dados iniciais se não existirem
    await sql`
      INSERT INTO live_data (language, enabled, title, video_id, description) 
      VALUES 
        ('pt', false, '', '', ''),
        ('es', false, '', '', '')
      ON CONFLICT (language) DO NOTHING
    `;

    console.log('✅ Database inicializada com sucesso');
  } catch (error) {
    console.error('❌ Erro ao inicializar database:', error);
    throw error;
  }
}

export async function getLiveDataFromDB(lang: 'pt' | 'es') {
  try {
    const result = await sql`
      SELECT enabled, title, video_id, description 
      FROM live_data 
      WHERE language = ${lang}
    `;
    
    if (result.rows.length === 0) {
      return {
        enabled: false,
        title: "",
        videoID: "",
        description: "",
      };
    }
    
    const row = result.rows[0];
    return {
      enabled: row.enabled,
      title: row.title || "",
      videoID: row.video_id || "",
      description: row.description || "",
    };
  } catch (error) {
    console.error(`❌ Erro ao carregar dados ${lang} do banco:`, error);
    // Retornar dados padrão em caso de erro
    return {
      enabled: false,
      title: "",
      videoID: "",
      description: "",
    };
  }
}

export async function updateLiveDataInDB(lang: 'pt' | 'es', data: any) {
  try {
    await sql`
      UPDATE live_data 
      SET 
        enabled = ${data.enabled || false},
        title = ${data.title || ''},
        video_id = ${data.videoID || ''},
        description = ${data.description || ''},
        updated_at = NOW()
      WHERE language = ${lang}
    `;
    
    console.log(`📝 Dados ${lang} salvos no banco:`, data);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao salvar dados ${lang} no banco:`, error);
    throw error;
  }
}

export async function getAllLiveDataFromDB() {
  try {
    const result = await sql`
      SELECT language, enabled, title, video_id, description 
      FROM live_data 
      ORDER BY language
    `;
    
    const data: any = {
      pt: { enabled: false, title: "", videoID: "", description: "" },
      es: { enabled: false, title: "", videoID: "", description: "" },
    };
    
    result.rows.forEach(row => {
      const lang = row.language as 'pt' | 'es';
      data[lang] = {
        enabled: row.enabled,
        title: row.title || "",
        videoID: row.video_id || "",
        description: row.description || "",
      };
    });
    
    return data;
  } catch (error) {
    console.error('❌ Erro ao carregar todos os dados do banco:', error);
    // Retornar dados padrão em caso de erro
    return {
      pt: { enabled: false, title: "", videoID: "", description: "" },
      es: { enabled: false, title: "", videoID: "", description: "" },
    };
  }
}

export async function checkDatabaseConnection() {
  try {
    const result = await sql`SELECT 1 as test`;
    return result.rows.length > 0;
  } catch (error) {
    console.error('❌ Erro na conexão com o banco:', error);
    return false;
  }
} 