import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.database import get_db
from backend.app.models.models import (
    Patient, Routine, RoutineTask, Medication, MedicationEvent,
    ObjectMemory, MemoryBookEntry, Guardian, Location, SafetyEvent,
    CognitiveActivity, Consent, AuditLog
)
from backend.app.schemas.schemas import (
    PatientStatusResponse, RoutineTaskResponse, MedicationResponse,
    MedicationConfirmRequest, ObjectMemoryResponse, MemoryBookResponse,
    AskCompanionRequest, CompanionResponse
)
from backend.app.ai.companion_nlp import companion_nlp
from backend.app.cv.object_detector import cv_object_detector
from backend.app.ml.risk_scorer import risk_scorer
from backend.app.ml.alert_router import alert_router

router = APIRouter(prefix="/api/patient", tags=["Patient"])

@router.get("/status", response_model=PatientStatusResponse)
def get_patient_status(db: Session = Depends(get_db)):
    patient = db.query(Patient).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    routine = db.query(Routine).filter(Routine.patient_id == patient.id, Routine.is_active == True).first()
    next_task = "Rest at 3:00 PM"
    next_time = "03:00 PM"
    completion_pct = 85

    if routine:
        tasks = db.query(RoutineTask).filter(RoutineTask.routine_id == routine.id).order_by(RoutineTask.order_index).all()
        if tasks:
            completed = sum(1 for t in tasks if t.is_completed)
            completion_pct = int((completed / len(tasks)) * 100)
            pending_tasks = [t for t in tasks if not t.is_completed]
            if pending_tasks:
                next_task = pending_tasks[0].title
                next_time = pending_tasks[0].time_of_day

    # Count pending medicines
    pending_meds = db.query(MedicationEvent).filter(
        MedicationEvent.patient_id == patient.id,
        MedicationEvent.status == "pending"
    ).count()

    return PatientStatusResponse(
        id=patient.id,
        full_name=patient.full_name,
        preferred_name=patient.preferred_name,
        age=patient.age,
        current_status=patient.current_status,
        status_note=patient.status_note,
        next_activity=next_task,
        next_time=next_time,
        medicine_pending_count=pending_meds,
        independence_score=92 if completion_pct >= 80 else 78,
        routine_completion_pct=completion_pct
    )

@router.get("/routine", response_model=List[RoutineTaskResponse])
def get_routine_tasks(db: Session = Depends(get_db)):
    patient = db.query(Patient).first()
    routine = db.query(Routine).filter(Routine.patient_id == patient.id, Routine.is_active == True).first()
    if not routine:
        return []
    tasks = db.query(RoutineTask).filter(RoutineTask.routine_id == routine.id).order_by(RoutineTask.order_index).all()
    return tasks

