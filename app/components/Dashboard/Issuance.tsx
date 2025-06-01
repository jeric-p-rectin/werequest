'use client';

import { useEffect, useState, useMemo } from 'react';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ResponsiveContainer } from 'recharts';
// import { format } from 'date-fns';

interface RequestorInfo {
  username: string;
  firstName: string;
  middleName: string;
  lastName: string;
  extName: string;
  fullName: string;
  birthday: Date;
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
}

interface DocumentData {
  _id: string;
  requestId: string;
  documentType: string;
  purpose: string;
  requestDate: string;
  copies: number;
  decline: {
    status: boolean;
  };
  verify: {
    status: boolean;
  };
  approved: {
    status: boolean;
  };
  createdAt: string;
  requestorInformation?: RequestorInfo;
}

export default function IssuanceDashboard() {
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [dateFilter, setDateFilter] = useState('All');
  const [purokFilter, setPurokFilter] = useState('All');
  const [docTypeFilter, setDocTypeFilter] = useState('All');
  const [employmentFilter, setEmploymentFilter] = useState('All');
  const [genderFilter, setGenderFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [ageFilter, setAgeFilter] = useState('All');

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch('/api/document/get-all-documents');
        const result = await response.json();
        
        if (result.success) {
          setDocuments(result.data);
        }
      } catch (err) {
        console.error('Error fetching document data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  // Helper: get requestor info safely
  const getRequestor = (doc: DocumentData): RequestorInfo => doc.requestorInformation || {} as RequestorInfo;

  // Filtering logic
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc: DocumentData) => {
      const req = getRequestor(doc);
      // Date filter
      let dateOk = true;
      if (dateFilter !== 'All') {
        const now = new Date();
        const created = new Date(doc.createdAt);
        if (dateFilter === 'Today') {
          dateOk = created.toDateString() === now.toDateString();
        } else if (dateFilter === 'This Week') {
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          dateOk = created >= weekStart && created <= now;
        } else if (dateFilter === 'This Month') {
          dateOk = created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
        } else if (dateFilter === 'This Year') {
          dateOk = created.getFullYear() === now.getFullYear();
        }
      }
      // Purok
      const purokOk = purokFilter === 'All' || req.purok === purokFilter;
      // Document type
      const docTypeOk = docTypeFilter === 'All' || doc.documentType === docTypeFilter;
      // Employment
      const empOk = employmentFilter === 'All' || req.workingStatus === employmentFilter;
      // Gender
      const genderOk = genderFilter === 'All' || req.gender?.toLowerCase() === genderFilter.toLowerCase();
      // Priority
      let priorityOk = true;
      if (priorityFilter !== 'All') {
        if (priorityFilter === 'PWD') priorityOk = req.pwd;
        else if (priorityFilter === '4Ps') priorityOk = req.fourPsBeneficiary;
        else if (priorityFilter === 'Solo Parent') priorityOk = req.soloParent;
        else if (priorityFilter === 'Senior') priorityOk = req.age >= 60;
      }
      // Age
      let ageOk = true;
      if (ageFilter !== 'All') {
        if (ageFilter === '24+') ageOk = req.age >= 24;
        else ageOk = req.age === Number(ageFilter);
      }
      return dateOk && purokOk && docTypeOk && empOk && genderOk && priorityOk && ageOk;
    });
  }, [documents, dateFilter, purokFilter, docTypeFilter, employmentFilter, genderFilter, priorityFilter, ageFilter]);

  // Stats and charts use filteredDocuments
  const total = filteredDocuments.length;
  const approved = filteredDocuments.filter((d: DocumentData) => d.approved.status).length;
  const pending = filteredDocuments.filter((d: DocumentData) => !d.approved.status && !d.decline.status).length;
  const declined = filteredDocuments.filter((d: DocumentData) => d.decline.status).length;

  // Monthly data for bar chart
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  const monthlyStats = months.map((m, idx) => {
    const monthDocs = filteredDocuments.filter((d: DocumentData) => new Date(d.createdAt).getMonth() === idx);
    return {
      month: m,
      Pending: monthDocs.filter((d: DocumentData) => !d.approved.status && !d.decline.status).length,
      Approved: monthDocs.filter((d: DocumentData) => d.approved.status).length,
      Declined: monthDocs.filter((d: DocumentData) => d.decline.status).length,
    };
  });

  // Top requestors (by count)
  const topResidents = useMemo(() => {
    const map: Record<string, number> = {};
    filteredDocuments.forEach((doc: DocumentData) => {
      const req = getRequestor(doc);
      if (!req.fullName) return;
      map[req.fullName] = (map[req.fullName] || 0) + 1;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name]) => name);
  }, [filteredDocuments]);

  // Top ages
  const topAges = useMemo(() => {
    const map: Record<string, number> = {};
    filteredDocuments.forEach((doc: DocumentData) => {
      const req = getRequestor(doc);
      if (!req.age) return;
      map[req.age] = (map[req.age] || 0) + 1;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([age]) => `${age} years old`);
  }, [filteredDocuments]);

  // Top puroks
  const topPuroks = useMemo(() => {
    const map: Record<string, number> = {};
    filteredDocuments.forEach((doc: DocumentData) => {
      const req = getRequestor(doc);
      if (!req.purok) return;
      map[req.purok] = (map[req.purok] || 0) + 1;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([purok]) => purok);
  }, [filteredDocuments]);

  // Top days
  const topDays = useMemo(() => {
    const map: Record<string, number> = {};
    filteredDocuments.forEach((doc: DocumentData) => {
      const day = new Date(doc.createdAt).toLocaleDateString('en-US', { weekday: 'long' });
      map[day] = (map[day] || 0) + 1;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([day]) => day);
  }, [filteredDocuments]);

//   // Group documents by type
//   const documentsByType = documents.reduce((acc, doc) => {
//     acc[doc.documentType] = (acc[doc.documentType] || 0) + 1;
//     return acc;
//   }, {} as Record<string, number>);

  // Group documents by month
//   const documentsByMonth = documents.reduce((acc, doc) => {
//     const month = format(new Date(doc.createdAt), 'MMMM');
//     acc[month] = (acc[month] || 0) + 1;
//     return acc;
//   }, {} as Record<string, number>);

  // --- Per Category: Request by Document (This Year vs Last Year) ---
  const now = new Date();
  const thisYear = now.getFullYear();
  const lastYear = thisYear - 1;
  const docTypes = [
    'Barangay Clearance',
    'Barangay Indigency',
    'Barangay Residency',
    'Business Permit',
  ];
  const perCategoryData = docTypes.map(type => {
    const thisYearCount = filteredDocuments.filter(
      (d: DocumentData) => d.documentType === type && new Date(d.createdAt).getFullYear() === thisYear
    ).length;
    const lastYearCount = filteredDocuments.filter(
      (d: DocumentData) => d.documentType === type && new Date(d.createdAt).getFullYear() === lastYear
    ).length;
    return {
      type,
      thisYear: thisYearCount,
      lastYear: lastYearCount,
    };
  });

  // Color mapping for document types
  const docTypeColors: Record<string, string> = {
    'Barangay Clearance': '#012815',
    'Barangay Indigency': '#145c3d',
    'Barangay Residency': '#3d8c66',
    'Business Permit': '#4f6a1b',
  };

  // Pie chart data for Employment
  const employmentMap: Record<string, number> = {};
  filteredDocuments.forEach((doc: DocumentData) => {
    const req = getRequestor(doc);
    const status = req.workingStatus || 'Unknown';
    employmentMap[status] = (employmentMap[status] || 0) + 1;
  });
  const employmentData = Object.entries(employmentMap).map(([name, value]) => ({ name, value }));
  // Assign colors based on employment status
  const employmentColors = employmentData.map(d => {
    if (d.name.toLowerCase() === 'employed') return '#497641';
    if (d.name.toLowerCase() === 'unemployed') return '#3c5e1a'; // updated green
    if (d.name.toLowerCase() === 'self-employed') return '#b5c99a';
    return '#dc3545'; // fallback for unknown/other
  });

  // Pie chart data for Gender
  const genderMap: Record<string, number> = {};
  filteredDocuments.forEach((doc: DocumentData) => {
    const req = getRequestor(doc);
    const gender = req.gender ? req.gender.charAt(0).toUpperCase() + req.gender.slice(1).toLowerCase() : 'Unknown';
    genderMap[gender] = (genderMap[gender] || 0) + 1;
  });
  const genderData = Object.entries(genderMap).map(([name, value]) => ({ name, value }));
  const genderColors = ['#145c3d', '#3d8c66', '#dc3545', '#fbbf24'];

  // PWD Category mapping
  const pwdCategories = [
    'Visual Disability',
    'Hearing Disability',
    'Speech and Language Disability',
    'Orthopedic Disability',
    'Mental Disability',
    'Psychosocial Disability',
    'Learning Disability',
    'Multiple Disabilities',
    'Chronic Illness',
    'Others',
  ];
  const pwdCategoryMap: Record<string, number> = {};
  filteredDocuments.forEach((doc: DocumentData) => {
    const req = getRequestor(doc);
    if (req.pwd && req.pwdType) {
      let cat = req.pwdType;
      // Map old category names to new ones if needed
      if (cat.toLowerCase().includes('visual')) cat = 'Visual Disability';
      else if (cat.toLowerCase().includes('hearing')) cat = 'Hearing Disability';
      else if (cat.toLowerCase().includes('speech')) cat = 'Speech and Language Disability';
      else if (cat.toLowerCase().includes('orthopedic')) cat = 'Orthopedic Disability';
      else if (cat.toLowerCase().includes('mental')) cat = 'Mental Disability';
      else if (cat.toLowerCase().includes('psychosocial')) cat = 'Psychosocial Disability';
      else if (cat.toLowerCase().includes('learning')) cat = 'Learning Disability';
      else if (cat.toLowerCase().includes('multiple')) cat = 'Multiple Disabilities';
      else if (cat.toLowerCase().includes('chronic')) cat = 'Chronic Illness';
      else if (cat.toLowerCase().includes('other')) cat = 'Others';
      pwdCategoryMap[cat] = (pwdCategoryMap[cat] || 0) + 1;
    }
  });
  const pwdCategoryData = pwdCategories.map(cat => ({
    name: cat,
    value: pwdCategoryMap[cat] || 0,
  }));
  const pwdColors = [
    '#012815', '#145c3d', '#3d8c66', '#4f6a1b', '#6b8827',
    '#7fa858', '#9caf68', '#b3c989', '#d2e8aa', '#efffc9'
  ];

  // Priority Category data
//   const priorityCategories = [
//     { name: 'Senior Citizen', key: 'senior' },
//     { name: 'Solo Parent', key: 'soloParent' },
//     { name: "4Ps Beneficiary", key: 'fourPsBeneficiary' },
//   ];
  let seniorCount = 0, soloParentCount = 0, fourPsCount = 0;
  filteredDocuments.forEach((doc: DocumentData) => {
    const req = getRequestor(doc);
    if (req.age && req.age >= 65) seniorCount++;
    if (req.soloParent) soloParentCount++;
    if (req.fourPsBeneficiary) fourPsCount++;
  });
  const priorityData = [
    { name: 'Senior Citizen', value: seniorCount },
    { name: 'Solo Parent', value: soloParentCount },
    { name: '4Ps Beneficiary', value: fourPsCount },
  ];
  const priorityColors = ['#4f6a1b', '#b5c99a', '#28350a'];

  if (loading) return <div className="text-gray-800">Loading issuance dashboard...</div>;

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="p-6 rounded-lg shadow-lg hover:shadow-2xl bg-white transition-shadow duration-300"> 
          <p className="text-3xl font-bold text-gray-900">{pending}</p>
          <p className="text-lg font-medium text-gray-900">Pending</p>
          <p className="text-xs mt-2 text-gray-900">{total ? ((pending/total)*100).toFixed(0) : 0}% of Total</p>
        </div>
        <div className="p-6 rounded-lg shadow-lg hover:shadow-2xl bg-white transition-shadow duration-300"> 
          <p className="text-3xl font-bold text-gray-900">{approved}</p>
          <p className="text-lg font-medium text-gray-900">Approved</p>
          <p className="text-xs mt-2 text-gray-900">{total ? ((approved/total)*100).toFixed(0) : 0}% of Total</p>
        </div>
        <div className="p-6 rounded-lg shadow-lg hover:shadow-2xl bg-white transition-shadow duration-300"> 
          <p className="text-3xl font-bold text-gray-900">{declined}</p>
          <p className="text-lg font-medium text-gray-900">Declined</p>
          <p className="text-xs mt-2 text-gray-900">{total ? ((declined/total)*100).toFixed(0) : 0}% of Total</p>
          </div>
        <div className="p-6 rounded-lg shadow-lg hover:shadow-2xl bg-white transition-shadow duration-300"> 
          <p className="text-3xl font-bold text-gray-900">{total}</p>
          <p className="text-lg font-medium text-gray-900">Total</p>
          <p className="text-xs mt-2 text-gray-900">+{total}</p>
        </div>
      </div>

      {/* Filters (UI only) */}
      <div className="flex flex-wrap gap-4 items-center">
        <select className="border rounded px-3 py-2 text-gray-900" value={dateFilter} onChange={e => setDateFilter(e.target.value)}>
          <option value="All">By Date</option>
          <option value="Today">Today</option>
          <option value="This Week">This Week</option>
          <option value="This Month">This Month</option>
          <option value="This Year">This Year</option>
          <option value="All">All</option>
        </select>
        <select className="border rounded px-3 py-2 text-gray-900" value={purokFilter} onChange={e => setPurokFilter(e.target.value)}>
          <option value="All">By Purok</option>
          <option value="Purok 1">Purok 1</option>
          <option value="Purok 2">Purok 2</option>
          <option value="Purok 3">Purok 3</option>
          <option value="Purok 4">Purok 4</option>
          <option value="Purok 5">Purok 5</option>
          <option value="Purok 6">Purok 6</option>
          <option value="Purok 7">Purok 7</option>
          <option value="Purok 8">Purok 8</option>
          <option value="All">All</option>
        </select>
        <select className="border rounded px-3 py-2 text-gray-900" value={docTypeFilter} onChange={e => setDocTypeFilter(e.target.value)}>
          <option value="All">By Document</option>
          <option value="Barangay Clearance">Barangay Clearance</option>
          <option value="Barangay Indigency">Barangay Indigency</option>
          <option value="Barangay Residency">Barangay Residency</option>
          <option value="Business Permit">Business Permit</option>
          <option value="All">All</option>
        </select>
        <select className="border rounded px-3 py-2 text-gray-900" value={employmentFilter} onChange={e => setEmploymentFilter(e.target.value)}>
          <option value="All">By Employment</option>
          <option value="Employed">Employed</option>
          <option value="Unemployed">Unemployed</option>
          <option value="Self-Employed">Self-Employed</option>
          <option value="All">All</option>
        </select>
        <select className="border rounded px-3 py-2 text-gray-900" value={genderFilter} onChange={e => setGenderFilter(e.target.value)}>
          <option value="All">By Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="All">All</option>
        </select>
        <select className="border rounded px-3 py-2 text-gray-900" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
          <option value="All">By Priority</option>
          <option value="PWD">PWD</option>
          <option value="4Ps">4Ps</option>
          <option value="Solo Parent">Solo Parent</option>
          <option value="Senior">Senior</option>
          <option value="All">All</option>
        </select>
        <select className="border rounded px-3 py-2 text-gray-900" value={ageFilter} onChange={e => setAgeFilter(e.target.value)}>
          <option value="All">Select Age</option>
          <option value="15">15</option>
          <option value="16">16</option>
          <option value="17">17</option>
          <option value="18">18</option>
          <option value="19">19</option>
          <option value="20">20</option>
          <option value="21">21</option>
          <option value="22">22</option>
          <option value="23">23</option>
          <option value="24+">24+</option>
          <option value="All">All</option>
        </select>
        </div>

      {/* Overall Request Chart */}
      <div className="bg-white rounded-lg shadow-2xl p-6 mt-4 transition-shadow duration-300">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">Overall Request (Monthly)</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={monthlyStats} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fill: '#1F2937' }} />
            <YAxis tick={{ fill: '#1F2937' }} allowDecimals={false} />
              <Tooltip />
            <Legend />
            <Bar dataKey="Pending" fill="#28350a" />
            <Bar dataKey="Approved" fill="#497641" />
            <Bar dataKey="Declined" fill="#dc3545" />
            </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Requestors Placeholder */}
      <div className="bg-white rounded-lg shadow-2xl p-6 mt-4 transition-shadow duration-300">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Top Requestors Within a Week</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="border rounded-lg p-4 shadow-lg hover:shadow-2xl transition-shadow duration-300">
            <p className="font-semibold text-gray-900">Top Resident</p>
            <ol className="list-decimal ml-4 text-sm mt-2 text-gray-900">
              {topResidents.length === 0 ? <li>No data</li> : topResidents.map((name, i) => <li key={i}>{name}</li>)}
            </ol>
          </div>
          <div className="border rounded-lg p-4 shadow-lg hover:shadow-2xl transition-shadow duration-300">
            <p className="font-semibold text-gray-900">Age with the Most Requests</p>
            <ol className="list-decimal ml-4 text-sm mt-2 text-gray-900">
              {topAges.length === 0 ? <li>No data</li> : topAges.map((age, i) => <li key={i}>{age}</li>)}
            </ol>
        </div>
          <div className="border rounded-lg p-4 shadow-lg hover:shadow-2xl transition-shadow duration-300">
            <p className="font-semibold text-gray-900">Purok with the Most Requests</p>
            <ol className="list-decimal ml-4 text-sm mt-2 text-gray-900">
              {topPuroks.length === 0 ? <li>No data</li> : topPuroks.map((purok, i) => <li key={i}>{purok}</li>)}
            </ol>
            </div>
          <div className="border rounded-lg p-4 shadow-lg hover:shadow-2xl transition-shadow duration-300">
            <p className="font-semibold text-gray-900">Days with the Most Requests</p>
            <ol className="list-decimal ml-4 text-sm mt-2 text-gray-900">
              {topDays.length === 0 ? <li>No data</li> : topDays.map((day, i) => <li key={i}>{day}</li>)}
            </ol>
          </div>
        </div>
      </div>

      {/* Per Category: Request by Document */}
      <div className="bg-white rounded-lg shadow-2xl p-6 mt-4 transition-shadow duration-300">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Request by Document</h3>
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Bar Chart */}
          <div className="w-full md:w-2/3 h-96 bg-gray-50 rounded-lg shadow-inner p-4 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={perCategoryData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }} barCategoryGap={32}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" tick={{ fill: '#1F2937', fontWeight: 600, fontSize: 14 }} />
                <YAxis tick={{ fill: '#1F2937', fontWeight: 600, fontSize: 14 }} allowDecimals={false} />
                <Tooltip />
                <Legend wrapperStyle={{ fontWeight: 700, fontSize: 16 }} />
                {docTypes.map(type => (
                  <Bar
                    key={type}
                    dataKey={row => row.type === type ? row.thisYear : 0}
                    name={`${type} (This Year)`}
                    fill={docTypeColors[type]}
                    isAnimationActive={false}
                    barSize={18}
                    legendType="circle"
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Table */}
          <div className="w-full md:w-1/3 overflow-x-auto">
            <table className="min-w-[250px] w-full border border-gray-300 bg-white rounded-lg shadow text-base">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 border-b border-gray-300 font-bold text-gray-900 text-lg">Document Type</th>
                  <th className="p-3 border-b border-gray-300 font-bold text-gray-900 text-lg">This Year</th>
                  <th className="p-3 border-b border-gray-300 font-bold text-gray-900 text-lg">Last Year</th>
                </tr>
              </thead>
              <tbody>
                {perCategoryData.map(row => (
                  <tr key={row.type} className="hover:bg-gray-50">
                    <td className="p-3 border-b border-gray-200 font-medium text-gray-800 flex items-center gap-2">
                      <span className="inline-block w-4 h-4 rounded-full" style={{ backgroundColor: docTypeColors[row.type] }}></span>
                      {row.type}
                    </td>
                    <td className="p-3 border-b border-gray-200 text-center text-green-700 font-bold">{row.thisYear}</td>
                    <td className="p-3 border-b border-gray-200 text-center text-yellow-800 font-bold">{row.lastYear}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Request by Employment & Gender Pie Charts */}
      <div className="bg-white rounded-lg shadow-2xl p-6 mt-4 transition-shadow duration-300">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Request by Employment & Gender</h3>
        <div className="flex flex-col md:flex-row gap-8 items-start justify-center">
          {/* Employment Pie Chart */}
          <div className="w-full md:w-1/2 flex flex-col items-center">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Request by Employment</h4>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={employmentData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                >
                  {employmentData.map((entry, idx) => (
                    <Cell key={`emp-cell-${idx}`} fill={employmentColors[idx % employmentColors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name, props) => [`${value}`, `${props.payload.name}`]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Gender Pie Chart */}
          <div className="w-full md:w-1/2 flex flex-col items-center">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Request by Gender</h4>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={genderData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                >
                  {genderData.map((entry, idx) => (
                    <Cell key={`gender-cell-${idx}`} fill={genderColors[idx % genderColors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name, props) => [`${value}`, `${props.payload.name}`]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Request by PWD Category Pie Chart & Table */}
      <div className="bg-white rounded-lg shadow-2xl p-6 mt-4 transition-shadow duration-300">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Request by PWD Category</h3>
        <div className="flex flex-col md:flex-row gap-8 items-stretch justify-center">
          {/* Pie Chart */}
          <div className="w-full md:w-1/2 flex flex-col items-center justify-center min-h-[340px]">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pwdCategoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                >
                  {pwdCategoryData.map((entry, idx) => (
                    <Cell key={`pwd-cell-${idx}`} fill={pwdColors[idx % pwdColors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name, props) => [`${value}`, `${props.payload.name}`]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Divider for desktop */}
          <div className="hidden md:block w-px bg-gray-200 mx-2"></div>
          {/* Table */}
          <div className="w-full md:w-1/2 flex flex-col justify-center">
            <div className="overflow-x-auto">
              <table className="min-w-[320px] w-full border border-gray-300 bg-white rounded-lg shadow text-base">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-3 border-b border-gray-300 font-bold text-gray-900 text-lg">Category</th>
                    <th className="p-3 border-b border-gray-300 font-bold text-gray-900 text-lg">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {pwdCategoryData.map((row, idx) => (
                    <tr key={row.name} className="hover:bg-gray-50">
                      <td className="p-3 border-b border-gray-200 font-bold text-gray-900 flex items-center gap-2">
                        <span className="inline-block w-4 h-4 rounded-full" style={{ backgroundColor: pwdColors[idx % pwdColors.length] }}></span>
                        {row.name}
                      </td>
                      <td className="p-3 border-b border-gray-200 text-center font-bold text-gray-900">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Request by Priority Category Table & Bar Graph */}
      <div className="bg-white rounded-lg shadow-2xl p-6 mt-4 transition-shadow duration-300">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Request by Priority Category</h3>
        <div className="flex flex-col md:flex-row gap-8 items-stretch justify-center">
          {/* Table */}
          <div className="w-full md:w-1/2 flex flex-col justify-center">
            <div className="overflow-x-auto">
              <table className="min-w-[250px] w-full border border-gray-300 bg-white rounded-lg shadow text-base">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-3 border-b border-gray-300 font-bold text-gray-900 text-lg">Priority Group</th>
                    <th className="p-3 border-b border-gray-300 font-bold text-gray-900 text-lg">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {priorityData.map((row, idx) => (
                    <tr key={row.name} className="hover:bg-gray-50">
                      <td className="p-3 border-b border-gray-200 font-bold text-gray-900 flex items-center gap-2">
                        <span className="inline-block w-4 h-4 rounded-full" style={{ backgroundColor: priorityColors[idx % priorityColors.length] }}></span>
                        {row.name}
                      </td>
                      <td className="p-3 border-b border-gray-200 text-center font-bold text-gray-900">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* Bar Graph */}
          <div className="w-full md:w-1/2 flex flex-col items-center justify-center min-h-[340px]">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priorityData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barCategoryGap={32}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fill: '#1F2937', fontWeight: 600, fontSize: 14 }} />
                <YAxis tick={{ fill: '#1F2937', fontWeight: 600, fontSize: 14 }} allowDecimals={false} />
                <Tooltip formatter={(value, name, props) => [`${value}`, `${props.payload.name}`]} />
                <Bar dataKey="value" barSize={32} isAnimationActive={false}>
                  {priorityData.map((entry, idx) => (
                    <Cell key={`cell-priority-${idx}`} fill={priorityColors[idx % priorityColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
