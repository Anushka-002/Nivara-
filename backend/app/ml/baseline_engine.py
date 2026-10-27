import numpy as np
from sklearn.ensemble import IsolationForest
from typing import Dict, Any, List

class PersonalBaselineEngine:
    """
    ML Engine for learning patient's personal routine baseline and detecting
    non-diagnostic behavioral deviations using an Isolation Forest model.
    """
    def __init__(self):
        # Features:
        # [0]: walk_duration_minutes (Normal: 30 - 45)
        # [1]: assistance_requests_per_day (Normal: 1 - 2)
        # [2]: medication_delay_minutes (Normal: 0 - 15)
        # [3]: distance_from_safe_zone_meters (Normal: 0 - 50)
        # [4]: wake_time_hour (Normal: 7.0 - 8.0)
        self.model = IsolationForest(contamination=0.08, random_state=42)
        self.is_trained = False
        self._train_synthetic_baseline()

    def _train_synthetic_baseline(self):
        # Generate 180 days of normal simulated baseline samples for Mrs. Sharma
        np.random.seed(42)
        n_samples = 180

        walk_duration = np.random.normal(loc=38.0, scale=4.0, size=n_samples)
        assistance_reqs = np.random.poisson(lam=1.3, size=n_samples)
        med_delay = np.random.exponential(scale=6.0, size=n_samples)
        dist_from_zone = np.random.exponential(scale=15.0, size=n_samples)
        wake_time = np.random.normal(loc=7.5, scale=0.3, size=n_samples)

        X_train = np.column_stack([
            walk_duration,
            assistance_reqs,
            med_delay,
            dist_from_zone,
            wake_time
        ])

        self.model.fit(X_train)
        self.is_trained = True

        # Store baseline statistics
        self.baseline_stats = {
            "walk_duration_mean": 38.0,
            "walk_duration_std": 4.0,
            "assistance_mean": 1.4,
            "assistance_std": 0.8,
            "med_delay_mean": 8.0,
            "med_delay_std": 5.0,
            "safe_zone_mean": 12.0,
            "safe_zone_std": 10.0,
        }

    def evaluate_behavior(self, features: Dict[str, float]) -> Dict[str, Any]:
        """
        Evaluate given day's features against personal baseline.
        Returns anomaly decision, score, and human-readable explainability.
        """
        x_vec = np.array([[
            features.get("walk_duration_minutes", 38.0),
            features.get("assistance_requests_today", 1.0),
            features.get("medication_delay_minutes", 5.0),
            features.get("distance_from_safe_zone_meters", 10.0),
            features.get("wake_time_hour", 7.5)
        ]])

        prediction = self.model.predict(x_vec)[0] # 1 for normal, -1 for anomaly
        decision_score = float(self.model.decision_function(x_vec)[0])

        is_anomaly = (prediction == -1)
        evidence_points: List[str] = []

        # Analyze individual feature deviations
        walk = features.get("walk_duration_minutes", 38.0)
        if walk > 65.0:
            evidence_points.append(
                f"Walk duration ({walk:.0f} mins) is significantly higher than established baseline of 35-45 mins."
            )

        reqs = features.get("assistance_requests_today", 1.0)
        if reqs >= 5:
            evidence_points.append(
                f"Assistance requests today ({reqs}) exceeded the typical baseline of 1-2 requests/day."
            )

        delay = features.get("medication_delay_minutes", 5.0)
        if delay > 45:
            evidence_points.append(
                f"Medication confirmation delay is {delay:.0f} mins (normal baseline: <15 mins)."
            )

        dist = features.get("distance_from_safe_zone_meters", 10.0)
        if dist > 200:
            evidence_points.append(
                f"Patient is {dist:.0f}m beyond designated safe zone boundaries."
            )

        # Non-diagnostic human-readable explanation
        if is_anomaly or evidence_points:
            patient_message = "Something seems different from your usual routine today."
            clinical_explanation = " ".join(evidence_points) or "Mild deviation detected from multidimensional baseline."
        else:
            patient_message = "Your day is following your familiar pattern nicely."
            clinical_explanation = "Activity, routine adherence, and navigation match established personal baseline."

        return {
            "is_anomaly": bool(is_anomaly or len(evidence_points) > 0),
            "anomaly_score": round(-decision_score, 3), # Higher = more anomalous
            "patient_friendly_message": patient_message,
            "clinical_explanation": clinical_explanation,
            "evidence_list": evidence_points
        }

# Global singleton
baseline_engine = PersonalBaselineEngine()
