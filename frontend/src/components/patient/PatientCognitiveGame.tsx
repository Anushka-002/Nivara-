import React, { useState } from 'react';
import { ArrowLeft, Sparkles, RotateCcw, Heart, CheckCircle2 } from 'lucide-react';

interface PatientCognitiveGameProps {
  onBack: () => void;
}

const CARDS = [
  { id: 1, icon: '☕', name: 'Morning Tea', matchId: 1 },
  { id: 2, icon: '🌸', name: 'Garden Rose', matchId: 2 },
  { id: 3, icon: '🐶', name: 'Gentle Puppy', matchId: 3 },
  { id: 4, icon: '☕', name: 'Morning Tea', matchId: 1 },
  { id: 5, icon: '🌸', name: 'Garden Rose', matchId: 2 },
  { id: 6, icon: '🐶', name: 'Gentle Puppy', matchId: 3 }
];

export const PatientCognitiveGame: React.FC<PatientCognitiveGameProps> = ({ onBack }) => {
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [encouragement, setEncouragement] = useState<string>('Take your time and tap two cards to match them.');

  const handleCardClick = (index: number) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(index)) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const card1 = CARDS[newFlipped[0]];
      const card2 = CARDS[newFlipped[1]];

      if (card1.matchId === card2.matchId) {
        setMatched(prev => [...prev, newFlipped[0], newFlipped[1]]);
        setFlipped([]);
        setEncouragement('Wonderful match! You are doing very well ❤️');
      } else {
        setEncouragement('Nice try! Would you like to try another pair?');
        setTimeout(() => {
          setFlipped([]);
        }, 1200);
      }
    }
  };

  const handleReset = () => {
    setFlipped([]);
    setMatched([]);
    setEncouragement('Take your time and tap two cards to match them.');
  };

  const isCompleted = matched.length === CARDS.length;

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
          🧩 Gentle Matching Game
        </h1>
      </div>

      {/* Encouragement card (Never "You failed") */}
      <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-5 text-center">
        <span className="text-3xl block mb-1">🌱</span>
        <h2 className="text-lg sm:text-xl font-bold text-emerald-950">
          {encouragement}
        </h2>
        <p className="text-emerald-800 text-xs sm:text-sm mt-0.5">
          A pleasant, relaxing exercise for your morning.
        </p>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {CARDS.map((card, idx) => {
          const isFlipped = flipped.includes(idx) || matched.includes(idx);
          const isMatched = matched.includes(idx);

          return (
            <button
              key={idx}
              onClick={() => handleCardClick(idx)}
              className={`patient-card-touch h-32 sm:h-36 rounded-3xl border-2 flex flex-col items-center justify-center transition-all cursor-pointer ${
                isMatched
                  ? 'bg-emerald-100 border-emerald-400 text-emerald-900 shadow-xs'
                  : isFlipped
                  ? 'bg-white border-emerald-500 shadow-md ring-2 ring-emerald-300'
                  : 'bg-stone-100 border-stone-300 hover:border-emerald-300 hover:bg-stone-50'
              }`}
            >
              {isFlipped ? (
                <>
                  <span className="text-4xl sm:text-5xl">{card.icon}</span>
                  <span className="text-xs font-bold text-stone-700 mt-2">{card.name}</span>
                </>
              ) : (
                <span className="text-3xl text-stone-400 font-serif font-black">🌿</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Win State or Reset */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border border-stone-300 bg-white text-stone-700 font-bold hover:bg-stone-100 text-sm cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Play Again</span>
        </button>

        {isCompleted && (
          <span className="text-sm font-extrabold text-emerald-800 flex items-center gap-1.5 bg-emerald-100 px-4 py-2 rounded-2xl border border-emerald-300">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Terrific job! All pairs matched! ❤️</span>
          </span>
        )}
      </div>
    </div>
  );
};
