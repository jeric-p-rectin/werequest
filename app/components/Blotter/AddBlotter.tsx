'use client';

import { useState, useEffect } from 'react';

interface Resident {
  _id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  fullName?: string;
}

interface BlotterForm {
  caseNo: string;
  complainant: string;
  respondent: string;
  complaint: string;
  natureOfComplaint: string;
}

const initialFormState: BlotterForm = {
  caseNo: '',
  complainant: '',
  respondent: '',
  complaint: '',
  natureOfComplaint: ''
};

// Nature of Complaint options
const complaintNatures = [
  'Physical Harm',
  'Verbal Abuse',
  'Property Dispute',
  'Noise Disturbance',
  'Vandalism/Theft',
  'Family Conflict',
  'Animal Nuisance',
  'Business-Related',
  'Youth-Related',
  'Illegal Activities',
  'Barangay Ordinance Violation'
];

export default function AddBlotter() {
  const [formData, setFormData] = useState<BlotterForm>(initialFormState);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchResidents();
  }, []);

  const fetchResidents = async () => {
    try {
      const response = await fetch('/api/resident/get-all-residents');
      if (!response.ok) throw new Error('Failed to fetch residents');
      
      const data = await response.json();
      const formattedResidents = data.data.map((resident: Resident) => ({
        ...resident,
        fullName: resident.fullName || `${resident.firstName} ${resident.middleName ? resident.middleName + ' ' : ''}${resident.lastName}`
      }));
      
      setResidents(formattedResidents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch residents');
      console.error('Error fetching residents:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate that complainant and respondent are different
      if (formData.complainant === formData.respondent) {
        throw new Error('Complainant and respondent cannot be the same person');
      }

      const response = await fetch('/api/blotter/add-blotter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit blotter');
      }

      // Reset form and show success message
      setFormData(initialFormState);
      setSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit blotter');
      console.error('Error submitting blotter:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Report New Blotter</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Case No. Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Case No.
            </label>
            <input
              type="text"
              name="caseNo"
              value={formData.caseNo}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
              placeholder="Enter case number"
            />
          </div>

          {/* Complainant Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Complainant
            </label>
            <select
              name="complainant"
              value={formData.complainant}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
            >
              <option value="">Select complainant</option>
              {residents.map((resident) => (
                <option key={resident._id} value={resident.fullName}>
                  {resident.fullName}
                </option>
              ))}
            </select>
          </div>

          {/* Respondent Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Respondent
            </label>
            <select
              name="respondent"
              value={formData.respondent}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
            >
              <option value="">Select respondent</option>
              {residents.map((resident) => (
                <option key={resident._id} value={resident.fullName}>
                  {resident.fullName}
                </option>
              ))}
            </select>
          </div>

          {/* Complaint Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Complaint
            </label>
            <textarea
              name="complaint"
              value={formData.complaint}
              onChange={handleChange}
              required
              rows={4}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
              placeholder="Enter complaint details"
            />
          </div>

          {/* Nature of Complaint Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nature of Complaint
            </label>
            <select
              name="natureOfComplaint"
              value={formData.natureOfComplaint}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
            >
              <option value="">Select nature of complaint</option>
              {complaintNatures.map((nature) => (
                <option key={nature} value={nature}>
                  {nature}
                </option>
              ))}
            </select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 text-sm font-medium text-red-700 bg-red-50 rounded-md border border-red-200">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-3 text-sm font-medium text-green-700 bg-green-50 rounded-md border border-green-200">
              Blotter report submitted successfully!
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {isLoading ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
