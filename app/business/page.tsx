'use client';
import { useState, useRef, useEffect } from 'react';
import SideNavigation from '../components/SideNavigation';
import { FaPlus, FaEdit, FaFile, FaFlag, FaTimes, FaSearch } from 'react-icons/fa';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Image from 'next/image';

interface Business {
  _id?: string | { toString?: () => string };
  id?: string;
  ownerName?: string;
  businessName?: string;
  address?: string;
  businessNature?: string;
  dateEstablished?: string;
}

export default function BusinessPage() {
  const { data: session, status } = useSession();

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showEdit, setShowEdit] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState<string | null>(null);

  // permit modal
  const [showPermit, setShowPermit] = useState(false);
  const [permitSrc, setPermitSrc] = useState('');

  // businesses state
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loadingBiz, setLoadingBiz] = useState(true);

  // form states
  const [ownerName, setOwnerName] = useState('');
  const [bizName, setBizName] = useState('');
  const [addr, setAddr] = useState('');
  const [nature, setNature] = useState('');
  const [established, setEstablished] = useState('');
  const [loadingNew, setLoadingNew] = useState(false);

  // edit form states
  const [editOwnerName, setEditOwner] = useState('');
  const [editBusinessName, setEditBiz] = useState('');
  const [editAddress, setEditAddr] = useState('');
  const [editBusinessNature, setEditNature] = useState('');
  const [editDateEstablished, setEditEstablished] = useState('');
  const [loadingEdit, setLoadingEdit] = useState(false);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        notifRef.current && !notifRef.current.contains(e.target as Node) &&
        profileRef.current && !profileRef.current.contains(e.target as Node)
      ) {
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // fetch businesses
  const fetchBusinesses = async () => {
    try {
      const res = await fetch('/api/business/get-all-business');
      if (!res.ok) throw new Error('Failed to fetch businesses');
      const data = await res.json();
      setBusinesses(data);
    } catch (err) {
      console.error('Error fetching businesses:', err);
    } finally {
      setLoadingBiz(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  if (status === 'loading' || loadingBiz) {
    return <div>Loading...</div>;
  }

  if (!session || !['admin', 'super admin'].includes(session.user.role)) {
    redirect('/');
  }

  const filteredBusinesses = businesses.filter((b) =>
    (b.ownerName && b.ownerName.toLowerCase().includes(search.toLowerCase())) ||
    (b.businessName && b.businessName.toLowerCase().includes(search.toLowerCase())) ||
    (b.address && b.address.toLowerCase().includes(search.toLowerCase())) ||
    (b.businessNature && b.businessNature.toLowerCase().includes(search.toLowerCase()))
  );
  
  // add new business
  const handleNewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingNew(true);
    try {
      const res = await fetch('/api/business/add-business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerName,
          businessName: bizName,
          address: addr,
          businessNature: nature,
          dateEstablished: established
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setShowNew(false);
      setOwnerName('');
      setBizName('');
      setAddr('');
      setNature('');
      setEstablished('');
      await fetchBusinesses();
    } catch (err) {
      console.error('Add business failed:', err);
    } finally {
      setLoadingNew(false);
    }
  };

  // open edit modal
  const handleOpenEdit = (biz: Business) => {
    const id = typeof biz._id === 'string' ? biz._id : biz._id?.toString?.() || biz.id;
    setShowEdit(id as string);
    setEditOwner(biz.ownerName as string);
    setEditBiz(biz.businessName as string);
    setEditAddr(biz.address as string);
    setEditNature(biz.businessNature as string);
    setEditEstablished(biz.dateEstablished?.slice(0, 10) as string); // format yyyy-mm-dd
  };

  // open permit modal (shows image and allows download)
  const handleOpenPermit = () => {
    // currently show static image; change if you want per-business images
    setPermitSrc('/images/business.jpg');
    setShowPermit(true);
  };

  // update business
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEdit) return;
    setLoadingEdit(true);
    try {
      const res = await fetch(`/api/business/edit-business`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: showEdit,
          ownerName: editOwnerName,
          businessName: editBusinessName,
          address: editAddress,
          businessNature: editBusinessNature,
          dateEstablished: editDateEstablished,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setShowEdit(null);
      await fetchBusinesses();
    } catch (err) {
      console.error('Update business failed:', err);
    } finally {
      setLoadingEdit(false);
    }
  };

  // delete business
  const handleDelete = async () => {
    if (!showDelete) return;
    try {
      const res = await fetch(`/api/business/delete-business/${showDelete}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Delete failed');
      }
      setShowDelete(null);
      await fetchBusinesses();
    } catch (err) {
      console.error('Delete business failed:', err);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SideNavigation />
      <div className="flex-1 p-8 text-black">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold text-green-800">BUSINESS</h1>
          <div className="flex-1 flex justify-center">
            <div className="relative w-full max-w-xs">
              <input
                type="search"
                placeholder="Search here"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 shadow-sm bg-white pr-10"
              />
              <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowNew(true)} className="nav pnav flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium"><FaPlus /> New</button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow p-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Owner&apos;s Name</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Business Name</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Address</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Nature of Business</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Established</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-black uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBusinesses.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-gray-500 py-8">No Records</td></tr>
              ) : (
                filteredBusinesses.map(b => {
                  const id = typeof b._id === 'string' ? b._id : b._id?.toString?.() || b.id;
                  return (
                    <tr key={id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{b.ownerName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{b.businessName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{b.address}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{b.businessNature}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{new Date(b.dateEstablished).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center flex gap-2 justify-center">
                        <button onClick={() => handleOpenPermit(b)} className="nav width0 flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium"><FaFile /> Permit</button>
                        <button onClick={() => handleOpenEdit(b)} className="nav width0 flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium"><FaEdit /> Edit</button>
                        <button onClick={() => setShowDelete(id)} className="nav width0 flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium"><FaFlag /> Claim</button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* New Business Modal */}
        {showNew && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
            <form onSubmit={handleNewSubmit} className="w-full max-w-lg p-8 bg-white rounded-2xl shadow-2xl flex flex-col gap-4 relative">
              <button type="button" className="absolute right-6 top-6 text-gray-500 hover:text-gray-800" onClick={() => setShowNew(false)}><FaTimes className="w-6 h-6" /></button>
              <p className="text-2xl font-bold mb-2">NEW BUSINESS</p>
              <div className="field">
                <label className="block mb-1">Owner&apos;s Name</label>
                <input type="text" value={ownerName} onChange={e => setOwnerName(e.target.value)} className="w-full border rounded px-3 py-2" />
              </div>
              <div className="field">
                <label className="block mb-1">Business Name</label>
                <input type="text" value={bizName} onChange={e => setBizName(e.target.value)} className="w-full border rounded px-3 py-2" />
              </div>
              <div className="field">
                <label className="block mb-1">Address</label>
                <input type="text" value={addr} onChange={e => setAddr(e.target.value)} className="w-full border rounded px-3 py-2" />
              </div>
              <div className="field">
                <label className="block mb-1">Nature of Business</label>
                <input type="text" value={nature} onChange={e => setNature(e.target.value)} className="w-full border rounded px-3 py-2" />
              </div>
              <div className="field">
                <label className="block mb-1">Date Established</label>
                <input type="date" value={established} onChange={e => setEstablished(e.target.value)} className="w-full border rounded px-3 py-2" />
              </div>
              <div className="flex justify-between mt-4">
                <button type="reset" className="py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 nav">Clear</button>
                <button type="submit" className="py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 nav pnav">{loadingNew ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        )}

        {/* Edit Business Modal */}
        {showEdit && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
            <form onSubmit={handleEditSubmit} className="w-full max-w-xl p-8 bg-white rounded-2xl shadow-2xl flex flex-col gap-4 relative">
              <button type="button" className="absolute right-6 top-6 text-gray-500 hover:text-gray-800" onClick={() => setShowEdit(null)}><FaTimes className="w-6 h-6" /></button>
              <p className="text-2xl text-black font-bold mb-2">EDIT BUSINESS</p>
              <div className="field">
                <label className="block mb-1 text-black">Owner&apos;s Name</label>
                <input type="text" value={editOwnerName} onChange={e => setEditOwner(e.target.value)} className="w-full text-black border rounded px-3 py-2" />
              </div>
              <div className="field">
                <label className="block mb-1 text-black">Business Name</label>
                <input type="text" value={editBusinessName} onChange={e => setEditBiz(e.target.value)} className="w-full border rounded px-3 py-2 text-black" />
              </div>
              <div className="field">
                <label className="block mb-1 text-black">Address</label>
                <input type="text" value={editAddress} onChange={e => setEditAddr(e.target.value)} className="w-full border rounded px-3 py-2 text-black" />
              </div>
              <div className="field">
                <label className="block mb-1 text-black">Nature of Business</label>
                <input type="text" value={editBusinessNature} onChange={e => setEditNature(e.target.value)} className="w-full border rounded px-3 py-2 text-black" />
              </div>
              <div className="field">
                <label className="block mb-1 text-black">Date Established</label>
                <input type="date" value={editDateEstablished} onChange={e => setEditEstablished(e.target.value)} className="w-full border rounded px-3 py-2 text-black" />
              </div>
              <div className="flex justify-end mt-4">
                <button type="submit" className="py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 nav pnav">{loadingEdit ? 'Updating...' : 'Update'}</button>
              </div>
            </form>
          </div>
        )}

        {/* Delete Modal */}
        {showDelete && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
            <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-2xl flex flex-col gap-4 relative items-center">
              <button type="button" className="absolute right-6 top-6 text-gray-500 hover:text-gray-800" onClick={() => setShowDelete(null)}><FaTimes className="w-6 h-6" /></button>
              <p className="text-3xl font-bold mb-2">WARNING</p>
              <p className="text-lg text-center">Want to clean things up <br />by trashing this business?</p>
              <div className="flex gap-4 mt-6">
                <button type="button" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition" onClick={() => setShowDelete(null)}>No, Cancel</button>
                <button type="button" onClick={handleDelete} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition">Yes, Move</button>
              </div>
            </div>
          </div>
        )}

        {/* Permit Modal */}
        {showPermit && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full overflow-hidden shadow-xl relative">
              <div className="flex justify-end p-3">
                <button onClick={() => setShowPermit(false)} className="text-gray-500 hover:text-gray-800">
                  <FaTimes className="w-6 h-6" />
                </button>
              </div>
              <div className="px-6 pb-6">
                <div className="mx-auto max-w-xl">
                  <div className="relative w-full h-96 bg-gray-100 rounded-md overflow-hidden">
                    <Image src={permitSrc} alt="Permit" fill className="object-contain" />
                  </div>
                  <div className="flex justify-between mt-4">
                    <a href={permitSrc} download className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition">Download</a>
                    <button onClick={() => setShowPermit(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition">Close</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}