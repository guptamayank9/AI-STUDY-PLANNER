import React, { useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { fetchSchedule, generateSchedule } from "../../store/scheduleSlice";
import { Ionicons } from "@expo/vector-icons";

// Safe import — Expo Go mein silently skip karo
let scheduleStudyReminders = async () => {};
let scheduleDailyMotivation = async () => {};
let scheduleStreakReminder   = async () => {};
try {
  const notif = require("../../services/notifications");
  scheduleStudyReminders = notif.scheduleStudyReminders;
  scheduleDailyMotivation = notif.scheduleDailyMotivation;
  scheduleStreakReminder   = notif.scheduleStreakReminder;
} catch (e) {
  console.log("Notifications not available in Expo Go");
}

export default function DashboardScreen() {
  const dispatch = useDispatch();
  const { user }  = useSelector((s) => s.auth);

  const { schedule, generating, loading } = useSelector((s) => s.schedule);

  useEffect(() => {
    dispatch(fetchSchedule());
    // Setup daily recurring notifications on app open
    scheduleDailyMotivation(7, 30);
    scheduleStreakReminder(20, 0);
  }, []);

  const handleGenerate = async () => {
    const res = await dispatch(generateSchedule());
    if (generateSchedule.rejected.match(res)) {
      Alert.alert("Error", "Schedule generation failed");
    } else {
      Alert.alert("✅ Done", "AI Schedule generate ho gaya! Session reminders bhi set ho gaye 🔔");
      if (res.payload?.sessions?.length) {
        await scheduleStudyReminders(res.payload.sessions);
      }
    }
  };

  const completed = schedule?.sessions?.filter((s) => s.completed).length || 0;
  const total     = schedule?.sessions?.length || 0;
  const pct       = total ? Math.round((completed / total) * 100) : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      {/* Greeting */}
      <Text style={styles.greeting}>Good morning, {user?.name?.split(" ")[0]} 👋</Text>
      <Text style={styles.subtitle}>Here's your study overview</Text>

      {/* Stat cards */}
      <View style={styles.statsRow}>
        {[
          { label: "Sessions",  value: `${completed}/${total}`, icon: "calendar",   color: "#4A90D9" },
          { label: "Done",      value: `${pct}%`,               icon: "checkmark",  color: "#48bb78" },
          { label: "Streak",    value: `${user?.streak || 0}d`, icon: "flash",      color: "#ed8936" },
          { label: "Points",    value: user?.totalPoints || 0,  icon: "star",       color: "#9f7aea" },
        ].map(({ label, value, icon, color }) => (
          <View key={label} style={styles.statCard}>
            <Ionicons name={icon} size={22} color={color} />
            <Text style={[styles.statValue, { color }]}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
          </View>
        ))}
      </View>

      {/* AI Generate Button */}
      <TouchableOpacity style={styles.generateBtn} onPress={handleGenerate} disabled={generating}>
        {generating
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.generateBtnText}>🤖 Generate AI Schedule</Text>}
      </TouchableOpacity>

      {/* Progress */}
      {total > 0 && (
        <View style={styles.card}>
          <View style={styles.progressHeader}>
            <Text style={styles.cardTitle}>Today's Progress</Text>
            <Text style={{ color: "#4A90D9", fontWeight: "700" }}>{pct}%</Text>
          </View>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${pct}%` }]} />
          </View>
        </View>
      )}

      {/* Session Preview */}
      {schedule?.sessions?.slice(0, 4).map((session, i) => (
        <View key={i} style={[styles.sessionCard, session.completed && styles.sessionDone]}>
          <View>
            <Text style={styles.sessionSubject}>{session.subject}</Text>
            <Text style={styles.sessionTopic}>{session.topic}</Text>
            <Text style={styles.sessionTime}>{session.startTime} – {session.endTime}</Text>
          </View>
          <View style={[styles.priorityBadge, styles[`priority_${session.priority}`]]}>
            <Text style={styles.priorityText}>{session.priority}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: "#f0f4f8" },
  greeting:       { fontSize: 22, fontWeight: "700", color: "#1E3A5F", marginBottom: 4 },
  subtitle:       { fontSize: 14, color: "#718096", marginBottom: 20 },
  statsRow:       { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  statCard:       { flex: 1, backgroundColor: "#fff", borderRadius: 12, padding: 12,
                    alignItems: "center", marginHorizontal: 4, gap: 4 },
  statValue:      { fontSize: 18, fontWeight: "700" },
  statLabel:      { fontSize: 11, color: "#718096" },
  generateBtn:    { backgroundColor: "#4A90D9", borderRadius: 12, padding: 16,
                    alignItems: "center", marginBottom: 16 },
  generateBtnText:{ color: "#fff", fontWeight: "700", fontSize: 16 },
  card:           { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 12 },
  cardTitle:      { fontWeight: "600", fontSize: 15, color: "#1E3A5F" },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  progressBg:     { backgroundColor: "#e2e8f0", borderRadius: 6, height: 10 },
  progressFill:   { backgroundColor: "#4A90D9", borderRadius: 6, height: 10 },
  sessionCard:    { backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 8,
                    flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sessionDone:    { opacity: 0.55 },
  sessionSubject: { fontWeight: "700", fontSize: 15, color: "#1E3A5F" },
  sessionTopic:   { fontSize: 13, color: "#555", marginTop: 2 },
  sessionTime:    { fontSize: 12, color: "#718096", marginTop: 2 },
  priorityBadge:  { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  priorityText:   { fontSize: 12, fontWeight: "600" },
  priority_high:  { backgroundColor: "#fed7d7" },
  priority_medium:{ backgroundColor: "#feebc8" },
  priority_low:   { backgroundColor: "#c6f6d5" },
});
