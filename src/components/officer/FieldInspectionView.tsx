import React, { useState } from 'react';
import {
  SlidersHorizontal,
  Camera,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Clock,
  Search,
  Filter,
  Layers,
  Activity,
  FileCheck,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { IncidentReport, User } from '../../types';
import { useLanguage } from '../../services/i18n';
import { FieldInspectionModal } from './FieldInspectionModal';

interface FieldInspectionViewProps {
  incidents: IncidentReport[];
  currentUser: User | null;
  onRefreshData: () => void;
  onOpenSafeRoute: (shelterId?: string) => void;
}

export const FieldInspectionView: React.FC<FieldInspectionViewProps> = ({
  incidents,
  currentUser,
  onRefreshData,
  onOpenSafeRoute,
}) => {
  const { t } = useLanguage();
  const [selectedIncident, setSelectedIncident] = useState<IncidentReport | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'VERIFIED' | 'CRITICAL'>('ALL');
  const [stateFilter, setStateFilter] = useState<string>('ALL');

  const filteredIncidents = incidents.filter((inc) => {
    const matchesSearch =
      inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.reportNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL'
        ? true
        : statusFilter === 'PENDING'
        ? inc.status === 'Reported' || inc.status === 'Under Verification'
        : statusFilter === 'VERIFIED'
        ? inc.status === 'Confirmed' || inc.status === 'Resolved'
        : inc.severity === 'Critical';

    const matchesState =
      stateFilter === 'ALL' ? true : inc.locationName.toLowerCase().includes(stateFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesState;
  });

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-amber-100 text-amber-800 rounded-lg">
              <SlidersHorizontal className="w-5 h-5" />
            </span>
            <span className="text-xs uppercase font-extrabold tracking-wider text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              {t('fieldInspection', 'Field Inspection Operations')}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Geological & Ground Hazard Inspection Roster
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Perform physical slope stability audits, crack aperture measurements, and verify citizen landslide reports.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-slate-700">Inspector on Duty</div>
            <div className="text-xs text-emerald-600 font-semibold">{currentUser?.name || 'Officer Arjun Singh'} (FO-4092)</div>
          </div>
          <button
            onClick={() => setSelectedIncident(incidents[0] || null)}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all"
          >
            <Camera className="w-4 h-4" />
            <span>New Ground Inspection</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold text-slate-500">Inspections Pending</div>
          <div className="text-2xl font-black text-amber-600 font-mono mt-1">
            {incidents.filter((i) => i.status === 'Reported' || i.status === 'Under Verification').length}
          </div>
          <div className="text-[11px] text-amber-700 font-medium mt-0.5">Need immediate ground audit</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold text-slate-500">Verified & Confirmed</div>
          <div className="text-2xl font-black text-emerald-600 font-mono mt-1">
            {incidents.filter((i) => i.status === 'Confirmed' || i.status === 'Resolved').length}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-0.5">Signed off with geo-audit</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold text-slate-500">Critical Slope Risks</div>
          <div className="text-2xl font-black text-red-600 font-mono mt-1">
            {incidents.filter((i) => i.severity === 'Critical').length}
          </div>
          <div className="text-[11px] text-red-700 font-medium mt-0.5">Imminent slope failure</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold text-slate-500">Geotechnical Sensors</div>
          <div className="text-2xl font-black text-indigo-600 font-mono mt-1">18 / 18</div>
          <div className="text-[11px] text-indigo-700 font-medium mt-0.5">Inclinometers streaming</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search report number, village, or highway..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-transparent border-none focus:outline-none text-slate-800 placeholder-slate-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* State Filter */}
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 font-medium rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="ALL">All Northeast States</option>
            <option value="Assam">Assam</option>
            <option value="Arunachal">Arunachal Pradesh</option>
            <option value="Meghalaya">Meghalaya</option>
            <option value="Sikkim">Sikkim</option>
            <option value="Nagaland">Nagaland</option>
            <option value="Manipur">Manipur</option>
            <option value="Mizoram">Mizoram</option>
            <option value="Tripura">Tripura</option>
          </select>

          {/* Status Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-lg">
            {(['ALL', 'PENDING', 'VERIFIED', 'CRITICAL'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1 rounded-md font-bold text-xs cursor-pointer transition-all ${
                  statusFilter === tab ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Inspection List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-600" />
            <span>Inspection Schedule & Geotechnical Audit Log</span>
          </div>
          <span className="text-xs text-slate-500 font-mono">Showing {filteredIncidents.length} locations</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <th className="py-3 px-4">Report Code</th>
                <th className="py-3 px-4">Hazard & Title</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Slope / Sensor Data</th>
                <th className="py-3 px-4">Audit Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredIncidents.map((inc) => {
                const isCritical = inc.severity === 'Critical';
                const hasInspection = inc.inspections && inc.inspections.length > 0;
                return (
                  <tr key={inc.id} className="hover:bg-slate-50/80 transition-colors">
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
                      <span className="text-[10px] text-slate-400 font-mono">
                        {inc.latitude.toFixed(3)}°N, {inc.longitude.toFixed(3)}°E
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded font-black text-[10px] ${
                          isCritical
                            ? 'bg-red-600 text-white'
                            : inc.severity === 'High'
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {inc.severity}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-[11px] space-y-0.5">
                        <div className="text-slate-600">
                          Moisture: <strong className="text-slate-800">74%</strong>
                        </div>
                        <div className="text-slate-500">
                          Slope: <strong className="text-slate-700">38° ~ 46°</strong>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {hasInspection ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Audited</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <Clock className="w-3 h-3" />
                          <span>Inspection Pending</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedIncident(inc)}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs shadow-2xs flex items-center gap-1 cursor-pointer transition-all"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Conduct Audit</span>
                        </button>
                        <button
                          onClick={() => onOpenSafeRoute()}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs cursor-pointer"
                        >
                          Route
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

      {/* Field Inspection Modal */}
      {selectedIncident && (
        <FieldInspectionModal
          incident={selectedIncident}
          isOpen={Boolean(selectedIncident)}
          onClose={() => setSelectedIncident(null)}
          isOffline={false}
          onSuccess={() => {
            setSelectedIncident(null);
            onRefreshData();
          }}
        />
      )}
    </div>
  );
};
