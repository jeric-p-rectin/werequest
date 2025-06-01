'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface RequestForm {
  fullName: string;
  documentType: string;
  copies: number;
  purpose: string;
}

interface RequestDocumentProps {
  onBack: () => void;
}

const initialFormState: RequestForm = {
  fullName: '',
  documentType: '',
  copies: 1,
  purpose: ''
};

export default function RequestDocument({ onBack }: RequestDocumentProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<RequestForm>(initialFormState);

  const documentTypes = [
    'Barangay Clearance',
    'Certificate of Indigency',
    'Certificate of Residency',
    'Business Permit',
    'Barc Certificate'
  ];

  const purposes = [
    'Employment',
    'Scholarship',
    'Medical'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/document/request-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error submitting document request');
      }

      // Reset form
      setFormData(initialFormState);

      // Show success message with request ID and redirect
      alert(`Document request submitted successfully!\nRequest ID: ${data.requestId}`);
      router.push('/document');
    } catch (err) {
      console.error('Request error:', err);
      if (err instanceof Error && err.message.includes('not found')) {
        setError('No resident found with the provided name. Please check the name and try again.');
      } else {
        setError(err instanceof Error ? err.message : 'Error submitting request');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="h-auto w-[40%] p-10 bg-white rounded-lg shadow-lg flex flex-col justify-start items-start relative">
      {/* Back Button */}
      <button 
        type="button"
        onClick={onBack}
        className="absolute right-5 top-5 text-gray-700 hover:text-gray-900"
      >
        ×
      </button>

      {/* Title */}
      <p className="text-2xl font-semibold text-gray-800">NEW REQUEST</p>
      
      {/* Form Fields Container */}
      <div className="w-full mt-6 border border-green-600 p-5 rounded-lg">
        <div className="space-y-4">
          {/* Name Field */}
          <div className="field">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name (as registered)
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              placeholder="Enter your complete name as registered"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-500"
            />
          </div>

          {/* Document Type Field */}
          <div className="field">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document Type
            </label>
            <select
              name="documentType"
              value={formData.documentType}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
            >
              <option value="" className="text-gray-500">Select</option>
              {documentTypes.map((type) => (
                <option key={type} value={type} className="text-gray-900">{type}</option>
              ))}
            </select>
          </div>

          {/* Copies Field */}
          <div className="field">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Copies
            </label>
            <select
              name="copies"
              value={formData.copies}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
            >
              <option value={1} className="text-gray-900">1</option>
              <option value={2} className="text-gray-900">2</option>
              <option value={3} className="text-gray-900">3</option>
            </select>
          </div>

          {/* Purpose Field */}
          <div className="field">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Purpose
            </label>
            <select
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
            >
              <option value="" className="text-gray-500">Select</option>
              {purposes.map((purpose) => (
                <option key={purpose} value={purpose} className="text-gray-900">{purpose}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="w-full mt-4 p-3 text-sm font-medium text-red-700 bg-red-50 rounded-md border border-red-200">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <div className="w-full flex justify-end mt-6">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
        >
          {isLoading ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </form>
  );
}