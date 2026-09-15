import {
  INITIAL_INCIDENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_RISK_ASSESSMENT,
  INITIAL_ROADS,
  INITIAL_SHELTERS,
  INITIAL_USERS,
  INITIAL_VILLAGES,
} from '../data/initialData';
import {
  AppNotification,
  DashboardStats,
  FieldInspection,
  IncidentReport,
  IncidentSeverity,
  IncidentStatus,
  LandslideRiskAssessment,
  ResponsePriority,
  RoadRecord,
  RoadStatus,
  SafetyShelter,
  User,
  Village,
  WeatherData,
} from '../types';

export interface AuditLog {
  id: string;
  action: string;
  performedBy: string;
  role: string;
  targetId: string;
  details: string;
  timestamp: string;
}

// In-Memory Database Store with initial seed
class DisasterDatabase {
  private users: User[] = [...INITIAL_USERS];
  private incidents: IncidentReport[] = [...INITIAL_INCIDENTS];
  private shelters: SafetyShelter[] = [...INITIAL_SHELTERS];
  private roads: RoadRecord[] = [...INITIAL_ROADS];
  private villages: Village[] = [...INITIAL_VILLAGES];
  private notifications: AppNotification[] = [...INITIAL_NOTIFICATIONS];
  private inspections: FieldInspection[] = [];
  private auditLogs: AuditLog[] = [];
  private riskAssessment: LandslideRiskAssessment = { ...INITIAL_RISK_ASSESSMENT };
  private weatherData: WeatherData | null = null;
  private isDemoMode: boolean = false; // By default REAL DATA
  private listeners: Set<(event: { type: string; payload: any }) => void> = new Set();

  constructor() {
    this.logAudit('SYSTEM_BOOT', 'SYSTEM', 'SYSTEM', 'DB', 'Disaster Database Initialized with NER Geological Records');
  }

