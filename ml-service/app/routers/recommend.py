from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
import numpy as np

router = APIRouter()

class RecommendRequest(BaseModel):
    user_id: str
    subjects: List[str]
    weak_subjects: List[str] = []

# Static resource bank (extend with DB in production)
RESOURCES = {
    "Mathematics": [
        {"title": "Khan Academy - Calculus",        "url": "https://khanacademy.org/math/calculus-1", "type": "video"},
        {"title": "MIT OCW - Linear Algebra",       "url": "https://ocw.mit.edu/18-06",              "type": "course"},
        {"title": "3Blue1Brown - Essence of Calculus","url": "https://youtube.com/3b1b",             "type": "video"},
    ],
    "Physics": [
        {"title": "Khan Academy - Physics",         "url": "https://khanacademy.org/science/physics","type": "video"},
        {"title": "MIT OCW - Classical Mechanics",  "url": "https://ocw.mit.edu/8-01",              "type": "course"},
        {"title": "Physics Galaxy - HC Verma",      "url": "https://physicsgalaxy.com",              "type": "book"},
    ],
    "DSA": [
        {"title": "LeetCode - Top 150 Problems",    "url": "https://leetcode.com",                  "type": "practice"},
        {"title": "GeeksForGeeks - DSA Course",     "url": "https://geeksforgeeks.org/dsa",         "type": "course"},
        {"title": "Abdul Bari - Algorithms",        "url": "https://youtube.com/abdulbari",         "type": "video"},
        {"title": "Striver's DSA Sheet",            "url": "https://takeuforward.org",              "type": "practice"},
    ],
    "Chemistry": [
        {"title": "Khan Academy - Chemistry",       "url": "https://khanacademy.org/science/chemistry","type": "video"},
        {"title": "NCERT Chemistry PDF",            "url": "https://ncert.nic.in",                  "type": "book"},
    ],
}

def collaborative_filter(subjects: List[str], weak: List[str]) -> List[dict]:
    """
    Simplified Collaborative Filtering:
    - Weak subjects get top resources (simulates high-weight recommendations)
    - Other subjects get 1 resource each
    In production: use SVD matrix factorization on user-resource interactions.
    """
    recs = []

    # Weak subjects first, all resources
    for subj in weak:
        for res in RESOURCES.get(subj, []):
            recs.append({**res, "subject": subj, "priority": "high", "reason": f"Recommended because {subj} is a weak area"})

    # Other subjects - 1 top resource
    for subj in subjects:
        if subj not in weak:
            bank = RESOURCES.get(subj, [])
            if bank:
                recs.append({**bank[0], "subject": subj, "priority": "normal", "reason": "Suggested for balanced preparation"})

    return recs

@router.post("/recommend")
def recommend(req: RecommendRequest):
    resources = collaborative_filter(req.subjects, req.weak_subjects)
    return {"recommendations": resources, "algorithm": "collaborative-filtering"}
