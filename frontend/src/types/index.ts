export type UserRole = 'patient' | 'family' | 'nurse' | 'doctor';

export interface PatientStatus {
  id: number;
  full_name: string;
  preferred_name: string;
  age: number;
  current_status: 'Stable' | 'Attention' | 'Important' | 'Critical';
  status_note: string;
  next_activity?: string;
  next_time?: string;
  medicine_pending_count: number;
  independence_score: number;
  routine_completion_pct: number;
}

export interface RoutineTask {
  id: number;
  title: string;
  description?: string;
  time_of_day: string;
  category: string;
  is_completed: boolean;
  order_index: number;
}

export interface Medication {
  id: number;
  name: string;
  simple_name: string;
  visual_color: string;
  dosage: string;
  schedule_time: string;
  instructions: string;
  prescribed_by: string;
  image_url?: string;
  is_pending_today: boolean;
}

export interface ObjectMemory {
  id: number;
  object_name: string;
  simple_name: string;
  last_seen_location: string;
  last_seen_timestamp: string;
  confidence_score: number;
  photo_url?: string;
  notes?: string;
}

export interface MemoryBookEntry {
  id: number;
  title: string;
  relationship_label: string;
  category: 'person' | 'place' | 'memory';
  photo_url: string;
  caption: string;
  audio_url?: string;
}

export interface GuardianPerson {
  id: number;
  name: string;
  relationship: string;
  role: string;
  phone: string;
  avatar?: string;
}

export interface SafeZone {
  id: number;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  description?: string;
}

export interface GuardianDashboardData {
  patient: {
    id: number;
    name: string;
    preferred_name: string;
    age: number;
    status: 'Stable' | 'Attention' | 'Important' | 'Critical';
    status_note: string;
    address: string;
    emergency_phone: string;
  };
  routine: {
    completion_percentage: number;
    total_tasks: number;
    completed_tasks: number;
  };
  medications: Array<{
    id: number;
    name: string;
    simple_name: string;
    time: string;
    status: string;
  }>;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    is_safe_zone: boolean;
    safe_zone_name: string;
  };
  active_alerts_count: number;
  assistance_requests_today: number;
  independence_index: string;
}

export interface AlertItem {
  id: number;
  safety_event_id: number;
  guardian_name: string;
  role: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  channel: string;
  status: 'sent' | 'delivered' | 'acknowledged' | 'escalated';
  explainable_reason: string;
  action_taken: string;
  created_at: string;
  acknowledged_at?: string;
}

export interface CaregiverNote {
  id: number;
  author_name: string;
  author_role: string;
  note_text: string;
  shift_category: string;
  created_at: string;
}

export interface DailySummaryData {
  title: string;
  date: string;
  observed_facts: string[];
  ai_detected_patterns: string[];
  recommendations: string[];
  disclaimer: string;
}

export interface DoctorOverviewData {
  patient_info: {
    full_name: string;
    preferred_name: string;
    age: number;
    address: string;
    doctor: string;
    primary_nurse: string;
  };
  longitudinal_trends: Array<{
    day: string;
    routine_pct: number;
    med_adherence_pct: number;
    assistance_requests: number;
    wandering_events: number;
  }>;
  baseline_metrics: Array<{
    metric_name: string;
    baseline_val: number;
    current_val: number;
    unit: string;
    deviation_pct: number;
    status: string;
  }>;
  ai_clinical_summary: string;
  underlying_events: any[];
  disclaimer: string;
}
