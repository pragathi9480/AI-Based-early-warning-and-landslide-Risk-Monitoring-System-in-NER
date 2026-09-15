import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Camera,
  MapPin,
  CheckCircle2,
  Upload,
  ArrowRight,
  ArrowLeft,
  Flame,
  ShieldAlert,
  Loader2,
  Navigation,
  FileCheck,
  Building,
} from 'lucide-react';
import { IncidentReport, IncidentType, IncidentSeverity, User, SafeRouteResult, SafetyShelter } from '../../types';
import { InteractiveGisMap } from '../map/InteractiveGisMap';
import { apiService } from '../../services/apiService';

interface EmergencyReportWizardProps {
  currentUser: User | null;
  onFinished: () => void;
  onNavigateToSafeRoute: (shelterId?: string) => void;
}

const INCIDENT_TYPES: { type: IncidentType; label: string; icon: string; desc: string }[] = [
  { type: 'Landslide', label: 'Landslide', icon: '⛰️', desc: 'Mass soil / rock displacement blocking area' },
  { type: 'Road Blockage', label: 'Road Blockage', icon: '🚧', desc: 'Debris or fallen trees making road impassable' },
  { type: 'Slope Crack', label: 'Slope Crack', icon: '⚡', desc: 'Deep ground fissures or retaining wall cracks' },
  { type: 'Falling Rocks', label: 'Falling Rocks', icon: '🪨', desc: 'Active rockfall or sliding boulders' },
  { type: 'Slope Movement', label: 'Slope Movement', icon: '🌊', desc: 'Creeping hill slope, shifting electric poles' },
  { type: 'Flash Flood', label: 'Flash Flood / Mudflow', icon: '🌧️', desc: 'Mud torrents rushing down ravine' },
  { type: 'Infrastructure Damage', label: 'Bridge / Culvert Damage', icon: '🌉', desc: 'Damaged mountain bridge or culvert' },
  { type: 'Other', label: 'Other Hazard', icon: '⚠️', desc: 'Other impending geological hazard' },
];

