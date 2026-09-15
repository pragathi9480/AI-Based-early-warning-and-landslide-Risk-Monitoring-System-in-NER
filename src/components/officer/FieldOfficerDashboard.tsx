import React, { useState } from 'react';
import {
  ShieldCheck,
  ClipboardList,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Route,
  Wifi,
  WifiOff,
  RefreshCw,
  MapPin,
  ExternalLink,
  Clock,
  Eye,
  Camera,
  Layers,
} from 'lucide-react';
import {
  DashboardStats,
  FieldInspection,
  IncidentReport,
  LandslideRiskAssessment,
  RoadRecord,
  SafetyShelter,
  User,
  Village,
} from '../../types';
import { InteractiveGisMap } from '../map/InteractiveGisMap';
import { FieldInspectionModal } from './FieldInspectionModal';
import { apiService } from '../../services/apiService';
import { useLanguage } from '../../services/i18n';
import { INITIAL_RISK_ASSESSMENT } from '../../data/initialData';
import { ExplainableAiSection } from '../common/ExplainableAiSection';
import { Brain, AlertOctagon, TrendingUp, ShieldAlert } from 'lucide-react';

interface FieldOfficerDashboardProps {
  currentUser: User | null;
  stats: DashboardStats;
  incidents: IncidentReport[];
  roads: RoadRecord[];
  shelters: SafetyShelter[];
  villages: Village[];
  riskAssessment?: LandslideRiskAssessment;
  onRefreshData: () => void;
  onOpenSafeRoute: (shelterId?: string) => void;
}

