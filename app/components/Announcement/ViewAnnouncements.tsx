import React, { useState } from 'react';
import { FaEdit } from 'react-icons/fa';
import { FaTrash } from 'react-icons/fa';
import { FaSearch } from 'react-icons/fa';
import Image from 'next/image';

export type Announcement = {
  _id: string;
  title: string;
  description: string;
  image: string;
  postedBy: string;
  dateCreated: string;
  dateUpdated?: string;
};

type ViewAnnouncementsProps = {
  announcements: Announcement[];
  onRefresh?: () => void;
  readOnly?: boolean;
};

const ViewAnnouncements = ({ announcements, onRefresh, readOnly }: ViewAnnouncementsProps) => {
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editImage, setEditImage] = useState('');
  const [editImagePreview, setEditImagePreview] = useState('');
  const [editPostedBy, setEditPostedBy] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const openEdit = (a: Announcement) => {
    setEditing(a);
    setEditTitle(a.title);
    setEditDescription(a.description);
    setEditImage(a.image);
    setEditImagePreview(a.image);
    setEditPostedBy(a.postedBy);
    setError('');
  };

  const closeEdit = () => {
    setEditing(null);
    setEditTitle('');
    setEditDescription('');
    setEditImage('');
    setEditImagePreview('');
    setEditPostedBy('');
    setError('');
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditImage(reader.result as string);
        setEditImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/announcement/edit-announcement', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editing._id,
          title: editTitle,
          description: editDescription,
          image: editImage,
          postedBy: editPostedBy,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to update announcement');
      } else {
        closeEdit();
        if (onRefresh) onRefresh();
      }
    } catch {
      setError('Failed to update announcement');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    setDeletingId(id);
    try {
      const res = await fetch('/api/announcement/delete-announcement', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok && onRefresh) onRefresh();
    } catch {
      // Optionally show error
    } finally {
      setDeletingId(null);
    }
  };

  // Filter announcements by search
  const filteredAnnouncements = announcements.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Search Bar */}
      <div className="mb-6 flex items-center gap-2 max-w-md mx-auto">
        <div className="relative w-full">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search announcements..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
          />
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-green-400" />
        </div>
      </div>
      {filteredAnnouncements.length === 0 ? (
        <div className="text-gray-500 text-center">No announcements found.</div>
      ) : (
        filteredAnnouncements.map(a => (
          <div
            key={a._id}
            className="flex flex-col bg-white border border-green-200 shadow-xl rounded-3xl overflow-hidden hover:shadow-2xl transition-shadow group p-6 md:p-10 max-w-2xl mx-auto"
          >
            {/* Title row and icons centered */}
            <div className="flex flex-col items-center justify-center mb-2">
              <div className="flex flex-row items-center justify-center gap-4 w-full">
                <h3 className="text-2xl md:text-3xl font-extrabold text-green-900 tracking-tight text-center flex-1">
                  {a.title}
                </h3>
                {!readOnly && (
                  <div className="flex gap-2">
                    <button
                      className="p-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200 text-lg font-semibold shadow-sm flex items-center justify-center"
                      onClick={() => openEdit(a)}
                      aria-label="Edit Announcement"
                      title="Edit Announcement"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="p-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200 text-lg font-semibold shadow-sm flex items-center justify-center"
                      aria-label="Delete Announcement"
                      title="Delete Announcement"
                      onClick={() => handleDelete(a._id)}
                      disabled={deletingId === a._id}
                    >
                      {deletingId === a._id ? (
                        <svg className="animate-spin h-5 w-5 text-green-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                      ) : (
                        <FaTrash />
                      )}
                    </button>
                  </div>
                )}
              </div>
              <div className="flex flex-col md:flex-row items-center justify-center gap-2 mt-2 w-full">
                <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                  Posted by: {a.postedBy}
                </span>
                <span className="inline-block bg-lime-100 text-lime-800 px-3 py-1 rounded-full text-xs font-semibold">
                  Published: {new Date(a.dateCreated).toLocaleString()}
                </span>
              </div>
            </div>
            {/* Description centered */}
            <div className="mb-4 text-gray-700 leading-relaxed text-lg text-center font-medium">
              {a.description}
            </div>
            {/* Image centered and large */}
            <div className="flex justify-center items-center">
              <Image
                src={a.image}
                alt={a.title}
                width={400}
                height={400}
                className="object-cover rounded-2xl border-4 border-green-200 shadow-lg"
                style={{ maxWidth: '100%' }}
                unoptimized
              />
            </div>
          </div>
        ))
      )}

      {/* Edit Modal */}
      {editing && !readOnly && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold"
              onClick={closeEdit}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4 text-green-800">Edit Announcement</h2>
            {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                className="w-full border p-2 rounded text-gray-900 placeholder-gray-500"
                required
              />
              <textarea
                placeholder="Description"
                value={editDescription}
                onChange={e => setEditDescription(e.target.value)}
                className="w-full border p-2 rounded text-gray-900 placeholder-gray-500"
                required
              />
              <div>
                <label className="block mb-1 text-gray-900 font-medium">Image</label>
                {editImagePreview && (
                  <Image src={editImagePreview} alt="Preview" width={128} height={128} className="mb-2 w-32 h-32 object-cover rounded border" unoptimized />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleEditImageChange}
                  className="w-full border p-2 rounded text-gray-900 bg-white"
                />
              </div>
              <input
                type="text"
                placeholder="Posted By"
                value={editPostedBy}
                onChange={e => setEditPostedBy(e.target.value)}
                className="w-full border p-2 rounded text-gray-900 placeholder-gray-500"
                required
              />
              <button
                type="submit"
                className="bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50 w-full"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewAnnouncements;
