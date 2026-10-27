import React, { useState } from 'react';
import { ArrowLeft, Home, Compass, Volume2, CheckCircle2, ChevronRight } from 'lucide-react';

interface PatientNavigationProps {
  onBack: () => void;
}

export const PatientNavigation: React.FC<PatientNavigationProps> = ({ onBack }) => {
  const [activeStep, setActiveStep] = useState(1);

  const steps = [
    {
      step: 1,
      icon: '🚶',
      action: 'Walk straight',
      landmark: 'Follow the flat stone path with flowering bushes.',
      speech: 'Walk straight ahead along the flat stone path.'
    },
    {
      step: 2,
      icon: '🏥',
      action: 'Look for the pharmacy',
      landmark: 'You will see the familiar green Care Pharmacy sign on your right.',
      speech: 'Keep walking straight. You will see the green pharmacy sign on your right.'
    },
    {
      step: 3,
      icon: '➡️',
      action: 'Turn right after the pharmacy',
      landmark: 'Turn onto the quiet lane right past the pharmacy.',
      speech: 'Now turn right immediately after the pharmacy.'
    },
    {
      step: 4,
      icon: '🏠',
      action: 'Your front door is right ahead',
      landmark: 'Number 14 Green Valley Residences is right here. Welcome home!',
      speech: 'You are right at your home entrance. You did great!'
    }
  ];

  const speakCurrent = (index: number) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(steps[index].speech);
      u.rate = 0.9;
      window.speechSynthesis.speak(u);
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

        <h1 className="text-xl sm:text-2xl font-black text-emerald-900 font-serif">
          🏠 Help Me Get Home
        </h1>
      </div>

      {/* Comfort Card */}
      <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-6 text-center space-y-2">
        <span className="text-4xl">🏡</span>
        <h2 className="text-2xl font-black text-emerald-950">
          You are very close to home.
        </h2>
        <p className="text-base text-emerald-800 font-semibold">
          Home is only 3 minutes away. Follow these 4 easy steps:
        </p>
      </div>

      {/* Simple Landmark Steps */}
      <div className="space-y-4">
        {steps.map((s, idx) => {
          const isCurrent = activeStep === s.step;
          const isDone = activeStep > s.step;

          return (
            <div
              key={s.step}
              onClick={() => {
                setActiveStep(s.step);
                speakCurrent(idx);
              }}
              className={`patient-card-touch p-5 sm:p-6 rounded-3xl border-2 transition cursor-pointer flex items-center justify-between gap-4 ${
                isCurrent
                  ? 'bg-emerald-500 text-white border-emerald-600 shadow-md ring-4 ring-emerald-200'
                  : isDone
                  ? 'bg-stone-100 text-stone-500 border-stone-200'
                  : 'bg-white text-stone-900 border-stone-300 hover:border-emerald-300'
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl font-bold shrink-0 ${
                    isCurrent ? 'bg-white text-emerald-700' : 'bg-stone-100 text-stone-800'
                  }`}
                >
                  {s.icon}
                </div>
                <div>
                  <span className={`text-xs font-black uppercase tracking-wider block ${isCurrent ? 'text-emerald-100' : 'text-stone-500'}`}>
                    Step {s.step} of 4
                  </span>
                  <h3 className={`text-xl sm:text-2xl font-black ${isCurrent ? 'text-white' : 'text-stone-900'}`}>
                    {s.action}
                  </h3>
                  <p className={`text-sm sm:text-base font-semibold mt-0.5 ${isCurrent ? 'text-emerald-50' : 'text-stone-600'}`}>
                    {s.landmark}
                  </p>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  speakCurrent(idx);
                }}
                className={`p-2.5 rounded-xl cursor-pointer ${
                  isCurrent ? 'text-white hover:bg-white/20' : 'text-stone-500 hover:bg-stone-100'
                }`}
                title="Speak this step"
              >
                <Volume2 className="w-6 h-6" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Step Advance Button */}
      <div className="pt-2">
        <button
          onClick={() => {
            const next = activeStep < 4 ? activeStep + 1 : 1;
            setActiveStep(next);
            speakCurrent(next - 1);
          }}
          className="patient-card-touch w-full py-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-lg flex items-center justify-center gap-2 shadow-md cursor-pointer"
        >
          <span>{activeStep < 4 ? 'Next Step ➡️' : 'I Am Home! ❤️'}</span>
        </button>
      </div>
    </div>
  );
};
