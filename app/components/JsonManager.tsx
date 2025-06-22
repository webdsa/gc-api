'use client';

import { useState, useEffect } from 'react';
import { FormData } from '../types';
import LanguageForm from './LanguageForm';

export default function JsonManager() {
  const [ptData, setPtData] = useState<FormData>({
    acf: {
      year: 2022,
      live: {
        enabled: false,
        title: '',
        videoID: '',
        description: ''
      }
    }
  });

  const [esData, setEsData] = useState<FormData>({
    acf: {
      year: 2022,
      live: {
        enabled: false,
        title: '',
        videoID: '',
        description: ''
      }
    }
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [jsonOutput, setJsonOutput] = useState<{pt?: string, es?: string}>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const timestamp = new Date().getTime();
        const [ptResponse, esResponse] = await Promise.all([
          fetch(
            `https://s3.amazonaws.com/gc.adventistas.org/live/pt_BR-2025.json?t=${timestamp}`,
            {
              headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
              },
              cache: 'no-store'
            }
          ),
          fetch(
            `https://s3.amazonaws.com/gc.adventistas.org/live/es_ES-2025.json?t=${timestamp}`,
            {
              headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
              },
              cache: 'no-store'
            }
          )
        ]);

        if (!ptResponse.ok || !esResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const [ptJson, esJson] = await Promise.all([
          ptResponse.json(),
          esResponse.json()
        ]);

        setPtData(ptJson);
        setEsData(esJson);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load initial data');
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (window.confirm('Do you want to update both language files in S3?')) {
      setUploadStatus('loading');
      try {
        const responses = await Promise.all([
          fetch('/api/upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            },
            body: JSON.stringify({
              language: 'pt_BR',
              data: ptData
            }),
          }),
          fetch('/api/upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            },
            body: JSON.stringify({
              language: 'es_ES',
              data: esData
            }),
          })
        ]);

        if (!responses.every(r => r.ok)) {
          throw new Error('Failed to upload to S3');
        }

        setJsonOutput({
          pt: JSON.stringify(ptData, null, 2),
          es: JSON.stringify(esData, null, 2)
        });
        setUploadStatus('success');
        setTimeout(() => setUploadStatus('idle'), 3000);
      } catch (err) {
        setUploadStatus('error');
        console.error('Error uploading to S3:', err);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-gray-600">Carregando dados...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <LanguageForm
            language="pt_BR"
            title="Português"
            formData={ptData}
            onChange={setPtData}
          />
          <LanguageForm
            language="es_ES"
            title="Español"
            formData={esData}
            onChange={setEsData}
          />
        </div>

        <div className="sticky bottom-0 py-4 px-6 -mx-4">
          <button
            type="submit"
            disabled={uploadStatus === 'loading'}
            className={`w-full max-w-md mx-auto block rounded-md border border-transparent py-3 px-6 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              uploadStatus === 'loading'
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
            }`}
          >
            {uploadStatus === 'loading' ? 'Uploading...' : 'Save All Changes'}
          </button>

          {uploadStatus === 'success' && (
            <div className="mt-4 max-w-md mx-auto bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              Files successfully uploaded to S3!
            </div>
          )}

          {uploadStatus === 'error' && (
            <div className="mt-4 max-w-md mx-auto bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              Failed to upload files to S3. Please try again.
            </div>
          )}
        </div>
      </form>

      {(jsonOutput.pt || jsonOutput.es) && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {jsonOutput.pt && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Portuguese JSON:</h3>
              <pre className="bg-gray-100 p-6 rounded-md overflow-auto">
                {jsonOutput.pt}
              </pre>
            </div>
          )}
          {jsonOutput.es && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Spanish JSON:</h3>
              <pre className="bg-gray-100 p-6 rounded-md overflow-auto">
                {jsonOutput.es}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 