import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Edit, 
  Trash2, 
  X, 
  Sprout, 
  Maximize2, 
  MapPin, 
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Field } from '../types';
import axios from 'axios';

interface FieldsProps {
  fields: Field[];
  fetchData: () => Promise<void>;
  addNotification: (message: string) => void;
}

const SOIL_TYPES = ['Sandy', 'Clay', 'Loamy', 'Silty', 'Peaty'];

export default function Fields({ fields, fetchData, addNotification }: FieldsProps) {
  // Modal / Form state
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingField, setEditingField] = useState<Field | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Form Fields
  const [fieldName, setFieldName] = useState('');
  const [crop, setCrop] = useState('');
  const [area, setArea] = useState<number>(10);
  const [location, setLocation] = useState('');
  const [soilType, setSoilType] = useState<Field['soilType']>('Loamy');

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [soilFilter, setSoilFilter] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'area' | 'crop'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Open Add modal
  const openAddModal = () => {
    setEditingField(null);
    setFieldName('');
    setCrop('');
    setArea(10);
    setLocation('');
    setSoilType('Loamy');
    setShowFormModal(true);
  };

  // Open Edit modal
  const openEditModal = (field: Field) => {
    setEditingField(field);
    setFieldName(field.name);
    setCrop(field.crop);
    setArea(field.area);
    setLocation(field.location);
    setSoilType(field.soilType);
    setShowFormModal(true);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldName || !crop || !location) {
      alert('Please fill in all text fields.');
      return;
    }

    try {
      if (editingField) {
        // Update
        await axios.put(`/api/fields/${editingField.id}`, {
          name: fieldName,
          crop,
          area,
          location,
          soilType
        });
        addNotification(`Field "${fieldName}" successfully updated.`);
      } else {
        // Create
        await axios.post('/api/fields', {
          name: fieldName,
          crop,
          area,
          location,
          soilType
        });
        addNotification(`Field "${fieldName}" successfully created.`);
      }
      setShowFormModal(false);
      fetchData();
    } catch (error) {
      console.error('Error saving field:', error);
      alert('Failed to save field details. Please check your data.');
    }
  };

  // Delete Handler
  const handleDelete = async (id: string) => {
    try {
      const fieldToDelete = fields.find(f => f.id === id);
      await axios.delete(`/api/fields/${id}`);
      addNotification(`Field "${fieldToDelete?.name || 'Field'}" deleted successfully.`);
      setShowDeleteConfirm(null);
      fetchData();
    } catch (error) {
      console.error('Failed to delete field:', error);
      alert('Error deleting field. Check connections.');
    }
  };

  // Toggle sort
  const handleSort = (field: 'name' | 'area' | 'crop') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Filter and Sort Data
  const filteredAndSortedFields = useMemo(() => {
    let result = [...fields];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        f => 
          f.name.toLowerCase().includes(q) ||
          f.crop.toLowerCase().includes(q) ||
          f.location.toLowerCase().includes(q)
      );
    }

    // Soil type filter
    if (soilFilter) {
      result = result.filter(f => f.soilType === soilFilter);
    }

    // Sort
    result.sort((a, b) => {
      let valA: string | number = a[sortBy];
      let valB: string | number = b[sortBy];

      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = (valB as string).toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [fields, search, soilFilter, sortBy, sortOrder]);

  // Paginated Data
  const paginatedFields = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedFields.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedFields, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedFields.length / itemsPerPage));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl text-slate-800 dark:text-white tracking-tight">
            Field Management
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
            Configure land sectors, crops, dimensions, and soil types to tailor irrigation.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-emerald-500/15 flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Sector / Field
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-emerald-100/40 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search fields, crops, locations..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all dark:text-slate-200"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider font-mono">
              Soil Type:
            </span>
          </div>
          <select
            value={soilFilter}
            onChange={(e) => {
              setSoilFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-medium outline-none text-gray-700 dark:text-slate-350 cursor-pointer"
          >
            <option value="">All Soils</option>
            {SOIL_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid List of Fields */}
      {paginatedFields.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedFields.map((field) => (
            <div 
              key={field.id}
              className="bg-white dark:bg-slate-900 border border-emerald-100/50 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-emerald-100 dark:hover:border-slate-700 transition-all duration-250 flex flex-col justify-between"
            >
              {/* Card Title */}
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
                      <Sprout className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-base text-slate-800 dark:text-white leading-snug">
                        {field.name}
                      </h3>
                      <span className="inline-block mt-0.5 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 text-[10px] font-bold rounded font-mono uppercase tracking-wide">
                        {field.crop}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(field)}
                      className="p-1.5 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      title="Edit Field"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(field.id)}
                      className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      title="Delete Field"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Grid Attributes */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-gray-100 dark:border-slate-850">
                    <div className="text-[10px] font-bold text-gray-400 dark:text-slate-400 font-mono uppercase tracking-wider flex items-center gap-1">
                      <Maximize2 className="w-3.5 h-3.5" />
                      Total Area
                    </div>
                    <div className="text-sm font-bold text-slate-700 dark:text-slate-200 mt-1 font-mono">
                      {field.area} <span className="text-[11px] font-sans font-normal text-gray-400">Acres</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-gray-100 dark:border-slate-850">
                    <div className="text-[10px] font-bold text-gray-400 dark:text-slate-400 font-mono uppercase tracking-wider flex items-center gap-1">
                      <Settings className="w-3.5 h-3.5" />
                      Soil Type
                    </div>
                    <div className="text-sm font-bold text-slate-700 dark:text-slate-200 mt-1">
                      {field.soilType}
                    </div>
                  </div>
                </div>

                {/* Location Footer */}
                <div className="flex items-center gap-1.5 mt-4 text-xs text-gray-400 dark:text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="truncate">Location: {field.location}</span>
                </div>
              </div>

              {/* Created Date Footer */}
              <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-850/30 border-t border-emerald-50 dark:border-slate-800/50 flex justify-between items-center text-[10px] text-gray-400 font-mono">
                <span>SECTOR ID: {field.id}</span>
                <span>Configured: {new Date(field.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-gray-200 dark:border-slate-800">
          <Sprout className="w-12 h-12 text-gray-300 dark:text-slate-700 mx-auto mb-3" />
          <h4 className="font-semibold text-gray-600 dark:text-slate-400">No Fields Configured</h4>
          <p className="text-sm text-gray-400 dark:text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
            There are no agricultural field sectors matching your filter or search query. Click 'Add Sector' to get started.
          </p>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-emerald-100/30 dark:border-slate-800 pt-4">
          <div className="text-xs text-gray-400 dark:text-slate-500 font-mono">
            Showing Page {currentPage} of {totalPages} ({filteredAndSortedFields.length} results)
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

      {/* FORM MODAL (Add / Edit Field) */}
      {showFormModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 flex items-center justify-center p-4 z-50 overflow-y-auto backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-emerald-100 dark:border-slate-800 shadow-2xl max-w-md w-full overflow-hidden animate-fade-in my-8">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-emerald-50 dark:border-slate-800 flex justify-between items-center bg-emerald-50/20 dark:bg-slate-800/20">
              <div className="flex items-center gap-2">
                <Sprout className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-display font-bold text-lg text-slate-800 dark:text-white">
                  {editingField ? 'Edit Field Sector' : 'Add Field Sector'}
                </h3>
              </div>
              <button 
                onClick={() => setShowFormModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 font-mono uppercase mb-1.5">
                  Field Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. North Pasture"
                  value={fieldName}
                  onChange={(e) => setFieldName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all dark:text-slate-250"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 font-mono uppercase mb-1.5">
                    Crop Type
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Corn, Rice"
                    value={crop}
                    onChange={(e) => setCrop(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all dark:text-slate-250"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 font-mono uppercase mb-1.5">
                    Land Area (Acres)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="0.1"
                    value={area}
                    onChange={(e) => setArea(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all dark:text-slate-250"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 font-mono uppercase mb-1.5">
                  Soil Type Configuration
                </label>
                <select
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value as Field['soilType'])}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all dark:text-slate-250 cursor-pointer"
                >
                  {SOIL_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 font-mono uppercase mb-1.5">
                  Location / Sector Coordinate
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Plot B-2"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all dark:text-slate-250"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 dark:border-slate-700 font-medium text-sm rounded-xl text-gray-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
                >
                  {editingField ? 'Save Changes' : 'Create Sector'}
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
              Delete Sector?
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-2 leading-relaxed">
              Are you sure you want to permanently delete this sector? Deleting this sector will automatically cascade delete all associated active irrigation schedules and historical watering telemetry reports. This action cannot be undone.
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
