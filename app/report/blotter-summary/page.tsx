'use client';
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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

interface BlotterData {
  _id: string;
  caseNo: string;
  complaint: string;
  natureOfComplaint: string;
  complainantInfo: UserInfo;
  respondentInfo: UserInfo;
  status: string;
  createdAt: string;
}

export default function BlotterSummaryPage() {
  const [blotters, setBlotters] = useState<BlotterData[]>([]);
  const [loading, setLoading] = useState(true);
  const [barType, setBarType] = useState<'monthly' | 'annual'>('monthly');

  useEffect(() => {
    const fetchBlotters = async () => {
      try {
        const response = await fetch('/api/blotter/get-all-blotters');
        const result = await response.json();
        if (result.success) {
          setBlotters(result.data);
        }
      } catch {
        //
      } finally {
        setLoading(false);
      }
    };
    fetchBlotters();
  }, []);

  // No filters for summary export, use all blotters
  const filteredBlotters = blotters;

  // --- SUMMARY CARDS ---
  const total = filteredBlotters.length;
  const pending = filteredBlotters.filter(b => b.status.toLowerCase() === 'pending').length;
  const settled = filteredBlotters.filter(b => b.status.toLowerCase() === 'settled').length;
  const endorsed = filteredBlotters.filter(b => b.status.toLowerCase() === 'endorsed').length;
  const summaryData = [
    { label: 'Pending', value: pending, percent: total ? Math.round((pending/total)*100) : 0 },
    { label: 'Settled', value: settled, percent: total ? Math.round((settled/total)*100) : 0 },
    { label: 'Endorsed', value: endorsed, percent: total ? Math.round((endorsed/total)*100) : 0 },
    { label: 'Total', value: total, percent: 100 },
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
      Pending: monthBlotters.filter(b => b.status.toLowerCase() === 'pending').length,
      Settled: monthBlotters.filter(b => b.status.toLowerCase() === 'settled').length,
      Endorsed: monthBlotters.filter(b => b.status.toLowerCase() === 'endorsed').length,
    };
  });
  const annualBarData = [thisYear, lastYear].map(year => {
    const yearBlotters = filteredBlotters.filter(b => new Date(b.createdAt).getFullYear() === year);
    return {
      year: year.toString(),
      Pending: yearBlotters.filter(b => b.status.toLowerCase() === 'pending').length,
      Settled: yearBlotters.filter(b => b.status.toLowerCase() === 'settled').length,
      Endorsed: yearBlotters.filter(b => b.status.toLowerCase() === 'endorsed').length,
    };
  });

  const exportPDF = async () => {
    const input = document.getElementById('export-section');
    if (!input) return;
    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
    });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('blotter-summary.pdf');
  };

  if (loading) return <div className="text-gray-800">Loading summary...</div>;

  return (
    <div className="space-y-8 p-8 bg-white">
      {/* Export Data Button */}
      <button
        className="px-4 py-2 bg-green-700 text-white rounded shadow hover:bg-green-800 transition mb-4"
        onClick={exportPDF}
      >
        Export Data
      </button>
      <div id="export-section">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {summaryData.map((card, i) => (
            <div key={i} className="p-6 rounded-lg shadow-lg bg-white">
              <p className="text-3xl font-bold text-black">{card.value}</p>
              <p className="text-lg font-medium text-black">{card.label}</p>
              <p className="text-xs mt-2 text-black">{card.percent}% from Total</p>
            </div>
          ))}
        </div>
        {/* Main Bar Chart */}
        <div className="bg-white rounded-lg shadow-2xl p-6 mt-4">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">Cases (Monthly)</h3>
          <div className="flex justify-end mb-2">
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
              <Bar dataKey="Pending" fill="#012815" />
              <Bar dataKey="Settled" fill="#145c3d" />
              <Bar dataKey="Endorsed" fill="#3d8c66" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
