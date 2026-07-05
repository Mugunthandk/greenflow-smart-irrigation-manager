import React, { useState, useMemo, useRef } from 'react';
import * as d3 from 'd3';
import { Calendar, HelpCircle, Activity, ChevronRight, Droplet } from 'lucide-react';
import { WaterUsage, Field, SystemSettings } from '../types';

interface WeeklyHeatmapProps {
  waterUsage: WaterUsage[];
  fields: Field[];
  settings: SystemSettings;
}

interface HeatmapCell {
  date: Date;
  dateStr: string;
  dayOfWeek: number; // 0 = Sun, 1 = Mon, etc.
  weekIndex: number; // 0 to 11
  volume: number;
  duration: number;
}

export default function WeeklyHeatmap({ waterUsage, fields, settings }: WeeklyHeatmapProps) {
  const [hoveredCell, setHoveredCell] = useState<HeatmapCell | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Constants for SVG layout
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const cellSize = 22;
  const gap = 4;
  const paddingLeft = 45;
  const paddingTop = 25;

  // 1. Generate 12 weeks of day-by-day cell data ending in the current week
  const cells = useMemo(() => {
    const list: HeatmapCell[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find the Sunday of the current week
    const currentSunday = new Date(today);
    currentSunday.setDate(today.getDate() - today.getDay());

    // Start 11 weeks before Sunday of the current week (total 12 weeks including this one)
    const startDate = new Date(currentSunday);
    startDate.setDate(startDate.getDate() - 11 * 7);

    // Generate 12 weeks * 7 days = 84 cells
    for (let i = 0; i < 84; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);

      // Extract local YYYY-MM-DD
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      // Filter all irrigation entries recorded for this date
      const daysUsage = waterUsage.filter(u => u.date === dateStr);
      const volume = daysUsage.reduce((sum, curr) => sum + curr.amount, 0);
      const duration = daysUsage.reduce((sum, curr) => sum + curr.duration, 0);

      const weekIndex = Math.floor(i / 7);
      const dayOfWeek = i % 7;

      list.push({
        date: currentDate,
        dateStr,
        dayOfWeek,
        weekIndex,
        volume,
        duration
      });
    }

    return list;
  }, [waterUsage]);

  // 2. Compute max volume in cells for D3 color scaling normalization
  const maxVolume = useMemo(() => {
    return d3.max(cells, (d: HeatmapCell) => d.volume) || 1;
  }, [cells]);

  // 3. Setup dynamic multi-stop D3 color scale (supports dark / light modes natively)
  const colorScale = useMemo(() => {
    const isDark = typeof window !== 'undefined' && window.document.body.classList.contains('dark');

    // Gradient ranges
    const range = isDark
      ? [
          'rgba(30, 41, 59, 0.45)',  // Zero (Slate-800/40)
          'rgba(6, 78, 59, 0.4)',    // Low (Emerald-950/40)
          'rgba(16, 185, 129, 0.5)',  // Med (Emerald-500/50)
          'rgba(52, 211, 153, 0.8)',  // High (Emerald-400/80)
          'rgba(110, 231, 183, 1)'   // Peak (Emerald-300)
        ]
      : [
          '#f1f5f9',                 // Zero (Slate-100)
          '#d1fae5',                 // Low (Emerald-100)
          '#6ee7b7',                 // Med (Emerald-300)
          '#10b981',                 // High (Emerald-500)
          '#047857'                  // Peak (Emerald-700)
        ];

    return d3.scaleLinear<string>()
      .domain([0, maxVolume * 0.1, maxVolume * 0.4, maxVolume * 0.7, maxVolume])
      .range(range)
      .clamp(true);
  }, [maxVolume, cells]);

  // 4. Retrieve week date headers for column labels (formatted "MMM DD")
  const columnHeaders = useMemo(() => {
    const headers: { weekIndex: number; label: string }[] = [];
    
    for (let w = 0; w < 12; w++) {
      // Find the Sunday cell of this week
      const SundayCell = cells.find(c => c.weekIndex === w && c.dayOfWeek === 0);
      if (SundayCell) {
        const formatted = SundayCell.date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        });
        headers.push({ weekIndex: w, label: formatted });
      }
    }
    return headers;
  }, [cells]);

  // Handle cell mouse-overs for absolute tooltip positioning
  const handleMouseMove = (event: React.MouseEvent<SVGRectElement>, cell: HeatmapCell) => {
    if (!containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const x = event.clientX - containerRect.left;
    const y = event.clientY - containerRect.top;

    setTooltipPos({ x, y });
    setHoveredCell(cell);
  };

  // Find related sectors details for the tooltip
  const hoveredCellDetails = useMemo(() => {
    if (!hoveredCell) return null;
    const entries = waterUsage.filter(u => u.date === hoveredCell.dateStr);
    
    const sectorNames = entries.map(e => {
      const field = fields.find(f => f.id === e.fieldId);
      return field ? field.name : 'Unknown Sector';
    });

    const uniqueSectors = Array.from(new Set(sectorNames));

    return {
      sessions: entries.length,
      sectors: uniqueSectors
    };
  }, [hoveredCell, waterUsage, fields]);

  // Width & height of the grid content
  const gridWidth = 12 * (cellSize + gap) - gap;
  const gridHeight = 7 * (cellSize + gap) - gap;
  
  // Total dimensions for SVG viewBox
  const svgWidth = paddingLeft + gridWidth + 15;
  const svgHeight = paddingTop + gridHeight + 20;

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-emerald-50 dark:border-slate-850 shadow-sm flex flex-col justify-between relative" ref={containerRef}>
      
      {/* Card Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5 border-b border-slate-50 dark:border-slate-800/40 pb-4">
        <div>
          <h3 className="font-display font-semibold text-base text-slate-800 dark:text-white flex items-center gap-1.5">
            <Calendar className="w-5 h-5 text-emerald-500" />
            Irrigation Intensity Calendar Heatmap
          </h3>
          <p className="text-xs text-gray-400 dark:text-slate-400 mt-0.5">
            12-week matrix map of historical daily water consumption load. Darker cells signify heavier water cycles.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-[10px] font-mono font-semibold text-gray-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-850/30 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
          <span>Less</span>
          <div className="flex gap-1">
            {[0, 0.25, 0.5, 0.75, 1].map((lvl, idx) => {
              const bgVal = lvl * maxVolume;
              return (
                <div 
                  key={idx} 
                  className="w-3.5 h-3.5 rounded" 
                  style={{ backgroundColor: colorScale(bgVal) }}
                  title={`${Math.round(bgVal).toLocaleString()} Gal`}
                />
              );
            })}
          </div>
          <span>More</span>
        </div>
      </div>

      {/* SVG Canvas Stage */}
      <div className="w-full overflow-x-auto overflow-y-hidden">
        <div className="min-w-[480px] mx-auto py-2">
          <svg 
            viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
            width="100%" 
            height="100%" 
            className="text-slate-400 dark:text-slate-500"
          >
            {/* Week Date Column Headers */}
            {columnHeaders.map((header) => {
              const xPos = paddingLeft + header.weekIndex * (cellSize + gap) + cellSize / 2;
              return (
                <text
                  key={header.weekIndex}
                  x={xPos}
                  y={14}
                  textAnchor="middle"
                  className="font-mono text-[9px] font-bold fill-current opacity-80"
                >
                  {header.label}
                </text>
              );
            })}

            {/* Days of Week Row Labels (Left axis) */}
            {days.map((day, dIdx) => {
              const yPos = paddingTop + dIdx * (cellSize + gap) + cellSize / 1.5;
              return (
                <text
                  key={day}
                  x={12}
                  y={yPos}
                  className="font-mono text-[10px] font-bold fill-current text-left opacity-75"
                >
                  {day}
                </text>
              );
            })}

            {/* Matrix Heatmap Cells */}
            {cells.map((cell) => {
              const xPos = paddingLeft + cell.weekIndex * (cellSize + gap);
              const yPos = paddingTop + cell.dayOfWeek * (cellSize + gap);
              const cellColor = colorScale(cell.volume);

              return (
                <rect
                  key={cell.dateStr}
                  x={xPos}
                  y={yPos}
                  width={cellSize}
                  height={cellSize}
                  rx={5}
                  ry={5}
                  fill={cellColor}
                  className="transition-colors duration-150 cursor-pointer stroke-[1] stroke-white/5 hover:stroke-emerald-400 hover:scale-105 origin-center"
                  onMouseMove={(e) => handleMouseMove(e, cell)}
                  onMouseLeave={() => setHoveredCell(null)}
                />
              );
            })}
          </svg>
        </div>
      </div>

      {/* Analytics Summary Banner */}
      <div className="mt-5 p-4 bg-emerald-500/5 dark:bg-emerald-500/5 border border-emerald-500/10 dark:border-emerald-500/5 rounded-2xl flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Peak Irrigation Day Threshold
            </h4>
            <p className="text-[11px] text-gray-400 mt-0.5 font-mono">
              Peak daily consumption in matrix bounds: {Math.round(maxVolume).toLocaleString()} Gallons
            </p>
          </div>
        </div>
        <div className="text-xs text-gray-400 dark:text-slate-400 font-mono flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-3 py-1.5 rounded-xl">
          <Droplet className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
          Average Cycle Cost: <span className="font-bold text-slate-750 dark:text-slate-200">${(settings.waterCost * 200).toFixed(2)}</span>
        </div>
      </div>

      {/* Floating Interactive Micro-Tooltip Overlay */}
      {hoveredCell && hoveredCellDetails && (
        <div 
          className="absolute z-50 bg-slate-950 dark:bg-slate-900 text-white rounded-2xl p-3.5 shadow-xl border border-slate-800 max-w-xs pointer-events-none animate-fade-in text-left text-xs space-y-1.5"
          style={{ 
            left: `${tooltipPos.x + 18}px`, 
            top: `${tooltipPos.y - 45}px`,
            transform: 'translateY(-50%)'
          }}
        >
          {/* Header */}
          <div className="border-b border-slate-800 pb-1.5">
            <div className="font-bold text-[11px] text-emerald-400 font-mono tracking-wide">
              {hoveredCell.date.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-0.5">
            <div>
              <span className="text-[10px] text-gray-400 font-mono block">WATER VOL</span>
              <span className="font-bold font-mono text-emerald-300">
                {hoveredCell.volume > 0 ? `${hoveredCell.volume.toLocaleString()} Gal` : '0 Gal (Dry)'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-mono block">DURATION</span>
              <span className="font-bold font-mono text-slate-200">
                {hoveredCell.duration > 0 ? `${hoveredCell.duration} Mins` : '0 Mins'}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-[10px] text-gray-400 font-mono block">EST WATER BILL</span>
              <span className="font-bold font-mono text-emerald-400 text-sm">
                ${(hoveredCell.volume * settings.waterCost).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Sectors Details */}
          {hoveredCell.volume > 0 && (
            <div className="border-t border-slate-800 pt-1.5 text-[10px] text-gray-300 leading-relaxed">
              <div className="font-semibold text-[9px] uppercase tracking-wide text-emerald-400 flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Sectors Active ({hoveredCellDetails.sessions})
              </div>
              <div className="truncate text-slate-400 mt-0.5">
                {hoveredCellDetails.sectors.join(', ')}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
