'use client';
import { useState, useRef, useEffect } from 'react';
import SideNavigation from '../components/SideNavigation';
import { FaPlus, FaEdit, FaFile, FaFlag, FaArchive, FaTimes } from 'react-icons/fa';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

const mockBusinesses = [
  {
    id: 1,
    owner: 'Jeric Piamonte Rectin',
    name: '5star Hotel',
    address: '143 Purok 1',
    nature: 'Hotel Accommodation',
    established: '2007-02-14',
    status: 'Active',
  },
  {
    id: 2,
    owner: 'Jastin Baber Bibir',
    name: 'Sari-Sari Store',
    address: 'Purok 2',
    nature: 'Retail',
    established: '2015-06-01',
    status: 'Pending',
  },
  {
    id: 3,
    owner: 'Maestro Karteem Posses',
    name: 'Carinderia ni Aling Nena',
    address: 'Purok 3',
    nature: 'Food',
    established: '2018-09-10',
    status: 'Inactive',
  },
];

export default function BusinessPage() {
  const { data: session, status } = useSession();

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showEdit, setShowEdit] = useState<null | number>(null);
  const [showDelete, setShowDelete] = useState<null | number>(null);

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

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session || !['admin', 'super admin'].includes(session.user.role)) {
    redirect('/');
  }

  const filteredBusinesses = mockBusinesses.filter(b =>
    b.owner.toLowerCase().includes(search.toLowerCase()) ||
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.address.toLowerCase().includes(search.toLowerCase()) ||
    b.nature.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SideNavigation />
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold text-green-800">BUSINESS</h1>
          <div className="flex-1 flex justify-center">
            <input
              type="search"
              placeholder="Search here"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full max-w-xs px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 shadow-sm bg-white"
            />
          </div>
          <div className="flex gap-2">
            <a href="/archive-business" className="nav flex items-center gap-2 px-4 py-2 bg-gray-200 text-green-800 rounded hover:bg-gray-300 font-medium"><FaArchive /> Archive</a>
            <button onClick={() => setShowNew(true)} className="nav pnav flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium"><FaPlus /> New</button>
          </div>
        </div>
        {/* Table */}
        <div className="bg-white rounded-lg shadow p-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Owner&lsquo;s Name</th>
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
                filteredBusinesses.map(b => (
                  <tr key={b.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{b.owner}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{b.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{b.address}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{b.nature}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{new Date(b.established).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center flex gap-2 justify-center">
                      <a href="/view-permit" className="nav width0 flex items-center gap-1 px-3 py-1 bg-gray-100 text-green-800 rounded hover:bg-gray-200 text-sm font-medium"><FaFile /> Permit</a>
                      <button onClick={() => setShowEdit(b.id)} className="nav width0 flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm font-medium"><FaEdit /> Edit</button>
                      <button onClick={() => setShowDelete(b.id)} className="nav width0 flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-medium"><FaFlag /> Claim</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* New Business Modal */}
        {showNew && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
            <form className="w-full max-w-lg p-8 bg-white rounded-2xl shadow-2xl flex flex-col gap-4 relative">
              <button type="button" className="absolute right-6 top-6 text-gray-500 hover:text-gray-800" onClick={() => setShowNew(false)}><FaTimes className="w-6 h-6" /></button>
              <p className="text-2xl font-bold mb-2">NEW BUSINESS</p>
              <div className="field">
                <label className="block mb-1">Owner&lsquo;s Name</label>
                <input type="text" className="w-full border rounded px-3 py-2" />
              </div>
              <div className="field">
                <label className="block mb-1">Business Name</label>
                <input type="text" className="w-full border rounded px-3 py-2" />
              </div>
              <div className="field">
                <label className="block mb-1">Address</label>
                <input type="text" className="w-full border rounded px-3 py-2" />
              </div>
              <div className="field">
                <label className="block mb-1">Nature of Business</label>
                <input type="text" className="w-full border rounded px-3 py-2" />
              </div>
              <div className="field">
                <label className="block mb-1">Date Established</label>
                <input type="date" className="w-full border rounded px-3 py-2" />
              </div>
              <div className="flex justify-between mt-4">
                <button type="reset" className="nav">Clear</button>
                <button type="submit" className="nav pnav">Save</button>
              </div>
            </form>
          </div>
        )}
        {/* Edit Business Modal */}
        {showEdit !== null && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
            <form className="w-full max-w-xl p-8 bg-white rounded-2xl shadow-2xl flex flex-col gap-4 relative">
              <button type="button" className="absolute right-6 top-6 text-gray-500 hover:text-gray-800" onClick={() => setShowEdit(null)}><FaTimes className="w-6 h-6" /></button>
              <p className="text-2xl font-bold mb-2">EDIT BUSINESS</p>
              <div className="field">
                <label className="block mb-1">Owner&apos;s Name</label>
                <input type="text" className="w-full border rounded px-3 py-2" />
              </div>
              <div className="field">
                <label className="block mb-1">Business Name</label>
                <input type="text" className="w-full border rounded px-3 py-2" />
              </div>
              <div className="field">
                <label className="block mb-1">Address</label>
                <input type="text" className="w-full border rounded px-3 py-2" />
              </div>
              <div className="field">
                <label className="block mb-1">Nature of Business</label>
                <input type="text" className="w-full border rounded px-3 py-2" />
              </div>
              <div className="field">
                <label className="block mb-1">Date Established</label>
                <input type="date" className="w-full border rounded px-3 py-2" />
              </div>
              <div className="flex justify-end mt-4">
                <button type="submit" className="nav pnav">Update</button>
              </div>
            </form>
          </div>
        )}
        {/* Delete Modal */}
        {showDelete !== null && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
            <form className="w-full max-w-md p-8 bg-white rounded-2xl shadow-2xl flex flex-col gap-4 relative items-center">
              <button type="button" className="absolute right-6 top-6 text-gray-500 hover:text-gray-800" onClick={() => setShowDelete(null)}><FaTimes className="w-6 h-6" /></button>
              <p className="text-3xl font-bold mb-2">WARNING</p>
              <p className="text-lg text-center">Want to clean things up <br />by trashing this business?</p>
              <div className="flex gap-4 mt-6">
                <button type="button" className="nav" onClick={() => setShowDelete(null)}>No, Cancel</button>
                <button type="button" className="nav pnav dnav">Yes, Move</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
