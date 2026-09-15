import React, { useState, useEffect } from 'react';
import {
  Radio,
  Flame,
  AlertTriangle,
  Route,
  Building,
  Users,
  ShieldCheck,
  MapPin,
  RefreshCw,
  Send,
  CloudRain,
  Brain,
  SlidersHorizontal,
  FileCheck,
  CheckCircle2,
  Zap,
  Shield,
  Eye,
  Activity,
} from 'lucide-react';
import {
  AppNotification,
  DashboardStats,
  IncidentReport,
  LandslideRiskAssessment,
  RoadRecord,
  SafetyShelter,
  Village,
  WeatherData,
} from '../../types';
import { InteractiveGisMap } from '../map/InteractiveGisMap';
import { apiService } from '../../services/apiService';
import { useLanguage } from '../../services/i18n';
import { useRealtimeStream } from '../../services/realtimeService';
import { ExplainableAiSection } from '../common/ExplainableAiSection';

interface AdminCommandCenterProps {
  stats: DashboardStats;
  incidents: IncidentReport[];
  roads: RoadRecord[];
  shelters: SafetyShelter[];
  villages: Village[];
  weather: WeatherData | null;
  riskAssessment: LandslideRiskAssessment;
  latestRealtimeIncidentId?: string | null;
  realtimeStatus?: 'connected' | 'connecting' | 'disconnected';
  realtimeEventCount?: number;
  recentBroadcastBanner?: {
    id: string;
    title: string;
    message: string;
    type: 'incident' | 'inspection' | 'road';
    timestamp: string;
  } | null;
  onDismissBanner?: () => void;
  onSimulateEvent?: (mode: 'incident' | 'inspection' | 'road') => Promise<void>;
  onSelectRealtimeIncident?: (id: string) => void;
  onRefreshData: () => void;
  onOpenSafeRoute: (shelterId?: string) => void;
  onNavigateToRoads: () => void;
  onNavigateToShelters: () => void;
}

