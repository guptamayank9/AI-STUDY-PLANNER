import React, { useState, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Switch, Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import {
  requestNotificationPermission,
  scheduleDailyMotivation,
  scheduleStreakReminder,
  scheduleQuizReminder,
  scheduleStudyReminders,
  cancelAllReminders,
  sendTestNotification,
} from "../../services/notifications";
import api from "../../services/api";

export default function NotificationScreen() {
  const { user } = useSelector((s) => s.auth);

  const [settings, setSettings] = useState({
    sessionReminders:  true,
    dailyMotivation:   true,
    streakReminder:    true,
    quizReminder:      false,
    morningHour:       7,
    morningMin:        30,
    eveningHour:       20,
    eveningMin:        0,
  });
  const [saving, setSaving] = useState(false);

  const toggle = (key) => setSettings((s) => ({ ...s, [key]: !s[key] }));

  const applyAll = async () => {
    setSaving(true);
    try {
      await cancelAllReminders();

      if (settings.dailyMotivation)
        await scheduleDailyMotivation(settings.morningHour, settings.morningMin);

      if (settings.streakReminder)
        await scheduleStreakReminder(settings.eveningHour, settings.eveningMin);

      if (settings.quizReminder && user?.subjects?.length)
        await scheduleQuizReminder(user.subjects[0], 18, 0);

      if (settings.sessionReminders) {
        try {
          const { data } = await api.get("/schedule");
          if (data.schedule?.sessions?.length)
            await scheduleStudyReminders(data.schedule.sessions);
        } catch { /* schedule might not exist yet */ }
      }

      Alert.alert("✅ Done!", "Saare notifications set ho gaye. Test notification bhej raha hoon!");
      await sendTestNotification();
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    const granted = await requestNotificationPermission();
    if (!granted) return Alert.alert("Permission denied", "Settings mein notifications on karo.");
    await sendTestNotification();
    Alert.alert("Sent!", "2 seconds mein ek test notification aayega 🔔");
  };

  const handleCancel = async () => {
    await cancelAllReminders();
    Alert.alert("Done", "Saare scheduled notifications cancel ho gaye.");
  };

  const ITEMS = [
    {
      key:  "sessionReminders",
      icon: "alarm",
      color:"#4A90D9",
      title:"Session Reminders",
      desc: "10 min pehle aur session start pe notification",
    },
    {
      key:  "dailyMotivation",
      icon: "sunny",
      color:"#ed8936",
      title:"Morning Motivation",
      desc: `Roz subah ${settings.morningHour}:${String(settings.morningMin).padStart(2,"0")} pe motivational message`,
    },
    {
      key:  "streakReminder",
      icon: "flame",
      color:"#e53e3e",
      title:"Streak Reminder",
      desc: `Shaam ${settings.eveningHour}:00 pe yaad dilata hai — streak bachao!`,
    },
    {
      key:  "quizReminder",
      icon: "help-circle",
      color:"#48bb78",
      title:"Daily Quiz Reminder",
      desc: "Roz shaam 6 baje quiz attempt karne ki reminder",
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <Ionicons name="notifications" size={24} color="#4A90D9" />
        <Text style={styles.pageTitle}>Notifications</Text>
      </View>
      <Text style={styles.sub}>
        AI Study Planner tujhe sahi time pe yaad dilayega — kabhi session miss nahi hoga! 🔔
      </Text>

      {/* Toggle cards */}
      {ITEMS.map((item) => (
        <View key={item.key} style={styles.card}>
          <View style={[styles.iconBox, { backgroundColor: item.color + "20" }]}>
            <Ionicons name={item.icon} size={22} color={item.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDesc}>{item.desc}</Text>
          </View>
          <Switch
            value={settings[item.key]}
            onValueChange={() => toggle(item.key)}
            trackColor={{ false: "#e2e8f0", true: "#4A90D9" }}
            thumbColor="#fff"
          />
        </View>
      ))}

      {/* Time settings */}
      <View style={styles.sectionHeader}>
        <Ionicons name="time" size={16} color="#718096" />
        <Text style={styles.sectionTitle}>Timing Settings</Text>
      </View>

      <View style={styles.timeCard}>
        <Text style={styles.timeLabel}>🌅 Morning notification time</Text>
        <View style={styles.timeRow}>
          {[6, 7, 8, 9].map((h) => (
            <TouchableOpacity key={h}
              onPress={() => setSettings((s) => ({ ...s, morningHour: h }))}
              style={[styles.timeChip, settings.morningHour === h && styles.timeChipOn]}>
              <Text style={[styles.timeChipTxt, settings.morningHour === h && { color: "#fff" }]}>
                {h}:00
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.timeLabel, { marginTop: 14 }]}>🌙 Evening reminder time</Text>
        <View style={styles.timeRow}>
          {[18, 19, 20, 21].map((h) => (
            <TouchableOpacity key={h}
              onPress={() => setSettings((s) => ({ ...s, eveningHour: h }))}
              style={[styles.timeChip, settings.eveningHour === h && styles.timeChipOn]}>
              <Text style={[styles.timeChipTxt, settings.eveningHour === h && { color: "#fff" }]}>
                {h}:00
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Action buttons */}
      <TouchableOpacity style={styles.saveBtn} onPress={applyAll} disabled={saving}>
        <Ionicons name="checkmark-circle" size={20} color="#fff" />
        <Text style={styles.saveBtnTxt}>
          {saving ? "Setting up..." : "Save & Apply Notifications"}
        </Text>
      </TouchableOpacity>

      <View style={styles.btnRow}>
        <TouchableOpacity style={styles.testBtn} onPress={handleTest}>
          <Ionicons name="notifications" size={16} color="#4A90D9" />
          <Text style={styles.testBtnTxt}>Test Notification</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
          <Ionicons name="close-circle" size={16} color="#e53e3e" />
          <Text style={styles.cancelBtnTxt}>Cancel All</Text>
        </TouchableOpacity>
      </View>

      {/* Info */}
      <View style={styles.infoBox}>
        <Ionicons name="information-circle" size={16} color="#185FA5" />
        <Text style={styles.infoTxt}>
          Session reminders automatically update jab bhi tu naya AI schedule generate kare.
          Real device pe kaam karta hai — emulator pe sirf basic notifications.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: "#f0f4f8" },
  pageTitle:    { fontSize: 22, fontWeight: "700", color: "#1E3A5F" },
  sub:          { fontSize: 13, color: "#718096", marginBottom: 22, lineHeight: 18 },
  card:         { backgroundColor: "#fff", borderRadius: 14, padding: 14,
                  flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
  iconBox:      { width: 44, height: 44, borderRadius: 12,
                  alignItems: "center", justifyContent: "center" },
  cardTitle:    { fontSize: 14, fontWeight: "600", color: "#1E3A5F", marginBottom: 2 },
  cardDesc:     { fontSize: 12, color: "#718096", lineHeight: 16 },
  sectionHeader:{ flexDirection: "row", alignItems: "center", gap: 6,
                  marginTop: 20, marginBottom: 10 },
  sectionTitle: { fontSize: 13, fontWeight: "600", color: "#718096" },
  timeCard:     { backgroundColor: "#fff", borderRadius: 14, padding: 16, marginBottom: 20 },
  timeLabel:    { fontSize: 13, fontWeight: "600", color: "#1a202c", marginBottom: 10 },
  timeRow:      { flexDirection: "row", gap: 8 },
  timeChip:     { flex: 1, paddingVertical: 9, borderRadius: 10,
                  borderWidth: 1, borderColor: "#e2e8f0",
                  backgroundColor: "#f7fafc", alignItems: "center" },
  timeChipOn:   { backgroundColor: "#4A90D9", borderColor: "#4A90D9" },
  timeChipTxt:  { fontSize: 13, fontWeight: "600", color: "#555" },
  saveBtn:      { backgroundColor: "#4A90D9", borderRadius: 14, padding: 16,
                  flexDirection: "row", alignItems: "center", justifyContent: "center",
                  gap: 10, marginBottom: 12 },
  saveBtnTxt:   { color: "#fff", fontWeight: "700", fontSize: 15 },
  btnRow:       { flexDirection: "row", gap: 10, marginBottom: 14 },
  testBtn:      { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
                  gap: 6, padding: 12, borderRadius: 12,
                  borderWidth: 1, borderColor: "#4A90D9", backgroundColor: "#EBF4FF" },
  testBtnTxt:   { color: "#4A90D9", fontWeight: "600", fontSize: 13 },
  cancelBtn:    { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
                  gap: 6, padding: 12, borderRadius: 12,
                  borderWidth: 1, borderColor: "#e53e3e", backgroundColor: "#fff5f5" },
  cancelBtnTxt: { color: "#e53e3e", fontWeight: "600", fontSize: 13 },
  infoBox:      { flexDirection: "row", gap: 8, backgroundColor: "#EBF4FF",
                  padding: 12, borderRadius: 10, marginBottom: 20 },
  infoTxt:      { fontSize: 12, color: "#185FA5", flex: 1, lineHeight: 17 },
});
