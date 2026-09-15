import React, { useState } from 'react';
import {
  Flame,
  Radio,
  Truck,
  ShieldAlert,
  Megaphone,
  PhoneCall,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Clock,
  Send,
  Users,
  Route,
  Activity,
  Zap,
} from 'lucide-react';
import { IncidentReport, RoadRecord, SafetyShelter, User, Village } from '../../types';
import { useLanguage } from '../../services/i18n';

interface EmergencyActionViewProps {
  incidents: IncidentReport[];
  roads: RoadRecord[];
  shelters: SafetyShelter[];
  villages: Village[];
  currentUser: User | null;
  onRefreshData: () => void;
  onOpenSafeRoute: (shelterId?: string) => void;
}

export const EmergencyActionView: React.FC<EmergencyActionViewProps> = ({
  incidents,
  roads,
  shelters,
  villages,
  currentUser,
  onRefreshData,
  onOpenSafeRoute,
}) => {
  const { t } = useLanguage();
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);
  const [activeSOSFilter, setActiveSOSFilter] = useState<'ALL' | 'CRITICAL'>('ALL');
  const [broadcastText, setBroadcastText] = useState('');
  const [selectedVillageForEvac, setSelectedVillageForEvac] = useState<string>(villages[0]?.id || '');

  const triggerTacticalAction = (actionTitle: string, details: string) => {
    setActionSuccessMessage(`${actionTitle}: ${details}`);
    setTimeout(() => {
      setActionSuccessMessage(null);
    }, 5000);
  };

  const criticalIncidents = incidents.filter(
    (i) => i.severity === 'Critical' || i.status === 'Reported' || i.status === 'Under Verification'
  );

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Toast Confirmation */}
      {actionSuccessMessage && (
        <div className="bg-emerald-600 text-white p-4 rounded-xl shadow-lg flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{actionSuccessMessage}</span>
          </div>
          <button
            onClick={() => setActionSuccessMessage(null)}
            className="text-xs font-bold text-emerald-200 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-red-950 via-slate-900 to-slate-950 text-white p-6 rounded-2xl border border-red-900/60 shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <span className="text-xs uppercase font-extrabold tracking-widest text-red-400">
              RAPID TACTICAL RESPONSE UNIT
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
            <Flame className="w-6 h-6 text-red-500" />
            <span>{t('emergencyActions', 'Emergency Response & Incident Mitigation')}</span>
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Immediate tactical control for Field Officers: deploy SDRF battalions, issue localized evacuation orders, and reroute evacuation convoys.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="tel:112"
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all animate-pulse"
          >
            <PhoneCall className="w-4 h-4" />
            <span>HOTLINE: 112 / DDMA</span>
          </a>
        </div>
      </div>

      {/* Quick Tactical Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Action 1: Deploy SDRF Battalion */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-black mb-3">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">Deploy SDRF / NDRF Unit</h3>
            <p className="text-xs text-slate-500 mt-1">
              Dispatch 24-member specialized search & rescue team with heavy earthmoving & medical equipment.
            </p>
          </div>
          <button
            onClick={() =>
              triggerTacticalAction(
                'SDRF Unit Dispatched',
                'Battalion 4 assigned to Longding-Tirap Sector. ETA: 22 mins.'
              )
            }
            className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-all"
          >
            Request Immediate Dispatch
          </button>
        </div>

        {/* Action 2: Trigger Local Sirens */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black mb-3">
              <Megaphone className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">Sound Village Siren</h3>
            <p className="text-xs text-slate-500 mt-1">
              Activate automated acoustic sirens in high-risk downhill settlements to warn of slope liquefaction.
            </p>
          </div>
          <button
            onClick={() =>
              triggerTacticalAction(
                'Acoustic Siren Activated',
                'Sector 3 sirens sounding. Automated evacuation voice guide initiated.'
              )
            }
            className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-all"
          >
            Activate Warning Siren
          </button>
        </div>

        {/* Action 3: Lockdown Blocked Road Corridor */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-black mb-3">
              <Route className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">Declare Corridor Lockdown</h3>
            <p className="text-xs text-slate-500 mt-1">
              Barricade vulnerable highway sectors. Divert civilian convoys to designated safe corridors.
            </p>
          </div>
          <button
            onClick={() =>
              triggerTacticalAction(
                'Corridor Locked Down',
                'NH-215 / Longding Bypass marked BLOCKED on GIS. Police checkpoints notified.'
              )
            }
            className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-all"
          >
            Impose Traffic Lockdown
          </button>
        </div>

        {/* Action 4: Dispatch JCB Excavators */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-black mb-3">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">Deploy JCB & Debris Clearance</h3>
            <p className="text-xs text-slate-500 mt-1">
              Mobilize Border Roads Organisation (BRO) bulldozers to clear mud, boulders, and fallen trees.
            </p>
          </div>
          <button
            onClick={() =>
              triggerTacticalAction(
                'Debris Team Dispatched',
                '2 JCB earthmovers and BRO convoy dispatched to Km 42 debris point.'
              )
            }
            className="w-full py-2 bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-all"
          >
            Dispatch Heavy Machinery
          </button>
        </div>
      </div>

      {/* Two Column Section: Left Active Incident Dispatch + Right Broadcast & Shelter Evac */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Active Critical Landslide Threats requiring immediate field response */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Activity className="w-4 h-4 text-red-600" />
                <span>Active Threats Requiring Immediate Response</span>
              </h2>
              <p className="text-xs text-slate-500">Live priority triage queue for field deployment</p>
            </div>
            <span className="text-xs font-mono font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md border border-red-200">
              {criticalIncidents.length} Urgent Sites
            </span>
          </div>

          <div className="space-y-3">
            {criticalIncidents.slice(0, 4).map((inc) => (
              <div
                key={inc.id}
                className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs hover:border-red-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sky-700">{inc.reportNumber}</span>
                  <span className="px-2.5 py-0.5 rounded font-black text-[10px] bg-red-600 text-white">
                    {inc.priority} • {inc.severity}
                  </span>
                </div>

                <div className="font-bold text-slate-900 text-sm">{inc.title}</div>
                <p className="text-slate-600 leading-relaxed">{inc.description}</p>

                <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1 font-medium text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {inc.locationName}
                  </span>
                  <span>Affected: <strong className="text-slate-900">{inc.affectedPeopleCount} people</strong></span>
                  <span>Status: <strong className="text-amber-700">{inc.status}</strong></span>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() =>
                      triggerTacticalAction(
                        'Team Dispatched to ' + inc.reportNumber,
                        `Rapid response team mobilized to ${inc.locationName}.`
                      )
                    }
                    className="flex-1 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs cursor-pointer transition-all"
                  >
                    Deploy Field Team
                  </button>
                  <button
                    onClick={() => onOpenSafeRoute()}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs cursor-pointer transition-all"
                  >
                    Safe Evacuation Route
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (5 cols): Sector Evacuation Order & Tactical Radio */}
        <div className="lg:col-span-5 space-y-4">
          {/* Order Village Evacuation */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
              <Users className="w-4 h-4 text-amber-600" />
              <span>Issue Mandatory Evacuation Directive</span>
            </div>
            <p className="text-xs text-slate-500">
              Transmit official evacuation command to target village and designate destination shelter.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Village / Settlement</label>
                <select
                  value={selectedVillageForEvac}
                  onChange={(e) => setSelectedVillageForEvac(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:outline-none"
                >
                  {villages.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} (Pop: {v.population} • Risk: {v.riskLevel})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] space-y-1">
                <div className="font-bold">Automated Evacuation Route Protocol:</div>
                <div>Designated Shelter: <strong>{shelters[0]?.name || 'District Relief Camp'}</strong></div>
                <div>Safe Highway: <strong>{roads.find((r) => r.status === 'SAFE')?.name || 'SH-12 Bypass'}</strong></div>
              </div>

              <button
                onClick={() =>
                  triggerTacticalAction(
                    'Evacuation Directive Issued',
                    `Evacuation notice pushed to village chiefs and police patrol units.`
                  )
                }
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer transition-all flex items-center justify-center gap-1.5"
              >
                <Zap className="w-4 h-4" />
                <span>Transmit Evacuation Order</span>
              </button>
            </div>
          </div>

          {/* Direct Hotlines & Radio Frequencies */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
              <Radio className="w-4 h-4 text-emerald-600" />
              <span>Emergency Radio & Control Line</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                <div>
                  <div className="font-bold text-slate-800">DDMA Central Command</div>
                  <div className="text-[10px] text-slate-500">24x7 War Room Longding</div>
                </div>
                <a
                  href="tel:1077"
                  className="px-2.5 py-1 bg-slate-900 text-white font-mono text-[11px] rounded font-bold"
                >
                  1077
                </a>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                <div>
                  <div className="font-bold text-slate-800">SDRF Field Tactical Channel</div>
                  <div className="text-[10px] text-slate-500">VHF Wireless Band 142.15 MHz</div>
                </div>
                <span className="font-mono text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                  CH-ALPHA
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                <div>
                  <div className="font-bold text-slate-800">Border Roads Org (BRO) Task Force</div>
                  <div className="text-[10px] text-slate-500">Heavy Equipment Dispatch</div>
                </div>
                <a
                  href="tel:1800112233"
                  className="px-2.5 py-1 bg-slate-900 text-white font-mono text-[11px] rounded font-bold"
                >
                  CALL BRO
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
