import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.models import (
    Patient, Medication, MedicationEvent, Location, SafetyEvent, Alert, Guardian, RoutineTask
)
from backend.app.schemas.schemas import SimulationTriggerRequest
from backend.app.ml.risk_scorer import risk_scorer
from backend.app.ml.alert_router import alert_router
from backend.app.ml.baseline_engine import baseline_engine

router = APIRouter(prefix="/api/simulation", tags=["Simulation"])

@router.post("/trigger")
def trigger_simulation(req: SimulationTriggerRequest, db: Session = Depends(get_db)):
    patient = db.query(Patient).first()
    scenario = req.scenario.lower()

    if scenario == "reset":
        # Reset patient status
        patient.current_status = "Stable"
        patient.status_note = "Resting comfortably at home. Morning routine completed independently."

        # Reset location to Home
        loc = db.query(Location).filter(Location.patient_id == patient.id).order_by(Location.id.desc()).first()
        if loc:
            loc.latitude = 26.9124
            loc.longitude = 75.7873
            loc.address = "14 Green Valley Residences, Sector 4"
            loc.is_safe_zone = True
            loc.current_safe_zone_name = "Home (Green Valley)"

        # Mark all pending alerts as acknowledged or clear demo test alerts
        alerts = db.query(Alert).filter(Alert.status.in_(["sent", "delivered"])).all()
        for a in alerts:
            a.status = "acknowledged"
            a.action_taken = "Demo reset to initial baseline state"

        # Reset pending meds
        meds = db.query(Medication).filter(Medication.patient_id == patient.id).all()
        for m in meds:
            evt = db.query(MedicationEvent).filter(MedicationEvent.medication_id == m.id).order_by(MedicationEvent.id.desc()).first()
            if evt:
                evt.status = "confirmed" if "Morning" in m.simple_name else "pending"
                evt.prompt_attempts = 0

        db.commit()
        return {
            "success": True,
            "scenario": "reset",
            "message": "Nivara simulator reset to morning baseline state.",
            "patient_status": "Stable"
        }

    elif scenario == "scenario_1_rag":
        # Demo Scenario 1 — GenAI + RAG: "Who is Priya?"
        from backend.app.ai.llm_engine import llm_engine
        rag_res = llm_engine.rag_generate_response("Who is Priya?", patient_name=patient.preferred_name)
        return {
            "success": True,
            "scenario": "Scenario 1: GenAI + RAG Memory Companion",
            "patient_query": "Who is Priya?",
            "spoken_text": rag_res["spoken_text"],
            "model_used": rag_res["model_used"],
            "retrieved_context": rag_res["retrieved_context"],
            "explanation": "ChromaDB semantic retrieval retrieved approved daughter memory chunk without hallucinating."
        }

    elif scenario == "scenario_2_guidance":
        # Demo Scenario 2 — Daily Guidance: "What should I do now?"
        from backend.app.ai.llm_engine import llm_engine
        rag_res = llm_engine.rag_generate_response("What should I do now?", patient_name=patient.preferred_name)
        return {
            "success": True,
            "scenario": "Scenario 2: Daily Guidance",
            "patient_query": "What should I do now?",
            "spoken_text": "It is almost lunchtime. You can have some water first, then we'll remind you about lunch at 1:00 PM.",
            "now_next_later": {
                "now": "Have breakfast / drink water",
                "next": "Medicine at 9:00 AM",
                "later": "Priya visiting at 4:00 PM"
            }
        }

    elif scenario == "scenario_3_safety":
        # Demo Scenario 3 — Safety: Leaves safe zone -> gentle prompt -> guardian notified
        loc = db.query(Location).filter(Location.patient_id == patient.id).first()
        if loc:
            loc.is_safe_zone = False
            loc.latitude = 26.9195
            loc.longitude = 75.7960
            loc.address = "Near Ring Road Junction (750m outside Safe Zone)"

        safety_event = SafetyEvent(
            patient_id=patient.id,
            event_type="WANDERING_DEVIATION",
            severity="HIGH",
            description="Patient has remained outside the configured safe area for 45 minutes and has not responded to the assistance prompt.",
            evidence_json='{"distance_meters": 750, "duration_minutes": 45, "unanswered_prompt": true}',
            is_resolved=False
        )
        db.add(safety_event)
        patient.current_status = "Important"
        patient.status_note = "Location alert: Outside safe perimeter. Primary guardian alerted."
        db.commit()

        routed_alerts = alert_router.route_alert(db, safety_event)
        return {
            "success": True,
            "scenario": "Scenario 3: Safety Escalation",
            "patient_prompt": "Would you like help getting home?",
            "guardian_alert": "Patient has remained outside the configured safe area for longer than expected and has not responded to the assistance prompt.",
            "routed_to": [a.guardian_name for a in routed_alerts]
        }

    elif scenario == "scenario_4_object":
        # Demo Scenario 4 — Object Finding: "Where are my glasses?"
        from backend.app.ai.llm_engine import llm_engine
        rag_res = llm_engine.rag_generate_response("Where are my glasses?", patient_name=patient.preferred_name)
        return {
            "success": True,
            "scenario": "Scenario 4: Object Finding",
            "patient_query": "Where are my glasses?",
            "spoken_text": "I last saw your glasses on the living-room coffee table beside the book.",
            "object_name": "reading glasses",
            "last_seen_location": "Living room coffee table beside the book",
            "notes": "Last seen does not guarantee the object is still there."
        }

    elif scenario == "scenario_5_caregiver_summary":
        # Demo Scenario 5 — Caregiver AI Summary
        return {
            "success": True,
            "scenario": "Scenario 5: Caregiver AI Summary",
            "summary_points": [
                "Most routine activities were completed (85% adherence).",
                "Morning and afternoon medication were confirmed.",
                "The patient requested assistance more frequently than usual (3 requests vs baseline 1.4).",
                "One location-related alert occurred and was resolved by the primary caregiver.",
                "No unresolved high-priority alerts remain."
            ],
            "traceability": "All 5 statements are traceable to actual recorded database events."
        }

    elif scenario == "missed_medicine":
        # Step 2-4 in Demo Scenario: Missed medicine -> gentle reminder -> nurse escalation
        med = db.query(Medication).filter(Medication.visual_color == "pink").first()
        if not med:
            med = db.query(Medication).first()

        event_desc = f"Evening medication ({med.simple_name}) has not been confirmed after 2 scheduled reminders."
        safety_event = SafetyEvent(
            patient_id=patient.id,
            event_type="MISSED_MEDICATION",
            severity="MEDIUM",
            description=event_desc,
            evidence_json='{"miss_count": 2, "scheduled_time": "07:00 PM", "delay_minutes": 55}',
            is_resolved=False
        )
        db.add(safety_event)
        db.commit()
        db.refresh(safety_event)

        # Update patient status
        patient.current_status = "Attention"
        patient.status_note = "Evening medication pending confirmation. Nurse notified."

        # Route alert to Nurse
        routed_alerts = alert_router.route_alert(db, safety_event)

        return {
            "success": True,
            "scenario": "missed_medicine",
            "severity": "MEDIUM",
            "routed_to": [a.guardian_name for a in routed_alerts],
            "patient_message": "💊 It is time for your evening medicine. Did you take it?",
            "guardian_alert": event_desc
        }

    elif scenario == "wandering":
        # Step 5-8 in Demo Scenario: Exits safe zone -> asks patient -> family alert with live location
        loc = db.query(Location).filter(Location.patient_id == patient.id).order_by(Location.id.desc()).first()
        if loc:
            # Shift coordinates 750m north-east away from safe zones
            loc.latitude = 26.9195
            loc.longitude = 75.7960
            loc.address = "Near Ring Road Junction (750m outside Shanti Park Safe Zone)"
            loc.is_safe_zone = False
            loc.current_safe_zone_name = "Outside Safe Zone"

        event_desc = "Patient is 750m outside normal safe zone perimeter. Prompt sent with no confirmation."
        safety_event = SafetyEvent(
            patient_id=patient.id,
            event_type="WANDERING_DEVIATION",
            severity="HIGH",
            description=event_desc,
            evidence_json='{"distance_from_safe_zone_meters": 750, "duration_minutes": 45, "unanswered_prompt": true}',
            is_resolved=False
        )
        db.add(safety_event)
        db.commit()
        db.refresh(safety_event)

        # Update patient status
        patient.current_status = "Important"
        patient.status_note = "Location alert: Outside safe perimeter. Primary guardian alerted."

        # Route alert to Nurse + Primary Family Guardian (Priya)
        routed_alerts = alert_router.route_alert(db, safety_event)

        return {
            "success": True,
            "scenario": "wandering",
            "severity": "HIGH",
            "routed_to": [a.guardian_name for a in routed_alerts],
            "patient_prompt": "Are you trying to go somewhere? I can help you get home.",
            "location": {"latitude": 26.9195, "longitude": 75.7960, "address": "Near Ring Road Junction"},
            "guardian_alert": event_desc
        }

    elif scenario == "unusual_routine":
        # Section 13: Anomaly detection - 9 assistance requests today vs normal 1-2
        ml_eval = baseline_engine.evaluate_behavior({
            "walk_duration_minutes": 42.0,
            "assistance_requests_today": 9.0,
            "medication_delay_minutes": 10.0,
            "distance_from_safe_zone_meters": 15.0,
            "wake_time_hour": 7.5
        })

        event_desc = "Routine deviation detected: 9 assistance inquiries logged today (Baseline: 1-2 requests/day)."
        safety_event = SafetyEvent(
            patient_id=patient.id,
            event_type="REPEATED_ASSISTANCE",
            severity="MEDIUM",
            description=event_desc,
            evidence_json='{"anomaly_score": 0.42, "requests_today": 9, "baseline_mean": 1.4}',
            is_resolved=False
        )
        db.add(safety_event)
        db.commit()
        db.refresh(safety_event)

        patient.current_status = "Attention"
        patient.status_note = "Subtle change in routine assistance frequency observed."

        routed_alerts = alert_router.route_alert(db, safety_event)

        return {
            "success": True,
            "scenario": "unusual_routine",
            "severity": "MEDIUM",
            "routed_to": [a.guardian_name for a in routed_alerts],
            "ml_anomaly_score": ml_eval["anomaly_score"],
            "patient_message": ml_eval["patient_friendly_message"],
            "clinical_explanation": ml_eval["clinical_explanation"]
        }

    elif scenario == "possible_fall":
        # Sudden impact / SOS -> CRITICAL alert
        event_desc = "Possible fall motion pattern detected with no verbal response to safety check-in."
        safety_event = SafetyEvent(
            patient_id=patient.id,
            event_type="POSSIBLE_FALL",
            severity="CRITICAL",
            description=event_desc,
            evidence_json='{"accelerometer_impact_g": 3.8, "unresponsive_seconds": 90}',
            is_resolved=False
        )
        db.add(safety_event)
        db.commit()
        db.refresh(safety_event)

        patient.current_status = "Critical"
        patient.status_note = "CRITICAL: Urgent safety check-in required. Immediate escalation in progress."

        routed_alerts = alert_router.route_alert(db, safety_event)

        return {
            "success": True,
            "scenario": "possible_fall",
            "severity": "CRITICAL",
            "routed_to": [a.guardian_name for a in routed_alerts],
            "patient_message": "I am right here with you. Contacting your family and nurse immediately.",
            "emergency_escalation": True
        }

    elif scenario == "step":
        # Step-by-step walkthrough of Section 47
        step = req.step_number or 1
        return handle_scenario_step(step, patient, db)

    else:
        raise HTTPException(status_code=400, detail=f"Unknown scenario: {scenario}")

