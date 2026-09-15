import React from 'react';
import { Bell, ShieldAlert, Globe, UserCheck, Flame, CloudRain } from 'lucide-react';
import { User, WeatherData } from '../../types';
import { useLanguage, LanguageCode } from '../../services/i18n';

interface HeaderProps {
  currentUser: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onReportEmergency: () => void;
  activeView: string;
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
  unreadNotificationsCount: number;
  onToggleNotifications: () => void;
  weather: WeatherData | null;
  selectedLanguage: string;
  onSelectLanguage: (lang: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onOpenAuth,
  onLogout,
  onReportEmergency,
  isDemoMode,
  onToggleDemoMode,
  unreadNotificationsCount,
  onToggleNotifications,
  weather,
  selectedLanguage,
  onSelectLanguage,
}) => {
  const { language, setLanguage, t } = useLanguage();

  const handleLanguageChange = (newLang: string) => {
    onSelectLanguage(newLang);
    setLanguage(newLang as LanguageCode);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs px-4 lg:px-6 py-2.5 flex items-center justify-between gap-3">
      {/* Left Brand / Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-600 to-sky-700 flex items-center justify-center text-white shadow-xs">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-extrabold text-base tracking-tight text-slate-900 flex items-center gap-1.5">
              <span>{t('appName', 'AVANI')}</span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-600 border border-slate-200">
                {t('appHeaderTag', 'Govt of India / NER')}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden md:block">
              {t('appSubtitle', 'Protecting land, Protecting lives')}
            </p>
          </div>
        </div>

        {/* Real Data vs Simulation Indicator Switch */}
        <div className="ml-2 hidden lg:flex items-center gap-2 bg-slate-100 p-1 rounded-full border border-slate-200">
          <button
            id="toggle-real-data-btn"
            onClick={() => isDemoMode && onToggleDemoMode()}
            className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-all cursor-pointer ${
              !isDemoMode
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ● {t('realData', 'REAL DATA')}
          </button>
          <button
            id="toggle-demo-data-btn"
            onClick={() => !isDemoMode && onToggleDemoMode()}
            className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-all cursor-pointer ${
              isDemoMode
                ? 'bg-slate-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('simulation', 'SIMULATION')}
          </button>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Real Weather Chip */}
        {weather && (
          <div className="hidden xl:flex items-center gap-2 text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700">
            <CloudRain className="w-4 h-4 text-sky-600 animate-pulse" />
            <span>
              <strong>{weather.temperatureC}°C</strong>, {weather.weatherCondition} ({weather.rainfallLast24hMm}mm)
            </span>
          </div>
        )}

        {/* Report Emergency High Visibility Button */}
        <button
          id="global-report-emergency-btn"
          onClick={onReportEmergency}
          className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold rounded-lg shadow-sm transition-all animate-pulse cursor-pointer"
        >
          <Flame className="w-4 h-4 text-white" />
          <span>{t('reportEmergency', 'REPORT EMERGENCY')}</span>
        </button>

        {/* Language Selector */}
        <div className="relative hidden md:flex items-center gap-1 text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50 text-slate-700">
          <Globe className="w-3.5 h-3.5 text-slate-500" />
          <select
            id="language-select"
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            aria-label="Select application language"
            className="bg-transparent border-none text-xs font-semibold focus:outline-none cursor-pointer"
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी (Hindi)</option>
            <option value="as">অসমীয়া (Assamese)</option>
            <option value="bn">বাংলা (Bengali)</option>
          </select>
        </div>

        {/* Notifications Bell */}
        <button
          id="notifications-toggle-btn"
          onClick={onToggleNotifications}
          aria-label="View notifications"
          className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <Bell className="w-5 h-5" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadNotificationsCount}
            </span>
          )}
        </button>

        {/* User Profile or Login */}
        {currentUser ? (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-300">
              <img
                src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                alt={currentUser.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-bold text-slate-800 leading-tight flex items-center gap-1">
                <span>{currentUser.name}</span>
                <UserCheck className="w-3 h-3 text-emerald-600" />
              </div>
              <span className="text-[10px] font-medium text-slate-500 capitalize">
                {currentUser.role.replace('_', ' ')}
              </span>
            </div>
            <button
              id="logout-btn"
              onClick={onLogout}
              className="text-xs text-slate-500 hover:text-red-600 font-medium px-2 py-1 cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <button
            id="header-login-btn"
            onClick={onOpenAuth}
            className="px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg border border-sky-200 transition-colors cursor-pointer"
          >
            Login / Portal
          </button>
        )}
      </div>
    </header>
  );
};
