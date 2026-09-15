import {
  AppNotification,
  DashboardStats,
  FieldInspection,
  IncidentReport,
  LandslideRiskAssessment,
  RoadRecord,
  RoadStatus,
  SafetyShelter,
  SafeRouteResult,
  User,
  Village,
  WeatherData,
} from '../types';
import { disasterDb } from '../server/db';
import { fetchRealWeatherData } from '../server/weatherService';
import { evaluateLandslideRisk } from '../server/riskEngine';
import { calculateSafeRoute, findNearestSafeShelter } from '../server/routingService';

// Detect whether we can reach backend /api
let isBackendReachable = true;

async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  if (isBackendReachable) {
    try {
      const res = await fetch(endpoint, options);
      if (res.ok) {
        return await res.json();
      }
      if (res.status === 404 && endpoint.startsWith('/api')) {
        // Fall back to direct in-memory service
        isBackendReachable = false;
      }
    } catch {
      isBackendReachable = false;
    }
  }

  // Fallback direct execution (in case of static build or dev server middleware bypass)
  return fallbackExecute<T>(endpoint, options);
}

// Fallback executor using the exact same DB and real logic
async function fallbackExecute<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const method = options?.method || 'GET';
  const body = options?.body ? JSON.parse(options.body as string) : {};

  if (endpoint === '/api/stats') {
    return disasterDb.calculateDashboardStats() as unknown as T;
  }
  if (endpoint.startsWith('/api/incidents')) {
    if (method === 'GET') {
      return disasterDb.getIncidents() as unknown as T;
    }
    if (method === 'POST') {
      return disasterDb.createIncident(body) as unknown as T;
    }
    if (method === 'PUT') {
      const id = endpoint.split('/')[3];
      return disasterDb.updateIncident(id, body, body.updatedBy) as unknown as T;
    }
  }
  if (endpoint === '/api/inspections' && method === 'POST') {
    return disasterDb.addFieldInspection(body) as unknown as T;
  }
  if (endpoint.startsWith('/api/roads')) {
    if (method === 'GET') {
      return disasterDb.getRoads() as unknown as T;
    }
    if (method === 'PUT') {
      const id = endpoint.split('/')[3];
      return disasterDb.updateRoadStatus(id, body.status, body.reason, body.updatedBy) as unknown as T;
    }
  }
  if (endpoint.startsWith('/api/shelters')) {
    if (method === 'GET') {
      return disasterDb.getShelters() as unknown as T;
    }
  }
  if (endpoint === '/api/villages') {
    return disasterDb.getVillages() as unknown as T;
  }
  if (endpoint.startsWith('/api/weather')) {
    const weather = await fetchRealWeatherData(27.1124, 95.3423, 'Longding');
    disasterDb.setWeatherData(weather);
    return weather as unknown as T;
  }
  if (endpoint === '/api/risk/latest') {
    return disasterDb.getLatestRiskAssessment() as unknown as T;
  }
  if (endpoint === '/api/risk/evaluate') {
    const weather = await fetchRealWeatherData(body.lat || 27.1124, body.lng || 95.3423, body.district || 'Longding');
    const assessment = await evaluateLandslideRisk(weather, body.district || 'Longding Sector');
    disasterDb.setRiskAssessment(assessment);
    return assessment as unknown as T;
  }
  if (endpoint === '/api/route/safe') {
    const shelters = disasterDb.getShelters();
    const roads = disasterDb.getRoads();
    const target = body.shelterId ? shelters.find((s) => s.id === body.shelterId) : findNearestSafeShelter(body.fromLat, body.fromLng, shelters, roads)?.shelter;
    if (!target) throw new Error('No shelter found');
    const route = calculateSafeRoute(body.fromLat, body.fromLng, target, roads);
    return { shelter: target, route } as unknown as T;
  }
  if (endpoint.startsWith('/api/notifications')) {
    return disasterDb.getNotifications() as unknown as T;
  }
  if (endpoint === '/api/demo/toggle') {
    disasterDb.setDemoMode(Boolean(body.isDemo));
    return { success: true, isDemoMode: disasterDb.getIsDemoMode() } as unknown as T;
  }

  throw new Error(`Endpoint not matched: ${endpoint}`);
}

