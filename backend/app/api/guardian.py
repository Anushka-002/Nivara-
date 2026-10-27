import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from backend.app.database import get_db
from backend.app.models.models import (
    Patient, Routine, RoutineTask, Medication, MedicationEvent,
    SafeZone, Location, SafetyEvent, Alert, Guardian,
    DailySummary, CaregiverNote, AuditLog
)
from backend.app.schemas.schemas import (
    AlertResponse, SafeZoneResponse, LocationResponse,
    CaregiverNoteCreate, CaregiverNoteResponse
)
from backend.app.ai.companion_nlp import companion_nlp

router = APIRouter(prefix="/api/guardian", tags=["Guardian"])

@router.get("/dashboard")
def get_guardian_dashboard(db: Session = Depends(get_db)):
    patient = db.query(Patient).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient record not found")

    # Routine completion
    routine = db.query(Routine).filter(Routine.patient_id == patient.id, Routine.is_active == True).first()
    routine_pct = 85
    if routine:
        tasks = db.query(RoutineTask).filter(RoutineTask.routine_id == routine.id).all()
        if tasks:
            routine_pct = int((sum(1 for t in tasks if t.is_completed) / len(tasks)) * 100)

    # Medication status
    meds = db.query(Medication).filter(Medication.patient_id == patient.id, Medication.is_active == True).all()
    med_summary = []
    for m in meds:
        evt = db.query(MedicationEvent).filter(MedicationEvent.medication_id == m.id).order_by(MedicationEvent.id.desc()).first()
        status = evt.status if evt else "pending"
        med_summary.append({
            "id": m.id,
            "name": m.name,
            "simple_name": m.simple_name,
            "time": m.schedule_time,
            "status": status
        })

    # Location
    loc = db.query(Location).filter(Location.patient_id == patient.id).order_by(Location.id.desc()).first()

    # Active alerts
    active_alerts = db.query(Alert).filter(Alert.status.in_(["sent", "delivered"])).order_by(Alert.id.desc()).all()

    # Calculate overall patient status badge
    if any(a.severity == "CRITICAL" for a in active_alerts):
        overall_status = "Critical"
    elif any(a.severity == "HIGH" for a in active_alerts):
        overall_status = "Important"
    elif any(a.severity == "MEDIUM" for a in active_alerts):
        overall_status = "Attention"
    else:
        overall_status = "Stable"

    return {
        "patient": {
            "id": patient.id,
            "name": patient.full_name,
            "preferred_name": patient.preferred_name,
            "age": patient.age,
            "status": overall_status,
            "status_note": patient.status_note,
            "address": patient.address,
            "emergency_phone": patient.emergency_phone
        },
        "routine": {
            "completion_percentage": routine_pct,
            "total_tasks": 11,
            "completed_tasks": int(11 * (routine_pct / 100))
        },
        "medications": med_summary,
        "location": {
            "latitude": loc.latitude if loc else 26.9124,
            "longitude": loc.longitude if loc else 75.7873,
            "address": loc.address if loc else "Green Valley Residences",
            "is_safe_zone": loc.is_safe_zone if loc else True,
            "safe_zone_name": loc.current_safe_zone_name if loc else "Home (Green Valley)"
        },
        "active_alerts_count": len(active_alerts),
        "assistance_requests_today": 3,
        "independence_index": "88% (Positive trend vs last week)"
    }

@router.get("/alerts", response_model=List[AlertResponse])
def get_guardian_alerts(db: Session = Depends(get_db)):
    alerts = db.query(Alert).order_by(Alert.created_at.desc()).limit(20).all()
    return alerts

@router.post("/alerts/{alert_id}/acknowledge")
def acknowledge_alert(alert_id: int, action_note: Optional[str] = "Guardian acknowledged and verified safe", db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    alert.status = "acknowledged"
    alert.acknowledged_at = datetime.datetime.utcnow()
    alert.action_taken = action_note

    # Check if underlying safety event can be resolved
    if alert.safety_event:
        alert.safety_event.is_resolved = True
        alert.safety_event.resolved_at = datetime.datetime.utcnow()
        alert.safety_event.resolved_by = alert.guardian_name

    # Reset patient status if no other active critical alerts
    patient = db.query(Patient).first()
    if patient:
        remaining_critical = db.query(Alert).filter(
            Alert.status == "sent",
            Alert.severity.in_(["HIGH", "CRITICAL"])
        ).count()
        if remaining_critical == 0:
            patient.current_status = "Stable"
            patient.status_note = "Resolved: Guardian confirmed patient is safe."

    db.commit()
    return {"success": True, "alert_id": alert.id, "status": alert.status}

@router.get("/safe-zones", response_model=List[SafeZoneResponse])
def get_safe_zones(db: Session = Depends(get_db)):
    patient = db.query(Patient).first()
    return db.query(SafeZone).filter(SafeZone.patient_id == patient.id).all()

@router.get("/summary/today")
def get_daily_ai_summary(db: Session = Depends(get_db)):
    patient = db.query(Patient).first()
    observations = {
        "meds_taken": 1,
        "meds_total": 2,
        "routine_completion_pct": 85,
        "object_searches_count": 3,
        "safe_zone_breaches": 0
    }
    summary = companion_nlp.generate_daily_ai_summary(patient.preferred_name, observations)
    return summary

@router.get("/handoff", response_model=List[CaregiverNoteResponse])
def get_handoff_notes(db: Session = Depends(get_db)):
    patient = db.query(Patient).first()
    notes = db.query(CaregiverNote).filter(CaregiverNote.patient_id == patient.id).order_by(CaregiverNote.created_at.desc()).all()
    return notes

@router.post("/handoff", response_model=CaregiverNoteResponse)
def add_handoff_note(note_data: CaregiverNoteCreate, db: Session = Depends(get_db)):
    patient = db.query(Patient).first()
    new_note = CaregiverNote(
        patient_id=patient.id,
        author_name=note_data.author_name,
        author_role=note_data.author_role,
        note_text=note_data.note_text,
        shift_category=note_data.shift_category
    )
    db.add(new_note)
    db.commit()
    db.refresh(new_note)
    return new_note

@router.get("/care-team")
def get_care_team(db: Session = Depends(get_db)):
    patient = db.query(Patient).first()
    guardians = db.query(Guardian).filter(Guardian.patient_id == patient.id).order_by(Guardian.priority.asc()).all()
    return [
        {
            "id": g.id,
            "name": g.name,
            "relationship": g.relationship_label,
            "role": g.role,
            "priority": g.priority,
            "phone": g.phone,
            "can_view_location": g.can_view_location,
            "can_manage_routine": g.can_manage_routine,
            "can_receive_critical": g.can_receive_critical,
            "is_available": g.is_available
        }
        for g in guardians
    ]
