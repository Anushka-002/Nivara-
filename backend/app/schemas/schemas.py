from typing import List, Optional, Any, Dict
from pydantic import BaseModel, ConfigDict
from datetime import datetime

class UserBase(BaseModel):
    email: str
    name: str
    role: str
    avatar: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class PatientStatusResponse(BaseModel):
    id: int
    full_name: str
    preferred_name: str
    age: int
    current_status: str
    status_note: str
    next_activity: Optional[str] = None
    next_time: Optional[str] = None
    medicine_pending_count: int = 0
    independence_score: int = 88
    routine_completion_pct: int = 85

class RoutineTaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    time_of_day: str
    category: str
    is_completed: bool
    order_index: int
    model_config = ConfigDict(from_attributes=True)

class MedicationResponse(BaseModel):
    id: int
    name: str
    simple_name: str
    visual_color: str
    dosage: str
    schedule_time: str
    instructions: str
    prescribed_by: str
    image_url: Optional[str]
    is_pending_today: bool = True
    model_config = ConfigDict(from_attributes=True)

class MedicationConfirmRequest(BaseModel):
    medication_id: int
    response_type: str # taken, remind_later, guardian_confirmed
    notes: Optional[str] = None

class ObjectMemoryResponse(BaseModel):
    id: int
    object_name: str
    simple_name: str
    last_seen_location: str
    last_seen_timestamp: datetime
    confidence_score: float
    photo_url: Optional[str]
    notes: Optional[str]
    model_config = ConfigDict(from_attributes=True)

class MemoryBookResponse(BaseModel):
    id: int
    title: str
    relationship_label: str
    category: str
    photo_url: str
    caption: str
    audio_url: Optional[str]
    model_config = ConfigDict(from_attributes=True)

class SafeZoneResponse(BaseModel):
    id: int
    name: str
    category: str
    latitude: float
    longitude: float
    radius_meters: float
    description: Optional[str]
    model_config = ConfigDict(from_attributes=True)

class LocationResponse(BaseModel):
    latitude: float
    longitude: float
    address: str
    is_safe_zone: bool
    current_safe_zone_name: str
    timestamp: datetime

class SafetyEventResponse(BaseModel):
    id: int
    patient_id: int
    event_type: str
    severity: str
    description: str
    evidence_json: Optional[str]
    is_resolved: bool
    resolved_at: Optional[datetime]
    resolved_by: Optional[str]
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class AlertResponse(BaseModel):
    id: int
    safety_event_id: int
    guardian_name: str
    role: str
    severity: str
    channel: str
    status: str
    explainable_reason: str
    action_taken: str
    created_at: datetime
    acknowledged_at: Optional[datetime]
    model_config = ConfigDict(from_attributes=True)

class CaregiverNoteCreate(BaseModel):
    author_name: str
    author_role: str
    note_text: str
    shift_category: str = "Day Shift"

class CaregiverNoteResponse(BaseModel):
    id: int
    author_name: str
    author_role: str
    note_text: str
    shift_category: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class SimulationTriggerRequest(BaseModel):
    scenario: str # "missed_medicine", "wandering", "unusual_routine", "help_request", "possible_fall", "scenario_step"
    step_number: Optional[int] = None
    custom_note: Optional[str] = None

class AskCompanionRequest(BaseModel):
    query: str
    input_type: str = "text" # "text" or "voice"

class CompanionResponse(BaseModel):
    spoken_text: str
    suggested_action: Optional[str] = None
    action_target: Optional[str] = None
    display_card: Optional[Dict[str, Any]] = None
    audio_base64: Optional[str] = None

class BaselineMetric(BaseModel):
    metric_name: str
    baseline_val: float
    current_val: float
    unit: str
    deviation_pct: float
    status: str # normal, attention, elevated

class DoctorOverviewResponse(BaseModel):
    patient_info: Dict[str, Any]
    longitudinal_trends: List[Dict[str, Any]]
    baseline_metrics: List[BaselineMetric]
    ai_clinical_summary: str
    underlying_events: List[SafetyEventResponse]
    disclaimer: str
