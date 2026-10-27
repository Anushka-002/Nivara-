import React, { useEffect, useState } from 'react';
import { Medication } from '../../types';
import { api } from '../../services/api';
import { ArrowLeft, Check, Clock, Volume2, CheckCircle2, Pill } from 'lucide-react';

interface PatientMedicineProps {
  onBack: () => void;
}

export const PatientMedicine: React.FC<PatientMedicineProps> = ({ onBack }) => {
  const [meds, setMeds] = useState<Medication[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMeds = async () => {
    try {
      const data = await api.getMedications();
      setMeds(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeds();
  }, []);

  const handleAction = async (medId: number, action: 'taken' | 'remind_later') => {
    try {
      const res = await api.confirmMedication(medId, action);
      setFeedback(res.message);
      if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance(res.message);
        u.rate = 0.9;
        window.speechSynthesis.speak(u);
      }
      await fetchMeds();
      setTimeout(() => setFeedback(null), 5000);
    } catch (e) {
      console.error(e);
    }
  };

  const speakMed = (med: Medication) => {
    if ('speechSynthesis' in window) {
      const msg = `${med.simple_name}. Scheduled at ${med.schedule_time}. Instructions: ${med.instructions}.`;
      const u = new SpeechSynthesisUtterance(msg);
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

        <h1 className="text-xl sm:text-2xl font-black text-stone-900 font-serif">
          💊 My Medicine
        </h1>
      </div>

      {feedback && (
        <div className="bg-emerald-100 border-2 border-emerald-300 text-emerald-950 p-4 rounded-2xl font-bold text-base flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Intro Box */}
      <div className="bg-sky-50 border-2 border-sky-200 rounded-3xl p-5">
        <p className="text-sky-950 font-bold text-base sm:text-lg">
          Here are your medicines for today. Take them with a glass of water when it is time.
        </p>
      </div>

      {/* Medication Cards */}
      <div className="space-y-5">
        {loading ? (
          <div className="text-center py-10 font-bold text-stone-500">Checking your medicine list...</div>
        ) : (
          meds.map(med => {
            const isBlue = med.visual_color === 'blue';
            const isPink = med.visual_color === 'pink';

            return (
              <div
                key={med.id}
                className="bg-white border-2 border-stone-300 rounded-3xl p-6 shadow-sm space-y-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-bold shadow-xs shrink-0 ${
                        isBlue
                          ? 'bg-sky-500 text-white'
                          : isPink
                          ? 'bg-rose-400 text-white'
                          : 'bg-amber-400 text-stone-900'
                      }`}
                    >
                      💊
                    </div>
                    <div>
                      <span className="text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200">
                        {med.schedule_time}
                      </span>
                      <h3 className="text-xl sm:text-2xl font-black text-stone-900 mt-1">
                        {med.simple_name}
                      </h3>
                      <p className="text-base text-stone-700 font-bold mt-0.5">
                        {med.instructions}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => speakMed(med)}
                    className="p-2.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-xl cursor-pointer"
                    title="Speak medicine details"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Dosage & Doctor note */}
                <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 flex items-center justify-between text-xs sm:text-sm text-stone-600 font-medium">
                  <span>Dose: <strong>{med.dosage}</strong></span>
                  <span>Prescribed by: <strong>{med.prescribed_by}</strong></span>
                </div>

                {/* Buttons: [YES, I TOOK IT] and [REMIND ME LATER] */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => handleAction(med.id, 'taken')}
                    className="patient-card-touch py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-lg flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <Check className="w-6 h-6 stroke-[3]" />
                    <span>YES, I TOOK IT</span>
                  </button>

                  <button
                    onClick={() => handleAction(med.id, 'remind_later')}
                    className="patient-card-touch py-4 px-6 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-base flex items-center justify-center gap-2 border border-stone-300 cursor-pointer"
                  >
                    <Clock className="w-5 h-5" />
                    <span>REMIND ME LATER</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
