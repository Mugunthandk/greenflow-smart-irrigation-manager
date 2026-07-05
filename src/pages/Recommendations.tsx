import React, { useState, useEffect } from 'react';
import { 
  BrainCircuit, 
  Thermometer, 
  Droplet, 
  CloudRain, 
  Wind, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  TrendingUp, 
  Droplets,
  Play
} from 'lucide-react';
import { Field, WeatherCondition, Recommendation } from '../types';
import axios from 'axios';

interface RecommendationsProps {
  fields: Field[];
  weather: WeatherCondition;
  setWeather: (weather: WeatherCondition) => void;
  addNotification: (message: string) => void;
  fetchData: () => Promise<void>;
}

export default function Recommendations({ 
  fields, 
  weather, 
  setWeather, 
  addNotification,
  fetchData
}: RecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [applyingId, setApplyingId] = useState<string | null>(null);

  // Trigger recommendation recalculation from backend
  const calculateRecommendations = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/recommendations', weather);
      setRecommendations(response.data);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Recalculate whenever global weather props change
  useEffect(() => {
    calculateRecommendations();
  }, [weather, fields]);

  // Handle slider modifications
  const handleSliderChange = (key: keyof WeatherCondition, value: number) => {
    setWeather({
      ...weather,
      [key]: value
    });
  };

  // Apply a recommendation immediately (logs water usage in database)
  const handleApplyRecommendation = async (rec: Recommendation) => {
    setApplyingId(rec.id);
    try {
      const baseAmount = 300;
      const adjustedAmount = Math.max(50, baseAmount + rec.waterAdjustment);
      
      await axios.post('/api/water-usage', {
        fieldId: rec.fieldId,
        amount: adjustedAmount,
        duration: rec.waterAdjustment > 100 ? 45 : 25,
        date: new Date().toISOString().split('T')[0]
      });

      addNotification(`Applied Smart Advisor advice: irrigated ${rec.fieldName} with ${adjustedAmount} gallons.`);
      await fetchData();
    } catch (error) {
      console.error('Failed to apply recommendation:', error);
    } finally {
      setApplyingId(null);
    }
  };

  const getStatusBadge = (status: Recommendation['status']) => {
    switch (status) {
      case 'Critical':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 text-xs font-bold rounded-full font-mono uppercase border border-red-200 dark:border-red-900/50">
            <XCircle className="w-3.5 h-3.5" />
            Critical Stress
          </span>
        );
      case 'Warning':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-xs font-bold rounded-full font-mono uppercase border border-amber-200 dark:border-amber-900/50">
            <AlertTriangle className="w-3.5 h-3.5" />
            Vulnerable
          </span>
        );
      case 'Skip':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 text-xs font-bold rounded-full font-mono uppercase border border-blue-200 dark:border-blue-900/50">
            <TrendingUp className="w-3.5 h-3.5 rotate-90" />
            Conservation Skip
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-full font-mono uppercase border border-emerald-200 dark:border-emerald-900/50">
            <CheckCircle className="w-3.5 h-3.5" />
            Optimal
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="font-display font-bold text-2xl text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
          <BrainCircuit className="w-7 h-7 text-emerald-500" />
          Smart Irrigation Advisor
        </h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
          Intelligent offline agronomic rule-engine. Simulates climatic sensors to suggest dynamic irrigation modifications.
        </p>
      </div>

      {/* Main Container Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Sensor Simulator Panel */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-emerald-100/40 dark:border-slate-800 shadow-sm space-y-6 h-fit">
          <div>
            <h3 className="font-display font-semibold text-base text-slate-800 dark:text-white">
              Climatic Sensors Simulation
            </h3>
            <p className="text-xs text-gray-400 dark:text-slate-400 mt-1 leading-relaxed">
              Slide environmental metrics to model real-time agricultural conditions. Watch the advisor adapt immediately.
            </p>
          </div>

          <div className="space-y-5">
            {/* Temperature Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-gray-500 dark:text-slate-400 font-mono uppercase flex items-center gap-1">
                  <Thermometer className="w-4 h-4 text-orange-500" />
                  Temperature (°C)
                </span>
                <span className="font-mono font-bold text-orange-600 dark:text-orange-400">{weather.temperature}°C</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={weather.temperature}
                onChange={(e) => handleSliderChange('temperature', Number(e.target.value))}
                className="w-full h-2 bg-emerald-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Soil Moisture Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-gray-500 dark:text-slate-400 font-mono uppercase flex items-center gap-1">
                  <Droplet className="w-4 h-4 text-blue-500" />
                  Soil Moisture (%)
                </span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{weather.soilMoisture}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="95"
                value={weather.soilMoisture}
                onChange={(e) => handleSliderChange('soilMoisture', Number(e.target.value))}
                className="w-full h-2 bg-emerald-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Rainfall Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-gray-500 dark:text-slate-400 font-mono uppercase flex items-center gap-1">
                  <CloudRain className="w-4 h-4 text-indigo-500" />
                  24hr Rainfall (mm)
                </span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{weather.rainfall} mm</span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                value={weather.rainfall}
                onChange={(e) => handleSliderChange('rainfall', Number(e.target.value))}
                className="w-full h-2 bg-emerald-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Wind Speed Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-gray-500 dark:text-slate-400 font-mono uppercase flex items-center gap-1">
                  <Wind className="w-4 h-4 text-cyan-500" />
                  Wind Speed (km/h)
                </span>
                <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">{weather.windSpeed} km/h</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={weather.windSpeed}
                onChange={(e) => handleSliderChange('windSpeed', Number(e.target.value))}
                className="w-full h-2 bg-emerald-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          </div>

          <div className="p-4 bg-emerald-50/50 dark:bg-slate-800/40 rounded-2xl border border-emerald-500/10 text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
            <span className="font-bold text-emerald-800 dark:text-emerald-400">Rule Logic Matrix:</span>
            <ul className="list-disc pl-4 mt-2 space-y-1.5 font-mono text-[11px]">
              <li>Moisture &lt; 40% & Temp &gt; 35°C triggers immediate 40% hydration surge.</li>
              <li>Precipitation &gt; 20mm forces instant schedule skip commands.</li>
              <li>Rice crops prompt specialized higher moisture safety caps.</li>
            </ul>
          </div>
        </div>

        {/* Right: Advisor Outputs Panel */}
        <div className="col-span-2 space-y-4">
          <div className="flex justify-between items-center bg-white dark:bg-slate-900 px-6 py-4 rounded-2xl border border-emerald-50 dark:border-slate-800">
            <span className="text-xs font-semibold text-gray-500 font-mono uppercase tracking-wider">
              Recommendations by field ({recommendations.length} Active)
            </span>
            {loading && <span className="text-xs font-mono text-emerald-500 animate-pulse">Computing Advisor Matrix...</span>}
          </div>

          {recommendations.length > 0 ? (
            <div className="space-y-4">
              {recommendations.map((rec) => (
                <div 
                  key={rec.id}
                  className="bg-white dark:bg-slate-900 border border-emerald-100/30 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
                >
                  {/* Visual Left Status Border */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                    rec.status === 'Critical' ? 'bg-red-500' :
                    rec.status === 'Warning' ? 'bg-amber-500' :
                    rec.status === 'Skip' ? 'bg-blue-500' : 'bg-emerald-500'
                  }`} />

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pl-2">
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h4 className="font-display font-bold text-lg text-slate-800 dark:text-white leading-tight">
                          {rec.fieldName}
                        </h4>
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 text-[10px] font-bold rounded font-mono uppercase tracking-wider">
                          Crop: {rec.crop}
                        </span>
                        {getStatusBadge(rec.status)}
                      </div>

                      <div className="mt-3 text-sm font-semibold text-emerald-800 dark:text-emerald-400">
                        Proposed Action: {rec.action}
                      </div>

                      <p className="text-xs text-gray-400 dark:text-slate-400 mt-1.5 leading-relaxed">
                        {rec.reason}
                      </p>
                    </div>

                    {/* Action button */}
                    <div className="shrink-0 text-right">
                      {rec.status !== 'Skip' && (
                        <button
                          onClick={() => handleApplyRecommendation(rec)}
                          disabled={applyingId === rec.id}
                          className="px-4 py-2 bg-slate-50 hover:bg-emerald-500 dark:bg-slate-800 dark:hover:bg-emerald-600 border border-gray-200 dark:border-slate-700 hover:border-emerald-500 text-xs font-semibold text-gray-700 dark:text-slate-200 hover:text-white rounded-xl transition-all flex items-center gap-2 ml-auto cursor-pointer disabled:opacity-50"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          {applyingId === rec.id ? 'Running...' : 'Irrigate with Adjustment'}
                        </button>
                      )}
                      
                      <div className="text-[10px] text-gray-400 dark:text-slate-500 mt-2 font-mono uppercase">
                        Water Offset: {rec.waterAdjustment > 0 ? `+${rec.waterAdjustment}` : rec.waterAdjustment} Gal
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-white dark:bg-slate-900 border border-dashed border-gray-200 dark:border-slate-800 rounded-3xl col-span-2">
              <Droplets className="w-12 h-12 text-gray-300 dark:text-slate-700 mx-auto mb-3 animate-bounce" />
              <h4 className="font-semibold text-gray-600 dark:text-slate-400">No Fields Configured</h4>
              <p className="text-sm text-gray-400 dark:text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                Add field sectors in Field Management before generating recommendation matrices.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
