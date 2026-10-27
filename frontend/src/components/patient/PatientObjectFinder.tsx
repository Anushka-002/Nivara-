import React, { useEffect, useState } from 'react';
import { ObjectMemory } from '../../types';
import { api } from '../../services/api';
import { ArrowLeft, Search, Camera, Volume2, Sparkles, MapPin, CheckCircle2 } from 'lucide-react';

interface PatientObjectFinderProps {
  onBack: () => void;
}

export const PatientObjectFinder: React.FC<PatientObjectFinderProps> = ({ onBack }) => {
  const [objects, setObjects] = useState<ObjectMemory[]>([]);
  const [selectedObject, setSelectedObject] = useState<ObjectMemory | null>(null);
  const [spokenReply, setSpokenReply] = useState<string | null>(null);
  const [scanningObject, setScanningObject] = useState<string | null>(null);
  const [newLocationInput, setNewLocationInput] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchObjects = async () => {
    try {
      const data = await api.getObjectMemories();
      setObjects(data);
      if (data.length > 0 && !selectedObject) {
        setSelectedObject(data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchObjects();
  }, []);

  const handleAskWhere = (obj: ObjectMemory) => {
    setSelectedObject(obj);
    const message = `I last saw your ${obj.object_name} on the ${obj.last_seen_location}.`;
    setSpokenReply(message);

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(message);
      u.rate = 0.9;
      window.speechSynthesis.speak(u);
    }
  };

  const handleUpdateLocation = async (objectName: string) => {
    try {
      const loc = newLocationInput || 'Living room wooden shelf';
      const res = await api.scanObjectPhoto(objectName, loc);
      setSpokenReply(res.speech);
      if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance(res.speech);
        u.rate = 0.9;
        window.speechSynthesis.speak(u);
      }
      setScanningObject(null);
      setNewLocationInput('');
      await fetchObjects();
    } catch (e) {
      console.error(e);
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
          🔎 Find My Things
        </h1>
      </div>

      {/* Intro banner */}
      <div className="bg-purple-50 border-2 border-purple-200 rounded-3xl p-5">
        <h2 className="text-purple-950 font-bold text-lg">
          Tap any item to see where it was last seen:
        </h2>
        <p className="text-purple-800 text-sm mt-1">
          Nivara remembers your everyday belongings safely and privately.
        </p>
      </div>

      {/* Spoken location notification */}
      {spokenReply && (
        <div className="bg-white border-2 border-purple-300 rounded-2xl p-5 shadow-sm text-stone-900 flex items-start justify-between gap-4 animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <span className="text-3xl">📍</span>
            <div>
              <span className="text-xs uppercase font-extrabold text-purple-700 tracking-wider">
                Last Seen Location
              </span>
              <p className="text-xl font-black text-stone-900 mt-0.5">
                {spokenReply}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if ('speechSynthesis' in window && spokenReply) {
                const u = new SpeechSynthesisUtterance(spokenReply);
                u.rate = 0.9;
                window.speechSynthesis.speak(u);
              }
            }}
            className="p-2 text-purple-700 hover:bg-purple-100 rounded-xl cursor-pointer"
          >
            <Volume2 className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Object Selection Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-4">
        {objects.map(obj => {
          const isSelected = selectedObject?.id === obj.id;
          let icon = '🔎';
          if (obj.object_name.includes('glasses')) icon = '👓';
          else if (obj.object_name.includes('keys')) icon = '🔑';
          else if (obj.object_name.includes('wallet')) icon = '👛';
          else if (obj.object_name.includes('phone')) icon = '📱';
          else if (obj.object_name.includes('medicine')) icon = '💊';

          return (
            <div
              key={obj.id}
              onClick={() => handleAskWhere(obj)}
              className={`patient-card-touch p-5 rounded-3xl border-2 text-left cursor-pointer transition flex flex-col justify-between ${
                isSelected
                  ? 'bg-purple-50/70 border-purple-500 shadow-md ring-2 ring-purple-300'
                  : 'bg-white border-stone-300 hover:border-purple-300 shadow-xs'
              }`}
            >
              <div>
                <span className="text-4xl block mb-2">{icon}</span>
                <h3 className="text-lg sm:text-xl font-extrabold text-stone-900">
                  {obj.simple_name}
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 font-medium mt-1 line-clamp-2">
                  {obj.last_seen_location}
                </p>
              </div>

              <div className="pt-4 flex items-center justify-between text-xs font-bold text-purple-800">
                <span>Tap to hear location</span>
                <Volume2 className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual Scanner Simulator */}
      <div className="bg-stone-100 border border-stone-300 rounded-3xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-stone-700" />
          <h3 className="font-bold text-stone-900 text-sm">
            Remember a New Place for an Item
          </h3>
        </div>
        <p className="text-xs text-stone-600">
          Put your glasses or keys down somewhere new? Update Nivara's memory:
        </p>

        {scanningObject ? (
          <div className="bg-white p-4 rounded-2xl border border-stone-300 space-y-3">
            <span className="text-xs font-bold text-stone-700">
              Updating memory for: <strong className="uppercase">{scanningObject}</strong>
            </span>
            <input
              type="text"
              placeholder="e.g. Dining table, bedside drawer, hook..."
              value={newLocationInput}
              onChange={e => setNewLocationInput(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:outline-emerald-500"
            />
            <div className="flex gap-2">
              <button
                onClick={() => handleUpdateLocation(scanningObject)}
                className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Save Location
              </button>
              <button
                onClick={() => setScanningObject(null)}
                className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {['glasses', 'keys', 'wallet', 'phone'].map(item => (
              <button
                key={item}
                onClick={() => {
                  setScanningObject(item);
                  setNewLocationInput('');
                }}
                className="px-3 py-1.5 bg-white border border-stone-300 hover:border-purple-400 rounded-xl text-xs font-bold text-stone-700 cursor-pointer"
              >
                + Update {item}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
