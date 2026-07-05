import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { SystemSettings, WeatherCondition, Field, IrrigationSchedule, WaterUsage } from './types';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Fields from './pages/Fields';
import Schedules from './pages/Schedules';
import Recommendations from './pages/Recommendations';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Login from './pages/Login';
import { Droplet, RefreshCw } from 'lucide-react';

export default function App() {
  // Navigation states
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // DB States
  const [fields, setFields] = useState<Field[]>([]);
  const [schedules, setSchedules] = useState<IrrigationSchedule[]>([]);
  const [waterUsage, setWaterUsage] = useState<WaterUsage[]>([]);
  const [settings, setSettings] = useState<SystemSettings>({
    farmName: 'Green Valley Agro Farm',
    waterCost: 0.05,
    defaultDuration: 30,
    notificationsEnabled: true
  });

  // Environmental Sensor States (Simulated climate)
  const [weather, setWeather] = useState<WeatherCondition>({
    temperature: 26,
    soilMoisture: 52,
    rainfall: 0,
    humidity: 55,
    windSpeed: 12
  });

  // System States
  const [loading, setLoading] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<string[]>([]);

  // Push notifications helper
  const addNotification = (message: string) => {
    if (!settings.notificationsEnabled) return;
    setNotifications(prev => [message, ...prev.slice(0, 9)]);
  };

  // Authentication State
  const [user, setUser] = useState<{ email: string; name: string } | null>(() => {
    const saved = localStorage.getItem('user_session');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loggingOut, setLoggingOut] = useState<boolean>(false);

  const handleLogin = (email: string, name: string) => {
    const session = { email, name };
    localStorage.setItem('user_session', JSON.stringify(session));
    setUser(session);
    addNotification(`Operator ${name} authenticated successfully.`);
  };

  const handleLogout = () => {
    setLoggingOut(true);
    setTimeout(() => {
      localStorage.removeItem('user_session');
      setUser(null);
      setLoggingOut(false);
      addNotification('Operator session closed successfully.');
    }, 850);
  };

  // Pull datasets from backend database
  const fetchData = async () => {
    try {
      const [fieldsRes, schedulesRes, usageRes, settingsRes] = await Promise.all([
        axios.get<Field[]>('/api/fields'),
        axios.get<IrrigationSchedule[]>('/api/schedules'),
        axios.get<WaterUsage[]>('/api/water-usage'),
        axios.get<SystemSettings>('/api/settings')
      ]);

      setFields(fieldsRes.data);
      setSchedules(schedulesRes.data);
      setWaterUsage(usageRes.data);
      setSettings(settingsRes.data);
    } catch (error) {
      console.error('Failed to load datasets from smart-irrigation database', error);
    } finally {
      setLoading(false);
    }
  };

  // Sync theme with document element
  useEffect(() => {
    const root = window.document.body;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Load backend datasets on mount
  useEffect(() => {
    fetchData();
  }, []);

  // 30-minute inactivity session timeout
  useEffect(() => {
    if (!user) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      // 30 minutes in milliseconds
      timeoutId = setTimeout(() => {
        addNotification('Portal session auto-terminated due to 30 minutes of inactivity.');
        handleLogout();
      }, 30 * 60 * 1000);
    };

    // Global events to monitor for operator activity
    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];

    // Initialize first countdown
    resetTimer();

    // Register active session listeners
    activityEvents.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    // Cleanup listeners and clear timer on logout or unmount
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [user]);

  const renderActiveTab = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <Dashboard 
            fields={fields} 
            schedules={schedules} 
            waterUsage={waterUsage} 
            settings={settings}
            fetchData={fetchData}
            addNotification={addNotification}
            setCurrentTab={setCurrentTab}
          />
        );
      case 'fields':
        return (
          <Fields 
            fields={fields} 
            fetchData={fetchData} 
            addNotification={addNotification} 
          />
        );
      case 'schedules':
        return (
          <Schedules 
            schedules={schedules} 
            fields={fields} 
            settings={settings}
            fetchData={fetchData} 
            addNotification={addNotification} 
          />
        );
      case 'recommendations':
        return (
          <Recommendations 
            fields={fields} 
            weather={weather} 
            setWeather={setWeather} 
            addNotification={addNotification}
            fetchData={fetchData}
          />
        );
      case 'analytics':
        return (
          <Analytics 
            waterUsage={waterUsage} 
            fields={fields} 
            settings={settings} 
          />
        );
      case 'reports':
        return (
          <Reports 
            waterUsage={waterUsage} 
            fields={fields} 
            settings={settings} 
          />
        );
      case 'settings':
        return (
          <Settings 
            settings={settings} 
            fetchData={fetchData} 
            addNotification={addNotification} 
          />
        );
      default:
        return <div className="p-8 font-mono text-xs">Page not found</div>;
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-4">
        <div className="p-4 rounded-3xl bg-emerald-500 text-white shadow-xl animate-bounce">
          <Droplet className="w-10 h-10" />
        </div>
        <div className="flex items-center gap-2 font-mono text-xs font-semibold text-emerald-700 dark:text-emerald-400">
          <RefreshCw className="w-4 h-4 animate-spin" />
          AeroIrrigate Booting...
        </div>
      </div>
    );
  }

  // Session Logging Out Animation Loader
  if (loggingOut) {
    return (
      <div className="fixed inset-0 bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-4">
        <div className="p-4 rounded-3xl bg-rose-500 text-white shadow-xl animate-bounce" style={{ animationDuration: '2.5s' }}>
          <Droplet className="w-10 h-10 rotate-180" />
        </div>
        <div className="flex items-center gap-2 font-mono text-xs font-semibold text-rose-600 dark:text-rose-450">
          <RefreshCw className="w-4 h-4 animate-spin" />
          Closing secure portal session...
        </div>
      </div>
    );
  }

  // Unauthenticated Login Guard
  if (!user) {
    return <Login onLogin={handleLogin} farmName={settings.farmName} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-emerald-50/10 dark:bg-slate-950">
      
      {/* Sidebar Navigation */}
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        farmName={settings.farmName} 
        onLogout={handleLogout}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Header Navigation */}
        <Navbar 
          darkMode={darkMode} 
          setDarkMode={setDarkMode} 
          weather={weather}
          setWeather={setWeather}
          notificationsEnabled={settings.notificationsEnabled}
          fieldsCount={fields.length}
          userName={user.name}
          userEmail={user.email}
          onLogout={handleLogout}
        />

        {/* Content canvas container */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto pb-12">
            {renderActiveTab()}
          </div>
        </main>

      </div>
    </div>
  );
}
