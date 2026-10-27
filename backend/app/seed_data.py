import json
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from backend.app.database import SessionLocal, engine, Base
from backend.app.models.models import (
    User, Patient, Guardian, Routine, RoutineTask, Medication,
    MedicationEvent, Appointment, Location, SafeZone, SafetyEvent,
    Alert, PatientBaseline, DailySummary, CaregiverNote,
    ObjectMemory, MemoryBookEntry, CognitiveActivity, Consent, AuditLog
)

def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    # Check if already seeded
    existing_patient = db.query(Patient).first()
    if existing_patient:
        db.close()
        return

    print("Seeding Nivara database with synthetic patient Mrs. Sharma...")

    # 1. Users
    user_patient = User(email="patient@nivara.care", name="Mrs. Anushka Sharma", role="patient", hashed_password="demo", avatar="👵")
    user_priya = User(email="priya@nivara.care", name="Priya Sharma", role="family", hashed_password="demo", avatar="👩")
    user_rahul = User(email="rahul@nivara.care", name="Rahul Sharma", role="family", hashed_password="demo", avatar="👨")
    user_anita = User(email="anita@nivara.care", name="Anita R. (RN)", role="nurse", hashed_password="demo", avatar="👩‍⚕️")
    user_doctor = User(email="doctor@nivara.care", name="Dr. A. Mehta, MD", role="doctor", hashed_password="demo", avatar="👨‍⚕️")

    db.add_all([user_patient, user_priya, user_rahul, user_anita, user_doctor])
    db.commit()

    # 2. Patient
    patient = Patient(
        user_id=user_patient.id,
        full_name="Mrs. Anushka Sharma",
        preferred_name="Mrs. Sharma",
        age=72,
        emergency_phone="+91 98200 12345",
        address="14 Green Valley Residences, Sector 4, Shanti Nagar",
        photo_url="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
        current_status="Stable",
        status_note="Resting comfortably at home. Morning routine completed independently."
    )
    db.add(patient)
    db.commit()
    db.refresh(patient)

    # 3. Guardians
    guardians = [
        Guardian(
            patient_id=patient.id,
            user_id=user_priya.id,
            name="Priya Sharma",
            relationship_label="Daughter",
            role="family",
            priority=1,
            phone="+91 98200 12345",
            avatar="👩",
            can_view_location=True,
            can_manage_routine=True,
            can_receive_critical=True
        ),
        Guardian(
            patient_id=patient.id,
            user_id=user_anita.id,
            name="Anita Roy",
            relationship_label="Nurse (Visiting Care)",
            role="nurse",
            priority=1,
            phone="+91 98300 23456",
            avatar="👩‍⚕️",
            can_view_location=True,
            can_manage_routine=True,
            can_receive_critical=True
        ),
        Guardian(
            patient_id=patient.id,
            user_id=user_rahul.id,
            name="Rahul Sharma",
            relationship_label="Son",
            role="family",
            priority=2,
            phone="+91 98400 34567",
            avatar="👨",
            can_view_location=True,
            can_manage_routine=False,
            can_receive_critical=True
        ),
        Guardian(
            patient_id=patient.id,
            user_id=user_doctor.id,
            name="Dr. Arvind Mehta",
            relationship_label="Geriatric Physician",
            role="doctor",
            priority=3,
            phone="+91 98500 45678",
            avatar="👨‍⚕️",
            can_view_location=False,
            can_manage_routine=False,
            can_receive_critical=True
        )
    ]
    db.add_all(guardians)
    db.commit()

    # 4. Daily Routine & Tasks
    routine = Routine(patient_id=patient.id, title="Mrs. Sharma's Daily Rhythm", is_active=True)
    db.add(routine)
    db.commit()
    db.refresh(routine)

    tasks = [
        RoutineTask(routine_id=routine.id, title="Wake up & freshen up", description="Open curtains, drink a glass of warm water", time_of_day="07:30 AM", category="wake", is_completed=True, order_index=1),
        RoutineTask(routine_id=routine.id, title="Healthy Breakfast", description="Oatmeal with almonds & sliced papaya", time_of_day="08:00 AM", category="meal", is_completed=True, order_index=2),
        RoutineTask(routine_id=routine.id, title="Morning Medicine", description="Take the blue capsule with warm water", time_of_day="08:30 AM", category="medicine", is_completed=True, order_index=3),
        RoutineTask(routine_id=routine.id, title="Morning Walk in Garden", description="Gentle stroll around Shanti Park benches", time_of_day="09:30 AM", category="walk", is_completed=True, order_index=4),
        RoutineTask(routine_id=routine.id, title="Quiet Reading / Music", description="Listen to soothing instrumental melodies", time_of_day="11:00 AM", category="rest", is_completed=False, order_index=5),
        RoutineTask(routine_id=routine.id, title="Nutritious Lunch", description="Warm lentil soup, rice, and steamed vegetables", time_of_day="01:00 PM", category="meal", is_completed=False, order_index=6),
        RoutineTask(routine_id=routine.id, title="Afternoon Rest", description="Comfortable relaxation in the bedroom", time_of_day="03:00 PM", category="rest", is_completed=False, order_index=7),
        RoutineTask(routine_id=routine.id, title="Evening Balcony Stroll", description="Water flowering rose pots and stretch", time_of_day="05:00 PM", category="walk", is_completed=False, order_index=8),
        RoutineTask(routine_id=routine.id, title="Evening Medicine", description="Pink tablet before dinner", time_of_day="07:00 PM", category="medicine", is_completed=False, order_index=9),
        RoutineTask(routine_id=routine.id, title="Light Dinner", description="Warm soup and khichdi with family", time_of_day="07:30 PM", category="meal", is_completed=False, order_index=10),
        RoutineTask(routine_id=routine.id, title="Bedtime Preparation", description="Herbal chamomile tea and calm sleep", time_of_day="09:30 PM", category="sleep", is_completed=False, order_index=11)
    ]
    db.add_all(tasks)

    # 5. Medications
    med1 = Medication(
        patient_id=patient.id,
        name="Amlodipine Besylate 5mg",
        simple_name="Blue Morning Capsule",
        visual_color="blue",
        dosage="1 capsule",
        schedule_time="08:30 AM",
        instructions="Take with water after breakfast",
        prescribed_by="Dr. Arvind Mehta",
        image_url="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80"
    )
    med2 = Medication(
        patient_id=patient.id,
        name="Calcium + Vit D3 Chewable",
        simple_name="White Chewable Tablet",
        visual_color="yellow",
        dosage="1 tablet",
        schedule_time="01:30 PM",
        instructions="Chew thoroughly after lunch",
        prescribed_by="Dr. Arvind Mehta",
        image_url="https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=400&q=80"
    )
    med3 = Medication(
        patient_id=patient.id,
        name="Atorvastatin 10mg",
        simple_name="Pink Evening Pill",
        visual_color="pink",
        dosage="1 small tablet",
        schedule_time="07:00 PM",
        instructions="Take before evening dinner",
        prescribed_by="Dr. Arvind Mehta",
        image_url="https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=400&q=80"
    )
    db.add_all([med1, med2, med3])
    db.commit()
    db.refresh(med1)
    db.refresh(med2)
    db.refresh(med3)

    # Add medication events
    event1 = MedicationEvent(
        medication_id=med1.id,
        patient_id=patient.id,
        scheduled_at="08:30 AM",
        confirmed_at=datetime.utcnow() - timedelta(hours=3),
        status="confirmed",
        response_type="taken",
        prompt_attempts=1,
        notes="Confirmed by patient via on-screen prompt"
    )
    event2 = MedicationEvent(
        medication_id=med2.id,
        patient_id=patient.id,
        scheduled_at="01:30 PM",
        confirmed_at=None,
        status="pending",
        response_type=None,
        prompt_attempts=0
    )
    event3 = MedicationEvent(
        medication_id=med3.id,
        patient_id=patient.id,
        scheduled_at="07:00 PM",
        confirmed_at=None,
        status="pending",
        response_type=None,
        prompt_attempts=0
    )
    db.add_all([event1, event2, event3])

    # 6. Safe Zones
    safe_zones = [
        SafeZone(
            patient_id=patient.id,
            name="Home (Green Valley)",
            category="home",
            latitude=26.9124,
            longitude=75.7873,
            radius_meters=150.0,
            description="Patient's primary residence and building compound"
        ),
        SafeZone(
            patient_id=patient.id,
            name="Shanti Park",
            category="park",
            latitude=26.9142,
            longitude=75.7892,
            radius_meters=220.0,
            description="Familiar morning walking route with shaded benches"
        ),
        SafeZone(
            patient_id=patient.id,
            name="Care Community Pharmacy",
            category="pharmacy",
            latitude=26.9110,
            longitude=75.7852,
            radius_meters=90.0,
            description="Neighborhood pharmacy with friendly staff who know Mrs. Sharma"
        ),
        SafeZone(
            patient_id=patient.id,
            name="Dr. Mehta's Medical Clinic",
            category="clinic",
            latitude=26.9085,
            longitude=75.7825,
            radius_meters=120.0,
            description="Primary care and wellness checkup clinic"
        )
    ]
    db.add_all(safe_zones)

    # 7. Current Location
    loc = Location(
        patient_id=patient.id,
        latitude=26.9124,
        longitude=75.7873,
        address="14 Green Valley Residences, Sector 4",
        is_safe_zone=True,
        current_safe_zone_name="Home (Green Valley)"
    )
    db.add(loc)

    # 8. Visual Object Memories
    objects = [
        ObjectMemory(
            patient_id=patient.id,
            object_name="glasses",
            simple_name="Reading Glasses (Tortoiseshell Frame)",
            last_seen_location="Living room coffee table beside the book",
            confidence_score=0.96,
            photo_url="https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=400&q=80",
            notes="Recognized on wooden coffee table"
        ),
        ObjectMemory(
            patient_id=patient.id,
            object_name="keys",
            simple_name="House & Mailbox Keys",
            last_seen_location="Brass hook next to the front doorway",
            confidence_score=0.98,
            photo_url="https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=400&q=80",
            notes="Hanging safely on the entry wall hook"
        ),
        ObjectMemory(
            patient_id=patient.id,
            object_name="wallet",
            simple_name="Brown Leather Coin Purse",
            last_seen_location="Top drawer of the bedroom nightstand",
            confidence_score=0.92,
            photo_url="https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=400&q=80",
            notes="Placed in nightstand drawer"
        ),
        ObjectMemory(
            patient_id=patient.id,
            object_name="phone",
            simple_name="Mobile Phone (Large Button Case)",
            last_seen_location="Charging cradle on side table by the armchair",
            confidence_score=0.95,
            photo_url="https://images.unsplash.com/photo-1511707171634-5f897ff0252a?auto=format&fit=crop&w=400&q=80",
            notes="Resting on active charging stand"
        ),
        ObjectMemory(
            patient_id=patient.id,
            object_name="medicine box",
            simple_name="Weekly Pill Organizer",
            last_seen_location="Kitchen dining table beside water kettle",
            confidence_score=0.94,
            photo_url="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80",
            notes="Safely stored on kitchen table"
        )
    ]
    db.add_all(objects)

    # 9. Memory Book Entries
    memories = [
        MemoryBookEntry(
            patient_id=patient.id,
            title="Priya",
            relationship_label="Your loving daughter",
            category="person",
            photo_url="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
            caption="Priya visits every evening after office. She brings your favorite jasmine tea."
        ),
        MemoryBookEntry(
            patient_id=patient.id,
            title="Rahul & Grandchildren",
            relationship_label="Your son Rahul with Aarav & Maya",
            category="person",
            photo_url="https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=400&q=80",
            caption="Rahul calls every Sunday morning. Aarav is 9 and Maya just started learning piano."
        ),
        MemoryBookEntry(
            patient_id=patient.id,
            title="Ancestral Jaipur Home",
            relationship_label="Your sunlit family home",
            category="place",
            photo_url="https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=400&q=80",
            caption="The courtyard garden where you grew fragrant yellow marigolds and sat with tea."
        ),
        MemoryBookEntry(
            patient_id=patient.id,
            title="Bruno",
            relationship_label="Your gentle golden retriever",
            category="memory",
            photo_url="https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&q=80",
            caption="Bruno was your loyal walking companion who loved resting his chin on your knee."
        )
    ]
    db.add_all(memories)

    # 10. Appointment
    appointment = Appointment(
        patient_id=patient.id,
        title="Wellness & Blood Pressure Review",
        location="Dr. Mehta's Medical Clinic, Suite 204",
        scheduled_time="Tomorrow at 11:00 AM",
        companion_name="Priya (Daughter)",
        transport="Car ride with Priya",
        notes="Check blood pressure and review medication tolerance with Dr. Mehta",
        is_completed=False
    )
    db.add(appointment)

    # 11. Patient Baseline metrics
    baselines = [
        PatientBaseline(patient_id=patient.id, metric_name="Morning Walk Duration", mean_value=38.0, std_value=4.0, normal_range_min=30.0, normal_range_max=45.0, unit="minutes"),
        PatientBaseline(patient_id=patient.id, metric_name="Daily Assistance Requests", mean_value=1.4, std_value=0.6, normal_range_min=1.0, normal_range_max=3.0, unit="requests/day"),
        PatientBaseline(patient_id=patient.id, metric_name="Medication Adherence", mean_value=96.0, std_value=3.0, normal_range_min=90.0, normal_range_max=100.0, unit="%"),
        PatientBaseline(patient_id=patient.id, metric_name="Safe Perimeter Adherence", mean_value=98.5, std_value=1.5, normal_range_min=95.0, normal_range_max=100.0, unit="%"),
        PatientBaseline(patient_id=patient.id, metric_name="Night Rest Regularity", mean_value=7.8, std_value=0.5, normal_range_min=7.0, normal_range_max=8.5, unit="hours")
    ]
    db.add_all(baselines)

    # 12. Caregiver Handoff Notes
    notes = [
        CaregiverNote(
            patient_id=patient.id,
            author_name="Anita Roy (Nurse)",
            author_role="nurse",
            shift_category="Morning Shift",
            note_text="Mrs. Sharma was in high spirits this morning. Blood pressure 124/80 mmHg. Morning capsule taken with breakfast. Enjoyed 35-minute park stroll."
        ),
        CaregiverNote(
            patient_id=patient.id,
            author_name="Priya Sharma (Daughter)",
            author_role="family",
            shift_category="Evening Visit",
            note_text="Mother enjoyed looking at the Jaipur album. She asked about her glasses twice, but found them quickly on the coffee table. Dinner went well."
        )
    ]
    db.add_all(notes)

    # 13. Audit Log & Consents
    consents = [
        Consent(patient_id=patient.id, guardian_name="Priya Sharma", guardian_role="family", permission_type="Safety & Real-Time Alerts", is_granted=True),
        Consent(patient_id=patient.id, guardian_name="Anita Roy (RN)", guardian_role="nurse", permission_type="Medication & Routine Tracking", is_granted=True),
        Consent(patient_id=patient.id, guardian_name="Dr. Arvind Mehta", guardian_role="doctor", permission_type="Longitudinal Health Summaries", is_granted=True)
    ]
    db.add_all(consents)

    db.commit()
    db.close()
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed_database()
