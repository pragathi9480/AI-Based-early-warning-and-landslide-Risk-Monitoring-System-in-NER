import React, { useState } from 'react';
import {
  Route,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Edit,
  SlidersHorizontal,
  Search,
} from 'lucide-react';
import { RoadRecord, RoadStatus, User } from '../../types';
import { InteractiveGisMap } from '../map/InteractiveGisMap';
import { apiService } from '../../services/apiService';

interface RoadManagementViewProps {
  roads: RoadRecord[];
  currentUser: User | null;
  onRefreshData: () => void;
}

export const RoadManagementView: React.FC<RoadManagementViewProps> = ({
  roads,
  currentUser,
  onRefreshData,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingRoad, setEditingRoad] = useState<RoadRecord | null>(null);
  const [newStatus, setNewStatus] = useState<RoadStatus>('BLOCKED');
  const [newReason, setNewReason] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const filteredRoads = roads.filter((r) => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (searchQuery && !r.name.toLowerCase().includes(searchQuery.toLowerCase()) && !r.code.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const handleOpenEdit = (road: RoadRecord) => {
    setEditingRoad(road);
    setNewStatus(road.status);
    setNewReason(road.reason);
  };

  const handleSaveRoadUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoad) return;

    setIsUpdating(true);
    try {
      await apiService.updateRoadStatus(
        editingRoad.id,
        newStatus,
        newReason.trim() || 'Status updated during on-ground inspection',
        currentUser?.name || 'Field Officer Arjun Singh'
      );
      setEditingRoad(null);
      onRefreshData();
    } catch (err: any) {
      alert(`Failed to update road status: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1 bg-white/20 rounded-md">
            <Route className="w-4 h-4 text-emerald-400" />
          </span>
          <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-300">
            Road Network & Evacuation Corridors
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight">
          Safe Road & Pass Monitoring System
        </h1>
        <p className="text-xs text-slate-300 mt-1 max-w-2xl">
          Real-time highway and pass statuses. Roads marked BLOCKED or AVOID are strictly filtered out of the emergency routing engine.
        </p>
      </div>

      {/* Main Grid: Left Road Directory (5 cols) + Right GIS Road Status Map (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Road List */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Monitored Mountain Corridors</h3>
            <span className="text-xs text-slate-500 font-mono">{roads.length} Corridors</span>
          </div>

          {/* Filters */}
          <div className="flex gap-1 text-[11px] overflow-x-auto pb-1">
            {['ALL', 'SAFE', 'CAUTION', 'BLOCKED', 'AVOID'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by road name or code..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          {/* Road Items */}
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {filteredRoads.map((road) => {
              let badgeColor = 'bg-emerald-100 text-emerald-800';
              if (road.status === 'BLOCKED') badgeColor = 'bg-red-100 text-red-800';
              if (road.status === 'CAUTION') badgeColor = 'bg-amber-100 text-amber-800';
              if (road.status === 'AVOID') badgeColor = 'bg-slate-200 text-slate-800';

              return (
                <div
                  key={road.id}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 transition-all text-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <span className="font-bold text-slate-900 text-sm">{road.name}</span>
                      <span className="font-mono text-slate-400 text-[11px] ml-1.5">({road.code})</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded font-black text-[10px] ${badgeColor}`}>
                      {road.status}
                    </span>
                  </div>

                  <p className="text-slate-600 text-[11px] mb-2 leading-relaxed">
                    <strong>Condition:</strong> {road.reason}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-100 pt-2">
                    <span>Length: <strong>{road.lengthKm} km</strong></span>
                    <span>Updated: {road.updatedAt} by {road.lastUpdatedBy}</span>
                  </div>

                  {/* Officer / Admin Update Action */}
                  <div className="mt-2.5 flex justify-end">
                    <button
                      onClick={() => handleOpenEdit(road)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg flex items-center gap-1"
                    >
                      <Edit className="w-3 h-3 text-slate-500" />
                      <span>Update Road Condition</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: GIS Road Network Map */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Route className="w-4 h-4 text-emerald-600" />
                  <span>Road Network GIS Overlay</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Green = Safe, Amber = Caution, Red = Blocked, Slate = Avoid.
                </p>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden border border-slate-200">
              <InteractiveGisMap
                center={[27.1124, 95.3423]}
                zoom={12}
                roads={roads}
                height="540px"
              />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Any status update triggers immediate routing recalculation for active citizens</span>
            <span className="font-semibold text-slate-700">Border Roads Org / State PWD</span>
          </div>
        </div>
      </div>

      {/* Edit Road Status Modal */}
      {editingRoad && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base mb-1">
              Update Road Status: {editingRoad.name}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Authorized updates immediately change GIS color codes and detour navigation.
            </p>

            <form onSubmit={handleSaveRoadUpdate} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Current Condition Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as RoadStatus)}
                  className="w-full px-3 py-2 border rounded-lg font-bold bg-white"
                >
                  <option value="SAFE">🟢 SAFE - Open without restrictions</option>
                  <option value="CAUTION">🟡 CAUTION - One-lane / minor debris</option>
                  <option value="BLOCKED">🔴 BLOCKED - Complete slide / impassable</option>
                  <option value="AVOID">⚫ AVOID - Structural danger / rockfall</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason / Description</label>
                <textarea
                  rows={3}
                  required
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  placeholder="e.g. 500m slide debris cleared; lane open with caution."
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingRoad(null)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 bg-slate-900 hover:bg-black text-white font-bold rounded-lg disabled:opacity-50"
                >
                  {isUpdating ? 'Saving...' : 'Save & Publish Road Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
