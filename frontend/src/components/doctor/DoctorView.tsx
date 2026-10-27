import React, { useEffect, useState } from 'react';
import { DoctorOverviewData } from '../../types';
import { api } from '../../services/api';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';
import {
  Stethoscope, TrendingDown, TrendingUp, AlertTriangle,
  FileText, ShieldAlert, CheckCircle2, Send
} from 'lucide-react';

export const DoctorView: React.FC = () => {
  const [data, setData] = useState<DoctorOverviewData | null>(null);
  const [noteText, setNoteText] = useState('');
  const [noteStatus, setNoteStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const res = await api.getDoctorOverview();
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    try {
      await api.addDoctorNote(noteText);
      setNoteText('');
      setNoteStatus('Clinical note recorded in electronic care record.');
      setTimeout(() => setNoteStatus(null), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading || !data) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center text-stone-500 font-bold">
        Loading Clinician Longitudinal Analytics...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Top Clinical Patient Banner */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-teal-100 flex items-center justify-center text-3xl shrink-0">
            👨‍⚕️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold px-2.5 py-0.5 rounded-md bg-teal-100 text-teal-900 border border-teal-200">
                Clinician Portal • Geriatrics
              </span>
              <span className="text-xs text-stone-500 font-semibold">Attending: Dr. Arvind Mehta, MD</span>
            </div>
            <h1 className="text-2xl font-black text-stone-900 font-serif mt-1">
              Patient: {data.patient_info.full_name} (Age: {data.patient_info.age})
            </h1>
            <p className="text-xs text-stone-600 mt-0.5">
              Address: {data.patient_info.address} • Primary Visiting Nurse: {data.patient_info.primary_nurse}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-stone-500 uppercase tracking-wider block font-bold">
            Assessment Window
          </span>
          <span className="text-sm font-extrabold text-stone-800">
            Last 14 Days Longitudinal Trends
          </span>
        </div>
      </div>

      {/* Mandatory Regulatory / Safety Disclaimer Box */}
      <div className="bg-amber-50/80 border-2 border-amber-300 rounded-2xl p-4 flex items-start gap-3 text-xs sm:text-sm text-amber-950">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-extrabold uppercase tracking-wide block mb-0.5">
            Non-Diagnostic Assistive System Disclaimer
          </span>
          <p className="font-medium text-amber-900 leading-relaxed">
            {data.disclaimer}
          </p>
        </div>
      </div>

      {/* Section 18: Four Baseline Comparison Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.baseline_metrics.map((bm, idx) => {
          const isElevated = bm.status === 'elevated';

          return (
            <div key={idx} className="bg-white border border-stone-200 rounded-2xl p-5 shadow-2xs">
              <span className="text-xs uppercase font-bold text-stone-500 tracking-wider">
                {bm.metric_name}
              </span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-black text-stone-900">
                  {bm.current_val} <span className="text-xs text-stone-500 font-semibold">{bm.unit}</span>
                </span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                  isElevated ? 'bg-rose-100 text-rose-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {bm.deviation_pct > 0 ? `+${bm.deviation_pct}%` : `${bm.deviation_pct}%`}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-2">
                Established Baseline: <strong>{bm.baseline_val} {bm.unit}</strong>
              </p>
            </div>
          );
        })}
      </div>

      {/* Longitudinal Recharts Graph (Section 18 & 44) */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-lg font-bold text-stone-900">
            14-Day Longitudinal Trends (Routine Adherence vs Confusion Inquiries)
          </h2>
          <p className="text-xs text-stone-500">
            Comparing daily routine completion (%) and medication confirmation (%) with assistance request spikes.
          </p>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.longitudinal_trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" domain={[60, 100]} tick={{ fontSize: 11 }} unit="%" />
              <YAxis yAxisId="right" orientation="right" domain={[0, 8]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="routine_pct"
                name="Routine Completion (%)"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 3 }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="med_adherence_pct"
                name="Medication Adherence (%)"
                stroke="#0284c7"
                strokeWidth={2}
                strokeDasharray="4 4"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="assistance_requests"
                name="Assistance Inquiries (Count)"
                stroke="#f97316"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Clinical Summary (Section 18) & Clinician Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Behavioral Observation */}
        <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-teal-700" />
            <h2 className="text-lg font-bold text-stone-900">
              AI Longitudinal Behavioral Observation
            </h2>
          </div>
          <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200 text-sm text-teal-950 font-medium leading-relaxed">
            "{data.ai_clinical_summary}"
          </div>
          <p className="text-xs text-stone-500">
            Generated using scikit-learn Isolation Forest on multi-dimensional sensor metrics. Does not grade medical progression.
          </p>
        </div>

        {/* Add Clinician Note */}
        <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-stone-700" />
            <h2 className="text-lg font-bold text-stone-900">
              Add Clinician Care Note
            </h2>
          </div>

          <form onSubmit={handleAddNote} className="space-y-3">
            <textarea
              rows={3}
              placeholder="Record clinical impressions, environmental factors, or medication review notes..."
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              className="w-full p-3 rounded-xl border border-stone-300 text-sm focus:outline-teal-600"
            />
            <div className="flex items-center justify-between">
              {noteStatus && (
                <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> {noteStatus}
                </span>
              )}
              <button
                type="submit"
                className="ml-auto px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Save Note</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
