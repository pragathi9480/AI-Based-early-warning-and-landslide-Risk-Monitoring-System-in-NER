import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { IncidentReport, RoadRecord, SafetyShelter, Village, SafeRouteResult } from '../../types';
import { MapPin, Navigation, Filter, Layers, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../services/i18n';

export interface NERegionConfig {
  id: string;
  name: string;
  center: L.LatLngTuple;
  zoom: number;
}

export const NE_REGIONS: NERegionConfig[] = [
  { id: 'ALL', name: 'All North East (NER)', center: [26.2006, 92.9376], zoom: 7 },
  { id: 'Assam', name: 'Assam', center: [25.8, 92.5], zoom: 8 },
  { id: 'Arunachal Pradesh', name: 'Arunachal Pradesh', center: [27.1124, 95.3423], zoom: 8 },
  { id: 'Meghalaya', name: 'Meghalaya', center: [25.4670, 91.3662], zoom: 8 },
  { id: 'Sikkim', name: 'Sikkim', center: [27.5330, 88.5122], zoom: 9 },
  { id: 'Nagaland', name: 'Nagaland', center: [25.9, 94.1], zoom: 8 },
  { id: 'Manipur', name: 'Manipur', center: [24.7, 93.8], zoom: 8 },
  { id: 'Mizoram', name: 'Mizoram', center: [23.5, 92.8], zoom: 8 },
  { id: 'Tripura', name: 'Tripura', center: [23.94, 91.98], zoom: 8 },
];

interface InteractiveGisMapProps {
  center?: L.LatLngTuple;
  zoom?: number;
  selectedRegion?: string;
  onRegionChange?: (region: string) => void;
  incidents?: IncidentReport[];
  roads?: RoadRecord[];
  shelters?: SafetyShelter[];
  villages?: Village[];
  userLocation?: [number, number] | null;
  safeRoute?: SafeRouteResult | null;
  onSelectLocation?: (lat: number, lng: number) => void;
  isSelectable?: boolean;
  selectedMarker?: [number, number] | null;
  showLayersControl?: boolean;
  height?: string;
  latestRealtimeIncidentId?: string | null;
  isLiveStreamActive?: boolean;
  onIncidentClick?: (incident: IncidentReport) => void;
  onShelterClick?: (shelter: SafetyShelter) => void;
  onRoadClick?: (road: RoadRecord) => void;
}

export const InteractiveGisMap: React.FC<InteractiveGisMapProps> = ({
  center = [27.1124, 95.3423] as L.LatLngTuple,
  zoom = 12,
  selectedRegion: propRegion,
  onRegionChange,
  incidents = [],
  roads = [],
  shelters = [],
  villages = [],
  userLocation = null,
  safeRoute = null,
  onSelectLocation,
  isSelectable = false,
  selectedMarker = null,
  height = '500px',
  latestRealtimeIncidentId = null,
  isLiveStreamActive = true,
  onIncidentClick,
  onShelterClick,
  onRoadClick,
}) => {
  const { t } = useLanguage();
  const [internalRegion, setInternalRegion] = useState<string>(propRegion || 'ALL');
  const activeRegion = propRegion !== undefined ? propRegion : internalRegion;

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersRef = useRef<{
    incidents: L.LayerGroup;
    roads: L.LayerGroup;
    shelters: L.LayerGroup;
    villages: L.LayerGroup;
    route: L.LayerGroup;
    user: L.LayerGroup;
    selection: L.LayerGroup;
  } | null>(null);

  const incidentMarkersRef = useRef<Map<string, L.Marker>>(new Map());

  // Auto-pan and highlight when a new real-time incident arrives
  useEffect(() => {
    if (latestRealtimeIncidentId && mapInstanceRef.current) {
      const target = incidents.find((i) => i.id === latestRealtimeIncidentId);
      if (target) {
        mapInstanceRef.current.panTo([target.latitude, target.longitude], {
          animate: true,
          duration: 0.8,
        });
        const marker = incidentMarkersRef.current.get(target.id);
        if (marker) {
          setTimeout(() => {
            marker.openPopup();
          }, 350);
        }
      }
    }
  }, [latestRealtimeIncidentId, incidents]);

  // Region filtering: when state is selected, filter data to that state
  const filteredIncidents = useMemo(() => {
    if (activeRegion === 'ALL') return incidents;
    return incidents.filter((inc) => inc.state?.toLowerCase() === activeRegion.toLowerCase());
  }, [incidents, activeRegion]);

  const filteredRoads = useMemo(() => {
    if (activeRegion === 'ALL') return roads;
    return roads.filter((rd) => rd.state?.toLowerCase() === activeRegion.toLowerCase());
  }, [roads, activeRegion]);

  const filteredShelters = useMemo(() => {
    if (activeRegion === 'ALL') return shelters;
    return shelters.filter((she) => she.state?.toLowerCase() === activeRegion.toLowerCase());
  }, [shelters, activeRegion]);

  const filteredVillages = useMemo(() => {
    if (activeRegion === 'ALL') return villages;
    return villages.filter((vil) => vil.state?.toLowerCase() === activeRegion.toLowerCase());
  }, [villages, activeRegion]);

  const handleRegionSelect = (regionId: string) => {
    setInternalRegion(regionId);
    if (onRegionChange) {
      onRegionChange(regionId);
    }
    const target = NE_REGIONS.find((r) => r.id === regionId);
    if (target && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(target.center, target.zoom, {
        duration: 1.2,
      });
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialCenter = activeRegion !== 'ALL'
        ? (NE_REGIONS.find((r) => r.id === activeRegion)?.center || center)
        : center;
      const initialZoom = activeRegion !== 'ALL'
        ? (NE_REGIONS.find((r) => r.id === activeRegion)?.zoom || zoom)
        : zoom;

      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: initialZoom,
        zoomControl: true,
      });

      // High-quality OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | AVANI GIS Core',
        maxZoom: 19,
      }).addTo(map);

      // Create layer groups
      const incidentLayer = L.layerGroup().addTo(map);
      const roadLayer = L.layerGroup().addTo(map);
      const shelterLayer = L.layerGroup().addTo(map);
      const villageLayer = L.layerGroup().addTo(map);
      const routeLayer = L.layerGroup().addTo(map);
      const userLayer = L.layerGroup().addTo(map);
      const selectionLayer = L.layerGroup().addTo(map);

      layersRef.current = {
        incidents: incidentLayer,
        roads: roadLayer,
        shelters: shelterLayer,
        villages: villageLayer,
        route: routeLayer,
        user: userLayer,
        selection: selectionLayer,
      };

      mapInstanceRef.current = map;

      // Handle map clicks for location selection
      map.on('click', (e: L.LeafletMouseEvent) => {
        if (isSelectable && onSelectLocation) {
          onSelectLocation(e.latlng.lat, e.latlng.lng);
        }
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update center/zoom if changed externally
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(center, zoom);
    }
  }, [center[0], center[1], zoom]);

  // Update Layers Content
  useEffect(() => {
    if (!mapInstanceRef.current || !layersRef.current) return;

    const {
      incidents: incGroup,
      roads: roadGroup,
      shelters: sheGroup,
      villages: vilGroup,
      route: routeGroup,
      user: userGroup,
      selection: selGroup,
    } = layersRef.current;

    // Clear all layers
    incGroup.clearLayers();
    roadGroup.clearLayers();
    sheGroup.clearLayers();
    vilGroup.clearLayers();
    routeGroup.clearLayers();
    userGroup.clearLayers();
    selGroup.clearLayers();

    // 1. Render Roads as colored polylines
    filteredRoads.forEach((road) => {
      let color = '#10b981'; // SAFE green
      let dashArray = '';
      let weight = 5;

      if (road.status === 'BLOCKED') {
        color = '#ef4444'; // Red
        weight = 6;
      } else if (road.status === 'AVOID') {
        color = '#1e293b'; // Dark slate / avoid
        dashArray = '6, 8';
        weight = 5;
      } else if (road.status === 'CAUTION') {
        color = '#f59e0b'; // Amber
        weight = 5;
      }

      if (road.coordinates && road.coordinates.length > 1) {
        const polyline = L.polyline(road.coordinates, {
          color,
          weight,
          opacity: 0.85,
          dashArray,
        });

        polyline.bindPopup(`
          <div style="font-family: sans-serif; font-size: 13px; line-height: 1.4;">
            <div style="font-weight: 700; color: #0f172a; margin-bottom: 4px;">${road.name} (${road.code})</div>
            <div style="display: inline-block; padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 11px; color: white; background: ${color};">
              ${road.status}
            </div>
            <p style="margin: 6px 0 2px; color: #475569;"><strong>Condition:</strong> ${road.reason}</p>
            <p style="margin: 0; color: #64748b; font-size: 11px;">Updated: ${road.updatedAt} by ${road.lastUpdatedBy}</p>
          </div>
        `);

        if (onRoadClick) {
          polyline.on('click', () => onRoadClick(road));
        }

        roadGroup.addLayer(polyline);
      }
    });

    // 2. Render Incidents with pulse markers and real-time live telemetry
    incidentMarkersRef.current.clear();

    filteredIncidents.forEach((inc) => {
      const isCritical = inc.severity === 'Critical' || inc.severity === 'High';
      const isLiveRecent = latestRealtimeIncidentId === inc.id || inc.title.includes('Live') || inc.title.includes('⚡');
      const hasVerification = Boolean(inc.inspections && inc.inspections.length > 0) || inc.status === 'Confirmed';
      const isResolved = inc.status === 'Resolved';

      let bgColor = '#ea580c'; // default orange
      if (isResolved) {
        bgColor = '#64748b'; // slate
      } else if (hasVerification) {
        bgColor = '#059669'; // verified emerald green
      } else if (isCritical) {
        bgColor = '#dc2626'; // critical red
      }

      const pulseClass = isLiveRecent
        ? (hasVerification ? 'live-verified-pulse' : 'live-beacon-pulse')
        : (isCritical && !isResolved ? 'animate-pulse' : '');

      const iconHtml = `
        <div class="${pulseClass}" style="
          width: ${isLiveRecent ? '38px' : '32px'};
          height: ${isLiveRecent ? '38px' : '32px'};
          background: ${bgColor};
          border: ${isLiveRecent ? '3px solid #fef08a' : '3px solid white'};
          border-radius: 50%;
          box-shadow: 0 4px 12px rgba(0,0,0,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: ${isLiveRecent ? '16px' : '14px'};
          cursor: pointer;
          position: relative;
        ">
          ${hasVerification ? '🛡️' : (isLiveRecent ? '⚡' : '⚠️')}
          ${isLiveRecent ? `<span style="position: absolute; top: -7px; right: -7px; background: #ef4444; color: white; font-size: 8px; font-weight: 900; padding: 1px 4px; border-radius: 9999px; border: 1px solid white; line-height: 1;">LIVE</span>` : ''}
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'incident-marker-icon',
        iconSize: isLiveRecent ? [38, 38] : [32, 32],
        iconAnchor: isLiveRecent ? [19, 19] : [16, 16],
      });

      const marker = L.marker([inc.latitude, inc.longitude], { icon: customIcon });

      const verifiedBadge = hasVerification
        ? `<div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 4px; padding: 5px 8px; margin: 6px 0; font-size: 11px; color: #065f46;">
            <strong>🛡️ Ground Verification Confirmed:</strong> ${inc.inspections?.[0]?.officerName || 'Field Officer'}
            ${inc.inspections?.[0]?.riskSeverity ? `<br><span style="color:#047857">Slope Hazard: <strong>${inc.inspections[0].riskSeverity}</strong></span>` : ''}
            ${inc.inspections?.[0]?.observations ? `<br><span style="color:#334155; font-style: italic;">"${inc.inspections[0].observations.slice(0, 85)}..."</span>` : ''}
          </div>`
        : '';

      const liveBadge = isLiveRecent
        ? `<div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 4px; padding: 3px 6px; margin-bottom: 6px; font-size: 10px; font-weight: 700; color: #b91c1c; display: flex; align-items: center; justify-content: space-between;">
            <span>⚡ REAL-TIME TELEMETRY PUSH</span>
            <span style="font-weight: normal; color: #ef4444;">Live Stream</span>
          </div>`
        : '';

      marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 13px; max-width: 260px; line-height: 1.4;">
          ${liveBadge}
          <div style="font-weight: 700; color: #0f172a; font-size: 14px;">${inc.type} - ${inc.reportNumber}</div>
          <div style="margin: 4px 0; display: flex; align-items: center; gap: 4px; flex-wrap: wrap;">
            <span style="background: ${bgColor}; color: white; padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 11px;">
              ${inc.severity.toUpperCase()}
            </span>
            <span style="background: #e2e8f0; color: #334155; padding: 2px 6px; border-radius: 4px; font-size: 11px;">
              ${inc.status}
            </span>
            <span style="background: #f1f5f9; color: #475569; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600;">
              ${inc.priority}
            </span>
          </div>
          <p style="margin: 6px 0; color: #334155; font-size: 12px;">${inc.description}</p>
          ${verifiedBadge}
          <div style="font-size: 11px; color: #64748b; margin-top: 4px; border-top: 1px solid #e2e8f0; padding-top: 4px;">
            📍 ${inc.locationName}<br>
            👥 Approx. Affected: <strong>${inc.affectedPeopleCount}</strong><br>
            🛣️ Road Condition: <strong>${inc.roadCondition || 'Passable'}</strong>
          </div>
        </div>
      `);

      if (onIncidentClick) {
        marker.on('click', () => onIncidentClick(inc));
      }

      incidentMarkersRef.current.set(inc.id, marker);
      incGroup.addLayer(marker);
    });

    // 3. Render Shelters
    filteredShelters.forEach((shelter) => {
      const isFull = shelter.status === 'Full';
      const iconHtml = `
        <div style="
          width: 30px;
          height: 30px;
          background: ${isFull ? '#64748b' : '#0284c7'};
          border: 2px solid white;
          border-radius: 6px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 14px;
        ">
          🏠
        </div>
      `;

      const shelterIcon = L.divIcon({
        html: iconHtml,
        className: 'shelter-marker-icon',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      const marker = L.marker([shelter.latitude, shelter.longitude], { icon: shelterIcon });
      marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 13px; max-width: 240px;">
          <div style="font-weight: 700; color: #0f172a; font-size: 14px;">${shelter.name}</div>
          <div style="margin: 4px 0;">
            <span style="background: ${isFull ? '#ef4444' : '#10b981'}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 700;">
              ${shelter.status.toUpperCase()}
            </span>
            <span style="font-size: 12px; color: #475569; margin-left: 6px;">
              ${shelter.currentOccupancy} / ${shelter.capacity} spaces
            </span>
          </div>
          <p style="margin: 4px 0; font-size: 12px; color: #334155;">📍 ${shelter.address}</p>
          <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
            Facilities: ${shelter.facilities.join(', ')}
          </div>
        </div>
      `);

      if (onShelterClick) {
        marker.on('click', () => onShelterClick(shelter));
      }

      sheGroup.addLayer(marker);
    });

    // 4. Render Villages
    filteredVillages.forEach((village) => {
      const isEvacuating = village.evacuationStatus === 'Evacuating';
      const marker = L.circleMarker([village.latitude, village.longitude], {
        radius: 7,
        fillColor: isEvacuating ? '#ef4444' : '#6366f1',
        color: '#ffffff',
        weight: 2,
        fillOpacity: 0.9,
      });

      marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px;">
          <strong>${village.name}</strong><br>
          Population: ${village.population.toLocaleString()}<br>
          Risk: <span style="font-weight:bold; color: ${isEvacuating ? '#ef4444' : '#6366f1'};">${village.riskLevel}</span><br>
          Status: <strong>${village.evacuationStatus}</strong>
        </div>
      `);

      vilGroup.addLayer(marker);
    });

    // 5. Render User Current Location
    if (userLocation) {
      const userIconHtml = `
        <div style="position: relative; width: 22px; height: 22px;">
          <div style="position: absolute; width: 22px; height: 22px; background: rgba(37, 99, 235, 0.35); border-radius: 50%; animation: ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
          <div style="position: absolute; top: 4px; left: 4px; width: 14px; height: 14px; background: #2563eb; border: 2.5px solid white; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>
        </div>
      `;

      const userIcon = L.divIcon({
        html: userIconHtml,
        className: 'user-marker-icon',
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });

      const userMarker = L.marker(userLocation, { icon: userIcon }).bindPopup(
        '<strong>Your Current Location</strong><br>GPS Geolocation Active'
      );
      userGroup.addLayer(userMarker);
    }

    // 6. Selected Location Marker (for Emergency Reporting wizard)
    if (selectedMarker) {
      const selectIconHtml = `
        <div style="
          width: 34px;
          height: 44px;
          display: flex;
          flex-direction: column;
          align-items: center;
        ">
          <div style="
            width: 32px;
            height: 32px;
            background: #e11d48;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 4px 12px rgba(225,29,72,0.45);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 16px;
          ">
            📍
          </div>
          <div style="width: 4px; height: 10px; background: #e11d48;"></div>
        </div>
      `;

      const selectIcon = L.divIcon({
        html: selectIconHtml,
        className: 'select-marker-icon',
        iconSize: [34, 44],
        iconAnchor: [17, 44],
      });

      const selMarker = L.marker(selectedMarker, {
        icon: selectIcon,
        draggable: true,
      });

      selMarker.on('dragend', (e) => {
        const latlng = e.target.getLatLng();
        if (onSelectLocation) {
          onSelectLocation(latlng.lat, latlng.lng);
        }
      });

      selGroup.addLayer(selMarker);
    }

    // 7. Render Safe Route Polyline (Green highlight line connecting start to shelter)
    if (safeRoute && safeRoute.waypoints.length > 1) {
      const routeLine = L.polyline(safeRoute.waypoints, {
        color: '#2563eb', // Clean vibrant route blue
        weight: 6,
        opacity: 0.95,
        lineJoin: 'round',
      });

      routeLine.bindPopup(`
        <div style="font-family: sans-serif; font-size: 13px;">
          <strong style="color: #1e40af;">Calculated Safe Evacuation Route</strong><br>
          Destination: <strong>${safeRoute.destinationName}</strong><br>
          Distance: <strong>${safeRoute.totalDistanceKm} km</strong> (~${safeRoute.estimatedTravelTimeMinutes} mins)<br>
          Status: <span style="color: #16a34a; font-weight: bold;">🟢 SAFE (Detoured around blocked corridors)</span>
        </div>
      `);

      routeGroup.addLayer(routeLine);

      // Fit route in view
      mapInstanceRef.current.fitBounds(routeLine.getBounds(), { padding: [40, 40] });
    }
  }, [
    filteredIncidents,
    filteredRoads,
    filteredShelters,
    filteredVillages,
    userLocation,
    safeRoute,
    selectedMarker,
    isSelectable,
  ]);

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm">
      {/* Top Region Filter Overlay */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/90 shadow-md flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <span>{t('selectRegion', 'State / Region')}:</span>
          </div>
          <select
            value={activeRegion}
            onChange={(e) => handleRegionSelect(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-300 text-slate-900 rounded-lg px-2.5 py-1 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
          >
            {NE_REGIONS.map((reg) => (
              <option key={reg.id} value={reg.id}>
                {t(reg.id.toLowerCase().replace(/\s+/g, ''), reg.name)}
              </option>
            ))}
          </select>
          {activeRegion !== 'ALL' && (
            <button
              onClick={() => handleRegionSelect('ALL')}
              className="text-[11px] font-medium text-blue-600 hover:text-blue-800 underline ml-1 cursor-pointer"
            >
              {t('allRegions', 'Show All')}
            </button>
          )}
        </div>

        {/* Dynamic region summary badge */}
        <div className="flex items-center gap-2">
          {isLiveStreamActive && (
            <div className="pointer-events-auto bg-emerald-950/90 border border-emerald-500/40 backdrop-blur-md text-emerald-200 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-md flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span className="font-mono text-[11px] text-emerald-300 hidden sm:inline">LIVE SSE ACTIVE</span>
            </div>
          )}
          <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-xs font-medium shadow-md flex items-center gap-2.5">
            <span className="text-amber-300 font-bold">
              {activeRegion === 'ALL' ? 'North East India' : activeRegion}
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-red-400 font-semibold">{filteredIncidents.length} Hazards</span>
            <span className="text-slate-500">•</span>
            <span className="text-amber-400 font-semibold">
              {filteredRoads.filter(r => r.status === 'BLOCKED').length} Blocked
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-emerald-400 font-semibold">{filteredShelters.length} Shelters</span>
          </div>
        </div>
      </div>

      <div
        ref={mapContainerRef}
        id="ner-gis-map-canvas"
        style={{ height, width: '100%' }}
        className="z-0"
      />

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-200 shadow-md z-[1000] text-xs flex flex-wrap gap-x-4 gap-y-1 items-center">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
          <span className="text-slate-700 font-medium">Incident</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 bg-emerald-600 rounded-full text-white text-[9px] flex items-center justify-center font-bold">🛡️</span>
          <span className="text-slate-700 font-medium">Ground Verified</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </span>
          <span className="text-slate-700 font-medium">Live Telemetry (⚡)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-1 bg-red-500 rounded"></span>
          <span className="text-slate-700 font-medium">Blocked Road</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-1 bg-emerald-500 rounded"></span>
          <span className="text-slate-700 font-medium">Safe Road</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 bg-sky-600 rounded text-white text-[9px] flex items-center justify-center font-bold">🏠</span>
          <span className="text-slate-700 font-medium">Shelter</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
          <span className="text-slate-700 font-medium">Village</span>
        </div>
      </div>
    </div>
  );
};
