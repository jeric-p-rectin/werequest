'use client';

import { useState, useEffect } from 'react';
import { FaEye, FaEdit } from 'react-icons/fa';

interface Party {
  type: 'Resident' | 'Non-Resident';
  name: string;
  residentId?: string | null;
  residentInfo?: Resident;
  // UI-only fields for edit modal
  search?: string;
  showDropdown?: boolean;
}

interface Blotter {
  _id: string;
  caseNo: string;
  complainants?: Party[]; // new shape
  respondents?: Party[];  // new shape
  // legacy fallback fields (optional)
  complainantInfo?: { fullName: string };
  respondentInfo?: { fullName: string };
  complaint: string;
  natureOfComplaint: string;
  status: 'pending' | 'on-going' | 'settled' | 'endorsed';
  createdAt: string;
}

interface Resident {
  _id: string;
  username?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  extName?: string;
  fullName?: string;
  birthday?: string;
  birthPlace?: string;
  age?: number;
  gender?: string;
  civilStatus?: string;
  nationality?: string;
  religion?: string;
  email?: string;
  password?: string;
  phoneNumber?: string;
  houseNo?: string;
  purok?: string;
  workingStatus?: string;
  sourceOfIncome?: string;
  votingStatus?: string;
  educationalAttainment?: string;
  soloParent?: boolean;
  fourPsBeneficiary?: boolean;
}

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

export default function ViewBlotters() {
  const [blotters, setBlotters] = useState<Blotter[]>([]);
  const [selectedBlotter, setSelectedBlotter] = useState<Blotter | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Blotter>>({});
  const [residents, setResidents] = useState<Resident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBlotters();
    fetchResidents();
  }, []);

  const fetchBlotters = async () => {
    try {
      const response = await fetch('/api/blotter/get-all-blotters');
      if (!response.ok) throw new Error('Failed to fetch blotters');
      const data = await response.json();
      setBlotters(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch blotters');
      console.error('Error fetching blotters:', err);
    } finally {
      setIsLoading(false);
    }
  };

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
      console.error('Error fetching residents:', err);
    }
  };

  // Normalize blotter parties for editing (fallback to legacy fields)
