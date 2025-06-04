'use client';

import { useState } from 'react';

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formDataList, setFormDataList] = useState<RequestForm[]>([initialFormState]);

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

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormDataList(prev => prev.map((form, i) =>
      i === index ? { ...form, [name]: name === 'copies' ? Number(value) : value } : form
    ));
  };

  const handleAddNew = () => {
    setFormDataList(prev => [...prev, initialFormState]);
  };

  const handleRemove = (index: number) => {
    setFormDataList(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Validate all forms
    console.log('Validating forms:', formDataList);
    for (const form of formDataList) {
      if (
        !form.fullName.trim() ||
        !form.documentType.trim() ||
        !form.purpose.trim() ||
        !form.copies ||
        isNaN(Number(form.copies)) ||
        Number(form.copies) < 1
      ) {
        setError('All fields are required in each request.');
        setIsLoading(false);
        return;
      }
    }

    try {
      const response = await fetch('/api/document/request-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requests: formDataList }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error submitting document requests');
      }

      setFormDataList([initialFormState]);
      setSuccess(
        data.requestIds
          ? `Document requests submitted successfully! Request IDs: ${data.requestIds.join(', ')}`
          : 'Document requests submitted successfully!'
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error submitting requests');
    } finally {
      setIsLoading(false);
    }
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

      {/* Multiple Forms */}
      <div className="w-full mt-6 flex flex-col gap-6">
        {formDataList.map((formData, idx) => (
          <div key={idx} className="w-full border border-green-600 p-5 rounded-lg relative">
            {formDataList.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-lg"
                title="Remove this request"
              >
                ×
              </button>
            )}
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
                  onChange={e => handleChange(idx, e)}
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
                  onChange={e => handleChange(idx, e)}
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
                  onChange={e => handleChange(idx, e)}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                >
                  <option value={1} className="text-gray-900">1</option>
                  <option value={2} className="text-gray-900">2</option>
                  <option value={3} className="text-gray-900">3</option>
                  <option value={4} className="text-gray-900">4</option>
                  <option value={5} className="text-gray-900">5</option>
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
                  onChange={e => handleChange(idx, e)}
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
        ))}
      </div>

      {/* Error Display */}
      {error && (
        <div className="w-full mt-4 p-3 text-sm font-medium text-red-700 bg-red-50 rounded-md border border-red-200">
          {error}
        </div>
      )}

      {/* Success Display */}
      {success && (
        <div className="w-full mt-4 p-3 text-sm font-medium text-green-700 bg-green-50 rounded-md border border-green-200">
          {success}
        </div>
      )}

      {/* Action Buttons */}
      <div className="w-full flex justify-end items-center gap-3 mt-6">
        <button
          type="button"
          onClick={handleAddNew}
          className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 font-medium"
        >
          Add New
        </button>
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