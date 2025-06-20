"use client";
import { useState, useEffect } from "react";

export default function Home() {
  // PT
  const [enabledPT, setEnabledPT] = useState(false);
  const [titlePT, setTitlePT] = useState("");
  const [videoIDPT, setVideoIDPT] = useState("");
  const [descriptionPT, setDescriptionPT] = useState("");
  // ES
  const [enabledES, setEnabledES] = useState(false);
  const [titleES, setTitleES] = useState("");
  const [videoIDES, setVideoIDES] = useState("");
  const [descriptionES, setDescriptionES] = useState("");

  const [showJson, setShowJson] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [copyMessage, setCopyMessage] = useState("");
  const [apiStatus, setApiStatus] = useState({ pt: false, es: false, test: false });
  const [storageInfo, setStorageInfo] = useState<any>(null);

  // Carregar dados do arquivo quando a página carregar
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🔄 Carregando dados do formulário...');
        const response = await fetch('/api/live/all');
        if (response.ok) {
          const data = await response.json();
          const { pt, es } = data;
          
          console.log('📥 Dados carregados:', { pt, es });
          
          // Atualizar dados PT
          setEnabledPT(pt.enabled);
          setTitlePT(pt.title);
          setVideoIDPT(pt.videoID);
          setDescriptionPT(pt.description);
          
          // Atualizar dados ES
          setEnabledES(es.enabled);
          setTitleES(es.title);
          setVideoIDES(es.videoID);
          setDescriptionES(es.description);
          
          console.log('✅ Dados do formulário carregados com sucesso');
        } else {
          console.error('❌ Erro ao carregar dados:', response.status);
        }
      } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    const loadStorageInfo = async () => {
      try {
        const response = await fetch('/api/debug/data');
        if (response.ok) {
          const data = await response.json();
          setStorageInfo(data.storage);
          console.log('📊 Informações de armazenamento:', data.storage);
        }
      } catch (error) {
        console.error('❌ Erro ao carregar informações de armazenamento:', error);
      }
    };

    loadData();
    loadStorageInfo();
  }, []);

  // Função para recarregar dados
  const reloadData = async () => {
    setIsLoadingData(true);
    try {
      console.log('🔄 Forçando recarregamento dos dados...');
      
      // Forçar recarregamento no servidor
      const reloadResponse = await fetch('/api/debug/reload', {
        method: 'POST'
      });
      
      if (reloadResponse.ok) {
        const reloadData = await reloadResponse.json();
        console.log('📊 Dados recarregados no servidor:', reloadData);
      }
      
      // Recarregar dados no formulário
      const response = await fetch('/api/live/all');
      if (response.ok) {
        const data = await response.json();
        const { pt, es } = data;
        
        console.log('📥 Dados recarregados no formulário:', { pt, es });
        
        // Atualizar dados PT
        setEnabledPT(pt.enabled);
        setTitlePT(pt.title);
        setVideoIDPT(pt.videoID);
        setDescriptionPT(pt.description);
        
        // Atualizar dados ES
        setEnabledES(es.enabled);
        setTitleES(es.title);
        setVideoIDES(es.videoID);
        setDescriptionES(es.description);
        
        console.log('✅ Dados do formulário recarregados com sucesso');
        alert('Dados recarregados com sucesso!');
      } else {
        console.error('❌ Erro ao recarregar dados:', response.status);
        alert('Erro ao recarregar dados!');
      }
    } catch (error) {
      console.error('❌ Erro ao recarregar dados:', error);
      alert('Erro ao recarregar dados!');
    } finally {
      setIsLoadingData(false);
    }
  };

  // Testar status das APIs
  useEffect(() => {
    const testApis = async () => {
      const apis = [
        { name: 'pt', url: '/api/live/pt' },
        { name: 'es', url: '/api/live/es' },
        { name: 'test', url: '/api/test' }
      ];

      for (const api of apis) {
        try {
          const response = await fetch(api.url);
          setApiStatus(prev => ({
            ...prev,
            [api.name]: response.ok
          }));
        } catch (error) {
          setApiStatus(prev => ({
            ...prev,
            [api.name]: false
          }));
        }
      }
    };

    testApis();
  }, []);

  const jsonResult = {
    acf: {
      live_pt: {
        enabled: enabledPT,
        title: titlePT,
        videoID: videoIDPT,
        description: descriptionPT,
      },
      live_es: {
        enabled: enabledES,
        title: titleES,
        videoID: videoIDES,
        description: descriptionES,
      },
    },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch('/api/live/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jsonResult),
      });

      const responseData = await response.json();

      if (response.ok) {
        setMessage("Dados salvos com sucesso!");
        setShowJson(true);
        console.log('✅ Resposta do servidor:', responseData);
      } else {
        console.error('❌ Erro na resposta:', responseData);
        setMessage(`Erro ao salvar os dados: ${responseData.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('❌ Erro na requisição:', error);
      setMessage(`Erro ao salvar os dados: ${error instanceof Error ? error.message : 'Erro de rede'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyMessage(`${label} copiado!`);
      setTimeout(() => setCopyMessage(""), 2000);
    } catch (error) {
      setCopyMessage("Erro ao copiar");
      setTimeout(() => setCopyMessage(""), 2000);
    }
  };

  if (isLoadingData) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-lg">Carregando dados...</div>
      </main>
    );
  }

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Gerador de JSON para Live (PT & ES)</h1>
          <p className="text-gray-600 mt-2">Configure os dados para as APIs de transmissão ao vivo</p>
        </div>
        
        {/* Status das APIs */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Status das APIs (Públicas)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded ${apiStatus.pt ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'} border`}>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${apiStatus.pt ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="font-semibold">API PT</span>
              </div>
              <p className="text-sm mt-1">{apiStatus.pt ? 'Online' : 'Offline'}</p>
            </div>
            <div className={`p-4 rounded ${apiStatus.es ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'} border`}>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${apiStatus.es ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="font-semibold">API ES</span>
              </div>
              <p className="text-sm mt-1">{apiStatus.es ? 'Online' : 'Offline'}</p>
            </div>
            <div className={`p-4 rounded ${apiStatus.test ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'} border`}>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${apiStatus.test ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="font-semibold">API Test</span>
              </div>
              <p className="text-sm mt-1">{apiStatus.test ? 'Online' : 'Offline'}</p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="w-full bg-white rounded shadow p-6 flex flex-col items-center"
        >
          <div className="w-full flex flex-col md:flex-row gap-8">
            {/* PT Formulário */}
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-4">Português (PT)</h2>
              <label className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={enabledPT}
                  onChange={(e) => setEnabledPT(e.target.checked)}
                  className="form-checkbox h-5 w-5 text-indigo-600"
                />
                Live habilitada
              </label>
              <div className="mb-2">
                <label className="block text-sm font-medium mb-1">Título</label>
                <input
                  type="text"
                  value={titlePT}
                  onChange={(e) => setTitlePT(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium mb-1">Video ID</label>
                <input
                  type="text"
                  value={videoIDPT}
                  onChange={(e) => setVideoIDPT(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium mb-1">Descrição</label>
                <textarea
                  value={descriptionPT}
                  onChange={(e) => setDescriptionPT(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  rows={5}
                  required
                />
              </div>
            </div>
            {/* ES Formulário */}
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-4">Español (ES)</h2>
              <label className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={enabledES}
                  onChange={(e) => setEnabledES(e.target.checked)}
                  className="form-checkbox h-5 w-5 text-indigo-600"
                />
                Live habilitada
              </label>
              <div className="mb-2">
                <label className="block text-sm font-medium mb-1">Título</label>
                <input
                  type="text"
                  value={titleES}
                  onChange={(e) => setTitleES(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium mb-1">Video ID</label>
                <input
                  type="text"
                  value={videoIDES}
                  onChange={(e) => setVideoIDES(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium mb-1">Descrição</label>
                <textarea
                  value={descriptionES}
                  onChange={(e) => setDescriptionES(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  rows={5}
                  required
                />
              </div>
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="mt-8 bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 text-lg font-semibold disabled:opacity-50"
          >
            {isLoading ? "Salvando..." : "Atualizar"}
          </button>
          {message && (
            <div className={`mt-4 text-sm ${message.includes('sucesso') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </div>
          )}
        </form>

        {/* Rotas das APIs */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Rotas das APIs (Públicas)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-semibold mb-2">API Português (PT)</h3>
              <div className="flex items-center gap-2">
                <code className="bg-gray-100 px-2 py-1 rounded text-sm flex-1">
                  {baseUrl}/api/live/pt
                </code>
                <button
                  onClick={() => copyToClipboard(`${baseUrl}/api/live/pt`, 'URL PT')}
                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                >
                  Copiar
                </button>
              </div>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-semibold mb-2">API Español (ES)</h3>
              <div className="flex items-center gap-2">
                <code className="bg-gray-100 px-2 py-1 rounded text-sm flex-1">
                  {baseUrl}/api/live/es
                </code>
                <button
                  onClick={() => copyToClipboard(`${baseUrl}/api/live/es`, 'URL ES')}
                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                >
                  Copiar
                </button>
              </div>
            </div>
          </div>
          {copyMessage && (
            <div className="mt-2 text-sm text-green-600 text-center">{copyMessage}</div>
          )}
        </div>

        {showJson && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-2">Resultado:</h2>
            <pre className="bg-white p-4 rounded shadow text-sm overflow-x-auto">
              {JSON.stringify(jsonResult, null, 2)}
            </pre>
          </div>
        )}

        {/* Informações de Armazenamento */}
        {storageInfo && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Informações de Armazenamento</h2>
            <div className="bg-white p-4 rounded shadow">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Ambiente</p>
                  <p className="font-semibold">{storageInfo.environment}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tipo de Armazenamento</p>
                  <p className="font-semibold">
                    {storageInfo.storageType === 'Database' && (
                      <span className="text-green-600">🟢 Neon Database</span>
                    )}
                    {storageInfo.storageType === 'Memory (Fallback)' && (
                      <span className="text-yellow-600">🟡 Memória (Fallback)</span>
                    )}
                    {storageInfo.storageType === 'File' && (
                      <span className="text-blue-600">🔵 Arquivo Local</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Banco Disponível</p>
                  <p className="font-semibold">
                    {storageInfo.hasDatabase ? (
                      <span className="text-green-600">✅ Sim</span>
                    ) : (
                      <span className="text-red-600">❌ Não</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">É Vercel</p>
                  <p className="font-semibold">
                    {storageInfo.isVercel ? (
                      <span className="text-green-600">✅ Sim</span>
                    ) : (
                      <span className="text-gray-600">❌ Não (Local)</span>
                    )}
                  </p>
                </div>
              </div>
              {storageInfo.storageType === 'Database' && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                  <p className="text-sm text-green-800">
                    ✅ Os dados estão sendo carregados e salvos no <strong>Neon Database</strong>
                  </p>
                </div>
              )}
              {storageInfo.storageType === 'Memory (Fallback)' && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Os dados estão sendo salvos em memória (banco não disponível)
                  </p>
                </div>
              )}
              {storageInfo.storageType === 'File' && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm text-blue-800">
                    ℹ️ Os dados estão sendo salvos em arquivo local (desenvolvimento)
                  </p>
                </div>
              )}
              
              {/* Botão de teste para banco */}
              {storageInfo.hasDatabase && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={async () => {
                      try {
                        const testData = {
                          acf: {
                            live_pt: {
                              enabled: true,
                              title: 'Teste PT - ' + new Date().toISOString(),
                              videoID: 'test_pt_' + Date.now(),
                              description: 'Descrição de teste PT'
                            },
                            live_es: {
                              enabled: true,
                              title: 'Teste ES - ' + new Date().toISOString(),
                              videoID: 'test_es_' + Date.now(),
                              description: 'Descripción de prueba ES'
                            }
                          }
                        };
                        
                        const response = await fetch('/api/debug/update', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(testData)
                        });
                        
                        const result = await response.json();
                        console.log('🧪 Resultado do teste de atualização:', result);
                        alert('Teste de atualização concluído! Verifique o console para detalhes.');
                      } catch (error) {
                        console.error('❌ Erro no teste:', error);
                        alert('Erro no teste de atualização! Verifique o console.');
                      }
                    }}
                    className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-sm"
                  >
                    🧪 Testar Atualização no Banco
                  </button>
                  
                  <button
                    onClick={reloadData}
                    disabled={isLoadingData}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm disabled:opacity-50"
                  >
                    {isLoadingData ? '🔄 Recarregando...' : '🔄 Recarregar Dados'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
} 