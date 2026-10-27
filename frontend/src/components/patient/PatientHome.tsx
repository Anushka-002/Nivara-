import React, { useState } from 'react';
import { PatientStatus } from '../../types';
import { api } from '../../services/api';
import {
  Calendar, Pill, Search, AlertCircle, Mic, Volume2,
  Smile, Meh, Frown, Sparkles, HeartHandshake, CheckCircle2
} from 'lucide-react';

interface PatientHomeProps {
  status: PatientStatus;
  onNavigate: (tab: string) => void;
  onRefresh: () => void;
}

export const PatientHome: React.FC<PatientHomeProps> = ({
  status,
  onNavigate,
  onRefresh
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceQuery, setVoiceQuery] = useState('');
  const [spokenReply, setSpokenReply] = useState<string | null>(null);
  const [checkinMessage, setCheckinMessage] = useState<string | null>(null);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9; // gentle, readable pacing
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleTalkToNivara = async (samplePrompt?: string) => {
    const prompt = samplePrompt || voiceQuery || 'What should I do now?';
    try {
      const res = await api.askCompanion(prompt, 'voice');
      setSpokenReply(res.spoken_text);
      speakText(res.spoken_text);
      if (res.action_target && res.action_target.startsWith('/')) {
        setTimeout(() => {
          onNavigate(res.action_target.replace('/', ''));
        }, 2200);
      }
    } catch (e) {
      console.error(e);
      const fallback = `You are doing well today, ${status.preferred_name}. Your next activity is ${status.next_activity || 'rest'}.`;
      setSpokenReply(fallback);
      speakText(fallback);
    }
  };

  const handleCheckin = async (mood: string) => {
    try {
      const res = await api.submitCheckin(mood);
      setCheckinMessage(res.message);
      speakText(res.message);
      setTimeout(() => setCheckinMessage(null), 5000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* 1. Calm Greeting Card */}
      <div className="bg-gradient-to-br from-emerald-50 via-teal-50/50 to-stone-50 border-2 border-emerald-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-3xl sm:text-4xl">☀️</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-2 font-serif">
              Good Morning, {status.preferred_name} ❤️
            </h1>
            <p className="text-lg sm:text-xl text-emerald-800 font-semibold mt-1">
              You are doing well today.
            </p>
          </div>

          <button
            onClick={() => speakText(`Good morning ${status.preferred_name}. You are doing well today. Your next activity is ${status.next_activity} at ${status.next_time}.`)}
            className="p-3 bg-white/90 rounded-2xl border border-emerald-300 text-emerald-700 hover:bg-emerald-100 transition shadow-xs cursor-pointer"
            title="Read aloud"
          >
            <Volume2 className="w-6 h-6" />
          </button>
        </div>

        {/* Next activity highlight */}
        <div className="mt-5 pt-4 border-t border-emerald-200/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🗓️</span>
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-emerald-800/80">
                Next Daily Rhythm
              </span>
              <p className="text-base sm:text-lg font-bold text-stone-900">
                {status.next_activity || 'Rest and relaxing walk'}
              </p>
            </div>
          </div>
          {status.next_time && (
            <span className="px-3 py-1.5 bg-emerald-100/90 text-emerald-900 rounded-xl font-bold text-sm">
              {status.next_time}
            </span>
          )}
        </div>
      </div>

      {/* 2. Four Large Action Cards (Section 4 Rule: ICON + LARGE TEXT + SHORT DESCRIPTION) */}
      <div className="grid grid-cols-1 gap-4">
        {/* Button 1: WHAT SHOULD I DO NOW? */}
        <button
          onClick={() => onNavigate('my-day')}
          className="patient-card-touch w-full p-5 sm:p-6 bg-white hover:bg-emerald-50/50 border-2 border-stone-200 hover:border-emerald-400 rounded-3xl shadow-sm text-left flex items-center gap-4 sm:gap-6 cursor-pointer"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-3xl sm:text-4xl shrink-0">
            🗓️
          </div>
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              WHAT SHOULD I DO NOW?
            </h2>
            <p className="text-base text-stone-600 font-medium mt-0.5">
              See what comes next today step by step
            </p>
          </div>
        </button>

        {/* Button 2: MY MEDICINE */}
        <button
          onClick={() => onNavigate('my-medicine')}
          className="patient-card-touch w-full p-5 sm:p-6 bg-white hover:bg-sky-50/50 border-2 border-stone-200 hover:border-sky-400 rounded-3xl shadow-sm text-left flex items-center gap-4 sm:gap-6 cursor-pointer"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center text-3xl sm:text-4xl shrink-0">
            💊
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                MY MEDICINE
              </h2>
              {status.medicine_pending_count > 0 && (
                <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full text-xs font-bold">
                  Due today
                </span>
              )}
            </div>
            <p className="text-base text-stone-600 font-medium mt-0.5">
              See your blue, white, and pink medicines
            </p>
          </div>
        </button>

        {/* Button 3: HELP ME FIND SOMETHING */}
        <button
          onClick={() => onNavigate('find-something')}
          className="patient-card-touch w-full p-5 sm:p-6 bg-white hover:bg-purple-50/50 border-2 border-stone-200 hover:border-purple-400 rounded-3xl shadow-sm text-left flex items-center gap-4 sm:gap-6 cursor-pointer"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center text-3xl sm:text-4xl shrink-0">
            🔎
          </div>
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              HELP ME FIND SOMETHING
            </h2>
            <p className="text-base text-stone-600 font-medium mt-0.5">
              Find your glasses, keys, wallet, or phone
            </p>
          </div>
        </button>

        {/* Button 4: I NEED HELP */}
        <button
          onClick={() => onNavigate('get-help')}
          className="patient-card-touch w-full p-5 sm:p-6 bg-rose-50/80 hover:bg-rose-100/90 border-2 border-rose-300 hover:border-rose-400 rounded-3xl shadow-sm text-left flex items-center gap-4 sm:gap-6 cursor-pointer"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-rose-200 text-rose-900 flex items-center justify-center text-3xl sm:text-4xl shrink-0">
            🆘
          </div>
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl font-black text-rose-950 tracking-tight">
              I NEED HELP
            </h2>
            <p className="text-base text-rose-800 font-medium mt-0.5">
              Get home, talk to family, or call for help
            </p>
          </div>
        </button>
      </div>

      {/* 3. Large Microphone Button (Section 4: TALK TO NIVARA) */}
      <div className="bg-white border-2 border-stone-200 rounded-3xl p-6 shadow-sm text-center space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500">
          Voice Companion
        </h3>

        <button
          onClick={() => handleTalkToNivara()}
          className="patient-card-touch mx-auto flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-extrabold text-xl shadow-md hover:shadow-lg transition cursor-pointer"
        >
          <Mic className={`w-8 h-8 ${isSpeaking ? 'animate-bounce text-amber-300' : ''}`} />
          <span>🎤 TALK TO NIVARA</span>
        </button>

        {/* Quick Voice Chips */}
        <div className="flex flex-wrap justify-center gap-2 pt-2">
          <button
            onClick={() => handleTalkToNivara('What should I do now?')}
            className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 rounded-full text-xs font-semibold text-stone-700 cursor-pointer"
          >
            "What should I do now?"
          </button>
          <button
            onClick={() => handleTalkToNivara('Where are my glasses?')}
            className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 rounded-full text-xs font-semibold text-stone-700 cursor-pointer"
          >
            "Where are my glasses?"
          </button>
          <button
            onClick={() => handleTalkToNivara('Help me get home')}
            className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 rounded-full text-xs font-semibold text-stone-700 cursor-pointer"
          >
            "Help me get home"
          </button>
        </div>

        {spokenReply && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-950 text-base font-semibold text-left flex items-start gap-3">
            <span className="text-xl">💬</span>
            <div className="flex-1">
              <span className="text-xs font-bold text-emerald-800 uppercase block">Nivara Spoke:</span>
              <p className="mt-0.5">{spokenReply}</p>
            </div>
            <button
              onClick={() => speakText(spokenReply)}
              className="p-1 text-emerald-700 hover:text-emerald-900 cursor-pointer"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* 4. Section 27: Confidence / Independence Card */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border border-emerald-200 rounded-2xl p-4 sm:p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🌱</span>
          <div>
            <h4 className="text-sm font-bold text-emerald-950 uppercase tracking-wide">
              Today's Independence
            </h4>
            <p className="text-stone-700 font-semibold text-sm sm:text-base">
              You completed most of your morning routine yourself!
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xl sm:text-2xl font-black text-emerald-700">
            {status.routine_completion_pct}%
          </span>
          <span className="text-xs text-stone-500 block">Completed</span>
        </div>
      </div>

      {/* 5. Section 26: Daily Check-in */}
      <div className="bg-white border-2 border-stone-200 rounded-3xl p-5 sm:p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-stone-900">
            How are you feeling today?
          </h3>
          <span className="text-xs text-stone-500">Tap to answer</span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => handleCheckin('good')}
            className="patient-card-touch p-3 rounded-2xl border-2 border-emerald-200 hover:bg-emerald-50 flex flex-col items-center gap-1.5 cursor-pointer text-center"
          >
            <span className="text-3xl">😊</span>
            <span className="font-bold text-sm text-stone-800">Good</span>
          </button>

          <button
            onClick={() => handleCheckin('okay')}
            className="patient-card-touch p-3 rounded-2xl border-2 border-amber-200 hover:bg-amber-50 flex flex-col items-center gap-1.5 cursor-pointer text-center"
          >
            <span className="text-3xl">😐</span>
            <span className="font-bold text-sm text-stone-800">Okay</span>
          </button>

          <button
            onClick={() => handleCheckin('difficult')}
            className="patient-card-touch p-3 rounded-2xl border-2 border-rose-200 hover:bg-rose-50 flex flex-col items-center gap-1.5 cursor-pointer text-center"
          >
            <span className="text-3xl">😟</span>
            <span className="font-bold text-sm text-stone-800">Need Help</span>
          </button>
        </div>

        {checkinMessage && (
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-sm font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{checkinMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