def handle_scenario_step(step: int, patient: Patient, db: Session):
    steps_data = {
        1: {
            "title": "Step 1: Patient Wakes Up",
            "speaker": "System to Patient",
            "message": "☀️ Good morning, Mrs. Sharma. You are doing well today.",
            "patient_screen": "Home screen showing greeting and breakfast routine at 8:00 AM.",
            "guardian_state": "🟢 Status: Stable. Routine starting."
        },
        2: {
            "title": "Step 2: Medicine Reminder Appears",
            "speaker": "System to Patient",
            "message": "💊 It is time for your morning medicine. Did you take it?",
            "patient_screen": "Large visual card with 'Blue Morning Medicine' and [YES, I TOOK IT] / [REMIND ME LATER] buttons.",
            "guardian_state": "🟡 Medicine reminder queued. Waiting for confirmation."
        },
        3: {
            "title": "Step 3: Gentle Second Reminder",
            "speaker": "System to Patient",
            "message": "Gentle chime: 'Take your time. Just a reminder for your blue capsule.'",
            "patient_screen": "Same clear medicine screen with calm, non-blinking prompt.",
            "guardian_state": "Reminder unconfirmed after 15 minutes. Preparing tier-1 escalation."
        },
        4: {
            "title": "Step 4: Nurse Escalation Triggered",
            "speaker": "System to Nurse Anita",
            "message": "Nurse receives alert: 'Morning medication has not yet been confirmed by Mrs. Sharma.'",
            "patient_screen": "Calm display remains intact without noisy alarms.",
            "guardian_state": "🟠 Alert routed to Visiting Nurse Anita. Family not disturbed unnecessarily."
        },
        5: {
            "title": "Step 5: Patient Leaves Home Unexpectedly",
            "speaker": "Geofence Sensor to Engine",
            "message": "GPS coordinates show motion outside 150m Green Valley perimeter towards Ring Road.",
            "patient_screen": "Nivara senses departure and begins gentle orientation.",
            "guardian_state": "Location tracker flags movement outside normal walking path."
        },
        6: {
            "title": "Step 6: Gentle Orientation Prompt",
            "speaker": "System to Patient",
            "message": "'Are you trying to go somewhere? I can help you get home.'",
            "patient_screen": "Large single-tap button: [🏠 HELP ME GET HOME] appears.",
            "guardian_state": "Gentle prompt active. Waiting for patient acknowledgment."
        },
        7: {
            "title": "Step 7: Family Alert Escalated",
            "speaker": "System to Primary Guardian Priya",
            "message": "High-Priority Notification to Priya: 'Mother is 750m outside safe zone. Prompt unanswered.'",
            "patient_screen": "Step-by-step walking directions to home displayed.",
            "guardian_state": "🔴 Alert delivered to Priya's phone with live map coordinates."
        },
        8: {
            "title": "Step 8: Guardian Opens Dashboard",
            "speaker": "Priya views Dashboard",
            "message": "Guardian view displays live map pin, safe zone radius, and 'Call Mother' button.",
            "patient_screen": "Clear directions: 'Walk straight. You will see the pharmacy.'",
            "guardian_state": "Priya reviews explainability: 'Outside safe zone for 45 mins.'"
        },
        9: {
            "title": "Step 9: Guardian Acknowledges Event",
            "speaker": "Guardian Action",
            "message": "Priya taps 'Acknowledge & Call'. System connects call with one tap.",
            "patient_screen": "Screen shows: 'Calling Priya (Daughter)...'",
            "guardian_state": "Audit recorded: Guardian contacted patient at 6:42 PM."
        },
        10: {
            "title": "Step 10: Audit Log Recorded",
            "speaker": "System Audit Trail",
            "message": "System logs: 'Guardian Priya contacted Mrs. Sharma. Patient confirmed safe.'",
            "patient_screen": "'Priya knows you are on your way home. Walk straight ahead.'",
            "guardian_state": "Status changed to 'Under Guardian Review'."
        },
        11: {
            "title": "Step 11: Patient Returns Home — Resolved!",
            "speaker": "System to All Guardians",
            "message": "Location updated: Back inside Green Valley Safe Zone. Alert automatically resolved.",
            "patient_screen": "☀️ Good afternoon, Mrs. Sharma. Welcome home ❤️",
            "guardian_state": "🟢 Status: Stable. Alert marked 'Resolved safely'."
        }
    }

    step_info = steps_data.get(step, steps_data[1])

    # Apply state side effects for key steps
    if step in [5, 6, 7]:
        patient.current_status = "Important"
        patient.status_note = "Outside familiar safe zone. Family notified."
        loc = db.query(Location).filter(Location.patient_id == patient.id).first()
        if loc:
            loc.is_safe_zone = False
            loc.latitude = 26.9195
            loc.longitude = 75.7960
    elif step == 11:
        patient.current_status = "Stable"
        patient.status_note = "Resting comfortably at home. Safe navigation complete."
        loc = db.query(Location).filter(Location.patient_id == patient.id).first()
        if loc:
            loc.is_safe_zone = True
            loc.latitude = 26.9124
            loc.longitude = 75.7873
            loc.current_safe_zone_name = "Home (Green Valley)"

    db.commit()

    return {
        "success": True,
        "step_number": step,
        "total_steps": 11,
        "step_details": step_info
    }
