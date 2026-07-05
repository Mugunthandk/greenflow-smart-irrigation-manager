import React, { useState, useMemo } from 'react';
import { 
  CalendarClock, 
  Plus, 
  Trash2, 
  Edit, 
  X, 
  Clock, 
  Droplet, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { IrrigationSchedule, Field, SystemSettings } from '../types';
import axios from 'axios';

interface SchedulesProps {
  schedules: IrrigationSchedule[];
  fields: Field[];
  settings: SystemSettings;
  fetchData: () => Promise<void>;
  addNotification: (message: string) => void;
}

export default function Schedules({ 
  schedules, 
  fields, 
  settings, 
  fetchData, 
  addNotification 
}: SchedulesProps) {
  // Modals & Triggers
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<IrrigationSchedule | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Form Fields
  const [fieldId, setFieldId] = useState('');
  const [startTime, setStartTime] = useState('06:00');
  const [duration, setDuration] = useState<number>(settings.defaultDuration);
  const [waterAmount, setWaterAmount] = useState<number>(300);
  const [frequency, setFrequency] = useState<IrrigationSchedule['frequency']>('daily');
  const [enabled, setEnabled] = useState(true);

  // Search & Filter state
  const [frequencyFilter, setFrequencyFilter] = useState('');

  // Open forms
  const openAddModal = () => {
    setEditingSchedule(null);
    setFieldId(fields[0]?.id || '');
    setStartTime('06:00');
    setDuration(settings.defaultDuration);
    setWaterAmount(300);
    setFrequency('daily');
    setEnabled(true);
    setShowModal(true);
  };

  const openEditModal = (sched: IrrigationSchedule) => {
    setEditingSchedule(sched);
    setFieldId(sched.fieldId);
    setStartTime(sched.startTime);
    setDuration(sched.duration);
    setWaterAmount(sched.waterAmount);
    setFrequency(sched.frequency);
    setEnabled(sched.enabled);
    setShowModal(true);
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldId || !startTime || duration <= 0 || waterAmount <= 0) {
      alert('Please configure valid parameters for duration and water volume.');
      return;
    }

    try {
      const fieldObj = fields.find(f => f.id === fieldId);
      if (editingSchedule) {
        await axios.put(`/api/schedules/${editingSchedule.id}`, {
          fieldId,
          startTime,
          duration,
          waterAmount,
          frequency,
          enabled
        });
        addNotification(`Schedule for field "${fieldObj?.name || 'field'}" updated successfully.`);
      } else {
        await axios.post('/api/schedules', {
          fieldId,
          startTime,
          duration,
          waterAmount,
          frequency,
          enabled
        });
        addNotification(`New schedule created for field "${fieldObj?.name || 'field'}".`);
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error('Failed to save schedule', error);
      alert('Error updating schedule database.');
    }
  };

  // In-line switch toggle for Enabled state
  const toggleEnabled = async (sched: IrrigationSchedule) => {
    try {
      const nextState = !sched.enabled;
      await axios.put(`/api/schedules/${sched.id}`, {
        enabled: nextState
      });
      addNotification(`Schedule for field ${fields.find(f => f.id === sched.fieldId)?.name || ''} was ${nextState ? 'enabled' : 'disabled'}.`);
      fetchData();
    } catch (error) {
      console.error('Failed to toggle schedule state', error);
    }
  };

  // Delete
  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/schedules/${id}`);
      addNotification('Irrigation schedule deleted successfully.');
      setShowDeleteConfirm(null);
      fetchData();
    } catch (error) {
      console.error('Error deleting schedule:', error);
    }
  };

  // Filter schedules
  const filteredSchedules = useMemo(() => {
    let result = [...schedules];
    if (frequencyFilter) {
      result = result.filter(s => s.frequency === frequencyFilter);
    }
    return result;
  }, [schedules, frequencyFilter]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl text-slate-800 dark:text-white tracking-tight">
            Irrigation Schedules
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
            Configure automated irrigation routines. These rules run in background to supply standard soil nourishment.
          </p>
        </div>
        <button
          onClick={openAddModal}
          disabled={fields.length === 0}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:bg-gray-300 dark:disabled:bg-slate-800 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-emerald-500/15 flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          Create Schedule
        </button>
      </div>

      {/* Filter / Quick Info banner */}
      <div className="flex flex-col sm:flex-row justify-between items-center p-4 bg-white dark:bg-slate-900 rounded-2xl border border-emerald-100/40 dark:border-slate-800 shadow-sm gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 font-mono uppercase tracking-wider">
            Filter Frequency:
          </label>
          <select
            value={frequencyFilter}
            onChange={(e) => setFrequencyFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-medium outline-none text-gray-700 dark:text-slate-350 cursor-pointer"
          >
            <option value="">All Frequencies</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        {fields.length === 0 && (
          <div className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5 font-medium bg-amber-50 dark:bg-amber-950/20 px-3 py-1.5 rounded-xl">
            <AlertCircle className="w-4 h-4" />
            Please configure at least one field sector before creating schedules.
          </div>
        )}
      </div>

      {/* Schedules List Grid */}
      {filteredSchedules.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSchedules.map((schedule) => {
            const field = fields.find(f => f.id === schedule.fieldId);
            return (
              <div 
                key={schedule.id}
                className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                  schedule.enabled 
                    ? 'border-emerald-100/50 dark:border-emerald-900/30' 
                    : 'border-gray-200 dark:border-slate-800 opacity-70'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl flex items-center justify-center ${
                        schedule.enabled 
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' 
                          : 'bg-gray-100 dark:bg-slate-800 text-gray-500'
                      }`}>
                        <CalendarClock className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-slate-200">
                          {field ? field.name : 'Unassociated Sector'}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-400 dark:text-slate-500 font-mono">
                          <span>Crop: {field ? field.crop : 'N/A'}</span>
                          <span>•</span>
                          <span className="uppercase font-semibold text-emerald-600 dark:text-emerald-400">{schedule.frequency}</span>
                        </div>
                      </div>
                    </div>

                    {/* Enable / Disable toggle button */}
                    <button
                      onClick={() => toggleEnabled(schedule)}
                      className={`p-1.5 rounded-xl flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-colors ${
                        schedule.enabled
                          ? 'text-emerald-600 hover:text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30'
                          : 'text-gray-400 hover:text-gray-500 bg-gray-50 dark:bg-slate-800/40'
                      }`}
                      title={schedule.enabled ? "Disable Automation Run" : "Enable Automation Run"}
                    >
                      {schedule.enabled ? (
                        <>
                          <Eye className="w-4 h-4" />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-4 h-4" />
                          <span>Disabled</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Attributes readout */}
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-850">
                      <div className="text-[10px] font-bold text-gray-400 dark:text-slate-400 font-mono uppercase tracking-wider flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Duration & Time
                      </div>
                      <div className="text-sm font-bold text-slate-700 dark:text-slate-200 mt-1 font-mono">
                        {schedule.startTime} <span className="text-[11px] font-sans font-normal text-gray-400">({schedule.duration}m)</span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-850">
                      <div className="text-[10px] font-bold text-gray-400 dark:text-slate-400 font-mono uppercase tracking-wider flex items-center gap-1">
                        <Droplet className="w-3.5 h-3.5" />
                        Water Volume
                      </div>
                      <div className="text-sm font-bold text-slate-700 dark:text-slate-200 mt-1 font-mono">
                        {schedule.waterAmount} <span className="text-[11px] font-sans font-normal text-gray-400">Gal</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="flex justify-between items-center border-t border-gray-100 dark:border-slate-850 pt-4 mt-5">
                  <span className="text-[10px] text-gray-400 dark:text-slate-500 font-mono uppercase tracking-wider">
                    SCHED ID: {schedule.id}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(schedule)}
                      className="px-3 py-1.5 border border-gray-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-slate-800 text-xs font-semibold text-gray-600 dark:text-slate-300 rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(schedule.id)}
                      className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-gray-200 dark:border-slate-800">
          <CalendarClock className="w-12 h-12 text-gray-300 dark:text-slate-700 mx-auto mb-3" />
          <h4 className="font-semibold text-gray-600 dark:text-slate-400">No Irrigation Schedules</h4>
          <p className="text-sm text-gray-400 dark:text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
            There are no active or configured scheduling templates. Click 'Create Schedule' to build an automated watering timeline.
          </p>
        </div>
      )}

      {/* ADD / EDIT SCHEDULE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 flex items-center justify-center p-4 z-50 overflow-y-auto backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-emerald-100 dark:border-slate-800 shadow-2xl max-w-md w-full overflow-hidden animate-fade-in my-8">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-emerald-50 dark:border-slate-800 flex justify-between items-center bg-emerald-50/20 dark:bg-slate-800/20">
              <div className="flex items-center gap-2">
                <CalendarClock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-display font-bold text-lg text-slate-800 dark:text-white">
                  {editingSchedule ? 'Edit Schedule Plan' : 'Create Irrigation Schedule'}
                </h3>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 font-mono uppercase mb-1.5">
                  Target Agricultural Field
                </label>
                <select
                  required
                  value={fieldId}
                  onChange={(e) => setFieldId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all dark:text-slate-250 cursor-pointer"
                >
                  <option value="" disabled>-- Select Sector Field --</option>
                  {fields.map(f => (
                    <option key={f.id} value={f.id}>{f.name} ({f.crop})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 font-mono uppercase mb-1.5">
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all dark:text-slate-250"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 font-mono uppercase mb-1.5">
                    Frequency Cycle
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as IrrigationSchedule['frequency'])}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all dark:text-slate-250 cursor-pointer"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 font-mono uppercase mb-1.5">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all dark:text-slate-250"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 font-mono uppercase mb-1.5">
                    Water Amount (Gallons)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={waterAmount}
                    onChange={(e) => setWaterAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all dark:text-slate-250"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="enabledCheckbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 bg-slate-50 border-gray-200 rounded focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="enabledCheckbox" className="text-xs font-medium text-gray-700 dark:text-slate-300 cursor-pointer">
                  Enable schedule instantly on save
                </label>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 dark:border-slate-700 font-medium text-sm rounded-xl text-gray-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
                >
                  {editingSchedule ? 'Save Changes' : 'Create Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM DIALOG */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-emerald-100 dark:border-slate-800 shadow-2xl max-w-sm w-full animate-fade-in">
            <h3 className="font-display font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-rose-500" />
              Delete Schedule?
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-2 leading-relaxed">
              Are you sure you want to delete this irrigation schedule? Deleting this template means automated watering tasks for this specific time block will suspend. This action is irreversible.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 py-2 border border-gray-200 dark:border-slate-700 text-sm font-medium rounded-xl text-gray-500 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-bold text-sm rounded-xl cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
