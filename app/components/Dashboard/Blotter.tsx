'use client';

import { useEffect, useState } from 'react';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ResponsiveContainer } from 'recharts';

interface UserInfo {
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

interface Party {
  type: 'Resident' | 'Non-Resident';
  name: string;
  residentId?: string;
  residentInfo?: Partial<UserInfo> | Record<string, unknown>;
}

interface BlotterData {
  _id: string;
  caseNo: string;
  complaint: string;
  natureOfComplaint: string;
  complainants?: Party[];
  respondents?: Party[];
  complainantInfo?: UserInfo;
  respondentInfo?: UserInfo;
  status: string;
  createdAt: string;
}

// Define the exact natureOfComplaint and purok values
const natureOfComplaintOptions = [
  'Physical Harm',
  'Verbal Abuse',
  'Property Dispute',
  'Noise Disturbance',
  'Vandalism/Theft',
  'Family Conflict',
  'Animal Nuisance',
  'Business-Related',
  'Youth-Related',
  'Illegal Activities',
  'Barangay Ordinance Violation',
];
const puroks = ['purok1','purok2','purok3','purok4','purok5','purok6','purok7'];

export default function BlotterDashboard() {
  const [blotters, setBlotters] = useState<BlotterData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [barType, setBarType] = useState<'monthly' | 'annual'>('monthly');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [purokFilter, setPurokFilter] = useState('');
  const [natureFilter, setNatureFilter] = useState('');

  useEffect(() => {
    const fetchBlotters = async () => {
      try {
        const response = await fetch('/api/blotter/get-all-blotters');
        const result = await response.json();
        if (result.success || result.data) {
          setBlotters(result.data || result);
        } else {
          setError('Failed to fetch blotter data');
        }
      } catch {
        setError('Error fetching blotter data');
      } finally {
        setLoading(false);
      }
    };
    fetchBlotters();
  }, []);

  // Helper: read field (age, purok, gender, etc.) from complainants/respondents with fallback to legacy fields
  const getComplainantField = (b: BlotterData | undefined, field: keyof UserInfo): unknown => {
    if (!b) return undefined;
    if (Array.isArray(b.complainants) && b.complainants.length > 0) {
      // prefer residentInfo if available
      const residentParty = b.complainants.find((p) => p.type === 'Resident' && p.residentInfo) || b.complainants[0];
      return residentParty?.residentInfo?.[field] ?? (residentParty as unknown as Record<string, unknown>)[field as string];
    }
    return b.complainantInfo?.[field];
  };
  
  const getRespondentField = (b: BlotterData | undefined, field: keyof UserInfo): unknown => {
    if (!b) return undefined;
    if (Array.isArray(b.respondents) && b.respondents.length > 0) {
      const residentParty = b.respondents.find((p) => p.type === 'Resident' && p.residentInfo) || b.respondents[0];
      return residentParty?.residentInfo?.[field] ?? (residentParty as unknown as Record<string, unknown>)[field as string];
    }
    return b.respondentInfo?.[field];
  };

  if (loading) return <div className="text-gray-800">Loading blotter analytics...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  // --- FILTERED DATA ---
  const filteredBlotters = blotters.filter(b => {
    let dateOk = true;
    if (dateFilter) {
      const now = new Date();
      const created = new Date(b.createdAt);
      if (dateFilter === 'today') {
        dateOk = created.toDateString() === now.toDateString();
      } else if (dateFilter === 'week') {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        dateOk = created >= weekStart && created <= now;
      } else if (dateFilter === 'month') {
        dateOk = created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
      } else if (dateFilter === 'year') {
        dateOk = created.getFullYear() === now.getFullYear();
      }
    }
    const statusOk = !statusFilter || b.status.toLowerCase() === statusFilter.toLowerCase();
    const purokOk = !purokFilter || getComplainantField(b, 'purok') === purokFilter;
    const natureOk = !natureFilter || b.natureOfComplaint === natureFilter;
    return dateOk && statusOk && purokOk && natureOk;
  });

  // --- SUMMARY CARDS ---
  const total = filteredBlotters.length;
  const ongoing = filteredBlotters.filter(b => b.status.toLowerCase() === 'on-going').length;
  const settled = filteredBlotters.filter(b => b.status.toLowerCase() === 'settled').length;
  const endorsed = filteredBlotters.filter(b => b.status.toLowerCase() === 'endorsed').length;
  const summaryData = [
    { label: 'On-going', value: ongoing, percent: total ? Math.round((ongoing/total)*100) : 0, icon: 'fa-arrow-up' },
    { label: 'Settled', value: settled, percent: total ? Math.round((settled/total)*100) : 0, icon: 'fa-arrow-up' },
    { label: 'Endorsed', value: endorsed, percent: total ? Math.round((endorsed/total)*100) : 0, icon: 'fa-arrow-down' },
    { label: 'Total', value: total, percent: 100, icon: 'fa-plus' },
  ];

  // --- MAIN BAR CHART DATA ---
  const now = new Date();
  const thisYear = now.getFullYear();
  const lastYear = thisYear - 1;
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const monthlyBarData = months.map((m, idx) => {
    const monthBlotters = filteredBlotters.filter(b => new Date(b.createdAt).getMonth() === idx);
    return {
      month: m,
      'On-going': monthBlotters.filter(b => b.status.toLowerCase() === 'on-going').length,
      Settled: monthBlotters.filter(b => b.status.toLowerCase() === 'settled').length,
      Endorsed: monthBlotters.filter(b => b.status.toLowerCase() === 'endorsed').length,
    };
  });
  const annualBarData = [thisYear, lastYear].map(year => {
    const yearBlotters = filteredBlotters.filter(b => new Date(b.createdAt).getFullYear() === year);
    return {
      year: year.toString(),
      'On-going': yearBlotters.filter(b => b.status.toLowerCase() === 'on-going').length,
      Settled: yearBlotters.filter(b => b.status.toLowerCase() === 'settled').length,
      Endorsed: yearBlotters.filter(b => b.status.toLowerCase() === 'endorsed').length,
    };
  });

  // --- TOP CASES, AGES, PUROKS, DAYS ---
  const natureCounts: Record<string, number> = {};
  natureOfComplaintOptions.forEach(nature => { natureCounts[nature] = 0; });
  filteredBlotters.forEach(b => {
    if (natureCounts[b.natureOfComplaint] !== undefined) {
      natureCounts[b.natureOfComplaint]++;
    }
  });
  const topCases = Object.entries(natureCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([nature]) => nature);

  const topAgesMap: Record<string, number> = {};
  filteredBlotters.forEach(b => {
    const age = getComplainantField(b, 'age');
    if (age) topAgesMap[age] = (topAgesMap[age] || 0) + 1;
  });
  const topAges = Object.entries(topAgesMap).sort((a,b) => b[1]-a[1]).slice(0,3).map(([age]) => `${age} years old`);

  const topPuroksMap: Record<string, number> = {};
  puroks.forEach(purok => { topPuroksMap[purok] = 0; });
  filteredBlotters.forEach(b => {
    const purok = getComplainantField(b, 'purok');
    if (purok && topPuroksMap[purok] !== undefined) topPuroksMap[purok]++;
  });
  const topPuroks = Object.entries(topPuroksMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([purok]) => purok);

  const topDaysMap: Record<string, number> = {};
  filteredBlotters.forEach(b => {
    const day = new Date(b.createdAt).toLocaleDateString('en-US', { weekday: 'long' });
    topDaysMap[day] = (topDaysMap[day] || 0) + 1;
  });
  const topDays = Object.entries(topDaysMap).sort((a,b) => b[1]-a[1]).slice(0,3).map(([day]) => day);

  // --- PER CATEGORY: CASES PER PUROK (THIS YEAR VS LAST YEAR) ---
  const purokBarData = puroks.map((purok, idx) => {
    const thisYearCount = filteredBlotters.filter(b => getComplainantField(b, 'purok') === purok && new Date(b.createdAt).getFullYear() === thisYear).length;
    const lastYearCount = filteredBlotters.filter(b => getComplainantField(b, 'purok') === purok && new Date(b.createdAt).getFullYear() === lastYear).length;
    const colors = ['#012815', '#145c3d', '#3d8c66', '#4f6a1b', '#5a8d38', '#267a4e', '#1f4027'];
    return {
      purok,
      thisYear: thisYearCount,
      lastYear: lastYearCount,
      color: colors[idx % colors.length],
    };
  });

  // --- PIE/BAR CHARTS ---
  // Complainants Involvement (gender)
  const genderMap: Record<string, number> = {};
  filteredBlotters.forEach(b => {
    const gender = getComplainantField(b, 'gender') ? String(getComplainantField(b, 'gender')).charAt(0).toUpperCase() + String(getComplainantField(b, 'gender')).slice(1).toLowerCase() : 'Unknown';
    genderMap[gender] = (genderMap[gender] || 0) + 1;
  });
  const pieData = Object.entries(genderMap).map(([name, value]) => ({ name, value }));
  const pieColors = ['#012815', '#145c3d', '#3d8c66', '#4f6a1b'];

  // Case Status (bar)
  const caseStatusData = [
    { name: 'Settled', thisYear: filteredBlotters.filter(b => b.status.toLowerCase() === 'settled' && new Date(b.createdAt).getFullYear() === thisYear).length, lastYear: filteredBlotters.filter(b => b.status.toLowerCase() === 'settled' && new Date(b.createdAt).getFullYear() === lastYear).length },
    { name: 'Endorsed', thisYear: filteredBlotters.filter(b => b.status.toLowerCase() === 'endorsed' && new Date(b.createdAt).getFullYear() === thisYear).length, lastYear: filteredBlotters.filter(b => b.status.toLowerCase() === 'endorsed' && new Date(b.createdAt).getFullYear() === lastYear).length },
    { name: 'On-going', thisYear: filteredBlotters.filter(b => b.status.toLowerCase() === 'on-going' && new Date(b.createdAt).getFullYear() === thisYear).length, lastYear: filteredBlotters.filter(b => b.status.toLowerCase() === 'on-going' && new Date(b.createdAt).getFullYear() === lastYear).length },
  ];

  // Respondents Involvement (gender)
  const respondentGenderMap: Record<string, number> = {};
  filteredBlotters.forEach(b => {
    const gender = getRespondentField(b, 'gender') ? String(getRespondentField(b, 'gender')).charAt(0).toUpperCase() + String(getRespondentField(b, 'gender')).slice(1).toLowerCase() : 'Unknown';
    respondentGenderMap[gender] = (respondentGenderMap[gender] || 0) + 1;
  });
  const respondentPieData = Object.entries(respondentGenderMap).map(([name, value]) => ({ name, value }));

  return (
    <>
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 px-6">
        {summaryData.map((card, i) => (
          <div key={i} className="p-6 rounded-lg shadow-2xl bg-white flex flex-col items-start border border-green-200">
            <p className="text-3xl font-bold text-black">{card.value}</p>
            <p className="text-lg font-medium text-black">{card.label}</p>
            <p className="text-xs mt-2 flex items-center gap-1 text-black"> <i className={`fas ${card.icon}`}></i> {card.percent}% from Total</p>
          </div>
        ))}
      </div>

      {/* Filters and Main Chart */}
      <div className="relative bg-white rounded-lg shadow-2xl px-6 py-8 mb-8 mx-6 flex flex-col md:flex-row md:items-end gap-6">
        <div className="absolute left-6 top-6 flex flex-wrap gap-2 z-10">
          <select className="border rounded px-3 py-2 text-black" value={dateFilter} onChange={e => setDateFilter(e.target.value)}>
            <option value="">By Date Filed</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
            <option value="all">All</option>
          </select>
          <input type="date" className="border rounded px-3 py-2 text-black" />
          <select className="border rounded px-3 py-2 text-black" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">By Status</option>
            <option value="On-going">On-going</option>
            <option value="Settled">Settled</option>
            <option value="Endorsed">Endorsed</option>
          </select>
          <select className="border rounded px-3 py-2 text-black" value={purokFilter} onChange={e => setPurokFilter(e.target.value)}>
            <option value="">By Purok</option>
            {puroks.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
          </select>
          <select className="border rounded px-3 py-2 text-black" value={natureFilter} onChange={e => setNatureFilter(e.target.value)}>
            <option value="">Select Nature</option>
            {natureOfComplaintOptions.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div className="flex-1 flex flex-col items-center">
          <div className="flex justify-end w-full mb-2">
            <select className="border rounded px-3 py-2 text-black w-40" value={barType} onChange={e => setBarType(e.target.value as 'monthly' | 'annual')}>
              <option value="monthly">Monthly</option>
              <option value="annual">Annual</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={barType === 'monthly' ? monthlyBarData : annualBarData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={barType === 'monthly' ? 'month' : 'year'} tick={{ fill: '#1F2937' }} />
              <YAxis tick={{ fill: '#1F2937' }} allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="On-going" fill="#012815" />
              <Bar dataKey="Settled" fill="#145c3d" />
              <Bar dataKey="Endorsed" fill="#3d8c66" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Cases Section */}
      <div className="mx-6 my-8">
        <h2 className="text-2xl font-bold text-black mb-4">TOP CASES CATEGORY IS WITHIN 7 DAYS</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-lg shadow-lg border border-green-200 bg-white flex flex-col gap-2">
            <p className="text-lg font-semibold text-black">Top Cases</p>
            {topCases.map((c, i) => <p key={i} className="text-base text-black">{i+1}. {c}</p>)}
          </div>
          <div className="p-6 rounded-lg shadow-lg border border-green-200 bg-white flex flex-col gap-2">
            <p className="text-lg font-semibold text-black">Age with the Most Cases</p>
            {topAges.map((a, i) => <p key={i} className="text-base text-black">{i+1}. {a}</p>)}
          </div>
          <div className="p-6 rounded-lg shadow-lg border border-green-200 bg-white flex flex-col gap-2">
            <p className="text-lg font-semibold text-black">Purok with the Most Cases</p>
            {topPuroks.map((p, i) => <p key={i} className="text-base text-black">{i+1}. {p}</p>)}
          </div>
          <div className="p-6 rounded-lg shadow-lg border border-green-200 bg-white flex flex-col gap-2">
            <p className="text-lg font-semibold text-black">Days with the Most Cases</p>
            {topDays.map((d, i) => <p key={i} className="text-base text-black">{i+1}. {d}</p>)}
          </div>
          </div>
        </div>

      {/* Per Category Section */}
      <div className="mx-6 my-8">
        <h2 className="text-2xl font-bold text-black mb-4">PER CATEGORY</h2>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-2/3 bg-white rounded-lg shadow-2xl p-6 flex flex-col items-center">
            <div className="flex justify-end w-full mb-2">
              <select className="border rounded px-3 py-2 text-black w-40">
                <option>Date Range</option>
                <option>Today</option>
                <option>This Week</option>
                <option>This Month</option>
                <option>This Year</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={purokBarData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="purok" tick={{ fill: '#1F2937' }} />
                <YAxis tick={{ fill: '#1F2937' }} allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="thisYear" fill="#4f6a1b" name="This Year" />
                <Bar dataKey="lastYear" fill="#9caf68" name="Last Year" />
              </BarChart>
            </ResponsiveContainer>
            </div>
          <div className="w-full md:w-1/3 bg-white rounded-lg shadow-2xl p-6 overflow-x-auto">
            <table className="min-w-[250px] w-full border border-gray-300 bg-white rounded-lg shadow text-base">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 border-b border-gray-300 font-bold text-black text-lg">Purok</th>
                  <th className="p-3 border-b border-gray-300 font-bold text-black text-lg">This Year</th>
                  <th className="p-3 border-b border-gray-300 font-bold text-black text-lg">Last Year</th>
                </tr>
              </thead>
              <tbody>
                {purokBarData.map(row => (
                  <tr key={row.purok} className="hover:bg-gray-50">
                    <td className="p-3 border-b border-gray-200 font-medium text-black flex items-center gap-2">
                      <span className="inline-block w-4 h-4 rounded-full" style={{ backgroundColor: row.color }}></span>
                      {row.purok.charAt(0).toUpperCase() + row.purok.slice(1)}
                    </td>
                    <td className="p-3 border-b border-gray-200 text-center text-black font-bold">{row.thisYear}</td>
                    <td className="p-3 border-b border-gray-200 text-center text-black font-bold">{row.lastYear}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Three Pie/Bar Charts Section */}
      <div className="mx-6 my-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-lg shadow-2xl p-6 flex flex-col items-center">
          <p className="text-lg font-semibold text-black mb-2">Complainants Involvement</p>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                {pieData.map((entry, idx) => (
                  <Cell key={`cell-complainant-${idx}`} fill={pieColors[idx % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-lg shadow-2xl p-6 flex flex-col items-center">
          <p className="text-lg font-semibold text-black mb-2">Case Status</p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={caseStatusData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fill: '#1F2937' }} />
              <YAxis tick={{ fill: '#1F2937' }} allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="thisYear" fill="#012815" name="This Year" />
              <Bar dataKey="lastYear" fill="#9caf68" name="Last Year" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-lg shadow-2xl p-6 flex flex-col items-center">
          <p className="text-lg font-semibold text-black mb-2">Respondents Involvement</p>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={respondentPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                {respondentPieData.map((entry, idx) => (
                  <Cell key={`cell-respondent-${idx}`} fill={pieColors[idx % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
      </div>
    </div>
    </>
  );
}