import React, { useEffect, useState } from 'react';
import { AlertItem } from '../../types';
import { api } from '../../services/api';
import {
  ArrowLeft, AlertTriangle, AlertCircle, CheckCircle2,
  Clock, ShieldAlert, Check, HelpCircle
} from 'lucide-react';

interface GuardianAlertsProps {
  onBack: () => void;
  onRefresh: () => void;
}

export const GuardianAlerts: React.FC<GuardianAlertsProps> = ({ onBack, onRefresh }) => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const data = await api.getGuardianAlerts();
      setAlerts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleAcknowledge = async (alertId: number) => {
    try {
      await api.acknowledgeAlert(alertId, 'Guardian Priya confirmed patient safe.');
      await fetchAlerts();
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-stone-300 text-stone-700 font-bold hover:bg-stone-100 text-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <h1 className="text-xl sm:text-2xl font-black text-stone-900 font-serif">
          🔔 Alert Notification Center
        </h1>
      </div>

      {/* Differentiating explanation box */}
      <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 text-xs text-stone-600 flex items-start gap-3">
        <HelpCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-stone-800 block">Intelligent Multi-Guardian Alert Routing:</span>
          Nivara evaluates event risk and routes LOW alerts to the patient only, MEDIUM to visiting nurse, HIGH to nurse and family, and CRITICAL to all guardians.
        </div>
      </div>

      {/* Alerts list */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-10 text-stone-500 font-bold">Loading alerts...</div>
        ) : alerts.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-3xl p-10 text-center text-stone-500 font-semibold">
            No active safety alerts. Everything is within normal baseline.
          </div>
        ) : (
          alerts.map(a => {
            const isCritical = a.severity === 'CRITICAL';
            const isHigh = a.severity === 'HIGH';
            const isMedium = a.severity === 'MEDIUM';

            return (
              <div
                key={a.id}
                className={`bg-white border-2 rounded-3xl p-6 shadow-sm space-y-4 transition ${
                  isCritical
                    ? 'border-rose-400 bg-rose-50/20'
                    : isHigh
                    ? 'border-orange-300 bg-orange-50/20'
                    : isMedium
                    ? 'border-yellow-300 bg-yellow-50/20'
                    : 'border-stone-200'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">
                      {isCritical ? '🔴' : isHigh ? '🟠' : isMedium ? '🟡' : '🟢'}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                          isCritical
                            ? 'bg-rose-100 text-rose-800'
                            : isHigh
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {a.severity} Priority
                        </span>
                        <span className="text-xs text-stone-500 font-medium flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <h3 className="text-lg font-black text-stone-900 mt-1">
                        Routed to: {a.guardian_name}
                      </h3>
                    </div>
                  </div>

                  {/* Status pill */}
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    a.status === 'acknowledged'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800 animate-calm-pulse'
                  }`}>
                    {a.status === 'acknowledged' ? '✓ Acknowledged' : '⚠️ Pending Action'}
                  </span>
                </div>

                {/* Section 31 & 32: 5 Explainability Fields */}
                <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-2 text-xs sm:text-sm">
                  <div>
                    <strong className="text-stone-700">WHAT happened:</strong>
                    <span className="ml-2 text-stone-900 font-medium">{a.explainable_reason}</span>
                  </div>
                  <div>
                    <strong className="text-stone-700">WHO was notified:</strong>
                    <span className="ml-2 text-stone-900 font-medium">{a.guardian_name} (Role: {a.role.toUpperCase()})</span>
                  </div>
                  <div>
                    <strong className="text-stone-700">ACTION taken:</strong>
                    <span className="ml-2 text-stone-900 font-medium">{a.action_taken}</span>
                  </div>
                </div>

                {/* Acknowledge Button */}
                {a.status !== 'acknowledged' && (
                  <div className="pt-1 flex justify-end">
                    <button
                      onClick={() => handleAcknowledge(a.id)}
                      className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-xs"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Acknowledge & Confirm Patient Safe</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
