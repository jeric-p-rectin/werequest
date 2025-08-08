'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FaCheck, FaTimes, FaClock } from 'react-icons/fa';

interface DocumentRequest {
  _id: string;
  requestId: string;
  requestedFor: string;
  fullName: string;
  documentType: string;
  copies: number;
  purpose: string;
  proofOfAuthority?: string | null;
  proofOfAuthorityName?: string | null;
  proofOfAuthoritySize?: number | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface APIResponse {
  success: boolean;
  data: DocumentRequest[];
  error?: string;
}

export default function ViewRequestedDocuments() {
  const { data: session } = useSession();
  const [documents, setDocuments] = useState<DocumentRequest[]>([]);
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
          (doc: DocumentRequest) => doc.fullName === session?.user?.fullName
        );
        
        setDocuments(userDocuments);
        setError(null);
      } catch (err) {
        console.error('Error fetching documents:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching documents');
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.fullName) {
      fetchDocuments();
    }
  }, [session?.user?.fullName]);

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
    if (doc.status === 'declined') {
      return <FaTimes className="text-red-500 w-5 h-5" title="Declined" />;
    }
    if (doc.status === 'approved') {
      return <FaCheck className="text-green-500 w-5 h-5" title="Approved" />;
    }
    if (doc.status === 'verified') {
      return <FaCheck className="text-blue-500 w-5 h-5" title="Verified" />;
    }
    return <FaClock className="text-yellow-500 w-5 h-5" title="Pending" />;
  };

  const getStatusText = (doc: DocumentRequest) => {
    if (doc.status === 'declined') return 'Declined';
    if (doc.status === 'approved') return 'Approved';
    if (doc.status === 'verified') return 'Verified';
    return 'Pending';
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">My Requested Documents</h2>
          
          {documents.length === 0 ? (
            <p className="text-gray-600 text-center py-4">No documents requested yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Request ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Document Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Purpose
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Copies
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Request Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {documents.map((doc) => (
                    <tr key={doc.requestId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {doc.requestId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {doc.documentType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {doc.purpose}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {doc.copies}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(doc)}
                          <span className="ml-2 text-sm text-gray-900">
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
      </div>
    </div>
  );
}
