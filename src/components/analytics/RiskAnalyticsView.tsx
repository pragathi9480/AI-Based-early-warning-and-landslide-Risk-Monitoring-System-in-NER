import React from 'react';
import {
  Brain,
  CloudRain,
  TrendingUp,
  AlertTriangle,
  Compass,
  Layers,
  Calendar,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import { LandslideRiskAssessment, WeatherData, IncidentReport } from '../../types';
import { ExplainableAiSection } from '../common/ExplainableAiSection';
import { AiModelEvaluationSection } from './AiModelEvaluationSection';

interface RiskAnalyticsViewProps {
  riskAssessment: LandslideRiskAssessment;
  weather: WeatherData | null;
  incidents: IncidentReport[];
  onTriggerEvaluation: () => void;
}

export const RiskAnalyticsView: React.FC<RiskAnalyticsViewProps> = ({
  riskAssessment,
  weather,
  incidents,
  onTriggerEvaluation,
}) => {
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

  const getBadgeColor = (cls: string) => {
    switch (cls) {
      case 'Critical':
        return 'bg-red-600 text-white';
      case 'High':
        return 'bg-orange-600 text-white';
      case 'Moderate':
        return 'bg-amber-500 text-white';
      case 'Safe':
      default:
        return 'bg-emerald-600 text-white';
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 bg-white/20 rounded-md">
              <Brain className="w-4 h-4 text-purple-300" />
            </span>
            <span className="text-xs uppercase font-extrabold tracking-wider text-purple-200">
              AI Risk Core & Predictive Analytics
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            Geological Threat Model & Meteorological Sensor Suite
          </h1>
          <p className="text-xs text-purple-100 mt-1 max-w-2xl">
            Continuous synthesis of multi-criteria slope stability, 24h precipitation, and soil moisture saturation calibrated with Northeast India GSI datasets.
          </p>
        </div>

        <button
          onClick={onTriggerEvaluation}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-xs self-start sm:self-auto flex items-center gap-2 cursor-pointer"
        >
          <Brain className="w-3.5 h-3.5" />
          <span>Re-evaluate Threat Matrix</span>
        </button>
      </div>

      {/* Main Grid: AI Risk Card + Real Weather Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Risk Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
              <Brain className="w-5 h-5 text-purple-600" />
              <span>AI Landslide Risk Assessment</span>
            </div>
            <span className="text-xs text-slate-500">Evaluated: {riskAssessment.predictionTime}</span>
          </div>

          {/* Large Gauge */}
          <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Calculated Landslide Probability
            </div>
            <div className="text-5xl font-black font-mono text-red-600">
              {probability}%
              <span className="text-xl text-slate-400 font-normal"> prob</span>
            </div>
            <div className="mt-2 flex items-center justify-center gap-2">
              <span className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider ${getBadgeColor(classification)}`}>
                {classification} RISK
              </span>
              <span className="text-xs font-bold text-slate-500 font-mono">
                Index: {riskAssessment.riskScore}/100
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-3 max-w-md mx-auto">
              Sector: <strong>{riskAssessment.district}</strong> • Elevation: {riskAssessment.elevationMeters}m • Slope: {riskAssessment.slopeAngleDeg}°
            </p>
          </div>

          {/* Underlying Factors */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 mb-2">Key Geological & Weather Drivers:</h4>
            <div className="space-y-2">
              {riskAssessment.riskFactors.map((factor, i) => (
                <div key={i} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></span>
                  <span>{factor}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actionable Recommendations */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 mb-2">Protective Recommendations:</h4>
            <div className="space-y-1.5 text-xs text-slate-600">
              {riskAssessment.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mandatory Attribution */}
          <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-500 italic">
            * {riskAssessment.disclaimer}
          </div>
        </div>

        {/* Real Live Weather Feed Card */}
        {weather && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                <CloudRain className="w-5 h-5 text-sky-600" />
                <span>Live Environmental Sensors</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                REAL SENSOR FEED
              </span>
            </div>

            {/* Current Weather Box */}
            <div className="p-6 bg-sky-50/60 rounded-xl border border-sky-200 text-center">
              <div className="text-xs font-bold text-sky-800 uppercase tracking-wider mb-1">
                {weather.district}, {weather.state}
              </div>
              <div className="text-4xl font-black text-slate-900 font-mono my-1">
                {weather.temperatureC}°C
              </div>
              <div className="text-sm font-bold text-sky-900">{weather.weatherCondition}</div>
              <p className="text-xs text-slate-600 mt-2">
                Last 24h Cumulative Precipitation: <strong className="text-red-600">{weather.rainfallLast24hMm} mm</strong>
              </p>
            </div>

            {/* Grid of Weather Telemetry */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-slate-500 font-medium">Soil Moisture Index</div>
                <div className="text-lg font-black text-amber-700 font-mono mt-1">
                  {weather.soilMoistureIndex}%
                </div>
                <div className="text-[10px] text-slate-500 font-bold">{weather.soilMoistureLevel} Saturation</div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-slate-500 font-medium">Relative Humidity</div>
                <div className="text-lg font-black text-sky-700 font-mono mt-1">
                  {weather.humidityPercent}%
                </div>
                <div className="text-[10px] text-slate-500">Atmospheric vapor</div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-slate-500 font-medium">Wind Velocity</div>
                <div className="text-lg font-black text-slate-800 font-mono mt-1">
                  {weather.windSpeedKmh} km/h
                </div>
                <div className="text-[10px] text-slate-500">Hill pass airflow</div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-slate-500 font-medium">Rainfall Forecast (+6h)</div>
                <div className="text-lg font-black text-red-600 font-mono mt-1">
                  +{weather.rainfallForecast6hMm} mm
                </div>
                <div className="text-[10px] text-slate-500">{weather.precipitationProbability}% prob</div>
              </div>
            </div>

            {/* 5-Day Forecast */}
            {weather.forecastDays && weather.forecastDays.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-2">5-Day Meteorological Outlook:</h4>
                <div className="grid grid-cols-5 gap-1.5 text-center text-xs">
                  {weather.forecastDays.map((d, i) => (
                    <div key={i} className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                      <div className="text-[10px] font-bold text-slate-500">{d.day}</div>
                      <div className="text-sm font-mono font-black text-slate-800 my-1">{d.maxTemp}°</div>
                      <div className="text-[10px] text-sky-700 font-bold">{d.rainMm}mm</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-500 flex items-center justify-between">
              <span>Data Source: <strong>{weather.dataSource}</strong></span>
              <span>Updated: {weather.lastUpdated}</span>
            </div>
          </div>
        )}
      </div>

      {/* Feature 4: Explainable AI Section */}
      <ExplainableAiSection riskAssessment={riskAssessment} defaultExpanded={true} />

      {/* Feature 6: AI Evaluation & Model Performance */}
      <AiModelEvaluationSection evaluation={riskAssessment.evaluationMetrics} />
    </div>
  );
};
