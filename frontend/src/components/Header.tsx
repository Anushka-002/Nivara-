import React from 'react';
import { UserRole } from '../types';
import { Heart, Activity, Play, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  openSimulator: () => void;
  patientStatus?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  setRole,
  openSimulator,
  patientStatus = 'Stable'
}) => {
  const getStatusBadge = () => {
    switch (patientStatus) {
      case 'Critical':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 animate-calm-pulse">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
            Critical Attention
          </span>
        );
      case 'Important':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            Important Notice
          </span>
        );
      case 'Attention':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-300">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
            Attention Needed
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            Stable Baseline
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-stone-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md">
            <Heart className="w-5 h-5 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-stone-900 font-serif">Nivara</span>
              <span className="text-xs bg-stone-100 text-stone-600 font-medium px-2 py-0.5 rounded-md border border-stone-200">
                Assistive AI
              </span>
            </div>
            <p className="text-xs text-stone-500 hidden sm:block">
              Independent Living & Safety Companion
            </p>
          </div>
        </div>

        {/* Middle Status Pill */}
        <div className="hidden md:flex items-center gap-2">
          {getStatusBadge()}
        </div>

        {/* Right Controls: Role Switcher & Simulator Launcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Viva Simulation Launcher */}
          <button
            onClick={openSimulator}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 rounded-xl shadow-sm transition hover:shadow-md cursor-pointer"
            title="Launch Demo Viva Simulator"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Simulate Event & Demo</span>
            <span className="sm:hidden">Demo</span>
          </button>

          {/* Role Selector Tabs */}
          <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs sm:text-sm font-medium">
            <button
              onClick={() => setRole('patient')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                currentRole === 'patient'
                  ? 'bg-white text-emerald-800 font-bold shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>👵</span>
              <span className="hidden sm:inline">Patient</span>
            </button>
            <button
              onClick={() => setRole('family')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                currentRole === 'family'
                  ? 'bg-white text-emerald-800 font-bold shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>👩</span>
              <span className="hidden sm:inline">Family (Priya)</span>
              <span className="sm:hidden">Family</span>
            </button>
            <button
              onClick={() => setRole('nurse')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                currentRole === 'nurse'
                  ? 'bg-white text-emerald-800 font-bold shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>👩‍⚕️</span>
              <span className="hidden sm:inline">Nurse</span>
            </button>
            <button
              onClick={() => setRole('doctor')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                currentRole === 'doctor'
                  ? 'bg-white text-emerald-800 font-bold shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>👨‍⚕️</span>
              <span className="hidden sm:inline">Doctor</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