export const EmergencyReportWizard: React.FC<EmergencyReportWizardProps> = ({
  currentUser,
  onFinished,
  onNavigateToSafeRoute,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedType, setSelectedType] = useState<IncidentType>('Landslide');
  const [mediaList, setMediaList] = useState<{ id: string; url: string; type: 'photo' | 'video'; filename: string }[]>([
    {
      id: 'pre-1',
      url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=600&auto=format&fit=crop&q=80',
      type: 'photo',
      filename: 'rockfall_debris.jpg',
    },
  ]);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Location
  const [latitude, setLatitude] = useState<number>(27.1124);
  const [longitude, setLongitude] = useState<number>(95.3423);
  const [locationName, setLocationName] = useState<string>('Longding - Pongchau Highway Sector');
  const [district, setDistrict] = useState<string>('Longding');
  const [isCapturingGps, setIsCapturingGps] = useState<boolean>(false);
  const [gpsAccuracy, setGpsAccuracy] = useState<string>('High Precision GPS');

  // Details
  const [title, setTitle] = useState<string>('Massive Landslide on Longding Hill Pass');
  const [description, setDescription] = useState<string>(
    'Heavy debris and boulders blocking both highway lanes after continuous torrential rainfall. Three passenger vehicles stranded on the slope.'
  );
  const [severity, setSeverity] = useState<IncidentSeverity>('Critical');
  const [affectedPeople, setAffectedPeople] = useState<number>(25);
  const [reporterName, setReporterName] = useState<string>(currentUser?.name || 'Priya Sharma');
  const [reporterPhone, setReporterPhone] = useState<string>(currentUser?.phone || '+91 98765 43210');

  // Submission result
  const [submittedReport, setSubmittedReport] = useState<IncidentReport | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Auto-fetch browser GPS on step 3 entry
  useEffect(() => {
    if (currentStep === 3 && navigator.geolocation) {
      handleCaptureCurrentGps();
    }
  }, [currentStep]);

  const handleCaptureCurrentGps = () => {
    setIsCapturingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setGpsAccuracy(`GPS Accuracy ±${Math.round(pos.coords.accuracy)}m`);
        setIsCapturingGps(false);
      },
      (err) => {
        console.warn('Geolocation denied or unavailable, using North East Regional coordinates:', err.message);
        setGpsAccuracy('NER Regional Coordinates Active');
        setIsCapturingGps(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const file = files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const isVideo = file.type.startsWith('video');
      setMediaList((prev) => [
        ...prev,
        {
          id: `upload-${Date.now()}`,
          url: result,
          type: isVideo ? 'video' : 'photo',
          filename: file.name,
        },
      ]);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitReport = async () => {
    setIsSubmitting(true);
    try {
      const report = await apiService.reportEmergency({
        type: selectedType,
        title: title.trim() || `${selectedType} reported near ${locationName}`,
        description: description.trim(),
        latitude,
        longitude,
        locationName,
        district,
        state: 'Arunachal Pradesh',
        severity,
        affectedPeopleCount: Number(affectedPeople) || 5,
        reporterName: reporterName || 'Anonymous Citizen',
        reporterPhone: reporterPhone || '',
        reporterRole: currentUser?.role || 'citizen',
        media: mediaList.map((m) => ({
          id: m.id,
          url: m.url,
          type: m.type,
          timestamp: new Date().toISOString(),
          caption: m.filename,
        })),
        roadCondition: selectedType === 'Road Blockage' || selectedType === 'Landslide' ? 'BLOCKED' : 'CAUTION',
      });

      setSubmittedReport(report);
      setCurrentStep(5);
    } catch (err: any) {
      alert(`Submission error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {/* Wizard Header Banner */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white rounded-2xl p-5 mb-6 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 bg-white/20 rounded-lg">
                <Flame className="w-5 h-5 text-white animate-bounce" />
              </span>
              <span className="text-xs uppercase font-bold tracking-widest bg-red-800/60 px-2 py-0.5 rounded">
                Emergency Reporting Protocol
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">Report Disaster Incident</h1>
            <p className="text-xs text-red-100 mt-1">
              Your report immediately alerts Field Officers and the District Disaster Command Center.
            </p>
          </div>
          <div className="hidden sm:block text-right">
            <span className="text-xs font-semibold text-red-200">Emergency Helpline</span>
            <div className="text-lg font-black text-white font-mono">1077 / 112</div>
          </div>
        </div>

        {/* Stepper Progress Bar */}
        <div className="mt-5 grid grid-cols-5 gap-2 text-center text-xs font-semibold">
          {[
            { step: 1, label: '1. Incident Type' },
            { step: 2, label: '2. Evidence' },
            { step: 3, label: '3. Location' },
            { step: 4, label: '4. Details' },
            { step: 5, label: '5. Submitted' },
          ].map((s) => (
            <div
              key={s.step}
              className={`py-1.5 px-1 rounded-md text-[11px] font-bold transition-all ${
                currentStep === s.step
                  ? 'bg-white text-red-700 shadow-xs'
                  : currentStep > s.step
                  ? 'bg-red-800/60 text-red-200'
                  : 'bg-red-900/40 text-red-300 opacity-60'
              }`}
            >
              {s.label}
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1: Select Incident Type */}
      {currentStep === 1 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 mb-2">Step 1: Select Incident Type</h2>
          <p className="text-xs text-slate-500 mb-6">
            Choose the category that best describes the geological hazard or emergency on-site.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {INCIDENT_TYPES.map((item) => (
              <button
                key={item.type}
                onClick={() => setSelectedType(item.type)}
                className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  selectedType === item.type
                    ? 'border-red-600 bg-red-50/70 ring-2 ring-red-500/20 shadow-xs'
                    : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-100/60'
                }`}
              >
                <div>
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <h3 className="font-bold text-slate-900 text-sm">{item.label}</h3>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">{item.desc}</p>
                </div>
                {selectedType === item.type && (
                  <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-red-600">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Selected</span>
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2"
            >
              <span>Next: Upload Evidence</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Upload Evidence */}
      {currentStep === 2 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 mb-2">Step 2: Upload Photos / Videos</h2>
          <p className="text-xs text-slate-500 mb-6">
            Visual proof allows field officers and geologists to assess rock volume, slope gradient, and required rescue equipment.
          </p>

          {/* Drag & Drop Upload Box */}
          <label className="border-2 border-dashed border-slate-300 hover:border-red-500 bg-slate-50 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors text-center">
            <Upload className="w-10 h-10 text-slate-400 mb-3" />
            <div className="text-sm font-bold text-slate-800">Click or Drag photos/videos to upload</div>
            <p className="text-xs text-slate-500 mt-1">Supports JPG, PNG, WEBP, MP4 (Max 25MB)</p>
            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>

          {/* Uploaded Evidence Gallery */}
          <div className="mt-6">
            <h4 className="text-xs font-bold text-slate-700 mb-3 flex items-center justify-between">
              <span>Attached Evidence ({mediaList.length} files)</span>
              {isUploading && (
                <span className="text-sky-600 flex items-center gap-1">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing upload...</span>
                </span>
              )}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {mediaList.map((item, idx) => (
                <div key={item.id} className="relative rounded-xl overflow-hidden border border-slate-200 group">
                  <img src={item.url} alt={item.filename} className="w-full h-28 object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => setMediaList((prev) => prev.filter((_, i) => i !== idx))}
                      className="px-2 py-1 bg-red-600 text-white text-[10px] font-bold rounded"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="p-1.5 bg-white text-[10px] text-slate-600 truncate">
                    {item.filename}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex justify-between">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2"
            >
              <span>Next: Confirm Location</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Location Selection */}
      {currentStep === 3 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Step 3: Geolocation Coordinates</h2>
              <p className="text-xs text-slate-500">
                Click anywhere on the map or drag the pin to precisely point to the landslide debris.
              </p>
            </div>
            <button
              onClick={handleCaptureCurrentGps}
              disabled={isCapturingGps}
              className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 self-start shadow-xs"
            >
              <Navigation className="w-4 h-4" />
              <span>{isCapturingGps ? 'Querying GPS...' : 'Use Current GPS'}</span>
            </button>
          </div>

          {/* Real Coordinates & Area indicator */}
          <div className="mb-3 p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between text-xs text-slate-700 gap-2">
            <div className="flex items-center gap-2 font-mono">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>
                Coordinates: <strong>{latitude.toFixed(5)}°N, {longitude.toFixed(5)}°E</strong>
              </span>
              <span className="text-[10px] text-slate-500 px-1.5 py-0.5 bg-slate-200 rounded">
                {gpsAccuracy}
              </span>
            </div>
            <div className="text-slate-600">
              District: <strong>{district}</strong>
            </div>
          </div>

          {/* Interactive GIS Map */}
          <div className="rounded-xl overflow-hidden border border-slate-300">
            <InteractiveGisMap
              center={[latitude, longitude]}
              zoom={14}
              selectedMarker={[latitude, longitude]}
              isSelectable={true}
              onSelectLocation={(lat, lng) => {
                setLatitude(lat);
                setLongitude(lng);
                setLocationName(`Geocoded Sector (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
              }}
              height="380px"
            />
          </div>

          <div className="mt-4">
            <label className="block text-xs font-bold text-slate-700 mb-1">Landmark / Location Name</label>
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="e.g. Near Pongchau Mile 14 Bend, Highway 215"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>

          <div className="mt-8 flex justify-between">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setCurrentStep(4)}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2"
            >
              <span>Next: Hazard Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Incident Details & Submit */}
      {currentStep === 4 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 mb-2">Step 4: Emergency Details</h2>
          <p className="text-xs text-slate-500 mb-6">
            Provide situational context to prioritize dispatch of earth-movers, medical staff, and evacuation teams.
          </p>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Incident Headline / Summary</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Major rockfall blocking state highway"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe current weather, blocked vehicles, whether rocks are still falling..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            {/* Severity and People Estimate */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Observed Severity</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as IncidentSeverity)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none bg-white"
                >
                  <option value="Critical">Critical - Active danger to life / total road cutoff</option>
                  <option value="High">High - Impending slide / major traffic blocked</option>
                  <option value="Moderate">Moderate - Partial lane blockage / ground cracks</option>
                  <option value="Low">Low - Small debris / early sign</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Affected People / Commuters</label>
                <input
                  type="number"
                  min={1}
                  value={affectedPeople}
                  onChange={(e) => setAffectedPeople(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Reporter Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reporter Name</label>
                <input
                  type="text"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone Number</label>
                <input
                  type="text"
                  value={reporterPhone}
                  onChange={(e) => setReporterPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-between">
            <button
              onClick={() => setCurrentStep(3)}
              className="px-4 py-2 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={handleSubmitReport}
              disabled={isSubmitting}
              className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-black text-sm rounded-xl shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting to Disaster Center...</span>
                </>
              ) : (
                <>
                  <Flame className="w-4 h-4 text-white" />
                  <span>SUBMIT EMERGENCY REPORT</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Report Confirmation & Safety Action Card */}
      {currentStep === 5 && submittedReport && (
        <div className="space-y-6 animate-in fade-in zoom-in duration-300">
          <div className="bg-white rounded-2xl border border-emerald-200 p-6 text-center shadow-xs">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">Emergency Report Submitted Successfully!</h2>
            <p className="text-xs text-slate-600 mt-1 max-w-lg mx-auto">
              Your report has been broadcasted to the Longding District Emergency Operation Center (EOC) and dispatched to the nearest Field Officer unit.
            </p>

            {/* Tracking Card */}
            <div className="mt-6 max-w-md mx-auto bg-slate-50 border border-slate-200 rounded-xl p-4 text-left text-xs space-y-2 font-mono">
              <div className="flex justify-between border-b border-slate-200 pb-1.5 font-bold">
                <span className="text-slate-500">Official Report ID:</span>
                <span className="text-sky-700">{submittedReport.reportNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Hazard Type:</span>
                <span className="font-bold text-slate-800">{submittedReport.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Calculated Priority:</span>
                <span className="px-2 py-0.5 bg-red-600 text-white font-bold rounded">
                  {submittedReport.priority} (IMMEDIATE)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Location:</span>
                <span className="text-slate-800 font-sans">{submittedReport.locationName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Initial Status:</span>
                <span className="text-amber-700 font-bold">Reported (Pending On-Ground Officer)</span>
              </div>
            </div>

            {/* Status Stepper Progression */}
            <div className="mt-6 max-w-lg mx-auto">
              <div className="text-xs font-bold text-slate-500 mb-2">LIFECYCLE STATUS</div>
              <div className="grid grid-cols-5 gap-1 text-[10px] font-bold">
                <div className="bg-sky-600 text-white py-1 rounded">1. Reported ✓</div>
                <div className="bg-slate-200 text-slate-600 py-1 rounded">2. Under Verification</div>
                <div className="bg-slate-200 text-slate-600 py-1 rounded">3. Confirmed</div>
                <div className="bg-slate-200 text-slate-600 py-1 rounded">4. Response</div>
                <div className="bg-slate-200 text-slate-600 py-1 rounded">5. Resolved</div>
              </div>
            </div>
          </div>

          {/* CRITICAL REQUIREMENT 14 & 15: Emergency Shelter & Safe Route Assist Card */}
          <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm mb-1">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              <span>🚨 IMMEDIATE SAFETY ASSISTANCE & EVACUATION</span>
            </div>
            <p className="text-xs text-amber-800 mb-4">
              Are you currently at risk or trapped in the hazard zone? Use the safe routing engine to navigate to the nearest designated disaster relief center, strictly detouring around blocked mountain corridors.
            </p>

            <div className="bg-white rounded-xl p-4 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                  <Building className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    Nearest Accessible Shelter
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                    Longding Government Relief Camp (District Center)
                  </h4>
                  <p className="text-xs text-slate-600">
                    2.4 km away • 180 available spaces • Medical Staff on duty
                  </p>
                </div>
              </div>

              <button
                onClick={() => onNavigateToSafeRoute()}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-xs flex items-center justify-center gap-2 shrink-0 animate-pulse"
              >
                <Navigation className="w-4 h-4" />
                <span>NAVIGATE SAFELY NOW</span>
              </button>
            </div>
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={onFinished}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl"
            >
              Return to Citizen Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
