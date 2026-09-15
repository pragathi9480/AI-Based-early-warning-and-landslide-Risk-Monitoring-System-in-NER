import { useEffect, useState, useRef, useCallback } from 'react';
import { DashboardStats, FieldInspection, IncidentReport, RoadRecord } from '../types';
import { disasterDb } from '../server/db';
import { apiService } from './apiService';

export interface RealtimeEvent {
  type: string;
  payload: any;
  timestamp: string;
}

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected';

export interface UseRealtimeStreamOptions {
  onIncidentCreated?: (incident: IncidentReport, stats: DashboardStats, message?: string) => void;
  onIncidentUpdated?: (incident: IncidentReport, stats: DashboardStats, message?: string) => void;
  onInspectionCreated?: (inspection: FieldInspection, incident: IncidentReport | null, stats: DashboardStats, message?: string) => void;
  onRoadUpdated?: (road: RoadRecord, stats: DashboardStats, message?: string) => void;
  onStatsUpdated?: (stats: DashboardStats) => void;
  onEvent?: (event: RealtimeEvent) => void;
}

// Client-side event emitter bus for immediate local sync & fallback
type Listener = (event: RealtimeEvent) => void;
const localListeners: Set<Listener> = new Set();

export function emitLocalRealtimeEvent(type: string, payload: any) {
  const event: RealtimeEvent = {
    type,
    payload,
    timestamp: new Date().toISOString(),
  };
  for (const listener of localListeners) {
    try {
      listener(event);
    } catch (e) {
      console.error('Error in local listener:', e);
    }
  }
}

// Hook disasterDb directly for instant same-runtime reactive event propagation
if (typeof window !== 'undefined') {
  disasterDb.subscribe((event) => {
    emitLocalRealtimeEvent(event.type, event.payload);
  });
}

