import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

const AddAnnouncement = ({ onAdded }: { onAdded: () => void }) => {
  const { data: session, status } = useSession();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(''); // base64 string
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [postedBy, setPostedBy] = useState('');

  useEffect(() => {
    if (session?.user?.fullName) {
      setPostedBy(session.user.fullName);
    }
  }, [session]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImage('');
      setImagePreview('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/announcement/add-announcement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, image, postedBy }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to add announcement');
      } else {
        setTitle('');
        setDescription('');
        setImage('');
        setImagePreview('');
        onAdded();
      }
    } catch {
      setError('Failed to add announcement');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') return <div>Loading...</div>;
  if (!session) return <div className="text-red-500">You must be logged in to add an announcement.</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold text-gray-900">Add Announcement</h2>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        className="w-full border p-2 rounded text-gray-900 placeholder-gray-500"
        required
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={e => setDescription(e.target.value)}
        className="w-full border p-2 rounded text-gray-900 placeholder-gray-500"
        required
      />
      {/* Image upload and preview */}
      <div>
        <label className="block mb-1 text-gray-900 font-medium">Image</label>
        {imagePreview && (
          <Image src={imagePreview} alt="Preview" width={128} height={128} className="mb-2 w-32 h-32 object-cover rounded border" unoptimized />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full border p-2 rounded text-gray-900 bg-white"
          required
        />
      </div>
      <div className="text-sm text-gray-600">Posted by: <span className="font-semibold text-green-700">{postedBy}</span></div>
      <button
        type="submit"
        className="bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Adding...' : 'Add Announcement'}
      </button>
    </form>
  );
};

export default AddAnnouncement;
