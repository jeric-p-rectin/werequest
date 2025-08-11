'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FaCheck, FaTimes, FaClock, FaFolder, FaChevronDown, FaChevronRight } from 'react-icons/fa';

interface DocumentRequest {
  _id: string;
  requestId: string;
  requestorInformation: {
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
    role: string;
    _id: string;
  };
  documentType: string;
  copies: string;
  purpose: string;
  requestDate: string;
  decline: {
    status: boolean;
    reason: string | null;
    declinedBy: string | null;
    declinedAt: string | null;
  };
  verify: {
    status: boolean;
    verifiedBy: string | null;
    verifiedAt: string | null;
  };
  approved: {
    status: boolean;
    approvedBy: string | null;
    approvedAt: string | null;
  };
  createdAt: string;
  updatedAt: string;
  folderId: string;
}

interface APIResponse {
  success: boolean;
  data: DocumentRequest[];
  error?: string;
}

interface FolderGroup {
  folderId: string;
  documents: DocumentRequest[];
  isExpanded: boolean;
}

export default function ViewRequestedDocuments() {
  const { data: session } = useSession();
  const [documents, setDocuments] = useState<DocumentRequest[]>([]);
  const [folderGroups, setFolderGroups] = useState<FolderGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch('/api/document/get-all-documents');
        if (!response.ok) throw new Error('Failed to fetch documents');
        
        const result: APIResponse = await response.json();
        
        // Check if the response has the expected structure
        if (!result.success || !result.data) {
          throw new Error(result.error || 'Invalid data format received from server');
        }

        // Filter documents for the current resident
        const userDocuments = result.data.filter(
          (doc: DocumentRequest) => doc.requestorInformation?.fullName === session?.user?.fullName
        );
        
        setDocuments(userDocuments);
        
        // Group documents by folderId
        const grouped = groupDocumentsByFolder(userDocuments);
        setFolderGroups(grouped);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching documents:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching documents');
        setDocuments([]);
        setFolderGroups([]);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.fullName) {
      fetchDocuments();
    }
  }, [session?.user?.fullName]);

  const groupDocumentsByFolder = (docs: DocumentRequest[]): FolderGroup[] => {
    const groups: { [key: string]: DocumentRequest[] } = {};
    
    docs.forEach(doc => {
      const folderId = doc.folderId || 'uncategorized';
      if (!groups[folderId]) {
        groups[folderId] = [];
      }
      groups[folderId].push(doc);
    });

    // Convert to array and sort by folder date (most recent first)
    const folderArray = Object.keys(groups).map(folderId => ({
      folderId,
      documents: groups[folderId],
      isExpanded: true
    }));

    // Sort folders by date (most recent first)
    return folderArray.sort((a, b) => {
      // Handle uncategorized folder
      if (a.folderId === 'uncategorized') return 1;
      if (b.folderId === 'uncategorized') return -1;

      // Extract date from folderId (format: userId_date)
      const getDateFromFolderId = (folderId: string) => {
        const parts = folderId.split('_');
        if (parts.length >= 2) {
          const datePart = parts.slice(1).join('_');
          try {
            return new Date(datePart);
          } catch {
            return new Date(0); // Invalid date
          }
        }
        return new Date(0); // Invalid date
      };

      const dateA = getDateFromFolderId(a.folderId);
      const dateB = getDateFromFolderId(b.folderId);

      // Sort in descending order (most recent first)
      return dateB.getTime() - dateA.getTime();
    });
  };

  const toggleFolder = (folderId: string) => {
    setFolderGroups(prev => 
      prev.map(folder => 
        folder.folderId === folderId 
          ? { ...folder, isExpanded: !folder.isExpanded }
          : folder
      )
    );
  };

  const getFolderDisplayName = (folderId: string) => {
    if (folderId === 'uncategorized') return 'Uncategorized Documents';
    
    // Extract date from folderId (format: userId_date)
    const parts = folderId.split('_');
    if (parts.length >= 2) {
      const datePart = parts.slice(1).join('_');
      try {
        const date = new Date(datePart);
        return `Documents from ${date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}`;
      } catch {
        return `Folder: ${folderId}`;
      }
    }
    
    return `Folder: ${folderId}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        Error: {error}
      </div>
    );
  }

  const getStatusIcon = (doc: DocumentRequest) => {
    if (doc.decline.status) {
      return <FaTimes className="text-red-500 w-5 h-5" title="Declined" />;
    }
    if (doc.approved.status) {
      return <FaCheck className="text-green-500 w-5 h-5" title="Approved" />;
    }
    if (doc.verify.status) {
      return <FaCheck className="text-blue-500 w-5 h-5" title="Verified" />;
    }
    return <FaClock className="text-yellow-500 w-5 h-5" title="Pending" />;
  };

  const getStatusText = (doc: DocumentRequest) => {
    if (doc.decline.status) return 'Declined';
    if (doc.approved.status) return 'Approved';
    if (doc.verify.status) return 'Verified';
    return 'Pending';
  };

  return (
    <div className="p-2 sm:p-4 lg:p-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-3 sm:p-4 lg:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">My Requested Documents</h2>
          
          {folderGroups.length === 0 ? (
            <p className="text-gray-600 text-center py-4">No documents requested yet.</p>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {folderGroups.map((folder) => (
                <div key={folder.folderId} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Folder Header */}
                  <div 
                    className="bg-gray-50 px-3 sm:px-4 py-2 sm:py-3 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => toggleFolder(folder.folderId)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                        <FaFolder className="text-blue-500 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                        <span className="font-medium text-gray-700 text-sm sm:text-base truncate">
                          {getFolderDisplayName(folder.folderId)}
                        </span>
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex-shrink-0">
                          {folder.documents.length} document{folder.documents.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      {folder.isExpanded ? (
                        <FaChevronDown className="text-gray-500 w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      ) : (
                        <FaChevronRight className="text-gray-500 w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      )}
                    </div>
                  </div>

                  {/* Folder Content */}
                  {folder.isExpanded && (
                    <div className="overflow-x-auto">
                      {/* Mobile Card View */}
                      <div className="block sm:hidden">
                        {folder.documents.map((doc) => (
                          <div key={doc.requestId} className="border-b border-gray-100 p-3 hover:bg-gray-50">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-gray-500 uppercase">Request ID</span>
                                <span className="text-sm font-medium text-gray-900">{doc.requestId}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-gray-500 uppercase">Document Type</span>
                                <span className="text-sm text-gray-900">{doc.documentType}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-gray-500 uppercase">Purpose</span>
                                <span className="text-sm text-gray-900">{doc.purpose}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-gray-500 uppercase">Copies</span>
                                <span className="text-sm text-gray-900">{doc.copies}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-gray-500 uppercase">Request Date</span>
                                <span className="text-sm text-gray-900">
                                  {new Date(doc.requestDate).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-gray-500 uppercase">Status</span>
                                <div className="flex items-center">
                                  {getStatusIcon(doc)}
                                  <span className="ml-2 text-sm text-gray-900">
                                    {getStatusText(doc)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Desktop Table View */}
                      <table className="hidden sm:table min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Request ID
                            </th>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Document Type
                            </th>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Purpose
                            </th>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Copies
                            </th>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Request Date
                            </th>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {folder.documents.map((doc) => (
                            <tr key={doc.requestId} className="hover:bg-gray-50">
                              <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                                {doc.requestId}
                              </td>
                              <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                                {doc.documentType}
                              </td>
                              <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                                {doc.purpose}
                              </td>
                              <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                                {doc.copies}
                              </td>
                              <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                                {new Date(doc.requestDate).toLocaleDateString()}
                              </td>
                              <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  {getStatusIcon(doc)}
                                  <span className="ml-2 text-xs sm:text-sm text-gray-900">
                                    {getStatusText(doc)}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}