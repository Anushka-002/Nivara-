from typing import Dict, Any

class RiskScorer:
    """
    Evaluates events and produces explainable risk tiers:
    LOW, MEDIUM, HIGH, CRITICAL.
    """
    SEVERITY_LEVELS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]

    def score_event(self, event_type: str, details: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculates severity, confidence score, and plain-language explanation.
        """
        event_type_upper = event_type.upper()

        if event_type_upper in ["POSSIBLE_FALL", "EMERGENCY_SOS", "DISTRESS_HELP"]:
            severity = "CRITICAL"
            confidence = 0.96
            reason = "Immediate safety assistance requested or abrupt motion pattern with unresponsiveness detected."
            action_needed = "Immediate phone contact and guardian emergency escalation."

        elif event_type_upper in ["WANDERING_DEVIATION", "GEOFENCE_BREACH", "PROLONGED_ABSENCE"]:
            unanswered = details.get("checkin_unanswered", True)
            duration_mins = details.get("duration_minutes", 60)
            if duration_mins > 90 and unanswered:
                severity = "HIGH"
                confidence = 0.92
                reason = f"Patient has been outside safe perimeter for {duration_mins} minutes with no response to gentle prompt."
                action_needed = "Primary family guardian notified with live map location."
            else:
                severity = "MEDIUM"
                confidence = 0.85
                reason = "Movement detected away from usual safe zone corridor."
                action_needed = "Send gentle orientation prompt to patient and alert nurse."

        elif event_type_upper in ["MISSED_MEDICATION", "MEDICATION_DELAY"]:
            miss_count = details.get("miss_count", 1)
            if miss_count >= 2:
                severity = "MEDIUM"
                confidence = 0.95
                reason = f"Medication not confirmed after {miss_count} gentle reminders."
                action_needed = "Nurse alert triggered for clinical wellness check."
            else:
                severity = "LOW"
                confidence = 0.90
                reason = "Initial medication time reached with reminder shown."
                action_needed = "Gentle on-screen audio-visual reminder shown to patient."

        elif event_type_upper in ["MISPLACED_OBJECT", "FIND_OBJECT_QUERY"]:
            severity = "LOW"
            confidence = 0.94
            reason = f"Patient requested help finding: {details.get('object_name', 'an everyday item')}."
            action_needed = "Visual memory engine queried; gentle location guidance shown."

        elif event_type_upper in ["REPEATED_ASSISTANCE", "UNUSUAL_ROUTINE"]:
            req_count = details.get("request_count", 6)
            if req_count > 6:
                severity = "MEDIUM"
                confidence = 0.88
                reason = f"Higher frequency of confusion inquiries today ({req_count} requests vs baseline 1-2)."
                action_needed = "Caregiver alerted to subtle cognitive fatigue or routine disruption."
            else:
                severity = "LOW"
                confidence = 0.80
                reason = "Mild routine query."
                action_needed = "Provide reassuring step-by-step guidance."

        else:
            severity = "LOW"
            confidence = 0.75
            reason = "General routine check-in event."
            action_needed = "Recorded in daily log."

        return {
            "severity": severity,
            "confidence": confidence,
            "explainable_reason": reason,
            "action_needed": action_needed
        }

risk_scorer = RiskScorer()
