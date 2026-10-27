import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.ml.baseline_engine import baseline_engine
from backend.app.ml.risk_scorer import risk_scorer

client = TestClient(app)

def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "Nivara" in data["service"]

def test_patient_status():
    res = client.get("/api/patient/status")
    assert res.status_code == 200
    data = res.json()
    assert data["preferred_name"] == "Mrs. Sharma"
    assert "current_status" in data
    assert data["routine_completion_pct"] > 0

def test_routine_tasks():
    res = client.get("/api/patient/routine")
    assert res.status_code == 200
    tasks = res.json()
    assert len(tasks) > 0
    first_task = tasks[0]
    assert "title" in first_task
    assert "time_of_day" in first_task

def test_medication_list():
    res = client.get("/api/patient/medications")
    assert res.status_code == 200
    meds = res.json()
    assert len(meds) >= 3
    # Check simple names are patient friendly
    assert any("Blue" in m["simple_name"] for m in meds)

def test_object_memories():
    res = client.get("/api/patient/objects")
    assert res.status_code == 200
    objs = res.json()
    assert any(o["object_name"] == "glasses" for o in objs)

def test_companion_nlp_query():
    res = client.post("/api/patient/ask", json={"query": "Where are my glasses?"})
    assert res.status_code == 200
    data = res.json()
    assert "glasses" in data["spoken_text"].lower()

def test_ml_baseline_anomaly_detection():
    # Normal behavior
    normal_eval = baseline_engine.evaluate_behavior({
        "walk_duration_minutes": 38.0,
        "assistance_requests_today": 1.0,
        "medication_delay_minutes": 5.0,
        "distance_from_safe_zone_meters": 10.0,
        "wake_time_hour": 7.5
    })
    assert bool(normal_eval["is_anomaly"]) is False

    # Anomalous behavior (Section 13: 9 requests and 2 hours walk)
    anomaly_eval = baseline_engine.evaluate_behavior({
        "walk_duration_minutes": 120.0,
        "assistance_requests_today": 9.0,
        "medication_delay_minutes": 50.0,
        "distance_from_safe_zone_meters": 350.0,
        "wake_time_hour": 7.5
    })
    assert bool(anomaly_eval["is_anomaly"]) is True
    assert len(anomaly_eval["evidence_list"]) > 0

def test_risk_scorer_tiers():
    low = risk_scorer.score_event("MISPLACED_OBJECT", {"object_name": "keys"})
    assert low["severity"] == "LOW"

    med = risk_scorer.score_event("MISSED_MEDICATION", {"miss_count": 2})
    assert med["severity"] == "MEDIUM"

    high = risk_scorer.score_event("WANDERING_DEVIATION", {"duration_minutes": 100, "checkin_unanswered": True})
    assert high["severity"] == "HIGH"

    crit = risk_scorer.score_event("POSSIBLE_FALL", {})
    assert crit["severity"] == "CRITICAL"

def test_simulation_demo_steps():
    # Test step 1
    s1 = client.post("/api/simulation/trigger", json={"scenario": "step", "step_number": 1})
    assert s1.status_code == 200
    d1 = s1.json()
    assert d1["step_number"] == 1
    assert "Mrs. Sharma" in d1["step_details"]["message"]

    # Test step 11
    s11 = client.post("/api/simulation/trigger", json={"scenario": "step", "step_number": 11})
    assert s11.status_code == 200
    d11 = s11.json()
    assert d11["step_number"] == 11

def test_doctor_overview_endpoint():
    res = client.get("/api/doctor/overview")
    assert res.status_code == 200
    data = res.json()
    assert len(data["longitudinal_trends"]) == 14
    assert len(data["baseline_metrics"]) >= 4
    assert "CLINICAL NOTICE" in data["disclaimer"]

def test_rag_knowledge_base():
    from backend.app.ai.rag_engine import rag_engine
    docs = rag_engine.retrieve_context("reading glasses", top_k=3)
    assert len(docs) > 0
    assert any("glasses" in d["text"].lower() for d in docs)

def test_rag_query_endpoint():
    res = client.post("/api/ai/rag/query", json={"query": "What did Nurse Anita note about my blood pressure?"})
    assert res.status_code == 200
    data = res.json()
    assert "Anita" in data["spoken_text"] or "124" in data["spoken_text"]
    assert len(data["retrieved_context"]) > 0

def test_genai_note_entity_extraction():
    sample_note = "Mrs. Sharma was in high spirits today. BP 124/80 mmHg, pulse 72 bpm. Ate oatmeal and papaya."
    res = client.post("/api/ai/extract-note-entities", json={"note_text": sample_note})
    assert res.status_code == 200
    entities = res.json()["entities"]
    assert entities["blood_pressure"] == "124/80"
    assert "Oatmeal" in entities["dietary_items_noted"]
    assert "Cheerful" in entities["patient_mood"]

if __name__ == "__main__":
    pytest.main(["-v", __file__])
