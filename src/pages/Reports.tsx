import React, { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  FileDown, 
  Calendar, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Filter,
  CheckCircle2
} from 'lucide-react';
import { WaterUsage, Field, SystemSettings } from '../types';

interface ReportsProps {
  waterUsage: WaterUsage[];
  fields: Field[];
  settings: SystemSettings;
}

export default function Reports({ waterUsage, fields, settings }: ReportsProps) {
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Aggregate telemetry rows matching the report structure
  const reportRows = useMemo(() => {
    // Sort usage history chronologically descending
    const sortedUsage = [...waterUsage].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return sortedUsage.map((usage) => {
      const associatedField = fields.find(f => f.id === usage.fieldId);
      const fieldName = associatedField ? associatedField.name : 'Unknown Field';
      const crop = associatedField ? associatedField.crop : 'N/A';
      const soilType = associatedField ? associatedField.soilType : 'N/A';
      const cost = Number((usage.amount * settings.waterCost).toFixed(2));

      return {
        id: usage.id,
        date: usage.date,
        fieldName,
        crop,
        soilType,
        duration: usage.duration,
        amount: usage.amount,
        cost
      };
    });
  }, [waterUsage, fields, settings.waterCost]);

  // Aggregate rows into daily / weekly / monthly buckets if requested, 
  // or filter the detailed ledger according to the selected duration scope
  const filteredRows = useMemo(() => {
    let result = [...reportRows];

    // Filter by date range depending on report type
    const today = new Date();
    today.setHours(0,0,0,0);
    const todayMs = today.getTime();

    if (reportType === 'daily') {
      // Show last 7 days of daily runs
      const sevenDaysAgoMs = todayMs - 7 * 24 * 60 * 60 * 1000;
      result = result.filter(r => new Date(r.date).getTime() >= sevenDaysAgoMs);
    } else if (reportType === 'weekly') {
      // Show last 30 days
      const thirtyDaysAgoMs = todayMs - 30 * 24 * 60 * 60 * 1000;
      result = result.filter(r => new Date(r.date).getTime() >= thirtyDaysAgoMs);
    } else if (reportType === 'monthly') {
      // Show last 90 days
      const ninetyDaysAgoMs = todayMs - 90 * 24 * 60 * 60 * 1000;
      result = result.filter(r => new Date(r.date).getTime() >= ninetyDaysAgoMs);
    }

    // Apply search query (field name, crop, soil)
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        r => 
          r.fieldName.toLowerCase().includes(q) ||
          r.crop.toLowerCase().includes(q) ||
          r.soilType.toLowerCase().includes(q)
      );
    }

    return result;
  }, [reportRows, reportType, search]);

  // CSV Generator Downloader
  const handleDownloadCSV = () => {
    const headers = ["Date", "Field Name", "Crop Type", "Soil Configuration", "Irrigation Duration (Mins)", "Water Volume (Gallons)", "Est Cost (USD)"];
    
    const csvContentRows = filteredRows.map(r => [
      r.date,
      `"${r.fieldName.replace(/"/g, '""')}"`,
      r.crop,
      r.soilType,
      r.duration,
      r.amount,
      r.cost
    ].join(","));

    const csvContentStr = [headers.join(","), ...csvContentRows].join("\n");
    const blob = new Blob([csvContentStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${settings.farmName.replace(/\s+/g, '_')}_${reportType}_irrigation_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Pagination bounds
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRows.slice(start, start + itemsPerPage);
  }, [filteredRows, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / itemsPerPage));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-7 h-7 text-emerald-500" />
            System Reports
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
            Audit watering activity ledger logs and export analytical files for compliance or agricultural accounting.
          </p>
        </div>

        {/* Export Button */}
        <button
          onClick={handleDownloadCSV}
          disabled={filteredRows.length === 0}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:bg-gray-300 dark:disabled:bg-slate-800 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-emerald-500/15 flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
        >
          <FileDown className="w-4.5 h-4.5" />
          Export Report to CSV
        </button>
      </div>

      {/* Control filters panel */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-emerald-100/40 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        
        {/* Toggle Scope */}
        <div className="flex gap-2">
          {(['daily', 'weekly', 'monthly'] as const).map((type) => (
            <button
              key={type}
              onClick={() => {
                setReportType(type);
                setCurrentPage(1);
              }}
              className={`px-4 py-1.5 text-xs font-semibold rounded-xl border capitalize transition-all cursor-pointer ${
                reportType === type
                  ? 'bg-emerald-50 dark:bg-slate-800 border-emerald-500 text-emerald-700 dark:text-emerald-400'
                  : 'border-gray-250 dark:border-slate-800 text-gray-500 dark:text-slate-450 hover:bg-emerald-50/10'
              }`}
            >
              {type} Scope
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search log fields/crops..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-1.5 text-xs outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all dark:text-slate-200"
          />
        </div>
      </div>

      {/* Report Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-emerald-50 dark:border-slate-850 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-850/40 border-b border-emerald-50 dark:border-slate-800/60">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-slate-400 font-mono uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-slate-400 font-mono uppercase tracking-wider">Sector / Field</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-slate-400 font-mono uppercase tracking-wider">Crop</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-slate-400 font-mono uppercase tracking-wider">Soil Profile</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-slate-400 font-mono uppercase tracking-wider">Water Duration</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-slate-400 font-mono uppercase tracking-wider text-right">Volume</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-slate-400 font-mono uppercase tracking-wider text-right">Est Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-50/50 dark:divide-slate-800/40 text-sm">
              {paginatedRows.length > 0 ? (
                paginatedRows.map((row) => (
                  <tr 
                    key={row.id}
                    className="hover:bg-emerald-50/10 dark:hover:bg-slate-850/10 transition-colors"
                  >
                    <td className="px-6 py-3.5 font-mono text-xs text-gray-500 dark:text-slate-400">{row.date}</td>
                    <td className="px-6 py-3.5 font-semibold text-slate-800 dark:text-slate-200">{row.fieldName}</td>
                    <td className="px-6 py-3.5">
                      <span className="px-2 py-0.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-350 text-[10px] font-bold rounded font-mono uppercase tracking-wide">
                        {row.crop}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-gray-600 dark:text-slate-300">{row.soilType}</td>
                    <td className="px-6 py-3.5 text-gray-500 dark:text-slate-400 font-mono text-xs">{row.duration} Mins</td>
                    <td className="px-6 py-3.5 font-bold font-mono text-slate-700 dark:text-slate-300 text-right">{row.amount.toLocaleString()} Gal</td>
                    <td className="px-6 py-3.5 font-bold font-mono text-emerald-600 dark:text-emerald-400 text-right">${row.cost.toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-gray-400 dark:text-slate-500 font-mono text-xs">
                    No matching ledger transactions recorded in database for this scope.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-emerald-100/30 dark:border-slate-800 pt-4">
          <div className="text-xs text-gray-400 dark:text-slate-500 font-mono">
            Showing Page {currentPage} of {totalPages} ({filteredRows.length} total entries)
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-500 hover:bg-emerald-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-transparent cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-500 hover:bg-emerald-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-transparent cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-6 right-6 z-50 group">
        {/* Tooltip */}
        <div className="absolute right-0 bottom-16 bg-slate-900 dark:bg-slate-850 text-white text-xs font-semibold py-2 px-3.5 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 pointer-events-none whitespace-nowrap border border-slate-700/50 dark:border-slate-750 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Export {filteredRows.length} {filteredRows.length === 1 ? 'entry' : 'entries'} to CSV
        </div>
        
        <button
          onClick={handleDownloadCSV}
          disabled={filteredRows.length === 0}
          className="flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 active:from-emerald-700 active:to-teal-600 text-white rounded-full shadow-lg shadow-emerald-600/30 dark:shadow-emerald-950/40 transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer disabled:from-gray-300 disabled:to-gray-350 dark:disabled:from-slate-800 dark:disabled:to-slate-850 disabled:text-gray-400 dark:disabled:text-slate-600 disabled:shadow-none disabled:cursor-not-allowed disabled:scale-100"
          id="fab-export-csv"
          title="Quick Export CSV"
        >
          <FileDown className="w-6 h-6" />
        </button>
      </div>

    </div>
  );
}
