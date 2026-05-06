from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
import os, json, re

router = APIRouter()

class QuizGenRequest(BaseModel):
    subject: str
    topic: Optional[str] = "General"
    difficulty: Optional[str] = "medium"   # easy / medium / hard
    num_questions: Optional[int] = 5

# ── Fallback static bank (used when OpenAI not available) ──────────────────
STATIC_BANK = {
    "Mathematics": [
        {"q": "What is the derivative of x³?", "options": ["3x²", "2x", "x³", "3x"], "answer": "3x²", "explanation": "Power rule: d/dx(xⁿ) = nxⁿ⁻¹"},
        {"q": "Value of ∫2x dx?", "options": ["x²+C", "2x²+C", "x+C", "2+C"], "answer": "x²+C", "explanation": "∫2x dx = 2·(x²/2) + C = x² + C"},
        {"q": "sin²θ + cos²θ = ?", "options": ["1", "0", "2", "sinθ"], "answer": "1", "explanation": "Pythagorean identity"},
        {"q": "log(1) = ?", "options": ["0", "1", "-1", "undefined"], "answer": "0", "explanation": "log base anything of 1 is always 0"},
        {"q": "If f(x)=x²+3, f(2)=?", "options": ["7", "9", "5", "11"], "answer": "7", "explanation": "f(2) = 4+3 = 7"},
        {"q": "Roots of x²-5x+6=0?", "options": ["2,3", "1,6", "-2,-3", "3,4"], "answer": "2,3", "explanation": "(x-2)(x-3)=0"},
        {"q": "Area of circle radius r?", "options": ["πr²", "2πr", "πr", "2πr²"], "answer": "πr²", "explanation": "Standard area formula"},
    ],
    "Physics": [
        {"q": "F = ma. Unit of force?", "options": ["Newton", "Joule", "Pascal", "Watt"], "answer": "Newton", "explanation": "Newton = kg·m/s²"},
        {"q": "Speed of light in vacuum?", "options": ["3×10⁸ m/s", "3×10⁶ m/s", "3×10¹⁰ m/s", "3×10⁴ m/s"], "answer": "3×10⁸ m/s", "explanation": "c ≈ 3×10⁸ m/s"},
        {"q": "KE = ?", "options": ["½mv²", "mv²", "mgh", "½mgh"], "answer": "½mv²", "explanation": "Kinetic energy formula"},
        {"q": "Ohm's law: V = ?", "options": ["IR", "I/R", "R/I", "I²R"], "answer": "IR", "explanation": "Voltage = Current × Resistance"},
        {"q": "Unit of electric charge?", "options": ["Coulomb", "Ampere", "Volt", "Watt"], "answer": "Coulomb", "explanation": "SI unit of charge is Coulomb"},
        {"q": "Newton's 3rd law states?", "options": ["Every action has equal opposite reaction", "F=ma", "Objects at rest stay at rest", "Energy is conserved"], "answer": "Every action has equal opposite reaction", "explanation": "Action-reaction pairs"},
    ],
    "DSA": [
        {"q": "Time complexity of binary search?", "options": ["O(log n)", "O(n)", "O(n²)", "O(1)"], "answer": "O(log n)", "explanation": "Divides search space in half each step"},
        {"q": "Which uses LIFO order?", "options": ["Stack", "Queue", "Heap", "Tree"], "answer": "Stack", "explanation": "Last In First Out — Stack"},
        {"q": "Best case of bubble sort?", "options": ["O(n)", "O(n²)", "O(log n)", "O(n log n)"], "answer": "O(n)", "explanation": "Already sorted array — just one pass"},
        {"q": "Hash table average lookup?", "options": ["O(1)", "O(n)", "O(log n)", "O(n²)"], "answer": "O(1)", "explanation": "Direct key-index mapping"},
        {"q": "DFS uses which structure?", "options": ["Stack", "Queue", "Array", "Heap"], "answer": "Stack", "explanation": "DFS uses stack (or recursion)"},
        {"q": "Linked list vs Array: insertion at head?", "options": ["O(1) for linked list", "O(1) for array", "O(n) for both", "O(log n) for both"], "answer": "O(1) for linked list", "explanation": "Just update head pointer"},
        {"q": "What is a balanced BST?", "options": ["Height O(log n)", "Height O(n)", "All leaves same level", "Sorted array"], "answer": "Height O(log n)", "explanation": "Ensures O(log n) operations"},
    ],
    "DBMS": [
        {"q": "ACID stands for?", "options": ["Atomicity Consistency Isolation Durability", "Access Control Index Data", "Async Concurrent Indexed Database", "None"], "answer": "Atomicity Consistency Isolation Durability", "explanation": "Core DB transaction properties"},
        {"q": "SQL SELECT syntax?", "options": ["SELECT col FROM table", "GET col FROM table", "FETCH col IN table", "READ col FROM table"], "answer": "SELECT col FROM table", "explanation": "Basic SQL query"},
        {"q": "Primary key property?", "options": ["Unique + Not Null", "Unique only", "Not Null only", "Can be duplicate"], "answer": "Unique + Not Null", "explanation": "PK must be unique and non-null"},
        {"q": "JOIN that returns all rows from left table?", "options": ["LEFT JOIN", "INNER JOIN", "RIGHT JOIN", "FULL JOIN"], "answer": "LEFT JOIN", "explanation": "LEFT JOIN keeps all left rows"},
        {"q": "Normal form that removes partial dependency?", "options": ["2NF", "1NF", "3NF", "BCNF"], "answer": "2NF", "explanation": "2NF eliminates partial dependencies"},
    ],
    "OS": [
        {"q": "Deadlock requires?", "options": ["Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait", "Only Circular Wait", "Only Mutual Exclusion", "Starvation"], "answer": "Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait", "explanation": "Coffman's 4 conditions"},
        {"q": "Page replacement algorithm — optimal?", "options": ["OPT", "LRU", "FIFO", "LFU"], "answer": "OPT", "explanation": "Optimal replaces page used farthest in future"},
        {"q": "Process vs Thread?", "options": ["Thread shares memory, process doesn't", "Process shares memory, thread doesn't", "Both share memory", "Neither shares"], "answer": "Thread shares memory, process doesn't", "explanation": "Threads share heap, process has own space"},
        {"q": "CPU scheduling: shortest job first?", "options": ["SJF", "FCFS", "RR", "Priority"], "answer": "SJF", "explanation": "Shortest Job First minimizes average waiting time"},
    ],
    "CN": [
        {"q": "OSI model has how many layers?", "options": ["7", "4", "5", "6"], "answer": "7", "explanation": "Physical, Data Link, Network, Transport, Session, Presentation, Application"},
        {"q": "TCP vs UDP — reliable?", "options": ["TCP", "UDP", "Both", "Neither"], "answer": "TCP", "explanation": "TCP has handshake and acknowledgement"},
        {"q": "IP address version 4 is how many bits?", "options": ["32", "64", "128", "16"], "answer": "32", "explanation": "IPv4 = 32 bits = 4 octets"},
        {"q": "DNS full form?", "options": ["Domain Name System", "Data Network Service", "Dynamic Name Server", "Direct Network System"], "answer": "Domain Name System", "explanation": "Translates domain names to IPs"},
        {"q": "HTTP default port?", "options": ["80", "443", "21", "22"], "answer": "80", "explanation": "HTTPS uses 443, FTP uses 21"},
    ],
}

