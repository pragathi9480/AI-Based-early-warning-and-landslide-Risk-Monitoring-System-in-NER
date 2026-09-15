export type UserRole = 'citizen' | 'field_officer' | 'district_admin';

export interface User {
  id: string;
  name: string;
  email?: string;
  phone: string;
  role: UserRole;
  officialId?: string;
  location?: string;
  avatar?: string;
  createdAt: string;
}

export type IncidentType =
  | 'Landslide'
  | 'Road Blockage'
  | 'Slope Crack'
  | 'Slope Movement'
  | 'Falling Rocks'
  | 'Flash Flood'
  | 'Infrastructure Damage'
  | 'Other';

export type IncidentStatus =
  | 'Reported'
  | 'Under Verification'
  | 'Confirmed'
  | 'Response Started'
  | 'Resolved'
  | 'Rejected';

export type IncidentSeverity = 'Low' | 'Moderate' | 'High' | 'Critical';

export type ResponsePriority = 'P1' | 'P2' | 'P3' | 'P4'; // P1: IMMEDIATE, P2: URGENT, P3: MODERATE, P4: MONITOR

export interface IncidentReport {
  id: string;
  reportNumber: string; // e.g., NER-2025-00123
  type: IncidentType;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  locationName: string;
  district: string;
  state: string;
  reporterId?: string;
  reporterName: string;
  reporterPhone?: string;
  reporterRole: UserRole;
  media: Array<{
    id: string;
    type: 'photo' | 'video';
    url: string;
    caption?: string;
    timestamp: string;
  }>;
  status: IncidentStatus;
  severity: IncidentSeverity;
  priority: ResponsePriority;
  affectedPeopleCount: number;
  assignedOfficerId?: string;
  assignedOfficerName?: string;
  roadCondition?: RoadStatus;
  inspections?: FieldInspection[];
  createdAt: string;
  updatedAt: string;
  verifiedAt?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
}

export interface FieldInspection {
  id: string;
  incidentId: string;
  officerId: string;
  officerName: string;
  observations: string;
  riskSeverity: IncidentSeverity;
  roadCondition: RoadStatus;
  photos: string[];
  recommendedAction: string;
  timestamp: string;
  isOfflineSubmitted?: boolean;
}

export type RoadStatus = 'SAFE' | 'CAUTION' | 'BLOCKED' | 'AVOID';

export interface RoadRecord {
  id: string;
  code: string;
  name: string;
  district: string;
  state: string;
  status: RoadStatus;
  reason: string;
  lastUpdatedBy: string;
  updatedAt: string;
  coordinates: [number, number][]; // Polyline points [lat, lng]
  lengthKm: number;
  alternateRouteId?: string;
  alternateRouteName?: string;
  nearestShelterId?: string;
  nearestShelterDistanceKm?: number;
  evidencePhoto?: string;
}

export interface SafetyShelter {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  district: string;
  state: string;
  capacity: number;
  currentOccupancy: number;
  availableCapacity: number;
  facilities: string[]; // e.g., Food, Drinking Water, Medical Support, Toilets, Electricity
  contactPhone: string;
  managerName: string;
  status: 'Open' | 'Full' | 'Closed';
  distanceKm?: number;
}

export interface Village {
  id: string;
  name: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  population: number;
  riskLevel: IncidentSeverity;
  isIsolated: boolean;
  evacuationStatus: 'Normal' | 'Advisory' | 'Evacuating' | 'Evacuated';
  nearestShelterId: string;
}

export interface WeatherData {
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  temperatureC: number;
  weatherCondition: string;
  rainfallLast24hMm: number;
  rainfallForecast6hMm: number;
  humidityPercent: number;
  windSpeedKmh: number;
  precipitationProbability: number;
  soilMoistureLevel: 'Low' | 'Moderate' | 'High' | 'Saturated';
  soilMoistureIndex: number; // 0 - 100
  forecastDays: Array<{
    day: string;
    condition: string;
    maxTemp: number;
    minTemp: number;
    rainMm: number;
  }>;
  hourlyTrend: Array<{
    hour: string;
    rainMm: number;
    riskScore: number;
  }>;
  lastUpdated: string;
  dataSource: string;
  isRealData: boolean;
}

export type RiskClassification = 'Safe' | 'Moderate' | 'High' | 'Critical';

export interface RiskFactorDetail {
  category: 'rainfall' | 'slope' | 'soil' | 'elevation' | 'history';
  label: string;
  value: string;
  rawValue: number;
  threshold: string;
  rawThreshold: number;
  weightPercent: number; // e.g., 35%
  status: 'Safe' | 'Moderate' | 'High' | 'Critical';
  description: string;
}

export interface ModelPerformanceEvaluation {
  modelName: string;
  modelVersion: string;
  datasetName: string;
  sampleCount: number;
  accuracy: number; // 0 - 1
  precision: number; // 0 - 1
  recall: number; // 0 - 1
  f1Score: number; // 0 - 1
  rocAuc: number; // 0 - 1
  threshold: number;
  confusionMatrix: {
    truePositives: number;
    falsePositives: number;
    trueNegatives: number;
    falseNegatives: number;
    total: number;
  };
}

export interface LandslideRiskAssessment {
  id: string;
  district: string;
  riskScore: number; // 0 - 100
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  landslideProbability?: number; // 0 - 100%
  riskClassification?: RiskClassification;
  riskFactors: string[];
  factorBreakdown?: RiskFactorDetail[];
  whyThisRisk?: string;
  evaluationMetrics?: ModelPerformanceEvaluation;
  rainfallMm: number;
  soilMoisture: string;
  slopeAngleDeg: number;
  elevationMeters: number;
  historicalIncidentsCount: number;
  predictionTime: string;
  lastUpdated: string;
  dataSource: string;
  disclaimer: string;
  recommendations: string[];
  hourlyRiskTrend: Array<{
    timeLabel: string;
    score: number;
  }>;
}

export interface SafeRouteStep {
  instruction: string;
  roadName: string;
  roadStatus: RoadStatus;
  distanceKm: number;
  warning?: string;
}

export interface SafeRouteResult {
  fromCoordinates: [number, number];
  toCoordinates: [number, number];
  destinationName: string;
  totalDistanceKm: number;
  estimatedTravelTimeMinutes: number;
  overallCondition: RoadStatus;
  waypoints: [number, number][];
  steps: SafeRouteStep[];
  avoidedRoads: Array<{
    roadName: string;
    reason: string;
    status: RoadStatus;
  }>;
  warnings: string[];
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'emergency' | 'info' | 'success';
  timestamp: string;
  recipientRole: 'all' | 'citizen' | 'field_officer' | 'district_admin';
  actionUrl?: string;
  isRead?: boolean;
}

export interface DashboardStats {
  criticalRiskZones: number;
  activeEmergencies: number;
  blockedRoads: number;
  availableShelters: number;
  totalShelterCapacity: number;
  affectedPopulation: number;
  pendingReports: number;
  verifiedIncidents: number;
  resolvedIncidents: number;
  safeRoadsCount: number;
  cautionRoadsCount: number;
  totalRoadsCount: number;
  fieldOfficersOnDuty: number;
  currentRiskScore: number;
  currentRiskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
}
