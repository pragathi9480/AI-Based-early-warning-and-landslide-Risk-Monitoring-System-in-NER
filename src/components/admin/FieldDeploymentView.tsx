import React, { useState } from 'react';
import {
  ShieldCheck,
  UserCheck,
  MapPin,
  Radio,
  PhoneCall,
  CheckCircle2,
  Clock,
  Battery,
  Wifi,
  Search,
  Filter,
  Users,
  Send,
  SlidersHorizontal,
} from 'lucide-react';
import { useLanguage } from '../../services/i18n';

interface OfficerDeployment {
  id: string;
  name: string;
  badge: string;
  role: string;
  state: string;
  sector: string;
  assignedVillage: string;
  status: 'ON_DUTY' | 'EN_ROUTE' | 'CONDUCTING_AUDIT' | 'STANDBY';
  currentCoordinates: [number, number];
  phone: string;
  radioChannel: string;
  batteryLevel: number;
  completedAuditsToday: number;
  activeHazardsMonitored: number;
}

const INITIAL_DEPLOYMENTS: OfficerDeployment[] = [
  {
    id: 'fo-1',
    name: 'Inspector Arjun Singh',
    badge: 'FO-NER-4092',
    role: 'Lead Geological Inspector',
    state: 'Arunachal Pradesh',
    sector: 'Longding Command Sector Alpha',
    assignedVillage: 'Senua & Wakka',
    status: 'CONDUCTING_AUDIT',
    currentCoordinates: [27.1124, 95.3423],
    phone: '+91 94350 12041',
    radioChannel: 'VHF 142.15 MHz',
    batteryLevel: 94,
    completedAuditsToday: 3,
    activeHazardsMonitored: 2,
  },
  {
    id: 'fo-2',
    name: 'Officer Sunita Devi',
    badge: 'FO-NER-3821',
    role: 'Evacuation & Shelter Officer',
    state: 'Assam',
    sector: 'Dima Hasao Sector Delta',
    assignedVillage: 'Jatinga Hills Corridor',
    status: 'ON_DUTY',
    currentCoordinates: [25.1852, 93.0312],
    phone: '+91 94350 88219',
    radioChannel: 'VHF 143.50 MHz',
    batteryLevel: 88,
    completedAuditsToday: 4,
    activeHazardsMonitored: 3,
  },
  {
    id: 'fo-3',
    name: 'Dr. T. Jamir',
    badge: 'FO-NER-5104',
    role: 'Geotechnical Soil Specialist',
    state: 'Nagaland',
    sector: 'Kohima Bypass Sector 3',
    assignedVillage: 'Dzükou Foothills',
    status: 'EN_ROUTE',
    currentCoordinates: [25.6751, 94.1086],
    phone: '+91 94350 49120',
    radioChannel: 'VHF 141.80 MHz',
    batteryLevel: 79,
    completedAuditsToday: 2,
    activeHazardsMonitored: 1,
  },
  {
    id: 'fo-4',
    name: 'Sapper Rajesh Kalita',
    badge: 'FO-NER-2918',
    role: 'Rapid Disaster Engineer',
    state: 'Meghalaya',
    sector: 'East Khasi Hills Escarpment',
    assignedVillage: 'Mawsynram Slopes',
    status: 'ON_DUTY',
    currentCoordinates: [25.2986, 91.5822],
    phone: '+91 94350 63102',
    radioChannel: 'VHF 144.20 MHz',
    batteryLevel: 91,
    completedAuditsToday: 5,
    activeHazardsMonitored: 4,
  },
  {
    id: 'fo-5',
    name: 'Officer Bimol Thapa',
    badge: 'FO-NER-6029',
    role: 'High-Altitude Hazard Surveyor',
    state: 'Sikkim',
    sector: 'Dzongu Geohazard Zone',
    assignedVillage: 'Mangan Upper Slopes',
    status: 'CONDUCTING_AUDIT',
    currentCoordinates: [27.5028, 88.5284],
    phone: '+91 94350 91823',
    radioChannel: 'VHF 142.90 MHz',
    batteryLevel: 85,
    completedAuditsToday: 3,
    activeHazardsMonitored: 2,
  },
  {
    id: 'fo-6',
    name: 'Sub-Inspector Zothan Mawia',
    badge: 'FO-NER-7712',
    role: 'Village Evacuation Liaison',
    state: 'Mizoram',
    sector: 'Champhai Eastern Border Corridor',
    assignedVillage: 'Zokhawthar Rim',
    status: 'STANDBY',
    currentCoordinates: [23.4725, 93.3278],
    phone: '+91 94350 51928',
    radioChannel: 'VHF 145.10 MHz',
    batteryLevel: 96,
    completedAuditsToday: 1,
    activeHazardsMonitored: 1,
  },
];

