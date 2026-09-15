import React, { useState } from 'react';
import {
  FileCheck,
  ShieldCheck,
  Activity,
  Server,
  Database,
  Radio,
  Clock,
  Download,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react';
import { useLanguage } from '../../services/i18n';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  entity: string;
  details: string;
  status: 'SUCCESS' | 'WARN' | 'INFO';
}

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'AUD-9021',
    timestamp: 'Today, 11:42 AM',
    actor: 'District Admin',
    role: 'ADMIN',
    action: 'BROADCAST_ALERT',
    entity: 'Sector Alpha SMS Gateway',
    details: 'Red Alert broadcast transmitted to 2,400 mobile handsets in Longding corridor.',
    status: 'SUCCESS',
  },
  {
    id: 'AUD-9020',
    timestamp: 'Today, 11:15 AM',
    actor: 'Inspector Arjun Singh',
    role: 'FIELD_OFFICER',
    action: 'VERIFY_INCIDENT',
    entity: 'INC-2026-0811',
    details: 'Ground slope audit confirmed 350m slip at Longding-Niausa Road Km 14.',
    status: 'SUCCESS',
  },
  {
    id: 'AUD-9019',
    timestamp: 'Today, 10:50 AM',
    actor: 'AVANI AI Neural Engine',
    role: 'SYSTEM',
    action: 'RECALCULATE_RISK',
    entity: 'Longding Regional Model',
    details: 'Threat score elevated to 88/100 following Doppler radar 92mm rainfall threshold breach.',
    status: 'WARN',
  },
  {
    id: 'AUD-9018',
    timestamp: 'Today, 09:30 AM',
    actor: 'Citizen Tashi Wangchuk',
    role: 'CITIZEN',
    action: 'SUBMIT_HAZARD_REPORT',
    entity: 'INC-2026-0814',
    details: 'Citizen geotagged active tension fissures and mudflow on Dzongu North access route.',
    status: 'INFO',
  },
  {
    id: 'AUD-9017',
    timestamp: 'Today, 08:45 AM',
    actor: 'Officer Sunita Devi',
    role: 'FIELD_OFFICER',
    action: 'ROAD_STATUS_OVERRIDE',
    entity: 'RD-003 Jatinga Highway',
    details: 'Flagged road as BLOCKED due to fallen debris; designated safe detour active.',
    status: 'SUCCESS',
  },
  {
    id: 'AUD-9016',
    timestamp: 'Yesterday, 18:20 PM',
    actor: 'District Disaster Admin',
    role: 'ADMIN',
    action: 'SHELTER_CAPACITY_UPDATE',
    entity: 'SH-001 Circuit House',
    details: 'Verified shelter provisioned with 3,000 emergency rations and backup generator.',
    status: 'SUCCESS',
  },
];

export const AuditSystemView: React.FC = () => {
  const { t } = useLanguage();
  const [auditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [filterAction, setFilterAction] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDiagnosticRunning, setIsDiagnosticRunning] = useState<boolean>(false);
  const [diagnosticToast, setDiagnosticToast] = useState<string | null>(null);

  const filteredLogs = auditLogs.filter((log) => {
    const matchesAction = filterAction === 'ALL' || log.status === filterAction;
    const matchesSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entity.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesAction && matchesSearch;
  });

  const handleRunDiagnostics = () => {
    setIsDiagnosticRunning(true);
    setTimeout(() => {
      setIsDiagnosticRunning(false);
      setDiagnosticToast('All telemetry sensors, GIS tile pipelines, and SMS gateways verified operational.');
      setTimeout(() => setDiagnosticToast(null), 5000);
    }, 1200);
  };

  const handleExportLogs = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(auditLogs, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `AVANI_Audit_Report_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Toast */}
      {diagnosticToast && (
        <div className="bg-emerald-700 text-white p-4 rounded-xl shadow-lg flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{diagnosticToast}</span>
          </div>
          <button
            onClick={() => setDiagnosticToast(null)}
            className="text-xs text-emerald-200 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-indigo-100 text-indigo-800 rounded-lg">
              <FileCheck className="w-5 h-5" />
            </span>
            <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-800 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
              {t('auditSystem', 'Audit & System Diagnostics')}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            DDMA Compliance Audit Trail & System Health
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Immutable operational event ledger, disaster protocol audits, and live telemetry microservice monitoring.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRunDiagnostics}
            disabled={isDiagnosticRunning}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isDiagnosticRunning ? 'animate-spin' : ''}`} />
            <span>{isDiagnosticRunning ? 'Running Self-Check...' : 'Run Diagnostics'}</span>
          </button>
          <button
            onClick={handleExportLogs}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export Audit Trail</span>
          </button>
        </div>
      </div>

      {/* Microservice & Sensor Telemetry Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-slate-700 flex items-center gap-1.5">
              <Server className="w-4 h-4 text-emerald-600" />
              <span>GIS Tile & Map Engine</span>
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
              HEALTHY
            </span>
          </div>
          <div className="text-xl font-black font-mono text-slate-900">99.98% Uptime</div>
          <div className="text-[11px] text-slate-500">Leaflet OpenStreetMap vector layer online</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-slate-700 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>IMD Weather & Radar Feed</span>
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
              ACTIVE
            </span>
          </div>
          <div className="text-xl font-black font-mono text-slate-900">Live 15-Min Sync</div>
          <div className="text-[11px] text-slate-500">Open-Meteo & IMD Doppler sensor connected</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-slate-700 flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-emerald-600" />
              <span>SMS Disaster Gateway</span>
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
              NORMAL
            </span>
          </div>
          <div className="text-xl font-black font-mono text-slate-900">0.8s Dispatch</div>
          <div className="text-[11px] text-slate-500">CAP-compliant emergency SMS pipeline</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-slate-700 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>Geotechnical Inclinometers</span>
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
              42/44 ONLINE
            </span>
          </div>
          <div className="text-xl font-black font-mono text-slate-900">95.4% Coverage</div>
          <div className="text-[11px] text-slate-500">2 sensors scheduled for battery replacement</div>
        </div>
      </div>

      {/* Audit Log Search & Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search audit action, officer, or event details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs bg-transparent border-none focus:outline-none text-slate-800 placeholder-slate-400"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-lg px-3 py-1.5 focus:outline-none"
            >
              <option value="ALL">All Event Types</option>
              <option value="SUCCESS">Success / Verified</option>
              <option value="WARN">Warnings / Elevated Risk</option>
              <option value="INFO">Information / Citizen Submissions</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <th className="py-3 px-4">Event Code</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Authorized Actor</th>
                <th className="py-3 px-4">Action Type</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">Operational Summary</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-sky-700">{log.id}</td>
                  <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{log.actor}</div>
                    <span className="text-[10px] font-mono text-slate-500">{log.role}</span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-indigo-700">{log.action}</td>
                  <td className="py-3 px-4 text-slate-700 font-medium">{log.entity}</td>
                  <td className="py-3 px-4 text-slate-600 max-w-md">{log.details}</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black ${
                        log.status === 'SUCCESS'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : log.status === 'WARN'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-sky-50 text-sky-700 border border-sky-200'
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
