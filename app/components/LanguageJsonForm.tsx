'use client';

import { useState, useEffect } from 'react';
import { FormData } from '../types';

interface LanguageJsonFormProps {
  language: 'pt_BR' | 'es_ES';
  title: string;
}

export default function LanguageJsonForm({ language, title }: LanguageJsonFormProps) {
  const [formData, setFormData] = useState<FormData>({
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

  const [jsonOutput, setJsonOutput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const timestamp = new Date().getTime();
        const response = await fetch(
          `https://s3.amazonaws.com/gc.adventistas.org/live/${language}-2025.json?t=${timestamp}`,
          {
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            },
            cache: 'no-store'
          }
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setFormData(data);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load initial data');
        setIsLoading(false);
      }
    };

    fetchData();
  }, [language]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (window.confirm(`Do you want to update the ${language} file in S3?`)) {
      setUploadStatus('loading');
      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          body: JSON.stringify({
            language,
            data: formData
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to upload to S3');
        }

        // Mostra o JSON após o upload bem-sucedido
        setJsonOutput(JSON.stringify(formData, null, 2));
        setUploadStatus('success');
        setTimeout(() => setUploadStatus('idle'), 3000);

        // Recarrega os dados após o upload bem-sucedido
        const timestamp = new Date().getTime();
        const refreshResponse = await fetch(
          `https://s3.amazonaws.com/gc.adventistas.org/live/${language}-2025.json?t=${timestamp}`,
          {
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            },
            cache: 'no-store'
          }
        );
        
        if (refreshResponse.ok) {
          const refreshedData = await refreshResponse.json();
          setFormData(refreshedData);
        }
      } catch (err) {
        setUploadStatus('error');
        console.error('Error uploading to S3:', err);
      }
    }
  };

  const handleChange = (
    field: string,
    value: string | number | boolean
  ) => {
    if (field.startsWith('live.')) {
      const liveField = field.split('.')[1];
      setFormData({
        ...formData,
        acf: {
          ...formData.acf,
          live: {
            ...formData.acf.live,
            [liveField]: value
          }
        }
      });
      // Limpa o JSON output quando o formulário é modificado
      setJsonOutput('');
    } else {
      setFormData({
        ...formData,
        acf: {
          ...formData.acf,
          [field]: value
        }
      });
      // Limpa o JSON output quando o formulário é modificado
      setJsonOutput('');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 border rounded-lg bg-white shadow-sm">
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-gray-600">Carregando dados...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 border rounded-lg bg-white shadow-sm">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 border rounded-lg bg-white shadow-sm">
      <h2 className="text-xl font-bold mb-6 text-gray-900">{title}</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          type="hidden"
          value={formData.acf.year}
          onChange={(e) => handleChange('year', parseInt(e.target.value))}
        />

        <div className="form-group">
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <span className="mr-3">Live Enabled</span>
            <input
              type="checkbox"
              checked={formData.acf.live.enabled}
              onChange={(e) => handleChange('live.enabled', e.target.checked)}
              className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
          </label>
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title
            <input
              type="text"
              value={formData.acf.live.title}
              onChange={(e) => handleChange('live.title', e.target.value)}
              className="mt-1 block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </label>
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Video ID
            <input
              type="text"
              value={formData.acf.live.videoID}
              onChange={(e) => handleChange('live.videoID', e.target.value)}
              className="mt-1 block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </label>
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
            <textarea
              value={formData.acf.live.description}
              onChange={(e) => handleChange('live.description', e.target.value)}
              rows={4}
              className="mt-1 block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={uploadStatus === 'loading'}
          className={`w-full inline-flex justify-center rounded-md border border-transparent py-3 px-6 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            uploadStatus === 'loading'
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
          }`}
        >
          {uploadStatus === 'loading' ? 'Uploading...' : 'Save Changes'}
        </button>

        {uploadStatus === 'success' && (
          <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            File successfully uploaded to S3!
          </div>
        )}

        {uploadStatus === 'error' && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            Failed to upload file to S3. Please try again.
          </div>
        )}
      </form>

      {jsonOutput && (
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Last Saved JSON:</h3>
          <pre className="bg-gray-100 p-6 rounded-md overflow-auto">
            {jsonOutput}
          </pre>
        </div>
      )}
    </div>
  );
} 