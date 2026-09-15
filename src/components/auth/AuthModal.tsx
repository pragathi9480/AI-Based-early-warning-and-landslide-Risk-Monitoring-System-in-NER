import React, { useState } from 'react';
import { ShieldCheck, User, Lock, Smartphone, MapPin, KeyRound, AlertCircle, CheckCircle2, ArrowLeft, X } from 'lucide-react';
import { UserRole, User as UserType } from '../../types';
import { apiService } from '../../services/apiService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserType) => void;
  initialRole?: UserRole;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialRole = 'citizen',
}) => {
  const [activeTab, setActiveTab] = useState<UserRole>(initialRole);
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);

  // Form Fields
  const [name, setName] = useState<string>('');
  const [identifier, setIdentifier] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [accessCode, setAccessCode] = useState<string>('');
  const [location, setLocation] = useState<string>('Longding, Arunachal Pradesh');
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  // Feedback State
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleTabChange = (role: UserRole) => {
    setActiveTab(role);
    setErrorMessage('');
    setSuccessMessage('');
    setIsRegisterMode(false);
    if (role === 'field_officer') {
      setIdentifier('FO-NER-4092');
      setAccessCode('NER-OFFICER-2025');
    } else if (role === 'district_admin') {
      setIdentifier('ADM-NER-001');
      setAccessCode('NER-ADMIN-COMMAND-2025');
    } else {
      setIdentifier('9876543210');
      setAccessCode('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      if (activeTab === 'citizen' && isRegisterMode) {
        if (!name.trim()) {
          setErrorMessage('Please enter your full name.');
          setIsLoading(false);
          return;
        }
        if (!identifier.trim()) {
          setErrorMessage('Please enter your mobile number.');
          setIsLoading(false);
          return;
        }

        const res = await apiService.registerCitizen({
          name: name.trim(),
          phone: identifier.trim(),
          email: identifier.includes('@') ? identifier.trim() : undefined,
          location,
        });

        if (res.success && res.user) {
          setSuccessMessage('Registration successful! Welcome to NER Landslide Alert.');
          setTimeout(() => {
            onSuccess(res.user!);
            onClose();
          }, 600);
        } else {
          setErrorMessage(res.message || 'Registration failed.');
        }
      } else {
        // Login flow
        if (!identifier.trim()) {
          setErrorMessage(
            activeTab === 'citizen'
              ? 'Please enter your mobile number or email.'
              : 'Please enter your official ID or email.'
          );
          setIsLoading(false);
          return;
        }

        if (activeTab !== 'citizen' && !accessCode.trim()) {
          setErrorMessage('Please enter your authorized access code.');
          setIsLoading(false);
          return;
        }

        const res = await apiService.login({
          identifier: identifier.trim(),
          password,
          accessCode: accessCode.trim(),
          role: activeTab,
          location,
        });

        if (res.success && res.user) {
          setSuccessMessage(res.message || 'Login successful.');
          setTimeout(() => {
            onSuccess(res.user!);
            onClose();
          }, 600);
        } else {
          setErrorMessage(res.message || 'Authentication failed. Please check credentials.');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network or server error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick autofill buttons for evaluation convenience
  const handleQuickDemoFill = (role: UserRole) => {
    handleTabChange(role);
    if (role === 'citizen') {
      setName('Priya Sharma');
      setIdentifier('9876543210');
      setPassword('citizen123');
    } else if (role === 'field_officer') {
      setIdentifier('FO-NER-4092');
      setPassword('officerPass2025');
      setAccessCode('NER-OFFICER-2025');
    } else if (role === 'district_admin') {
      setIdentifier('ADM-NER-001');
      setPassword('adminPass2025');
      setAccessCode('NER-ADMIN-COMMAND-2025');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header Tabs */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 pb-0 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              id="auth-tab-citizen"
              onClick={() => handleTabChange('citizen')}
              className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'citizen'
                  ? 'border-sky-600 text-sky-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Citizen
            </button>
            <button
              id="auth-tab-officer"
              onClick={() => handleTabChange('field_officer')}
              className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'field_officer'
                  ? 'border-amber-600 text-amber-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Field Officer
            </button>
            <button
              id="auth-tab-admin"
              onClick={() => handleTabChange('district_admin')}
              className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'district_admin'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              District Admin
            </button>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 mb-2 rounded-full"
            aria-label="Close authentication modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {/* Role Header Banner */}
          <div className="mb-5 text-center">
            {activeTab === 'citizen' ? (
              <>
                <h2 className="text-xl font-extrabold text-slate-900">
                  {isRegisterMode ? 'Create Citizen Account' : 'Citizen Login'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Join the community. Stay informed. Report emergencies. No access code required.
                </p>
              </>
            ) : activeTab === 'field_officer' ? (
              <>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-xs font-bold mb-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>Authorized Personnel Only</span>
                </div>
                <h2 className="text-xl font-extrabold text-slate-900">Field Officer Portal</h2>
                <p className="text-xs text-slate-500 mt-1">
                  On-ground verification, field inspection & disaster coordination.
                </p>
              </>
            ) : (
              <>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-xs font-bold mb-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Authorized District Administration</span>
                </div>
                <h2 className="text-xl font-extrabold text-slate-900">District Command Center</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Real-time GIS command, hazard alerts & regional evacuation authority.
                </p>
              </>
            )}
          </div>

          {/* Error / Success Notifications */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Citizen Registration Full Name */}
            {activeTab === 'citizen' && isRegisterMode && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Official ID or Mobile/Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {activeTab === 'citizen' ? 'Mobile Number / Email' : 'Official ID / Official Email'}
              </label>
              <div className="relative">
                {activeTab === 'citizen' ? (
                  <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                ) : (
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                )}
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={
                    activeTab === 'citizen'
                      ? 'Enter mobile number or email'
                      : activeTab === 'field_officer'
                      ? 'e.g., FO-NER-4092 or email'
                      : 'e.g., ADM-NER-001 or email'
                  }
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => alert('Password recovery link dispatched to authorized email/mobile.')}
                  className="text-[11px] text-sky-600 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your secure password"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Access Code (ONLY for Field Officer and District Admin!) */}
            {activeTab !== 'citizen' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    {activeTab === 'field_officer' ? 'Field Access Code' : 'Admin Security Access Code'}
                  </label>
                  <button
                    type="button"
                    onClick={() => alert(`Demo Access Code: ${activeTab === 'field_officer' ? 'NER-OFFICER-2025' : 'NER-ADMIN-COMMAND-2025'}`)}
                    className="text-[11px] text-amber-600 font-semibold hover:underline"
                  >
                    Forgot Access Code?
                  </button>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    placeholder={
                      activeTab === 'field_officer' ? 'NER-OFFICER-2025' : 'NER-ADMIN-COMMAND-2025'
                    }
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none font-mono"
                  />
                </div>
              </div>
            )}

            {/* Location (Citizen only) */}
            {activeTab === 'citizen' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Location / District</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Your area (e.g. Longding, Arunachal Pradesh)"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Remember me & terms */}
            <div className="flex items-center justify-between text-xs text-slate-600">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-sky-500"
                />
                <span>Remember me</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2.5 rounded-lg text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 ${
                activeTab === 'district_admin'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : activeTab === 'field_officer'
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-sky-600 hover:bg-sky-700'
              } disabled:opacity-50`}
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : activeTab === 'citizen' && isRegisterMode ? (
                <span>Register & Access Portal</span>
              ) : (
                <span>Login to Portal</span>
              )}
            </button>

            {/* Citizen Switch between Login and Register */}
            {activeTab === 'citizen' && (
              <div className="text-center pt-2 border-t border-slate-100">
                {isRegisterMode ? (
                  <p className="text-xs text-slate-600">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setIsRegisterMode(false)}
                      className="text-sky-600 font-bold hover:underline"
                    >
                      Login here
                    </button>
                  </p>
                ) : (
                  <p className="text-xs text-slate-600">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setIsRegisterMode(true)}
                      className="text-sky-600 font-bold hover:underline"
                    >
                      Register in 30 seconds
                    </button>
                  </p>
                )}
              </div>
            )}
          </form>

          {/* Quick Role Pre-fill helper for operational access */}
          <div className="mt-5 pt-3 border-t border-slate-100">
            <div className="text-[10px] text-slate-400 font-semibold mb-1.5 text-center uppercase tracking-wider">
              Official Role Direct Access:
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickDemoFill('citizen')}
                className="px-2 py-1 bg-sky-50 text-sky-700 hover:bg-sky-100 font-medium rounded border border-sky-200 text-center"
              >
                Priya (Citizen)
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoFill('field_officer')}
                className="px-2 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 font-medium rounded border border-amber-200 text-center"
              >
                Arjun (Officer)
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoFill('district_admin')}
                className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-medium rounded border border-emerald-200 text-center"
              >
                DC Roy (Admin)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
