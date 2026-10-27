import React, { useState, useEffect } from 'react';
import { UserRole, PatientStatus } from './types';
import { api } from './services/api';
import { Header } from './components/Header';
import { DemoSimulatorModal } from './components/DemoSimulatorModal';

// Patient Views
import { PatientHome } from './components/patient/PatientHome';
import { PatientRoutine } from './components/patient/PatientRoutine';
import { PatientMedicine } from './components/patient/PatientMedicine';
import { PatientObjectFinder } from './components/patient/PatientObjectFinder';
import { PatientPeople } from './components/patient/PatientPeople';
import { PatientHelp } from './components/patient/PatientHelp';
import { PatientNavigation } from './components/patient/PatientNavigation';
import { PatientMemoryBook } from './components/patient/PatientMemoryBook';
import { PatientCognitiveGame } from './components/patient/PatientCognitiveGame';
import { PatientPrivacy } from './components/patient/PatientPrivacy';
import { PatientBottomNav } from './components/patient/PatientBottomNav';

// Guardian & Doctor Views
import { GuardianDashboard } from './components/guardian/GuardianDashboard';
import { GuardianAlerts } from './components/guardian/GuardianAlerts';
import { DoctorView } from './components/doctor/DoctorView';

export function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('patient');
  const [patientTab, setPatientTab] = useState<string>('home');
  const [guardianTab, setGuardianTab] = useState<'dashboard' | 'alerts'>('dashboard');
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);
  const [patientStatus, setPatientStatus] = useState<PatientStatus | null>(null);

  const refreshPatientStatus = async () => {
    try {
      const data = await api.getPatientStatus();
      setPatientStatus(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    refreshPatientStatus();
    const interval = setInterval(refreshPatientStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 pb-24">
      {/* Universal Top Header */}
      <Header
        currentRole={currentRole}
        setRole={role => {
          setCurrentRole(role);
          if (role === 'patient') setPatientTab('home');
        }}
        openSimulator={() => setIsSimulatorOpen(true)}
        patientStatus={patientStatus?.current_status || 'Stable'}
      />

      {/* Simulator Modal for Section 46 & 47 */}
      <DemoSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        onStateChanged={() => refreshPatientStatus()}
      />

      {/* Gentle Safe Navigation Prompt if Patient is Outside Safe Zone */}
      {currentRole === 'patient' && patientStatus?.current_status === 'Important' && patientTab !== 'navigation' && (
        <div className="max-w-2xl mx-auto px-4 pt-4">
          <div className="bg-amber-100 border-2 border-amber-300 rounded-3xl p-5 flex items-center justify-between gap-4 shadow-sm animate-calm-pulse">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🧭</span>
              <div>
                <h3 className="font-extrabold text-amber-950 text-lg">
                  Are you trying to go somewhere?
                </h3>
                <p className="text-amber-900 text-sm font-semibold">
                  Nivara can guide you home safely step by step.
                </p>
              </div>
            </div>
            <button
              onClick={() => setPatientTab('navigation')}
              className="px-5 py-3 rounded-2xl bg-amber-800 hover:bg-amber-900 text-white font-extrabold text-sm cursor-pointer shadow-xs shrink-0"
            >
              Help Me Get Home
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area based on User Role */}
      <main className="transition-all duration-150">
        {currentRole === 'patient' && (
          <>
            {/* Quick Secondary Links for Patient */}
            {patientTab === 'home' && (
              <div className="max-w-2xl mx-auto px-4 pt-4 flex items-center justify-center gap-2 text-xs font-bold text-stone-600">
                <button
                  onClick={() => setPatientTab('memory-book')}
                  className="px-3.5 py-1.5 rounded-xl bg-white border border-stone-200 hover:bg-stone-100 shadow-2xs cursor-pointer flex items-center gap-1.5"
                >
                  <span>📖</span>
                  <span>Memory Book</span>
                </button>
                <button
                  onClick={() => setPatientTab('cognitive')}
                  className="px-3.5 py-1.5 rounded-xl bg-white border border-stone-200 hover:bg-stone-100 shadow-2xs cursor-pointer flex items-center gap-1.5"
                >
                  <span>🧩</span>
                  <span>Matching Activity</span>
                </button>
                <button
                  onClick={() => setPatientTab('privacy')}
                  className="px-3.5 py-1.5 rounded-xl bg-white border border-stone-200 hover:bg-stone-100 shadow-2xs cursor-pointer flex items-center gap-1.5"
                >
                  <span>🔒</span>
                  <span>Who Sees My Info?</span>
                </button>
              </div>
            )}

            {/* Sub-view router */}
            {patientTab === 'home' && patientStatus && (
              <PatientHome
                status={patientStatus}
                onNavigate={tab => setPatientTab(tab)}
                onRefresh={refreshPatientStatus}
              />
            )}
            {patientTab === 'my-day' && (
              <PatientRoutine onBack={() => setPatientTab('home')} />
            )}
            {patientTab === 'my-medicine' && (
              <PatientMedicine onBack={() => setPatientTab('home')} />
            )}
            {patientTab === 'find-something' && (
              <PatientObjectFinder onBack={() => setPatientTab('home')} />
            )}
            {patientTab === 'my-people' && (
              <PatientPeople onBack={() => setPatientTab('home')} />
            )}
            {patientTab === 'get-help' && (
              <PatientHelp
                onBack={() => setPatientTab('home')}
                onNavigate={tab => setPatientTab(tab)}
              />
            )}
            {patientTab === 'navigation' && (
              <PatientNavigation onBack={() => setPatientTab('home')} />
            )}
            {patientTab === 'memory-book' && (
              <PatientMemoryBook onBack={() => setPatientTab('home')} />
            )}
            {patientTab === 'cognitive' && (
              <PatientCognitiveGame onBack={() => setPatientTab('home')} />
            )}
            {patientTab === 'privacy' && (
              <PatientPrivacy onBack={() => setPatientTab('home')} />
            )}

            {/* Bottom 5-Tab Bar for Patient */}
            <PatientBottomNav
              activeTab={patientTab}
              onTabChange={tab => setPatientTab(tab)}
            />
          </>
        )}

        {(currentRole === 'family' || currentRole === 'nurse') && (
          <>
            {guardianTab === 'dashboard' ? (
              <GuardianDashboard
                onNavigateAlerts={() => setGuardianTab('alerts')}
                onRefresh={refreshPatientStatus}
              />
            ) : (
              <GuardianAlerts
                onBack={() => setGuardianTab('dashboard')}
                onRefresh={refreshPatientStatus}
              />
            )}
          </>
        )}

        {currentRole === 'doctor' && <DoctorView />}
      </main>
    </div>
  );
}
export default App;
