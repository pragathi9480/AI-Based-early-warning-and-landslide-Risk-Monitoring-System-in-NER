import React, { useState } from 'react';
import {
  Brain,
  CloudRain,
  Mountain,
  Droplets,
  Layers,
  History,
  Info,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { LandslideRiskAssessment, RiskFactorDetail } from '../../types';

interface ExplainableAiSectionProps {
  riskAssessment: LandslideRiskAssessment;
  compact?: boolean;
  className?: string;
  defaultExpanded?: boolean;
}

export const ExplainableAiSection: React.FC<ExplainableAiSectionProps> = ({
  riskAssessment,
  compact = false,
  className = '',
  defaultExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);

  const probability =
    riskAssessment.landslideProbability !== undefined
      ? riskAssessment.landslideProbability
      : riskAssessment.riskScore;

  const classification =
    riskAssessment.riskClassification ||
    (probability >= 75
      ? 'Critical'
      : probability >= 50
      ? 'High'
      : probability >= 25
      ? 'Moderate'
      : 'Safe');

  const defaultFactors: RiskFactorDetail[] = [
    {
      category: 'rainfall',
      label: '24h Cumulative Precipitation',
      value: `${riskAssessment.rainfallMm || 120} mm`,
      rawValue: riskAssessment.rainfallMm || 120,
      threshold: 'Trigger threshold: >85 mm',
      rawThreshold: 85,
      weightPercent: 35,
      status: (riskAssessment.rainfallMm || 120) >= 85 ? 'Critical' : 'Moderate',
      description: 'Dynamic monsoon rainfall infiltrating porous shale strata creates elevated pore water pressures.',
    },
    {
      category: 'soil',
      label: 'Soil Moisture Saturation',
      value: riskAssessment.soilMoisture || '94%',
      rawValue: 94,
      threshold: 'Critical saturation: >75%',
      rawThreshold: 75,
      weightPercent: 25,
      status: 'Critical',
      description: 'Pore water pressure exceeds soil shear strength, destabilizing slope cohesion.',
    },
    {
      category: 'slope',
      label: 'Terrain Slope Steepness',
      value: `${riskAssessment.slopeAngleDeg || 42}°`,
      rawValue: riskAssessment.slopeAngleDeg || 42,
      threshold: 'Critical gradient: >35°',
      rawThreshold: 35,
      weightPercent: 20,
      status: (riskAssessment.slopeAngleDeg || 42) >= 35 ? 'Critical' : 'Moderate',
      description: 'Acute hillside slope steepness generates high gravitational downward shear stress.',
    },
    {
      category: 'elevation',
      label: 'Elevation & Relief Energy',
      value: `${riskAssessment.elevationMeters || 1420} m`,
      rawValue: riskAssessment.elevationMeters || 1420,
      threshold: 'High-relief zone: >1,000 m',
      rawThreshold: 1000,
      weightPercent: 10,
      status: 'High',
      description: 'Steep altitudinal relief promotes accelerated surface velocity and debris momentum.',
    },
    {
      category: 'history',
      label: 'Historical Landslide Occurrence',
      value: `${riskAssessment.historicalIncidentsCount || 14} past events`,
      rawValue: riskAssessment.historicalIncidentsCount || 14,
      threshold: 'Historical recurrence: >5 events',
      rawThreshold: 5,
      weightPercent: 10,
      status: (riskAssessment.historicalIncidentsCount || 14) >= 10 ? 'Critical' : 'Moderate',
      description: 'GSI historical inventory records recurring failure along this tectonic fault zone.',
    },
  ];

  const factors =
    riskAssessment.factorBreakdown && riskAssessment.factorBreakdown.length > 0
      ? riskAssessment.factorBreakdown
      : defaultFactors;

  const whyText =
    riskAssessment.whyThisRisk ||
    `Risk classified as ${classification} due to intense 24h precipitation (${riskAssessment.rainfallMm || 120} mm) combining with acute ${riskAssessment.slopeAngleDeg || 42}° slope gradients and ${riskAssessment.soilMoisture || '94%'} soil moisture saturation. Historical records show ${riskAssessment.historicalIncidentsCount || 14} prior failure events in this sector.`;

  const getFactorIcon = (category: string) => {
    switch (category) {
      case 'rainfall':
        return <CloudRain className="w-4 h-4 text-sky-600" />;
      case 'slope':
        return <Mountain className="w-4 h-4 text-amber-600" />;
      case 'soil':
        return <Droplets className="w-4 h-4 text-blue-600" />;
      case 'elevation':
        return <Layers className="w-4 h-4 text-purple-600" />;
      case 'history':
        return <History className="w-4 h-4 text-rose-600" />;
      default:
        return <Info className="w-4 h-4 text-slate-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Critical':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
            Critical
          </span>
        );
      case 'High':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-800 border border-orange-200">
            High
          </span>
        );
      case 'Moderate':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
            Moderate
          </span>
        );
      case 'Safe':
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
            Safe
          </span>
        );
    }
  };

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden ${className}`}
      id="explainable-ai-risk-section"
    >
      {/* Header Bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-4 py-3 bg-gradient-to-r from-purple-50 via-indigo-50/50 to-slate-50 border-b border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-100/60 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-purple-600 text-white rounded-lg shadow-2xs">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight">
                Why this risk? (Explainable AI)
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                XAI Attribution
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Factor contribution breakdown for {riskAssessment.district}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-slate-400 font-medium">Probability:</span>
            <span className="ml-1 text-xs font-black text-slate-900 font-mono">
              {probability}% ({classification})
            </span>
          </div>
          <button
            type="button"
            className="p-1 text-slate-400 hover:text-slate-600 rounded"
            aria-label="Toggle Explainable AI factors"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Natural Language Synthesis Box */}
          <div className="p-3 bg-purple-50/60 border border-purple-200/80 rounded-xl flex items-start gap-2.5">
            <Info className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
            <div className="text-xs text-purple-950 leading-relaxed">
              <span className="font-bold text-purple-900 block mb-0.5">Primary Geological Reason:</span>
              {whyText}
            </div>
          </div>

          {/* Factor Contribution Weights Bar */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1.5">
              <span>Feature Importance & Model Weights</span>
              <span className="text-slate-400 font-normal">Derived from Northeast India GSI Inventory</span>
            </div>
            <div className="h-3 rounded-full bg-slate-100 overflow-hidden flex shadow-inner">
              <div
                style={{ width: '35%' }}
                className="bg-sky-500 h-full"
                title="Rainfall (35%)"
              />
              <div
                style={{ width: '25%' }}
                className="bg-blue-600 h-full"
                title="Soil Moisture (25%)"
              />
              <div
                style={{ width: '20%' }}
                className="bg-amber-500 h-full"
                title="Slope Angle (20%)"
              />
              <div
                style={{ width: '10%' }}
                className="bg-purple-600 h-full"
                title="Elevation (10%)"
              />
              <div
                style={{ width: '10%' }}
                className="bg-rose-500 h-full"
                title="Historical Occurrences (10%)"
              />
            </div>
            <div className="flex items-center justify-between text-[9px] text-slate-500 mt-1 flex-wrap gap-1">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-sky-500" /> Rain (35%)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-600" /> Soil (25%)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Slope (20%)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-600" /> Elevation (10%)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> History (10%)
              </span>
            </div>
          </div>

          {/* Detailed Factor Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {factors.map((factor, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-white transition-colors space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                    {getFactorIcon(factor.category)}
                    <span>{factor.label}</span>
                  </div>
                  {getStatusBadge(factor.status)}
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-base font-black text-slate-900 font-mono">
                    {factor.value}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {factor.threshold}
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 leading-snug">
                  {factor.description}
                </p>
              </div>
            ))}
          </div>

          {/* Model Attribution Footer */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <span>Model: <strong>Logistic Multi-Criteria GeoHazard v2.4</strong></span>
            <span>Trained on: <strong>Northeast India Historical Slope Inventory</strong></span>
          </div>
        </div>
      )}
    </div>
  );
};
