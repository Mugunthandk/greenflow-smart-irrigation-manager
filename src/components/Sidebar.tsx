import React from 'react';
import { 
  LayoutDashboard, 
  Sprout, 
  CalendarClock, 
  BrainCircuit, 
  BarChart3, 
  FileSpreadsheet, 
  Settings as SettingsIcon,
  Droplet,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  farmName: string;
  onLogout: () => void;
}

export default function Sidebar({ currentTab, setCurrentTab, farmName, onLogout }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'fields', name: 'Field Management', icon: Sprout },
    { id: 'schedules', name: 'Irrigation Schedules', icon: CalendarClock },
    { id: 'recommendations', name: 'Smart Advisor', icon: BrainCircuit },
    { id: 'analytics', name: 'Water Analytics', icon: BarChart3 },
    { id: 'reports', name: 'Reports & Export', icon: FileSpreadsheet },
    { id: 'settings', name: 'System Settings', icon: SettingsIcon },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-emerald-100 dark:border-slate-800 flex flex-col h-full shrink-0">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-emerald-50 dark:border-slate-800 gap-3">
        <div className="p-2 rounded-xl bg-emerald-500 text-white shadow-md shadow-emerald-500/20">
          <Droplet className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h1 className="font-display font-bold text-emerald-800 dark:text-emerald-400 text-base tracking-tight leading-none">
            AeroIrrigate
          </h1>
          <span className="text-[10px] text-gray-400 dark:text-slate-400 font-mono tracking-wider">
            SMART SCHEDULER
          </span>
        </div>
      </div>

      {/* Farm Profile Panel */}
      <div className="p-4 mx-4 my-3 bg-emerald-50/50 dark:bg-slate-800/40 rounded-2xl border border-emerald-500/10">
        <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-semibold">
          Active Farm
        </div>
        <div className="font-medium text-sm text-gray-700 dark:text-slate-200 truncate mt-0.5">
          {farmName || "Loading..."}
        </div>
        <div className="flex items-center gap-1.5 mt-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            System Online
          </span>
        </div>
      </div>

      {/* Navigation Menu Links */}
      <nav className="flex-1 px-3 space-y-1 py-3 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-150 group relative ${
                isActive
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/10 font-semibold'
                  : 'text-gray-600 dark:text-slate-300 hover:bg-emerald-50/50 dark:hover:bg-slate-850 hover:text-emerald-600 dark:hover:text-emerald-400'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                isActive ? 'text-white' : 'text-gray-400 dark:text-slate-400 group-hover:text-emerald-500 dark:group-hover:text-emerald-400'
              }`} />
              <span>{item.name}</span>
              {isActive && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white animate-fade-in" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout Action */}
      <div className="px-3 py-2 border-t border-emerald-50 dark:border-slate-800">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl text-rose-600 dark:text-rose-450 hover:bg-rose-50 dark:hover:bg-rose-950/20 active:bg-rose-100 dark:active:bg-rose-950/30 transition-all duration-150 group cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-rose-500 group-hover:scale-115 transition-transform" />
          <span>Log Out Portal</span>
        </button>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-emerald-50 dark:border-slate-800 text-center">
        <div className="text-[11px] text-gray-400 dark:text-slate-500 font-mono">
          AeroIrrigate Local v1.2
        </div>
      </div>
    </aside>
  );
}
