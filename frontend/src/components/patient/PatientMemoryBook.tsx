import React, { useEffect, useState } from 'react';
import { MemoryBookEntry } from '../../types';
import { api } from '../../services/api';
import { ArrowLeft, Volume2, Heart, Sparkles } from 'lucide-react';

interface PatientMemoryBookProps {
  onBack: () => void;
}

export const PatientMemoryBook: React.FC<PatientMemoryBookProps> = ({ onBack }) => {
  const [entries, setEntries] = useState<MemoryBookEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMemories = async () => {
      try {
        const data = await api.getMemoryBook();
        setEntries(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchMemories();
  }, []);

  const speakMemory = (m: MemoryBookEntry) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const msg = `${m.title}. ${m.relationship_label}. ${m.caption}`;
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
          📖 My Memory Book
        </h1>
      </div>

      {/* Intro box */}
      <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-5 text-center">
        <span className="text-3xl block mb-1">💛</span>
        <h2 className="text-xl font-bold text-amber-950">
          Your Beautiful Memories & Loved Ones
        </h2>
        <p className="text-amber-900 text-sm font-medium mt-1">
          Familiar faces and cherished places you love.
        </p>
      </div>

      {/* Memory Album Cards */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-10 font-bold text-stone-500">Loading your memories...</div>
        ) : (
          entries.map(entry => (
            <div
              key={entry.id}
              className="bg-white border-2 border-stone-300 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition"
            >
              <div className="relative h-64 sm:h-72 w-full bg-stone-100 overflow-hidden">
                <img
                  src={entry.photo_url}
                  alt={entry.title}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => speakMemory(entry)}
                  className="absolute bottom-3 right-3 p-3 bg-white/90 hover:bg-white text-amber-800 rounded-2xl shadow-md cursor-pointer border border-amber-200"
                  title="Read aloud"
                >
                  <Volume2 className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-stone-900">
                    {entry.title}
                  </h3>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                    {entry.relationship_label}
                  </span>
                </div>

                <p className="text-base sm:text-lg text-stone-700 font-semibold leading-relaxed">
                  {entry.caption}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