export const FieldDeploymentView: React.FC = () => {
  const { t } = useLanguage();
  const [deployments, setDeployments] = useState<OfficerDeployment[]>(INITIAL_DEPLOYMENTS);
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeToast, setActiveToast] = useState<string | null>(null);

  const filteredOfficers = deployments.filter((off) => {
    const matchesState = selectedState === 'ALL' || off.state === selectedState;
    const matchesSearch =
      off.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      off.badge.toLowerCase().includes(searchQuery.toLowerCase()) ||
      off.sector.toLowerCase().includes(searchQuery.toLowerCase()) ||
      off.state.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesState && matchesSearch;
  });

  const handleDispatchOfficer = (officer: OfficerDeployment) => {
    setActiveToast(`Tactical dispatch order sent to ${officer.name} via ${officer.radioChannel}.`);
    setTimeout(() => setActiveToast(null), 4000);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Toast Alert */}
      {activeToast && (
        <div className="bg-slate-900 text-white p-4 rounded-xl shadow-lg flex items-center justify-between gap-3 border border-slate-700 animate-fade-in">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{activeToast}</span>
          </div>
          <button
            onClick={() => setActiveToast(null)}
            className="text-xs text-slate-400 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {t('fieldDeployments', 'Field Deployments & Personnel Command')}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Active Field Officer Roster & Ground Deployments
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time monitoring of deployed field officers, geotechnical engineers, and quick response teams across all 8 North East states.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs font-bold text-slate-700">Total Officers Active</div>
            <div className="text-lg font-black text-emerald-600 font-mono">
              {deployments.filter((d) => d.status !== 'STANDBY').length} / {deployments.length} On Ground
            </div>
          </div>
        </div>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold text-slate-500">Conducting Audits</div>
          <div className="text-2xl font-black text-amber-600 font-mono mt-1">
            {deployments.filter((d) => d.status === 'CONDUCTING_AUDIT').length}
          </div>
          <div className="text-[11px] text-amber-700 font-medium mt-0.5">At physical slide zones</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold text-slate-500">On Patrol Duty</div>
          <div className="text-2xl font-black text-emerald-600 font-mono mt-1">
            {deployments.filter((d) => d.status === 'ON_DUTY').length}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-0.5">Monitoring corridors</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold text-slate-500">Audits Completed Today</div>
          <div className="text-2xl font-black text-indigo-600 font-mono mt-1">
            {deployments.reduce((sum, d) => sum + d.completedAuditsToday, 0)}
          </div>
          <div className="text-[11px] text-indigo-700 font-medium mt-0.5">Verified geohazard reports</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold text-slate-500">Radio Telemetry</div>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">100% Online</div>
          <div className="text-[11px] text-emerald-600 font-bold mt-0.5">VHF & Sat-comm active</div>
        </div>
      </div>

      {/* Search & State Filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search officer name, badge ID, sector, or state..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-transparent border-none focus:outline-none text-slate-800 placeholder-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-lg px-3 py-1.5 focus:outline-none"
          >
            <option value="ALL">All North East States</option>
            <option value="Arunachal Pradesh">Arunachal Pradesh</option>
            <option value="Assam">Assam</option>
            <option value="Meghalaya">Meghalaya</option>
            <option value="Sikkim">Sikkim</option>
            <option value="Nagaland">Nagaland</option>
            <option value="Mizoram">Mizoram</option>
            <option value="Manipur">Manipur</option>
            <option value="Tripura">Tripura</option>
          </select>
        </div>
      </div>

      {/* Officer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOfficers.map((officer) => (
          <div
            key={officer.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3 flex flex-col justify-between hover:border-slate-300 transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[11px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                  {officer.badge}
                </span>
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    officer.status === 'CONDUCTING_AUDIT'
                      ? 'bg-amber-100 text-amber-800'
                      : officer.status === 'ON_DUTY'
                      ? 'bg-emerald-100 text-emerald-800'
                      : officer.status === 'EN_ROUTE'
                      ? 'bg-sky-100 text-sky-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {officer.status.replace('_', ' ')}
                </span>
              </div>

              <h3 className="font-black text-slate-900 text-base">{officer.name}</h3>
              <p className="text-xs font-semibold text-slate-600">{officer.role}</p>

              <div className="mt-3 space-y-1.5 text-xs text-slate-600 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-medium text-slate-800">{officer.sector} ({officer.state})</span>
                </div>
                <div className="text-[11px] text-slate-500 pl-5">
                  Assigned Target: <strong>{officer.assignedVillage}</strong>
                </div>
                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="flex items-center gap-1 text-slate-500">
                    <Radio className="w-3 h-3 text-emerald-600" />
                    <span>{officer.radioChannel}</span>
                  </span>
                  <span className="flex items-center gap-1 text-slate-500">
                    <Battery className="w-3 h-3 text-slate-400" />
                    <span>{officer.batteryLevel}% Bat</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
              <button
                onClick={() => handleDispatchOfficer(officer)}
                className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg shadow-xs cursor-pointer transition-all flex items-center justify-center gap-1"
              >
                <Send className="w-3 h-3" />
                <span>Transmit Order</span>
              </button>
              <a
                href={`tel:${officer.phone}`}
                className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg"
                title="Call Officer"
              >
                <PhoneCall className="w-4 h-4" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
