import React, { useState, useEffect, useCallback } from 'react';
import {
  AppNotification,
  DashboardStats,
  IncidentReport,
  LandslideRiskAssessment,
  RoadRecord,
  SafetyShelter,
  User,
  UserRole,
  Village,
  WeatherData,
} from './types';
import {
  INITIAL_INCIDENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_RISK_ASSESSMENT,
  INITIAL_ROADS,
  INITIAL_SHELTERS,
  INITIAL_USERS,
  INITIAL_VILLAGES,
} from './data/initialData';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { AuthModal } from './components/auth/AuthModal';
import { LandingPage } from './components/landing/LandingPage';
import { CitizenDashboard } from './components/citizen/CitizenDashboard';
import { EmergencyReportWizard } from './components/citizen/EmergencyReportWizard';
import { FieldOfficerDashboard } from './components/officer/FieldOfficerDashboard';
import { FieldInspectionView } from './components/officer/FieldInspectionView';
import { EmergencyActionView } from './components/officer/EmergencyActionView';
import { AdminCommandCenter } from './components/admin/AdminCommandCenter';
import { ActiveEmergenciesView } from './components/admin/ActiveEmergenciesView';
import { FieldDeploymentView } from './components/admin/FieldDeploymentView';
import { AuditSystemView } from './components/admin/AuditSystemView';
import { ShelterFinderView } from './components/shelters/ShelterFinderView';
import { RoadManagementView } from './components/roads/RoadManagementView';
import { RiskAnalyticsView } from './components/analytics/RiskAnalyticsView';
import { InteractiveGisMap } from './components/map/InteractiveGisMap';
import { ExplainableAiSection } from './components/common/ExplainableAiSection';
import { apiService } from './services/apiService';
import { useRealtimeStream } from './services/realtimeService';
import { useLanguage, LanguageCode } from './services/i18n';
import {
  Flame,
  Building,
  Route,
  MapPin,
  ClipboardList,
  User as UserIcon,
  ShieldAlert,
  Bell,
  RefreshCw,
  CheckCheck,
  Check,
  Brain,
} from 'lucide-react';

