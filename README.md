# 🧠 AI Smart Study Planner

A full-stack AI-powered study planner with personalized scheduling, ML recommendations, NLP chatbot, and real-time analytics.

## 📁 Project Structure

```
ai-study-planner/
├── frontend/        → React.js Web App
├── mobile/          → React Native Mobile App
├── backend/         → Node.js + Express API
├── ml-service/      → Python FastAPI ML Microservice
└── docker-compose.yml
```

## 🚀 Quick Start

### 1. Clone & Setup
```bash
git clone <repo-url>
cd ai-study-planner
```

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env   # fill in your values
npm run dev
```

### 3. ML Service
```bash
cd ml-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 4. Frontend
```bash
cd frontend
npm install
npm start
```

### 5. Mobile
```bash
cd mobile
npm install
npx expo start
```

### 6. Docker (All at once)
```bash
docker-compose up --build
```

## 🧩 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React.js, Tailwind CSS, Redux Toolkit, Chart.js |
| Mobile | React Native, Expo, Redux Toolkit |
| Backend | Node.js, Express, MongoDB, Redis, Socket.io |
| ML Service | Python, FastAPI, scikit-learn, TensorFlow, BERT |
| Auth | JWT + bcrypt |
| DevOps | Docker, Docker Compose |

## 📡 API Endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET  /api/auth/me`

### Schedule
- `GET  /api/schedule`
- `POST /api/schedule/generate`
- `PUT  /api/schedule/:id`

### Quiz
- `GET  /api/quiz/:subject`
- `POST /api/quiz/submit`

### Analytics
- `GET  /api/analytics/performance`
- `GET  /api/analytics/weekly`

### ML (FastAPI)
- `POST /ml/recommend`
- `POST /ml/predict-performance`
- `POST /ml/chat`
- `POST /ml/schedule-optimize`
