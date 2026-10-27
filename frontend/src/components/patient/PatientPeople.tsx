import React, { useEffect, useState } from 'react';
import { GuardianPerson } from '../../types';
import { api } from '../../services/api';
import { ArrowLeft, Phone, PhoneCall, Volume2, Heart } from 'lucide-react';

interface PatientPeopleProps {
  onBack: () => void;
}

export const PatientPeople: React.FC<PatientPeopleProps> = ({ onBack }) => {
  const [people, setPeople] = useState<GuardianPerson[]>([]);
  const [callingState, setCallingState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPeople = async () => {
      try {
        const data = await api.getTrustedPeople();
        setPeople(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchPeople();
  }, []);

  const handleCall = (person: GuardianPerson) => {
    setCallingState(person.name);
    const msg = `Connecting you to your ${person.relationship}, ${person.name}.`;

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(msg);
      u.rate = 0.9;
      window.speechSynthesis.speak(u);
    }

    setTimeout(() => {
      setCallingState(null);
    }, 4500);
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
          👥 People I Know
        </h1>
      </div>

      {/* Intro banner */}
      <div className="bg-emerald-50 border-2 border-emerald-200 rounded-3xl p-5">
        <h2 className="text-emerald-950 font-bold text-lg">
          Your Trusted Family & Caregivers
        </h2>
        <p className="text-emerald-800 text-sm mt-1">
          Tap the big green call button beside anyone to speak with them right away.
        </p>
      </div>

      {callingState && (
        <div className="bg-emerald-600 text-white p-5 rounded-3xl font-extrabold text-lg flex items-center justify-between shadow-lg animate-calm-pulse">
          <div className="flex items-center gap-3">
            <PhoneCall className="w-7 h-7 animate-bounce" />
            <div>
              <span className="text-xs uppercase text-emerald-200 tracking-wider block">
                Calling Now...
              </span>
              <span>{callingState}</span>
            </div>
          </div>
          <span className="text-sm bg-white/20 px-3 py-1 rounded-full">Connected</span>
        </div>
      )}

      {/* People cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-10 font-bold text-stone-500">Loading your trusted people...</div>
        ) : (
          people.map(person => (
            <div
              key={person.id}
              className="bg-white border-2 border-stone-300 hover:border-emerald-300 rounded-3xl p-5 sm:p-6 shadow-sm flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center text-4xl shadow-xs shrink-0">
                  {person.avatar || '👤'}
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-stone-900">
                    {person.name}
                  </h3>
                  <p className="text-base sm:text-lg font-bold text-emerald-800 mt-0.5">
                    {person.relationship}
                  </p>
                  <span className="text-xs text-stone-500 font-semibold">
                    {person.phone}
                  </span>
                </div>
              </div>

              {/* Call button */}
              <button
                onClick={() => handleCall(person)}
                className="patient-card-touch py-3.5 px-5 sm:px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base sm:text-lg flex items-center gap-2 shadow-sm cursor-pointer shrink-0"
              >
                <Phone className="w-5 h-5 sm:w-6 sm:h-6 fill-white" />
                <span>Call</span>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
