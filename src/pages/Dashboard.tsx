import React, { useState } from 'react';
import { 
  Sprout, 
  Calendar, 
  Droplet, 
  DollarSign, 
  Activity, 
  Play, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Field, IrrigationSchedule, WaterUsage, SystemSettings } from '../types';
import axios from 'axios';

interface DashboardProps {
  fields: Field[];
  schedules: IrrigationSchedule[];
  waterUsage: WaterUsage[];
  settings: SystemSettings;
  fetchData: () => Promise<void>;
  addNotification: (message: string) => void;
  setCurrentTab: (tab: string) => void;
}

// Reusable Trend Indicator Badge
function TrendBadge({ value }: { value: number }) {
  if (value > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 font-mono" title="Increased compared to previous week">
        <ArrowUpRight className="w-3 h-3 text-emerald-500" />
        +{value}%
      </span>
    );
  }
  if (value < 0) {
    return (
      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 font-mono" title="Decreased compared to previous week">
        <ArrowDownRight className="w-3 h-3 text-rose-500" />
        {value}%
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-50 dark:bg-slate-800 text-gray-450 dark:text-slate-550 font-mono" title="No change compared to previous week">
      0%
    </span>
  );
}

export default function Dashboard({ 
  fields, 
  schedules, 
  waterUsage, 
  settings, 
  fetchData,
  addNotification,
  setCurrentTab
}: DashboardProps) {
  const [irrigationFieldId, setIrrigationFieldId] = useState<string>('');
  const [irrigationVolume, setIrrigationVolume] = useState<number>(300);
  const [irrigationDuration, setIrrigationDuration] = useState<number>(20);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stats Calculations
  const totalFields = fields.length;
  const activeSchedules = schedules.filter(s => s.enabled).length;

  // Water usage today
  const todayStr = new Date().toISOString().split('T')[0];
  const waterToday = waterUsage
    .filter(u => u.date === todayStr)
    .reduce((sum, curr) => sum + curr.amount, 0);

  // Total cost incurred this month
  const totalWaterThisMonth = waterUsage.reduce((sum, curr) => sum + curr.amount, 0);
  const totalCost = (totalWaterThisMonth * settings.waterCost).toFixed(2);

  // Helper to get days difference local to the client's current date context
  const getDaysDifference = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const itemDate = new Date(year, month - 1, day);
    itemDate.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diffTime = today.getTime() - itemDate.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  };

  // Helper to parse ISO strings and find days ago
  const getDaysAgoFromISO = (isoStr: string) => {
    if (!isoStr) return 999;
    const d = new Date(isoStr);
    d.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.round((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Water consumption: This Week (last 7 days, 0-6 days ago) vs Previous Week (7-13 days ago)
  const thisWeekWater = waterUsage
    .filter(u => {
      const diff = getDaysDifference(u.date);
      return diff >= 0 && diff < 7;
    })
    .reduce((sum, curr) => sum + curr.amount, 0);

  const prevWeekWater = waterUsage
    .filter(u => {
      const diff = getDaysDifference(u.date);
      return diff >= 7 && diff < 14;
    })
    .reduce((sum, curr) => sum + curr.amount, 0);

  let waterTrend = 0;
  if (prevWeekWater > 0) {
    waterTrend = Math.round(((thisWeekWater - prevWeekWater) / prevWeekWater) * 100);
  } else if (thisWeekWater > 0) {
    waterTrend = 100;
  }

  // Cost trend corresponds to water usage activity week-over-week
  const costTrend = waterTrend;

  // Field Activity: Irrigation runs count (This week vs Previous week)
  const thisWeekRuns = waterUsage.filter(u => {
    const diff = getDaysDifference(u.date);
    return diff >= 0 && diff < 7;
  }).length;

  const prevWeekRuns = waterUsage.filter(u => {
    const diff = getDaysDifference(u.date);
    return diff >= 7 && diff < 14;
  }).length;

  let runsTrend = 0;
  if (prevWeekRuns > 0) {
    runsTrend = Math.round(((thisWeekRuns - prevWeekRuns) / prevWeekRuns) * 100);
  } else if (thisWeekRuns > 0) {
    runsTrend = 100;
  }

  // Fields count trend: fields created on or before today vs fields created before 7 days ago
  const prevWeekFields = fields.filter(f => getDaysAgoFromISO(f.createdAt) >= 7).length;
  let fieldsTrend = 0;
  if (prevWeekFields > 0) {
    fieldsTrend = Math.round(((totalFields - prevWeekFields) / prevWeekFields) * 100);
  } else if (totalFields > prevWeekFields) {
    fieldsTrend = 100;
  }

  // Active schedules count trend: schedules enabled today vs schedules enabled and created before 7 days ago
  const prevWeekSchedules = schedules.filter(s => s.enabled && getDaysAgoFromISO(s.createdAt) >= 7).length;
  let schedulesTrend = 0;
  if (prevWeekSchedules > 0) {
    schedulesTrend = Math.round(((activeSchedules - prevWeekSchedules) / prevWeekSchedules) * 100);
  } else if (activeSchedules > prevWeekSchedules) {
    schedulesTrend = 100;
  }

  // Filter schedules that run today
  const activeSchedulesList = schedules.filter(s => s.enabled);

  // Manual irrigation submission
  const handleQuickIrrigate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!irrigationFieldId) {
      alert('Please select a field first.');
      return;
    }
    setIsSubmitting(true);
    try {
      await axios.post('/api/water-usage', {
        fieldId: irrigationFieldId,
        amount: Number(irrigationVolume),
        duration: Number(irrigationDuration),
        date: todayStr
      });
      addNotification(`Manual irrigation burst of ${irrigationVolume} gal successfully completed for field.`);
      await fetchData();
      setIrrigationFieldId('');
    } catch (error) {
      console.error('Failed to trigger quick irrigate', error);
      alert('Failed to trigger quick irrigation. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Upper Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl text-slate-800 dark:text-white tracking-tight">
            Farm Overview
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
            Real-time status updates and manual control interface for <span className="font-medium text-emerald-600 dark:text-emerald-400">{settings.farmName}</span>.
          </p>
        </div>
        <div className="text-xs text-gray-400 dark:text-slate-500 font-mono bg-white dark:bg-slate-900 border border-emerald-50 dark:border-slate-800 px-3.5 py-2 rounded-xl shadow-sm">
          Last Database Sync: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Stats Cards Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Fields Card */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-emerald-100/50 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0">
            <Sprout className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs text-gray-400 dark:text-slate-400 font-medium">Total Fields</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-display font-bold text-slate-800 dark:text-white leading-none">{totalFields}</span>
              <TrendBadge value={fieldsTrend} />
            </div>
          </div>
        </div>

        {/* Active Schedules Card */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-emerald-100/50 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs text-gray-400 dark:text-slate-400 font-medium">Active Schedules</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-display font-bold text-slate-800 dark:text-white leading-none">{activeSchedules}</span>
              <TrendBadge value={schedulesTrend} />
            </div>
          </div>
        </div>

        {/* Today's Water Consumption Card */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-emerald-100/50 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 rounded-xl shrink-0">
            <Droplet className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs text-gray-400 dark:text-slate-400 font-medium">Today's Usage</div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-2xl font-display font-bold text-slate-800 dark:text-white font-mono leading-none">{waterToday} <span className="text-xs font-sans text-gray-400 font-normal">gal</span></span>
              <TrendBadge value={waterTrend} />
            </div>
          </div>
        </div>

        {/* Water Cost Accumulated Card */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-emerald-100/50 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs text-gray-400 dark:text-slate-400 font-medium">Monthly Cost</div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-2xl font-display font-bold text-slate-800 dark:text-white font-mono leading-none">${totalCost}</span>
              <TrendBadge value={costTrend} />
            </div>
          </div>
        </div>

        {/* Field Activity Card */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-emerald-100/50 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs text-gray-400 dark:text-slate-400 font-medium">Field Activity</div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-2xl font-display font-bold text-slate-800 dark:text-white font-mono leading-none">{thisWeekRuns} <span className="text-xs font-sans text-gray-400 font-normal">runs</span></span>
              <TrendBadge value={runsTrend} />
            </div>
          </div>
        </div>
      </div>

      {/* Middle Grid: Quick Hydrator & Active Schedules Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Quick Override Hydration Panel */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-emerald-100/30 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-display font-semibold text-lg text-slate-800 dark:text-white flex items-center gap-2">
              <Play className="w-5 h-5 text-emerald-500 fill-emerald-500" />
              Manual Irrigation Burst
            </h3>
            <p className="text-xs text-gray-400 dark:text-slate-400 mt-1 leading-relaxed">
              Manually trigger immediate high-volume crop hydration on any field. This bypasses active schedules and logs consumption parameters immediately.
            </p>

            <form onSubmit={handleQuickIrrigate} className="space-y-4 mt-5">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-slate-300 font-mono uppercase mb-1.5">
                  Target Field
                </label>
                <select
                  required
                  value={irrigationFieldId}
                  onChange={(e) => setIrrigationFieldId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-250 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all dark:text-slate-200"
                >
                  <option value="">-- Choose Field to Irrigate --</option>
                  {fields.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.crop})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-slate-300 font-mono uppercase mb-1.5">
                    Water Volume (Gal)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={irrigationVolume}
                    onChange={(e) => setIrrigationVolume(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-250 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-slate-300 font-mono uppercase mb-1.5">
                    Duration (Min)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={irrigationDuration}
                    onChange={(e) => setIrrigationDuration(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-250 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all dark:text-slate-200"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || fields.length === 0}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-medium text-sm rounded-xl transition-all shadow-md shadow-emerald-500/15 flex items-center justify-center gap-2 disabled:bg-gray-300 dark:disabled:bg-slate-800 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? 'Irrigating...' : 'Start Irrigation Run'}
              </button>
            </form>
          </div>
          {fields.length === 0 && (
            <p className="text-[11px] text-amber-500 text-center font-medium mt-3 bg-amber-50 dark:bg-amber-950/20 p-2 rounded-xl">
              Add fields in Field Management first.
            </p>
          )}
        </div>

        {/* Irrigation Timeline Panel */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-emerald-100/30 dark:border-slate-800 shadow-sm col-span-2">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-display font-semibold text-lg text-slate-800 dark:text-white">
                Scheduled Irrigation Plans
              </h3>
              <p className="text-xs text-gray-400 dark:text-slate-400">
                System automation schedule configured for standard runs.
              </p>
            </div>
            <button
              onClick={() => setCurrentTab('schedules')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              Configure Schedules
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 max-h-[290px] overflow-y-auto pr-1">
            {activeSchedulesList.length > 0 ? (
              activeSchedulesList.map((schedule) => {
                const associatedField = fields.find(f => f.id === schedule.fieldId);
                return (
                  <div 
                    key={schedule.id}
                    className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-gray-150 dark:border-slate-800/60"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-200">
                          {associatedField ? associatedField.name : 'Unknown Field'}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400 dark:text-slate-400 font-mono">
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">{schedule.frequency}</span>
                          <span>•</span>
                          <span>Start at {schedule.startTime}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-800 dark:text-slate-200 font-mono">
                        {schedule.waterAmount} gal
                      </div>
                      <div className="text-xs text-gray-400 dark:text-slate-400">
                        {schedule.duration} mins
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 border border-dashed border-gray-200 dark:border-slate-800 rounded-2xl">
                <Calendar className="w-8 h-8 text-gray-300 dark:text-slate-700 mx-auto mb-2" />
                <p className="text-xs font-mono text-gray-400 dark:text-slate-500">
                  No active/enabled irrigation schedules.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
