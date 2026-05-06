from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
import numpy as np

router = APIRouter()

class QuizEntry(BaseModel):
    subject: str
    score: float
    date: str

class PredictRequest(BaseModel):
    user_id: str
    quiz_results: List[QuizEntry]

def simple_lstm_predict(scores: List[float]) -> float:
    """
    Simplified LSTM-like weighted moving average prediction.
    In production: replace with trained tf.keras LSTM model.
    Recent scores have more weight (simulates LSTM memory gates).
    """
    if not scores:
        return 70.0
    if len(scores) == 1:
        return scores[0]

    n = len(scores)
    weights = np.exp(np.linspace(0, 1, n))  # exponential weights (recency bias)
    weights /= weights.sum()
    predicted = float(np.dot(weights, scores))

    # Add momentum: if last 3 scores improving, boost prediction
    if len(scores) >= 3:
        recent_trend = scores[-1] - scores[-3]
        predicted += recent_trend * 0.2

    return round(min(100, max(0, predicted)), 1)

@router.post("/predict-performance")
def predict_performance(req: PredictRequest):
    # Group scores by subject
    subject_scores = {}
    for qr in req.quiz_results:
        subject_scores.setdefault(qr.subject, []).append(qr.score)

    predictions = {}
    weak_subjects = []
    strong_subjects = []

    for subject, scores in subject_scores.items():
        pred = simple_lstm_predict(scores)
        predictions[subject] = pred
        if pred < 55:
            weak_subjects.append(subject)
        elif pred > 75:
            strong_subjects.append(subject)

    overall = round(np.mean(list(predictions.values())), 1) if predictions else 70.0

    tips = []
    for subj in weak_subjects:
        tips.append(f"Increase daily study time for {subj} — predicted score is below 55%.")
    if overall > 75:
        tips.append("You're on track! Maintain consistency and attempt more mock tests.")

    return {
        "prediction": {
            "by_subject": predictions,
            "overall_predicted_score": overall,
            "weak_subjects": weak_subjects,
            "strong_subjects": strong_subjects,
            "tips": tips,
        }
    }
