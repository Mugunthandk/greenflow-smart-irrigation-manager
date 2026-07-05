import fs from 'fs';
import path from 'path';
import { Field, IrrigationSchedule, WaterUsage, SystemSettings } from './src/types';

const DB_FILE = path.join(process.cwd(), 'irrigation_db.json');

interface DatabaseSchema {
  fields: Field[];
  schedules: IrrigationSchedule[];
  water_usage: WaterUsage[];
  settings: SystemSettings;
}

const DEFAULT_SETTINGS: SystemSettings = {
  farmName: "Green Valley Agro Farm",
  waterCost: 0.05, // $0.05 per gallon
  defaultDuration: 30, // 30 minutes
  notificationsEnabled: true
};

function generateSeededData(): DatabaseSchema {
  const fields: Field[] = [
    {
      id: 'f1',
      name: 'North Cornfield',
      crop: 'Corn',
      area: 15,
      location: 'Sector A-1',
      soilType: 'Loamy',
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'f2',
      name: 'East Orchard',
      crop: 'Apples',
      area: 8,
      location: 'Sector B-3',
      soilType: 'Silty',
      createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'f3',
      name: 'Valley Paddy',
      crop: 'Rice',
      area: 20,
      location: 'Sector C-2',
      soilType: 'Clay',
      createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'f4',
      name: 'Hillside Vineyard',
      crop: 'Grapes',
      area: 12,
      location: 'Sector D-1',
      soilType: 'Sandy',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const schedules: IrrigationSchedule[] = [
    {
      id: 's1',
      fieldId: 'f1',
      startTime: '06:00',
      duration: 45,
      waterAmount: 450,
      frequency: 'daily',
      enabled: true,
      createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 's2',
      fieldId: 'f2',
      startTime: '08:00',
      duration: 30,
      waterAmount: 240,
      frequency: 'weekly',
      enabled: true,
      createdAt: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 's3',
      fieldId: 'f3',
      startTime: '17:00',
      duration: 60,
      waterAmount: 800,
      frequency: 'daily',
      enabled: true,
      createdAt: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 's4',
      fieldId: 'f4',
      startTime: '19:30',
      duration: 40,
      waterAmount: 320,
      frequency: 'weekly',
      enabled: false,
      createdAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  // Generate 30 days of historical water usage
  const water_usage: WaterUsage[] = [];
  const baseDate = new Date();
  baseDate.setHours(0, 0, 0, 0);

  let usageCounter = 1;
  for (let i = 29; i >= 0; i--) {
    const targetDate = new Date(baseDate.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = targetDate.toISOString().split('T')[0];

    // Cornfield irrigated daily
    const cornWater = 450 + Math.floor(Math.random() * 80 - 40); // small random variation
    water_usage.push({
      id: `u${usageCounter++}`,
      date: dateStr,
      fieldId: 'f1',
      amount: cornWater,
      duration: 45
    });

    // Paddy irrigated daily (heavy water)
    const paddyWater = 800 + Math.floor(Math.random() * 150 - 75);
    water_usage.push({
      id: `u${usageCounter++}`,
      date: dateStr,
      fieldId: 'f3',
      amount: paddyWater,
      duration: 60
    });

    // Orchard irrigated every 3 days
    if (i % 3 === 0) {
      const orchardWater = 240 + Math.floor(Math.random() * 40 - 20);
      water_usage.push({
        id: `u${usageCounter++}`,
        date: dateStr,
        fieldId: 'f2',
        amount: orchardWater,
        duration: 30
      });
    }

    // Vineyard irrigated every 4 days
    if (i % 4 === 0) {
      const vineyardWater = 320 + Math.floor(Math.random() * 50 - 25);
      water_usage.push({
        id: `u${usageCounter++}`,
        date: dateStr,
        fieldId: 'f4',
        amount: vineyardWater,
        duration: 40
      });
    }
  }

  return {
    fields,
    schedules,
    water_usage,
    settings: DEFAULT_SETTINGS
  };
}

export class Database {
  private static data: DatabaseSchema | null = null;

  private static load() {
    if (this.data) return;

    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(fileContent);
      } else {
        // Initialize with default seeded data
        this.data = generateSeededData();
        this.save();
      }
    } catch (error) {
      console.error('Error loading database, resetting to default seed data:', error);
      this.data = generateSeededData();
      this.save();
    }
  }

  private static save() {
    if (!this.data) return;
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (error) {
      console.error('Failed to write database file:', error);
    }
  }

  // --- FIELDS ---
  public static getFields(): Field[] {
    this.load();
    return this.data!.fields;
  }

  public static addField(field: Omit<Field, 'id' | 'createdAt'>): Field {
    this.load();
    const newField: Field = {
      ...field,
      id: 'f_' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    this.data!.fields.push(newField);
    this.save();
    return newField;
  }

  public static updateField(id: string, updatedFields: Partial<Omit<Field, 'id' | 'createdAt'>>): Field | null {
    this.load();
    const index = this.data!.fields.findIndex(f => f.id === id);
    if (index === -1) return null;

    this.data!.fields[index] = {
      ...this.data!.fields[index],
      ...updatedFields
    };
    this.save();
    return this.data!.fields[index];
  }

  public static deleteField(id: string): boolean {
    this.load();
    const initialLength = this.data!.fields.length;
    this.data!.fields = this.data!.fields.filter(f => f.id !== id);

    // Also cascade delete schedules and water usages associated with this field
    this.data!.schedules = this.data!.schedules.filter(s => s.fieldId !== id);
    this.data!.water_usage = this.data!.water_usage.filter(u => u.fieldId !== id);

    this.save();
    return this.data!.fields.length < initialLength;
  }

  // --- SCHEDULES ---
  public static getSchedules(): IrrigationSchedule[] {
    this.load();
    return this.data!.schedules;
  }

  public static addSchedule(schedule: Omit<IrrigationSchedule, 'id' | 'createdAt'>): IrrigationSchedule {
    this.load();
    const newSchedule: IrrigationSchedule = {
      ...schedule,
      id: 's_' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    this.data!.schedules.push(newSchedule);
    this.save();
    return newSchedule;
  }

  public static updateSchedule(id: string, updatedSchedule: Partial<Omit<IrrigationSchedule, 'id' | 'createdAt'>>): IrrigationSchedule | null {
    this.load();
    const index = this.data!.schedules.findIndex(s => s.id === id);
    if (index === -1) return null;

    this.data!.schedules[index] = {
      ...this.data!.schedules[index],
      ...updatedSchedule
    };
    this.save();
    return this.data!.schedules[index];
  }

  public static deleteSchedule(id: string): boolean {
    this.load();
    const initialLength = this.data!.schedules.length;
    this.data!.schedules = this.data!.schedules.filter(s => s.id !== id);
    this.save();
    return this.data!.schedules.length < initialLength;
  }

  // --- WATER USAGE ---
  public static getWaterUsage(): WaterUsage[] {
    this.load();
    return this.data!.water_usage;
  }

  public static addWaterUsage(usage: Omit<WaterUsage, 'id'>): WaterUsage {
    this.load();
    const newUsage: WaterUsage = {
      ...usage,
      id: 'u_' + Math.random().toString(36).substr(2, 9)
    };
    this.data!.water_usage.push(newUsage);
    this.save();
    return newUsage;
  }

  // --- SETTINGS ---
  public static getSettings(): SystemSettings {
    this.load();
    return this.data!.settings;
  }

  public static updateSettings(settings: Partial<SystemSettings>): SystemSettings {
    this.load();
    this.data!.settings = {
      ...this.data!.settings,
      ...settings
    };
    this.save();
    return this.data!.settings;
  }
}
