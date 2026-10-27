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

      {/* Gentle reassurance box */}
      <div className="bg-rose-50 border-2 border-rose-200 rounded-3xl p-6 text-center space-y-2">
        <span className="text-4xl">❤️</span>
        <h2 className="text-2xl font-black text-rose-950">
          Everything is okay.
        </h2>
        <p className="text-base sm:text-lg text-rose-900 font-semibold">
          Tap what you need help with below, and Nivara will take care of you.
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

      {/* 5 Big Help Choice Buttons */}
      <div className="space-y-4">
        {/* Choice 1: I don't know where I am */}
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
              I don't know where I am
            </h3>
            <p className="text-base text-stone-600 font-semibold mt-0.5">
              Help me get home safely
            </p>
          </div>
        </button>

        {/* Choice 2: I need help with medicine */}
        <button
          onClick={() => handleHelpAction('medicine', 'Let us look at your medicines together.', 'my-medicine')}
          disabled={loading}
          className="patient-card-touch w-full p-5 sm:p-6 bg-white hover:bg-sky-50 border-2 border-stone-300 hover:border-sky-400 rounded-3xl shadow-sm flex items-center gap-4 sm:gap-6 text-left cursor-pointer"
        >
          <div className="w-16 h-16 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center text-3xl shrink-0">
            💊
          </div>
          <div className="flex-1">
            <h3 className="text-xl sm:text-2xl font-black text-stone-900">
              I need help with medicine
            </h3>
            <p className="text-base text-stone-600 font-semibold mt-0.5">
              Check what pills to take now
            </p>
          </div>
        </button>

        {/* Choice 3: I want my family */}
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
              I want my family
            </h3>
            <p className="text-base text-stone-600 font-semibold mt-0.5">
              Call Priya or Rahul directly
            </p>
          </div>
        </button>

        {/* Choice 4: Something is wrong */}
        <button
          onClick={() => handleHelpAction('emergency', 'Alerting your nurse Anita and family Priya immediately.')}
          disabled={loading}
          className="patient-card-touch w-full p-5 sm:p-6 bg-rose-100 hover:bg-rose-200 border-2 border-rose-400 rounded-3xl shadow-sm flex items-center gap-4 sm:gap-6 text-left cursor-pointer"
        >
          <div className="w-16 h-16 rounded-2xl bg-rose-300 text-rose-950 flex items-center justify-center text-3xl shrink-0">
            🚨
          </div>
          <div className="flex-1">
            <h3 className="text-xl sm:text-2xl font-black text-rose-950">
              Something is wrong
            </h3>
            <p className="text-base text-rose-900 font-bold mt-0.5">
              Emergency assistance right away
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};