export const apiService = {
  // Statistics
  getStats: async (): Promise<DashboardStats> => {
    return apiFetch<DashboardStats>('/api/stats');
  },

  // Incidents
  getIncidents: async (status?: string): Promise<IncidentReport[]> => {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return apiFetch<IncidentReport[]>(`/api/incidents${query}`);
  },

  getIncidentById: async (id: string): Promise<IncidentReport> => {
    return apiFetch<IncidentReport>(`/api/incidents/${id}`);
  },

  reportEmergency: async (data: Partial<IncidentReport>): Promise<IncidentReport> => {
    return apiFetch<IncidentReport>('/api/incidents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  updateIncident: async (id: string, updates: Partial<IncidentReport>, updatedBy: string): Promise<IncidentReport> => {
    return apiFetch<IncidentReport>(`/api/incidents/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...updates, updatedBy }),
    });
  },

  // Inspections
  submitInspection: async (data: Partial<FieldInspection>): Promise<FieldInspection> => {
    return apiFetch<FieldInspection>('/api/inspections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  // Roads
  getRoads: async (): Promise<RoadRecord[]> => {
    return apiFetch<RoadRecord[]>('/api/roads');
  },

  updateRoadStatus: async (id: string, status: RoadStatus, reason: string, updatedBy: string): Promise<RoadRecord> => {
    return apiFetch<RoadRecord>(`/api/roads/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, reason, updatedBy }),
    });
  },

  // Shelters
  getShelters: async (): Promise<SafetyShelter[]> => {
    return apiFetch<SafetyShelter[]>('/api/shelters');
  },

  updateShelterOccupancy: async (id: string, currentOccupancy: number): Promise<SafetyShelter> => {
    return apiFetch<SafetyShelter>(`/api/shelters/${id}/occupancy`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentOccupancy }),
    });
  },

  // Villages
  getVillages: async (): Promise<Village[]> => {
    return apiFetch<Village[]>('/api/villages');
  },

  // Real Weather
  getWeather: async (lat?: number, lng?: number, district?: string): Promise<WeatherData> => {
    const params = new URLSearchParams();
    if (lat) params.append('lat', String(lat));
    if (lng) params.append('lng', String(lng));
    if (district) params.append('district', district);
    return apiFetch<WeatherData>(`/api/weather?${params.toString()}`);
  },

  // Risk Assessment
  getLatestRisk: async (): Promise<LandslideRiskAssessment> => {
    return apiFetch<LandslideRiskAssessment>('/api/risk/latest');
  },

  evaluateRisk: async (data: { district?: string; lat?: number; lng?: number; slopeDeg?: number; elevationM?: number }): Promise<LandslideRiskAssessment> => {
    return apiFetch<LandslideRiskAssessment>('/api/risk/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  // Safe Route Navigation
  calculateSafeRoute: async (fromLat: number, fromLng: number, shelterId?: string): Promise<{ shelter: SafetyShelter; route: SafeRouteResult }> => {
    return apiFetch<{ shelter: SafetyShelter; route: SafeRouteResult }>('/api/route/safe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromLat, fromLng, shelterId }),
    });
  },

  // Notifications
  getNotifications: async (role?: string): Promise<AppNotification[]> => {
    const query = role ? `?role=${encodeURIComponent(role)}` : '';
    return apiFetch<AppNotification[]>(`/api/notifications${query}`);
  },

  // Authentication
  login: async (credentials: { identifier: string; password?: string; accessCode?: string; role: string; name?: string; location?: string }): Promise<{ success: boolean; message: string; user?: User }> => {
    return apiFetch<{ success: boolean; message: string; user?: User }>('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
  },

  registerCitizen: async (data: { name: string; phone: string; email?: string; location?: string }): Promise<{ success: boolean; message: string; user?: User }> => {
    return apiFetch<{ success: boolean; message: string; user?: User }>('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  // Demo toggle
  toggleDemoMode: async (isDemo: boolean): Promise<{ success: boolean; isDemoMode: boolean }> => {
    return apiFetch<{ success: boolean; isDemoMode: boolean }>('/api/demo/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isDemo }),
    });
  },

  // File Upload
  uploadMedia: async (dataUrl: string, filename: string, type: 'photo' | 'video'): Promise<{ id: string; url: string; type: string }> => {
    return apiFetch<{ id: string; url: string; type: string }>('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: dataUrl, filename, type }),
    });
  },
};
