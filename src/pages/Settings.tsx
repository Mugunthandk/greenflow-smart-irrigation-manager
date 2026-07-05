import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Building, 
  DollarSign, 
  Clock, 
  Bell, 
  Save, 
  CheckCircle,
  Activity
} from 'lucide-react';
import { SystemSettings } from '../types';
import axios from 'axios';

interface SettingsProps {
  settings: SystemSettings;
  fetchData: () => Promise<void>;
  addNotification: (message: string) => void;
}

export default function Settings({ settings, fetchData, addNotification }: SettingsProps) {
  const [farmName, setFarmName] = useState(settings.farmName);
  const [waterCost, setWaterCost] = useState<number>(settings.waterCost);
  const [defaultDuration, setDefaultDuration] = useState<number>(settings.defaultDuration);
  const [notificationsEnabled, setNotificationsEnabled] = useState(settings.notificationsEnabled);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Sync state if initial settings prop changes (e.g. on load)
  useEffect(() => {
    setFarmName(settings.farmName);
    setWaterCost(settings.waterCost);
    setDefaultDuration(settings.defaultDuration);
    setNotificationsEnabled(settings.notificationsEnabled);
  }, [settings]);

  // Submit PUT API
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmName || waterCost < 0 || defaultDuration <= 0) {
      alert('Please fill in valid configuration fields.');
      return;
    }

    setSaving(true);
    setSuccess(false);

    try {
      await axios.put('/api/settings', {
        farmName,
        waterCost: Number(waterCost),
        defaultDuration: Number(defaultDuration),
        notificationsEnabled
      });

      addNotification('System database configurations successfully updated.');
      await fetchData();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to persist settings. Please verify data formats.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="font-display font-bold text-2xl text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-7 h-7 text-emerald-500 animate-spin" style={{ animationDuration: '8s' }} />
          System Settings
        </h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
          Configure default scheduler policies, water billing rates, and local push notification alert toggles.
        </p>
      </div>

      {/* Main Form container */}
      <div className="bg-white dark:bg-slate-900 border border-emerald-100/30 dark:border-slate-850 rounded-3xl p-6 md:p-8 shadow-sm">
        <form onSubmit={handleSave} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Farm Name */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Building className="w-4 h-4 text-emerald-500" />
                Agricultural Farm Name
              </label>
              <input
                type="text"
                required
                value={farmName}
                onChange={(e) => setFarmName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all dark:text-slate-200"
              />
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Appears on PDF reports, invoice ledgers, and navbar dashboards.
              </p>
            </div>

            {/* Water Billing rate */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                Water Rate cost ($ / Gal)
              </label>
              <input
                type="number"
                required
                step="0.001"
                min="0"
                value={waterCost}
                onChange={(e) => setWaterCost(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all dark:text-slate-200 font-mono"
              />
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Unit price used to compute cost breakdowns on water consumption logs.
              </p>
            </div>

            {/* Default Schedule Duration */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-500" />
                Default cycle duration (mins)
              </label>
              <input
                type="number"
                required
                min="1"
                value={defaultDuration}
                onChange={(e) => setDefaultDuration(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all dark:text-slate-200 font-mono"
              />
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Pre-populated irrigation duration value suggested when creating new schedules.
              </p>
            </div>

            {/* Notifications Toggle */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 font-mono uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <Bell className="w-4 h-4 text-emerald-500" />
                Push Notification Alerts
              </label>
              
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-gray-150 dark:border-slate-800">
                <input
                  type="checkbox"
                  id="notifToggle"
                  checked={notificationsEnabled}
                  onChange={(e) => setNotificationsEnabled(e.target.checked)}
                  className="w-5 h-5 text-emerald-600 bg-white border-gray-200 rounded focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="notifToggle" className="text-xs font-medium text-gray-700 dark:text-slate-300 cursor-pointer">
                  Enable immediate system alarms in top bar
                </label>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Toggles warning popovers for extreme sensor deviations or scheduling logs.
              </p>
            </div>

          </div>

          {/* Form Actions Footer */}
          <div className="border-t border-gray-100 dark:border-slate-850 pt-6 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Activity className="w-4.5 h-4.5 text-gray-400" />
              <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Config: local persistent sqlite schema</span>
            </div>

            <div className="flex items-center gap-4">
              {success && (
                <div className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-semibold animate-fade-in">
                  <CheckCircle className="w-4 h-4" />
                  Configurations Saved Successfully
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-emerald-500/15 flex items-center gap-2 disabled:bg-gray-300 dark:disabled:bg-slate-800 cursor-pointer disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