export const FieldOfficerDashboard: React.FC<FieldOfficerDashboardProps> = ({
  currentUser,
  stats,
  incidents,
  roads,
  shelters,
  villages,
  riskAssessment = INITIAL_RISK_ASSESSMENT,
  onRefreshData,
  onOpenSafeRoute,
}) => {
  const { t } = useLanguage();
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [offlineSyncQueue, setOfflineSyncQueue] = useState<number>(0);
  const [selectedIncidentForInspection, setSelectedIncidentForInspection] = useState<IncidentReport | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const effectiveProb = riskAssessment.landslideProbability !== undefined ? riskAssessment.landslideProbability : riskAssessment.riskScore;
  const effectiveClass = riskAssessment.riskClassification || (effectiveProb >= 75 ? 'Critical' : effectiveProb >= 50 ? 'High' : effectiveProb >= 25 ? 'Moderate' : 'Safe');

  const filteredIncidents = incidents.filter((inc) => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'PENDING') return inc.status === 'Reported' || inc.status === 'Under Verification';
    if (statusFilter === 'CONFIRMED') return inc.status === 'Confirmed' || inc.status === 'Response Started';
    return true;
  });

  const handleQuickVerify = async (inc: IncidentReport) => {
    try {
      await apiService.updateIncident(
        inc.id,
        {
          status: 'Confirmed',
          severity: 'Critical',
        },
        currentUser?.name || 'Field Officer Arjun'
      );
      onRefreshData();
    } catch (err: any) {
      alert(`Error updating incident: ${err.message}`);
    }
  };

  const handleToggleOffline = () => {
    const next = !isOffline;
    setIsOffline(next);
    if (!next && offlineSyncQueue > 0) {
      // Trigger sync
      setTimeout(() => {
        setOfflineSyncQueue(0);
        onRefreshData();
      }, 800);
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Officer Header & Offline Sync Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-100 text-amber-800 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <span className="text-xs uppercase font-bold tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Field Command Unit • Sector Alpha
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            Officer {currentUser?.name || 'Arjun Singh'} (FO-NER-4092)
          </h1>
          <p className="text-xs text-slate-500">
            District: <strong>Longding / Tirap Operational Command</strong> • Ground Verification & Rapid Response
          </p>
        </div>

        {/* Offline Support Control Bar */}
        <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-2.5 shadow-2xs">
          <div className="flex items-center gap-2 text-xs">
            {isOffline ? (
              <span className="flex items-center gap-1.5 font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                <WifiOff className="w-4 h-4 text-rose-600 animate-pulse" />
                <span>OFFLINE MODE (Local Cache)</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                <Wifi className="w-4 h-4 text-emerald-600" />
                <span>ONLINE CLOUD SYNC ACTIVE</span>
              </span>
            )}
          </div>

          <button
            onClick={handleToggleOffline}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
              isOffline
                ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
            }`}
          >
            {isOffline ? 'Go Online & Sync' : 'Simulate Offline'}
          </button>
        </div>
      </div>

      {/* 6 Key Operational Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500">{t('pendingIncidents', 'New Reports')}</div>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">{stats.pendingReports}</div>
          <div className="text-[10px] text-amber-600 font-semibold mt-0.5">Need dispatch</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500">{t('verificationQueue', 'Pending Verify')}</div>
          <div className="text-2xl font-black text-amber-600 font-mono mt-1">{stats.pendingReports}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">On-ground queues</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500">{t('verifiedReports', 'Confirmed')}</div>
          <div className="text-2xl font-black text-red-600 font-mono mt-1">{stats.verifiedIncidents}</div>
          <div className="text-[10px] text-red-600 font-semibold mt-0.5">Active disaster sites</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500">{t('criticalAlerts', 'Critical Zones')}</div>
          <div className="text-2xl font-black text-rose-700 font-mono mt-1">{stats.criticalRiskZones}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">High slope saturation</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500">{t('blockedRoads', 'Blocked Roads')}</div>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">{stats.blockedRoads}</div>
          <div className="text-[10px] text-red-600 font-bold mt-0.5">Closed corridors</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500">{t('fieldOfficersOnDuty', 'Officers on Duty')}</div>
          <div className="text-2xl font-black text-sky-700 font-mono mt-1">{stats.fieldOfficersOnDuty}</div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Deployed across sector</div>
        </div>
      </div>

      {/* AI Landslide Risk & Ground Tactical Advisory (Requirement 3 & 4) */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white p-4 sm:p-5 rounded-2xl border border-purple-900/50 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-600 text-white rounded-xl shadow-xs">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black tracking-tight">
                  AI Geological Hazard Prediction: {riskAssessment.district}
                </h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/40">
                  Real Dataset Calibrated
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Live multi-factor slope stability assessment for on-ground response and evacuation routing.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/10 px-3 py-2 rounded-xl border border-white/10 self-start sm:self-auto">
            <div>
              <div className="text-[10px] uppercase font-bold text-purple-200">Landslide Probability</div>
              <div className="text-2xl font-black font-mono text-white">
                {effectiveProb}%
              </div>
            </div>
            <span
              className={`px-3 py-1 text-xs font-black uppercase rounded-lg shadow-2xs ${
                effectiveClass === 'Critical'
                  ? 'bg-red-600 text-white'
                  : effectiveClass === 'High'
                  ? 'bg-orange-600 text-white'
                  : effectiveClass === 'Moderate'
                  ? 'bg-amber-500 text-white'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              {effectiveClass} Risk
            </span>
          </div>
        </div>

        {/* Explainable AI "Why this risk?" Section */}
        <ExplainableAiSection riskAssessment={riskAssessment} defaultExpanded={false} />
      </div>

      {/* Main Grid: Left Map + Right Incident Verification Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: GIS Map for Field Officer (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-600" />
              <span>Assigned Sector Incident & Road Map</span>
            </h3>
            <span className="text-xs text-slate-500">Click marker to inspect</span>
          </div>

          <div className="rounded-xl overflow-hidden border border-slate-200 mb-3">
            <InteractiveGisMap
              center={[27.1124, 95.3423]}
              zoom={12}
              incidents={incidents}
              roads={roads}
              shelters={shelters}
              villages={villages}
              onIncidentClick={(inc) => setSelectedIncidentForInspection(inc)}
              height="440px"
            />
          </div>

          {/* Quick Road Status Overview */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg">
              <div className="font-bold text-emerald-800">Safe Corridors ({stats.safeRoadsCount})</div>
              <div className="text-[11px] text-emerald-700">Open for evacuation traffic</div>
            </div>
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="font-bold text-amber-800">Caution Corridors ({stats.cautionRoadsCount})</div>
              <div className="text-[11px] text-amber-700">Minor debris / 1-lane traffic</div>
            </div>
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg">
              <div className="font-bold text-red-800">Blocked Corridors ({stats.blockedRoads})</div>
              <div className="text-[11px] text-red-700">Heavy slides / total blockade</div>
            </div>
          </div>
        </div>

        {/* Right: Verification & Inspection Queue (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-amber-600" />
                <span>Incident Verification Queue</span>
              </h3>
              <div className="flex gap-1 text-[11px]">
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-2 py-0.5 rounded font-bold ${
                    statusFilter === 'ALL' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setStatusFilter('PENDING')}
                  className={`px-2 py-0.5 rounded font-bold ${
                    statusFilter === 'PENDING' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Pending
                </button>
              </div>
            </div>

            {/* List of reports */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {filteredIncidents.map((inc) => {
                const isCritical = inc.severity === 'Critical' || inc.priority === 'P1';
                return (
                  <div
                    key={inc.id}
                    className={`p-3.5 rounded-xl border text-xs transition-all ${
                      isCritical ? 'bg-red-50/60 border-red-200' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono font-bold text-slate-900">
                        {inc.reportNumber} • {inc.type}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded font-black text-[10px] ${
                          inc.severity === 'Critical'
                            ? 'bg-red-600 text-white'
                            : inc.severity === 'High'
                            ? 'bg-amber-600 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {inc.priority} ({inc.severity})
                      </span>
                    </div>

                    <div className="text-slate-800 font-semibold mb-1">{inc.title}</div>
                    <p className="text-slate-600 text-[11px] leading-relaxed line-clamp-2">
                      {inc.description}
                    </p>

                    <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-200/60 pt-2">
                      <span>📍 {inc.locationName}</span>
                      <span>Status: <strong className="text-slate-800">{inc.status}</strong></span>
                    </div>

                    {/* Action buttons */}
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => setSelectedIncidentForInspection(inc)}
                        className="flex-1 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-2xs flex items-center justify-center gap-1"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Conduct Inspection</span>
                      </button>
                      {inc.status === 'Reported' && (
                        <button
                          onClick={() => handleQuickVerify(inc)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Verify</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Field Inspection Modal */}
      <FieldInspectionModal
        incident={selectedIncidentForInspection}
        isOpen={Boolean(selectedIncidentForInspection)}
        onClose={() => setSelectedIncidentForInspection(null)}
        isOffline={isOffline}
        onSuccess={() => {
          if (isOffline) {
            setOfflineSyncQueue((prev) => prev + 1);
          }
          onRefreshData();
        }}
      />
    </div>
  );
};
