import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { Database } from './database';
import { WeatherCondition, Recommendation } from './src/types';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API ROUTES ---

  // 1. FIELDS API
  app.get('/api/fields', (req: Request, res: Response) => {
    try {
      const fields = Database.getFields();
      res.json(fields);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve fields' });
    }
  });

  app.post('/api/fields', (req: Request, res: Response) => {
    try {
      const { name, crop, area, location, soilType } = req.body;
      if (!name || !crop || isNaN(Number(area)) || !location || !soilType) {
        res.status(400).json({ error: 'Missing or invalid field properties' });
        return;
      }
      const newField = Database.addField({
        name,
        crop,
        area: Number(area),
        location,
        soilType
      });
      res.status(201).json(newField);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create field' });
    }
  });

  app.put('/api/fields/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, crop, area, location, soilType } = req.body;
      const updated = Database.updateField(id, {
        ...(name && { name }),
        ...(crop && { crop }),
        ...(area !== undefined && { area: Number(area) }),
        ...(location && { location }),
        ...(soilType && { soilType })
      });
      if (!updated) {
        res.status(404).json({ error: 'Field not found' });
        return;
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update field' });
    }
  });

  app.delete('/api/fields/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deleted = Database.deleteField(id);
      if (!deleted) {
        res.status(404).json({ error: 'Field not found' });
        return;
      }
      res.json({ message: 'Field deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete field' });
    }
  });

  // 2. SCHEDULES API
  app.get('/api/schedules', (req: Request, res: Response) => {
    try {
      const schedules = Database.getSchedules();
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve schedules' });
    }
  });

  app.post('/api/schedules', (req: Request, res: Response) => {
    try {
      const { fieldId, startTime, duration, waterAmount, frequency, enabled } = req.body;
      if (!fieldId || !startTime || isNaN(Number(duration)) || isNaN(Number(waterAmount)) || !frequency) {
        res.status(400).json({ error: 'Missing or invalid schedule properties' });
        return;
      }
      const newSchedule = Database.addSchedule({
        fieldId,
        startTime,
        duration: Number(duration),
        waterAmount: Number(waterAmount),
        frequency,
        enabled: enabled !== undefined ? enabled : true
      });
      res.status(201).json(newSchedule);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create schedule' });
    }
  });

  app.put('/api/schedules/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { fieldId, startTime, duration, waterAmount, frequency, enabled } = req.body;
      const updated = Database.updateSchedule(id, {
        ...(fieldId && { fieldId }),
        ...(startTime && { startTime }),
        ...(duration !== undefined && { duration: Number(duration) }),
        ...(waterAmount !== undefined && { waterAmount: Number(waterAmount) }),
        ...(frequency && { frequency }),
        ...(enabled !== undefined && { enabled })
      });
      if (!updated) {
        res.status(404).json({ error: 'Schedule not found' });
        return;
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update schedule' });
    }
  });

  app.delete('/api/schedules/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deleted = Database.deleteSchedule(id);
      if (!deleted) {
        res.status(404).json({ error: 'Schedule not found' });
        return;
      }
      res.json({ message: 'Schedule deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete schedule' });
    }
  });

  // 3. WATER USAGE API
  app.get('/api/water-usage', (req: Request, res: Response) => {
    try {
      const usage = Database.getWaterUsage();
      res.json(usage);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve water usage history' });
    }
  });

  app.post('/api/water-usage', (req: Request, res: Response) => {
    try {
      const { fieldId, amount, duration, date } = req.body;
      if (!fieldId || isNaN(Number(amount)) || isNaN(Number(duration))) {
        res.status(400).json({ error: 'Missing or invalid water usage properties' });
        return;
      }
      const newUsage = Database.addWaterUsage({
        fieldId,
        amount: Number(amount),
        duration: Number(duration),
        date: date || new Date().toISOString().split('T')[0]
      });
      res.status(201).json(newUsage);
    } catch (error) {
      res.status(500).json({ error: 'Failed to record water usage' });
    }
  });

  // 4. SETTINGS API
  app.get('/api/settings', (req: Request, res: Response) => {
    try {
      const settings = Database.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve settings' });
    }
  });

  app.put('/api/settings', (req: Request, res: Response) => {
    try {
      const updated = Database.updateSettings(req.body);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update settings' });
    }
  });

  // 5. LOCAL INTELLIGENT RECOMMENDATION ENGINE
  app.post('/api/recommendations', (req: Request, res: Response) => {
    try {
      const weather: WeatherCondition = req.body;
      const fields = Database.getFields();
      const recommendations: Recommendation[] = [];

      for (const field of fields) {
        let status: 'Critical' | 'Warning' | 'Optimal' | 'Skip' = 'Optimal';
        let action = 'Maintain standard schedule';
        let waterAdjustment = 0;
        let reason = 'Weather and soil parameters are currently within normal thresholds.';

        const soilMoisture = weather.soilMoisture;
        const temp = weather.temperature;
        const rainfall = weather.rainfall;
        const crop = field.crop.toLowerCase();

        // 1. Heavy rainfall constraint
        if (rainfall > 20) {
          status = 'Skip';
          action = 'Skip next irrigation session';
          waterAdjustment = -300; // negative indicates conservation
          reason = `Heavy precipitation of ${rainfall}mm detected. Natural rainfall meets water needs, skip irrigation to save cost and avoid flooding.`;
        }
        // 2. High temperature & Low soil moisture crisis
        else if (temp > 35 && soilMoisture < 40) {
          status = 'Critical';
          action = 'Increase irrigation duration and water output';
          waterAdjustment = 200; // increase water
          reason = `Critical risk: Extreme temperature (${temp}°C) and arid soil moisture (${soilMoisture}%). Immediate 40%+ watering hike required to prevent crop stress.`;
        }
        // 3. Crop-specific rules (e.g. Rice paddy)
        else if (crop === 'rice' && soilMoisture < 60) {
          status = 'Warning';
          action = 'Increase water depth / higher irrigation volume';
          waterAdjustment = 150;
          reason = `Crop Warning: Rice thrives in semi-flooded soils. Current moisture (${soilMoisture}%) is insufficient for standard paddy conditions.`;
        }
        // 4. Sandy soil drainage warning
        else if (field.soilType === 'Sandy' && soilMoisture < 45) {
          status = 'Warning';
          action = 'Apply short, frequent irrigation cycles';
          waterAdjustment = 100;
          reason = 'Sandy soil exhibits low water retention capacity and drains rapidly. Apply frequent, small water applications.';
        }
        // 5. High soil moisture saturation
        else if (soilMoisture > 75) {
          status = 'Skip';
          action = 'Suspend scheduled watering';
          waterAdjustment = -200;
          reason = `Water Logging Warning: Soil moisture is at an excessive ${soilMoisture}%. Suspend watering to allow soil aeration and prevent root disease.`;
        }
        // 6. Mild stress warming
        else if (temp > 30 && soilMoisture < 50) {
          status = 'Warning';
          action = 'Slightly increase water volume';
          waterAdjustment = 80;
          reason = `Moderate warm weather (${temp}°C) paired with low-range moisture (${soilMoisture}%). Boost water slightly to preserve moisture equilibrium.`;
        }

        recommendations.push({
          id: 'rec_' + Math.random().toString(36).substr(2, 9),
          fieldId: field.id,
          fieldName: field.name,
          crop: field.crop,
          soilMoisture,
          temperature: temp,
          rainfall,
          status,
          action,
          waterAdjustment,
          reason
        });
      }

      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate recommendations' });
    }
  });

  // --- PRODUCTION VS DEVELOPMENT CONFIGURATION ---

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Smart Irrigation full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
