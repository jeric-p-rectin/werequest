'use client';
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { FaInfoCircle, FaArrowUp, FaArrowDown, FaMinus } from 'react-icons/fa';
import { LineChart, Line } from 'recharts';
import * as ss from 'simple-statistics';

// Copy types/enums from IssuanceDashboard
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

export default function IssuanceSummaryPage() {
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch('/api/document/get-all-documents');
        const result = await response.json();
        if (result.success) {
          setDocuments(result.data);
        }
      } catch {
        // Optionally log error
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, []);

  // No filters for summary export, use all documents
  const filteredDocuments = documents;

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

  // --- Statistics Prediction & Insights ---
  // Build a time series: each month-year with its total requests
  const timeSeries = (() => {
    const map = new Map<string, number>();
    documents.forEach(doc => {
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
  })();

  // Prepare last 12 months for sparkline
  const last12 = timeSeries.slice(-12);
  const sparkData = last12.map((d, i) => ({
    month: i + 1,
    value: d.value,
    label: d.key,
  }));

  // Linear Regression Prediction
  let nextMonthPrediction: number | null = null;
  let trend: 'up' | 'down' | 'flat' = 'flat';
  let lrValue: number | null = null;
  let lrSlope: number | null = null;
  if (timeSeries.length >= 6) {
    const x = timeSeries.map((_, i) => i);
    const y = timeSeries.map(item => item.value);
    const lr = ss.linearRegression(x.map((xi: number, i: number) => [xi, y[i]]));
    const lrLine = ss.linearRegressionLine(lr);
    lrValue = Math.round(lrLine(timeSeries.length));
    lrSlope = lr.m;
    nextMonthPrediction = lrValue;
    if (lrSlope !== null && lrSlope !== undefined) {
      if (lrSlope > 0.5) trend = 'up';
      else if (lrSlope < -0.5) trend = 'down';
      else trend = 'flat';
    }
  }

  // Exponential Smoothing Prediction (simple, alpha=0.5)
  let esValue: number | null = null;
  if (timeSeries.length >= 6) {
    const alpha = 0.5;
    let s = timeSeries[0].value;
    for (let i = 1; i < timeSeries.length; i++) {
      s = alpha * timeSeries[i].value + (1 - alpha) * s;
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
  if (timeSeries.length > 0) {
    const vals = timeSeries.map(d => d.value);
    avgPerMonth = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
    const maxIdx = vals.indexOf(Math.max(...vals));
    const minIdx = vals.indexOf(Math.min(...vals));
    highestMonth = { label: timeSeries[maxIdx].key, value: vals[maxIdx] };
    lowestMonth = { label: timeSeries[minIdx].key, value: vals[minIdx] };
    // Month-over-month change
    if (timeSeries.length >= 2) {
      const last = vals[vals.length - 1];
      const prev = vals[vals.length - 2];
      momChange = last - prev;
      if (momChange > 0) momTrend = 'up';
      else if (momChange < 0) momTrend = 'down';
      else momTrend = 'flat';
    }
  }

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
    pdf.save('issuance-summary.pdf');
  };

  if (loading) return <div className="text-gray-800">Loading summary...</div>;

  return (
    <div className="space-y-8 p-8 bg-white">
      {/* PDF Export Button */}
      <button
        className="px-4 py-2 bg-green-700 text-white rounded shadow hover:bg-green-800 transition mb-4"
        onClick={exportPDF}
      >
        Export Summary as PDF
      </button>
      <div id="export-section">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-lg shadow-lg bg-white">
            <p className="text-3xl font-bold text-gray-900">{pending}</p>
            <p className="text-lg font-medium text-gray-900">Pending</p>
            <p className="text-xs mt-2 text-gray-900">{total ? ((pending/total)*100).toFixed(0) : 0}% of Total</p>
          </div>
          <div className="p-6 rounded-lg shadow-lg bg-white">
            <p className="text-3xl font-bold text-gray-900">{approved}</p>
            <p className="text-lg font-medium text-gray-900">Approved</p>
            <p className="text-xs mt-2 text-gray-900">{total ? ((approved/total)*100).toFixed(0) : 0}% of Total</p>
          </div>
          <div className="p-6 rounded-lg shadow-lg bg-white">
            <p className="text-3xl font-bold text-gray-900">{declined}</p>
            <p className="text-lg font-medium text-gray-900">Declined</p>
            <p className="text-xs mt-2 text-gray-900">{total ? ((declined/total)*100).toFixed(0) : 0}% of Total</p>
          </div>
          <div className="p-6 rounded-lg shadow-lg bg-white">
            <p className="text-3xl font-bold text-gray-900">{total}</p>
            <p className="text-lg font-medium text-gray-900">Total</p>
            <p className="text-xs mt-2 text-gray-900">+{total}</p>
          </div>
        </div>
        {/* Overall Request Chart */}
        <div className="bg-white rounded-lg shadow-2xl p-6 mt-4">
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
        {/* Prediction & Insights Card (moved below chart for PDF) */}
        <div className="p-4 bg-green-700 rounded-lg shadow flex flex-col md:flex-row items-center gap-4 my-4">
          <div className="flex-1 flex flex-col items-center md:items-start">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold text-white text-lg">Prediction & Insights</span>
              <FaInfoCircle className="text-yellow-300" title="Prediction and insights are based on all available data (min. 6 months for prediction)." />
            </div>
            {timeSeries.length >= 6 && nextMonthPrediction !== null ? (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl font-bold text-yellow-300">{nextMonthPrediction}</span>
                  {trend === 'up' && <FaArrowUp className="text-yellow-300" title="Upward trend" />}
                  {trend === 'down' && <FaArrowDown className="text-red-300" title="Downward trend" />}
                  {trend === 'flat' && <FaMinus className="text-white" title="Flat trend" />}
                </div>
                <div className="text-xs text-yellow-200 mb-1">Estimated total requests for next month</div>
                {showBoth && (
                  <div className="text-xs text-yellow-200">Exponential Smoothing: <span className="font-bold">{esValue}</span></div>
                )}
                <div className="text-xs text-yellow-100 mb-2">Model: Linear Regression{showBoth ? ' & Exponential Smoothing' : ''}</div>
                {/* Additional Insights */}
                <div className="mt-2 space-y-1 w-full">
                  {avgPerMonth !== null && (
                    <div className="flex items-center gap-2 text-sm text-yellow-100">
                      <span className="font-semibold">Avg/month:</span> <span>{avgPerMonth}</span>
                    </div>
                  )}
                  {highestMonth && (
                    <div className="flex items-center gap-2 text-sm text-yellow-200">
                      <span className="font-semibold">Highest:</span> <span>{months[Number(highestMonth.label.split('-')[1])]} {highestMonth.label.split('-')[0]} ({highestMonth.value})</span>
                    </div>
                  )}
                  {lowestMonth && (
                    <div className="flex items-center gap-2 text-sm text-yellow-300">
                      <span className="font-semibold">Lowest:</span> <span>{months[Number(lowestMonth.label.split('-')[1])]} {lowestMonth.label.split('-')[0]} ({lowestMonth.value})</span>
                    </div>
                  )}
                  {momChange !== null && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-semibold text-yellow-100">MoM Change:</span>
                      <span className={momTrend === 'up' ? 'text-yellow-200' : momTrend === 'down' ? 'text-red-200' : 'text-white'}>
                        {momChange > 0 ? '+' : ''}{momChange} {momTrend === 'up' && <FaArrowUp className="inline text-yellow-200" />} {momTrend === 'down' && <FaArrowDown className="inline text-red-200" />} {momTrend === 'flat' && <FaMinus className="inline text-white" />}
                      </span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-xs text-yellow-100 mt-1">Not enough data for prediction (min. 6 months).</div>
            )}
          </div>
          {/* Sparkline */}
          <div className="w-full md:w-48 h-16 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={60}>
              <LineChart data={sparkData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <Line type="monotone" dataKey="value" stroke="#fde68a" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* End Prediction & Insights Card */}
      </div>
    </div>
  );
}
