from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional, Dict
import os

router = APIRouter()

class ChatRequest(BaseModel):
    user_id: str
    message: str
    history: List[Dict] = []
    context: Optional[Dict] = {}

# Rule-based NLP fallback (no API key needed for demo)
INTENT_RESPONSES = {
    "schedule":     "Your AI schedule is generated based on your quiz performance and available study hours. Go to the Schedule tab to view today's plan!",
    "weak":         "I detected weak areas based on your recent quiz scores. Focus more on low-scoring subjects — the planner has already boosted their frequency!",
    "quiz":         "Taking regular quizzes helps the ML model understand your progress. Try to attempt at least one quiz per subject daily.",
    "performance":  "Check the Analytics tab for detailed performance charts, subject-wise scores, and predicted exam outcomes.",
    "streak":       "Your streak increases every day you complete your scheduled sessions. Keep it going for bonus points and badges!",
    "tip":          "Study tip: Use the Pomodoro technique — 50 min study, 10 min break. The planner already follows this structure!",
    "spaced":       "Spaced repetition schedules revision sessions based on the Ebbinghaus Forgetting Curve — topics you studied 3-7 days ago are automatically re-added.",
    "help":         "I can help you with: study schedule, quiz tips, performance analysis, weak subjects, streaks, and study techniques. What do you want to know?",
}

def get_intent(message: str) -> str:
    msg = message.lower()
    if any(w in msg for w in ["schedule", "plan", "timetable", "today"]):
        return "schedule"
    if any(w in msg for w in ["weak", "bad", "fail", "improve", "low score"]):
        return "weak"
    if any(w in msg for w in ["quiz", "test", "exam", "question"]):
        return "quiz"
    if any(w in msg for w in ["performance", "score", "result", "analytics", "progress"]):
        return "performance"
    if any(w in msg for w in ["streak", "points", "badge", "reward"]):
        return "streak"
    if any(w in msg for w in ["tip", "advice", "suggest", "how to study"]):
        return "tip"
    if any(w in msg for w in ["spaced", "revision", "repeat", "forget"]):
        return "spaced"
    return "help"

def call_openai(message: str, history: list, context: dict) -> str:
    """Use OpenAI API if key is available."""
    try:
        from openai import OpenAI
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

        system_prompt = f"""You are an AI study assistant for a smart study planner app.
The student is studying: {', '.join(context.get('subjects', []))}.
Keep answers short, helpful, and motivating. Focus on study strategies, scheduling, and academic tips."""

        messages = [{"role": "system", "content": system_prompt}]
        for h in history[-6:]:   # last 6 turns
            messages.append(h)
        messages.append({"role": "user", "content": message})

        res = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages,
            max_tokens=200,
            temperature=0.7,
        )
        return res.choices[0].message.content
    except Exception:
        return None

@router.post("/chat")
def chat(req: ChatRequest):
    # Try OpenAI first
    if os.getenv("OPENAI_API_KEY"):
        reply = call_openai(req.message, req.history, req.context)
        if reply:
            return {"reply": reply}

    # Fallback: rule-based NLP
    intent = get_intent(req.message)
    reply = INTENT_RESPONSES.get(intent, INTENT_RESPONSES["help"])

    return {"reply": reply, "intent": intent}
