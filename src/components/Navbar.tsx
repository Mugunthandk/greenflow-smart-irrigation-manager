import React, { useState } from 'react';
import { 
  Sun, 
  Moon, 
  Bell, 
  CloudRain, 
  Thermometer, 
  Droplets,
  Wind,
  LogOut,
  User,
  ChevronDown
} from 'lucide-react';
import { WeatherCondition } from '../types';

interface NavbarProps {
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  weather: WeatherCondition;
  setWeather: (weather: WeatherCondition) => void;
  notificationsEnabled: boolean;
  fieldsCount: number;
  userName: string;
  userEmail: string;
  onLogout: () => void;
}

export default function Navbar({ 
  darkMode, 
  setDarkMode, 
  weather, 
  setWeather, 
  notificationsEnabled,
  fieldsCount,
  userName,
  userEmail,
  onLogout
}: NavbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [notificationList, setNotificationList] = useState<string[]>([
    "Today's scheduled runs completed successfully.",
    "Critical recommendation generated: Temperature exceeded 35°C.",
    "Sandy soil in Sector D-1 requires dynamic water scheduling."
  ]);

  const handleWeatherChange = (key: keyof WeatherCondition, value: number) => {
    setWeather({
      ...weather,
      [key]: value
    });
  };

  const getSystemHealth = () => {
    if (weather.temperature > 35 && weather.soilMoisture < 40) return { label: 'Attention Required', color: 'bg-amber-500' };
    if (weather.soilMoisture < 35) return { label: 'Arid Alert', color: 'bg-red-500' };
    return { label: 'Optimal State', color: 'bg-emerald-500' };
  };

  const systemStatus = getSystemHealth();

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-emerald-100 dark:border-slate-800 flex items-center justify-between px-6 shrink-0 relative z-10">
      {/* Left: Weather Monitor Header */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${systemStatus.color} animate-pulse`} />
          <span className="text-xs font-semibold text-gray-500 dark:text-slate-300 font-mono tracking-tight uppercase">
            Status: {systemStatus.label}
          </span>
        </div>

        {/* Dynamic Global Weather Simulation Readouts */}
        <div className="hidden lg:flex items-center gap-4 py-1.5 px-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-gray-150 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400">
            <Thermometer className="w-4 h-4" />
            <span className="font-semibold font-mono">{weather.temperature}°C</span>
          </div>
          <span className="text-gray-300 dark:text-slate-700">|</span>
          <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
            <Droplets className="w-4 h-4" />
            <span className="font-semibold font-mono">Moisture {weather.soilMoisture}%</span>
          </div>
          <span className="text-gray-300 dark:text-slate-700">|</span>
          <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
            <CloudRain className="w-4 h-4" />
            <span className="font-semibold font-mono">Rain {weather.rainfall}mm</span>
          </div>
          <span className="text-gray-300 dark:text-slate-700">|</span>
          <div className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400">
            <Wind className="w-4 h-4" />
            <span className="font-semibold font-mono">{weather.windSpeed} km/h</span>
          </div>
        </div>
      </div>

      {/* Right: Actions (Theme, notifications, profile) */}
      <div className="flex items-center gap-4">
        {/* Environment Simulator Widget Drawer */}
        <div className="flex items-center gap-2 text-xs mr-2">
          <span className="text-[11px] font-semibold text-gray-400 dark:text-slate-500 font-mono uppercase">
            Weather Control:
          </span>
          <select 
            className="bg-emerald-50 dark:bg-slate-800 text-emerald-800 dark:text-emerald-400 px-2 py-1 rounded-lg border-none text-xs font-medium cursor-pointer"
            onChange={(e) => {
              const preset = e.target.value;
              if (preset === 'hot-dry') {
                setWeather({ temperature: 38, soilMoisture: 25, rainfall: 0, humidity: 30, windSpeed: 20 });
              } else if (preset === 'heavy-rain') {
                setWeather({ temperature: 21, soilMoisture: 80, rainfall: 35, humidity: 90, windSpeed: 15 });
              } else if (preset === 'cool-humid') {
                setWeather({ temperature: 18, soilMoisture: 65, rainfall: 2, humidity: 85, windSpeed: 10 });
              } else if (preset === 'normal') {
                setWeather({ temperature: 26, soilMoisture: 52, rainfall: 0, humidity: 55, windSpeed: 12 });
              }
            }}
            defaultValue="normal"
          >
            <option value="normal">Normal Summer</option>
            <option value="hot-dry">Hot & Dry (Crisis)</option>
            <option value="heavy-rain">Heavy Rain (Skip)</option>
            <option value="cool-humid">Cool & Humid</option>
          </select>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 text-gray-500 hover:text-emerald-500 dark:text-slate-400 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-xl transition-all duration-150"
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-gray-500 hover:text-emerald-500 dark:text-slate-400 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-xl transition-all duration-150 relative"
          >
            <Bell className="w-5 h-5" />
            {notificationsEnabled && notificationList.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-bounce" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl border border-emerald-50 dark:border-slate-800 shadow-xl overflow-hidden animate-fade-in z-50">
              <div className="p-4 border-b border-emerald-50 dark:border-slate-800 flex justify-between items-center bg-emerald-50/20 dark:bg-slate-800/30">
                <h4 className="font-semibold text-sm text-emerald-800 dark:text-emerald-400">
                  Farm Notifications
                </h4>
                {notificationList.length > 0 && (
                  <button 
                    onClick={() => setNotificationList([])}
                    className="text-[11px] text-gray-400 hover:text-rose-500 font-mono"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="divide-y divide-emerald-50/50 dark:divide-slate-800/50 max-h-60 overflow-y-auto">
                {notificationList.length > 0 ? (
                  notificationList.map((notif, idx) => (
                    <div key={idx} className="p-3 text-xs text-gray-600 dark:text-slate-300 leading-relaxed hover:bg-emerald-50/10">
                      {notif}
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-gray-400 font-mono">
                    No active system alerts.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar Card Dropdown */}
        <div className="relative pl-2 border-l border-emerald-100 dark:border-slate-800">
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center gap-2.5 hover:bg-emerald-50/40 dark:hover:bg-slate-800/40 p-1.5 rounded-xl transition-all cursor-pointer text-left select-none"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center font-black text-sm shadow-sm">
              {userName ? userName.charAt(0).toUpperCase() : 'O'}
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-bold text-gray-800 dark:text-slate-200 flex items-center gap-1">
                {userName || "Operator"}
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${showProfileDropdown ? 'rotate-180' : ''}`} />
              </div>
              <div className="text-[10px] text-gray-400 dark:text-slate-400 font-mono leading-none">
                Administrator
              </div>
            </div>
          </button>

          {showProfileDropdown && (
            <>
              {/* Backscreen tap close */}
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowProfileDropdown(false)} 
              />
              
              {/* Dropdown Box */}
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl border border-emerald-50 dark:border-slate-800 shadow-xl overflow-hidden animate-fade-in z-50">
                <div className="p-4 bg-emerald-50/20 dark:bg-slate-800/30 border-b border-emerald-50 dark:border-slate-800">
                  <div className="text-xs font-bold text-slate-800 dark:text-white truncate">
                    {userName || "Agri Operator"}
                  </div>
                  <div className="text-[11px] text-gray-400 dark:text-slate-400 font-mono truncate mt-0.5">
                    {userEmail || "admin@aeroirrigate.com"}
                  </div>
                </div>
                
                <div className="p-1.5">
                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-rose-600 dark:text-rose-450 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-colors text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    Sign Out Session
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
