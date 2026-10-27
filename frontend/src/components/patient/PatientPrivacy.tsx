import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { ArrowLeft, ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';

interface PatientPrivacyProps {
  onBack: () => void;
}

export const PatientPrivacy: React.FC<PatientPrivacyProps> = ({ onBack }) => {
  const [consents, setConsents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrivacy = async () => {
      try {
        const data = await api.getPrivacyTransfers();
        setConsents(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchPrivacy();
  }, []);

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
          🔒 Who Can See My Information?
        </h1>
      </div>

      {/* Intro box */}
      <div className="bg-emerald-50 border-2 border-emerald-200 rounded-3xl p-5">
        <h2 className="text-emerald-950 font-bold text-lg">
          Your Privacy & Safety Are Protected
        </h2>
        <p className="text-emerald-800 text-sm mt-1">
          Only your designated trusted people have access to your daily safety updates:
        </p>
      </div>

      {/* Access Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-10 font-bold text-stone-500">Checking privacy permissions...</div>
        ) : (
          consents.map((c, idx) => (
            <div
              key={idx}
              className="bg-white border-2 border-stone-300 rounded-3xl p-5 shadow-xs flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center text-3xl shrink-0">
                  {c.role === 'Nurse' ? '👩‍⚕️' : c.role === 'Doctor' ? '👨‍⚕️' : '👩'}
                </div>
                <div>
                  <h3 className="text-xl font-black text-stone-900">
                    {c.name}
                  </h3>
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wide">
                    {c.role}
                  </span>
                  <p className="text-sm font-bold text-emerald-800 mt-0.5">
                    Can see: {c.access_type}
                  </p>
                </div>
              </div>

              <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-bold flex items-center gap-1 shrink-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Protected</span>
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
