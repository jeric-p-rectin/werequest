'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FaUserCircle } from 'react-icons/fa';

interface ProfileData {
  username: string;
  email: string;
  firstName: string;
  middleName: string;
  lastName: string;
  extName: string;
  fullName: string;
  birthday: string;
  birthPlace: string;
  age: number;
  gender: string;
  civilStatus: string;
  nationality: string;
  religion: string;
  phoneNumber: string;
  houseNo: string;
  purok: string;
  workingStatus: string;
  sourceOfIncome: string;
  votingStatus: string;
  educationalAttainment: string;
}

interface EditableFields {
  email: string;
  phoneNumber: string;
  civilStatus: string;
  workingStatus: string;
  password?: string;
  confirmPassword?: string;
}

type ProfileUpdateBody = {
  email: string;
  phoneNumber: string;
  civilStatus: string;
  workingStatus: string;
  password?: string;
};

const Profile = () => {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [editableData, setEditableData] = useState<EditableFields>({
    email: '',
    phoneNumber: '',
    civilStatus: '',
    workingStatus: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile/get-profile');
      if (!response.ok) throw new Error('Failed to fetch profile');
      const result = await response.json();
      
      if (result.success) {
        setProfileData(result.data);
        setEditableData({
          email: result.data.email || '',
          phoneNumber: result.data.phoneNumber || '',
          civilStatus: result.data.civilStatus || '',
          workingStatus: result.data.workingStatus || '',
          password: '',
          confirmPassword: ''
        });
      } else {
        throw new Error(result.error);
      }
      
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditableData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdminUser && (editableData.password || editableData.confirmPassword)) {
      setError('Residents cannot change password.');
      return;
    }
    if (isAdminUser && editableData.password !== editableData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      const body: ProfileUpdateBody = {
        email: editableData.email,
        phoneNumber: editableData.phoneNumber,
        civilStatus: editableData.civilStatus,
        workingStatus: editableData.workingStatus,
      };
      if (isAdminUser) {
        body.password = editableData.password || undefined;
      }
      const response = await fetch('/api/profile/edit-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (result.success) {
        setProfileData(prev => prev ? { ...prev, ...body } : null);
        setEditableData(prev => ({ ...prev, password: '', confirmPassword: '' }));
        setIsEditing(false);
        setError(null);
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    }
  };

  // Check if user is admin or super admin
  const isAdminUser = session?.user?.role === 'admin' || session?.user?.role === 'super admin';

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
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Profile Header */}
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-green-500 flex items-center justify-center bg-gray-50">
            <FaUserCircle className="w-20 h-20 text-green-500" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">
              {profileData?.fullName || 'User Profile'}
            </h1>
            <p className="text-gray-600 capitalize">{session?.user?.role}</p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="ml-auto px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {/* Editable Fields */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 max-w-2xl">
            {/* Only show editable fields for residents */}
            {!isAdminUser && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={editableData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Phone Number</label>
                  <input
                    type="text"
                    name="phoneNumber"
                    value={editableData.phoneNumber}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Civil Status</label>
                  <select
                    name="civilStatus"
                    value={editableData.civilStatus}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-gray-900"
                  >
                    <option value="">Select</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Widowed">Widowed</option>
                    <option value="Separated">Separated</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Working Status</label>
                  <select
                    name="workingStatus"
                    value={editableData.workingStatus}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-gray-900"
                  >
                    <option value="">Select</option>
                    <option value="Employed">Employed</option>
                    <option value="Unemployed">Unemployed</option>
                    <option value="Student">Student</option>
                    <option value="Retired">Retired</option>
                  </select>
                </div>
              </>
            )}
            {/* Admin fields remain as before */}
            {isAdminUser && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={editableData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">New Password</label>
                  <input
                    type="password"
                    name="password"
                    value={editableData.password}
                    onChange={handleInputChange}
                    placeholder="Leave blank to keep current password"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-gray-900 placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={editableData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Leave blank to keep current password"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-gray-900 placeholder-gray-400"
                  />
                </div>
              </>
            )}
          </div>

          {/* Personal Information Display - Only show for residents */}
          {!isAdminUser && profileData && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h2 className="text-lg font-medium text-gray-800 mb-4">Personal Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="text-gray-800">{profileData.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Birthday</p>
                  <p className="text-gray-800">{new Date(profileData.birthday || '').toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Contact Number</p>
                  <p className="text-gray-800">{profileData.phoneNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="text-gray-800">House No. {profileData.houseNo}, Purok {profileData.purok}</p>
                </div>
              </div>
            </div>
          )}

          {isEditing && (
            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={() => {
                  setEditableData({
                    email: '',
                    phoneNumber: '',
                    civilStatus: '',
                    workingStatus: '',
                    password: '',
                    confirmPassword: ''
                  });
                  setIsEditing(false);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Save Changes
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Profile;