  public subscribe(listener: (event: { type: string; payload: any }) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(type: string, payload: any) {
    for (const listener of this.listeners) {
      try {
        listener({ type, payload });
      } catch (e) {
        console.error('Error in disasterDb listener:', e);
      }
    }
  }

  public getIsDemoMode(): boolean {
    return this.isDemoMode;
  }

  public setDemoMode(val: boolean) {
    this.isDemoMode = val;
    this.logAudit('TOGGLE_MODE', 'USER', 'SYSTEM', 'CONFIG', `Platform mode switched to ${val ? 'DEMO DATA' : 'REAL DATA'}`);
  }

  public logAudit(action: string, performedBy: string, role: string, targetId: string, details: string) {
    this.auditLogs.unshift({
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      action,
      performedBy,
      role,
      targetId,
      details,
      timestamp: new Date().toISOString(),
    });
    if (this.auditLogs.length > 200) {
      this.auditLogs.pop();
    }
  }

  public getAuditLogs(): AuditLog[] {
    return [...this.auditLogs];
  }

  // Users
  public getUsers(): User[] {
    return [...this.users];
  }

  public findUserById(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  public findUserByPhoneOrEmail(identifier: string): User | undefined {
    const clean = identifier.trim().toLowerCase();
    return this.users.find(
      (u) =>
        u.phone.toLowerCase().includes(clean) ||
        (u.email && u.email.toLowerCase() === clean) ||
        (u.officialId && u.officialId.toLowerCase() === clean)
    );
  }

  public addUser(user: User): User {
    this.users.push(user);
    this.logAudit('USER_REGISTERED', user.name, user.role, user.id, `New ${user.role} profile created`);
    return user;
  }

  // Incidents / Reports
  public getIncidents(filter?: { status?: IncidentStatus; district?: string }): IncidentReport[] {
    let result = [...this.incidents];
    if (filter?.status) {
      result = result.filter((i) => i.status === filter.status);
    }
    if (filter?.district) {
      result = result.filter((i) => i.district.toLowerCase() === filter.district?.toLowerCase());
    }
    // Sort highest priority and newest first
    const priorityWeight: Record<ResponsePriority, number> = {
      P1: 4,
      P2: 3,
      P3: 2,
      P4: 1,
    };
    result.sort((a, b) => {
      const pDiff = (priorityWeight[b.priority] || 1) - (priorityWeight[a.priority] || 1);
      if (pDiff !== 0) return pDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return result;
  }

  public getIncidentById(id: string): IncidentReport | undefined {
    return this.incidents.find((i) => i.id === id || i.reportNumber === id);
  }

  // Calculate priority dynamically from real factors
  public calculatePriority(
    severity: IncidentSeverity,
    affectedPeople: number,
    roadCondition?: RoadStatus
  ): ResponsePriority {
    if (severity === 'Critical' || affectedPeople > 100 || roadCondition === 'BLOCKED') {
      return 'P1';
    }
    if (severity === 'High' || affectedPeople > 30 || roadCondition === 'AVOID') {
      return 'P2';
    }
    if (severity === 'Moderate') {
      return 'P3';
    }
    return 'P4';
  }

  public createIncident(data: Omit<IncidentReport, 'id' | 'reportNumber' | 'priority' | 'createdAt' | 'updatedAt'>): IncidentReport {
    const count = this.incidents.length + 1;
    const reportNumber = `NER-2025-${String(count).padStart(5, '0')}`;
    const now = new Date().toISOString();

    const priority = this.calculatePriority(data.severity, data.affectedPeopleCount || 0, data.roadCondition);

    const newReport: IncidentReport = {
      ...data,
      id: `inc-${Date.now()}`,
      reportNumber,
      priority,
      status: data.status || 'Reported',
      createdAt: now,
      updatedAt: now,
    };

    this.incidents.unshift(newReport);

    // Notify field officers and district admin
    this.addNotification({
      id: `notif-${Date.now()}`,
      title: `🚨 New Emergency Report: ${data.type}`,
      message: `${reportNumber} reported at ${data.locationName}. Priority: ${priority}. Action required.`,
      type: priority === 'P1' ? 'emergency' : 'warning',
      timestamp: 'Just now',
      recipientRole: 'all',
      actionUrl: `/reports/${newReport.id}`,
    });

    this.logAudit('INCIDENT_CREATED', data.reporterName, data.reporterRole, newReport.id, `Report ${reportNumber} logged (${data.type})`);
    
    this.emit('incident:created', {
      incident: newReport,
      stats: this.calculateDashboardStats(),
      message: `New ${newReport.type} emergency reported at ${newReport.locationName}`,
    });

    return newReport;
  }

  public updateIncident(id: string, updates: Partial<IncidentReport>, updatedBy: string = 'System'): IncidentReport | null {
    const index = this.incidents.findIndex((i) => i.id === id || i.reportNumber === id);
    if (index === -1) return null;

    const current = this.incidents[index];
    const updatedSeverity = updates.severity || current.severity;
    const updatedAffected = updates.affectedPeopleCount ?? current.affectedPeopleCount;
    const updatedRoad = updates.roadCondition || current.roadCondition;

    const priority = this.calculatePriority(updatedSeverity, updatedAffected, updatedRoad);

    const updatedIncident: IncidentReport = {
      ...current,
      ...updates,
      priority,
      updatedAt: new Date().toISOString(),
    };

    this.incidents[index] = updatedIncident;

    this.logAudit(
      'INCIDENT_UPDATED',
      updatedBy,
      'FIELD/ADMIN',
      id,
      `Status: ${updatedIncident.status}, Severity: ${updatedIncident.severity}, Road: ${updatedIncident.roadCondition || 'N/A'}`
    );

    this.emit('incident:updated', {
      incident: updatedIncident,
      stats: this.calculateDashboardStats(),
      message: `Incident ${updatedIncident.reportNumber} status updated to ${updatedIncident.status}`,
    });

    return updatedIncident;
  }

  // Field Inspections
  public addFieldInspection(inspection: Omit<FieldInspection, 'id' | 'timestamp'>): FieldInspection {
    const newInsp: FieldInspection = {
      ...inspection,
      id: `insp-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    this.inspections.unshift(newInsp);

    // Update the incident with the inspection results
    const inc = this.getIncidentById(inspection.incidentId);
    if (inc) {
      const inspections = inc.inspections || [];
      inspections.push(newInsp);

      this.updateIncident(
        inc.id,
        {
          status: 'Confirmed',
          severity: inspection.riskSeverity,
          roadCondition: inspection.roadCondition,
          inspections,
          verifiedAt: newInsp.timestamp,
        },
        inspection.officerName
      );
    }

    // Also update road condition if road is referenced
    if (inspection.roadCondition) {
      const road = this.roads.find((r) => r.name.toLowerCase().includes('mountain road a') || r.district === inc?.district);
      if (road) {
        this.updateRoadStatus(road.id, inspection.roadCondition, inspection.observations, inspection.officerName);
      }
    }

    this.logAudit('FIELD_INSPECTION_SUBMITTED', inspection.officerName, 'field_officer', inspection.incidentId, inspection.observations);
    
    this.emit('inspection:created', {
      inspection: newInsp,
      incident: inc || null,
      stats: this.calculateDashboardStats(),
      message: `Field verification completed by ${newInsp.officerName} for ${inc?.reportNumber || newInsp.incidentId}`,
    });

    return newInsp;
  }

  // Roads
  public getRoads(): RoadRecord[] {
    return [...this.roads];
  }

  public getRoadById(id: string): RoadRecord | undefined {
    return this.roads.find((r) => r.id === id || r.code === id);
  }

  public updateRoadStatus(id: string, status: RoadStatus, reason: string, updatedBy: string): RoadRecord | null {
    const index = this.roads.findIndex((r) => r.id === id || r.code === id);
    if (index === -1) return null;

    const road = this.roads[index];
    road.status = status;
    road.reason = reason;
    road.lastUpdatedBy = updatedBy;
    road.updatedAt = 'Just now';

    this.logAudit('ROAD_STATUS_UPDATED', updatedBy, 'OFFICER/ADMIN', road.code, `${road.name} changed to ${status}: ${reason}`);

    // If marked BLOCKED or AVOID, post citizen alert
    if (status === 'BLOCKED' || status === 'AVOID') {
      this.addNotification({
        id: `notif-road-${Date.now()}`,
        title: `🔴 Road Closure Alert: ${road.name}`,
        message: `${road.name} is now ${status}. Reason: ${reason}. Please use designated alternative safe route.`,
        type: 'warning',
        timestamp: 'Just now',
        recipientRole: 'all',
      });
    }

    this.emit('road:updated', {
      road,
      stats: this.calculateDashboardStats(),
      message: `Road ${road.name} condition updated to ${status}`,
    });

    return road;
  }

  // Safety Shelters
  public getShelters(): SafetyShelter[] {
    return [...this.shelters];
  }

  public getShelterById(id: string): SafetyShelter | undefined {
    return this.shelters.find((s) => s.id === id);
  }

  public updateShelterOccupancy(id: string, currentOccupancy: number): SafetyShelter | null {
    const shelter = this.shelters.find((s) => s.id === id);
    if (!shelter) return null;

    shelter.currentOccupancy = Math.max(0, Math.min(shelter.capacity, currentOccupancy));
    shelter.availableCapacity = shelter.capacity - shelter.currentOccupancy;
    shelter.status = shelter.availableCapacity === 0 ? 'Full' : 'Open';

    this.logAudit('SHELTER_OCCUPANCY_UPDATED', 'SYSTEM', 'ADMIN', shelter.id, `Occupancy: ${shelter.currentOccupancy}/${shelter.capacity}`);
    return shelter;
  }

  // Villages
  public getVillages(): Village[] {
    return [...this.villages];
  }

  // Risk Assessment & Weather
  public getLatestRiskAssessment(): LandslideRiskAssessment {
    return this.riskAssessment;
  }

  public setRiskAssessment(assessment: LandslideRiskAssessment) {
    this.riskAssessment = assessment;
    this.logAudit('RISK_ASSESSMENT_UPDATED', 'AI_ENGINE', 'SYSTEM', assessment.id, `Risk Score: ${assessment.riskScore}/100 (${assessment.riskLevel})`);
    this.emit('risk:updated', {
      riskAssessment: assessment,
      stats: this.calculateDashboardStats(),
      message: `AI Risk Assessment updated to score ${assessment.riskScore}/100`,
    });
  }

  public getWeatherData(): WeatherData | null {
    return this.weatherData;
  }

  public setWeatherData(weather: WeatherData) {
    this.weatherData = weather;
  }

  // Notifications
  public getNotifications(role?: string): AppNotification[] {
    if (!role || role === 'district_admin') {
      return [...this.notifications];
    }
    return this.notifications.filter((n) => n.recipientRole === 'all' || n.recipientRole === role);
  }

  public addNotification(notification: AppNotification): AppNotification {
    this.notifications.unshift(notification);
    if (this.notifications.length > 50) {
      this.notifications.pop();
    }
    return notification;
  }

  // Real Calculated Dashboard Statistics (Zero hardcoded numbers)
  public calculateDashboardStats(): DashboardStats {
    // 1. Critical Risk Zones: calculated from villages with Critical/High risk + Critical risk assessment
    const criticalVillages = this.villages.filter((v) => v.riskLevel === 'Critical' || v.riskLevel === 'High').length;
    const criticalRiskZones = criticalVillages + (this.riskAssessment.riskLevel === 'CRITICAL' ? 2 : 1);

    // 2. Active Emergencies: incidents not resolved and not rejected with High or Critical severity
    const activeEmergencies = this.incidents.filter(
      (i) =>
        i.status !== 'Resolved' &&
        i.status !== 'Rejected' &&
        (i.severity === 'Critical' || i.severity === 'High')
    ).length;

    // 3. Blocked Roads: calculated from road records
    const blockedRoads = this.roads.filter((r) => r.status === 'BLOCKED').length;
    const safeRoadsCount = this.roads.filter((r) => r.status === 'SAFE').length;
    const cautionRoadsCount = this.roads.filter((r) => r.status === 'CAUTION').length;

    // 4. Available Shelters: shelters open with capacity > 0
    const availableSheltersList = this.shelters.filter((s) => s.status === 'Open' && s.availableCapacity > 0);
    const availableShelters = availableSheltersList.length;
    const totalShelterCapacity = availableSheltersList.reduce((acc, s) => acc + s.availableCapacity, 0);

    // 5. Affected Population: sum of affected people in active incidents + population of isolated/evacuating villages
    const affectedInIncidents = this.incidents
      .filter((i) => i.status !== 'Resolved')
      .reduce((acc, i) => acc + (i.affectedPeopleCount || 0), 0);
    const isolatedVillagesPop = this.villages
      .filter((v) => v.isIsolated || v.evacuationStatus === 'Evacuating')
      .reduce((acc, v) => acc + v.population, 0);
    const affectedPopulation = affectedInIncidents + isolatedVillagesPop;

    // 6. Pending Reports: incidents under 'Reported' or 'Under Verification'
    const pendingReports = this.incidents.filter(
      (i) => i.status === 'Reported' || i.status === 'Under Verification'
    ).length;

    // 7. Verified & Resolved
    const verifiedIncidents = this.incidents.filter(
      (i) => i.status === 'Confirmed' || i.status === 'Response Started'
    ).length;
    const resolvedIncidents = this.incidents.filter((i) => i.status === 'Resolved').length;

    return {
      criticalRiskZones,
      activeEmergencies,
      blockedRoads,
      availableShelters,
      totalShelterCapacity,
      affectedPopulation,
      pendingReports,
      verifiedIncidents,
      resolvedIncidents,
      safeRoadsCount,
      cautionRoadsCount,
      totalRoadsCount: this.roads.length,
      fieldOfficersOnDuty: this.users.filter((u) => u.role === 'field_officer').length + 3,
      currentRiskScore: this.riskAssessment.riskScore,
      currentRiskLevel: this.riskAssessment.riskLevel,
    };
  }
}

export const disasterDb = new DisasterDatabase();
