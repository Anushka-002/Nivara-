from typing import List, Dict, Any
from sqlalchemy.orm import Session
from backend.app.models.models import Guardian, SafetyEvent, Alert

class IntelligentAlertRouter:
    """
    Routes safety events to the appropriate guardian based on role, priority,
    availability, and severity level.
    """
    def route_alert(self, db: Session, safety_event: SafetyEvent, details: Dict[str, Any] = None) -> List[Alert]:
        severity = safety_event.severity.upper()
        patient_id = safety_event.patient_id

        # Fetch all configured guardians for this patient
        guardians = db.query(Guardian).filter(Guardian.patient_id == patient_id).order_by(Guardian.priority.asc()).all()

        target_guardians: List[Guardian] = []
        patient_only = False

        if severity == "LOW":
            # LOW goes to patient only (no guardian spam)
            patient_only = True
        elif severity == "MEDIUM":
            # MEDIUM goes to Nurse
            nurses = [g for g in guardians if g.role == "nurse"]
            target_guardians = nurses if nurses else [g for g in guardians if g.priority == 1]
        elif severity == "HIGH":
            # HIGH goes to Nurse + Primary Family Guardian
            nurses = [g for g in guardians if g.role == "nurse"]
            primary_family = [g for g in guardians if g.role == "family" and g.priority == 1]
            target_guardians = primary_family + nurses
        elif severity == "CRITICAL":
            # CRITICAL goes to Nurse + All Family + Emergency Contacts
            target_guardians = [g for g in guardians if g.role in ["nurse", "family", "emergency"]]

        created_alerts: List[Alert] = []

        if patient_only:
            # Self-contained on-screen calm notification
            alert = Alert(
                safety_event_id=safety_event.id,
                target_guardian_id=None,
                guardian_name="Patient (Self-Care)",
                role="patient",
                severity="LOW",
                channel="app_screen",
                status="delivered",
                explainable_reason=safety_event.description,
                action_taken="Calm on-screen guidance presented"
            )
            db.add(alert)
            created_alerts.append(alert)
        else:
            for g in target_guardians:
                # Format explainable why reason
                explainable_text = (
                    f"Alert routed to {g.name} ({g.relationship_label}) because severity is {severity}. "
                    f"Reason: {safety_event.description}"
                )
                alert = Alert(
                    safety_event_id=safety_event.id,
                    target_guardian_id=g.id,
                    guardian_name=f"{g.name} ({g.relationship_label})",
                    role=g.role,
                    severity=severity,
                    channel="app_push" if severity in ["MEDIUM", "HIGH"] else "urgent_call_push",
                    status="sent",
                    explainable_reason=explainable_text,
                    action_taken=f"Notification delivered via Nivara Guardian portal to {g.name}"
                )
                db.add(alert)
                created_alerts.append(alert)

        db.commit()
        for a in created_alerts:
            db.refresh(a)

        return created_alerts

alert_router = IntelligentAlertRouter()
