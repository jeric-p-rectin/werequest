'use client';

import { useState, useEffect } from 'react';
import { FaEye, FaSearch } from 'react-icons/fa';

interface ResidentData {
  _id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  extName: string;
  birthday: string;
  age: number;
  birthPlace: string;
  gender: string;
  civilStatus: string;
  nationality: string;
  religion: string;
  email: string;
  phoneNumber: string;
  houseNo: string;
  purok: string;
  workingStatus: string;
  sourceOfIncome: string;
  votingStatus: string;
  educationalAttainment: string;
  soloParent: boolean;
  fourPsBeneficiary: boolean;
  pwd: boolean;
  pwdType: string | null;
}

const Residents = () => {
  const [residents, setResidents] = useState<ResidentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResident, setSelectedResident] = useState<ResidentData | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchResidents();
  }, []);

  const fetchResidents = async () => {
    try {
      const response = await fetch('/api/get-all-residents');
      if (!response.ok) throw new Error('Failed to fetch residents');
      const data = await response.json();
      setResidents(data.data);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  const filteredResidents = residents.filter(resident =>
    `${resident.firstName} ${resident.middleName} ${resident.lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (resident: ResidentData) => {
    setSelectedResident(resident);
    setShowModal(true);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
    </div>
  );

  if (error) return (
    <div className="text-red-500 text-center p-4">
      Error: {error}
    </div>
  );

  return (
    <div className="p-6">
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search residents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
      </div>

      {/* Residents Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredResidents.map((resident) => (
              <tr key={resident._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {`${resident.firstName} ${resident.middleName} ${resident.lastName}`}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{resident.email}</div>
                  <div className="text-sm text-gray-500">{resident.phoneNumber}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    House No. {resident.houseNo}, Purok {resident.purok}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col gap-1">
                    {resident.pwd && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        PWD
                      </span>
                    )}
                    {resident.soloParent && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                        Solo Parent
                      </span>
                    )}
                    {resident.fourPsBeneficiary && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        4Ps
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleViewDetails(resident)}
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

      {/* Details Modal */}
      {showModal && selectedResident && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Resident Details</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-lg text-gray-800">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="text-gray-800">{`${selectedResident.firstName} ${selectedResident.middleName} ${selectedResident.lastName} ${selectedResident.extName}`}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Birthday</p>
                      <p className="text-gray-800">{new Date(selectedResident.birthday).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Age</p>
                      <p className="text-gray-800">{selectedResident.age} years old</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Birth Place</p>
                      <p className="text-gray-800">{selectedResident.birthPlace}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Gender</p>
                      <p className="text-gray-800">{selectedResident.gender}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Civil Status</p>
                      <p className="text-gray-800">{selectedResident.civilStatus}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Nationality</p>
                      <p className="text-gray-800">{selectedResident.nationality}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Religion</p>
                      <p className="text-gray-800">{selectedResident.religion}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-lg text-gray-800">Contact & Address</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-gray-800">{selectedResident.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone Number</p>
                      <p className="text-gray-800">{selectedResident.phoneNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">House No.</p>
                      <p className="text-gray-800">{selectedResident.houseNo}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Purok</p>
                      <p className="text-gray-800">{selectedResident.purok}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-lg text-gray-800">Status & Benefits</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Working Status</p>
                      <p className="text-gray-800">{selectedResident.workingStatus}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Source of Income</p>
                      <p className="text-gray-800">{selectedResident.sourceOfIncome}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Voting Status</p>
                      <p className="text-gray-800">{selectedResident.votingStatus}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Educational Attainment</p>
                      <p className="text-gray-800">{selectedResident.educationalAttainment}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4 className="font-medium text-gray-800 mb-2">Special Categories</h4>
                    <div className="flex gap-2 flex-wrap">
                      {selectedResident.soloParent && (
                        <span className="px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                          Solo Parent
                        </span>
                      )}
                      {selectedResident.fourPsBeneficiary && (
                        <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                          4Ps Beneficiary
                        </span>
                      )}
                      {selectedResident.pwd && (
                        <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                          PWD - {selectedResident.pwdType || 'Not specified'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Residents;
