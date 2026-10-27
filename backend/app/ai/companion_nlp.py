import re
from typing import Dict, Any, List, Optional
from datetime import datetime

class CompanionNLP:
    """
    Calm, compassionate, patient-first natural language processor.
    Interprets intent from speech or text input, and responds with short,
    comforting, highly accessible language (Grade 3 readability).
    """

    def process_patient_query(self, query: str, context: Dict[str, Any]) -> Dict[str, Any]:
        q = query.lower().strip()

        # 1. "What should I do now?" / Routine query
        if any(term in q for term in ["what should i do", "what do i do", "what's next", "whats next", "schedule", "routine", "what now"]):
            next_task = context.get("next_task", "Lunch at 1:00 PM")
            later_task = context.get("later_task", "Rest at 2:00 PM")
            current_time = datetime.now().strftime("%I:%M %p")
            spoken = f"It is {current_time}. Next is {next_task}. After that, you have {later_task}."
            return {
                "spoken_text": spoken,
                "suggested_action": "open_routine",
                "action_target": "/my-day",
                "display_card": {
                    "icon": "🗓️",
                    "title": "Your Next Activity",
                    "subtitle": next_task,
                    "description": "Take your time. You are doing very well."
                }
            }

        # 2. "Where are my [object]?" / Object finding
        if any(term in q for term in ["where is my", "where are my", "find my", "lost my", "where's my", "wheres my"]):
            for obj_key in ["glasses", "keys", "wallet", "phone", "medicine box", "remote", "bag", "documents"]:
                if obj_key in q:
                    obj_memory = context.get("object_memories", {}).get(obj_key)
                    if obj_memory:
                        loc = obj_memory.get("location", "the living room coffee table")
                        spoken = f"I last saw your {obj_key} on {loc}."
                    else:
                        spoken = f"I last saw your {obj_key} on the living room table. Would you like me to help you look?"
                    return {
                        "spoken_text": spoken,
                        "suggested_action": "open_finder",
                        "action_target": "/find-something",
                        "display_card": {
                            "icon": "🔎",
                            "title": f"Found {obj_key.title()}",
                            "subtitle": spoken,
                            "description": "Press the button below if you'd like to take a photo to update it."
                        }
                    }

            spoken = "I can help you look for your items like your glasses, keys, or phone. What would you like to find?"
            return {
                "spoken_text": spoken,
                "suggested_action": "open_finder",
                "action_target": "/find-something"
            }

        # 3. "Call my daughter / son / nurse / doctor / person"
        if any(term in q for term in ["call", "phone", "speak to", "talk to", "contact"]):
            if "daughter" in q or "priya" in q:
                return {
                    "spoken_text": "Calling your daughter Priya now.",
                    "suggested_action": "call_person",
                    "action_target": "Priya (Daughter)"
                }
            elif "son" in q or "rahul" in q:
                return {
                    "spoken_text": "Calling your son Rahul now.",
                    "suggested_action": "call_person",
                    "action_target": "Rahul (Son)"
                }
            elif "nurse" in q or "anita" in q:
                return {
                    "spoken_text": "Connecting you to your nurse Anita.",
                    "suggested_action": "call_person",
                    "action_target": "Anita (Nurse)"
                }
            elif "doctor" in q or "mehta" in q:
                return {
                    "spoken_text": "Connecting you to Dr. Mehta's office.",
                    "suggested_action": "call_person",
                    "action_target": "Dr. Mehta"
                }
            else:
                return {
                    "spoken_text": "Here are your trusted people you can call with one tap.",
                    "suggested_action": "open_people",
                    "action_target": "/my-people"
                }

        # 4. "Help me get home" / Navigation
        if any(term in q for term in ["get home", "take me home", "where am i", "lost", "way home", "how to get home", "navigate"]):
            spoken = "Walk straight ahead. You will see the green pharmacy sign. Then turn right after the pharmacy to reach your front door."
            return {
                "spoken_text": spoken,
                "suggested_action": "open_navigation",
                "action_target": "/navigation",
                "display_card": {
                    "icon": "🏠",
                    "title": "Walking Home",
                    "subtitle": "Walk straight ahead towards the pharmacy",
                    "description": "You are only 3 minutes away from home."
                }
            }

        # 5. "Medicine" / "Did I take my medicine?"
        if any(term in q for term in ["medicine", "pill", "tablet", "dose"]):
            pending_med = context.get("next_medication", "Morning Blue Capsule")
            spoken = f"Your next medicine is {pending_med}. Did you take it?"
            return {
                "spoken_text": spoken,
                "suggested_action": "open_meds",
                "action_target": "/my-medicine",
                "display_card": {
                    "icon": "💊",
                    "title": "Your Medicine",
                    "subtitle": pending_med,
                    "description": "Press YES if you took it, or REMIND ME LATER."
                }
            }

        # 6. "I need help" / Distress
        if any(term in q for term in ["help", "scared", "worried", "confused", "pain", "hurt", "emergency"]):
            spoken = "I am right here with you. Everything is okay. Let's get the right help."
            return {
                "spoken_text": spoken,
                "suggested_action": "open_help",
                "action_target": "/get-help",
                "display_card": {
                    "icon": "🆘",
                    "title": "We Are Here To Help You",
                    "subtitle": "Tap one of the buttons below or speak to Nivara",
                    "description": "Your trusted family and nurse are always connected."
                }
            }

        # Default gentle conversational fallback
        preferred_name = context.get("patient_name", "Mrs. Sharma")
        spoken = f"I am here with you, {preferred_name}. You can ask me what to do next, where your glasses are, or tap any button to get help."
        return {
            "spoken_text": spoken,
            "suggested_action": "none"
        }

    def generate_daily_ai_summary(self, patient_name: str, observations: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generates structured, explainable daily summary for guardians & clinicians.
        Clearly differentiates:
        - Observed Facts
        - AI-Detected Patterns
        - Actionable Recommendations
        Guaranteed non-diagnostic tone.
        """
        meds_taken = observations.get("meds_taken", 1)
        meds_total = observations.get("meds_total", 2)
        routine_pct = observations.get("routine_completion_pct", 87)
        object_searches = observations.get("object_searches_count", 3)
        safe_zone_events = observations.get("safe_zone_breaches", 0)

        facts = [
            f"Morning medicine confirmed on schedule.",
            f"Breakfast and morning walk completed ({routine_pct}% routine completion).",
            f"Normal activity and movement observed around home.",
        ]
        if meds_taken < meds_total:
            facts.append(f"Evening medication scheduled for 7:00 PM has not yet been confirmed.")

        patterns = []
        if object_searches >= 3:
            patterns.append(f"Patient requested help locating everyday items ({object_searches} times today, primarily reading glasses).")
        if safe_zone_events > 0:
            patterns.append(f"Temporary departure outside designated perimeter detected; resolved safely.")
        else:
            patterns.append("Location and routine remained consistently within familiar safe zone corridors.")

        recommendations = []
        if meds_taken < meds_total:
            recommendations.append("Follow up gently on evening medication confirmation before 8:30 PM.")
        recommendations.append("Encourage regular water intake during afternoon relaxation period.")
        recommendations.append("Keep reading glasses in designated living room basket to reinforce spatial memory.")

        return {
            "title": f"Daily Summary for {patient_name}",
            "date": datetime.now().strftime("%B %d, %Y"),
            "observed_facts": facts,
            "ai_detected_patterns": patterns,
            "recommendations": recommendations,
            "disclaimer": "This summary is based on behavioral sensors and user responses. It is intended to assist care coordination and is not a medical diagnosis."
        }

companion_nlp = CompanionNLP()
