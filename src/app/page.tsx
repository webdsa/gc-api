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

  // Carregar dados do arquivo quando a página carregar
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/api/live/all');
        if (response.ok) {
          const data = await response.json();
          const { pt, es } = data;
          
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
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
  }, []);

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

      if (response.ok) {
        setMessage("Dados salvos com sucesso!");
        setShowJson(true);
      } else {
        setMessage("Erro ao salvar os dados");
      }
    } catch (error) {
      setMessage("Erro ao salvar os dados");
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
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-6">Gerador de JSON para Live (PT & ES)</h1>
      
      {/* Status das APIs */}
      <div className="w-full max-w-5xl mb-6">
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
        className="w-full max-w-5xl bg-white rounded shadow p-6 flex flex-col items-center"
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
      <div className="mt-8 w-full max-w-5xl">
        <h2 className="text-xl font-semibold mb-4">Rotas das APIs (Públicas)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold mb-2">API Português (PT)</h3>
            <div className="flex items-center gap-2">
              <code className="bg-white px-2 py-1 rounded text-sm flex-1">
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
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold mb-2">API Español (ES)</h3>
            <div className="flex items-center gap-2">
              <code className="bg-white px-2 py-1 rounded text-sm flex-1">
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
        <div className="mt-8 w-full max-w-5xl">
          <h2 className="text-xl font-semibold mb-2">Resultado:</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
            {JSON.stringify(jsonResult, null, 2)}
          </pre>
        </div>
      )}
    </main>
  );
} 