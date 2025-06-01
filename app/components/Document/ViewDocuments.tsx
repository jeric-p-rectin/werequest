'use client';

import { useState, useEffect } from 'react';
import { FaEye } from 'react-icons/fa';
import { RequestedDocument } from '@/app/types/document';

export default function ViewDocuments() {
  const [documents, setDocuments] = useState<RequestedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<RequestedDocument | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [declineReason, setDeclineReason] = useState('');

  // Helper function to get requestor's name
  const getRequestorName = (doc: RequestedDocument) => {
    if (doc.requestorInformation?.fullName) {
      return doc.requestorInformation.fullName;
    }
    // Fallback for old document format
    return (doc as any).name || 'N/A';
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/document/get-all-documents');
      if (!response.ok) throw new Error('Failed to fetch documents');
      const data = await response.json();
      setDocuments(data.data);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  const handleViewDocument = (document: RequestedDocument) => {
    setSelectedDocument(document);
    setShowModal(true);
    // Reset form states
    setDeclineReason('');
  };

  const handleDecline = async () => {
    if (!selectedDocument || !declineReason) return;

    try {
      const response = await fetch(`/api/document/document-options/${selectedDocument._id}/decline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: declineReason }),
      });

      if (!response.ok) throw new Error('Failed to decline document');
      
      await fetchDocuments(); // Refresh the documents list
      setShowModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to decline document');
    }
  };

  const handleVerify = async () => {
    if (!selectedDocument) return;

    try {
      const response = await fetch(`/api/document/document-options/${selectedDocument._id}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) throw new Error('Failed to verify document');
      
      await fetchDocuments(); // Refresh the documents list
      setShowModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify document');
    }
  };

  const handleApprove = async () => {
    if (!selectedDocument) return;

    try {
      const response = await fetch(`/api/document/document-options/${selectedDocument._id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) throw new Error('Failed to approve document');
      
      await fetchDocuments(); // Refresh the documents list
      setShowModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve document');
    }
  };

  const handleRestore = async () => {
    if (!selectedDocument) return;

    try {
      const response = await fetch(`/api/document/document-options/${selectedDocument._id}/restore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) throw new Error('Failed to restore document');
      
      await fetchDocuments(); // Refresh the documents list
      setShowModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to restore document');
    }
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
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Document Requests</h2>
      </div>

      {/* Documents Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Request ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Document Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Purpose</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {documents.map((doc) => (
              <tr key={doc._id.toString()} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doc.requestId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getRequestorName(doc)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doc.documentType}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doc.purpose}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${doc.approved.status ? 'bg-green-100 text-green-800' : 
                      doc.verify.status ? 'bg-blue-100 text-blue-800' :
                      doc.decline.status ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'}`}>
                    {doc.approved.status ? 'Approved' :
                     doc.verify.status ? 'Verified' :
                     doc.decline.status ? 'Declined' :
                     'Pending'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleViewDocument(doc)}
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
      {showModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Document Request Details</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-700 hover:text-gray-900"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Request Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Request ID</p>
                    <p className="text-gray-900">{selectedDocument.requestId}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Request Date</p>
                    <p className="text-gray-900">{new Date(selectedDocument.requestDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Name</p>
                    <p className="text-gray-900">{getRequestorName(selectedDocument)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Document Type</p>
                    <p className="text-gray-900">{selectedDocument.documentType}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Purpose</p>
                    <p className="text-gray-900">{selectedDocument.purpose}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Copies</p>
                    <p className="text-gray-900">{selectedDocument.copies}</p>
                  </div>
                </div>

                {/* Status Information */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Status Information</h3>
                  <div className="space-y-4">
                    {selectedDocument.verify.status && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Verified By</p>
                        <p className="text-gray-900">{selectedDocument.verify.verifiedBy}</p>
                      </div>
                    )}
                    
                    {selectedDocument.decline.status && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Declined By</p>
                        <p className="text-gray-900">{selectedDocument.decline.declinedBy}</p>
                        <p className="text-sm font-medium text-gray-700 mt-2 mb-1">Decline Reason</p>
                        <p className="text-gray-900">{selectedDocument.decline.reason || 'No reason provided'}</p>
                      </div>
                    )}

                    {selectedDocument.approved.status && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Approved By</p>
                        <p className="text-gray-900">{selectedDocument.approved.approvedBy}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Forms */}
                {!selectedDocument.approved.status && (
                  <div className="border-t pt-4 space-y-4">
                    {!selectedDocument.decline.status && !selectedDocument.verify.status && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Decline Reason
                        </label>
                        <textarea
                          value={declineReason}
                          onChange={(e) => setDeclineReason(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md text-gray-900"
                          rows={2}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="border-t pt-4 flex justify-end space-x-4">
                  {selectedDocument.decline.status && (
                    <button
                      onClick={handleRestore}
                      className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    >
                      Restore
                    </button>
                  )}
                  {!selectedDocument.decline.status && !selectedDocument.verify.status && (
                    <button
                      onClick={handleDecline}
                      disabled={!declineReason}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      Decline
                    </button>
                  )}
                  {!selectedDocument.verify.status && !selectedDocument.decline.status && (
                    <button
                      onClick={handleVerify}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Verify
                    </button>
                  )}
                  {!selectedDocument.approved.status && !selectedDocument.decline.status && (
                    <button
                      onClick={handleApprove}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Approve
                    </button>
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
