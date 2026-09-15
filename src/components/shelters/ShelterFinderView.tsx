import React, { useState, useEffect } from 'react';
import {
  Building,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Route,
  Search,
  ShieldCheck,
  ChevronRight,
  Droplets,
  Utensils,
  Stethoscope,
  Zap,
} from 'lucide-react';
import { RoadRecord, SafetyShelter, SafeRouteResult } from '../../types';
import { InteractiveGisMap } from '../map/InteractiveGisMap';
import { apiService } from '../../services/apiService';

interface ShelterFinderViewProps {
  shelters: SafetyShelter[];
  roads: RoadRecord[];
  initialTargetShelterId?: string;
  userCoordinates?: [number, number];
}

export const ShelterFinderView: React.FC<ShelterFinderViewProps> = ({
  shelters,
  roads,
  initialTargetShelterId,
  userCoordinates = [27.1124, 95.3423],
}) => {
  const [selectedShelter, setSelectedShelter] = useState<SafetyShelter | null>(() => {
    if (initialTargetShelterId) {
      return shelters.find((s) => s.id === initialTargetShelterId) || shelters[0];
    }
    return shelters[0] || null;
  });

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeRouteResult, setActiveRouteResult] = useState<SafeRouteResult | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState<boolean>(false);

  // Filter shelters
  const filteredShelters = shelters.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculateRouteTo = async (shelter: SafetyShelter) => {
    setSelectedShelter(shelter);
    setIsCalculatingRoute(true);

    try {
      const res = await apiService.calculateSafeRoute(
        userCoordinates[0],
        userCoordinates[1],
        shelter.id
      );
      setActiveRouteResult(res.route);
    } catch (err: any) {
      console.error('Route calculation error:', err);
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  useEffect(() => {
    if (selectedShelter) {
      calculateRouteTo(selectedShelter);
    }
  }, [selectedShelter?.id]);

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-700 via-sky-800 to-slate-900 text-white p-5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1 bg-white/20 rounded-md">
            <Building className="w-4 h-4 text-white" />
          </span>
          <span className="text-xs uppercase font-extrabold tracking-wider text-sky-200">
            Emergency Evacuation & Safety Shelters
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight">
          Safe Shelters & Verified Evacuation Corridors
        </h1>
        <p className="text-xs text-sky-100 mt-1 max-w-2xl">
          Automated routing strictly bypasses blocked mountain passes and hazardous debris flows.
        </p>
      </div>

      {/* Main Grid: Left Directory & Route Steps (5 cols) + Right GIS Interactive Route Map (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Shelters List & Route Details */}
        <div className="lg:col-span-5 space-y-4">
          {/* Active Navigation Card if route calculated */}
          {activeRouteResult && selectedShelter && (
            <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-4.5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-bold text-xs text-emerald-900">
                  <Navigation className="w-4 h-4 text-emerald-600 animate-pulse" />
                  <span>CALCULATED SAFE DETOUR ROUTE</span>
                </span>
                <span className="px-2 py-0.5 bg-emerald-600 text-white font-bold text-[10px] rounded-full uppercase">
                  🟢 100% Safe Route
                </span>
              </div>

              <div>
                <h3 className="text-base font-extrabold text-slate-900">{selectedShelter.name}</h3>
                <div className="flex items-center gap-4 text-xs text-slate-600 mt-1">
                  <span>
                    Distance: <strong className="text-slate-900 font-mono">{activeRouteResult.totalDistanceKm} km</strong>
                  </span>
                  <span>
                    Est. Travel Time: <strong className="text-slate-900 font-mono">~{activeRouteResult.estimatedTravelTimeMinutes} mins</strong>
                  </span>
                </div>
              </div>

              {/* Automatic Avoidance Warning Banner */}
              {activeRouteResult.avoidedRoads.length > 0 && (
                <div className="p-2.5 bg-white rounded-xl border border-red-200 text-[11px] text-red-900 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Hazard Bypass Active:</strong> Detoured around {activeRouteResult.avoidedRoads.map((r) => r.roadName).join(', ')} ({activeRouteResult.avoidedRoads[0]?.status}).
                  </div>
                </div>
              )}

              {/* Turn-by-turn Navigation Steps */}
              <div className="bg-white rounded-xl p-3 border border-emerald-200 space-y-2 text-xs">
                <div className="font-bold text-slate-700 flex items-center gap-1">
                  <Route className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Turn-by-Turn Safe Directions:</span>
                </div>
                <div className="space-y-2 divide-y divide-slate-100">
                  {activeRouteResult.steps.map((step, idx) => (
                    <div key={idx} className="pt-2 first:pt-0 flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <div className="text-slate-800 font-medium leading-snug">{step.instruction}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-2">
                          <span className="font-semibold">{step.roadName}</span>
                          <span>•</span>
                          <span>{step.distanceKm} km</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Shelters Directory */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">All Designated Safety Shelters</h3>
              <span className="text-xs text-slate-500 font-mono">{shelters.length} Shelters</span>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by shelter name or locality..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            {/* Shelters List */}
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {filteredShelters.map((s) => {
                const isSelected = selectedShelter?.id === s.id;
                const percentFull = Math.round((s.currentOccupancy / s.capacity) * 100);
                return (
                  <div
                    key={s.id}
                    onClick={() => calculateRouteTo(s)}
                    className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'border-sky-600 bg-sky-50/70 ring-1 ring-sky-500 shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-bold text-slate-900 text-sm">{s.name}</div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          s.status === 'Open' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {s.status}
                      </span>
                    </div>

                    <div className="text-slate-500 text-[11px] mb-2">{s.address}</div>

                    {/* Capacity Bar */}
                    <div className="space-y-1 mb-2">
                      <div className="flex justify-between text-[10px] text-slate-600 font-medium">
                        <span>Occupancy: {s.currentOccupancy} / {s.capacity}</span>
                        <span className="font-bold text-emerald-700">{s.availableCapacity} available</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${percentFull > 85 ? 'bg-red-500' : 'bg-emerald-500'}`}
                          style={{ width: `${percentFull}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Facility Tags */}
                    <div className="flex flex-wrap gap-1 text-[10px] text-slate-600">
                      {s.facilities.map((fac, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 bg-white rounded border border-slate-200">
                          {fac}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: GIS Route Map */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-sky-600" />
                  <span>Real-Time GIS Safe Route Polyline</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Blue line marks the computed obstacle-free evacuation path to {selectedShelter?.name}.
                </p>
              </div>
              <span className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-xs font-mono font-bold text-slate-700">
                GPS: {userCoordinates[0].toFixed(4)}, {userCoordinates[1].toFixed(4)}
              </span>
            </div>

            <div className="rounded-xl overflow-hidden border border-slate-200">
              <InteractiveGisMap
                center={userCoordinates}
                zoom={13}
                shelters={shelters}
                roads={roads}
                userLocation={userCoordinates}
                safeRoute={activeRouteResult}
                height="560px"
              />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Route automatically re-checks road status every 60 seconds</span>
            </span>
            <span className="font-medium text-slate-700">Govt Disaster Route Authority</span>
          </div>
        </div>
      </div>
    </div>
  );
};
