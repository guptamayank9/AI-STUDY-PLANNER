import React, { useState } from "react";
import { useSelector } from "react-redux";
import api from "../services/api";
import toast from "react-hot-toast";
import { FiCheckCircle, FiXCircle, FiZap, FiBook } from "react-icons/fi";

const ML_URL = process.env.REACT_APP_ML_URL || "http://localhost:8000";

const DIFFICULTIES = [
  { label: "Easy",   value: "easy",   color: "#48bb78" },
  { label: "Medium", value: "medium", color: "#ed8936" },
  { label: "Hard",   value: "hard",   color: "#e53e3e" },
];

const TOPICS = {
  Mathematics: ["Calculus", "Algebra", "Probability", "Trigonometry", "Statistics"],
  Physics:     ["Mechanics", "Electromagnetism", "Thermodynamics", "Optics"],
  DSA:         ["Arrays & Strings", "Trees & Graphs", "Dynamic Programming", "Sorting"],
  DBMS:        ["SQL Queries", "Normalization", "Transactions", "Indexing"],
  OS:          ["Process Management", "Memory Management", "Deadlocks", "Scheduling"],
  CN:          ["OSI Model", "TCP/IP", "Routing", "DNS & HTTP"],
  Chemistry:   ["Organic Chemistry", "Inorganic Chemistry", "Physical Chemistry"],
  Biology:     ["Cell Biology", "Genetics", "Ecology", "Human Physiology"],
};

