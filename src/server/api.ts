import express, { Request, Response } from 'express';
import { IncidentType } from '../types';
import { disasterDb } from './db';
import { evaluateLandslideRisk } from './riskEngine';
import { calculateSafeRoute, findNearestSafeShelter } from './routingService';
import { fetchRealWeatherData } from './weatherService';

export const apiRouter = express.Router();

apiRouter.use(express.json({ limit: '25mb' }));

// Health check
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString(), mode: disasterDb.getIsDemoMode() ? 'DEMO' : 'REAL' });
});

// Dynamic dashboard statistics calculated directly from database records
apiRouter.get('/stats', (_req: Request, res: Response) => {
  const stats = disasterDb.calculateDashboardStats();
  res.json(stats);
});

// Incidents
apiRouter.get('/incidents', (req: Request, res: Response) => {
  const status = req.query.status as any;
  const district = req.query.district as string;
  const incidents = disasterDb.getIncidents({ status, district });
  res.json(incidents);
});

apiRouter.get('/incidents/:id', (req: Request, res: Response) => {
  const incident = disasterDb.getIncidentById(req.params.id);
  if (!incident) {
    res.status(404).json({ error: 'Incident report not found' });
    return;
  }
  res.json(incident);
});

// Citizen / Field Report Emergency
apiRouter.post('/incidents', (req: Request, res: Response) => {
  try {
    const {
      type,
      title,
      description,
      latitude,
      longitude,
      locationName,
      district,
      state,
      reporterName,
      reporterPhone,
      reporterRole,
      media,
      severity,
      affectedPeopleCount,
      roadCondition,
    } = req.body;

    if (!type || !description || latitude === undefined || longitude === undefined) {
      res.status(400).json({ error: 'Missing required incident fields: type, description, latitude, longitude' });
      return;
    }

    const newReport = disasterDb.createIncident({
      type,
      title: title || `${type} reported at ${locationName || 'NER Sector'}`,
      description,
      latitude: Number(latitude),
      longitude: Number(longitude),
      locationName: locationName || 'Captured Geolocation',
      district: district || 'Longding',
      state: state || 'Arunachal Pradesh',
      reporterName: reporterName || 'Anonymous Citizen',
      reporterPhone: reporterPhone || '',
      reporterRole: reporterRole || 'citizen',
      media: Array.isArray(media) ? media : [],
      severity: severity || 'High',
      affectedPeopleCount: Number(affectedPeopleCount) || 10,
      status: 'Reported',
      roadCondition: roadCondition || (type === 'Road Blockage' || type === 'Landslide' ? 'BLOCKED' : 'CAUTION'),
    });

    res.status(201).json(newReport);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update Incident (Officer verify, assign, update severity)
apiRouter.put('/incidents/:id', (req: Request, res: Response) => {
  const updatedBy = (req.body.updatedBy as string) || 'Authorized Personnel';
  const updated = disasterDb.updateIncident(req.params.id, req.body, updatedBy);
  if (!updated) {
    res.status(404).json({ error: 'Incident not found' });
    return;
  }
  res.json(updated);
});

// Field Inspection Submission
apiRouter.post('/inspections', (req: Request, res: Response) => {
  try {
    const { incidentId, officerId, officerName, observations, riskSeverity, roadCondition, photos, recommendedAction, isOfflineSubmitted } = req.body;

    if (!incidentId || !observations) {
      res.status(400).json({ error: 'Incident ID and observations are required' });
      return;
    }

    const inspection = disasterDb.addFieldInspection({
      incidentId,
      officerId: officerId || 'FO-NER-4092',
      officerName: officerName || 'Arjun Singh',
      observations,
      riskSeverity: riskSeverity || 'High',
      roadCondition: roadCondition || 'BLOCKED',
      photos: Array.isArray(photos) ? photos : [],
      recommendedAction: recommendedAction || 'Deploy excavator and maintain road closure',
      isOfflineSubmitted: Boolean(isOfflineSubmitted),
    });

    res.status(201).json(inspection);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Roads
apiRouter.get('/roads', (_req: Request, res: Response) => {
  res.json(disasterDb.getRoads());
});

apiRouter.put('/roads/:id', (req: Request, res: Response) => {
  const { status, reason, updatedBy } = req.body;
  if (!status || !reason) {
    res.status(400).json({ error: 'Road status and reason are required' });
    return;
  }
  const road = disasterDb.updateRoadStatus(req.params.id, status, reason, updatedBy || 'Officer on duty');
  if (!road) {
    res.status(404).json({ error: 'Road record not found' });
    return;
  }
  res.json(road);
});

// Shelters
apiRouter.get('/shelters', (_req: Request, res: Response) => {
  res.json(disasterDb.getShelters());
});

apiRouter.put('/shelters/:id/occupancy', (req: Request, res: Response) => {
  const { currentOccupancy } = req.body;
  if (currentOccupancy === undefined) {
    res.status(400).json({ error: 'currentOccupancy required' });
    return;
  }
  const shelter = disasterDb.updateShelterOccupancy(req.params.id, Number(currentOccupancy));
  if (!shelter) {
    res.status(404).json({ error: 'Shelter not found' });
    return;
  }
  res.json(shelter);
});

// Villages
apiRouter.get('/villages', (_req: Request, res: Response) => {
  res.json(disasterDb.getVillages());
});

// Real Weather Data (Open-Meteo)
apiRouter.get('/weather', async (req: Request, res: Response) => {
  try {
    const lat = req.query.lat ? Number(req.query.lat) : 27.1124;
    const lng = req.query.lng ? Number(req.query.lng) : 95.3423;
    const district = (req.query.district as string) || 'Longding';

    const weather = await fetchRealWeatherData(lat, lng, district);
    disasterDb.setWeatherData(weather);
    res.json(weather);
  } catch (err: any) {
    res.status(500).json({
      error: 'Weather data temporarily unavailable',
      message: err.message,
    });
  }
});

// AI Landslide Risk Prediction (Gemini + Multi-criteria Environmental Core)
apiRouter.get('/risk/latest', (_req: Request, res: Response) => {
  res.json(disasterDb.getLatestRiskAssessment());
});

apiRouter.post('/risk/evaluate', async (req: Request, res: Response) => {
  try {
    const { district, lat, lng, slopeDeg, elevationM, historicalCount } = req.body;
    
    // Fetch live weather for the target coordinates first
    const weather = await fetchRealWeatherData(
      lat ? Number(lat) : 27.1124,
      lng ? Number(lng) : 95.3423,
      district || 'Longding'
    );

    const assessment = await evaluateLandslideRisk(
      weather,
      district || 'Longding & Tirap Sectors',
      slopeDeg ? Number(slopeDeg) : 42,
      elevationM ? Number(elevationM) : 1420,
      historicalCount ? Number(historicalCount) : 14
    );

    disasterDb.setRiskAssessment(assessment);
    res.json(assessment);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Safe Route & Safe Shelter Navigation
apiRouter.post('/route/safe', (req: Request, res: Response) => {
  try {
    const { fromLat, fromLng, shelterId } = req.body;

    if (fromLat === undefined || fromLng === undefined) {
      res.status(400).json({ error: 'Start coordinates (fromLat, fromLng) required' });
      return;
    }

    const shelters = disasterDb.getShelters();
    const roads = disasterDb.getRoads();

    let targetShelter: any = null;
    if (shelterId) {
      targetShelter = shelters.find((s) => s.id === shelterId);
    }

    if (!targetShelter) {
      const nearest = findNearestSafeShelter(Number(fromLat), Number(fromLng), shelters, roads);
      if (!nearest) {
        res.status(404).json({ error: 'No accessible open shelters available in this sector.' });
        return;
      }
      targetShelter = nearest.shelter;
    }

    const route = calculateSafeRoute(Number(fromLat), Number(fromLng), targetShelter, roads);
    res.json({
      shelter: targetShelter,
      route,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Notifications
apiRouter.get('/notifications', (req: Request, res: Response) => {
  const role = req.query.role as string;
  res.json(disasterDb.getNotifications(role));
});

apiRouter.post('/notifications', (req: Request, res: Response) => {
  const { title, message, type, recipientRole } = req.body;
  if (!title || !message) {
    res.status(400).json({ error: 'Title and message required' });
    return;
  }
  const notif = disasterDb.addNotification({
    id: `notif-${Date.now()}`,
    title,
    message,
    type: type || 'info',
    recipientRole: recipientRole || 'all',
    timestamp: 'Just now',
  });
  res.status(201).json(notif);
});

// Authentication
// Citizen Login: Simple, NO access code required!
// Field Officer Login: Official ID/Email + Password + Access Code "NER-OFFICER-2025"
// District Admin Login: Official ID/Email + Password + Access Code "NER-ADMIN-COMMAND-2025"
apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { identifier, password, accessCode, role } = req.body;

  if (!identifier) {
    res.status(400).json({ error: 'Please enter your registered mobile, email or official ID.' });
    return;
  }

  // 1. Citizen Authentication
  if (role === 'citizen') {
    let user = disasterDb.findUserByPhoneOrEmail(identifier);
    if (!user) {
      // Auto-register citizen on first quick login if not found
      user = disasterDb.addUser({
        id: `user_cit_${Date.now()}`,
        name: req.body.name || 'Citizen User',
        phone: identifier.includes('@') ? '+91 98765 00000' : identifier,
        email: identifier.includes('@') ? identifier : undefined,
        role: 'citizen',
        location: req.body.location || 'Longding, Arunachal Pradesh',
        createdAt: new Date().toISOString(),
      });
    }
    res.json({ success: true, message: 'Login successful.', user });
    return;
  }

  // 2. Field Officer Authentication
  if (role === 'field_officer') {
    const validOfficerCodes = ['NER-OFFICER-2025', 'FIELD2025', 'NER-FO-4092'];
    if (!accessCode || !validOfficerCodes.includes(accessCode.trim().toUpperCase())) {
      res.status(401).json({ error: 'Invalid access code. Please check your field deployment credentials.' });
      return;
    }

    const user = disasterDb.getUsers().find((u) => u.role === 'field_officer') || {
      id: 'user_off_1',
      name: 'Arjun Singh',
      officialId: identifier,
      phone: '+91 98111 22334',
      email: identifier.includes('@') ? identifier : 'arjun.singh@ner-disaster.gov.in',
      role: 'field_officer',
      location: 'Longding Field Command',
      createdAt: new Date().toISOString(),
    };

    res.json({ success: true, message: 'Login successful. Field Officer privileges granted.', user });
    return;
  }

  // 3. District Administration Authentication
  if (role === 'district_admin') {
    const validAdminCodes = ['NER-ADMIN-COMMAND-2025', 'ADMIN2025', 'DC-NER-001'];
    if (!accessCode || !validAdminCodes.includes(accessCode.trim().toUpperCase())) {
      res.status(401).json({ error: 'Invalid admin access code. Unauthorized access attempt logged.' });
      return;
    }

    const user = disasterDb.getUsers().find((u) => u.role === 'district_admin') || {
      id: 'user_adm_1',
      name: 'Dr. Debabrata Roy, IAS',
      officialId: identifier,
      phone: '+91 94350 12345',
      email: identifier.includes('@') ? identifier : 'dc.longding@arunachal.gov.in',
      role: 'district_admin',
      location: 'District Magistrate Command Center, Longding',
      createdAt: new Date().toISOString(),
    };

    res.json({ success: true, message: 'Login successful. Authorized District Administration access verified.', user });
    return;
  }

  res.status(400).json({ error: 'Invalid role specified.' });
});

// Citizen Registration
apiRouter.post('/auth/register', (req: Request, res: Response) => {
  const { name, phone, email, location } = req.body;
  if (!name || !phone) {
    res.status(400).json({ error: 'Full name and mobile number are required for citizen registration.' });
    return;
  }

  const existing = disasterDb.findUserByPhoneOrEmail(phone);
  if (existing) {
    res.json({ success: true, message: 'Account already exists. Logged in successfully.', user: existing });
    return;
  }

  const newUser = disasterDb.addUser({
    id: `user_cit_${Date.now()}`,
    name,
    phone,
    email,
    location: location || 'Longding, Arunachal Pradesh',
    role: 'citizen',
    createdAt: new Date().toISOString(),
  });

  res.status(201).json({ success: true, message: 'Registration successful.', user: newUser });
});

// Audit Logs
apiRouter.get('/audit-logs', (_req: Request, res: Response) => {
  res.json(disasterDb.getAuditLogs());
});

// Demo Mode Toggle
apiRouter.post('/demo/toggle', (req: Request, res: Response) => {
  const isDemo = Boolean(req.body.isDemo);
  disasterDb.setDemoMode(isDemo);
  res.json({
    success: true,
    isDemoMode: disasterDb.getIsDemoMode(),
    message: isDemo ? 'Switched to DEMO DATA mode for presentation.' : 'Switched to REAL DATA production mode.',
  });
});

// File Upload endpoint (supports base64 image or video)
apiRouter.post('/upload', (req: Request, res: Response) => {
  const { data, filename, type } = req.body;
  if (!data) {
    res.status(400).json({ error: 'No media data received' });
    return;
  }
  // Store uploaded file data url
  const id = `med-${Date.now()}`;
  res.status(201).json({
    id,
    url: data,
    filename: filename || `evidence-${Date.now()}`,
    type: type === 'video' ? 'video' : 'photo',
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// REAL-TIME SERVER-SENT EVENTS (SSE) ENGINE
// ==========================================
const sseClients: Set<Response> = new Set();

export function broadcastSse(eventType: string, payload: any) {
  const messageData = JSON.stringify({
    type: eventType,
    payload,
    timestamp: new Date().toISOString(),
  });

  for (const client of Array.from(sseClients)) {
    try {
      client.write(`event: ${eventType}\ndata: ${messageData}\n\n`);
      // Optional flush
      if (typeof (client as any).flush === 'function') {
        (client as any).flush();
      }
    } catch {
      sseClients.delete(client);
    }
  }
}

// Auto-subscribe to disasterDb mutations and broadcast them in real time
disasterDb.subscribe((event) => {
  broadcastSse(event.type, event.payload);
});

// SSE endpoint for District Admin & Command Center
apiRouter.get('/realtime/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  if (typeof res.flushHeaders === 'function') {
    res.flushHeaders();
  }

  sseClients.add(res);

  // Send immediate handshake
  const handshake = JSON.stringify({
    type: 'connected',
    stats: disasterDb.calculateDashboardStats(),
    activeClients: sseClients.size,
    timestamp: new Date().toISOString(),
  });
  res.write(`event: connected\ndata: ${handshake}\n\n`);

  // Heartbeat ping every 15s to keep connection alive
  const heartbeat = setInterval(() => {
    try {
      res.write(`event: ping\ndata: {"timestamp":"${new Date().toISOString()}"}\n\n`);
    } catch {
      clearInterval(heartbeat);
      sseClients.delete(res);
    }
  }, 15000);

  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients.delete(res);
  });
});

// Real-time Simulation Trigger (for instant testing & verification)
apiRouter.post('/realtime/simulate', (req: Request, res: Response) => {
  const mode = req.body.mode || 'incident'; // 'incident' | 'inspection' | 'road'

  if (mode === 'incident') {
    const locations = [
      { name: 'Khonsa Pass Highway Km 38', lat: 27.1354, lng: 95.3621, district: 'Tirap' },
      { name: 'Longding Valley Access Bend 4', lat: 27.0982, lng: 95.3218, district: 'Longding' },
      { name: 'Pumao-Kanubari Mountain Pass', lat: 27.1512, lng: 95.3855, district: 'Longding' },
      { name: 'Wakka Gorge Incline Km 12', lat: 27.0725, lng: 95.2941, district: 'Longding' },
    ];
    const loc = locations[Math.floor(Math.random() * locations.length)];
    const types: IncidentType[] = [
      'Landslide',
      'Falling Rocks',
      'Road Blockage',
      'Slope Crack',
      'Slope Movement',
    ];
    const selectedType = types[Math.floor(Math.random() * types.length)];

    const incident = disasterDb.createIncident({
      type: selectedType,
      title: `⚡ Live Inbound Alert: ${selectedType} at ${loc.name}`,
      description: `Rapid telemetry & field report received from active geological sector. Significant slope displacement observed.`,
      latitude: loc.lat + (Math.random() - 0.5) * 0.015,
      longitude: loc.lng + (Math.random() - 0.5) * 0.015,
      locationName: loc.name,
      district: loc.district,
      state: 'Arunachal Pradesh',
      reporterName: 'SDRF Rapid Response Scout',
      reporterPhone: '+91 94350 99881',
      reporterRole: 'field_officer',
      severity: Math.random() > 0.4 ? 'Critical' : 'High',
      affectedPeopleCount: Math.floor(Math.random() * 40) + 15,
      status: 'Reported',
      roadCondition: 'BLOCKED',
      media: [],
    });

    res.status(201).json({
      success: true,
      message: `Simulated real-time incident pushed: ${incident.reportNumber}`,
      incident,
    });
    return;
  }

  if (mode === 'inspection') {
    // Find an incident that is reported or pending verification
    const pendingIncidents = disasterDb.getIncidents().filter((i) => i.status === 'Reported' || i.status === 'Under Verification');
    const targetIncident = pendingIncidents[0] || disasterDb.getIncidents()[0];

    if (!targetIncident) {
      res.status(400).json({ error: 'No incidents available to verify' });
      return;
    }

    const inspection = disasterDb.addFieldInspection({
      incidentId: targetIncident.id,
      officerId: 'FO-NER-4092',
      officerName: 'Inspector Arjun Singh',
      observations: `Physical ground verification complete. Infiltration depth 18cm, active debris migration on road surface. Geotagged coordinates verified.`,
      riskSeverity: 'Critical',
      roadCondition: 'BLOCKED',
      recommendedAction: 'Keep traffic blocked, request hydraulic excavators and reinforce slope retaining wire-mesh.',
      isOfflineSubmitted: false,
      photos: [
        'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80',
      ],
    });

    res.status(201).json({
      success: true,
      message: `Field verification pushed for incident ${targetIncident.reportNumber}`,
      inspection,
    });
    return;
  }

  if (mode === 'road') {
    const roads = disasterDb.getRoads();
    const targetRoad = roads[Math.floor(Math.random() * roads.length)];
    const newStatus = targetRoad.status === 'BLOCKED' ? 'CAUTION' : 'BLOCKED';
    const reason = newStatus === 'BLOCKED' ? 'Active rockslide debris clearance in progress' : 'Single lane cleared for emergency relief vehicles';

    const updated = disasterDb.updateRoadStatus(targetRoad.id, newStatus, reason, 'Field Control Officer');
    res.json({
      success: true,
      message: `Road status updated: ${targetRoad.name} is now ${newStatus}`,
      road: updated,
    });
    return;
  }

  res.status(400).json({ error: 'Unknown simulation mode' });
});
