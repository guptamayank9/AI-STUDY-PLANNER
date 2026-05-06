import React, { useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { fetchSchedule, completeSession, generateSchedule } from "../../store/scheduleSlice";
import { Ionicons } from "@expo/vector-icons";

export default function ScheduleScreen() {
  const dispatch = useDispatch();
  const { schedule, loading, generating } = useSelector((s) => s.schedule);

  useEffect(() => { dispatch(fetchSchedule()); }, []);

  const handleComplete = (sessionId) => {
    if (!schedule?._id) return;
    dispatch(completeSession({ scheduleId: schedule._id, sessionId }));
  };

  const completed = schedule?.sessions?.filter((s) => s.completed).length || 0;
  const total     = schedule?.sessions?.length || 0;

  return (
    <View style={{ flex: 1, backgroundColor: "#f0f4f8" }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Today's Schedule</Text>
        <TouchableOpacity style={styles.regenBtn}
          onPress={() => dispatch(generateSchedule())} disabled={generating}>
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>
            {generating ? "..." : "🤖 Regen"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Progress bar */}
      {total > 0 && (
        <View style={styles.progressCard}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
            <Text style={{ fontWeight: "600", color: "#1E3A5F" }}>Daily Progress</Text>
            <Text style={{ color: "#4A90D9", fontWeight: "700" }}>
              {completed}/{total} ({Math.round((completed / total) * 100)}%)
            </Text>
          </View>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${(completed / total) * 100}%` }]} />
          </View>
        </View>
      )}

      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 4 }}>
        {!schedule?.sessions?.length ? (
          <View style={styles.empty}>
            <Ionicons name="book-outline" size={48} color="#cbd5e0" />
            <Text style={{ color: "#718096", marginTop: 12, textAlign: "center" }}>
              No schedule yet. Tap Regen to create one.
            </Text>
          </View>
        ) : (
          schedule.sessions.map((session, i) => (
            <View key={session._id || i} style={[
              styles.sessionCard,
              { borderLeftColor: session.priority === "high" ? "#fc8181"
                               : session.priority === "medium" ? "#ed8936" : "#48bb78" },
              session.completed && { opacity: 0.55 }
            ]}>
              <View style={styles.timeBox}>
                <Text style={styles.timeText}>{session.startTime}</Text>
                <Text style={styles.timeEnd}>{session.endTime}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.subject}>{session.subject}</Text>
                <Text style={styles.topic}>{session.topic}</Text>
                <Text style={styles.duration}>{session.duration} min · {session.priority} priority</Text>
              </View>
              {!session.completed ? (
                <TouchableOpacity style={styles.doneBtn} onPress={() => handleComplete(session._id)}>
                  <Text style={{ color: "#4A90D9", fontSize: 12, fontWeight: "600" }}>Done</Text>
                </TouchableOpacity>
              ) : (
                <Ionicons name="checkmark-circle" size={24} color="#48bb78" />
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header:       { backgroundColor: "#1E3A5F", padding: 16, flexDirection: "row",
                  justifyContent: "space-between", alignItems: "center" },
  headerTitle:  { fontSize: 18, fontWeight: "700", color: "#fff" },
  regenBtn:     { backgroundColor: "#4A90D9", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  progressCard: { backgroundColor: "#fff", margin: 16, marginBottom: 0, padding: 14, borderRadius: 12 },
  progressBg:   { backgroundColor: "#e2e8f0", borderRadius: 6, height: 10 },
  progressFill: { backgroundColor: "#4A90D9", borderRadius: 6, height: 10, transition: "width 0.3s" },
  empty:        { alignItems: "center", marginTop: 80 },
  sessionCard:  { backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 10,
                  flexDirection: "row", alignItems: "center", gap: 12,
                  borderLeftWidth: 4 },
  timeBox:      { alignItems: "center", minWidth: 52 },
  timeText:     { fontSize: 15, fontWeight: "700", color: "#4A90D9" },
  timeEnd:      { fontSize: 11, color: "#718096" },
  subject:      { fontWeight: "700", fontSize: 15, color: "#1E3A5F" },
  topic:        { fontSize: 13, color: "#555", marginTop: 2 },
  duration:     { fontSize: 11, color: "#718096", marginTop: 3 },
  doneBtn:      { borderWidth: 1, borderColor: "#4A90D9", paddingHorizontal: 10,
                  paddingVertical: 5, borderRadius: 20 },
});