export default function QuizPage() {
  const { user } = useSelector((s) => s.auth);
  const [subject,    setSubject]    = useState("");
  const [topic,      setTopic]      = useState("General");
  const [difficulty, setDifficulty] = useState("medium");
  const [numQ,       setNumQ]       = useState(5);
  const [questions,  setQuestions]  = useState([]);
  const [answers,    setAnswers]    = useState({});
  const [submitted,  setSubmitted]  = useState(false);
  const [result,     setResult]     = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [source,     setSource]     = useState("");

  const generateQuiz = async () => {
    if (!subject) return toast.error("Subject choose karo pehle!");
    setLoading(true);
    try {
      // Backend proxy use karo — seedha ML se nahi
      const { data } = await api.post("/quiz/generate", {
        subject, topic, difficulty, num_questions: numQ,
      });
      setQuestions(data.questions);
      setSource(data.source);
      setAnswers({});
      setSubmitted(false);
      setResult(null);
      toast.success(data.source === "ai-generated" ? "🤖 AI ne fresh questions banaye!" : "📚 Question bank load hua!");
    } catch {
      toast.error("Quiz generate nahi hua. Backend chal raha hai?");
    } finally {
      setLoading(false);
    }
  };

  const submitQuiz = async () => {
    if (Object.keys(answers).length < questions.length)
      return toast.error("Saare questions answer karo pehle!");
    const answerArr = questions.map((q, i) => ({
      question: q.q, selected: answers[i],
      correct: q.answer, isCorrect: answers[i] === q.answer,
    }));
    try {
      const { data } = await api.post("/quiz/submit", { subject, topic, answers: answerArr, timeTaken: 0 });
      setResult({ ...data, explanations: questions.map((q) => q.explanation) });
      setSubmitted(true);
      toast.success(`Quiz complete! Score: ${data.result.score}%`);
    } catch { toast.error("Submit failed"); }
  };

  const reset = () => { setQuestions([]); setSubmitted(false); setResult(null); };
  const answeredCount = Object.keys(answers).length;

  // ── SETUP VIEW ───────────────────────────────────────────────────────────
  if (!questions.length && !submitted) return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <FiZap size={24} color="#4A90D9" />
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1E3A5F" }}>AI Quiz Generator</h1>
      </div>
      <p style={{ color: "#718096", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
        AI automatically generates fresh questions — kuch likhna nahi padega! 🤖
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem", maxWidth: 860, marginBottom: "1.2rem" }}>

        {/* Subject + Topic */}
        <div className="card">
          <h2 style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: "1rem", color: "#1E3A5F" }}>
            Subject &amp; Topic
          </h2>
          <p style={{ fontSize: "0.8rem", color: "#718096", marginBottom: 8 }}>Subject</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: "1.2rem" }}>
            {(user?.subjects || ["DSA", "Mathematics", "Physics", "DBMS"]).map((s) => (
              <button key={s} onClick={() => { setSubject(s); setTopic("General"); }}
                style={{
                  padding: "0.35rem 1rem", borderRadius: 20, border: "1px solid", cursor: "pointer",
                  borderColor: subject === s ? "#4A90D9" : "#e2e8f0",
                  background:  subject === s ? "#4A90D9" : "#fff",
                  color:       subject === s ? "#fff"    : "#555",
                  fontSize: "0.82rem", fontWeight: 500,
                }}>{s}</button>
            ))}
          </div>

          {subject && (<>
            <p style={{ fontSize: "0.8rem", color: "#718096", marginBottom: 8 }}>Topic</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {["General", ...(TOPICS[subject] || [])].map((t) => (
                <button key={t} onClick={() => setTopic(t)}
                  style={{
                    padding: "0.3rem 0.85rem", borderRadius: 20, border: "1px solid", cursor: "pointer",
                    borderColor: topic === t ? "#4A90D9" : "#e2e8f0",
                    background:  topic === t ? "#EBF4FF" : "#fff",
                    color:       topic === t ? "#185FA5" : "#555",
                    fontSize: "0.8rem", fontWeight: 500,
                  }}>{t}</button>
              ))}
            </div>
          </>)}
        </div>

        {/* Difficulty + Count */}
        <div className="card">
          <h2 style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: "1rem", color: "#1E3A5F" }}>
            Quiz Settings
          </h2>
          <p style={{ fontSize: "0.8rem", color: "#718096", marginBottom: 8 }}>Difficulty</p>
          <div style={{ display: "flex", gap: 8, marginBottom: "1.2rem" }}>
            {DIFFICULTIES.map((d) => (
              <button key={d.value} onClick={() => setDifficulty(d.value)}
                style={{
                  flex: 1, padding: "0.5rem", borderRadius: 10, cursor: "pointer",
                  border: `1.5px solid ${d.color}`,
                  background:  difficulty === d.value ? d.color : "#fff",
                  color:       difficulty === d.value ? "#fff"  : d.color,
                  fontWeight: 700, fontSize: "0.85rem",
                }}>{d.label}</button>
            ))}
          </div>

          <p style={{ fontSize: "0.8rem", color: "#718096", marginBottom: 8 }}>
            Questions: <b style={{ color: "#1E3A5F" }}>{numQ}</b>
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            {[3, 5, 7, 10].map((n) => (
              <button key={n} onClick={() => setNumQ(n)}
                style={{
                  flex: 1, padding: "0.5rem", borderRadius: 10, cursor: "pointer",
                  border: "1px solid",
                  borderColor: numQ === n ? "#4A90D9" : "#e2e8f0",
                  background:  numQ === n ? "#4A90D9" : "#fff",
                  color:       numQ === n ? "#fff"    : "#555",
                  fontWeight: 600, fontSize: "0.85rem",
                }}>{n} Qs</button>
            ))}
          </div>
        </div>
      </div>

      {/* Generate button */}
      <div style={{ maxWidth: 860 }}>
        <button onClick={generateQuiz} disabled={!subject || loading}
          style={{
            width: "100%", padding: "0.9rem",
            background: !subject ? "#a0aec0" : "#4A90D9",
            color: "#fff", border: "none", borderRadius: 12,
            fontSize: "1rem", fontWeight: 700,
            cursor: !subject ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          }}>
          <FiZap size={18} />
          {loading ? "AI generating questions..." : "Generate AI Quiz"}
        </button>

        <div style={{
          marginTop: 10, padding: "0.7rem 1rem", borderRadius: 8,
          background: "#EBF4FF", display: "flex", gap: 8,
        }}>
          <FiBook size={14} color="#185FA5" style={{ marginTop: 2, flexShrink: 0 }} />
          <p style={{ fontSize: "0.8rem", color: "#185FA5", margin: 0, lineHeight: 1.5 }}>
            OpenAI API key set hai toh fresh AI questions milenge, warna curated question bank se milenge.
            ML service port 8000 pe chalni chahiye.
          </p>
        </div>
      </div>
    </div>
  );

  // ── QUESTIONS VIEW ───────────────────────────────────────────────────────
  if (questions.length && !submitted) return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#1E3A5F" }}>{subject} — {topic}</h1>
          <p style={{ color: "#718096", fontSize: "0.85rem" }}>{questions.length} questions · {difficulty}</p>
        </div>
        <div style={{
          padding: "0.3rem 0.9rem", borderRadius: 20, fontSize: "0.78rem", fontWeight: 600,
          background: source === "ai-generated" ? "#EBF4FF" : "#EAF3DE",
          color: source === "ai-generated" ? "#185FA5" : "#276749",
        }}>
          {source === "ai-generated" ? "🤖 AI Generated" : "📚 Question Bank"}
        </div>
      </div>

      {/* Progress */}
      <div className="card" style={{ marginBottom: "1rem", padding: "0.75rem 1.2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: "0.85rem" }}>
          <span style={{ fontWeight: 600 }}>Progress</span>
          <span style={{ color: "#4A90D9", fontWeight: 700 }}>{answeredCount}/{questions.length} answered</span>
        </div>
        <div style={{ background: "#e2e8f0", borderRadius: 6, height: 8 }}>
          <div style={{
            width: `${(answeredCount / questions.length) * 100}%`,
            background: "#4A90D9", borderRadius: 6, height: 8, transition: "width 0.3s",
          }} />
        </div>
      </div>

      <div style={{ maxWidth: 700 }}>
        {questions.map((q, i) => (
          <div key={i} className="card" style={{ marginBottom: "1rem" }}>
            <div style={{ display: "flex", gap: 10, marginBottom: "0.75rem" }}>
              <span style={{
                background: "#EBF4FF", color: "#185FA5", fontWeight: 700,
                fontSize: "0.75rem", padding: "0.2rem 0.6rem", borderRadius: 20,
                flexShrink: 0, alignSelf: "flex-start",
              }}>Q{i + 1}</span>
              <p style={{ margin: 0, fontWeight: 600, lineHeight: 1.5, color: "#1E3A5F" }}>{q.q}</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {q.options.map((opt) => (
                <button key={opt} onClick={() => setAnswers({ ...answers, [i]: opt })}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "0.65rem 1rem", borderRadius: 10, cursor: "pointer",
                    border: `1.5px solid ${answers[i] === opt ? "#4A90D9" : "#e2e8f0"}`,
                    background: answers[i] === opt ? "#EBF4FF" : "#fff",
                    textAlign: "left", fontSize: "0.9rem",
                    color: answers[i] === opt ? "#185FA5" : "#1a202c",
                    fontWeight: answers[i] === opt ? 600 : 400,
                  }}>
                  <span style={{
                    width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                    border: `2px solid ${answers[i] === opt ? "#4A90D9" : "#cbd5e0"}`,
                    background: answers[i] === opt ? "#4A90D9" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {answers[i] === opt && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#fff" }} />}
                  </span>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-primary" onClick={submitQuiz}
            style={{ flex: 1, padding: "0.8rem", fontSize: "1rem" }}>
            Submit Quiz
          </button>
          <button className="btn btn-outline" onClick={reset}>← Change Settings</button>
        </div>
      </div>
    </div>
  );

  // ── RESULTS VIEW ─────────────────────────────────────────────────────────
  if (submitted && result) {
    const score = result.result.score;
    return (
      <div>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#1E3A5F", marginBottom: "1.2rem" }}>
          Quiz Results
        </h1>

        <div className="card" style={{
          maxWidth: 700, textAlign: "center", marginBottom: "1.5rem",
          borderTop: `4px solid ${score >= 70 ? "#48bb78" : "#e53e3e"}`,
        }}>
          <div style={{ fontSize: "2.5rem" }}>{score >= 80 ? "🏆" : score >= 60 ? "👍" : "💪"}</div>
          <div style={{ fontSize: "3.5rem", fontWeight: 700, color: score >= 70 ? "#48bb78" : "#e53e3e" }}>
            {score}%
          </div>
          <p style={{ color: "#718096", margin: "4px 0" }}>
            {result.result.correctAnswers}/{result.result.totalQuestions} correct
          </p>
          <p style={{ color: "#9f7aea", fontWeight: 700 }}>+{result.pointsEarned} points earned 🏆</p>
          <p style={{ color: "#718096", fontSize: "0.8rem", marginTop: 4 }}>
            {subject} · {topic} · {difficulty}
          </p>
        </div>

        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.8rem", maxWidth: 700 }}>
          Detailed Review
        </h2>
        <div style={{ maxWidth: 700 }}>
          {result.result.answers.map((a, i) => (
            <div key={i} style={{
              padding: "0.9rem 1rem", borderRadius: 10, marginBottom: 10,
              background: a.isCorrect ? "#f0fff4" : "#fff5f5",
              borderLeft: `4px solid ${a.isCorrect ? "#48bb78" : "#e53e3e"}`,
            }}>
              <div style={{ display: "flex", gap: 10, marginBottom: 4 }}>
                {a.isCorrect
                  ? <FiCheckCircle size={18} color="#48bb78" style={{ marginTop: 2, flexShrink: 0 }} />
                  : <FiXCircle     size={18} color="#e53e3e" style={{ marginTop: 2, flexShrink: 0 }} />}
                <p style={{ margin: 0, fontWeight: 600, fontSize: "0.9rem", color: "#1E3A5F", lineHeight: 1.5 }}>
                  {a.question}
                </p>
              </div>
              {!a.isCorrect && (
                <p style={{ margin: "4px 0 4px 28px", fontSize: "0.82rem", color: "#718096" }}>
                  Tumhara: <b style={{ color: "#e53e3e" }}>{a.selected}</b>
                  &nbsp;&nbsp;Sahi: <b style={{ color: "#48bb78" }}>{a.correct}</b>
                </p>
              )}
              {result.explanations?.[i] && (
                <div style={{
                  marginTop: 8, marginLeft: 28, padding: "0.5rem 0.75rem",
                  background: "#FAEEDA", borderRadius: 8,
                  display: "flex", gap: 6,
                }}>
                  <span style={{ fontSize: "0.8rem", flexShrink: 0 }}>💡</span>
                  <p style={{ margin: 0, fontSize: "0.8rem", color: "#633806", lineHeight: 1.5 }}>
                    {result.explanations[i]}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10, maxWidth: 700, marginTop: "0.5rem" }}>
          <button className="btn btn-primary" onClick={generateQuiz}
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <FiZap size={16} /> Generate New Quiz
          </button>
          <button className="btn btn-outline" onClick={reset}>← Change Subject</button>
        </div>
      </div>
    );
  }
  return null;
}