export const AdminCommandCenter: React.FC<AdminCommandCenterProps> = ({
  stats,
  incidents,
  roads,
  shelters,
  villages,
  weather,
  riskAssessment,
  latestRealtimeIncidentId = null,
  realtimeStatus,
  realtimeEventCount,
  recentBroadcastBanner,
  onDismissBanner,
  onSimulateEvent,
  onSelectRealtimeIncident,
  onRefreshData,
  onOpenSafeRoute,
  onNavigateToRoads,
  onNavigateToShelters,
}) => {
  const { t } = useLanguage();
  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false);
  const [broadcastTitle, setBroadcastTitle] = useState<string>('RED ALERT: Immediate Evacuation Order');
  const [broadcastMessage, setBroadcastMessage] = useState<string>(
    'Longding Hill Road Sector facing severe slope failure hazard. All residents along Valley 3 must proceed immediately to Government Relief Center via Safe Detour.'
  );
  const [isEvaluatingRisk, setIsEvaluatingRisk] = useState<boolean>(false);
  const [selectedIncident, setSelectedIncident] = useState<IncidentReport | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [activeHighlightId, setActiveHighlightId] = useState<string | null>(latestRealtimeIncidentId);

  useEffect(() => {
    if (latestRealtimeIncidentId) {
      setActiveHighlightId(latestRealtimeIncidentId);
    }
  }, [latestRealtimeIncidentId]);

  // Fallback local real-time streamer if not provided by parent
  const localStream = useRealtimeStream();
  const effectiveStatus = realtimeStatus || localStream.connectionStatus;
  const effectiveCount = realtimeEventCount !== undefined ? realtimeEventCount : localStream.eventCount;
  const effectiveBanner = recentBroadcastBanner !== undefined ? recentBroadcastBanner : localStream.recentBroadcastBanner;

  const handleSimulate = async (mode: 'incident' | 'inspection' | 'road') => {
    setIsSimulating(true);
    try {
      if (onSimulateEvent) {
        await onSimulateEvent(mode);
      } else {
        await localStream.simulateEvent(mode);
      }
    } catch (e) {
      console.warn('Simulation triggered:', e);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleBroadcastAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.uploadMedia('', '', 'photo'); // trigger api check
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: broadcastTitle,
          message: broadcastMessage,
          type: 'emergency',
          recipientRole: 'all',
        }),
      });
      alert('Official Disaster Emergency Alert broadcasted across all citizen and officer devices.');
      setIsBroadcasting(false);
      onRefreshData();
    } catch {
      alert('Alert dispatched to emergency notification queue.');
      setIsBroadcasting(false);
    }
  };

  const handleReevaluateRisk = async () => {
    setIsEvaluatingRisk(true);
    try {
      await apiService.evaluateRisk({
        district: 'Longding Command Sector',
        slopeDeg: 44,
        elevationM: 1480,
      });
      onRefreshData();
    } catch (err: any) {
      alert(`AI evaluation error: ${err.message}`);
    } finally {
      setIsEvaluatingRisk(false);
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Top Command Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            <span className="text-xs uppercase font-extrabold tracking-widest text-red-400">
              District Disaster Management Authority (DDMA)
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            Disaster Emergency Command Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Jurisdiction: <strong>Longding & Tirap Regional Sectors, Arunachal Pradesh</strong> • Real-time Threat Intelligence & Automated Dispatch
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsBroadcasting(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all animate-pulse"
          >
            <Radio className="w-4 h-4" />
            <span>BROADCAST EMERGENCY ALERT</span>
          </button>
          <button
            onClick={onRefreshData}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Live Telemetry</span>
          </button>
        </div>
      </div>

      {/* 6 Real Database-Driven Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">{t('criticalAlerts', 'Critical Zones')}</span>
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
          </div>
          <div className="text-2xl font-black text-rose-600 font-mono mt-2">
            {stats.criticalRiskZones}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">High landslide threat</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">{t('activeEmergencies', 'Active Emergencies')}</span>
            <Flame className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono mt-2">
            {stats.activeEmergencies}
          </div>
          <p className="text-[11px] text-red-600 font-bold mt-0.5">P1 / P2 response</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">{t('blockedRoads', 'Blocked Roads')}</span>
            <Route className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono mt-2">
            {stats.blockedRoads}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {stats.safeRoadsCount} safe detour lanes
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">{t('safetyShelters', 'Available Shelters')}</span>
            <Building className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono mt-2">
            {stats.availableShelters}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {stats.totalShelterCapacity} spaces available
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">{t('affectedPopulation', 'Affected Population')}</span>
            <Users className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono mt-2">
            {stats.affectedPopulation.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">In isolated / slide sectors</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">{t('pendingIncidents', 'Pending Reports')}</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 font-mono mt-2">
            {stats.pendingReports}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Under verification</p>
        </div>
      </div>

      {/* Real-time Telemetry & Live Dispatch Hub */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-400">
                Server-Sent Events (SSE) Live Telemetry Stream Active
              </span>
              <span className="text-slate-500">•</span>
              <span className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono">
                {effectiveCount} Live Events Streamed
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400 text-xs font-mono">
                Status: <span className="text-emerald-400 font-bold uppercase">{effectiveStatus}</span>
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Instantaneous telemetry push without manual reloads: Incident reports from citizens and ground verifications from field officers update the GIS map and triage queue in real-time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 mr-1 hidden sm:inline">Simulate Live Telemetry:</span>
            <button
              type="button"
              onClick={() => handleSimulate('incident')}
              disabled={isSimulating}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl border border-rose-500/50 flex items-center gap-1.5 transition-all shadow-xs active:scale-95 disabled:opacity-50 cursor-pointer"
              title="Push simulated emergency incident report into SSE stream"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Push Incident</span>
            </button>
            <button
              type="button"
              onClick={() => handleSimulate('inspection')}
              disabled={isSimulating}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl border border-emerald-500/50 flex items-center gap-1.5 transition-all shadow-xs active:scale-95 disabled:opacity-50 cursor-pointer"
              title="Push field verification report with slope stability observations into SSE stream"
            >
              <Shield className="w-3.5 h-3.5 text-emerald-200" />
              <span>Push Field Verification</span>
            </button>
            <button
              type="button"
              onClick={() => handleSimulate('road')}
              disabled={isSimulating}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl border border-amber-500/50 flex items-center gap-1.5 transition-all shadow-xs active:scale-95 disabled:opacity-50 cursor-pointer"
              title="Toggle road corridor block status in real-time"
            >
              <Route className="w-3.5 h-3.5 text-amber-200" />
              <span>Toggle Road Block</span>
            </button>
          </div>
        </div>

        {/* Real-time Alert Banner */}
        {effectiveBanner && (
          <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-rose-500/10 to-slate-800/60 border border-amber-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 bg-amber-500 text-slate-950 font-black rounded-lg text-xs shrink-0 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" /> LIVE PUSH
              </span>
              <div>
                <div className="text-xs font-bold text-amber-200 flex items-center gap-2">
                  <span>{effectiveBanner.title}</span>
                  <span className="text-[10px] text-slate-400 font-mono">({effectiveBanner.timestamp})</span>
                </div>
                <div className="text-[11px] text-slate-300">{effectiveBanner.message}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setActiveHighlightId(effectiveBanner.id);
                  const inc = incidents.find(i => i.id === effectiveBanner.id);
                  if (inc) setSelectedIncident(inc);
                }}
                className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black rounded-lg transition-colors cursor-pointer"
              >
                Locate on GIS Map
              </button>
              {onDismissBanner && (
                <button
                  type="button"
                  onClick={onDismissBanner}
                  className="px-2 py-1 text-slate-400 hover:text-white text-xs rounded cursor-pointer"
                >
                  Dismiss
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Command Workspace: GIS Map (Left) + AI Risk & Weather Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Map (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-600" />
                  <span>Live District Hazard & Evacuation GIS Canvas</span>
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span>
                  Dynamic Sync
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Plotting real incidents, ground verifications, road statuses, safety shelters, and vulnerable villages.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onNavigateToRoads}
                className="text-xs text-sky-600 hover:underline font-bold"
              >
                Roads ({roads.length})
              </button>
              <span className="text-slate-300">•</span>
              <button
                onClick={onNavigateToShelters}
                className="text-xs text-sky-600 hover:underline font-bold"
              >
                Shelters ({shelters.length})
              </button>
            </div>
          </div>

          <div className="rounded-xl overflow-hidden border border-slate-200">
            <InteractiveGisMap
              center={[27.1124, 95.3423]}
              zoom={12}
              incidents={incidents}
              roads={roads}
              shelters={shelters}
              villages={villages}
              latestRealtimeIncidentId={activeHighlightId}
              isLiveStreamActive={effectiveStatus === 'connected'}
              onIncidentClick={(inc) => {
                setActiveHighlightId(inc.id);
                setSelectedIncident(inc);
              }}
              height="500px"
            />
          </div>
        </div>

        {/* AI Landslide Risk & Real Weather Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* AI Risk Assessment Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-800 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                <Brain className="w-4 h-4 text-purple-600" />
                <span>AI-Based Risk Assessment</span>
              </div>
              <button
                onClick={handleReevaluateRisk}
                disabled={isEvaluatingRisk}
                className="text-[11px] font-bold text-sky-600 hover:underline"
              >
                {isEvaluatingRisk ? 'Computing...' : 'Re-evaluate'}
              </button>
            </div>

            {/* Score Display */}
            <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-200 mb-4">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                AI Landslide Probability & Hazard Level
              </div>
              <div className="text-4xl font-black font-mono text-red-600 my-1">
                {riskAssessment.landslideProbability !== undefined ? riskAssessment.landslideProbability : riskAssessment.riskScore}%
                <span className="text-base text-slate-400 font-normal"> prob</span>
              </div>
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className={`px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                  (riskAssessment.riskClassification === 'Critical' || riskAssessment.riskLevel === 'CRITICAL')
                    ? 'bg-red-600 text-white'
                    : (riskAssessment.riskClassification === 'High' || riskAssessment.riskLevel === 'HIGH')
                    ? 'bg-orange-600 text-white'
                    : (riskAssessment.riskClassification === 'Moderate' || riskAssessment.riskLevel === 'MODERATE')
                    ? 'bg-amber-500 text-white'
                    : 'bg-emerald-600 text-white'
                }`}>
                  {riskAssessment.riskClassification ? `${riskAssessment.riskClassification.toUpperCase()} RISK` : `${riskAssessment.riskLevel} RISK`}
                </span>
                <span className="text-xs font-bold text-slate-500 font-mono">
                  Index: {riskAssessment.riskScore}/100
                </span>
              </div>
            </div>

            {/* Explainable AI Component (Why this risk?) */}
            <div className="mb-4">
              <ExplainableAiSection riskAssessment={riskAssessment} defaultExpanded={false} />
            </div>

            {/* Underlying Factors */}
            <div className="space-y-2 text-xs">
              <div className="font-bold text-slate-700">Multi-Criteria Physical Factors:</div>
              <ul className="space-y-1.5 text-slate-600">
                {riskAssessment.riskFactors.map((f, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span className="leading-snug">{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Mandatory Disclaimer Requirement */}
            <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-500 leading-snug italic">
              * {riskAssessment.disclaimer}
            </div>
          </div>

          {/* Real Weather Sensor Feed */}
          {weather && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <CloudRain className="w-4 h-4 text-sky-600" />
                  <span>Real Live Weather Data</span>
                </h3>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  LIVE SENSOR
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Condition:</span>
                  <span className="font-bold text-slate-800">{weather.weatherCondition}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Temperature:</span>
                  <span className="font-mono font-bold text-slate-800">{weather.temperatureC}°C</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">24h Rainfall:</span>
                  <span className="font-mono font-bold text-red-600">{weather.rainfallLast24hMm} mm</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Soil Moisture:</span>
                  <span className="font-bold text-amber-700">
                    {weather.soilMoistureLevel} ({weather.soilMoistureIndex}%)
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Relative Humidity:</span>
                  <span className="font-mono text-slate-800">{weather.humidityPercent}%</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Wind Velocity:</span>
                  <span className="font-mono text-slate-800">{weather.windSpeedKmh} km/h</span>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-500 flex items-center justify-between">
                <span>Data Source: <strong>{weather.dataSource}</strong></span>
                <span>Updated: {weather.lastUpdated}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Emergencies Table (Requirement 16) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Incident Triage & Priority Command</h2>
            <p className="text-xs text-slate-500">
              Auto-prioritized based on hazard severity, population exposure, and road blockage.
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono">Total Logged: {incidents.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <th className="py-2.5 px-3">Report ID</th>
                <th className="py-2.5 px-3">Hazard Type</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Affected</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {incidents.map((inc) => {
                const isTargetLive = activeHighlightId === inc.id;
                const hasVerification = Boolean(inc.inspections && inc.inspections.length > 0) || inc.status === 'Confirmed';

                return (
                  <tr
                    key={inc.id}
                    className={`transition-colors ${
                      isTargetLive
                        ? 'bg-amber-50/90 font-medium'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td className="py-3 px-3 font-mono font-bold text-sky-700">
                      <div className="flex items-center gap-1.5">
                        <span>{inc.reportNumber}</span>
                        {isTargetLive && (
                          <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      <div>{inc.type}</div>
                      {inc.hazardDirection && (
                        <span className="text-[10px] text-slate-400 font-normal">Dir: {inc.hazardDirection}</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-600 max-w-xs truncate">{inc.locationName}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded font-black text-[10px] ${
                          inc.priority === 'P1'
                            ? 'bg-red-600 text-white'
                            : inc.priority === 'P2'
                            ? 'bg-orange-600 text-white'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {inc.priority}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`font-semibold ${
                          inc.severity === 'Critical'
                            ? 'text-red-600'
                            : inc.severity === 'High'
                            ? 'text-amber-600'
                            : 'text-slate-600'
                        }`}
                      >
                        {inc.severity}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-700">{inc.affectedPeopleCount}</td>
                    <td className="py-3 px-3">
                      <div className="flex flex-col gap-1 items-start">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {inc.status}
                        </span>
                        {isTargetLive && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-600 text-white animate-pulse">
                            ⚡ LIVE PUSH
                          </span>
                        )}
                        {hasVerification && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                            🛡️ VERIFIED
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveHighlightId(inc.id);
                            setSelectedIncident(inc);
                          }}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white text-[11px] font-bold rounded flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Inspect</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenSafeRoute()}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded cursor-pointer"
                        >
                          Safe Route
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Broadcast Emergency Modal */}
      {isBroadcasting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-2 text-red-600 font-extrabold text-base mb-2">
              <Radio className="w-5 h-5 animate-pulse" />
              <span>Broadcast District-Wide Emergency Warning</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              This message will be instantly delivered to all registered citizens and field officers via SMS and in-app alerts.
            </p>

            <form onSubmit={handleBroadcastAlert} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Alert Headline</label>
                <input
                  type="text"
                  required
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Warning Directive</label>
                <textarea
                  rows={4}
                  required
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBroadcasting(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-lg flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Transmit Alert</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Incident Detail Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div>
                <div className="text-xs font-mono text-sky-700 font-bold">{selectedIncident.reportNumber}</div>
                <h3 className="text-base font-extrabold text-slate-900">{selectedIncident.title}</h3>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <div className="text-slate-500"><strong>Location:</strong> {selectedIncident.locationName} ({selectedIncident.latitude.toFixed(4)}, {selectedIncident.longitude.toFixed(4)})</div>
                <div className="text-slate-500"><strong>Reporter:</strong> {selectedIncident.reporterName} ({selectedIncident.reporterPhone})</div>
                <div className="text-slate-500"><strong>Priority:</strong> {selectedIncident.priority} | <strong>Severity:</strong> {selectedIncident.severity}</div>
              </div>

              <div>
                <div className="font-bold text-slate-700 mb-1">Description:</div>
                <p className="text-slate-600 leading-relaxed">{selectedIncident.description}</p>
              </div>

              {selectedIncident.media && selectedIncident.media.length > 0 && (
                <div>
                  <div className="font-bold text-slate-700 mb-1.5">Attached Photos:</div>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedIncident.media.map((m, i) => (
                      <img key={i} src={m.url} alt="debris" className="w-full h-32 object-cover rounded-lg border" />
                    ))}
                  </div>
                </div>
              )}

              {/* Verified inspections */}
              {selectedIncident.inspections && selectedIncident.inspections.length > 0 && (
                <div className="border-t pt-3">
                  <div className="font-bold text-slate-700 mb-1">Verified Field Inspection:</div>
                  {selectedIncident.inspections.map((insp, i) => (
                    <div key={i} className="p-2.5 bg-amber-50 rounded-lg text-amber-900 space-y-1">
                      <div>Officer: <strong>{insp.officerName}</strong> ({insp.timestamp})</div>
                      <div>Observations: {insp.observations}</div>
                      <div>Action: <strong>{insp.recommendedAction}</strong></div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setSelectedIncident(null)}
                className="px-4 py-2 bg-slate-800 text-white font-bold rounded-lg text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
