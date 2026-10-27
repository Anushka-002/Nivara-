import React from 'react';
import { Home, Calendar, Pill, Search, Users, AlertCircle } from 'lucide-react';

interface PatientBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const PatientBottomNav: React.FC<PatientBottomNavProps> = ({
  activeTab,
  onTabChange
}) => {
  const tabs = [
    { id: 'home', label: 'HOME', icon: '🏠' },
    { id: 'my-day', label: 'MY DAY', icon: '🗓️' },
    { id: 'my-medicine', label: 'MY MEDICINE', icon: '💊' },
    { id: 'find-something', label: 'FIND', icon: '🔎' },
    { id: 'my-people', label: 'PEOPLE', icon: '👥' },
    { id: 'get-help', label: 'GET HELP', icon: '🆘' },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur border-t-2 border-stone-200 shadow-lg px-2 py-2">
      <div className="max-w-2xl mx-auto flex items-center justify-around gap-1">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          const isHelp = tab.id === 'get-help';

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`patient-card-touch flex-1 py-1.5 px-1 rounded-2xl flex flex-col items-center justify-center transition cursor-pointer ${
                isActive
                  ? isHelp
                    ? 'bg-rose-100 text-rose-950 font-black'
                    : 'bg-emerald-100 text-emerald-950 font-black ring-2 ring-emerald-400'
                  : isHelp
                  ? 'text-rose-700 hover:bg-rose-50 font-bold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100 font-semibold'
              }`}
            >
              <span className="text-2xl sm:text-3xl leading-none">{tab.icon}</span>
              <span className="text-[10px] sm:text-xs tracking-tight mt-1 truncate">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
