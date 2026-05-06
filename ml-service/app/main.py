from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import schedule, predict, chat, recommend, quiz_gen

app = FastAPI(title="AI Study Planner - ML Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(schedule.router, prefix="/ml")
app.include_router(predict.router, prefix="/ml")
app.include_router(chat.router, prefix="/ml")
app.include_router(recommend.router, prefix="/ml")
app.include_router(quiz_gen.router, prefix="/ml")

@app.get("/health")
def health():
    return {"status": "OK", "service": "ml-service"}
