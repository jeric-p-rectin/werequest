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
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Profile = () => {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [editableData, setEditableData] = useState<EditableFields>({
    username: '',
    email: '',
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
          username: result.data.username || '',
          email: result.data.email || '',
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditableData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editableData.password !== editableData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('/api/profile/edit-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: editableData.username,
          email: editableData.email,
          password: editableData.password || undefined // Only send if password was changed
        }),
      });

      const result = await response.json();

      if (result.success) {
        setProfileData(prev => prev ? { ...prev, username: editableData.username, email: editableData.email } : null);
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
            <div>
              <label className="block text-sm font-medium text-gray-600">Username</label>
              <input
                type="text"
                name="username"
                value={editableData.username}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-gray-900"
              />
            </div>
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
            {isEditing && (
              <>
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
                    username: profileData?.username || '',
                    email: profileData?.email || '',
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