def generate_with_openai(subject: str, topic: str, difficulty: str, n: int):
    """Generate AI questions using OpenAI GPT."""
    try:
        from openai import OpenAI
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

        prompt = f"""Generate {n} multiple choice questions for:
Subject: {subject}
Topic: {topic}
Difficulty: {difficulty}

Return ONLY a JSON array, no other text:
[
  {{
    "q": "question text",
    "options": ["A", "B", "C", "D"],
    "answer": "correct option text",
    "explanation": "why this is correct"
  }}
]"""

        res = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1200,
            temperature=0.7,
        )
        raw = res.choices[0].message.content
        # Strip markdown fences if present
        raw = re.sub(r"```json|```", "", raw).strip()
        return json.loads(raw)
    except Exception as e:
        print(f"OpenAI quiz gen failed: {e}")
        return None

@router.post("/generate-quiz")
def generate_quiz(req: QuizGenRequest):
    """
    Generate quiz questions.
    1. Try OpenAI (if API key set) → fresh AI-generated questions
    2. Fallback → curated static bank
    """
    ai_questions = None

    if os.getenv("OPENAI_API_KEY"):
        ai_questions = generate_with_openai(
            req.subject, req.topic, req.difficulty, req.num_questions
        )

    if ai_questions:
        return {
            "questions": ai_questions,
            "source": "ai-generated",
            "subject": req.subject,
            "topic": req.topic,
        }

    # Fallback: pick from static bank, shuffle a bit
    bank = STATIC_BANK.get(req.subject, STATIC_BANK.get("DSA", []))
    import random
    selected = random.sample(bank, min(req.num_questions, len(bank)))

    return {
        "questions": selected,
        "source": "static-bank",
        "subject": req.subject,
        "topic": req.topic,
    }
