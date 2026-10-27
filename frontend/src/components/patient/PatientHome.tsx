import React, { useState } from 'react';
import { PatientStatus } from '../../types';
import { api } from '../../services/api';
import {
  Calendar, Pill, Search, AlertCircle, Mic, Volume2,
  Smile, Meh, Frown, Sparkles, HeartHandshake, CheckCircle2,
  HelpCircle, BookOpen, Clock, Heart, ArrowRight, ShieldCheck
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
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotAnswer, setForgotAnswer] = useState<string | null>(null);
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [checkinMessage, setCheckinMessage] = useState<string | null>(null);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.88; // gentle, comforting pace
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
        }, 2500);
      }
    } catch (e) {
      console.error(e);
      const fallback = `You are safe, ${status.preferred_name}. Your next activity is ${status.next_activity || 'rest'}.`;
      setSpokenReply(fallback);
      speakText(fallback);
    }
  };

  const handleForgotQuestion = async (question: string) => {
    try {
      const res = await api.askCompanion(question, 'text');
      setForgotAnswer(res.spoken_text);
      speakText(res.spoken_text);
    } catch (e) {
      console.error(e);
      setForgotAnswer('I am right here with you. Your next activity is coming up shortly.');
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
      {/* 1. Calm Greeting Header */}
      <div className="bg-gradient-to-br from-emerald-50 via-teal-50/50 to-stone-50 border-2 border-emerald-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight font-serif flex items-center gap-2">
              <span>Good Morning</span>
              <span className="text-rose-500">❤️</span>
            </h1>
            <p className="text-xl sm:text-2xl text-emerald-800 font-bold mt-2">
              What would you like to do?
            </p>
          </div>

          <button
            onClick={() => speakText(`Good morning, ${status.preferred_name}. What would you like to do? You are doing well today.`)}
            className="p-3 bg-white/90 rounded-2xl border border-emerald-300 text-emerald-700 hover:bg-emerald-100 transition shadow-xs cursor-pointer"
            title="Read aloud"
          >
            <Volume2 className="w-6 h-6" />
          </button>
        </div>

        {/* Section 4: NOW / NEXT / LATER Paradigm */}
        <div className="mt-6 pt-5 border-t border-emerald-200/60 space-y-3">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-900/80 block">
            Your Daily Rhythm
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* NOW */}
            <div className="bg-white/90 p-3.5 rounded-2xl border border-emerald-200 shadow-2xs">
              <span className="text-xs font-extrabold text-emerald-700 block uppercase">
                NOW
              </span>
              <p className="text-base font-extrabold text-stone-900 mt-0.5">
                ☀️ Have breakfast
              </p>
            </div>

            {/* NEXT */}
            <div className="bg-white/90 p-3.5 rounded-2xl border border-emerald-200 shadow-2xs">
              <span className="text-xs font-extrabold text-sky-700 block uppercase">
                NEXT
              </span>
              <p className="text-base font-extrabold text-stone-900 mt-0.5">
                💊 Medicine at 9:00 AM
              </p>
            </div>

            {/* LATER */}
            <div className="bg-white/90 p-3.5 rounded-2xl border border-emerald-200 shadow-2xs">
              <span className="text-xs font-extrabold text-amber-700 block uppercase">
                LATER
              </span>
              <p className="text-base font-extrabold text-stone-900 mt-0.5">
                ❤️ Priya visiting at 4 PM
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 11: UNIVERSAL "🤔 I FORGOT" MODE BUTTON */}
      <button
        onClick={() => {
          setShowForgotModal(true);
          setForgotAnswer(null);
        }}
        className="patient-card-touch w-full py-4 px-6 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-500 hover:to-orange-500 text-stone-950 font-black text-xl rounded-3xl shadow-sm border-2 border-amber-500 flex items-center justify-between cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl">🤔</span>
          <span className="tracking-tight">I FORGOT SOMETHING</span>
        </div>
        <span className="text-xs font-extrabold bg-white/80 px-3 py-1 rounded-full text-stone-800">
          Tap to ask Nivara
        </span>
      </button>

      {/* Primary Patient Action Buttons (Sections 2, 4, 5, 6, 12, 14) */}
      <div className="grid grid-cols-1 gap-3.5">
        {/* [ MY DAY ] */}
        <button
          onClick={() => onNavigate('my-day')}
          className="patient-card-touch w-full p-5 sm:p-6 bg-white hover:bg-emerald-50/50 border-2 border-stone-200 hover:border-emerald-400 rounded-3xl shadow-sm text-left flex items-center gap-4 sm:gap-6 cursor-pointer"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-3xl sm:text-4xl shrink-0">
            🗓️
          </div>
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              MY DAY
            </h2>
            <p className="text-base text-stone-600 font-medium mt-0.5">
              See what you are doing today step by step
            </p>
          </div>
        </button>

        {/* [ MY MEDICINE ] */}
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
                  Time for medicine
                </span>
              )}
            </div>
            <p className="text-base text-stone-600 font-medium mt-0.5">
              See your blue, white, and pink medicines
            </p>
          </div>
        </button>

        {/* [ FIND SOMETHING ] */}
        <button
          onClick={() => onNavigate('find-something')}
          className="patient-card-touch w-full p-5 sm:p-6 bg-white hover:bg-purple-50/50 border-2 border-stone-200 hover:border-purple-400 rounded-3xl shadow-sm text-left flex items-center gap-4 sm:gap-6 cursor-pointer"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center text-3xl sm:text-4xl shrink-0">
            🔎
          </div>
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              FIND SOMETHING
            </h2>
            <p className="text-base text-stone-600 font-medium mt-0.5">
              Find your glasses, keys, wallet, or phone
            </p>
          </div>
        </button>

        {/* [ MY PEOPLE ] */}
        <button
          onClick={() => onNavigate('my-people')}
          className="patient-card-touch w-full p-5 sm:p-6 bg-white hover:bg-amber-50/50 border-2 border-stone-200 hover:border-amber-400 rounded-3xl shadow-sm text-left flex items-center gap-4 sm:gap-6 cursor-pointer"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-3xl sm:text-4xl shrink-0">
            👥
          </div>
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              MY PEOPLE
            </h2>
            <p className="text-base text-stone-600 font-medium mt-0.5">
              Call Priya, Rahul, or your nurse Anita
            </p>
          </div>
        </button>

        {/* [ GET HELP ] */}
        <button
          onClick={() => onNavigate('get-help')}
          className="patient-card-touch w-full p-5 sm:p-6 bg-rose-50/80 hover:bg-rose-100/90 border-2 border-rose-300 hover:border-rose-400 rounded-3xl shadow-sm text-left flex items-center gap-4 sm:gap-6 cursor-pointer"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-rose-200 text-rose-900 flex items-center justify-center text-3xl sm:text-4xl shrink-0">
            🆘
          </div>
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl font-black text-rose-950 tracking-tight">
              GET HELP
            </h2>
            <p className="text-base text-rose-800 font-medium mt-0.5">
              Get home safely or call for assistance
            </p>
          </div>
        </button>
      </div>

      {/* Large Microphone Button: TALK TO NIVARA (Section 7) */}
      <div className="bg-white border-2 border-stone-200 rounded-3xl p-6 shadow-sm text-center space-y-4">
        <button
          onClick={() => handleTalkToNivara()}
          className="patient-card-touch mx-auto flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-extrabold text-xl shadow-md hover:shadow-lg transition cursor-pointer"
        >
          <Mic className={`w-8 h-8 ${isSpeaking ? 'animate-bounce text-amber-300' : ''}`} />
          <span>🎤 TALK TO NIVARA</span>
        </button>

        <div className="flex flex-wrap justify-center gap-2 pt-1">
          <button
            onClick={() => handleTalkToNivara('Who is Priya?')}
            className="px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 rounded-full text-xs font-bold text-stone-700 cursor-pointer"
          >
            "Who is Priya?" (RAG)
          </button>
          <button
            onClick={() => handleTalkToNivara('What should I do now?')}
            className="px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 rounded-full text-xs font-bold text-stone-700 cursor-pointer"
          >
            "What should I do now?"
          </button>
          <button
            onClick={() => handleTalkToNivara('Where are my glasses?')}
            className="px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 rounded-full text-xs font-bold text-stone-700 cursor-pointer"
          >
            "Where are my glasses?"
          </button>
        </div>

        {spokenReply && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-950 text-base font-semibold text-left flex items-start gap-3">
            <span className="text-2xl">💬</span>
            <div className="flex-1">
              <span className="text-xs font-bold text-emerald-800 uppercase block">Nivara said:</span>
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

      {/* Section 13: Daily Memory / AI Journal Card */}
      <div className="bg-white border-2 border-stone-200 rounded-3xl p-5 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">📖</span>
          <div>
            <h3 className="font-extrabold text-stone-900 text-base">
              Today's Memory Journal
            </h3>
            <p className="text-xs text-stone-600 font-medium">
              See the lovely things you did today
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowJournalModal(true)}
          className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold cursor-pointer"
        >
          View Today ❤️
        </button>
      </div>

      {/* Mood Check-In */}
      <div className="bg-white border-2 border-stone-200 rounded-3xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-stone-900">
            How are you feeling right now?
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

      {/* Modal: "🤔 I FORGOT" (Section 11) */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 border-2 border-amber-300 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-3xl">🤔</span>
                <h2 className="text-xl font-black text-stone-900">
                  What would you like to recall?
                </h2>
              </div>
              <button
                onClick={() => setShowForgotModal(false)}
                className="p-2 text-stone-400 hover:text-stone-800 rounded-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-stone-600">
              Nivara connects to your routine, appointments, family memories, and object locations:
            </p>

            <div className="grid grid-cols-1 gap-2 pt-1">
              {[
                "What should I do now?",
                "Who is visiting today?",
                "What is my next appointment?",
                "Where did I last see my glasses?",
                "Who can I call right now?",
                "What did I do today?"
              ].map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleForgotQuestion(q)}
                  className="patient-card-touch p-3 rounded-xl border border-stone-200 bg-stone-50 hover:bg-amber-50 hover:border-amber-300 text-left text-sm font-bold text-stone-800 flex items-center justify-between cursor-pointer"
                >
                  <span>{q}</span>
                  <ArrowRight className="w-4 h-4 text-stone-400" />
                </button>
              ))}
            </div>

            {forgotAnswer && (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-300 text-emerald-950 font-bold text-base flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <p className="flex-1">{forgotAnswer}</p>
                <button
                  onClick={() => speakText(forgotAnswer)}
                  className="p-1 text-emerald-700 hover:text-emerald-900 cursor-pointer"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: DAILY MEMORY / AI JOURNAL (Section 13) */}
      {showJournalModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 border-2 border-emerald-300 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-stone-900 font-serif flex items-center gap-2">
                <span>TODAY</span>
                <span className="text-rose-500">❤️</span>
              </h2>
              <button
                onClick={() => setShowJournalModal(false)}
                className="p-2 text-stone-400 hover:text-stone-800 rounded-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-500">
              Verified activities completed independently today:
            </p>

            <div className="space-y-3 text-base sm:text-lg font-bold text-stone-800">
              <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200 flex items-center gap-3">
                <span className="text-2xl">☀️</span>
                <span>You had breakfast.</span>
              </div>
              <div className="p-3.5 bg-sky-50/70 rounded-2xl border border-sky-200 flex items-center gap-3">
                <span className="text-2xl">💊</span>
                <span>You took your morning medicine.</span>
              </div>
              <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200 flex items-center gap-3">
                <span className="text-2xl">🚶</span>
                <span>You went for your morning garden walk.</span>
              </div>
              <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200 flex items-center gap-3">
                <span className="text-2xl">👩</span>
                <span>You spoke with your daughter Priya.</span>
              </div>
              <div className="p-3.5 bg-purple-50/70 rounded-2xl border border-purple-200 flex items-center gap-3">
                <span className="text-2xl">🏥</span>
                <span>You have an appointment tomorrow at 11:00 AM with Dr. Mehta.</span>
              </div>
            </div>

            <button
              onClick={() => {
                const text = "Today, you had breakfast, you took your morning medicine, you went for your walk, you spoke with Priya, and you have an appointment tomorrow at 11 AM.";
                speakText(text);
              }}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Volume2 className="w-5 h-5" />
              <span>Read My Day Aloud</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
