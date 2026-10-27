import {
  PatientStatus, RoutineTask, Medication, ObjectMemory,
  MemoryBookEntry, GuardianPerson, SafeZone, GuardianDashboardData,
  AlertItem, CaregiverNote, DailySummaryData, DoctorOverviewData
} from '../types';

const API_BASE = '/api';

export const api = {
  // Patient endpoints
  getPatientStatus: async (): Promise<PatientStatus> => {
    const res = await fetch(`${API_BASE}/patient/status`);
    if (!res.ok) throw new Error('Failed to fetch patient status');
    return res.json();
  },

  getRoutine: async (): Promise<RoutineTask[]> => {
    const res = await fetch(`${API_BASE}/patient/routine`);
    if (!res.ok) throw new Error('Failed to fetch routine');
    return res.json();
  },

  toggleRoutineTask: async (taskId: number) => {
    const res = await fetch(`${API_BASE}/patient/routine/task/${taskId}/toggle`, {
      method: 'POST'
    });
    return res.json();
  },

  getMedications: async (): Promise<Medication[]> => {
    const res = await fetch(`${API_BASE}/patient/medications`);
    if (!res.ok) throw new Error('Failed to fetch medications');
    return res.json();
  },

  confirmMedication: async (medicationId: number, responseType: 'taken' | 'remind_later') => {
    const res = await fetch(`${API_BASE}/patient/medication/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ medication_id: medicationId, response_type: responseType })
    });
    return res.json();
  },

  getObjectMemories: async (): Promise<ObjectMemory[]> => {
    const res = await fetch(`${API_BASE}/patient/objects`);
    if (!res.ok) throw new Error('Failed to fetch object memories');
    return res.json();
  },

  scanObjectPhoto: async (objectName: string, locationHint?: string, file?: File) => {
    const formData = new FormData();
    formData.append('object_name', objectName);
    if (locationHint) formData.append('location_hint', locationHint);
    if (file) formData.append('file', file);

    const res = await fetch(`${API_BASE}/patient/objects/scan`, {
      method: 'POST',
      body: formData
    });
    return res.json();
  },

  getMemoryBook: async (): Promise<MemoryBookEntry[]> => {
    const res = await fetch(`${API_BASE}/patient/memories`);
    if (!res.ok) throw new Error('Failed to fetch memory book');
    return res.json();
  },

  getTrustedPeople: async (): Promise<GuardianPerson[]> => {
    const res = await fetch(`${API_BASE}/patient/people`);
    if (!res.ok) throw new Error('Failed to fetch trusted people');
    return res.json();
  },

  submitCheckin: async (mood: string) => {
    const res = await fetch(`${API_BASE}/patient/checkin?mood=${encodeURIComponent(mood)}`, {
      method: 'POST'
    });
    return res.json();
  },

  getHomeNavigation: async () => {
    const res = await fetch(`${API_BASE}/patient/navigation/home`);
    return res.json();
  },

  requestHelp: async (needType: string) => {
    const res = await fetch(`${API_BASE}/patient/help?need_type=${encodeURIComponent(needType)}`, {
      method: 'POST'
    });
    return res.json();
  },

  askCompanion: async (query: string, inputType: 'text' | 'voice' = 'text') => {
    const res = await fetch(`${API_BASE}/patient/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, input_type: inputType })
    });
    return res.json();
  },

  getPrivacyTransfers: async () => {
    const res = await fetch(`${API_BASE}/patient/privacy`);
    return res.json();
  },

  // Guardian endpoints
  getGuardianDashboard: async (): Promise<GuardianDashboardData> => {
    const res = await fetch(`${API_BASE}/guardian/dashboard`);
    if (!res.ok) throw new Error('Failed to fetch guardian dashboard');
    return res.json();
  },

  getGuardianAlerts: async (): Promise<AlertItem[]> => {
    const res = await fetch(`${API_BASE}/guardian/alerts`);
    if (!res.ok) throw new Error('Failed to fetch alerts');
    return res.json();
  },

  acknowledgeAlert: async (alertId: number, actionNote?: string) => {
    const res = await fetch(`${API_BASE}/guardian/alerts/${alertId}/acknowledge?action_note=${encodeURIComponent(actionNote || 'Acknowledged by guardian')}`, {
      method: 'POST'
    });
    return res.json();
  },

  getSafeZones: async (): Promise<SafeZone[]> => {
    const res = await fetch(`${API_BASE}/guardian/safe-zones`);
    return res.json();
  },

  getDailySummary: async (): Promise<DailySummaryData> => {
    const res = await fetch(`${API_BASE}/guardian/summary/today`);
    return res.json();
  },

  getHandoffNotes: async (): Promise<CaregiverNote[]> => {
    const res = await fetch(`${API_BASE}/guardian/handoff`);
    return res.json();
  },

  postHandoffNote: async (note: { author_name: string; author_role: string; note_text: string; shift_category: string }) => {
    const res = await fetch(`${API_BASE}/guardian/handoff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(note)
    });
    return res.json();
  },

  getCareTeam: async () => {
    const res = await fetch(`${API_BASE}/guardian/care-team`);
    return res.json();
  },

  // Doctor endpoints
  getDoctorOverview: async (): Promise<DoctorOverviewData> => {
    const res = await fetch(`${API_BASE}/doctor/overview`);
    if (!res.ok) throw new Error('Failed to fetch doctor overview');
    return res.json();
  },

  addDoctorNote: async (noteText: string) => {
    const res = await fetch(`${API_BASE}/doctor/notes?note_text=${encodeURIComponent(noteText)}`, {
      method: 'POST'
    });
    return res.json();
  },

  // Simulation & Demo endpoints
  triggerSimulation: async (scenario: string, stepNumber?: number, customNote?: string) => {
    const res = await fetch(`${API_BASE}/simulation/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario, step_number: stepNumber, custom_note: customNote })
    });
    return res.json();
  }
};
