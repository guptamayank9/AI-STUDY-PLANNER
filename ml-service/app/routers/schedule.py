from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
import numpy as np

router = APIRouter()

class QuizResult(BaseModel):
    subject: str
    topic: str
    score: float
    date: str

class ScheduleRequest(BaseModel):
    user_id: str
    subjects: List[str]
    exam_date: Optional[str] = None
    study_hours_per_day: float = 4
    start_time: str = "09:00"
    end_time: str = "21:00"
    session_duration: int = 50       # minutes
    break_duration: int = 10         # minutes
    quiz_results: List[QuizResult] = []

def get_subject_weights(subjects, quiz_results):
    """
    Reinforcement Learning inspired weighting:
    Subjects with low scores get higher priority (more sessions).
    """
    weights = {s: 1.0 for s in subjects}

    for qr in quiz_results:
        if qr.subject in weights:
            # Low score → higher weight (inverse scoring)
            penalty = max(0, (70 - qr.score) / 70)
            weights[qr.subject] = weights[qr.subject] + penalty * 0.5

    # Normalize
    total = sum(weights.values())
    return {s: w / total for s, w in weights.items()}

def time_to_minutes(t: str) -> int:
    h, m = map(int, t.split(":"))
    return h * 60 + m

def minutes_to_time(m: int) -> str:
    return f"{m // 60:02d}:{m % 60:02d}"

@router.post("/schedule-optimize")
def optimize_schedule(req: ScheduleRequest):
    weights = get_subject_weights(req.subjects, req.quiz_results)

    start = time_to_minutes(req.start_time)
    end = time_to_minutes(req.end_time)
    slot = req.session_duration + req.break_duration  # one cycle

    # How many sessions fit in the day
    available_minutes = min((end - start), req.study_hours_per_day * 60)
    total_slots = int(available_minutes // slot)

    # Distribute slots by weight (RL policy)
    subject_slots = {}
    remaining = total_slots
    sorted_subjects = sorted(weights.items(), key=lambda x: -x[1])

    for i, (subj, w) in enumerate(sorted_subjects):
        if i == len(sorted_subjects) - 1:
            subject_slots[subj] = remaining
        else:
            alloc = max(1, round(w * total_slots))
            alloc = min(alloc, remaining)
            subject_slots[subj] = alloc
            remaining -= alloc
        if remaining <= 0:
            break

    # Generate topic names per subject
    topics_map = {
        "Mathematics": ["Calculus", "Algebra", "Probability", "Linear Algebra", "Statistics"],
        "Physics":     ["Mechanics", "Electromagnetism", "Thermodynamics", "Optics", "Modern Physics"],
        "DSA":         ["Arrays", "Trees", "Graphs", "Dynamic Programming", "Sorting"],
        "Chemistry":   ["Organic", "Inorganic", "Physical Chemistry", "Electrochemistry"],
        "Biology":     ["Cell Biology", "Genetics", "Ecology", "Human Physiology"],
    }

    sessions = []
    current_time = start

    for subj, num_slots in subject_slots.items():
        topics = topics_map.get(subj, ["General", "Practice", "Revision"])

        # Find weak topics from quiz results
        weak_topics = [
            qr.topic for qr in req.quiz_results
            if qr.subject == subj and qr.score < 60
        ]
        topic_pool = weak_topics + topics  # weak topics first

        for j in range(num_slots):
            if current_time + req.session_duration > end:
                break

            topic = topic_pool[j % len(topic_pool)]
            score_history = [
                qr.score for qr in req.quiz_results
                if qr.subject == subj and qr.topic == topic
            ]
            avg_score = np.mean(score_history) if score_history else 70.0
            priority = "high" if avg_score < 50 else ("medium" if avg_score < 75 else "low")

            sessions.append({
                "subject": subj,
                "topic": topic,
                "startTime": minutes_to_time(current_time),
                "endTime": minutes_to_time(current_time + req.session_duration),
                "duration": req.session_duration,
                "completed": False,
                "priority": priority,
            })
            current_time += slot  # session + break

    return {"schedule": sessions, "total_sessions": len(sessions), "algorithm": "RL-weighted"}
