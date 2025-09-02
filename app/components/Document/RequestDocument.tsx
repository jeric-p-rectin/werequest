'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface RequestForm {
  requestedFor: string;
  fullName: string;
  documentType: string;
  copies: number;
  purpose: string;
  proofOfAuthority?: string | null; // Changed to string for base64
  proofOfAuthorityName?: string | null; // Added to store original filename
  proofOfAuthoritySize?: number | null; // Added to store file size
}

interface RequestDocumentProps {
  onBack: () => void;
}

interface Resident {
  _id: string;
  fullName: string;
}

const initialFormState: RequestForm = {
  requestedFor: '',
  fullName: '',
  documentType: '',
  copies: 1,
  purpose: '',
  proofOfAuthority: null,
  proofOfAuthorityName: null,
  proofOfAuthoritySize: null
};

export default function RequestDocument({ onBack }: RequestDocumentProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [formDataList, setFormDataList] = useState<RequestForm[]>([initialFormState]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loadingResidents, setLoadingResidents] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

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

  // Fetch residents on component mount
  useEffect(() => {
    const fetchResidents = async () => {
      try {
        const response = await fetch('/api/resident/get-all-residents-name');
        const data = await response.json();
        if (response.ok) {
          setResidents(data.data);
        } else {
          console.error('Failed to fetch residents:', data.error);
        }
      } catch (error) {
        console.error('Error fetching residents:', error);
      } finally {
        setLoadingResidents(false);
      }
    };

    fetchResidents();
  }, []);

  // Filter residents based on search term
  const filteredResidents = residents.filter(resident =>
    resident.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormDataList(prev => prev.map((form, i) => {
      if (i === index) {
        const updatedForm = { ...form, [name]: name === 'copies' ? Number(value) : value };
        
        // If requestedFor is "For Myself", set fullName to session user's fullName
        if (name === 'requestedFor' && value === 'For Myself') {
          updatedForm.fullName = session?.user?.fullName || '';
        } else if (name === 'requestedFor' && value === 'For Others') {
          updatedForm.fullName = '';
        }
        
        return updatedForm;
      }
      return form;
    }));
  };

  const handleFileChange = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (file) {
      // Check file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        setError('File size must be less than 10MB');
        return;
      }

      try {
        // Convert file to base64
        const base64 = await convertFileToBase64(file);
        
        setFormDataList(prev => prev.map((form, i) => {
          if (i === index) {
            return {
              ...form,
              proofOfAuthority: base64,
              proofOfAuthorityName: file.name,
              proofOfAuthoritySize: file.size
            };
          }
          return form;
        }));
        
        setError(''); // Clear any previous errors
      } catch (error) {
        setError('Error processing file. Please try again.');
        console.error('Error converting file to base64:', error);
      }
    } else {
      // Clear file data if no file selected
      setFormDataList(prev => prev.map((form, i) => {
        if (i === index) {
          return {
            ...form,
            proofOfAuthority: null,
            proofOfAuthorityName: null,
            proofOfAuthoritySize: null
          };
        }
        return form;
      }));
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleResidentSelect = (index: number, residentName: string) => {
    setFormDataList(prev => prev.map((form, i) => {
      if (i === index) {
        return { ...form, fullName: residentName };
      }
      return form;
    }));
    setSearchTerm('');
    setShowDropdown(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setShowDropdown(true);
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
    // Validate all forms
    console.log('Validating forms:', formDataList);
    for (const form of formDataList) {
      if (
        !form.requestedFor.trim() ||
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
      // Prepare the data with base64 files
      const requestsData = formDataList.map(form => ({
        requestedFor: form.requestedFor,
        fullName: form.fullName,
        documentType: form.documentType,
        copies: form.copies,
        purpose: form.purpose,
        proofOfAuthority: form.proofOfAuthority,
        proofOfAuthorityName: form.proofOfAuthorityName,
        proofOfAuthoritySize: form.proofOfAuthoritySize
      }));

      const response = await fetch('/api/document/request-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requests: requestsData }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error submitting document requests');
      }

      // Show success popup
      setShowSuccessPopup(true);
      setFormDataList([initialFormState]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error submitting requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGotIt = () => {
    setShowSuccessPopup(false);
    onBack(); // Go back to ViewDocuments
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="h-auto w-full max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto p-4 sm:p-6 md:p-8 bg-white rounded-lg shadow-lg flex flex-col justify-start items-start relative"
      >
        {/* Back Button */}
        <button
          type="button"
          onClick={onBack}
          className="absolute right-3 top-3 sm:right-5 sm:top-5 text-gray-700 hover:text-gray-900 text-2xl sm:text-3xl leading-none"
          aria-label="Close"
        >
          ×
        </button>

        {/* Title */}
        <p className="text-xl sm:text-2xl font-semibold text-gray-800">NEW REQUEST</p>

        {/* Multiple Forms */}
        <div className="w-full mt-6 flex flex-col gap-6">
          {formDataList.map((formData, idx) => (
            <div key={idx} className="w-full border border-green-600 p-4 sm:p-5 rounded-lg relative">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Requested For Field */}
                <div className="field">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Requested for:
                  </label>
                  <select
                    name="requestedFor"
                    value={formData.requestedFor}
                    onChange={e => handleChange(idx, e)}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                  >
                    <option value="" className="text-gray-500">Select</option>
                    <option value="For Myself" className="text-gray-900">For Myself</option>
                    <option value="For Others" className="text-gray-900">For Others</option>
                  </select>
                </div>

                {/* Name Field */}
                <div className="field md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name (as registered)
                  </label>
                  {formData.requestedFor === 'For Myself' ? (
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      readOnly
                      className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                    />
                  ) : (
                    <div className="relative">
                      <input
                        type="text"
                        placeholder={loadingResidents ? 'Loading residents...' : 'Search for resident...'}
                        value={searchTerm}
                        onChange={handleSearchChange}
                        onFocus={() => setShowDropdown(true)}
                        disabled={loadingResidents}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 disabled:bg-gray-100"
                      />
                      
                      {/* Selected resident display */}
                      {formData.fullName && (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                          <span className="text-sm text-green-800 font-medium">Selected: {formData.fullName}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setFormDataList(prev => prev.map((form, i) => {
                                if (i === idx) {
                                  return { ...form, fullName: '' };
                                }
                                return form;
                              }));
                              setSearchTerm('');
                            }}
                            className="ml-2 text-red-500 hover:text-red-700 text-sm"
                          >
                            Clear
                          </button>
                        </div>
                      )}

                      {/* Search dropdown */}
                      {showDropdown && searchTerm && !loadingResidents && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                          {filteredResidents.length > 0 ? (
                            filteredResidents.map((resident) => (
                              <button
                                key={resident._id}
                                type="button"
                                onClick={() => handleResidentSelect(idx, resident.fullName)}
                                className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none text-gray-900"
                              >
                                {resident.fullName}
                              </button>
                            ))
                          ) : (
                            <div className="px-4 py-2 text-gray-500 text-sm">
                              No residents found matching &ldquo;{searchTerm}&ldquo;
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
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

                {/* Proof of Authority Field - Only show when requesting for others */}
                {formData.requestedFor === 'For Others' && (
                  <div className="field md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Proof of Authority
                    </label>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                        onChange={e => handleFileChange(idx, e)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                      />
                      <p className="text-xs text-gray-500">
                        Accepted formats: PDF, DOC, DOCX, JPG, JPEG, PNG, GIF (Max size: 10MB)
                      </p>
                      
                      {/* Display selected file info */}
                      {formData.proofOfAuthority && formData.proofOfAuthorityName && (
                        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                              </svg>
                              <div>
                                <p className="text-sm font-medium text-blue-800">{formData.proofOfAuthorityName}</p>
                                {formData.proofOfAuthoritySize && (
                                  <p className="text-xs text-blue-600">{formatFileSize(formData.proofOfAuthoritySize)}</p>
                                )}
                                <p className="text-xs text-blue-500">Base64 encoded</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setFormDataList(prev => prev.map((form, i) => {
                                  if (i === idx) {
                                    return {
                                      ...form,
                                      proofOfAuthority: null,
                                      proofOfAuthorityName: null,
                                      proofOfAuthoritySize: null
                                    };
                                  }
                                  return form;
                                }));
                              }}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
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

        {/* Action Buttons */}
        <div className="w-full flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-3 mt-6">
          {formDataList.length < 5 && (
            <button
              type="button"
              onClick={handleAddNew}
              className="w-full sm:w-auto px-6 py-2 bg-[#f5fdf1] text-gray-800 border border-gray-300 hover:bg-[#3c5e1a] hover:text-white duration-300 cursor-pointer rounded-xl"
            >
              Add New
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-6 py-2 bg-[#f5fdf1] text-gray-800 border border-gray-300 hover:bg-[#3c5e1a] hover:text-white duration-300 cursor-pointer rounded-xl"
          >
            {isLoading ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full text-center shadow-xl">
            <div className="mb-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Request Submitted Successfully!</h3>
              <p className="text-sm text-gray-600">
                Your request is under verification. Approved documents will be sent once ready.
              </p>
            </div>
            <button
              onClick={handleGotIt}
              className="w-full px-4 py-2 bg-[#f5fdf1] text-gray-800 border border-gray-300 hover:bg-[#3c5e1a] hover:text-white duration-300 cursor-pointer rounded-xl"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
}