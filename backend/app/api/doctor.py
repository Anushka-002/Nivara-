import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from backend.app.database import get_db
from backend.app.models.models import (
    Patient, PatientBaseline, SafetyEvent, CaregiverNote, AuditLog
)
from backend.app.schemas.schemas import DoctorOverviewResponse, SafetyEventResponse
from backend.app.ml.baseline_engine import baseline_engine

router = APIRouter(prefix="/api/doctor", tags=["Doctor"])

@router.get("/overview", response_model=DoctorOverviewResponse)
def get_doctor_overview(db: Session = Depends(get_db)):
    patient = db.query(Patient).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # 14-day longitudinal trend points for Recharts
    # Demonstrating subtle trend deviation over 2 weeks as specified in prompt
    longitudinal_data = [
        {"day": "Day 1", "routine_pct": 94, "med_adherence_pct": 98, "assistance_requests": 1, "wandering_events": 0},
        {"day": "Day 2", "routine_pct": 92, "med_adherence_pct": 97, "assistance_requests": 1, "wandering_events": 0},
        {"day": "Day 3", "routine_pct": 91, "med_adherence_pct": 96, "assistance_requests": 2, "wandering_events": 0},
        {"day": "Day 4", "routine_pct": 93, "med_adherence_pct": 95, "assistance_requests": 1, "wandering_events": 0},
        {"day": "Day 5", "routine_pct": 90, "med_adherence_pct": 96, "assistance_requests": 2, "wandering_events": 0},
        {"day": "Day 6", "routine_pct": 89, "med_adherence_pct": 94, "assistance_requests": 2, "wandering_events": 0},
        {"day": "Day 7", "routine_pct": 88, "med_adherence_pct": 92, "assistance_requests": 3, "wandering_events": 1},
        {"day": "Day 8", "routine_pct": 87, "med_adherence_pct": 91, "assistance_requests": 3, "wandering_events": 0},
        {"day": "Day 9", "routine_pct": 86, "med_adherence_pct": 93, "assistance_requests": 2, "wandering_events": 0},
        {"day": "Day 10", "routine_pct": 85, "med_adherence_pct": 90, "assistance_requests": 4, "wandering_events": 1},
        {"day": "Day 11", "routine_pct": 84, "med_adherence_pct": 89, "assistance_requests": 4, "wandering_events": 1},
        {"day": "Day 12", "routine_pct": 85, "med_adherence_pct": 90, "assistance_requests": 3, "wandering_events": 0},
        {"day": "Day 13", "routine_pct": 83, "med_adherence_pct": 88, "assistance_requests": 5, "wandering_events": 1},
        {"day": "Day 14 (Today)", "routine_pct": 85, "med_adherence_pct": 89, "assistance_requests": 3, "wandering_events": 0},
    ]

    # Baseline comparison metrics
    baseline_metrics = [
        {
            "metric_name": "Routine Completion",
            "baseline_val": 91.0,
            "current_val": 83.0,
            "unit": "%",
            "deviation_pct": -8.8,
            "status": "attention"
        },
        {
            "metric_name": "Medication Confirmation",
            "baseline_val": 96.0,
            "current_val": 89.0,
            "unit": "%",
            "deviation_pct": -7.3,
            "status": "attention"
        },
        {
            "metric_name": "Assistance Requests",
            "baseline_val": 1.2,
            "current_val": 3.8,
            "unit": "req/day",
            "deviation_pct": 216.0,
            "status": "elevated"
        },
        {
            "metric_name": "Navigation Assistance Events",
            "baseline_val": 0.0,
            "current_val": 4.0,
            "unit": "events / 14d",
            "deviation_pct": 400.0,
            "status": "elevated"
        }
    ]

    ai_clinical_summary = (
        "Non-diagnostic behavioral observation: Several behavioral measures have shown slight divergence "
        "from the patient's established baseline during the past two weeks. Specifically, daily routine completion "
        "has shifted from 91% to 83%, and verbal navigation inquiries rose from 0 to 4 events. "
        "Sleep rhythm and morning walk duration remain relatively consistent. "
        "Recommended action: Review environmental stressors and medication timing during tomorrow's scheduled consultation."
    )

    underlying_events = db.query(SafetyEvent).order_by(SafetyEvent.created_at.desc()).limit(15).all()

    disclaimer = (
        "CLINICAL NOTICE: Nivara is an assistive behavioral monitoring system. It does not provide medical diagnoses, "
        "disease progression grading, or medical prescriptions. Insights are statistical summaries intended to "
        "supplement clinical judgment by licensed healthcare professionals."
    )

    return DoctorOverviewResponse(
        patient_info={
            "full_name": patient.full_name,
            "preferred_name": patient.preferred_name,
            "age": patient.age,
            "address": patient.address,
            "doctor": "Dr. Arvind Mehta",
            "primary_nurse": "Anita Roy (RN)"
        },
        longitudinal_trends=longitudinal_data,
        baseline_metrics=baseline_metrics,
        ai_clinical_summary=ai_clinical_summary,
        underlying_events=underlying_events,
        disclaimer=disclaimer
    )

@router.post("/notes")
def add_doctor_note(note_text: str, db: Session = Depends(get_db)):
    patient = db.query(Patient).first()
    note = CaregiverNote(
        patient_id=patient.id,
        author_name="Dr. Arvind Mehta",
        author_role="doctor",
        shift_category="Clinical Consultation",
        note_text=note_text
    )
    db.add(note)
    db.commit()
    return {"success": True, "message": "Clinical note added to patient record."}