export function useRealtimeStream(options: UseRealtimeStreamOptions = {}) {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null);
  const [eventCount, setEventCount] = useState<number>(0);
  const [recentBroadcastBanner, setRecentBroadcastBanner] = useState<{
    id: string;
    title: string;
    message: string;
    type: 'incident' | 'inspection' | 'road';
    timestamp: string;
  } | null>(null);

  // Store options in ref to avoid recreating event handlers
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const processIncomingEvent = useCallback((event: RealtimeEvent) => {
    setLastEvent(event);
    setEventCount((prev) => prev + 1);
    optionsRef.current.onEvent?.(event);

    const { type, payload } = event;

    if (type === 'incident:created') {
      const incident: IncidentReport = payload.incident;
      const stats: DashboardStats = payload.stats;
      const message: string = payload.message || `New incident reported: ${incident.title}`;

      setRecentBroadcastBanner({
        id: incident.id,
        title: `🚨 Live Inbound Emergency: ${incident.type}`,
        message: `${incident.reportNumber} at ${incident.locationName} (${incident.severity} Severity, ${incident.priority})`,
        type: 'incident',
        timestamp: new Date().toLocaleTimeString(),
      });

      optionsRef.current.onIncidentCreated?.(incident, stats, message);
    } else if (type === 'incident:updated') {
      const incident: IncidentReport = payload.incident;
      const stats: DashboardStats = payload.stats;
      const message: string = payload.message || `Incident ${incident.reportNumber} updated`;

      setRecentBroadcastBanner({
        id: incident.id,
        title: `📝 Incident Status Updated`,
        message: `${incident.reportNumber} marked as ${incident.status} (Road: ${incident.roadCondition || 'SAFE'})`,
        type: 'incident',
        timestamp: new Date().toLocaleTimeString(),
      });

      optionsRef.current.onIncidentUpdated?.(incident, stats, message);
    } else if (type === 'inspection:created') {
      const inspection: FieldInspection = payload.inspection;
      const incident: IncidentReport | null = payload.incident;
      const stats: DashboardStats = payload.stats;
      const message: string = payload.message || `Field inspection submitted by ${inspection.officerName}`;

      setRecentBroadcastBanner({
        id: inspection.id,
        title: `🛡️ Field Verification Confirmed`,
        message: `${inspection.officerName} verified ${incident?.reportNumber || 'Sector Hazard'} • Slope Risk: ${inspection.riskSeverity}`,
        type: 'inspection',
        timestamp: new Date().toLocaleTimeString(),
      });

      optionsRef.current.onInspectionCreated?.(inspection, incident, stats, message);
    } else if (type === 'road:updated') {
      const road: RoadRecord = payload.road;
      const stats: DashboardStats = payload.stats;
      const message: string = payload.message || `Road ${road.name} updated to ${road.status}`;

      setRecentBroadcastBanner({
        id: road.id,
        title: `🛣️ Road Status Shift`,
        message: `${road.name} (${road.code}) is now ${road.status}: ${road.reason}`,
        type: 'road',
        timestamp: new Date().toLocaleTimeString(),
      });

      optionsRef.current.onRoadUpdated?.(road, stats, message);
    } else if (type === 'stats:updated') {
      optionsRef.current.onStatsUpdated?.(payload.stats);
    }
  }, []);

  // Listen to local event bus
  useEffect(() => {
    const handleLocal = (event: RealtimeEvent) => {
      processIncomingEvent(event);
    };
    localListeners.add(handleLocal);
    return () => {
      localListeners.delete(handleLocal);
    };
  }, [processIncomingEvent]);

  // Connect to Server-Sent Events (SSE) stream
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: any = null;

    const connectSse = () => {
      try {
        setConnectionStatus('connecting');
        eventSource = new EventSource('/api/realtime/stream');

        eventSource.addEventListener('connected', () => {
          setConnectionStatus('connected');
        });

        eventSource.addEventListener('incident:created', (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data);
            processIncomingEvent(data);
          } catch (err) {
            console.warn('Error parsing incident:created event:', err);
          }
        });

        eventSource.addEventListener('incident:updated', (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data);
            processIncomingEvent(data);
          } catch (err) {
            console.warn('Error parsing incident:updated event:', err);
          }
        });

        eventSource.addEventListener('inspection:created', (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data);
            processIncomingEvent(data);
          } catch (err) {
            console.warn('Error parsing inspection:created event:', err);
          }
        });

        eventSource.addEventListener('road:updated', (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data);
            processIncomingEvent(data);
          } catch (err) {
            console.warn('Error parsing road:updated event:', err);
          }
        });

        eventSource.addEventListener('ping', () => {
          setConnectionStatus('connected');
        });

        eventSource.onopen = () => {
          setConnectionStatus('connected');
        };

        eventSource.onerror = () => {
          setConnectionStatus('disconnected');
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          // Exponential backoff reconnect
          reconnectTimeout = setTimeout(() => {
            connectSse();
          }, 4000);
        };
      } catch {
        setConnectionStatus('disconnected');
      }
    };

    connectSse();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [processIncomingEvent]);

  // Dismiss recent banner
  const dismissBanner = useCallback(() => {
    setRecentBroadcastBanner(null);
  }, []);

  // Simulate helper
  const simulateEvent = useCallback(async (mode: 'incident' | 'inspection' | 'road') => {
    try {
      const res = await fetch('/api/realtime/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
      });
      if (!res.ok) {
        // Trigger local simulation directly via fallback
        if (mode === 'incident') {
          const newInc = disasterDb.createIncident({
            type: 'Landslide',
            title: `⚡ Live Inbound Alert: Landslide at Khonsa Pass Highway Km 38`,
            description: `Rapid telemetry & field report received from active geological sector. Significant slope displacement.`,
            latitude: 27.1354 + (Math.random() - 0.5) * 0.01,
            longitude: 95.3621 + (Math.random() - 0.5) * 0.01,
            locationName: 'Khonsa Pass Highway Km 38',
            district: 'Tirap',
            state: 'Arunachal Pradesh',
            reporterName: 'SDRF Rapid Response Scout',
            reporterPhone: '+91 94350 99881',
            reporterRole: 'field_officer',
            severity: 'Critical',
            affectedPeopleCount: 32,
            status: 'Reported',
            roadCondition: 'BLOCKED',
            media: [],
          });
          emitLocalRealtimeEvent('incident:created', {
            incident: newInc,
            stats: disasterDb.calculateDashboardStats(),
            message: `New Landslide reported at Khonsa Pass`,
          });
        } else if (mode === 'inspection') {
          const pending = disasterDb.getIncidents().filter((i) => i.status === 'Reported' || i.status === 'Under Verification');
          const target = pending[0] || disasterDb.getIncidents()[0];
          const insp = disasterDb.addFieldInspection({
            incidentId: target?.id || 'inc-1',
            officerId: 'FO-NER-4092',
            officerName: 'Inspector Arjun Singh',
            observations: `Physical ground verification complete. Infiltration depth 18cm, active debris migration on road surface. Geotagged coordinates verified.`,
            riskSeverity: 'Critical',
            roadCondition: 'BLOCKED',
            recommendedAction: 'Keep traffic blocked, deploy excavators and reinforce slope retaining wire-mesh.',
            isOfflineSubmitted: false,
            photos: ['https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80'],
          });
          emitLocalRealtimeEvent('inspection:created', {
            inspection: insp,
            incident: target || null,
            stats: disasterDb.calculateDashboardStats(),
            message: `Field verification completed by Inspector Arjun Singh`,
          });
        } else if (mode === 'road') {
          const roads = disasterDb.getRoads();
          const targetRoad = roads[0];
          const newStatus = targetRoad.status === 'BLOCKED' ? 'CAUTION' : 'BLOCKED';
          const updated = disasterDb.updateRoadStatus(targetRoad.id, newStatus, 'Rapid clearance team operating', 'Field Officer');
          emitLocalRealtimeEvent('road:updated', {
            road: updated,
            stats: disasterDb.calculateDashboardStats(),
            message: `Road ${targetRoad.name} updated`,
          });
        }
      }
    } catch (e) {
      console.warn('Simulate failed, falling back to local trigger:', e);
    }
  }, []);

  return {
    connectionStatus,
    isConnected: connectionStatus === 'connected',
    lastEvent,
    eventCount,
    recentBroadcastBanner,
    dismissBanner,
    simulateEvent,
  };
}
