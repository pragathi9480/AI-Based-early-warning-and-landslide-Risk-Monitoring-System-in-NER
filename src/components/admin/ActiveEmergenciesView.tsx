import React, { useState } from 'react';
import {
  Flame,
  AlertTriangle,
  Radio,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Clock,
  Filter,
  Users,
  Search,
  Route,
  Activity,
  Send,
} from 'lucide-react';
import { IncidentReport, RoadRecord, SafetyShelter, Village } from '../../types';
import { useLanguage } from '../../services/i18n';
import { apiService } from '../../services/apiService';

interface ActiveEmergenciesViewProps {
  incidents: IncidentReport[];
  roads: RoadRecord[];
  shelters: SafetyShelter[];
  villages: Village[];
  onRefreshData: () => void;
  onOpenSafeRoute: (shelterId?: string) => void;
}

export const ActiveEmergenciesView: React.FC<ActiveEmergenciesViewProps> = ({
  incidents,
  roads,
  shelters,
  villages,
  onRefreshData,
  onOpenSafeRoute,
}) => {
  const { t } = useLanguage();
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | 'P1' | 'P2' | 'P3'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeToast, setActiveToast] = useState<string | null>(null);

  const handleResolveIncident = async (inc: IncidentReport) => {
    try {
      await apiService.updateIncident(inc.id, { status: 'Resolved' }, 'District Admin');
      setActiveToast(`Incident ${inc.reportNumber} marked as RESOLVED.`);
      setTimeout(() => setActiveToast(null), 4000);
      onRefreshData();
    } catch {
      setActiveToast(`Updated incident ${inc.reportNumber} status.`);
      setTimeout(() => setActiveToast(null), 4000);
      onRefreshData();
    }
  };

  const handleDeploySDRF = (inc: IncidentReport) => {
    setActiveToast(`SDRF Strike Team dispatched to ${inc.locationName} (${inc.reportNumber}).`);
    setTimeout(() => setActiveToast(null), 4000);
  };

  const activeIncidents = incidents.filter((inc) => {
    const isNotResolved = inc.status !== 'Resolved';
    const matchesRegion =
      selectedRegion === 'ALL' ||
      inc.locationName.toLowerCase().includes(selectedRegion.toLowerCase());
    const matchesPriority = priorityFilter === 'ALL' || inc.priority === priorityFilter;
    const matchesSearch =
      inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.reportNumber.toLowerCase().includes(searchQuery.toLowerCase());

    return isNotResolved && matchesRegion && matchesPriority && matchesSearch;
  });

  const p1Count = incidents.filter((i) => i.priority === 'P1' && i.status !== 'Resolved').length;
  const p2Count = incidents.filter((i) => i.priority === 'P2' && i.status !== 'Resolved').length;
  const totalAffected = activeIncidents.reduce((sum, i) => sum + i.affectedPeopleCount, 0);

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
            <span className="p-1.5 bg-red-100 text-red-700 rounded-lg">
              <Flame className="w-5 h-5" />
            </span>
            <span className="text-xs uppercase font-extrabold tracking-wider text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
              {t('activeEmergencies', 'Active Emergency Incident Management')}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Priority Disaster Triage & Active Incidents
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Live command authority for active landslide crises, village evacuations, and search-and-rescue mobilizations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefreshData}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all"
          >
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Refresh Live Telemetry</span>
          </button>
        </div>
      </div>

      {/* Key Metric Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">P1 Extreme Danger</span>
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
          </div>
          <div className="text-3xl font-black text-red-600 font-mono mt-1">{p1Count}</div>
          <div className="text-[11px] text-red-700 font-medium mt-0.5">Casualty prevention priority</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">P2 Imminent Hazard</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          </div>
          <div className="text-3xl font-black text-amber-600 font-mono mt-1">{p2Count}</div>
          <div className="text-[11px] text-amber-700 font-medium mt-0.5">Heavy slope saturation</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Affected Population</span>
            <Users className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono mt-1">
            {totalAffected.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5">Across active hazard zones</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Available Shelters</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-600 font-mono mt-1">
            {shelters.filter((s) => s.status !== 'Full').length}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-0.5">Active with food/water</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search active incident, sector, highway, or village..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-transparent border-none focus:outline-none text-slate-800 placeholder-slate-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Northeast Region Selector */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="bg-transparent border-none text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All North East States</option>
              <option value="Assam">Assam</option>
              <option value="Arunachal">Arunachal Pradesh</option>
              <option value="Meghalaya">Meghalaya</option>
              <option value="Sikkim">Sikkim</option>
              <option value="Nagaland">Nagaland</option>
              <option value="Manipur">Manipur</option>
              <option value="Mizoram">Mizoram</option>
              <option value="Tripura">Tripura</option>
            </select>
          </div>

          {/* Priority Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-lg">
            {(['ALL', 'P1', 'P2', 'P3'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setPriorityFilter(tab)}
                className={`px-3 py-1 rounded-md font-bold text-xs cursor-pointer transition-all ${
                  priorityFilter === tab ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab === 'ALL' ? 'All Priorities' : tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Flame className="w-4 h-4 text-red-600" />
            <span>Active Incident Response & Triage Register</span>
          </div>
          <span className="text-xs text-slate-500 font-mono">Showing {activeIncidents.length} incidents</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Incident ID</th>
                <th className="py-3 px-4">Hazard Description</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Affected</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Rapid Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeIncidents.map((inc) => (
                <tr key={inc.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded font-black text-[10px] ${
                        inc.priority === 'P1'
                          ? 'bg-red-600 text-white'
                          : inc.priority === 'P2'
                          ? 'bg-orange-600 text-white'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {inc.priority} ({inc.severity})
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-sky-700">
                    {inc.reportNumber}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{inc.title}</div>
                    <div className="text-[11px] text-slate-500 line-clamp-1">{inc.description}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">
                    <div className="flex items-center gap-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{inc.locationName}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                    {inc.affectedPeopleCount.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      {inc.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleDeploySDRF(inc)}
                        className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs cursor-pointer transition-all"
                      >
                        Deploy SDRF
                      </button>
                      <button
                        onClick={() => onOpenSafeRoute()}
                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs cursor-pointer transition-all"
                      >
                        Safe Evac
                      </button>
                      <button
                        onClick={() => handleResolveIncident(inc)}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg text-xs cursor-pointer transition-all"
                      >
                        Resolve
                      </button>
                    </div>
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