export default function App() {
  const { language, setLanguage, t } = useLanguage();

  // Session State - starts with Priya Sharma (Citizen) or can switch to Guest/Officer/Admin
  const [currentUser, setCurrentUser] = useState<User | null>(INITIAL_USERS[0]);
  const [activeView, setActiveView] = useState<string>('citizen-home');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalRole, setAuthModalRole] = useState<UserRole>('citizen');
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState<boolean>(false);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const selectedLanguage = language;
  const setSelectedLanguage = (lang: string) => setLanguage(lang as LanguageCode);

  // Application Data Stores
  const [stats, setStats] = useState<DashboardStats>({
    criticalRiskZones: 6,
    activeEmergencies: 8,
    blockedRoads: 2,
    availableShelters: 4,
    totalShelterCapacity: 860,
    affectedPopulation: 3420,
    pendingReports: 4,
    verifiedIncidents: 6,
    resolvedIncidents: 1,
    safeRoadsCount: 3,
    cautionRoadsCount: 2,
    totalRoadsCount: 8,
    fieldOfficersOnDuty: 5,
    currentRiskScore: 87,
    currentRiskLevel: 'CRITICAL',
  });

  const [incidents, setIncidents] = useState<IncidentReport[]>(INITIAL_INCIDENTS);
  const [roads, setRoads] = useState<RoadRecord[]>(INITIAL_ROADS);
  const [shelters, setShelters] = useState<SafetyShelter[]>(INITIAL_SHELTERS);
  const [villages, setVillages] = useState<Village[]>(INITIAL_VILLAGES);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [riskAssessment, setRiskAssessment] = useState<LandslideRiskAssessment>(INITIAL_RISK_ASSESSMENT);
  const [weather, setWeather] = useState<WeatherData | null>(null);

  // Active Safe Route Target Shelter
  const [targetShelterId, setTargetShelterId] = useState<string | undefined>(undefined);
  const [selectedIncidentForInspection, setSelectedIncidentForInspection] = useState<IncidentReport | null>(null);
  const [latestRealtimeIncidentId, setLatestRealtimeIncidentId] = useState<string | null>(null);

  // Real-Time SSE Stream Hook
  const {
    connectionStatus: realtimeStatus,
    eventCount: realtimeEventCount,
    simulateEvent,
    recentBroadcastBanner,
    dismissBanner,
  } = useRealtimeStream({
    onIncidentCreated: (incident, newStats) => {
      setIncidents((prev) => [incident, ...prev.filter((i) => i.id !== incident.id)]);
      if (newStats) setStats(newStats);
      setLatestRealtimeIncidentId(incident.id);
      setNotifications((prev) => [
        {
          id: `live-inc-${Date.now()}`,
          title: `🚨 Live Emergency: ${incident.type}`,
          message: `${incident.reportNumber} at ${incident.locationName} (${incident.priority})`,
          type: incident.priority === 'P1' ? 'emergency' : 'warning',
          timestamp: 'Just now',
          recipientRole: 'all',
          actionUrl: `/reports/${incident.id}`,
        },
        ...prev,
      ]);
    },
    onIncidentUpdated: (incident, newStats) => {
      setIncidents((prev) => prev.map((i) => (i.id === incident.id ? incident : i)));
      if (newStats) setStats(newStats);
      setLatestRealtimeIncidentId(incident.id);
    },
    onInspectionCreated: (inspection, incident, newStats) => {
      if (incident) {
        setIncidents((prev) => prev.map((i) => (i.id === incident.id ? incident : i)));
        setLatestRealtimeIncidentId(incident.id);
      }
      if (newStats) setStats(newStats);
      setNotifications((prev) => [
        {
          id: `live-insp-${Date.now()}`,
          title: `🛡️ Field Verification Confirmed`,
          message: `${inspection.officerName} verified ${incident?.reportNumber || 'Sector Incident'}`,
          type: 'success',
          timestamp: 'Just now',
          recipientRole: 'all',
        },
        ...prev,
      ]);
    },
    onRoadUpdated: (road, newStats) => {
      setRoads((prev) => prev.map((r) => (r.id === road.id ? road : r)));
      if (newStats) setStats(newStats);
    },
    onStatsUpdated: (newStats) => {
      setStats(newStats);
    },
  });

  // Load live data from API
  const refreshAllData = useCallback(async () => {
    try {
      const [
        fetchedStats,
        fetchedIncidents,
        fetchedRoads,
        fetchedShelters,
        fetchedVillages,
        fetchedNotifications,
        fetchedRisk,
        fetchedWeather,
      ] = await Promise.allSettled([
        apiService.getStats(),
        apiService.getIncidents(),
        apiService.getRoads(),
        apiService.getShelters(),
        apiService.getVillages(),
        apiService.getNotifications(),
        apiService.getLatestRisk(),
        apiService.getWeather(27.1124, 95.3423, 'Longding'),
      ]);

      if (fetchedStats.status === 'fulfilled') setStats(fetchedStats.value);
      if (fetchedIncidents.status === 'fulfilled') setIncidents(fetchedIncidents.value);
      if (fetchedRoads.status === 'fulfilled') setRoads(fetchedRoads.value);
      if (fetchedShelters.status === 'fulfilled') setShelters(fetchedShelters.value);
      if (fetchedVillages.status === 'fulfilled') setVillages(fetchedVillages.value);
      if (fetchedNotifications.status === 'fulfilled') setNotifications(fetchedNotifications.value);
      if (fetchedRisk.status === 'fulfilled') setRiskAssessment(fetchedRisk.value);
      if (fetchedWeather.status === 'fulfilled') setWeather(fetchedWeather.value);
    } catch (err) {
      console.warn('Error refreshing data:', err);
    }
  }, []);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Role resolution
  const userRole: UserRole | 'guest' = currentUser ? currentUser.role : 'guest';

  // Navigation router handler
  const handleNavigate = (view: string) => {
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Safe Route opener
  const handleOpenSafeRoute = (shelterId?: string) => {
    setTargetShelterId(shelterId);
    setActiveView('shelters');
  };

  // Toggle Demo Mode
  const handleToggleDemoMode = async () => {
    const next = !isDemoMode;
    setIsDemoMode(next);
    await apiService.toggleDemoMode(next);
    refreshAllData();
  };

  // Logout
  const handleLogout = () => {
    setCurrentUser(null);
    setActiveView('landing');
  };

  // Auth Success
  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'district_admin') {
      setActiveView('admin-dashboard');
    } else if (user.role === 'field_officer') {
      setActiveView('officer-dashboard');
    } else {
      setActiveView('citizen-home');
    }
    refreshAllData();
  };

  // Notification Mark as Read Handlers
  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, isRead: true }))
    );
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;

  // If on Landing Page and not explicitly inside a dashboard
  if (activeView === 'landing') {
    return (
      <div className="min-h-screen bg-white">
        <Header
          currentUser={currentUser}
          onOpenAuth={() => {
            setAuthModalRole('citizen');
            setIsAuthModalOpen(true);
          }}
          onLogout={handleLogout}
          onReportEmergency={() => {
            setActiveView('report-emergency');
          }}
          activeView={activeView}
          isDemoMode={isDemoMode}
          onToggleDemoMode={handleToggleDemoMode}
          unreadNotificationsCount={unreadNotificationsCount}
          onToggleNotifications={() => setIsNotificationDrawerOpen(true)}
          weather={weather}
          selectedLanguage={selectedLanguage}
          onSelectLanguage={setSelectedLanguage}
        />

        <LandingPage
          onGetStarted={() => {
            if (currentUser) {
              setActiveView(currentUser.role === 'district_admin' ? 'admin-dashboard' : currentUser.role === 'field_officer' ? 'officer-dashboard' : 'citizen-home');
            } else {
              setAuthModalRole('citizen');
              setIsAuthModalOpen(true);
            }
          }}
          onLogin={() => {
            setAuthModalRole('citizen');
            setIsAuthModalOpen(true);
          }}
          onReportEmergency={() => {
            setActiveView('report-emergency');
          }}
          onViewRiskMap={() => {
            setActiveView('risk-map');
          }}
          incidents={incidents}
          roads={roads}
          shelters={shelters}
          villages={villages}
        />

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={handleAuthSuccess}
          initialRole={authModalRole}
        />

        <NotificationDrawer
          isOpen={isNotificationDrawerOpen}
          onClose={() => setIsNotificationDrawerOpen(false)}
          notifications={notifications}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
          onNotificationClick={(n) => {
            handleMarkAsRead(n.id);
            setIsNotificationDrawerOpen(false);
            if (n.actionUrl) {
              setActiveView('reports');
            }
          }}
        />
      </div>
    );
  }

  // Dashboard & Workspaces Layout (with dark navy Sidebar + Header)
  return (
    <div className="min-h-screen flex bg-slate-100/70 text-slate-900 antialiased font-sans">
      {/* Sidebar */}
      <Sidebar
        activeView={activeView}
        onNavigate={handleNavigate}
        userRole={userRole}
        alertsCount={unreadNotificationsCount}
        selectedLanguage={selectedLanguage}
        onSelectLanguage={setSelectedLanguage}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <Header
          currentUser={currentUser}
          onOpenAuth={() => {
            setAuthModalRole('citizen');
            setIsAuthModalOpen(true);
          }}
          onLogout={handleLogout}
          onReportEmergency={() => setActiveView('report-emergency')}
          activeView={activeView}
          isDemoMode={isDemoMode}
          onToggleDemoMode={handleToggleDemoMode}
          unreadNotificationsCount={unreadNotificationsCount}
          onToggleNotifications={() => setIsNotificationDrawerOpen(true)}
          weather={weather}
          selectedLanguage={selectedLanguage}
          onSelectLanguage={setSelectedLanguage}
        />

        <main className="flex-1 pb-16">
          {/* 1. CITIZEN HOME */}
          {activeView === 'citizen-home' && (
            <CitizenDashboard
              currentUser={currentUser}
              stats={stats}
              riskAssessment={riskAssessment}
              weather={weather}
              shelters={shelters}
              roads={roads}
              notifications={notifications}
              recentIncidents={incidents}
              onNavigate={handleNavigate}
              onOpenSafeRoute={handleOpenSafeRoute}
              onOpenIncidentDetail={(inc) => {
                setSelectedIncidentForInspection(inc);
              }}
            />
          )}

          {/* 2. REPORT EMERGENCY 5-STEP WIZARD */}
          {activeView === 'report-emergency' && (
            <EmergencyReportWizard
              currentUser={currentUser}
              onFinished={() => {
                refreshAllData();
                setActiveView('citizen-home');
              }}
              onNavigateToSafeRoute={(shelterId) => {
                handleOpenSafeRoute(shelterId);
              }}
            />
          )}

          {/* 3. FIELD OFFICER DASHBOARD & VERIFICATION QUEUE */}
          {(activeView === 'officer-dashboard' || activeView === 'verification') && (
            <FieldOfficerDashboard
              currentUser={currentUser}
              stats={stats}
              incidents={incidents}
              roads={roads}
              shelters={shelters}
              villages={villages}
              riskAssessment={riskAssessment}
              onRefreshData={refreshAllData}
              onOpenSafeRoute={handleOpenSafeRoute}
            />
          )}

          {/* 3B. FIELD INSPECTION OPERATIONS */}
          {activeView === 'field-inspection' && (
            <FieldInspectionView
              incidents={incidents}
              currentUser={currentUser}
              onRefreshData={refreshAllData}
              onOpenSafeRoute={handleOpenSafeRoute}
            />
          )}

          {/* 3C. EMERGENCY ACTIONS & RAPID MITIGATION */}
          {activeView === 'emergency' && (
            <EmergencyActionView
              incidents={incidents}
              roads={roads}
              shelters={shelters}
              villages={villages}
              currentUser={currentUser}
              onRefreshData={refreshAllData}
              onOpenSafeRoute={handleOpenSafeRoute}
            />
          )}

          {/* 4. DISTRICT ADMIN COMMAND CENTER */}
          {activeView === 'admin-dashboard' && (
            <AdminCommandCenter
              stats={stats}
              incidents={incidents}
              roads={roads}
              shelters={shelters}
              villages={villages}
              weather={weather}
              riskAssessment={riskAssessment}
              latestRealtimeIncidentId={latestRealtimeIncidentId}
              realtimeStatus={realtimeStatus}
              realtimeEventCount={realtimeEventCount}
              recentBroadcastBanner={recentBroadcastBanner}
              onDismissBanner={dismissBanner}
              onSimulateEvent={simulateEvent}
              onSelectRealtimeIncident={(id) => setLatestRealtimeIncidentId(id)}
              onRefreshData={refreshAllData}
              onOpenSafeRoute={handleOpenSafeRoute}
              onNavigateToRoads={() => setActiveView('safe-roads')}
              onNavigateToShelters={() => setActiveView('shelters')}
            />
          )}

          {/* 4B. ACTIVE EMERGENCIES DEDICATED VIEW */}
          {activeView === 'emergencies' && (
            <ActiveEmergenciesView
              incidents={incidents}
              roads={roads}
              shelters={shelters}
              villages={villages}
              onRefreshData={refreshAllData}
              onOpenSafeRoute={handleOpenSafeRoute}
            />
          )}

          {/* 4C. FIELD DEPLOYMENT COMMAND */}
          {activeView === 'field-officers' && (
            <FieldDeploymentView />
          )}

          {/* 4D. AUDIT & SYSTEM DIAGNOSTICS */}
          {activeView === 'settings' && (
            <AuditSystemView />
          )}

          {/* 5. SAFETY SHELTERS & SAFE ROUTE */}
          {activeView === 'shelters' && (
            <ShelterFinderView
              shelters={shelters}
              roads={roads}
              initialTargetShelterId={targetShelterId}
              userCoordinates={[27.1124, 95.3423]}
            />
          )}

          {/* 6. SAFE ROADS MONITORING & UPDATES */}
          {activeView === 'safe-roads' && (
            <RoadManagementView
              roads={roads}
              currentUser={currentUser}
              onRefreshData={refreshAllData}
            />
          )}

          {/* 7. LIVE GIS RISK MAP FULL CANVAS */}
          {activeView === 'risk-map' && (
            <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-red-600" />
                    <span>Regional GIS Hazard & Incident Map</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Live geospatial layer plotting incidents, roadblocks, shelters, and vulnerable villages.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={refreshAllData}
                    className="px-3 py-1.5 bg-slate-800 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Refresh Map Feed</span>
                  </button>
                </div>
              </div>

              {/* Real AI Risk Prediction Banner for Citizen Risk Map */}
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 border border-indigo-900/50 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-600 rounded-xl mt-0.5">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-wider text-purple-300">
                        AI Geospatial Threat Classification
                      </span>
                      <span className="text-[10px] bg-purple-800/80 text-purple-200 px-2 py-0.2 rounded-full font-bold">
                        GSI/ISRO Calibrated
                      </span>
                    </div>
                    <div className="text-base font-black mt-0.5">
                      Sector: {riskAssessment.district}
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Rainfall: <strong>{riskAssessment.rainfallMm || 120} mm</strong> • Slope: <strong>{riskAssessment.slopeAngleDeg || 42}°</strong> • Soil Saturation: <strong>{riskAssessment.soilMoisture || '94%'}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white/10 px-3.5 py-2.5 rounded-xl border border-white/10 self-start md:self-auto">
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-bold text-slate-300">Landslide Probability</div>
                    <div className="text-2xl font-black font-mono text-white">
                      {riskAssessment.landslideProbability !== undefined ? riskAssessment.landslideProbability : riskAssessment.riskScore}%
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-black uppercase rounded-lg shadow-2xs ${
                      (riskAssessment.riskClassification === 'Critical' || riskAssessment.riskLevel === 'CRITICAL')
                        ? 'bg-red-600 text-white'
                        : (riskAssessment.riskClassification === 'High' || riskAssessment.riskLevel === 'HIGH')
                        ? 'bg-orange-600 text-white'
                        : (riskAssessment.riskClassification === 'Moderate' || riskAssessment.riskLevel === 'MODERATE')
                        ? 'bg-amber-500 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {riskAssessment.riskClassification || riskAssessment.riskLevel} Risk
                  </span>
                </div>
              </div>

              {/* Explainable AI ("Why this risk?") Section for Citizen Risk Map */}
              <ExplainableAiSection riskAssessment={riskAssessment} defaultExpanded={false} />

              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                <InteractiveGisMap
                  center={[27.1124, 95.3423]}
                  zoom={12}
                  incidents={incidents}
                  roads={roads}
                  shelters={shelters}
                  villages={villages}
                  height="650px"
                />
              </div>
            </div>
          )}

          {/* 8. AI RISK & ANALYTICS */}
          {activeView === 'analytics' && (
            <RiskAnalyticsView
              riskAssessment={riskAssessment}
              weather={weather}
              incidents={incidents}
              onTriggerEvaluation={async () => {
                await apiService.evaluateRisk({ district: 'Longding Sector' });
                refreshAllData();
              }}
            />
          )}

          {/* 9. ALERTS LIST */}
          {activeView === 'alerts' && (
            <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <div>
                  <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-amber-600" />
                    <span>{t('officialBroadcasts', 'Official Disaster Broadcasts & Warnings')}</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t('officialBroadcastsDesc', 'Direct communications from the District Magistrate and State Disaster Management.')}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {unreadNotificationsCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="px-3 py-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 hover:text-sky-800 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <CheckCheck className="w-4 h-4" />
                      <span>{t('markAllRead', 'Mark all as read')} ({unreadNotificationsCount})</span>
                    </button>
                  )}
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg">
                    {notifications.length} {t('allAlerts', 'Alerts')}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {notifications.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200">
                    <CheckCheck className="w-10 h-10 mx-auto mb-2 text-emerald-500/60" />
                    <p className="font-semibold text-slate-700 text-sm">{t('noAlerts', 'No new alerts. All systems operational.')}</p>
                  </div>
                ) : (
                  notifications.map((n) => {
                    const isCrit = n.type === 'emergency';
                    const isUnread = !n.isRead;

                    return (
                      <div
                        key={n.id}
                        id={`alert-card-${n.id}`}
                        className={`p-4 rounded-2xl border text-xs shadow-2xs transition-all relative ${
                          isUnread
                            ? isCrit
                              ? 'bg-red-50/90 border-red-300 ring-1 ring-red-200'
                              : 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-100'
                            : 'bg-white border-slate-200 opacity-80'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 font-bold mb-1.5">
                          <div className="flex items-center gap-2">
                            {isUnread && (
                              <span className="w-2.5 h-2.5 rounded-full bg-sky-600 animate-pulse shrink-0" />
                            )}
                            <span className="text-sm font-extrabold text-slate-900">{n.title}</span>
                          </div>
                          <span className="text-[11px] text-slate-500 font-normal shrink-0">{n.timestamp}</span>
                        </div>

                        <p className="text-slate-700 text-xs leading-relaxed mt-1">{n.message}</p>

                        <div className="mt-3 pt-2.5 border-t border-black/5 flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 font-medium">
                            {n.recipientRole ? `Target: ${n.recipientRole.replace('_', ' ').toUpperCase()}` : 'Broadcast to all'}
                          </span>

                          <div className="flex items-center gap-2">
                            {isUnread ? (
                              <button
                                onClick={() => handleMarkAsRead(n.id)}
                                className="px-2.5 py-1 rounded-lg bg-sky-100/70 hover:bg-sky-200 text-sky-800 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>{t('markAsRead', 'Mark as read')}</span>
                              </button>
                            ) : (
                              <span className="text-slate-400 font-medium flex items-center gap-1">
                                <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Read</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* 10. MY REPORTS / REPORTS */}
          {(activeView === 'my-reports' || activeView === 'reports') && (
            <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-sky-600" />
                    <span>Emergency Incident Reports Directory</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Track report lifecycle from Reported to Resolved.
                  </p>
                </div>
                <button
                  onClick={() => setActiveView('report-emergency')}
                  className="px-4 py-2 bg-red-600 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <Flame className="w-4 h-4" />
                  <span>Report New Incident</span>
                </button>
              </div>

              <div className="space-y-3">
                {incidents.map((inc) => (
                  <div
                    key={inc.id}
                    className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-sky-700">{inc.reportNumber}</span>
                      <span
                        className={`px-2.5 py-0.5 rounded font-black text-[10px] ${
                          inc.severity === 'Critical'
                            ? 'bg-red-600 text-white'
                            : inc.severity === 'High'
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-200 text-slate-800'
                        }`}
                      >
                        Priority {inc.priority} ({inc.severity})
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm">{inc.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{inc.description}</p>

                    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
                      <span>📍 {inc.locationName}</span>
                      <span>Reporter: {inc.reporterName}</span>
                      <span>
                        Status: <strong className="text-slate-800">{inc.status}</strong>
                      </span>
                    </div>

                    {inc.media && inc.media.length > 0 && (
                      <div className="flex gap-2 pt-2">
                        {inc.media.map((m, i) => (
                          <img
                            key={i}
                            src={m.url}
                            alt="evidence"
                            className="w-20 h-20 object-cover rounded-lg border border-slate-200"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 11. PROFILE */}
          {activeView === 'profile' && (
            <div className="max-w-xl mx-auto p-4 sm:p-6 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs text-center">
                <div className="w-20 h-20 rounded-full mx-auto overflow-hidden border-2 border-slate-300 mb-3">
                  <img
                    src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h2 className="text-lg font-extrabold text-slate-900">{currentUser?.name || 'Citizen User'}</h2>
                <div className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                  {currentUser?.role.replace('_', ' ')}
                </div>

                <div className="mt-6 text-left space-y-2 text-xs divide-y divide-slate-100">
                  <div className="pt-2 flex justify-between">
                    <span className="text-slate-500">{t('officialUserId', 'Official / User ID')}:</span>
                    <span className="font-mono font-bold text-slate-800">{currentUser?.officialId || currentUser?.id}</span>
                  </div>
                  <div className="pt-2 flex justify-between">
                    <span className="text-slate-500">{t('contactMobile', 'Contact Mobile')}:</span>
                    <span className="font-mono font-bold text-slate-800">{currentUser?.phone}</span>
                  </div>
                  <div className="pt-2 flex justify-between">
                    <span className="text-slate-500">{t('emailAddress', 'Email Address')}:</span>
                    <span className="font-bold text-slate-800">{currentUser?.email || 'Not configured'}</span>
                  </div>
                  <div className="pt-2 flex justify-between">
                    <span className="text-slate-500">{t('assignedRegion', 'Assigned Region')}:</span>
                    <span className="font-bold text-slate-800">{currentUser?.location}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex justify-center gap-2">
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-50 text-red-600 font-bold text-xs rounded-xl hover:bg-red-100 cursor-pointer"
                  >
                    {t('signOut', 'Sign Out')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modals & Drawers */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        initialRole={authModalRole}
      />

      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onNotificationClick={(n) => {
          handleMarkAsRead(n.id);
          setIsNotificationDrawerOpen(false);
          setActiveView('alerts');
        }}
      />
    </div>
  );
}