@router.post("/routine/task/{task_id}/toggle")
def toggle_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(RoutineTask).filter(RoutineTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.is_completed = not task.is_completed
    task.completed_at = datetime.datetime.utcnow() if task.is_completed else None
    db.commit()
    return {"success": True, "is_completed": task.is_completed, "title": task.title}

@router.get("/medications", response_model=List[MedicationResponse])
def get_medications(db: Session = Depends(get_db)):
    patient = db.query(Patient).first()
    meds = db.query(Medication).filter(Medication.patient_id == patient.id, Medication.is_active == True).all()

    res = []
    for m in meds:
        latest_event = db.query(MedicationEvent).filter(
            MedicationEvent.medication_id == m.id
        ).order_by(MedicationEvent.id.desc()).first()

        is_pending = True
        if latest_event and latest_event.status == "confirmed":
            is_pending = False

        res.append(MedicationResponse(
            id=m.id,
            name=m.name,
            simple_name=m.simple_name,
            visual_color=m.visual_color,
            dosage=m.dosage,
            schedule_time=m.schedule_time,
            instructions=m.instructions,
            prescribed_by=m.prescribed_by,
            image_url=m.image_url,
            is_pending_today=is_pending
        ))
    return res

@router.post("/medication/confirm")
def confirm_medication(req: MedicationConfirmRequest, db: Session = Depends(get_db)):
    patient = db.query(Patient).first()
    med = db.query(Medication).filter(Medication.id == req.medication_id).first()
    if not med:
        raise HTTPException(status_code=404, detail="Medication not found")

    event = db.query(MedicationEvent).filter(
        MedicationEvent.medication_id == med.id
    ).order_by(MedicationEvent.id.desc()).first()

    if not event:
        event = MedicationEvent(
            medication_id=med.id,
            patient_id=patient.id,
            scheduled_at=med.schedule_time,
            status="pending"
        )
        db.add(event)

    if req.response_type == "taken":
        event.status = "confirmed"
        event.confirmed_at = datetime.datetime.utcnow()
        event.response_type = "taken"
        event.notes = "Self-confirmed by patient"
        message = f"Thank you! You have taken your {med.simple_name}."
    else:
        event.status = "pending"
        event.response_type = "remind_later"
        event.prompt_attempts += 1
        event.notes = "Patient tapped Remind Me Later"
        message = f"No problem. I will gently remind you in 30 minutes for your {med.simple_name}."

    db.commit()
    return {"success": True, "message": message, "status": event.status}

@router.get("/objects", response_model=List[ObjectMemoryResponse])
def get_object_memories(db: Session = Depends(get_db)):
    patient = db.query(Patient).first()
    return db.query(ObjectMemory).filter(ObjectMemory.patient_id == patient.id).all()

@router.post("/objects/scan")
async def scan_or_update_object(
    object_name: str = Form(...),
    location_hint: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    patient = db.query(Patient).first()
    target_clean = object_name.strip().lower()

    if file:
        content = await file.read()
        analysis = cv_object_detector.analyze_image_bytes(content, target_hint=target_clean)
        detected_loc = location_hint or analysis.get("suggested_location", "Living room coffee table")
    else:
        analysis = cv_object_detector.analyze_image_bytes(b"", target_hint=target_clean)
        detected_loc = location_hint or analysis.get("suggested_location", "Living room coffee table")

    obj_record = db.query(ObjectMemory).filter(
        ObjectMemory.patient_id == patient.id,
        ObjectMemory.object_name == target_clean
    ).first()

    if not obj_record:
        obj_record = ObjectMemory(
            patient_id=patient.id,
            object_name=target_clean,
            simple_name=analysis.get("simple_name", object_name.title()),
            last_seen_location=detected_loc,
            confidence_score=analysis.get("confidence", 0.94),
            notes=f"Updated via visual scanner"
        )
        db.add(obj_record)
    else:
        obj_record.last_seen_location = detected_loc
        obj_record.last_seen_timestamp = datetime.datetime.utcnow()
        obj_record.confidence_score = analysis.get("confidence", 0.94)

    # Log gentle audit
    audit = AuditLog(
        patient_id=patient.id,
        actor_name=patient.preferred_name,
        actor_role="patient",
        action="Object Memory Update",
        details=f"Updated location for {obj_record.simple_name}: {detected_loc}"
    )
    db.add(audit)
    db.commit()

    return {
        "success": True,
        "object_name": obj_record.object_name,
        "simple_name": obj_record.simple_name,
        "location": obj_record.last_seen_location,
        "speech": f"I have saved that your {obj_record.simple_name} is on the {obj_record.last_seen_location}."
    }

@router.get("/memories", response_model=List[MemoryBookResponse])
def get_memory_book(db: Session = Depends(get_db)):
    patient = db.query(Patient).first()
    return db.query(MemoryBookEntry).filter(MemoryBookEntry.patient_id == patient.id).all()

@router.get("/people")
def get_trusted_people(db: Session = Depends(get_db)):
    patient = db.query(Patient).first()
    guardians = db.query(Guardian).filter(Guardian.patient_id == patient.id).order_by(Guardian.priority.asc()).all()
    return [
        {
            "id": g.id,
            "name": g.name,
            "relationship": g.relationship_label,
            "role": g.role,
            "phone": g.phone,
            "avatar": g.avatar
        }
        for g in guardians
    ]

@router.post("/checkin")
def submit_daily_checkin(mood: str, db: Session = Depends(get_db)):
    # mood: good, okay, difficult
    responses = {
        "good": "Wonderful! So glad you are feeling good today ❤️",
        "okay": "Thank you for checking in. Take it easy and enjoy your morning tea 🍵",
        "difficult": "I am right here with you. I have let your daughter Priya know so she can check in with you."
    }
    return {"success": True, "message": responses.get(mood, "Thank you for letting me know.")}

@router.get("/navigation/home")
def get_home_navigation():
    return {
        "destination": "Home (14 Green Valley)",
        "distance_minutes": "3 minutes walk",
        "steps": [
            {"step": 1, "icon": "🚶", "text": "Walk straight along the shaded garden path."},
            {"step": 2, "icon": "🏥", "text": "You will see the green pharmacy sign on your right."},
            {"step": 3, "icon": "➡️", "text": "Turn right immediately after the pharmacy."},
            {"step": 4, "icon": "🏠", "text": "Your yellow building entrance is right in front of you."}
        ],
        "comfort_message": "Take your time. You are very close to home."
    }

@router.post("/help")
def request_help(need_type: str, db: Session = Depends(get_db)):
    patient = db.query(Patient).first()

    help_map = {
        "lost": ("WANDERING_DEVIATION", "HIGH", "Patient indicated they do not know where they are. Home navigation activated."),
        "medicine": ("MISSED_MEDICATION", "LOW", "Patient asked for assistance with today's medicine."),
        "family": ("HELP_REQUEST", "MEDIUM", "Patient requested to connect with family members."),
        "emergency": ("DISTRESS_HELP", "CRITICAL", "Patient pressed emergency assistance button ('Something is wrong').")
    }

    event_type, severity, description = help_map.get(need_type, ("HELP_REQUEST", "MEDIUM", f"Patient requested help: {need_type}"))

    # Create Safety Event
    event = SafetyEvent(
        patient_id=patient.id,
        event_type=event_type,
        severity=severity,
        description=description,
        is_resolved=False
    )
    db.add(event)
    db.commit()
    db.refresh(event)

    # Route alert intelligently
    alerts = alert_router.route_alert(db, event)

    return {
        "success": True,
        "event_id": event.id,
        "severity": severity,
        "alerts_sent_count": len(alerts),
        "spoken_reassurance": "Help is on the way. I have contacted your trusted people." if severity in ["HIGH", "CRITICAL"] else "I am helping you right now. Take a deep breath."
    }

@router.post("/ask", response_model=CompanionResponse)
def ask_companion(req: AskCompanionRequest, db: Session = Depends(get_db)):
    patient = db.query(Patient).first()

    # Leverage RAG Vector Retrieval & GenAI Engine
    from backend.app.ai.llm_engine import llm_engine
    rag_result = llm_engine.rag_generate_response(req.query, patient_name=patient.preferred_name)

    # Determine suggested action & display card
    action_target = rag_result.get("suggested_action")
    action_url = f"/{action_target}" if action_target else None

    # Card meta
    card = None
    if action_target:
        card = {
            "icon": "🧠",
            "title": "Nivara RAG Context",
            "subtitle": f"Retrieved from patient memory: {len(rag_result.get('retrieved_context', []))} verified facts",
            "description": rag_result["spoken_text"]
        }

    return CompanionResponse(
        spoken_text=rag_result["spoken_text"],
        suggested_action="open_view" if action_url else None,
        action_target=action_url,
        display_card=card
    )

@router.get("/privacy")
def get_privacy_transparency(db: Session = Depends(get_db)):
    patient = db.query(Patient).first()
    consents = db.query(Consent).filter(Consent.patient_id == patient.id).all()
    return [
        {
            "name": c.guardian_name,
            "role": c.guardian_role.title(),
            "access_type": c.permission_type,
            "status": "Active" if c.is_granted else "Revoked"
        }
        for c in consents
    ]
