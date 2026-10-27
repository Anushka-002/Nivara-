import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
)
from sqlalchemy.orm import relationship
from backend.app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False) # patient, family, nurse, doctor, emergency
    hashed_password = Column(String(255), nullable=False)
    avatar = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    full_name = Column(String(255), nullable=False)
    preferred_name = Column(String(100), nullable=False)
    age = Column(Integer, default=72)
    emergency_phone = Column(String(50), nullable=True)
    address = Column(String(500), nullable=True)
    photo_url = Column(String(500), nullable=True)
    current_status = Column(String(50), default="Stable") # Stable, Attention, Important, Critical
    status_note = Column(String(255), default="Patient is resting comfortably at home.")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    guardians = relationship("Guardian", back_populates="patient", cascade="all, delete-orphan")
    routines = relationship("Routine", back_populates="patient", cascade="all, delete-orphan")
    medications = relationship("Medication", back_populates="patient", cascade="all, delete-orphan")
    safe_zones = relationship("SafeZone", back_populates="patient", cascade="all, delete-orphan")
    safety_events = relationship("SafetyEvent", back_populates="patient", cascade="all, delete-orphan")
    objects = relationship("ObjectMemory", back_populates="patient", cascade="all, delete-orphan")
    memories = relationship("MemoryBookEntry", back_populates="patient", cascade="all, delete-orphan")

class Guardian(Base):
    __tablename__ = "guardians"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    name = Column(String(255), nullable=False)
    relationship_label = Column(String(100), nullable=False) # Daughter, Son, Nurse, Doctor, Emergency Contact
    role = Column(String(50), nullable=False) # family, nurse, doctor, emergency
    priority = Column(Integer, default=1) # 1: primary, 2: secondary, 3: clinician, 4: emergency
    phone = Column(String(50), nullable=False)
    avatar = Column(String(500), nullable=True)
    can_view_location = Column(Boolean, default=True)
    can_manage_routine = Column(Boolean, default=True)
    can_receive_critical = Column(Boolean, default=True)
    is_available = Column(Boolean, default=True)

    patient = relationship("Patient", back_populates="guardians")

class Routine(Base):
    __tablename__ = "routines"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    title = Column(String(255), default="Daily Companion Routine")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    patient = relationship("Patient", back_populates="routines")
    tasks = relationship("RoutineTask", back_populates="routine", cascade="all, delete-orphan")

