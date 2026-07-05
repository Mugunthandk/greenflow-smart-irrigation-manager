import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Layers, 
  Leaf, 
  Compass,
  DollarSign
} from 'lucide-react';
import { WaterUsage, Field, SystemSettings } from '../types';
import WeeklyHeatmap from '../components/WeeklyHeatmap';

interface AnalyticsProps {
  waterUsage: WaterUsage[];
  fields: Field[];
  settings: SystemSettings;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#6366f1', '#ec4899', '#8b5cf6'];

export default function Analytics({ waterUsage, fields, settings }: AnalyticsProps) {
  const [timeframe, setTimeframe] = useState<'7' | '30'>('7');

  // 1. Line Chart: Daily consumption trend for the selected timeframe
  const dailyTrendData = useMemo(() => {
    const daysToInclude = timeframe === '7' ? 7 : 30;
    
    // Get last N days
    const dates: string[] = [];
    const baseDate = new Date();
    baseDate.setHours(0, 0, 0, 0);

    for (let i = daysToInclude - 1; i >= 0; i--) {
      const d = new Date(baseDate.getTime() - i * 24 * 60 * 60 * 1000);
      dates.push(d.toISOString().split('T')[0]);
    }

    return dates.map(dateStr => {
      // Find total volume for this day
      const volume = waterUsage
        .filter(u => u.date === dateStr)
        .reduce((sum, curr) => sum + curr.amount, 0);

      // format date for x-axis (e.g. "Jul 04")
      const dObj = new Date(dateStr);
      const formattedDate = dObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });

      return {
        date: formattedDate,
        volume,
        cost: Number((volume * settings.waterCost).toFixed(2))
      };
    });
  }, [waterUsage, timeframe, settings.waterCost]);

  // 2. Bar Chart: Crop-specific water usage comparison
  const cropUsageData = useMemo(() => {
    const cropTotals: { [crop: string]: number } = {};

    waterUsage.forEach(usage => {
      const field = fields.find(f => f.id === usage.fieldId);
      if (field) {
        cropTotals[field.crop] = (cropTotals[field.crop] || 0) + usage.amount;
      }
    });

    return Object.keys(cropTotals).map(crop => ({
      crop,
      volume: cropTotals[crop],
      cost: Number((cropTotals[crop] * settings.waterCost).toFixed(2))
    }));
  }, [waterUsage, fields, settings.waterCost]);

  // 3. Pie Chart: Soil-type water volume breakdown
  const soilUsageData = useMemo(() => {
    const soilTotals: { [soil: string]: number } = {};

    waterUsage.forEach(usage => {
      const field = fields.find(f => f.id === usage.fieldId);
      if (field) {
        soilTotals[field.soilType] = (soilTotals[field.soilType] || 0) + usage.amount;
      }
    });

    return Object.keys(soilTotals).map(soil => ({
      name: soil,
      value: soilTotals[soil]
    }));
  }, [waterUsage, fields]);

  // Helper metric totals
  const aggregateMetrics = useMemo(() => {
    const daysToCount = timeframe === '7' ? 7 : 30;
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Filter history matching timeframe
    const baseDate = new Date();
    baseDate.setHours(0,0,0,0);
    const cutoffMs = baseDate.getTime() - daysToCount * 24 * 60 * 60 * 1000;
    
    const matchedUsage = waterUsage.filter(u => {
      const d = new Date(u.date);
      return d.getTime() >= cutoffMs;
    });

    const totalVolume = matchedUsage.reduce((sum, curr) => sum + curr.amount, 0);
    const totalCost = totalVolume * settings.waterCost;
    const avgDailyVolume = Math.round(totalVolume / daysToCount);

    return {
      totalVolume,
      totalCost,
      avgDailyVolume
    };
  }, [waterUsage, timeframe, settings.waterCost]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-emerald-500" />
            Water Consumption Analytics
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
            Statistical dashboards tracking distribution efficiency, cost, and soil-absorption trends.
          </p>
        </div>

        {/* Timeframe selector toggle */}
        <div className="bg-white dark:bg-slate-900 p-1 rounded-xl border border-emerald-100/50 dark:border-slate-800 flex shadow-sm">
          <button
            onClick={() => setTimeframe('7')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              timeframe === '7'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-gray-500 hover:text-emerald-500 dark:text-slate-400'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setTimeframe('30')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              timeframe === '30'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-gray-500 hover:text-emerald-500 dark:text-slate-400'
            }`}
          >
            Last 30 Days
          </button>
        </div>
      </div>

      {/* Aggregate Stats Sub-cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-emerald-50 dark:border-slate-850 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-gray-400 dark:text-slate-400 font-medium">Aggregated Volume</div>
            <div className="text-xl font-display font-bold text-slate-800 dark:text-white mt-0.5 font-mono">
              {aggregateMetrics.totalVolume.toLocaleString()} <span className="text-xs font-sans text-gray-400 font-normal">gal</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-emerald-50 dark:border-slate-850 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-gray-400 dark:text-slate-400 font-medium">Water Costs Incurred</div>
            <div className="text-xl font-display font-bold text-slate-800 dark:text-white mt-0.5 font-mono">
              ${aggregateMetrics.totalCost.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-emerald-50 dark:border-slate-850 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-gray-400 dark:text-slate-400 font-medium">Daily Consumption Average</div>
            <div className="text-xl font-display font-bold text-slate-800 dark:text-white mt-0.5 font-mono">
              {aggregateMetrics.avgDailyVolume.toLocaleString()} <span className="text-xs font-sans text-gray-400 font-normal font-mono">gal/d</span>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Visualization Bento Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Line / Area Chart: Daily Usage Trends */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-emerald-50 dark:border-slate-850 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-display font-semibold text-base text-slate-800 dark:text-white">
                Daily Irrigation Water Velocity
              </h3>
              <p className="text-xs text-gray-400 dark:text-slate-400">
                Timeline tracking cumulative gallons released across farm fields.
              </p>
            </div>
          </div>

          <div className="h-72 w-full text-xs font-mono">
            {waterUsage.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(16, 185, 129, 0.05)" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                      borderRadius: '12px',
                      border: 'none',
                      color: '#f8fafc'
                    }}
                  />
                  <Legend fontSize={11} verticalAlign="top" height={36} />
                  <Area type="monotone" name="Irrigation Volume (Gal)" dataKey="volume" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorVolume)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 font-mono">No telemetry data.</div>
            )}
          </div>
        </div>

        {/* Pie Chart: Soil absorption breakdown */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-emerald-50 dark:border-slate-850 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-display font-semibold text-base text-slate-800 dark:text-white">
              Soil-Type Distribution
            </h3>
            <p className="text-xs text-gray-400 dark:text-slate-400 mb-6">
              Volume percentage partitioned across distinct soil conditions.
            </p>
          </div>

          <div className="h-56 w-full text-xs">
            {soilUsageData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={soilUsageData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {soilUsageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                      borderRadius: '12px',
                      border: 'none',
                      color: '#f8fafc'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 font-mono">No data.</div>
            )}
          </div>

          {/* Legend helper listing items with custom circles */}
          <div className="grid grid-cols-2 gap-2 text-[11px] font-medium text-gray-500 dark:text-slate-400 font-mono mt-4">
            {soilUsageData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-1.5 truncate">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="truncate">{item.name}: {item.value.toLocaleString()} Gal</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Water Usage Calendar Heatmap (D3-powered) */}
        <div className="lg:col-span-3">
          <WeeklyHeatmap waterUsage={waterUsage} fields={fields} settings={settings} />
        </div>

        {/* Bar Chart: Crop usage comparison */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-emerald-50 dark:border-slate-850 shadow-sm lg:col-span-3">
          <div>
            <h3 className="font-display font-semibold text-base text-slate-800 dark:text-white">
              Crop Irrigation Profile
            </h3>
            <p className="text-xs text-gray-400 dark:text-slate-400 mb-6">
              Total volume allocation contrasted by harvest crop species.
            </p>
          </div>

          <div className="h-64 w-full text-xs font-mono">
            {cropUsageData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cropUsageData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(16, 185, 129, 0.05)" vertical={false} />
                  <XAxis dataKey="crop" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                      borderRadius: '12px',
                      border: 'none',
                      color: '#f8fafc'
                    }}
                  />
                  <Bar name="Irrigated Volume (Gal)" dataKey="volume" radius={[6, 6, 0, 0]}>
                    {cropUsageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 font-mono">No data.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
