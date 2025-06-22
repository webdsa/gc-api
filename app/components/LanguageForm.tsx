'use client';

import { FormData } from '../types';

interface LanguageFormProps {
  language: 'pt_BR' | 'es_ES';
  title: string;
  formData: FormData;
  onChange: (data: FormData) => void;
}

const MAX_DESCRIPTION_LENGTH = 450;

export default function LanguageForm({ language, title, formData, onChange }: LanguageFormProps) {
  const handleChange = (
    field: string,
    value: string | number | boolean
  ) => {
    if (field.startsWith('live.')) {
      const liveField = field.split('.')[1];
      
      // Se for o campo description, limita o tamanho
      if (liveField === 'description' && typeof value === 'string') {
        value = value.slice(0, MAX_DESCRIPTION_LENGTH);
      }

      onChange({
        ...formData,
        acf: {
          ...formData.acf,
          live: {
            ...formData.acf.live,
            [liveField]: value
          }
        }
      });
    } else {
      onChange({
        ...formData,
        acf: {
          ...formData.acf,
          [field]: value
        }
      });
    }
  };

  const currentLength = formData.acf.live.description.length;
  const remainingChars = MAX_DESCRIPTION_LENGTH - currentLength;
  const isNearLimit = remainingChars <= 50;

  return (
    <div className="p-6 rounded-lg bg-white shadow-sm">
      <h2 className="text-xl font-bold mb-6 text-gray-900">{title}</h2>
      <div className="space-y-6">
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
            <div className="relative">
              <textarea
                value={formData.acf.live.description}
                onChange={(e) => handleChange('live.description', e.target.value)}
                rows={4}
                maxLength={MAX_DESCRIPTION_LENGTH}
                className={`mt-1 block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 ${
                  isNearLimit ? 'focus:border-yellow-500 border-yellow-300' : 'focus:border-indigo-500'
                }`}
              />
              <div className={`text-right mt-1 text-sm ${
                isNearLimit ? 'text-yellow-600' : 'text-gray-500'
              }`}>
                {remainingChars} characters remaining
              </div>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
} 