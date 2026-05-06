import React, { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator
} from "react-native";
import { useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import api from "../../services/api";

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
};

export default function QuizScreen() {
  const { user } = useSelector((s) => s.auth);
  const [subject,    setSubject]    = useState("");
  const [topic,      setTopic]      = useState("General");
  const [difficulty, setDifficulty] = useState("medium");
  const [numQ,       setNumQ]       = useState(5);
  const [questions,  setQuestions]  = useState([]);
  const [answers,    setAnswers]    = useState({});
  const [result,     setResult]     = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [source,     setSource]     = useState("");

  const startQuiz = async () => {
    if (!subject) return Alert.alert("Koi subject choose karo pehle!");
    setLoading(true);
    try {
      // Backend proxy use karo — seedha ML se nahi
      const { data } = await api.post("/quiz/generate", {
        subject, topic, difficulty, num_questions: numQ,
      });
      setQuestions(data.questions);
      setSource(data.source);
      setAnswers({});
      setResult(null);
    } catch (err) {
      Alert.alert("Error", "Quiz generate nahi hua. Backend chal raha hai?");
    } finally {
      setLoading(false);
    }
  };

  const submitQuiz = async () => {
    if (Object.keys(answers).length < questions.length)
      return Alert.alert("Incomplete", "Saare questions answer karo!");
    const answerArr = questions.map((q, i) => ({
      question: q.q, selected: answers[i],
      correct: q.answer, isCorrect: answers[i] === q.answer,
    }));
    try {
      const { data } = await api.post("/quiz/submit", { subject, topic, answers: answerArr, timeTaken: 0 });
      setResult({ ...data, explanations: questions.map((q) => q.explanation) });
    } catch { Alert.alert("Error", "Submit failed"); }
  };

  // ── SETUP VIEW ───────────────────────────────────────────────────────────
  if (!questions.length && !result) return (
    <ScrollView style={S.container} contentContainerStyle={{ padding: 20 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <Ionicons name="sparkles" size={24} color="#4A90D9" />
        <Text style={S.pageTitle}>AI Quiz Generator</Text>
      </View>
      <Text style={S.sub}>AI khud questions banata hai — tujhe kuch likhna nahi padega! 🤖</Text>

      <Text style={S.label}>Subject</Text>
      <View style={S.row}>
        {(user?.subjects || ["DSA","Mathematics","Physics"]).map((s) => (
          <TouchableOpacity key={s} onPress={() => { setSubject(s); setTopic("General"); }}
            style={[S.chip, subject === s && S.chipOn]}>
            <Text style={[S.chipTxt, subject === s && S.chipTxtOn]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {subject ? (<>
        <Text style={S.label}>Topic</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 18 }}>
          {["General", ...(TOPICS[subject] || [])].map((t) => (
            <TouchableOpacity key={t} onPress={() => setTopic(t)}
              style={[S.chip, topic === t && S.chipOn, { marginRight: 8 }]}>
              <Text style={[S.chipTxt, topic === t && S.chipTxtOn]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </>) : null}

      <Text style={S.label}>Difficulty</Text>
      <View style={[S.row, { marginBottom: 20 }]}>
        {DIFFICULTIES.map((d) => (
          <TouchableOpacity key={d.value} onPress={() => setDifficulty(d.value)}
            style={[S.diffBtn, {
              backgroundColor: difficulty === d.value ? d.color : "#fff",
              borderColor: d.color,
            }]}>
            <Text style={{ color: difficulty === d.value ? "#fff" : d.color, fontWeight: "700", fontSize: 13 }}>
              {d.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={S.label}>Questions: {numQ}</Text>
      <View style={[S.row, { marginBottom: 24 }]}>
        {[3, 5, 7, 10].map((n) => (
          <TouchableOpacity key={n} onPress={() => setNumQ(n)}
            style={[S.chip, numQ === n && S.chipOn]}>
            <Text style={[S.chipTxt, numQ === n && S.chipTxtOn]}>{n} Qs</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={[S.genBtn, (!subject || loading) && { opacity: 0.6 }]}
        onPress={startQuiz} disabled={!subject || loading}>
        {loading
          ? <><ActivityIndicator color="#fff" /><Text style={S.genBtnTxt}>  Generating...</Text></>
          : <><Ionicons name="sparkles" size={18} color="#fff" /><Text style={S.genBtnTxt}>  Generate AI Quiz</Text></>}
      </TouchableOpacity>

      <View style={{ flexDirection: "row", gap: 8, backgroundColor: "#EBF4FF", padding: 12, borderRadius: 10 }}>
        <Ionicons name="information-circle" size={16} color="#185FA5" />
        <Text style={{ fontSize: 12, color: "#185FA5", flex: 1, lineHeight: 17 }}>
          OpenAI API key set hai toh fresh questions milenge, warna curated bank se milenge.
        </Text>
      </View>
    </ScrollView>
  );

  // ── QUESTIONS VIEW ───────────────────────────────────────────────────────
  if (questions.length && !result) return (
    <ScrollView style={S.container} contentContainerStyle={{ padding: 16 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <View>
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#1E3A5F" }}>{subject} · {topic}</Text>
          <Text style={{ fontSize: 12, color: "#718096" }}>{questions.length} questions · {difficulty}</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4,
          backgroundColor: source === "ai-generated" ? "#EBF4FF" : "#EAF3DE",
          paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 }}>
          <Ionicons name={source === "ai-generated" ? "sparkles" : "library"} size={12}
            color={source === "ai-generated" ? "#185FA5" : "#3B6D11"} />
          <Text style={{ fontSize: 11, fontWeight: "600",
            color: source === "ai-generated" ? "#185FA5" : "#3B6D11" }}>
            {source === "ai-generated" ? "AI Generated" : "Question Bank"}
          </Text>
        </View>
      </View>

      {/* Progress */}
      <View style={{ backgroundColor: "#e2e8f0", borderRadius: 6, height: 6, marginBottom: 14 }}>
        <View style={{ backgroundColor: "#4A90D9", borderRadius: 6, height: 6,
          width: `${(Object.keys(answers).length / questions.length) * 100}%` }} />
      </View>

      {questions.map((q, i) => (
        <View key={i} style={S.qCard}>
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 12 }}>
            <View style={S.qBadge}><Text style={S.qBadgeTxt}>Q{i+1}</Text></View>
            <Text style={S.qText}>{q.q}</Text>
          </View>
          {q.options.map((opt) => (
            <TouchableOpacity key={opt} onPress={() => setAnswers({ ...answers, [i]: opt })}
              style={[S.opt, answers[i] === opt && S.optOn]}>
              <View style={[S.optDot, answers[i] === opt && S.optDotOn]} />
              <Text style={[S.optTxt, answers[i] === opt && { color: "#fff" }]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}

      <TouchableOpacity style={S.submitBtn} onPress={submitQuiz}>
        <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Submit Quiz</Text>
        <Ionicons name="arrow-forward" size={18} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity style={{ alignItems: "center", padding: 10 }}
        onPress={() => { setQuestions([]); setAnswers({}); }}>
        <Text style={{ color: "#718096", fontSize: 13 }}>← Change settings</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  // ── RESULTS VIEW ─────────────────────────────────────────────────────────
  if (result) {
    const score = result.result.score;
    return (
      <ScrollView style={S.container} contentContainerStyle={{ padding: 20 }}>
        <View style={[S.scoreCard, { borderTopColor: score >= 70 ? "#48bb78" : "#e53e3e" }]}>
          <Text style={{ fontSize: 38 }}>{score >= 80 ? "🏆" : score >= 60 ? "👍" : "💪"}</Text>
          <Text style={{ fontSize: 50, fontWeight: "700", color: score >= 70 ? "#48bb78" : "#e53e3e" }}>
            {score}%
          </Text>
          <Text style={{ fontSize: 14, color: "#718096" }}>
            {result.result.correctAnswers}/{result.result.totalQuestions} correct
          </Text>
          <Text style={{ color: "#9f7aea", fontWeight: "700", marginTop: 4 }}>
            +{result.pointsEarned} points 🏆
          </Text>
        </View>

        <Text style={[S.label, { marginBottom: 10 }]}>Detailed Review</Text>
        {result.result.answers.map((a, i) => (
          <View key={i} style={[S.reviewCard, { borderLeftColor: a.isCorrect ? "#48bb78" : "#e53e3e" }]}>
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 4 }}>
              <Ionicons name={a.isCorrect ? "checkmark-circle" : "close-circle"} size={18}
                color={a.isCorrect ? "#48bb78" : "#e53e3e"} />
              <Text style={{ fontSize: 13, fontWeight: "600", color: "#1E3A5F", flex: 1, lineHeight: 18 }}>
                {a.question}
              </Text>
            </View>
            {!a.isCorrect && (
              <View style={{ flexDirection: "row", flexWrap: "wrap", marginLeft: 26 }}>
                <Text style={{ fontSize: 12, color: "#718096" }}>Tumhara: </Text>
                <Text style={{ fontSize: 12, color: "#e53e3e", fontWeight: "700" }}>{a.selected}  </Text>
                <Text style={{ fontSize: 12, color: "#718096" }}>Sahi: </Text>
                <Text style={{ fontSize: 12, color: "#48bb78", fontWeight: "700" }}>{a.correct}</Text>
              </View>
            )}
            {result.explanations?.[i] && (
              <View style={{ flexDirection: "row", gap: 6, marginTop: 8, marginLeft: 26,
                backgroundColor: "#FAEEDA", padding: 8, borderRadius: 8 }}>
                <Ionicons name="bulb" size={13} color="#ed8936" />
                <Text style={{ fontSize: 12, color: "#633806", flex: 1, lineHeight: 17 }}>
                  {result.explanations[i]}
                </Text>
              </View>
            )}
          </View>
        ))}

        <TouchableOpacity style={S.genBtn} onPress={startQuiz}>
          <Ionicons name="sparkles" size={18} color="#fff" />
          <Text style={S.genBtnTxt}>  Generate New Quiz</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ alignItems: "center", padding: 12 }}
          onPress={() => { setQuestions([]); setResult(null); setSubject(""); }}>
          <Text style={{ color: "#4A90D9", fontWeight: "600" }}>← Change Subject</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }
  return null;
}

const S = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f4f8" },
  pageTitle: { fontSize: 22, fontWeight: "700", color: "#1E3A5F" },
  sub:       { fontSize: 13, color: "#718096", marginBottom: 22, lineHeight: 18 },
  label:     { fontSize: 13, fontWeight: "600", color: "#1a202c", marginBottom: 10 },
  row:       { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  chip:      { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
               borderWidth: 1, borderColor: "#e2e8f0", backgroundColor: "#fff" },
  chipOn:    { backgroundColor: "#4A90D9", borderColor: "#4A90D9" },
  chipTxt:   { fontSize: 13, color: "#555", fontWeight: "500" },
  chipTxtOn: { color: "#fff" },
  diffBtn:   { paddingHorizontal: 20, paddingVertical: 9, borderRadius: 20,
               borderWidth: 1.5, flex: 1, alignItems: "center" },
  genBtn:    { backgroundColor: "#4A90D9", borderRadius: 14, padding: 16,
               flexDirection: "row", alignItems: "center", justifyContent: "center",
               marginBottom: 14 },
  genBtnTxt: { color: "#fff", fontWeight: "700", fontSize: 16 },
  qCard:     { backgroundColor: "#fff", borderRadius: 14, padding: 16, marginBottom: 14 },
  qBadge:    { backgroundColor: "#EBF4FF", width: 28, height: 28, borderRadius: 14,
               alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 },
  qBadgeTxt: { fontSize: 11, fontWeight: "700", color: "#185FA5" },
  qText:     { fontSize: 14, fontWeight: "600", color: "#1E3A5F", flex: 1, lineHeight: 20 },
  opt:       { flexDirection: "row", alignItems: "center", gap: 10, padding: 12,
               borderRadius: 10, borderWidth: 1, borderColor: "#e2e8f0",
               marginBottom: 8, backgroundColor: "#f7fafc" },
  optOn:     { backgroundColor: "#4A90D9", borderColor: "#4A90D9" },
  optDot:    { width: 16, height: 16, borderRadius: 8, borderWidth: 1.5, borderColor: "#cbd5e0", flexShrink: 0 },
  optDotOn:  { backgroundColor: "#fff", borderColor: "#fff" },
  optTxt:    { fontSize: 13, color: "#1a202c", flex: 1 },
  submitBtn: { backgroundColor: "#1E3A5F", borderRadius: 14, padding: 16,
               flexDirection: "row", alignItems: "center", justifyContent: "center",
               gap: 8, marginBottom: 12 },
  scoreCard: { backgroundColor: "#fff", borderRadius: 16, padding: 24,
               alignItems: "center", marginBottom: 20, borderTopWidth: 4 },
  reviewCard:{ backgroundColor: "#fff", borderRadius: 12, padding: 14,
               marginBottom: 10, borderLeftWidth: 4 },
});
