'use client';

import { FormData } from '../types';
import { useState } from 'react';

interface LanguageFormProps {
  title: string;
  formData: FormData;
  onChange: (data: FormData) => void;
}

export default function LanguageForm({
  title,
  formData,
  onChange
}: LanguageFormProps) {
  const [charCount, setCharCount] = useState(formData.acf.live.description.length);
  const maxChars = 450;

  const handleChange = (field: string, value: string | boolean | number) => {
    const newData = {
      ...formData,
      acf: {
        ...formData.acf,
        live: {
          ...formData.acf.live,
          [field]: value
        }
      }
    };
    onChange(newData);

    if (field === 'description') {
      setCharCount(value.toString().length);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6">{title}</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            value={formData.acf.live.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Video ID
          </label>
          <input
            type="text"
            value={formData.acf.live.videoID}
            onChange={(e) => handleChange('videoID', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <div className="relative">
            <textarea
              value={formData.acf.live.description}
              onChange={(e) => handleChange('description', e.target.value)}
              maxLength={maxChars}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            <div className={`text-sm mt-1 text-right ${
              charCount > maxChars ? 'text-red-500' : 'text-gray-500'
            }`}>
              {charCount}/{maxChars} characters
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            checked={formData.acf.live.enabled}
            onChange={(e) => handleChange('enabled', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label className="ml-2 block text-sm text-gray-900">
            Enable Live
          </label>
        </div>
      </div>
    </div>
  );
} 