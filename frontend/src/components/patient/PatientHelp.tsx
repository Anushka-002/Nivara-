import React, { useState } from 'react';
import { api } from '../../services/api';
import { ArrowLeft, Home, Pill, Users, AlertOctagon, Mic, PhoneCall, Volume2 } from 'lucide-react';

interface PatientHelpProps {
  onBack: () => void;
  onNavigate: (tab: string) => void;
}

export const PatientHelp: React.FC<PatientHelpProps> = ({ onBack, onNavigate }) => {
  const [reassurance, setReassurance] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleHelpAction = async (needType: string, spokenText: string, redirectTab?: string) => {
    try {
      setLoading(true);
      const res = await api.requestHelp(needType);
      const msg = res.spoken_reassurance || spokenText;
      setReassurance(msg);

      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(msg);
        u.rate = 0.9;
        window.speechSynthesis.speak(u);
      }

      if (redirectTab) {
        setTimeout(() => {
          onNavigate(redirectTab);
        }, 2500);
      }
    } catch (e) {
      console.error(e);
      setReassurance('We are here with you. Contacting your family right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border-2 border-stone-300 text-stone-800 font-bold hover:bg-stone-100 transition shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <h1 className="text-xl sm:text-2xl font-black text-rose-900 font-serif">
          🆘 I Need Help
        </h1>
      </div>

      {/* Gentle reassurance box (Section 27) */}
      <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-6 text-center space-y-2">
        <span className="text-4xl">❤️</span>
        <h2 className="text-2xl font-black text-emerald-950">
          You are safe.
        </h2>
        <p className="text-base sm:text-lg text-emerald-900 font-bold">
          You are currently in your familiar home at 14 Green Valley.
        </p>
      </div>

      {reassurance && (
        <div className="bg-emerald-600 text-white p-5 rounded-3xl font-extrabold text-lg flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🛡️</span>
            <div>
              <span className="text-xs uppercase text-emerald-200 tracking-wider block">
                Nivara Help Active
              </span>
              <span>{reassurance}</span>
            </div>
          </div>
        </div>
      )}

      {/* 4 Big Direct Help Choices (Section 6 & 28) */}
      <div className="space-y-4">
        {/* Choice 1: CALL MY FAMILY */}
        <button
          onClick={() => handleHelpAction('family', 'Connecting you to your daughter Priya.', 'my-people')}
          disabled={loading}
          className="patient-card-touch w-full p-5 sm:p-6 bg-white hover:bg-amber-50 border-2 border-stone-300 hover:border-amber-400 rounded-3xl shadow-sm flex items-center gap-4 sm:gap-6 text-left cursor-pointer"
        >
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-3xl shrink-0">
            👨‍👩‍👧
          </div>
          <div className="flex-1">
            <h3 className="text-xl sm:text-2xl font-black text-stone-900">
              CALL MY FAMILY
            </h3>
            <p className="text-base text-stone-600 font-semibold mt-0.5">
              Call your daughter Priya or son Rahul with one tap
            </p>
          </div>
        </button>

        {/* Choice 2: CALL MY NURSE */}
        <button
          onClick={() => handleHelpAction('nurse', 'Connecting you to your visiting nurse Anita.', 'my-people')}
          disabled={loading}
          className="patient-card-touch w-full p-5 sm:p-6 bg-white hover:bg-teal-50 border-2 border-stone-300 hover:border-teal-400 rounded-3xl shadow-sm flex items-center gap-4 sm:gap-6 text-left cursor-pointer"
        >
          <div className="w-16 h-16 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center text-3xl shrink-0">
            👩‍⚕️
          </div>
          <div className="flex-1">
            <h3 className="text-xl sm:text-2xl font-black text-stone-900">
              CALL MY NURSE
            </h3>
            <p className="text-base text-stone-600 font-semibold mt-0.5">
              Speak directly with Visiting Nurse Anita Roy
            </p>
          </div>
        </button>

        {/* Choice 3: GET HELP / GET HOME */}
        <button
          onClick={() => handleHelpAction('lost', 'I will help you get home step by step.', 'navigation')}
          disabled={loading}
          className="patient-card-touch w-full p-5 sm:p-6 bg-white hover:bg-emerald-50 border-2 border-stone-300 hover:border-emerald-400 rounded-3xl shadow-sm flex items-center gap-4 sm:gap-6 text-left cursor-pointer"
        >
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-3xl shrink-0">
            🏠
          </div>
          <div className="flex-1">
            <h3 className="text-xl sm:text-2xl font-black text-stone-900">
              GET HELP / GO HOME
            </h3>
            <p className="text-base text-stone-600 font-semibold mt-0.5">
              Follow 4 easy walking steps back to your front door
            </p>
          </div>
        </button>

        {/* Choice 4: EMERGENCY */}
        <button
          onClick={() => handleHelpAction('emergency', 'Alerting your entire care circle and emergency services immediately.')}
          disabled={loading}
          className="patient-card-touch w-full p-5 sm:p-6 bg-rose-100 hover:bg-rose-200 border-2 border-rose-400 rounded-3xl shadow-sm flex items-center gap-4 sm:gap-6 text-left cursor-pointer"
        >
          <div className="w-16 h-16 rounded-2xl bg-rose-300 text-rose-950 flex items-center justify-center text-3xl shrink-0">
            🚨
          </div>
          <div className="flex-1">
            <h3 className="text-xl sm:text-2xl font-black text-rose-950">
              EMERGENCY
            </h3>
            <p className="text-base text-rose-900 font-bold mt-0.5">
              Connect immediately to emergency services and all guardians
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};