const normalizeBlotterForEdit = (blotter: Blotter): Blotter => {
	const complainants: Party[] =
		Array.isArray(blotter.complainants) && blotter.complainants.length > 0
			? (blotter.complainants.map(p => ({ ...p, search: p.name || '', showDropdown: false })) as Party[])
			: blotter.complainantInfo
			? [{ type: 'Resident', name: blotter.complainantInfo.fullName, residentId: undefined, search: blotter.complainantInfo.fullName, showDropdown: false }]
			: [{ type: 'Resident', name: '', residentId: null, search: '', showDropdown: false }];

	const respondents: Party[] =
		Array.isArray(blotter.respondents) && blotter.respondents.length > 0
			? (blotter.respondents.map(p => ({ ...p, search: p.name || '', showDropdown: false })) as Party[])
			: blotter.respondentInfo
			? [{ type: 'Resident', name: blotter.respondentInfo.fullName, residentId: undefined, search: blotter.respondentInfo.fullName, showDropdown: false }]
			: [{ type: 'Resident', name: '', residentId: null, search: '', showDropdown: false }];

	return { ...blotter, complainants, respondents };
};

  const handleView = (blotter: Blotter) => {
    const normalized = normalizeBlotterForEdit(blotter);
    setSelectedBlotter(normalized);
    setEditForm(normalized);
    setIsEditing(false);
    setShowModal(true);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Party helpers (for edit modal)
  const addParty = (side: 'complainants' | 'respondents') => {
    setEditForm(prev => {
      const current = (prev[side] as Party[]) || [];
      return { ...prev, [side]: [...current, { type: 'Resident', name: '', residentId: null, search: '', showDropdown: false }] };
    });
  };

  const removeParty = (side: 'complainants' | 'respondents', index: number) => {
    setEditForm(prev => {
      const current = (prev[side] as Party[]) || [];
      return { ...prev, [side]: current.filter((_, i) => i !== index) };
    });
  };

  const updatePartyField = (side: 'complainants' | 'respondents', index: number, changes: Partial<Party>) => {
    setEditForm(prev => {
      const current = (prev[side] as Party[]) || [];
      const updated = current.map((p, i) => (i === index ? { ...p, ...changes } : p));
      return { ...prev, [side]: updated };
    });
  };

  const handlePartyTypeChange = (side: 'complainants' | 'respondents', index: number, type: 'Resident' | 'Non-Resident') => {
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
      showDropdown: false,
      residentInfo: resident
    });
  };

  const handleNonResidentNameChange = (side: 'complainants' | 'respondents', index: number, value: string) => {
    updatePartyField(side, index, { name: value });
  };

  // Filtering helper
  const filterResidents = (query: string) =>
    residents.filter(r => (r.fullName || '').toLowerCase().includes(query.toLowerCase()));

  const handleSaveChanges = async () => {
    if (!selectedBlotter?._id) return;

    try {
      // Prepare updateData from editForm
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _id: _, ...rawUpdate } = editForm;

      type PartyPayload = {
        type: Party['type'];
        name: string;
        residentId?: string | null | undefined;
      };

      // Clean up UI-only fields from parties before sending
      const sanitizeParties = (parties?: Party[]) => {
        if (!Array.isArray(parties)) return parties;
        return parties.map(p => ({
          type: p.type,
          name: p.name,
          residentId: p.residentId ?? undefined
        }));
      };

      const updateData: Partial<Omit<Blotter, '_id'>> & {
        complainants?: PartyPayload[];
        respondents?: PartyPayload[];
      } = { ...(rawUpdate as Partial<Blotter>) };

      if (rawUpdate.complainants) updateData.complainants = sanitizeParties(rawUpdate.complainants as Party[]);
      if (rawUpdate.respondents) updateData.respondents = sanitizeParties(rawUpdate.respondents as Party[]);

      const response = await fetch(`/api/blotter/update/${selectedBlotter._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) throw new Error('Failed to update blotter');

      // Update local state
      setBlotters(prevBlotters =>
        prevBlotters.map(blotter =>
          blotter._id === selectedBlotter._id
            ? { ...blotter, ...updateData }
            : blotter
        )
      );

      setIsEditing(false);
      setShowModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update blotter');
      console.error('Error updating blotter:', err);
    }
  };

  // Helpers to safely read party names (supports legacy shape too)
  const getPartyNames = (blotter: Partial<Blotter> | Record<string, unknown>, side: 'complainants' | 'respondents') => {
    if (!blotter) return '';
  
    const sideVal = (blotter as Record<string, unknown>)[side];
    if (Array.isArray(sideVal) && sideVal.length > 0) {
      const arr = sideVal as Array<Partial<Party> & { residentInfo?: Partial<Resident> }>;
      return arr
        .map(p => p?.name ?? p?.residentInfo?.fullName ?? '')
        .filter(Boolean)
        .join(', ');
    }
  
    // legacy fallback
    if (side === 'complainants' && (blotter as Partial<Blotter>).complainantInfo?.fullName) {
      return (blotter as Partial<Blotter>).complainantInfo!.fullName;
    }
    if (side === 'respondents' && (blotter as Partial<Blotter>).respondentInfo?.fullName) {
      return (blotter as Partial<Blotter>).respondentInfo!.fullName;
    }
  
    return '';
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-red-600 bg-red-50 rounded-md">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Blotters Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Case No.</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Complainant(s)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Respondent(s)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Nature of Complaint</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Date Filed</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {blotters.map((blotter) => (
              <tr key={blotter._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{blotter.caseNo}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getPartyNames(blotter, 'complainants')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getPartyNames(blotter, 'respondents')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{blotter.natureOfComplaint}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${blotter.status === 'settled' ? 'bg-green-100 text-green-800' :
                      blotter.status === 'endorsed' ? 'bg-red-100 text-red-800' :
                      blotter.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800' }`}>
                    {blotter.status.charAt(0).toUpperCase() + blotter.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(blotter.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleView(blotter)}
                    className="text-green-600 hover:text-green-900 flex items-center gap-1"
                  >
                    <FaEye /> View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View Blotter Modal */}
      {showModal && selectedBlotter && (
        <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Blotter Details</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-700 hover:text-gray-900"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Blotter Information */}
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Case No.
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="caseNo"
                        value={editForm.caseNo || ''}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md text-gray-900"
                      />
                    ) : (
                      <p className="text-gray-900">{selectedBlotter.caseNo}</p>
                    )}
                  </div>

                  {/* Complainants - editable list */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Complainant(s)
                    </label>

                    {isEditing ? (
                      <div className="space-y-3">
                        {(editForm.complainants && editForm.complainants.length > 0) ? (
                          (editForm.complainants as Party[]).map((p, idx) => (
                            <div key={idx} className="p-3 border border-gray-200 rounded-md">
                              <div className="flex items-center gap-3">
                                <select
                                  value={p.type}
                                  onChange={e => handlePartyTypeChange('complainants', idx, e.target.value as 'Resident' | 'Non-Resident')}
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
                                  className="p-2 bg-green-600 text-white hover:bg-green-700 hover:text-white rounded-md"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500">No complainants</p>
                        )}

                        <div>
                          <button
                            type="button"
                            onClick={() => addParty('complainants')}
                            className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                          >
                            + Add Complainant
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {(selectedBlotter.complainants && selectedBlotter.complainants.length > 0)
                          ? selectedBlotter.complainants.map((p, i) => (
                              <div key={i} className="text-gray-900">
                                <span className="font-medium">{p.name}</span>
                                <span className="ml-2 text-xs text-gray-500">({p.type})</span>
                              </div>
                            ))
                          : selectedBlotter.complainantInfo?.fullName ? (
                              <p className="text-gray-900">{selectedBlotter.complainantInfo.fullName}</p>
                            ) : (
                              <p className="text-gray-500">No complainant information</p>
                            )}
                      </div>
                    )}
                  </div>

                  {/* Respondents - editable list */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Respondent(s)
                    </label>

                    {isEditing ? (
                      <div className="space-y-3">
                        {(editForm.respondents && editForm.respondents.length > 0) ? (
                          (editForm.respondents as Party[]).map((p, idx) => (
                            <div key={idx} className="p-3 border border-gray-200 rounded-md">
                              <div className="flex items-center gap-3">
                                <select
                                  value={p.type}
                                  onChange={e => handlePartyTypeChange('respondents', idx, e.target.value as 'Resident' | 'Non-Resident')}
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
                                  className="p-2 bg-green-600 text-white hover:bg-green-700 hover:text-white rounded-md"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500">No respondents</p>
                        )}

                        <div>
                          <button
                            type="button"
                            onClick={() => addParty('respondents')}
                            className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                          >
                            + Add Respondent
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {(selectedBlotter.respondents && selectedBlotter.respondents.length > 0)
                          ? selectedBlotter.respondents.map((p, i) => (
                              <div key={i} className="text-gray-900">
                                <span className="font-medium">{p.name}</span>
                                <span className="ml-2 text-xs text-gray-500">({p.type})</span>
                              </div>
                            ))
                          : selectedBlotter.respondentInfo?.fullName ? (
                              <p className="text-gray-900">{selectedBlotter.respondentInfo.fullName}</p>
                            ) : (
                              <p className="text-gray-500">No respondent information</p>
                            )}
                      </div>
                    )}
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Complaint
                    </label>
                    {isEditing ? (
                      <textarea
                        name="complaint"
                        value={editForm.complaint || ''}
                        onChange={handleChange}
                        rows={4}
                        className="w-full p-2 border border-gray-300 rounded-md text-gray-900"
                      />
                    ) : (
                      <p className="text-gray-900">{selectedBlotter.complaint}</p>
                    )}
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nature of Complaint
                    </label>
                    {isEditing ? (
                      <select
                        name="natureOfComplaint"
                        value={editForm.natureOfComplaint || ''}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md text-gray-900"
                      >
                        <option value="">Select nature of complaint</option>
                        {complaintNatures.map((nature) => (
                          <option key={nature} value={nature}>
                            {nature}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-gray-900">{selectedBlotter.natureOfComplaint}</p>
                    )}
                  </div>

                  {isEditing && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        name="status"
                        value={editForm.status || 'pending'}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md text-gray-900"
                      >
                        <option value="pending">Pending</option>
                        <option value="on-going">On-going</option>
                        <option value="settled">Settled</option>
                        <option value="endorsed">Endorsed</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="border-t pt-4 flex justify-end space-x-4">
                  {!isEditing ? (
                    <button
                      onClick={handleEdit}
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      <FaEdit className="inline-block mr-2" />
                      Edit
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveChanges}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Save Changes
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}