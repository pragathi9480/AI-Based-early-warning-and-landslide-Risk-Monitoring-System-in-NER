import React from 'react';
import {
  Home,
  AlertTriangle,
  Bell,
  Building,
  Route,
  MapPin,
  ClipboardList,
  User,
  ShieldCheck,
  BarChart3,
  SlidersHorizontal,
  Flame,
  Globe,
  Radio,
} from 'lucide-react';
import { UserRole } from '../../types';
import { useLanguage, LanguageCode } from '../../services/i18n';

interface SidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
  userRole: UserRole | 'guest';
  alertsCount?: number;
  selectedLanguage: string;
  onSelectLanguage: (lang: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onNavigate,
  userRole,
  alertsCount = 3,
  selectedLanguage,
  onSelectLanguage,
}) => {
  const { language, setLanguage, t } = useLanguage();

  const handleLanguageChange = (newLang: string) => {
    onSelectLanguage(newLang);
    setLanguage(newLang as LanguageCode);
  };

  // Navigation items customized according to role with full i18n
  const getNavItems = () => {
    if (userRole === 'district_admin') {
      return [
        { id: 'admin-dashboard', label: t('commandCenter', 'Command Center'), icon: Radio },
        { id: 'emergencies', label: t('activeEmergencies', 'Active Emergencies'), icon: Flame, badge: alertsCount },
        { id: 'risk-map', label: t('liveGisMap', 'Live GIS Map'), icon: MapPin },
        { id: 'reports', label: t('citizenReports', 'Citizen Reports'), icon: ClipboardList },
        { id: 'field-officers', label: t('fieldDeployments', 'Field Deployments'), icon: ShieldCheck },
        { id: 'safe-roads', label: t('safeRoads', 'Safe Roads'), icon: Route },
        { id: 'shelters', label: t('safetyShelters', 'Safety Shelters'), icon: Building },
        { id: 'analytics', label: t('aiRiskAnalytics', 'AI Risk & Analytics'), icon: BarChart3 },
        { id: 'settings', label: t('auditSystem', 'Audit & System'), icon: SlidersHorizontal },
      ];
    }

    if (userRole === 'field_officer') {
      return [
        { id: 'officer-dashboard', label: t('officerDashboard', 'Officer Dashboard'), icon: Home },
        { id: 'reports', label: t('citizenReports', 'Incident Reports'), icon: ClipboardList, badge: alertsCount },
        { id: 'verification', label: t('verificationQueue', 'Verification Queue'), icon: ShieldCheck },
        { id: 'field-inspection', label: t('fieldInspection', 'Field Inspection'), icon: SlidersHorizontal },
        { id: 'emergency', label: t('emergencyActions', 'Emergency Actions'), icon: Flame },
        { id: 'risk-map', label: t('liveGisMap', 'Assigned GIS Map'), icon: MapPin },
        { id: 'safe-roads', label: t('roadConditions', 'Road Conditions'), icon: Route },
        { id: 'profile', label: t('officerProfile', 'Officer Profile'), icon: User },
      ];
    }

    // Default Citizen Navigation
    return [
      { id: 'citizen-home', label: t('home', 'Home'), icon: Home },
      { id: 'report-emergency', label: t('reportEmergency', 'Report Emergency'), icon: Flame, highlight: true },
      { id: 'alerts', label: t('alerts', 'Alerts'), icon: Bell, badge: alertsCount },
      { id: 'shelters', label: t('safetyShelters', 'Safety Shelters'), icon: Building },
      { id: 'safe-roads', label: t('safeRoads', 'Safe Roads'), icon: Route },
      { id: 'risk-map', label: t('riskMap', 'Risk Map'), icon: MapPin },
      { id: 'my-reports', label: t('myReports', 'My Reports'), icon: ClipboardList },
      { id: 'profile', label: t('profile', 'Profile'), icon: User },
    ];
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 bg-[#0d1b2a] text-slate-300 flex flex-col shrink-0 min-h-screen border-r border-slate-800 select-none">
      {/* Sidebar Header Brand */}
      <div className="p-4 border-b border-slate-800 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h1 className="font-extrabold text-white text-base tracking-wide flex items-center gap-1.5">
            <span className="text-emerald-400">{t('appName', 'AVANI')}</span>
          </h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
            {userRole === 'district_admin'
              ? t('districtAdmin', 'District Administration')
              : userRole === 'field_officer'
              ? t('fieldOfficer', 'Field Operations')
              : t('citizen', 'Citizen Portal')}
          </p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer ${
                isActive
                  ? 'bg-sky-600 text-white shadow-xs font-bold'
                  : item.highlight
                  ? 'bg-red-950/40 text-red-300 hover:bg-red-900/60 border border-red-800/40'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-red-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Role Switch & Language */}
      <div className="p-3 border-t border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-400 px-2">
          <span className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>Language</span>
          </span>
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            aria-label="Sidebar application language"
            className="bg-slate-800 text-slate-200 text-xs border border-slate-700 rounded px-1.5 py-0.5 cursor-pointer"
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
            <option value="as">অসমীয়া</option>
            <option value="bn">বাংলা</option>
          </select>
        </div>

        {/* Quick Portal Switch Bar */}
        <div className="bg-slate-900/90 rounded-lg p-2 border border-slate-800 text-[10px]">
          <div className="text-slate-400 font-semibold mb-1.5 flex items-center justify-between">
            <span>{t('switchRole', 'SWITCH PORTAL ROLE:')}</span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={() => onNavigate('citizen-home')}
              className={`py-1 rounded text-center font-bold transition-all cursor-pointer ${
                userRole === 'citizen' ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {t('citizen', 'Citizen')}
            </button>
            <button
              onClick={() => onNavigate('officer-dashboard')}
              className={`py-1 rounded text-center font-bold transition-all cursor-pointer ${
                userRole === 'field_officer' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {t('fieldOfficer', 'Officer')}
            </button>
            <button
              onClick={() => onNavigate('admin-dashboard')}
              className={`py-1 rounded text-center font-bold transition-all cursor-pointer ${
                userRole === 'district_admin' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {t('districtAdmin', 'Admin')}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
