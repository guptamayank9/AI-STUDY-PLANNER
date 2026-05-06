import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert
} from "react-native";
import { useDispatch } from "react-redux";
import { register } from "../../store/authSlice";

const SUBJECTS = ["Mathematics", "Physics", "Chemistry", "DSA", "DBMS", "OS", "CN"];

export default function RegisterScreen({ navigation }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    name: "", email: "", password: "",
    subjects: [], examDate: "", studyHoursPerDay: 4,
  });

  const toggleSubject = (s) =>
    setForm((f) => ({
      ...f,
      subjects: f.subjects.includes(s) ? f.subjects.filter((x) => x !== s) : [...f.subjects, s],
    }));

  const handleRegister = async () => {
    if (!form.subjects.length) return Alert.alert("Error", "Select at least one subject");
    const res = await dispatch(register(form));
    if (register.rejected.match(res)) Alert.alert("Error", res.payload);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.title}>Create Account</Text>

      {[
        { label: "Full Name", key: "name",     placeholder: "Mayank Sharma",    secure: false },
        { label: "Email",     key: "email",    placeholder: "you@example.com",  secure: false },
        { label: "Password",  key: "password", placeholder: "Min 6 characters", secure: true  },
      ].map(({ label, key, placeholder, secure }) => (
        <View key={key}>
          <Text style={styles.label}>{label}</Text>
          <TextInput style={styles.input} placeholder={placeholder}
            secureTextEntry={secure} autoCapitalize="none"
            value={form[key]} onChangeText={(v) => setForm({ ...form, [key]: v })} />
        </View>
      ))}

      <Text style={styles.label}>Select Subjects</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {SUBJECTS.map((s) => (
          <TouchableOpacity key={s} onPress={() => toggleSubject(s)} style={[
            styles.subjectBtn,
            form.subjects.includes(s) && styles.subjectBtnActive
          ]}>
            <Text style={[styles.subjectText, form.subjects.includes(s) && styles.subjectTextActive]}>
              {s}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Study Hours Per Day</Text>
      <TextInput style={styles.input} keyboardType="numeric"
        value={String(form.studyHoursPerDay)}
        onChangeText={(v) => setForm({ ...form, studyHoursPerDay: Number(v) })} />

      <TouchableOpacity style={styles.btn} onPress={handleRegister}>
        <Text style={styles.btnText}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Login")} style={{ marginTop: 16 }}>
        <Text style={{ textAlign: "center", color: "#718096" }}>
          Already have an account? <Text style={{ color: "#4A90D9", fontWeight: "700" }}>Login</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:         { flex: 1, backgroundColor: "#f0f4f8" },
  title:             { fontSize: 22, fontWeight: "700", color: "#1E3A5F", marginBottom: 20, textAlign: "center" },
  label:             { fontSize: 13, fontWeight: "600", color: "#1a202c", marginBottom: 6 },
  input:             { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10, padding: 12,
                       fontSize: 15, marginBottom: 14, backgroundColor: "#fff" },
  btn:               { backgroundColor: "#4A90D9", borderRadius: 10, padding: 14, alignItems: "center", marginTop: 4 },
  btnText:           { color: "#fff", fontWeight: "700", fontSize: 16 },
  subjectBtn:        { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
                       borderWidth: 1, borderColor: "#e2e8f0", backgroundColor: "#fff" },
  subjectBtnActive:  { backgroundColor: "#4A90D9", borderColor: "#4A90D9" },
  subjectText:       { fontSize: 13, color: "#555", fontWeight: "500" },
  subjectTextActive: { color: "#fff" },
});
