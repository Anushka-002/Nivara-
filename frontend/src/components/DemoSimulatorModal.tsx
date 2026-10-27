import React, { useState } from 'react';
import { api } from '../services/api';
import {
  X, Sparkles, AlertTriangle, MapPin, Pill, HelpCircle,
  RotateCcw, ChevronRight, ChevronLeft, ShieldCheck, CheckCircle2, UserCheck, BookOpen, Brain
} from 'lucide-react';

interface DemoSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStateChanged: () => void;
}

export const DemoSimulatorModal: React.FC<DemoSimulatorModalProps> = ({
  isOpen,
  onClose,
  onStateChanged
}) => {
  const [activeTab, setActiveTab] = useState<'scenarios_1_5' | 'step_by_step' | 'scenarios'>('scenarios_1_5');
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastResult, setLastResult] = useState<any>(null);

  if (!isOpen) return null;

  const runScenario = async (scenario: string, stepNumber?: number) => {
    try {
      setLoading(true);
      const res = await api.triggerSimulation(scenario, stepNumber);
      setLastResult(res);
      onStateChanged();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStepChange = async (newStep: number) => {
    if (newStep < 1 || newStep > 11) return;
    setCurrentStep(newStep);
    await runScenario('step', newStep);
  };

  const resetAll = async () => {
    setCurrentStep(1);
    await runScenario('reset');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-amber-200" />
            <div>
              <h2 className="text-lg font-bold">Nivara Demo & Viva Scenario Runner</h2>
              <p className="text-xs text-amber-100">
                Interactive simulator for Sections 36–40 (Scenarios 1–5) and Section 47
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 transition cursor-pointer text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-4 pt-3 overflow-x-auto text-xs sm:text-sm">
          <button
            onClick={() => setActiveTab('scenarios_1_5')}
            className={`pb-3 px-3.5 font-bold transition border-b-2 cursor-pointer shrink-0 ${
              activeTab === 'scenarios_1_5'
                ? 'border-orange-600 text-orange-700'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            🤖 Scenarios 1–5 (GenAI/RAG/Safety)
          </button>
          <button
            onClick={() => setActiveTab('step_by_step')}
            className={`pb-3 px-3.5 font-bold transition border-b-2 cursor-pointer shrink-0 ${
              activeTab === 'step_by_step'
                ? 'border-orange-600 text-orange-700'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            📋 11-Step Walkthrough (Section 47)
          </button>
          <button
            onClick={() => setActiveTab('scenarios')}
            className={`pb-3 px-3.5 font-bold transition border-b-2 cursor-pointer shrink-0 ${
              activeTab === 'scenarios'
                ? 'border-orange-600 text-orange-700'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            ⚡ Fast Triggers
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {activeTab === 'scenarios_1_5' && (
            <div className="space-y-4">
              <p className="text-xs text-stone-500">
                Demonstrate the five core AI/ML scenarios specified in Sections 36–40:
              </p>

              <div className="space-y-3">
                {/* Scenario 1: GenAI + RAG */}
                <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50 hover:border-amber-400 transition space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-amber-700 tracking-wider">
                      Demo Scenario 1: GenAI + RAG (Section 36)
                    </span>
                    <button
                      onClick={() => runScenario('scenario_1_rag')}
                      disabled={loading}
                      className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Run: "Who is Priya?"
                    </button>
                  </div>
                  <p className="text-xs text-stone-700">
                    Patient asks <strong>"Who is Priya?"</strong>. System performs ChromaDB semantic retrieval on approved memories and generates grounded response: <em>"Priya is your daughter. She usually visits you on Sundays."</em> (Zero hallucination).
                  </p>
                </div>

                {/* Scenario 2: Daily Guidance */}
                <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50 hover:border-emerald-400 transition space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-emerald-700 tracking-wider">
                      Demo Scenario 2: Daily Guidance (Section 37)
                    </span>
                    <button
                      onClick={() => runScenario('scenario_2_guidance')}
                      disabled={loading}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Run: "What should I do now?"
                    </button>
                  </div>
                  <p className="text-xs text-stone-700">
                    Patient asks <strong>"What should I do now?"</strong>. Retrieves today's routine and presents simple NOW / NEXT / LATER guidance: <em>"It is almost lunchtime. You can have some water first, then we'll remind you about lunch."</em>
                  </p>
                </div>

                {/* Scenario 3: Safety */}
                <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50 hover:border-rose-400 transition space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-rose-700 tracking-wider">
                      Demo Scenario 3: Safety Escalation (Section 38)
                    </span>
                    <button
                      onClick={() => runScenario('scenario_3_safety')}
                      disabled={loading}
                      className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Run: Safe Zone Departure
                    </button>
                  </div>
                  <p className="text-xs text-stone-700">
                    Patient leaves safe zone → Prompt sent: <em>"Would you like help getting home?"</em> → Unanswered → Configured guardian notified: <em>"Patient has remained outside the configured safe area for longer than expected and has not responded to the assistance prompt."</em>
                  </p>
                </div>

                {/* Scenario 4: Object Finding */}
                <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50 hover:border-purple-400 transition space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-purple-700 tracking-wider">
                      Demo Scenario 4: Object Finding (Section 39)
                    </span>
                    <button
                      onClick={() => runScenario('scenario_4_object')}
                      disabled={loading}
                      className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Run: "Where are my glasses?"
                    </button>
                  </div>
                  <p className="text-xs text-stone-700">
                    Patient asks <strong>"Where are my glasses?"</strong>. Vision/spatial memory looks up last observed record: <em>"I last saw your glasses on the living-room table."</em> (Explicitly noting last seen does not guarantee item hasn't moved).
                  </p>
                </div>

                {/* Scenario 5: Caregiver AI Summary */}
                <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50 hover:border-sky-400 transition space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-sky-700 tracking-wider">
                      Demo Scenario 5: Caregiver AI Summary (Section 40)
                    </span>
                    <button
                      onClick={() => runScenario('scenario_5_caregiver_summary')}
                      disabled={loading}
                      className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Run: Daily Caregiver Summary
                    </button>
                  </div>
                  <p className="text-xs text-stone-700">
                    Generates end-of-day caregiver summary where <strong>every statement is traceable to actual recorded database events</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'step_by_step' && (
            <div>
              {/* Step indicator */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Step {currentStep} of 11
                </span>
                <span className="text-xs bg-amber-100 text-amber-800 font-medium px-2.5 py-0.5 rounded-full border border-amber-200">
                  Viva Demonstration Flow
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-stone-100 h-2 rounded-full mb-6 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-orange-600 h-full transition-all duration-300"
                  style={{ width: `${(currentStep / 11) * 100}%` }}
                ></div>
              </div>

              {/* Current Step Details */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-700 font-bold flex items-center justify-center shrink-0">
                    {currentStep}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-stone-900">
                      {getStepTitle(currentStep)}
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {getStepActor(currentStep)}
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 text-sm">
                  <div className="bg-white p-3 rounded-lg border border-stone-200 shadow-2xs">
                    <span className="text-xs font-bold text-stone-500 block mb-1 uppercase tracking-wide">
                      🗣️ Spoken / Transmitted Message
                    </span>
                    <p className="text-stone-800 font-medium italic">
                      "{getStepMessage(currentStep)}"
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-200/80">
                      <span className="font-bold text-emerald-800 block mb-0.5">👵 Patient Screen</span>
                      <p className="text-emerald-900">{getStepPatientUI(currentStep)}</p>
                    </div>
                    <div className="bg-amber-50/70 p-2.5 rounded-lg border border-amber-200/80">
                      <span className="font-bold text-amber-800 block mb-0.5">🛡️ Guardian / Care Team</span>
                      <p className="text-amber-900">{getStepGuardianUI(currentStep)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step Navigation Controls */}
              <div className="flex items-center justify-between pt-4">
                <button
                  disabled={currentStep <= 1 || loading}
                  onClick={() => handleStepChange(currentStep - 1)}
                  className="flex items-center gap-1.5 px-4 py-2 border border-stone-300 rounded-xl text-stone-700 text-sm font-medium hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous Step
                </button>

                <button
                  onClick={resetAll}
                  className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-800 px-3 py-1.5 rounded-md hover:bg-stone-100 cursor-pointer"
                  title="Reset to morning baseline"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset to Step 1
                </button>

                <button
                  disabled={currentStep >= 11 || loading}
                  onClick={() => handleStepChange(currentStep + 1)}
                  className="flex items-center gap-1.5 px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-semibold shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <span>Next Step</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'scenarios' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => runScenario('missed_medicine')}
                  disabled={loading}
                  className="p-3.5 rounded-xl border border-stone-200 bg-white hover:bg-amber-50/60 hover:border-amber-300 transition text-left flex items-start gap-3 group cursor-pointer shadow-2xs"
                >
                  <div className="p-2 rounded-lg bg-amber-100 text-amber-700 group-hover:scale-105 transition">
                    <Pill className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-stone-900">Missed Medicine</h4>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Triggers gentle reminder, then routes MEDIUM alert to Nurse Anita.
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => runScenario('wandering')}
                  disabled={loading}
                  className="p-3.5 rounded-xl border border-stone-200 bg-white hover:bg-rose-50/60 hover:border-rose-300 transition text-left flex items-start gap-3 group cursor-pointer shadow-2xs"
                >
                  <div className="p-2 rounded-lg bg-rose-100 text-rose-700 group-hover:scale-105 transition">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-stone-900">Wandering Deviation</h4>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Outside safe zone. Prompts patient gently, then alerts Daughter Priya.
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => runScenario('unusual_routine')}
                  disabled={loading}
                  className="p-3.5 rounded-xl border border-stone-200 bg-white hover:bg-yellow-50/60 hover:border-yellow-300 transition text-left flex items-start gap-3 group cursor-pointer shadow-2xs"
                >
                  <div className="p-2 rounded-lg bg-yellow-100 text-yellow-800 group-hover:scale-105 transition">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-stone-900">Unusual Routine (ML)</h4>
                    <p className="text-xs text-stone-500 mt-0.5">
                      9 assistance inquiries vs baseline 1-2. Evaluated via Isolation Forest.
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => runScenario('possible_fall')}
                  disabled={loading}
                  className="p-3.5 rounded-xl border border-stone-200 bg-white hover:bg-rose-50/60 hover:border-rose-300 transition text-left flex items-start gap-3 group cursor-pointer shadow-2xs"
                >
                  <div className="p-2 rounded-lg bg-rose-200 text-rose-900 group-hover:scale-105 transition">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-stone-900">Possible Emergency</h4>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Abrupt motion pattern + no response. CRITICAL tier to all guardians.
                    </p>
                  </div>
                </button>
              </div>

              <div className="pt-2">
                <button
                  onClick={resetAll}
                  disabled={loading}
                  className="w-full py-2.5 border border-stone-300 hover:bg-stone-100 rounded-xl text-stone-700 text-sm font-medium flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset Patient & Simulator to Normal Morning Baseline
                </button>
              </div>
            </div>
          )}

          {/* Execution feedback output */}
          {lastResult && (
            <div className="bg-stone-900 text-stone-100 p-4 rounded-xl text-xs space-y-2">
              <div className="flex items-center justify-between text-amber-300 font-bold">
                <span>Simulator Output:</span>
                <span>{lastResult.scenario || `Step ${currentStep}`}</span>
              </div>
              <p className="text-stone-300 font-medium">
                {lastResult.spoken_text || lastResult.patient_message || lastResult.patient_prompt || lastResult.message || 'Executed successfully.'}
              </p>
              {lastResult.summary_points && (
                <ul className="list-disc list-inside space-y-1 text-emerald-300 pt-1">
                  {lastResult.summary_points.map((pt: string, idx: number) => (
                    <li key={idx}>{pt}</li>
                  ))}
                </ul>
              )}
              {lastResult.routed_to && (
                <p className="text-emerald-300">
                  ✓ Routed to: {lastResult.routed_to.join(', ')}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper descriptions matching Section 47
function getStepTitle(step: number): string {
  const titles: Record<number, string> = {
    1: 'Step 1: Patient Wakes Up (Calm Greeting)',
    2: 'Step 2: Medicine Reminder Appears',
    3: 'Step 3: Gentle Second Reminder',
    4: 'Step 4: Nurse Escalation (Intelligent Routing)',
    5: 'Step 5: Patient Leaves Home Unexpectedly',
    6: 'Step 6: Gentle Orientation Prompt',
    7: 'Step 7: Family Alert Escalated with Live Location',
    8: 'Step 8: Guardian Opens Dashboard & Reviews Map',
    9: 'Step 9: Guardian Acknowledges & Connects Call',
    10: 'Step 10: System Records Audit Trail',
    11: 'Step 11: Patient Returns Home — Resolved!'
  };
  return titles[step] || `Step ${step}`;
}

function getStepActor(step: number): string {
  const actors: Record<number, string> = {
    1: 'Patient Perspective — Morning Rhythm',
    2: 'Contextual Prompting Engine',
    3: 'Gentle Interval Reminder',
    4: 'Intelligent Alert Router → Nurse Anita',
    5: 'Safe Zone Geofencing Sensor',
    6: 'Compassionate Assistance Dialogue',
    7: 'Escalation Engine → Priya (Daughter)',
    8: 'Guardian Management Console',
    9: 'Guardian Interaction & Verification',
    10: 'Compliance & Audit Log Engine',
    11: 'Automatic Event Resolution'
  };
  return actors[step] || 'System Action';
}

function getStepMessage(step: number): string {
  const msgs: Record<number, string> = {
    1: 'Good morning ❤️ What would you like to do?',
    2: 'It is time for your medicine. Did you take it?',
    3: 'Take your time. Just a gentle reminder for your blue capsule.',
    4: 'Notice to Nurse Anita: Morning medicine has not yet been confirmed by Mrs. Sharma.',
    5: 'Motion sensor: Coordinates outside 150m Green Valley perimeter.',
    6: 'Would you like help getting home?',
    7: 'Alert to Priya: Patient has remained outside configured safe area and has not responded.',
    8: 'Guardian viewing live map: Patient is near Ring Road junction.',
    9: 'Priya acknowledged event: Connecting one-tap call to Mrs. Sharma.',
    10: 'Audit Logged: Guardian Priya verified patient safety at 6:42 PM.',
    11: 'Welcome home ❤️ Alert automatically resolved.'
  };
  return msgs[step] || '';
}

function getStepPatientUI(step: number): string {
  const uis: Record<number, string> = {
    1: 'Minimal screen: Good Morning, NOW/NEXT/LATER, 5 large buttons.',
    2: 'Large blue pill card with [ I TOOK IT ] / [ REMIND ME LATER ] / [ I NEED HELP ].',
    3: 'Calm screen remains unchanged. No jarring sirens or flashing red lights.',
    4: 'Patient screen remains calm. No technical panic warnings.',
    5: 'Senses movement. Activates quiet background location check.',
    6: 'Single prompt: "Would you like help getting home?" with [ GO HOME ] button.',
    7: 'Step-by-step cognitive navigation: "Walk straight towards the pharmacy."',
    8: 'Friendly voice: "Walk straight. Turn right after the pharmacy."',
    9: 'Incoming call from Priya with photo & daughter label.',
    10: '"Priya knows you are on your way home. Take your time."',
    11: 'Returns to green baseline: "You are doing well today."'
  };
  return uis[step] || '';
}

function getStepGuardianUI(step: number): string {
  const uis: Record<number, string> = {
    1: '🟢 Status: Stable. Routine starting at 7:30 AM.',
    2: '🟡 Medicine reminder queued. Waiting for confirmation.',
    3: 'Timer running (15 min delay). Tier-1 alert preparing.',
    4: '🟠 Alert delivered to Nurse Anita. Family not disturbed unnecessarily.',
    5: 'Geofence breach detected. Tracking duration and direction.',
    6: 'Awaiting patient response to orientation prompt.',
    7: '🔴 HIGH alert delivered to Priya with live breadcrumbs.',
    8: 'Priya opens live map showing 750m deviation and safe zone.',
    9: 'Priya taps "Acknowledge & Call". System verifies contact.',
    10: 'System logs timestamped record: "Guardian contacted patient."',
    11: '🟢 Status restored: Stable. Alert marked "Resolved Safely".'
  };
  return uis[step] || '';
}
