export interface Field {
  id: string;
  name: string;
  crop: string;
  area: number; // in acres
  location: string; // zone description
  soilType: 'Sandy' | 'Clay' | 'Loamy' | 'Silty' | 'Peaty';
  createdAt: string;
}

export interface IrrigationSchedule {
  id: string;
  fieldId: string;
  startTime: string; // HH:MM
  duration: number; // minutes
  waterAmount: number; // gallons
  frequency: 'daily' | 'weekly' | 'monthly';
  enabled: boolean;
  createdAt: string;
}

export interface WaterUsage {
  id: string;
  date: string; // YYYY-MM-DD
  fieldId: string;
  amount: number; // gallons
  duration: number; // minutes
}

export interface SystemSettings {
  farmName: string;
  waterCost: number; // cost per gallon in USD
  defaultDuration: number; // minutes
  notificationsEnabled: boolean;
}

export interface WeatherCondition {
  temperature: number; // °C
  soilMoisture: number; // %
  rainfall: number; // mm
  humidity: number; // %
  windSpeed: number; // km/h
}

export interface Recommendation {
  id: string;
  fieldId: string;
  fieldName: string;
  crop: string;
  soilMoisture: number;
  temperature: number;
  rainfall: number;
  status: 'Critical' | 'Warning' | 'Optimal' | 'Skip';
  action: string;
  waterAdjustment: number; // difference in gallons
  reason: string;
}
