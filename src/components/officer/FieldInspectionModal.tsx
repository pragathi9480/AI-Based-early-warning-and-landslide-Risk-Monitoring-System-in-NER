import React, { useState } from 'react';
import { X, ShieldAlert, Camera, CheckCircle2, Loader2, Upload } from 'lucide-react';
import { IncidentReport, IncidentSeverity, RoadStatus, FieldInspection } from '../../types';
import { apiService } from '../../services/apiService';

interface FieldInspectionModalProps {
  incident: IncidentReport | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (inspection: FieldInspection) => void;
  isOffline: boolean;
}

export const FieldInspectionModal: React.FC<FieldInspectionModalProps> = ({
  incident,
  isOpen,
  onClose,
  onSuccess,
  isOffline,
}) => {
  if (!isOpen || !incident) return null;

  const [observations, setObservations] = useState<string>(
    'Conducted physical inspection on-site. Debris volume approximately 450 cubic meters. Heavy slope tension cracks visible 30 meters above road level. Two stranded vehicles evacuated.'
  );
  const [riskSeverity, setRiskSeverity] = useState<IncidentSeverity>(incident.severity || 'High');
  const [roadCondition, setRoadCondition] = useState<RoadStatus>(incident.roadCondition || 'BLOCKED');
  const [recommendedAction, setRecommendedAction] = useState<string>(
    'Deploy heavy excavator unit immediately; maintain 24h total road closure; divert traffic via State Highway 15.'
  );
  const [photos, setPhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=600&auto=format&fit=crop&q=80',
  ]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const inspectionData = {
        incidentId: incident.id,
        officerId: 'FO-NER-4092',
        officerName: 'Arjun Singh',
        observations,
        riskSeverity,
        roadCondition,
        photos,
        recommendedAction,
        isOfflineSubmitted: isOffline,
      };

      const result = await apiService.submitInspection(inspectionData);

      // Also update incident status to Confirmed
      await apiService.updateIncident(
        incident.id,
        {
          status: 'Confirmed',
          severity: riskSeverity,
          roadCondition,
        },
        'Arjun Singh (Field Officer)'
      );

      onSuccess(result);
      onClose();
    } catch (err: any) {
      alert(`Failed to submit inspection: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="font-bold text-sm">Conduct Field Inspection</h2>
              <p className="text-[11px] text-slate-400">
                Official Report #{incident.reportNumber} • {incident.type}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-full"
            aria-label="Close inspection modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Offline Badge notice */}
        {isOffline && (
          <div className="bg-amber-100 border-b border-amber-200 px-4 py-2 text-xs text-amber-900 font-semibold">
            ⚡ OFFLINE MODE: Inspection will be saved locally and queued for automatic cloud sync.
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Incident Summary Card */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
            <div className="font-bold text-slate-800">{incident.title}</div>
            <div className="text-slate-500">
              📍 {incident.locationName} ({incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)})
            </div>
            <div className="text-slate-600">Citizen Observation: "{incident.description}"</div>
          </div>

          {/* Observations */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Field Officer Geological & Hazard Observations
            </label>
            <textarea
              required
              rows={3}
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Describe slope condition, rock fracture type, debris volume, water seepage..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Severity and Road Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Verified Hazard Severity</label>
              <select
                value={riskSeverity}
                onChange={(e) => setRiskSeverity(e.target.value as IncidentSeverity)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white font-bold"
              >
                <option value="Critical">Critical (Immediate danger, total slide)</option>
                <option value="High">High (Major debris, tension cracks)</option>
                <option value="Moderate">Moderate (Partial slide, minor rockfall)</option>
                <option value="Low">Low (Superficial soil movement)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Impacted Road Status</label>
              <select
                value={roadCondition}
                onChange={(e) => setRoadCondition(e.target.value as RoadStatus)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white font-bold"
              >
                <option value="BLOCKED">🔴 BLOCKED - Complete closure</option>
                <option value="AVOID">⚫ AVOID - Dangerous instability</option>
                <option value="CAUTION">🟡 CAUTION - One-way / debris on shoulder</option>
                <option value="SAFE">🟢 SAFE - Cleared for all vehicles</option>
              </select>
            </div>
          </div>

          {/* Recommended Actions */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Recommended Response Directive</label>
            <input
              type="text"
              required
              value={recommendedAction}
              onChange={(e) => setRecommendedAction(e.target.value)}
              placeholder="e.g. Deploy 2 earthmovers, install safety netting, warn downhill hamlet"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Inspection Photos */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Inspection Proof Photos</label>
            <div className="flex gap-2 items-center">
              {photos.map((p, i) => (
                <img key={i} src={p} alt="inspection" className="w-16 h-16 rounded-lg object-cover border" />
              ))}
              <label className="w-16 h-16 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:border-amber-500 bg-slate-50 text-[10px] text-slate-500">
                <Camera className="w-4 h-4 text-slate-400 mb-0.5" />
                <span>Add</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      const reader = new FileReader();
                      reader.onload = () => setPhotos((prev) => [...prev, reader.result as string]);
                      reader.readAsDataURL(f);
                    }
                  }}
                />
              </label>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Inspection...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Inspection & Update Incident</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
