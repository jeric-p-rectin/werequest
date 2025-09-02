'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Resident {
  _id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  fullName?: string;
}

type PartyType = 'Resident' | 'Non-Resident';

interface Party {
  type: PartyType;
  name: string;
  residentId?: string | null;
  // UI-only fields
  search?: string;
  showDropdown?: boolean;
}

interface BlotterForm {
  caseNo: string;
  complainants: Party[];
  respondents: Party[];
  complaint: string;
  natureOfComplaint: string;
}

const initialFormState: BlotterForm = {
  caseNo: '',
  complainants: [{ type: 'Resident', name: '', residentId: null, search: '', showDropdown: false }],
  respondents: [{ type: 'Resident', name: '', residentId: null, search: '', showDropdown: false }],
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
  const router = useRouter();

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
        fullName:
          resident.fullName ||
          `${resident.firstName} ${resident.middleName ? resident.middleName + ' ' : ''}${resident.lastName}`
      }));

      setResidents(formattedResidents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch residents');
      console.error('Error fetching residents:', err);
    }
  };

  const filterResidents = (query: string) =>
    residents.filter(r => (r.fullName || '').toLowerCase().includes(query.toLowerCase()));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Party helpers
  const addParty = (side: 'complainants' | 'respondents') => {
    setFormData(prev => ({
      ...prev,
      [side]: [...prev[side], { type: 'Resident', name: '', residentId: null, search: '', showDropdown: false }]
    }));
  };

  const removeParty = (side: 'complainants' | 'respondents', index: number) => {
    setFormData(prev => ({
      ...prev,
      [side]: prev[side].filter((_, i) => i !== index)
    }));
  };

  const updatePartyField = (
    side: 'complainants' | 'respondents',
    index: number,
    changes: Partial<Party>
  ) => {
    setFormData(prev => {
      const updated = prev[side].map((p, i) => (i === index ? { ...p, ...changes } : p));
      return { ...prev, [side]: updated } as BlotterForm;
    });
  };

  const handlePartyTypeChange = (side: 'complainants' | 'respondents', index: number, type: PartyType) => {
    // switching type should clear residentId/search if Non-Resident
    if (type === 'Non-Resident') {
      updatePartyField(side, index, { type, residentId: null, search: '', showDropdown: false, name: '' });
    } else {
      updatePartyField(side, index, { type, residentId: null, search: '', showDropdown: false, name: '' });
    }
  };

  const handlePartySearchChange = (side: 'complainants' | 'respondents', index: number, value: string) => {
    updatePartyField(side, index, { search: value, showDropdown: true, name: value, residentId: null });
  };

  const selectResidentForParty = (side: 'complainants' | 'respondents', index: number, resident: Resident) => {
    updatePartyField(side, index, {
      name: resident.fullName || `${resident.firstName} ${resident.lastName}`,
      residentId: resident._id,
      search: resident.fullName || `${resident.firstName} ${resident.lastName}`,
      showDropdown: false
    });
  };

  const handleNonResidentNameChange = (side: 'complainants' | 'respondents', index: number, value: string) => {
    updatePartyField(side, index, { name: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Prepare payload: map parties to desired structure: { type, name, residentId? }
      const payload = {
        caseNo: formData.caseNo,
        complainants: formData.complainants.map(p => ({
          type: p.type,
          name: p.name,
          residentId: p.residentId ?? undefined
        })),
        respondents: formData.respondents.map(p => ({
          type: p.type,
          name: p.name,
          residentId: p.residentId ?? undefined
        })),
        complaint: formData.complaint,
        natureOfComplaint: formData.natureOfComplaint
      };

      const response = await fetch('/api/blotter/add-blotter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit blotter');
      }

      // console.log(payload);

      // Reset form and show success message
      setFormData(initialFormState);
      setSuccess(true);

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
      router.push("/blotter")
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit blotter');
      console.error('Error submitting blotter:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Report New Blotter</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Case No. Field */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">Case No.</label>
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

          {/* Complainants - dynamic list */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">Complainants</label>
            <div className="space-y-3">
              {formData.complainants.map((p, idx) => (
                <div key={idx} className="p-3 border border-gray-200 rounded-md">
                  <div className="flex items-center gap-3">
                    <select
                      value={p.type}
                      onChange={e => handlePartyTypeChange('complainants', idx, e.target.value as PartyType)}
                      className="p-2 border text-black border-gray-300 rounded-md text-sm"
                    >
                      <option value="Resident">Resident</option>
                      <option value="Non-Resident">Non-Resident</option>
                    </select>

                    {p.type === 'Resident' ? (
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="Search resident..."
                          value={p.search ?? ''}
                          onChange={e => handlePartySearchChange('complainants', idx, e.target.value)}
                          onFocus={() => updatePartyField('complainants', idx, { showDropdown: true })}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                          autoComplete="off"
                        />
                        {p.showDropdown && (p.search ?? '') !== '' && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                            {filterResidents(p.search ?? '').length > 0 ? (
                              filterResidents(p.search ?? '').map(resident => (
                                <button
                                  key={resident._id}
                                  type="button"
                                  onClick={() => selectResidentForParty('complainants', idx, resident)}
                                  className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none text-gray-900"
                                >
                                  {resident.fullName}
                                </button>
                              ))
                            ) : (
                              <div className="px-4 py-2 text-gray-500 text-sm">
                                No residents found matching “{p.search}”
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <input
                        type="text"
                        placeholder="Enter name..."
                        value={p.name}
                        onChange={e => handleNonResidentNameChange('complainants', idx, e.target.value)}
                        className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                      />
                    )}

                    <button
                      type="button"
                      onClick={() => removeParty('complainants', idx)}
                      className="px-4 py-2 bg-[#f5fdf1] text-gray-800 border border-gray-300 hover:bg-[#3c5e1a] hover:text-white duration-300 cursor-pointer rounded-xl"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => addParty('complainants')}
                className="px-4 py-2 bg-[#f5fdf1] text-gray-800 border border-gray-300 hover:bg-[#3c5e1a] hover:text-white duration-300 cursor-pointer rounded-xl"
              >
                + Add Complainant
              </button>
            </div>
          </div>

          {/* Respondents - dynamic list */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">Respondents</label>
            <div className="space-y-3">
              {formData.respondents.map((p, idx) => (
                <div key={idx} className="p-3 border border-gray-200 rounded-md">
                  <div className="flex items-center gap-3">
                    <select
                      value={p.type}
                      onChange={e => handlePartyTypeChange('respondents', idx, e.target.value as PartyType)}
                      className="p-2 border text-black border-gray-300 rounded-md text-sm"
                    >
                      <option value="Resident">Resident</option>
                      <option value="Non-Resident">Non-Resident</option>
                    </select>

                    {p.type === 'Resident' ? (
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="Search resident..."
                          value={p.search ?? ''}
                          onChange={e => handlePartySearchChange('respondents', idx, e.target.value)}
                          onFocus={() => updatePartyField('respondents', idx, { showDropdown: true })}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                          autoComplete="off"
                        />
                        {p.showDropdown && (p.search ?? '') !== '' && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                            {filterResidents(p.search ?? '').length > 0 ? (
                              filterResidents(p.search ?? '').map(resident => (
                                <button
                                  key={resident._id}
                                  type="button"
                                  onClick={() => selectResidentForParty('respondents', idx, resident)}
                                  className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none text-gray-900"
                                >
                                  {resident.fullName}
                                </button>
                              ))
                            ) : (
                              <div className="px-4 py-2 text-gray-500 text-sm">
                                No residents found matching “{p.search}”
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <input
                        type="text"
                        placeholder="Enter name..."
                        value={p.name}
                        onChange={e => handleNonResidentNameChange('respondents', idx, e.target.value)}
                        className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                      />
                    )}

                    <button
                      type="button"
                      onClick={() => removeParty('respondents', idx)}
                      className="px-4 py-2 bg-[#f5fdf1] text-gray-800 border border-gray-300 hover:bg-[#3c5e1a] hover:text-white duration-300 cursor-pointer rounded-xl"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => addParty('respondents')}
                className="px-4 py-2 bg-[#f5fdf1] text-gray-800 border border-gray-300 hover:bg-[#3c5e1a] hover:text-white duration-300 cursor-pointer rounded-xl"
              >
                + Add Respondent
              </button>
            </div>
          </div>

          {/* Complaint Field */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">Complaint</label>
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
            <label className="block text-sm font-medium text-black mb-2">Nature of Complaint</label>
            <select
              name="natureOfComplaint"
              value={formData.natureOfComplaint}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
            >
              <option value="">Select nature of complaint</option>
              {complaintNatures.map(nature => (
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
              className="px-4 py-2 bg-[#f5fdf1] text-gray-800 border border-gray-300 hover:bg-[#3c5e1a] hover:text-white duration-300 cursor-pointer rounded-xl disabled:cursor-not-allowed font-medium"
            >
              {isLoading ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}