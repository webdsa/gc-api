import { promises as fs } from 'fs';
import path from 'path';
import { 
  getLiveDataFromDB, 
  updateLiveDataInDB, 
  getAllLiveDataFromDB, 
  initDatabase, 
  checkDatabaseConnection 
} from './db';

const DATA_FILE = path.join(process.cwd(), 'data', 'live-data.json');

// Cache em memória para melhorar performance
let cache: any = null;
let lastCacheUpdate = 0;
const CACHE_DURATION = 1000; // 1 segundo de cache

// Dados em memória para fallback
let memoryData: any = {
  pt: {
    enabled: false,
    title: "",
    videoID: "",
    description: "",
  },
  es: {
    enabled: false,
    title: "",
    videoID: "",
    description: "",
  },
};

// Detectar se estamos em produção (Vercel)
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

// Verificar se o banco está disponível
let databaseAvailable = false;

// Inicializar banco em produção
if (isProduction) {
  console.log('🚀 Inicializando banco de dados em produção...');
  console.log('🔍 Variáveis de ambiente:', {
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL,
    POSTGRES_URL: process.env.POSTGRES_URL ? 'Definida' : 'Não definida'
  });
  
  checkDatabaseConnection().then(available => {
    databaseAvailable = available;
    console.log('🔍 Status da conexão com banco:', available);
    
    if (available) {
      console.log('✅ Conexão com banco de dados estabelecida');
      initDatabase().then(() => {
        console.log('✅ Database inicializada com sucesso');
      }).catch(error => {
        console.error('❌ Erro ao inicializar database:', error);
      });
    } else {
      console.log('⚠️ Banco de dados não disponível, usando memória como fallback');
    }
  }).catch(error => {
    console.error('❌ Erro ao conectar com banco:', error);
    console.log('⚠️ Usando memória como fallback');
  });
}

// Carregar dados do arquivo (apenas para desenvolvimento)
const loadDataFromFile = async () => {
  try {
    const dataDir = path.dirname(DATA_FILE);
    try {
      await fs.access(dataDir);
    } catch {
      await fs.mkdir(dataDir, { recursive: true });
    }
    
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return {
      pt: { enabled: false, title: "", videoID: "", description: "" },
      es: { enabled: false, title: "", videoID: "", description: "" },
    };
  }
};

// Salvar dados no arquivo (apenas para desenvolvimento)
const saveDataToFile = async (data: any) => {
  if (isProduction) return;
  
  const dataDir = path.dirname(DATA_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
  
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
};

// Função para obter dados com cache
const getCachedData = async () => {
  const now = Date.now();
  
  if (cache && (now - lastCacheUpdate) < CACHE_DURATION) {
    return cache;
  }
  
  if (isProduction && databaseAvailable) {
    // Em produção com banco disponível, carregar do banco
    try {
      cache = await getAllLiveDataFromDB();
      console.log('📊 Dados carregados do banco de dados');
    } catch (error) {
      console.error('❌ Erro ao carregar do banco, usando memória:', error);
      cache = { ...memoryData };
    }
  } else if (isProduction) {
    // Em produção sem banco, usar memória
    cache = { ...memoryData };
    console.log('📊 Dados carregados da memória (fallback)');
  } else {
    // Em desenvolvimento, carregar do arquivo
    cache = await loadDataFromFile();
    console.log('📊 Dados carregados do arquivo');
  }
  
  lastCacheUpdate = now;
  return cache;
};

export const getLiveData = async (lang: 'pt' | 'es') => {
  const data = await getCachedData();
  return data[lang];
};

export const updateLiveData = async (lang: 'pt' | 'es', newData: any) => {
  console.log(`🔄 Iniciando atualização de dados ${lang}:`, {
    isProduction,
    databaseAvailable,
    newData,
    environment: process.env.NODE_ENV,
    vercel: process.env.VERCEL
  });
  
  if (isProduction && databaseAvailable) {
    // Em produção com banco disponível, salvar no banco
    try {
      console.log(`📝 Tentando salvar dados ${lang} no banco de dados...`);
      await updateLiveDataInDB(lang, newData);
      console.log(`✅ Dados ${lang} salvos no banco de dados com sucesso`);
      
      // Verificar se os dados foram realmente salvos
      const savedData = await getLiveDataFromDB(lang);
      console.log(`🔍 Dados ${lang} verificados após salvamento:`, savedData);
      
    } catch (error) {
      console.error(`❌ Erro ao salvar no banco, salvando em memória:`, error);
      // Fallback para memória
      memoryData[lang] = { ...memoryData[lang], ...newData };
      console.log(`📝 Dados ${lang} salvos em memória como fallback`);
    }
  } else if (isProduction) {
    // Em produção sem banco, salvar em memória
    console.log(`📝 Salvando dados ${lang} em memória (banco não disponível)`);
    memoryData[lang] = { ...memoryData[lang], ...newData };
    console.log(`✅ Dados ${lang} salvos em memória`);
  } else {
    // Em desenvolvimento, salvar no arquivo
    console.log(`📝 Salvando dados ${lang} no arquivo local`);
    const data = await getCachedData();
    data[lang] = { ...data[lang], ...newData };
    await saveDataToFile(data);
    console.log(`✅ Dados ${lang} salvos no arquivo`);
  }
  
  // Invalidar cache
  cache = null;
  lastCacheUpdate = 0;
  console.log(`🔄 Cache invalidado para dados ${lang}`);
  
  return newData;
};

export const getAllLiveData = async () => {
  return await getCachedData();
};

export const clearCache = () => {
  cache = null;
  lastCacheUpdate = 0;
};

export const getMemoryData = () => {
  return isProduction ? memoryData : null;
};

export const getStorageStatus = () => {
  return {
    environment: process.env.NODE_ENV,
    isVercel: process.env.VERCEL === '1',
    databaseAvailable,
    storageType: isProduction 
      ? (databaseAvailable ? 'Database' : 'Memory (Fallback)') 
      : 'File',
    hasDatabase: isProduction && databaseAvailable,
  };
}; 