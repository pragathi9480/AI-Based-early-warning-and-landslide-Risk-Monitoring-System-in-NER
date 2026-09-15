import React from 'react';
import {
  AlertTriangle,
  Flame,
  Bell,
  Building,
  Route,
  Navigation,
  CloudRain,
  ExternalLink,
  MapPin,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Brain,
} from 'lucide-react';
import {
  AppNotification,
  DashboardStats,
  IncidentReport,
  LandslideRiskAssessment,
  RoadRecord,
  SafetyShelter,
  User,
  WeatherData,
} from '../../types';
import { InteractiveGisMap } from '../map/InteractiveGisMap';
import { useLanguage } from '../../services/i18n';
import { ExplainableAiSection } from '../common/ExplainableAiSection';

interface CitizenDashboardProps {
  currentUser: User | null;
  stats: DashboardStats;
  riskAssessment: LandslideRiskAssessment;
  weather: WeatherData | null;
  shelters: SafetyShelter[];
  roads: RoadRecord[];
  notifications: AppNotification[];
  recentIncidents: IncidentReport[];
  onNavigate: (view: string) => void;
  onOpenSafeRoute: (shelterId?: string) => void;
  onOpenIncidentDetail: (inc: IncidentReport) => void;
}

export const CitizenDashboard: React.FC<CitizenDashboardProps> = ({
  currentUser,
  stats,
  riskAssessment,
  weather,
  shelters,
  roads,
  notifications,
  recentIncidents,
  onNavigate,
  onOpenSafeRoute,
  onOpenIncidentDetail,
}) => {
  const { t } = useLanguage();
  const isHighRisk = riskAssessment.riskLevel === 'HIGH' || riskAssessment.riskLevel === 'CRITICAL';

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Top Greeting Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {t('appName', 'AVANI')} • {currentUser?.name || 'Citizen User'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('appSubtitle', 'Protecting land, Protecting lives')} • {t('liveGeologicalWatch', 'LIVE GEOLOGICAL HAZARD WATCH • NORTH EAST REGION')}
          </p>
        </div>

        {weather && (
          <div className="flex items-center gap-3 bg-white border border-slate-200 shadow-2xs rounded-xl p-2.5 text-xs">
            <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <CloudRain className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-slate-900 text-sm">
                {weather.temperatureC}°C, {weather.weatherCondition}
              </div>
              <div className="text-[11px] text-slate-500">
                24h Rain: <strong>{weather.rainfallLast24hMm} mm</strong> • Soil Saturation: <strong>{weather.soilMoistureIndex}%</strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* High Landslide Risk Alert Banner */}
      <div
        className={`rounded-2xl p-4 sm:p-5 text-white shadow-sm transition-all ${
          isHighRisk
            ? 'bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 border border-red-500'
            : 'bg-gradient-to-r from-amber-600 to-orange-600 border border-amber-500'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white/20 rounded-xl shrink-0 mt-0.5">
              <AlertTriangle className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider bg-black/30 px-2 py-0.5 rounded">
                  {riskAssessment.riskClassification ? `${riskAssessment.riskClassification.toUpperCase()} RISK` : `${riskAssessment.riskLevel} RISK`}
                </span>
                <span className="text-xs text-white/90">
                  AI Landslide Probability: <strong>{riskAssessment.landslideProbability !== undefined ? riskAssessment.landslideProbability : riskAssessment.riskScore}%</strong>
                </span>
                <span className="text-white/40">•</span>
                <span className="text-xs text-white/90">
                  Threat Index: <strong>{riskAssessment.riskScore}/100</strong>
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black tracking-tight mt-1">
                {t('heroTagline', 'Predict. Monitor. Warn. Respond.')}
              </h2>
              <p className="text-xs text-white/90 mt-1 max-w-2xl leading-relaxed">
                {t('heroDescription', 'AVANI deploys artificial intelligence, satellite rainfall radar, and high-precision GIS to safeguard mountain roads, villages, and lives across North East India.')}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => onOpenSafeRoute()}
              className="px-4 py-2 bg-white text-red-700 font-extrabold text-xs rounded-xl shadow-xs hover:bg-red-50 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Building className="w-4 h-4" />
              <span>{t('safetyShelters', 'Safety Shelters')}</span>
            </button>
            <button
              onClick={() => onOpenSafeRoute()}
              className="px-4 py-2 bg-black/30 hover:bg-black/40 text-white font-bold text-xs rounded-xl border border-white/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Navigation className="w-4 h-4" />
              <span>{t('safeRoute', 'Safe Route')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Explainable AI "Why this risk?" Section for Citizens */}
      <ExplainableAiSection riskAssessment={riskAssessment} defaultExpanded={false} />

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">{t('currentRiskScore', 'Threat Score')}</span>
            <span
              className={`px-2 py-0.5 text-[10px] font-black uppercase rounded-full ${
                riskAssessment.riskLevel === 'CRITICAL'
                  ? 'bg-red-100 text-red-700'
                  : riskAssessment.riskLevel === 'HIGH'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {riskAssessment.riskLevel}
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 font-mono">
            {riskAssessment.riskScore}
            <span className="text-xs text-slate-400 font-normal"> / 100</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">{t('multiCriteriaIndex', 'Multi-criteria satellite index')}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">{t('alerts', 'Active Alerts')}</span>
            <Bell className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 font-mono">
            {notifications.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">{t('realTimeAlertsBroadcasted', 'Real-time alerts broadcasted')}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">{t('safetyShelters', 'Nearby Shelters')}</span>
            <Building className="w-4 h-4 text-sky-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 font-mono">
            {stats.availableShelters}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {stats.totalShelterCapacity} {t('spacesAvailable', 'spaces available')}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">{t('safeRoads', 'Safe Roads')}</span>
            <Route className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 font-mono">
            {stats.safeRoadsCount}
            <span className="text-xs text-slate-500 font-normal"> / {stats.totalRoadsCount} {t('safeRoads', 'Safe')}</span>
          </div>
          <p className="text-[11px] text-red-600 font-bold mt-1">
            {stats.blockedRoads} {t('blockedRoads', 'Blocked Roads')}
          </p>
        </div>
      </div>

      {/* 4 Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          id="action-report-emergency"
          onClick={() => onNavigate('report-emergency')}
          className="p-5 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white text-left shadow-sm hover:shadow-md transition-all group flex flex-col justify-between cursor-pointer"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-extrabold text-base">{t('reportEmergency', 'Report Emergency')}</h3>
            <p className="text-xs text-red-100 mt-1">{t('reportEmergencyDesc', 'Upload photo/video and GPS location in 5 quick steps.')}</p>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-white/90">
            <span>{t('reportEmergency', 'Report Emergency')}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </div>
        </button>

        <button
          id="action-view-alerts"
          onClick={() => onNavigate('alerts')}
          className="p-5 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white text-left shadow-sm hover:shadow-md transition-all group flex flex-col justify-between cursor-pointer"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-extrabold text-base">{t('alerts', 'View Live Alerts')}</h3>
            <p className="text-xs text-amber-100 mt-1">{t('viewLiveAlertsDesc', 'Stay informed on rainfall, rockfall, and evacuation notices.')}</p>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-white/90">
            <span>{notifications.length} {t('alerts', 'Active Alerts')}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </div>
        </button>

        <button
          id="action-find-shelter"
          onClick={() => onNavigate('shelters')}
          className="p-5 rounded-2xl bg-gradient-to-br from-sky-600 to-blue-700 text-white text-left shadow-sm hover:shadow-md transition-all group flex flex-col justify-between cursor-pointer"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Building className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-extrabold text-base">{t('safetyShelters', 'Find Safe Shelter')}</h3>
            <p className="text-xs text-sky-100 mt-1">{t('findSafeShelterDesc', 'Locate relief camps with food, water, power, and medical beds.')}</p>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-white/90">
            <span>{t('findSafetyShelter', 'Find Nearest Shelter')}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </div>
        </button>

        <button
          id="action-find-route"
          onClick={() => onOpenSafeRoute()}
          className="p-5 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white text-left shadow-sm hover:shadow-md transition-all group flex flex-col justify-between cursor-pointer"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Navigation className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-extrabold text-base">{t('safeRoute', 'Find Safe Route')}</h3>
            <p className="text-xs text-emerald-100 mt-1">{t('findSafeRouteDesc', 'Auto-calculate detours that strictly avoid blocked mountain roads.')}</p>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-white/90">
            <span>{t('safeRoute', 'Safe Route')}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </div>
        </button>
      </div>

      {/* Bottom Content Grid: Left Alerts + Right Map & Nearby Shelters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Recent Alerts Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-600" />
              <span>{t('recentPublicAlerts', 'Recent Public Disaster Alerts')}</span>
            </h3>
            <button
              onClick={() => onNavigate('alerts')}
              className="text-xs text-sky-600 hover:underline font-semibold cursor-pointer"
            >
              {t('viewAll', 'View All')}
            </button>
          </div>

          <div className="space-y-3">
            {notifications.slice(0, 4).map((n) => {
              const isCrit = n.type === 'emergency';
              return (
                <div
                  key={n.id}
                  className={`p-3.5 rounded-xl border text-xs transition-all ${
                    isCrit ? 'bg-red-50/70 border-red-200' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold mb-1">
                    <span className={isCrit ? 'text-red-900' : 'text-slate-800'}>{n.title}</span>
                    <span className="text-[10px] text-slate-500 font-normal">{n.timestamp}</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{n.message}</p>
                </div>
              );
            })}
          </div>

          {/* Quick incident preview list */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 mb-2.5">{t('liveOnGroundIncidents', 'Live On-Ground Landslide Incidents')}</h4>
            <div className="space-y-2">
              {recentIncidents.slice(0, 3).map((inc) => (
                <div
                  key={inc.id}
                  onClick={() => onOpenIncidentDetail(inc)}
                  className="p-2.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 flex items-center justify-between cursor-pointer text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">⚠️</span>
                    <div>
                      <div className="font-bold text-slate-900">{inc.type} • {inc.reportNumber}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-xs">{inc.locationName}</div>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      inc.severity === 'Critical'
                        ? 'bg-red-100 text-red-700'
                        : inc.severity === 'High'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {inc.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Nearby Shelters & Mini Map */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building className="w-4 h-4 text-sky-600" />
                <span>{t('safetyShelters', 'Nearby Safety Shelters')}</span>
              </h3>
              <button
                onClick={() => onNavigate('shelters')}
                className="text-xs text-sky-600 hover:underline font-semibold cursor-pointer"
              >
                Full Shelter Directory
              </button>
            </div>

            {/* Mini Map */}
            <div className="rounded-xl overflow-hidden border border-slate-200 mb-4">
              <InteractiveGisMap
                center={[27.1124, 95.3423]}
                zoom={12}
                shelters={shelters}
                roads={roads}
                height="220px"
              />
            </div>

            {/* List of Shelters */}
            <div className="space-y-2.5">
              {shelters.slice(0, 3).map((s) => (
                <div
                  key={s.id}
                  className="p-3 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900">{s.name}</div>
                    <div className="text-[11px] text-slate-500">
                      📍 {s.address} • <strong>{s.availableCapacity} / {s.capacity} spaces available</strong>
                    </div>
                  </div>
                  <button
                    onClick={() => onOpenSafeRoute(s.id)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg shadow-2xs flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>Navigate</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1 text-emerald-700 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>All listed shelters verified open by District Administration</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

