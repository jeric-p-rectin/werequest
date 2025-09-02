'use client';

import { useEffect, useState, useMemo } from 'react';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ResponsiveContainer, LineChart, Line } from 'recharts';
import * as ss from 'simple-statistics';
import { FaInfoCircle, FaArrowUp, FaArrowDown, FaMinus } from 'react-icons/fa';
// import { format } from 'date-fns';

enum Purok {
  Purok1 = 'purok1',
  Purok2 = 'purok2',
  Purok3 = 'purok3',
  Purok4 = 'purok4',
  Purok5 = 'purok5',
  Purok6 = 'purok6',
  Purok7 = 'purok7',
}

enum DocumentType {
  BarangayClearance = 'Barangay Clearance',
  CertificateOfIndigency = 'Certificate of Indigency',
  CertificateOfResidency = 'Certificate of Residency',
  BusinessPermit = 'Business Permit',
  BarcCertificate = 'Barc Certificate',
}

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
  purok: Purok;
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
  documentType: DocumentType;
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
  const [monthFilter, setMonthFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');
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

  // --- Date/Month/Year Filter Logic ---
  // Extract all unique months and years from the dataset
  const allMonths = useMemo(() => {
    const set = new Set<number>();
    documents.forEach(doc => set.add(new Date(doc.createdAt).getMonth()));
    return Array.from(set).sort((a, b) => a - b);
  }, [documents]);
  const allYears = useMemo(() => {
    const set = new Set<number>();
    documents.forEach(doc => set.add(new Date(doc.createdAt).getFullYear()));
    return Array.from(set).sort((a, b) => a - b);
  }, [documents]);

  // Filtering logic
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc: DocumentData) => {
      const req = getRequestor(doc);
      // Date filter
      let dateOk = true;
      const created = new Date(doc.createdAt);
      if (dateFilter !== 'All') {
        const now = new Date();
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
      // Month/year filter
      let monthOk = true;
      if (monthFilter !== 'All') {
        monthOk = created.getMonth() === Number(monthFilter);
      }
      let yearOk = true;
      if (yearFilter !== 'All') {
        yearOk = created.getFullYear() === Number(yearFilter);
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
      }
      // Age
      let ageOk = true;
      if (ageFilter !== 'All') {
        if (ageFilter === '24+') ageOk = req.age >= 24;
        else ageOk = req.age === Number(ageFilter);
      }
      return dateOk && monthOk && yearOk && purokOk && docTypeOk && empOk && genderOk && priorityOk && ageOk;
    });
  }, [documents, dateFilter, monthFilter, yearFilter, purokFilter, docTypeFilter, employmentFilter, genderFilter, priorityFilter, ageFilter]);

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
      Endorsed: monthDocs.filter((d: DocumentData) => d.decline.status).length,
    };
  });

  // --- Improved Statistical Prediction ---
  // Build a time series: each month-year with its total requests, based on filteredDocuments
  const filteredTimeSeries = useMemo(() => {
    const map = new Map<string, number>();
    filteredDocuments.forEach(doc => {
      const d = new Date(doc.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      map.set(key, (map.get(key) || 0) + 1);
    });
    // Sort keys chronologically
    return Array.from(map.entries())
      .map(([key, value]) => ({ key: String(key), value }))
      .sort((a, b) => {
        const [ay, am] = a.key.split('-').map(Number);
        const [by, bm] = b.key.split('-').map(Number);
        return ay !== by ? ay - by : am - bm;
      });
  }, [filteredDocuments]);

  // Prepare last 12 months for sparkline
  const last12 = filteredTimeSeries.slice(-12);
  const sparkData = last12.map((d, i) => ({
    month: i + 1,
    value: d.value,
    label: d.key,
  }));

  // Linear Regression Prediction (filtered)
  let nextMonthPrediction: number | null = null;
  let trend: 'up' | 'down' | 'flat' = 'flat';
  let lrValue: number | null = null;
  let lrSlope: number | null = null;
  if (filteredTimeSeries.length >= 6) {
    const x = filteredTimeSeries.map((_, i) => i);
    const y = filteredTimeSeries.map(item => item.value);
    const lr = ss.linearRegression(x.map((xi, i) => [xi, y[i]]));
    const lrLine = ss.linearRegressionLine(lr);
    lrValue = Math.round(lrLine(filteredTimeSeries.length));
    lrSlope = lr.m;
    nextMonthPrediction = lrValue;
    if (lrSlope > 0.5) trend = 'up';
    else if (lrSlope < -0.5) trend = 'down';
    else trend = 'flat';
  }

  // Exponential Smoothing Prediction (filtered)
  let esValue: number | null = null;
  if (filteredTimeSeries.length >= 6) {
    const alpha = 0.5;
    let s = filteredTimeSeries[0].value;
    for (let i = 1; i < filteredTimeSeries.length; i++) {
      s = alpha * filteredTimeSeries[i].value + (1 - alpha) * s;
    }
    esValue = Math.round(s);
  }

  // Show both predictions if they differ by >10%
  let showBoth = false;
  if (lrValue && esValue && Math.abs(lrValue - esValue) / Math.max(lrValue, esValue) > 0.1) {
    showBoth = true;
  }

  // --- Additional Insights ---
  let avgPerMonth: number | null = null;
  let highestMonth: { label: string; value: number } | null = null;
  let lowestMonth: { label: string; value: number } | null = null;
  let momChange: number | null = null;
  let momTrend: 'up' | 'down' | 'flat' = 'flat';
  if (filteredTimeSeries.length > 0) {
    const vals = filteredTimeSeries.map(d => d.value);
    avgPerMonth = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
    const maxIdx = vals.indexOf(Math.max(...vals));
    const minIdx = vals.indexOf(Math.min(...vals));
    highestMonth = { label: filteredTimeSeries[maxIdx].key, value: vals[maxIdx] };
    lowestMonth = { label: filteredTimeSeries[minIdx].key, value: vals[minIdx] };
    // Month-over-month change
    if (filteredTimeSeries.length >= 2) {
      const last = vals[vals.length - 1];
      const prev = vals[vals.length - 2];
      momChange = last - prev;
      if (momChange > 0) momTrend = 'up';
      else if (momChange < 0) momTrend = 'down';
      else momTrend = 'flat';
    }
  }

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
  // Use DocumentType enum values dynamically
  const docTypes = Object.values(DocumentType);
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

  // Color mapping for document types (add fallback color)
  const docTypeColors: Record<string, string> = {
    'Barangay Clearance': '#012815',
    'Certificate of Indigency': '#145c3d',
    'Certificate of Residency': '#3d8c66',
    'Business Permit': '#4f6a1b',
    'Barc Certificate': '#6b8827',
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
  let soloParentCount = 0, fourPsCount = 0;
  filteredDocuments.forEach((doc: DocumentData) => {
    const req = getRequestor(doc);
    if (req.soloParent) soloParentCount++;
    if (req.fourPsBeneficiary) fourPsCount++;
  });
  const priorityData = [
    { name: 'Solo Parent', value: soloParentCount },
    { name: '4Ps Beneficiary', value: fourPsCount },
  ];
  const priorityColors = ['#b5c99a', '#28350a'];

  if (loading) return <div className="text-gray-800">Loading issuance dashboard...</div>;

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {/* Pending */}
        <div className="p-6 rounded-lg shadow-lg border-black border-1 hover:shadow-2xl bg-white transition-shadow duration-300"> 
          <p className="text-3xl font-bold text-[#3c5e1a]">{pending}</p>
          <p className="text-lg font-medium text-gray-900">Pending</p>
          <p className="text-xs mt-2 flex items-center gap-1 text-[#008000]">
            <FaArrowUp className="w-3 h-3 text-[#008000]" />
            {total ? ((pending/total)*100).toFixed(0) : 0}% of Total
          </p>
        </div>

        {/* Approved */}
        <div className="p-6 rounded-lg shadow-lg border-black border-1 hover:shadow-2xl bg-white transition-shadow duration-300"> 
          <p className="text-3xl font-bold text-[#3c5e1a]">{approved}</p>
          <p className="text-lg font-medium text-gray-900">Approved</p>
          <p className="text-xs mt-2 flex items-center gap-1 text-[#008000]">
            <FaArrowUp className="w-3 h-3 text-[#008000]" />
            {total ? ((approved/total)*100).toFixed(0) : 0}% of Total
          </p>
        </div>

        {/* Endorsed */}
        <div className="p-6 rounded-lg shadow-lg border-black border-1 hover:shadow-2xl bg-white transition-shadow duration-300"> 
          <p className="text-3xl font-bold text-[#3c5e1a]">{declined}</p>
          <p className="text-lg font-medium text-gray-900">Endorsed</p>
          <p className="text-xs mt-2 flex items-center gap-1 text-[#FF0000]">
            <FaArrowDown className="w-3 h-3 text-[#FF0000]" />
            {total ? ((declined/total)*100).toFixed(0) : 0}% of Total
          </p>
        </div>

        {/* Total */}
        <div className="p-6 rounded-lg shadow-lg border-black border-1 hover:shadow-2xl bg-white transition-shadow duration-300"> 
          <p className="text-3xl font-bold text-[#3c5e1a]">{total}</p>
          <p className="text-lg font-medium text-gray-900">Total</p>
          <p className="text-xs mt-2 text-[#008000]">+{total}</p>
        </div>
      </div>

      {/* Filters (UI only) */}
      <div className="flex flex-wrap gap-2 items-center justify-center mb-2">
        <select className="border border-gray-400 rounded text-[13px] px-1 py-2 text-gray-900" value={dateFilter} onChange={e => setDateFilter(e.target.value)}>
          <option value="All">By Date (Quick)</option>
          <option value="Today">Today</option>
          <option value="This Week">This Week</option>
          <option value="This Month">This Month</option>
          <option value="This Year">This Year</option>
          <option value="All">All</option>
        </select>
        <select className="border border-gray-400 rounded text-[13px] px-1 py-2 text-gray-900" value={monthFilter} onChange={e => setMonthFilter(e.target.value)}>
          <option value="All">By Month</option>
          {allMonths.map(m => (
            <option key={m} value={m}>{months[m]}</option>
          ))}
          <option value="All">All</option>
        </select>
        <select className="border border-gray-400 rounded text-[13px] px-1 py-2 text-gray-900" value={yearFilter} onChange={e => setYearFilter(e.target.value)}>
          <option value="All">By Year</option>
          {allYears.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
          <option value="All">All</option>
        </select>
        <select
          className="border border-gray-400 rounded text-[13px] px-1 py-2 text-gray-900"
          value={purokFilter}
          onChange={e => setPurokFilter(e.target.value)}
        >
          <option value="All">By Purok</option>
          {Object.values(Purok).map(purok => (
            <option key={purok} value={purok}>
              {purok.charAt(0).toUpperCase() + purok.slice(1).replace('purok', 'Purok ')}
            </option>
          ))}
          <option value="All">All</option>
        </select>
        <select
          className="border border-gray-400 rounded text-[13px] px-1 py-2 text-gray-900"
          value={docTypeFilter}
          onChange={e => setDocTypeFilter(e.target.value)}
        >
          <option value="All">By Document</option>
          {Object.values(DocumentType).map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
          <option value="All">All</option>
        </select>
        <select className="border border-gray-400 rounded text-[13px] px-1 py-2 text-gray-900" value={employmentFilter} onChange={e => setEmploymentFilter(e.target.value)}>
          <option value="All">By Employment</option>
          <option value="employed">Employed</option>
          <option value="unemployed">Unemployed</option>
          <option value="self-employed">Self-Employed</option>
          <option value="All">All</option>
        </select>
        <select className="border border-gray-400 rounded text-[13px] px-1 py-2 text-gray-900" value={genderFilter} onChange={e => setGenderFilter(e.target.value)}>
          <option value="All">By Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="All">All</option>
        </select>
        <select className="border border-gray-400 rounded text-[13px] px-1 py-2 text-gray-900" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
          <option value="All">By Priority</option>
          <option value="PWD">PWD</option>
          <option value="4Ps">4Ps</option>
          <option value="Solo Parent">Solo Parent</option>
          <option value="All">All</option>
        </select>
        <select className="border border-gray-400 rounded text-[13px] px-1 py-2 text-gray-900" value={ageFilter} onChange={e => setAgeFilter(e.target.value)}>
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
      <div className="bg-white border-black border-1 rounded-lg shadow-2xl p-6 mt-4 transition-shadow duration-300">
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
            <Bar dataKey="Endorsed" fill="#dc3545" />
            </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1 flex flex-col items-center md:items-start">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold text-green-900 text-lg">Prediction & Insights</span>
              <FaInfoCircle className="text-green-700" title="Prediction and insights are based on the currently filtered data (min. 6 months for prediction)." />
            </div>
            {filteredTimeSeries.length >= 6 && nextMonthPrediction !== null ? (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl font-bold text-green-800">{nextMonthPrediction}</span>
                  {trend === 'up' && <FaArrowUp className="text-green-600" title="Upward trend" />}
                  {trend === 'down' && <FaArrowDown className="text-red-600" title="Downward trend" />}
                  {trend === 'flat' && <FaMinus className="text-gray-500" title="Flat trend" />}
                </div>
                <div className="text-xs text-green-800 mb-1">Estimated total requests for next month</div>
                {showBoth && (
                  <div className="text-xs text-yellow-700">Exponential Smoothing: <span className="font-bold">{esValue}</span></div>
                )}
                <div className="text-xs text-green-900 mb-2">Model: Linear Regression{showBoth ? ' & Exponential Smoothing' : ''}</div>
                {/* Additional Insights */}
                <div className="mt-2 space-y-1 w-full">
                  {avgPerMonth !== null && (
                    <div className="flex items-center gap-2 text-sm text-green-800">
                      <span className="font-semibold">Avg/month:</span> <span>{avgPerMonth}</span>
                    </div>
                  )}
                  {highestMonth && (
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <span className="font-semibold">Highest:</span> <span>{months[Number(highestMonth.label.split('-')[1])]} {highestMonth.label.split('-')[0]} ({highestMonth.value})</span>
                    </div>
                  )}
                  {lowestMonth && (
                    <div className="flex items-center gap-2 text-sm text-yellow-700">
                      <span className="font-semibold">Lowest:</span> <span>{months[Number(lowestMonth.label.split('-')[1])]} {lowestMonth.label.split('-')[0]} ({lowestMonth.value})</span>
                    </div>
                  )}
                  {momChange !== null && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-semibold text-green-800">MoM Change:</span>
                      <span className={momTrend === 'up' ? 'text-green-700' : momTrend === 'down' ? 'text-red-700' : 'text-gray-700'}>
                        {momChange > 0 ? '+' : ''}{momChange} {momTrend === 'up' && <FaArrowUp className="inline text-green-600" />} {momTrend === 'down' && <FaArrowDown className="inline text-red-600" />} {momTrend === 'flat' && <FaMinus className="inline text-gray-500" />}
                      </span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-xs text-green-800 mt-1">Not enough data for prediction (min. 6 months).</div>
            )}
          </div>
          {/* Sparkline */}
          <div className="w-full md:w-48 h-16 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={60}>
              <LineChart data={sparkData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <Line type="monotone" dataKey="value" stroke="#059669" strokeWidth={2} dot={false} />
                <Tooltip formatter={(v, n, p) => [`${v}`, `${sparkData[p?.payload?.month - 1]?.label || ''}`]} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Requestors Placeholder */}
      <div className="bg-white rounded-lg border-black border-1 shadow-2xl p-6 mt-4 transition-shadow duration-300">
        <h3 className="text-xl text-center font-semibold text-gray-900 mb-4">Top Requestors Within a Week</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className=" p-4">
            <p className="font-medium text-gray-900">Top Resident</p>
            <ol className="list-decimal ml-4 text-sm mt-2 text-gray-900">
              {topResidents.length === 0 ? <li>No data</li> : topResidents.map((name, i) => <li key={i}>{name}</li>)}
            </ol>
          </div>
          <div className=" p-4">
            <p className="font-medium text-gray-900">Age with the Most Requests</p>
            <ol className="list-decimal ml-4 text-sm mt-2 text-gray-900">
              {topAges.length === 0 ? <li>No data</li> : topAges.map((age, i) => <li key={i}>{age}</li>)}
            </ol>
        </div>
          <div className=" p-4">
            <p className="font-medium text-gray-900">Purok with the Most Requests</p>
            <ol className="list-decimal ml-4 text-sm mt-2 text-gray-900">
              {topPuroks.length === 0 ? <li>No data</li> : topPuroks.map((purok, i) => <li key={i}>{purok}</li>)}
            </ol>
            </div>
          <div className=" p-4">
            <p className="font-medium text-gray-900">Days with the Most Requests</p>
            <ol className="list-decimal ml-4 text-sm mt-2 text-gray-900">
              {topDays.length === 0 ? <li>No data</li> : topDays.map((day, i) => <li key={i}>{day}</li>)}
            </ol>
          </div>
        </div>
      </div>

      {/* Per Category: Request by Document */}
      <div className="bg-white border-black border-1 rounded-lg shadow-2xl p-6 mt-4 transition-shadow duration-300">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Request by Document</h3>
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
                    fill={docTypeColors[type] || '#b5c99a'}
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
      <div className="bg-white border-black border-1 rounded-lg shadow-2xl p-6 mt-4 transition-shadow duration-300">
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
      <div className="bg-white border-black border-1 rounded-lg shadow-2xl p-6 mt-4 transition-shadow duration-300">
        {/* <h3 className="text-xl font-bold text-gray-900 mb-6">Request by PWD Category</h3> */}
        <div className="flex flex-col md:flex-row gap-8 items-stretch justify-center">
          {/* Pie Chart */}
          <div className="w-full md:w-1/2 flex flex-col items-center justify-center min-h-[340px]">
            <h3 className="text-xl font-bold text-gray-900">Request by PWD Category</h3>
            <ResponsiveContainer width="100%" height={400}>
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
          {/* <div className="hidden md:block w-px bg-gray-200 mx-2"></div> */}
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
      <div className="bg-white border-black border-1 rounded-lg shadow-2xl p-6 mt-4 transition-shadow duration-300">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Request by Priority Category</h3>
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
