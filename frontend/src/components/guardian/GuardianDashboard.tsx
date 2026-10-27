import React, { useEffect, useState } from 'react';
import { GuardianDashboardData, DailySummaryData, CaregiverNote, SafeZone } from '../../types';
import { api } from '../../services/api';
import {
  ShieldCheck, AlertTriangle, MapPin, Pill, Clock,
  Calendar, Users, MessageSquare, Send, CheckCircle2, ChevronRight, Activity
} from 'lucide-react';

interface GuardianDashboardProps {
  onNavigateAlerts: () => void;
  onRefresh: () => void;
}

export const GuardianDashboard: React.FC<GuardianDashboardProps> = ({
  onNavigateAlerts,
  onRefresh
}) => {
  const [data, setData] = useState<GuardianDashboardData | null>(null);
  const [summary, setSummary] = useState<DailySummaryData | null>(null);
  const [handoffNotes, setHandoffNotes] = useState<CaregiverNote[]>([]);
  const [safeZones, setSafeZones] = useState<SafeZone[]>([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [dash, sum, notes, zones] = await Promise.all([
        api.getGuardianDashboard(),
        api.getDailySummary(),
        api.getHandoffNotes(),
        api.getSafeZones()
      ]);
      setData(dash);
      setSummary(sum);
      setHandoffNotes(notes);
      setSafeZones(zones);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePostNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    try {
      await api.postHandoffNote({
        author_name: 'Priya Sharma (Daughter)',
        author_role: 'family',
        note_text: newNote,
        shift_category: 'Family Visit'
      });
      setNewNote('');
      const updatedNotes = await api.getHandoffNotes();
      setHandoffNotes(updatedNotes);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading || !data) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center text-stone-500 font-bold">
        Loading Guardian Dashboard...
      </div>
    );
  }

  const isLocationSafe = data.location.is_safe_zone;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Top Patient Status Bar */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center text-3xl shrink-0">
            👵
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-stone-900 font-serif">
                {data.patient.name}
              </h1>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                data.patient.status === 'Critical'
                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                  : data.patient.status === 'Important'
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              }`}>
                ● {data.patient.status}
              </span>
            </div>
            <p className="text-sm text-stone-600 font-medium mt-1">
              {data.patient.status_note}
            </p>
          </div>
        </div>

        {/* Action button for active alerts */}
        <button
          onClick={onNavigateAlerts}
          className="flex items-center justify-between gap-3 px-5 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-900 font-bold text-sm transition cursor-pointer border border-stone-300"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className={`w-4 h-4 ${data.active_alerts_count > 0 ? 'text-amber-600' : 'text-stone-500'}`} />
            <span>Active Alerts: <strong>{data.active_alerts_count}</strong></span>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-500" />
        </button>
      </div>

      {/* 4 Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Routine */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-2xs">
          <span className="text-xs uppercase font-bold text-stone-500 tracking-wider">
            Daily Routine
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-stone-900">
              {data.routine.completion_percentage}%
            </span>
            <span className="text-xs text-stone-500 font-semibold">
              {data.routine.completed_tasks} of {data.routine.total_tasks} tasks
            </span>
          </div>
          <div className="w-full bg-stone-100 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-emerald-600 h-full"
              style={{ width: `${data.routine.completion_percentage}%` }}
            ></div>
          </div>
        </div>

        {/* Metric 2: Medication */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-2xs">
          <span className="text-xs uppercase font-bold text-stone-500 tracking-wider">
            Medication Adherence
          </span>
          <div className="mt-2 space-y-1">
            {data.medications.map(m => (
              <div key={m.id} className="flex items-center justify-between text-xs">
                <span className="font-semibold text-stone-700 truncate max-w-[120px]">{m.simple_name}</span>
                <span className={`px-2 py-0.5 rounded-md font-bold ${
                  m.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {m.status === 'confirmed' ? '✓ Taken' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Metric 3: Location Status */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-2xs">
          <span className="text-xs uppercase font-bold text-stone-500 tracking-wider">
            Location Zone
          </span>
          <div className="mt-2">
            <div className="flex items-center gap-1.5 font-bold text-base text-stone-900">
              <MapPin className={`w-4 h-4 ${isLocationSafe ? 'text-emerald-600' : 'text-rose-600 animate-pulse'}`} />
              <span className="truncate">{data.location.safe_zone_name}</span>
            </div>
            <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-md font-bold ${
              isLocationSafe ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}>
              {isLocationSafe ? '✓ Inside Safe Perimeter' : '⚠️ Outside Safe Zone'}
            </span>
          </div>
        </div>

        {/* Metric 4: Independence Index */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-2xs">
          <span className="text-xs uppercase font-bold text-stone-500 tracking-wider">
            Independence Index
          </span>
          <div className="mt-2">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-black text-emerald-700">88%</span>
              <span className="text-xs text-stone-600 font-medium">Positive trend vs baseline</span>
            </div>
            <p className="text-xs text-stone-500 mt-2">
              {data.assistance_requests_today} assistance inquiries today
            </p>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Map & Daily AI Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interactive Safe Zone & Geofence Map */}
        <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <span>Live Safe Zones & Location</span>
              </h2>
              <p className="text-xs text-stone-500">
                Current position: {data.location.address}
              </p>
            </div>
            <span className="text-xs font-mono bg-stone-100 px-2 py-1 rounded-md text-stone-600">
              {data.location.latitude.toFixed(4)}, {data.location.longitude.toFixed(4)}
            </span>
          </div>

          {/* SVG Map Visualizer with Safe Zone Geofences and Patient Pin */}
          <div className="relative w-full h-64 bg-stone-100 rounded-2xl border border-stone-300 overflow-hidden flex items-center justify-center p-4">
            <svg viewBox="0 0 400 240" className="w-full h-full">
              {/* Grid Roads */}
              <path d="M 0 120 L 400 120" stroke="#cbd5e1" strokeWidth="6" />
              <path d="M 200 0 L 200 240" stroke="#cbd5e1" strokeWidth="6" />
              <path d="M 80 40 L 320 200" stroke="#e2e8f0" strokeWidth="4" />

              {/* Safe Zone Circles */}
              {/* Home Zone */}
              <circle cx="180" cy="110" r="45" fill="#10b981" fillOpacity="0.18" stroke="#10b981" strokeWidth="2" strokeDasharray="4 2" />
              <text x="180" y="80" textAnchor="middle" fill="#047857" fontSize="10" fontWeight="bold">🏠 Home (150m)</text>

              {/* Shanti Park */}
              <circle cx="280" cy="70" r="38" fill="#10b981" fillOpacity="0.18" stroke="#10b981" strokeWidth="2" strokeDasharray="4 2" />
              <text x="280" y="55" textAnchor="middle" fill="#047857" fontSize="10" fontWeight="bold">🌳 Park (220m)</text>

              {/* Pharmacy */}
              <circle cx="110" cy="160" r="28" fill="#10b981" fillOpacity="0.18" stroke="#10b981" strokeWidth="2" strokeDasharray="4 2" />
              <text x="110" y="145" textAnchor="middle" fill="#047857" fontSize="10" fontWeight="bold">🏥 Pharmacy (90m)</text>

              {/* Patient Live Pin */}
              {isLocationSafe ? (
                <g transform="translate(180, 110)">
                  <circle r="12" fill="#10b981" fillOpacity="0.3" className="animate-ping" />
                  <circle r="8" fill="#059669" stroke="#ffffff" strokeWidth="2" />
                  <text y="-14" textAnchor="middle" fill="#065f46" fontSize="10" fontWeight="bold">Mrs. Sharma</text>
                </g>
              ) : (
                <g transform="translate(340, 190)">
                  <circle r="16" fill="#f43f5e" fillOpacity="0.3" className="animate-ping" />
                  <circle r="9" fill="#e11d48" stroke="#ffffff" strokeWidth="2" />
                  <text y="-14" textAnchor="middle" fill="#be123c" fontSize="11" fontWeight="bold">⚠️ Outside Zone (750m)</text>
                </g>
              )}
            </svg>

            {/* Map Legend */}
            <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg border border-stone-200 text-[10px] text-stone-600 flex items-center gap-3">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Safe Zone Perimeter</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-700"></span> Patient Location</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {safeZones.map(z => (
              <div key={z.id} className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                <span className="font-bold text-stone-900 block">{z.name}</span>
                <span className="text-stone-500">Radius: {z.radius_meters}m • {z.category}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 19: Daily AI Summary */}
        <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Today's Daily AI Summary</span>
            </h2>
            <span className="text-xs font-semibold text-stone-500">
              {summary?.date}
            </span>
          </div>

          {summary ? (
            <div className="space-y-4 text-xs sm:text-sm">
              {/* Observed facts */}
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-1.5">
                <span className="font-bold text-emerald-900 block text-xs uppercase tracking-wider">
                  ✓ Observed Facts
                </span>
                <ul className="space-y-1 text-emerald-950 font-medium list-disc list-inside">
                  {summary.observed_facts.map((fact, idx) => (
                    <li key={idx}>{fact}</li>
                  ))}
                </ul>
              </div>

              {/* AI Patterns */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-1.5">
                <span className="font-bold text-amber-900 block text-xs uppercase tracking-wider">
                  ⚠️ AI-Detected Patterns (Non-Diagnostic)
                </span>
                <ul className="space-y-1 text-amber-950 font-medium list-disc list-inside">
                  {summary.ai_detected_patterns.map((pat, idx) => (
                    <li key={idx}>{pat}</li>
                  ))}
                </ul>
              </div>

              {/* Recommendations */}
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-1.5">
                <span className="font-bold text-stone-700 block text-xs uppercase tracking-wider">
                  💡 Care Recommendations
                </span>
                <ul className="space-y-1 text-stone-800 font-medium list-disc list-inside">
                  {summary.recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>

              <p className="text-[11px] text-stone-400 italic">
                {summary.disclaimer}
              </p>
            </div>
          ) : (
            <div className="text-stone-400">Loading AI summary...</div>
          )}
        </div>
      </div>

      {/* Section 33J: Care Handoff Shift Notes */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-teal-600" />
            <span>Care Team Shift Handoff Notes</span>
          </h2>
          <span className="text-xs text-stone-500 font-medium">Shared between Family & Visiting Nurse Anita</span>
        </div>

        {/* Existing notes */}
        <div className="space-y-3">
          {handoffNotes.map(n => (
            <div key={n.id} className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-900">
                  {n.author_name}
                </span>
                <span className="text-xs bg-stone-200 text-stone-700 px-2 py-0.5 rounded-md font-medium">
                  {n.shift_category}
                </span>
              </div>
              <p className="text-stone-700 font-medium">{n.note_text}</p>
            </div>
          ))}
        </div>

        {/* Post note form */}
        <form onSubmit={handlePostNote} className="flex gap-2 pt-2">
          <input
            type="text"
            placeholder="Add an observation or care handoff message..."
            value={newNote}
            onChange={e => setNewNote(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-emerald-500"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Post</span>
          </button>
        </form>
      </div>
    </div>
  );
};