class RoutineTask(Base):
    __tablename__ = "routine_tasks"

    id = Column(Integer, primary_key=True, index=True)
    routine_id = Column(Integer, ForeignKey("routines.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(String(500), nullable=True)
    time_of_day = Column(String(50), nullable=False) # e.g. "08:00 AM"
    category = Column(String(50), default="general") # wake, meal, medicine, walk, rest, sleep
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    prompt_count = Column(Integer, default=0)
    order_index = Column(Integer, default=0)

    routine = relationship("Routine", back_populates="tasks")

class Medication(Base):
    __tablename__ = "medications"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    name = Column(String(255), nullable=False)
    simple_name = Column(String(255), nullable=False) # e.g. "Blue Morning Capsule"
    visual_color = Column(String(50), default="blue") # blue, pink, yellow, white
    dosage = Column(String(100), default="1 tablet")
    schedule_time = Column(String(50), nullable=False) # "08:30 AM"
    instructions = Column(String(500), default="Take after breakfast with water")
    prescribed_by = Column(String(255), default="Dr. Mehta (Cardiology)")
    image_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)

    patient = relationship("Patient", back_populates="medications")
    events = relationship("MedicationEvent", back_populates="medication", cascade="all, delete-orphan")

class MedicationEvent(Base):
    __tablename__ = "medication_events"

    id = Column(Integer, primary_key=True, index=True)
    medication_id = Column(Integer, ForeignKey("medications.id"), nullable=False)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    scheduled_at = Column(String(50), nullable=False)
    confirmed_at = Column(DateTime, nullable=True)
    status = Column(String(50), default="pending") # pending, confirmed, missed, escalated
    response_type = Column(String(50), nullable=True) # taken, remind_later, guardian_confirmed
    prompt_attempts = Column(Integer, default=0)
    notes = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    medication = relationship("Medication", back_populates="events")

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    title = Column(String(255), nullable=False)
    location = Column(String(255), nullable=False)
    scheduled_time = Column(String(100), nullable=False) # e.g. "Tomorrow at 11:00 AM"
    companion_name = Column(String(255), default="Priya (Daughter)")
    transport = Column(String(255), default="Car ride with Priya")
    notes = Column(String(500), default="Routine wellness review with Dr. Mehta")
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Location(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    address = Column(String(500), nullable=True)
    is_safe_zone = Column(Boolean, default=True)
    current_safe_zone_name = Column(String(255), default="Home")
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class SafeZone(Base):
    __tablename__ = "safe_zones"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    name = Column(String(255), nullable=False) # Home, Shanti Park, Care Pharmacy, Clinic
    category = Column(String(50), default="home") # home, park, pharmacy, clinic, family
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    radius_meters = Column(Float, default=150.0)
    description = Column(String(500), default="Safe and familiar community area")

    patient = relationship("Patient", back_populates="safe_zones")

class SafetyEvent(Base):
    __tablename__ = "safety_events"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    event_type = Column(String(100), nullable=False) # MISSED_MEDICATION, WANDERING_DEVIATION, REPEATED_ASSISTANCE, HELP_REQUEST, POSSIBLE_FALL
    severity = Column(String(50), nullable=False) # LOW, MEDIUM, HIGH, CRITICAL
    description = Column(String(500), nullable=False)
    evidence_json = Column(Text, nullable=True)
    is_resolved = Column(Boolean, default=False)
    resolved_at = Column(DateTime, nullable=True)
    resolved_by = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    patient = relationship("Patient", back_populates="safety_events")
    alerts = relationship("Alert", back_populates="safety_event", cascade="all, delete-orphan")

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    safety_event_id = Column(Integer, ForeignKey("safety_events.id"), nullable=False)
    target_guardian_id = Column(Integer, ForeignKey("guardians.id"), nullable=True)
    guardian_name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False) # patient, nurse, family, doctor, emergency
    severity = Column(String(50), nullable=False)
    channel = Column(String(50), default="app") # app, sms, push, voice
    status = Column(String(50), default="sent") # sent, delivered, acknowledged, escalated
    explainable_reason = Column(Text, nullable=False)
    acknowledged_at = Column(DateTime, nullable=True)
    action_taken = Column(String(500), default="Pending review")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    safety_event = relationship("SafetyEvent", back_populates="alerts")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(String(50), default="info") # info, warning, danger
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class PatientBaseline(Base):
    __tablename__ = "patient_baselines"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    metric_name = Column(String(100), nullable=False)
    mean_value = Column(Float, nullable=False)
    std_value = Column(Float, default=1.0)
    normal_range_min = Column(Float, nullable=False)
    normal_range_max = Column(Float, nullable=False)
    unit = Column(String(50), default="count")
    last_updated = Column(DateTime, default=datetime.datetime.utcnow)

class DailySummary(Base):
    __tablename__ = "daily_summaries"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    date_str = Column(String(50), nullable=False)
    facts_json = Column(Text, nullable=False)
    anomalies_json = Column(Text, nullable=False)
    recommendations_json = Column(Text, nullable=False)
    guardian_notes = Column(Text, nullable=True)
    overall_status = Column(String(50), default="Stable")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class CaregiverNote(Base):
    __tablename__ = "caregiver_notes"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    author_name = Column(String(255), nullable=False)
    author_role = Column(String(50), nullable=False) # nurse, family, doctor
    note_text = Column(Text, nullable=False)
    shift_category = Column(String(50), default="Day Shift") # Morning, Evening, Night
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ObjectMemory(Base):
    __tablename__ = "object_memories"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    object_name = Column(String(100), nullable=False) # keys, glasses, wallet, phone, medicine box, remote, bag, documents
    simple_name = Column(String(100), nullable=False) # "Reading Glasses", "House Keys"
    last_seen_location = Column(String(255), nullable=False) # "Coffee table in living room"
    last_seen_timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    confidence_score = Column(Float, default=0.94)
    photo_url = Column(String(500), nullable=True)
    notes = Column(String(255), default="Recognized by visual memory scanner")

    patient = relationship("Patient", back_populates="objects")

class MemoryBookEntry(Base):
    __tablename__ = "memory_book_entries"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    title = Column(String(255), nullable=False) # e.g. "Priya"
    relationship_label = Column(String(100), nullable=False) # "Your daughter"
    category = Column(String(50), default="person") # person, place, memory
    photo_url = Column(String(500), nullable=False)
    caption = Column(Text, nullable=False)
    audio_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    patient = relationship("Patient", back_populates="memories")

class CognitiveActivity(Base):
    __tablename__ = "cognitive_activities"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    activity_name = Column(String(255), nullable=False) # Gentle Matching, Recall, Orientation
    activity_type = Column(String(100), default="memory_card")
    score = Column(Integer, default=5)
    max_score = Column(Integer, default=5)
    encouragement_text = Column(String(255), default="Wonderful effort! You are doing well.")
    completed_at = Column(DateTime, default=datetime.datetime.utcnow)

class Consent(Base):
    __tablename__ = "consents"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    guardian_name = Column(String(255), nullable=False)
    guardian_role = Column(String(50), nullable=False)
    permission_type = Column(String(100), nullable=False) # Safety alerts, Location sharing, Health trends
    is_granted = Column(Boolean, default=True)
    granted_at = Column(DateTime, default=datetime.datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    actor_name = Column(String(255), nullable=False)
    actor_role = Column(String(50), nullable=False)
    action = Column(String(255), nullable=False)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
