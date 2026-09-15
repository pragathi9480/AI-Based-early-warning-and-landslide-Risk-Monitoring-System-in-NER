import React from 'react';
import {
  ShieldAlert,
  Flame,
  ArrowRight,
  Brain,
  Activity,
  Upload,
  CheckCircle2,
  Navigation,
  Building,
  Route,
  Globe,
  WifiOff,
  ChevronRight,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { InteractiveGisMap } from '../map/InteractiveGisMap';
import { IncidentReport, RoadRecord, SafetyShelter, Village } from '../../types';
import { useLanguage } from '../../services/i18n';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
  onReportEmergency: () => void;
  onViewRiskMap: () => void;
  incidents: IncidentReport[];
  roads: RoadRecord[];
  shelters: SafetyShelter[];
  villages: Village[];
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onLogin,
  onReportEmergency,
  onViewRiskMap,
  incidents,
  roads,
  shelters,
  villages,
}) => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      {/* Hero Section */}
      <section className="pt-10 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
            <span>{t('liveGeologicalWatch', 'LIVE GEOLOGICAL HAZARD WATCH • NORTH EAST REGION')}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.12]">
            <span className="text-emerald-800 font-black">{t('appName', 'AVANI')}</span>
            <span className="text-slate-300 font-light mx-2 sm:mx-3 select-none">—</span>
            <span className="text-slate-900">
              {t('heroTitle', 'Intelligent Landslide Early Warning and Disaster Management System')}
            </span>
          </h1>

          <p className="text-base sm:text-xl font-bold text-sky-700">
            {t('heroTagline', 'Predict. Monitor. Warn. Respond.')}
          </p>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {t('heroDescription', 'AVANI deploys artificial intelligence, satellite rainfall radar, and high-precision GIS to safeguard mountain roads, villages, and lives across North East India.')}
          </p>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              id="hero-report-emergency-btn"
              onClick={onReportEmergency}
              className="px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-black text-sm rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 animate-pulse cursor-pointer"
            >
              <Flame className="w-5 h-5 text-white" />
              <span>{t('reportEmergency', 'REPORT EMERGENCY')}</span>
            </button>

            <button
              id="hero-get-started-btn"
              onClick={onGetStarted}
              className="px-6 py-3.5 bg-slate-900 hover:bg-black text-white font-bold text-sm rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>{t('getStarted', 'Get Started')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="hero-view-map-btn"
              onClick={onViewRiskMap}
              className="px-5 py-3.5 bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold text-sm rounded-xl border border-sky-200 transition-all flex items-center gap-2 cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-sky-600" />
              <span>{t('viewLiveRiskMap', 'View Live Risk Map')}</span>
            </button>
          </div>
        </div>

        {/* Embedded Interactive Live GIS Map Showcase Card */}
        <div className="mt-12 max-w-5xl mx-auto bg-slate-900 rounded-3xl p-3 sm:p-4 shadow-2xl border border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-2 text-white text-xs border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-bold">Live Sector GIS Feed: Longding & Tirap Districts</span>
            </div>
            <div className="flex items-center gap-3 text-slate-400 font-medium">
              <span>{incidents.length} {t('incidentsCount', 'Active Incidents')}</span>
              <span>•</span>
              <span>{shelters.length} {t('sheltersCount', 'Relief Shelters')}</span>
              <span>•</span>
              <span>{roads.length} {t('roadsCount', 'Monitored Roads')}</span>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden border border-slate-800">
            <InteractiveGisMap
              center={[27.1124, 95.3423]}
              zoom={12}
              incidents={incidents}
              roads={roads}
              shelters={shelters}
              villages={villages}
              height="440px"
            />
          </div>
        </div>
      </section>

      {/* "How It Works" 5-Step Process (Matches Reference Screen 4) */}
      <section className="py-16 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase font-extrabold tracking-wider text-sky-700 bg-sky-100 px-2.5 py-1 rounded-full">
              End-to-End Operational Lifecycle
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              {t('howItWorksTitle', 'How The Platform Safeguards Communities')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              {t('howItWorksSubtitle', 'From automated meteorological AI detection to on-ground rescue dispatch.')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              {
                step: '1. Detect',
                icon: Brain,
                color: 'text-purple-600 bg-purple-100',
                title: 'AI Multi-Factor Detection',
                desc: 'Real-time telemetry from rain gauges, terrain slopes, soil moisture sensors, and Gemini 3.8 models.',
              },
              {
                step: '2. Monitor',
                icon: Activity,
                color: 'text-amber-600 bg-amber-100',
                title: 'Continuous Monitoring',
                desc: 'Dynamic risk scoring (0-100) and automated broadcast alerts for vulnerable mountain hamlets.',
              },
              {
                step: '3. Report',
                icon: Upload,
                color: 'text-red-600 bg-red-100',
                title: 'Citizen Reporting',
                desc: 'Citizens submit geotagged photos, videos, and road blockages in under 60 seconds.',
              },
              {
                step: '4. Verify',
                icon: CheckCircle2,
                color: 'text-emerald-600 bg-emerald-100',
                title: 'Field Verification',
                desc: 'Field Officers inspect on-ground slope failure with offline mobile caching support.',
              },
              {
                step: '5. Respond',
                icon: Navigation,
                color: 'text-sky-600 bg-sky-100',
                title: 'Safe Evacuation',
                desc: 'Intelligent routing directs citizens to nearest open shelters while strictly detouring blocked roads.',
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400">{item.step}</span>
                    <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center my-3`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-extrabold text-sm text-slate-900">{item.title}</h3>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Capabilities Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Engineered for Ground Realities in North East India
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Brain, title: 'AI-Powered Risk Core', desc: 'Predicts slope failure using rainfall and soil moisture' },
            { icon: Activity, title: 'Real-Time Telemetry', desc: 'Live Open-Meteo weather API and sensor integration' },
            { icon: Upload, title: 'Citizen Reporting', desc: 'Photo/video upload with high-precision GPS capture' },
            { icon: ShieldAlert, title: 'Emergency Dispatch', desc: 'Automated P1-P4 priority calculation and alerts' },
            { icon: Building, title: 'Safety Shelters', desc: 'Real-time bed availability and relief provisions' },
            { icon: Route, title: 'Safe Route Detours', desc: 'Zero-hazard evacuation bypass around blocked roads' },
            { icon: Globe, title: 'Multilingual Regional Support', desc: 'English, Assamese, Bengali, and Hindi' },
            { icon: WifiOff, title: 'Offline Field Sync', desc: 'Enables field officers to log inspections without network' },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-800 mb-2.5">
                  <Icon className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-xs text-slate-900">{item.title}</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Red Emergency Bottom Banner */}
      <div className="bg-red-600 text-white py-4 px-4 sm:px-6 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2.5 font-extrabold text-sm sm:text-base">
            <Flame className="w-5 h-5 animate-pulse shrink-0" />
            <span>🚨 {t('emergencyPrompt', 'WITNESSED A LANDSLIDE OR CRACKED MOUNTAIN ROAD?')}</span>
          </div>
          <button
            onClick={onReportEmergency}
            className="px-5 py-2 bg-white text-red-700 hover:bg-red-50 font-black text-xs sm:text-sm rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <span>{t('reportEmergency', 'REPORT AN INCIDENT NOW')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
