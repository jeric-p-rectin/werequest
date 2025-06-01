'use client';

import { useState, useEffect } from 'react';
import { FaEye, FaEdit } from 'react-icons/fa';

interface Blotter {
  _id: string;
  caseNo: string;
  complainantInfo: {
    fullName: string;
  };
  respondentInfo: {
    fullName: string;
  };
  complaint: string;
  natureOfComplaint: string;
  status: 'pending' | 'settled' | 'declined';
  createdAt: string;
}

interface Resident {
  _id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  fullName?: string;
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
        fullName: resident.fullName || `${resident.firstName} ${resident.middleName ? resident.middleName + ' ' : ''}${resident.lastName}`
      }));
      setResidents(formattedResidents);
    } catch (err) {
      console.error('Error fetching residents:', err);
    }
  };

  const handleView = (blotter: Blotter) => {
    setSelectedBlotter(blotter);
    setEditForm(blotter);
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

  const handleSaveChanges = async () => {
    if (!selectedBlotter?._id) return;

    try {
      // Remove _id from editForm
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _id: _, ...updateData } = editForm;

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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Complainant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Respondent</th>
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{blotter.complainantInfo?.fullName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{blotter.respondentInfo?.fullName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{blotter.natureOfComplaint}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${blotter.status === 'settled' ? 'bg-green-100 text-green-800' : 
                      blotter.status === 'declined' ? 'bg-red-100 text-red-800' : 
                      'bg-yellow-100 text-yellow-800'}`}>
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

      {/* View Document Modal */}
      {showModal && selectedBlotter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
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
                <div className="grid grid-cols-2 gap-4">
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Complainant
                    </label>
                    {isEditing ? (
                      <select
                        name="complainant"
                        value={editForm.complainantInfo?.fullName || ''}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md text-gray-900"
                      >
                        <option value="">Select complainant</option>
                        {residents.map((resident) => (
                          <option key={resident._id} value={resident.fullName}>
                            {resident.fullName}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-gray-900">{selectedBlotter.complainantInfo?.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Respondent
                    </label>
                    {isEditing ? (
                      <select
                        name="respondent"
                        value={editForm.respondentInfo?.fullName || ''}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md text-gray-900"
                      >
                        <option value="">Select respondent</option>
                        {residents.map((resident) => (
                          <option key={resident._id} value={resident.fullName}>
                            {resident.fullName}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-gray-900">{selectedBlotter.respondentInfo?.fullName}</p>
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
                        <option value="settled">Settled</option>
                        <option value="declined">Declined</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="border-t pt-4 flex justify-end space-x-4">
                  {!isEditing ? (
                    <button
                      onClick={handleEdit}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
