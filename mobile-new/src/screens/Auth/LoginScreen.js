import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../store/authSlice";
import { Ionicons } from "@expo/vector-icons";

export default function LoginScreen({ navigation }) {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleLogin = async () => {
    const res = await dispatch(login(form));
    if (login.rejected.match(res)) Alert.alert("Error", res.payload);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.card}>
        <Ionicons name="book" size={48} color="#4A90D9" style={{ alignSelf: "center", marginBottom: 12 }} />
        <Text style={styles.title}>AI Smart Study Planner</Text>
        <Text style={styles.subtitle}>Login to continue</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} placeholder="you@example.com"
          keyboardType="email-address" autoCapitalize="none"
          value={form.email} onChangeText={(v) => setForm({ ...form, email: v })} />

        <Text style={styles.label}>Password</Text>
        <TextInput style={styles.input} placeholder="••••••••"
          secureTextEntry value={form.password}
          onChangeText={(v) => setForm({ ...form, password: v })} />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
          <Text style={styles.btnText}>{loading ? "Logging in..." : "Login"}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Register")} style={{ marginTop: 16 }}>
          <Text style={{ textAlign: "center", color: "#718096" }}>
            Don't have an account? <Text style={{ color: "#4A90D9", fontWeight: "700" }}>Register</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f4f8", justifyContent: "center", padding: 20 },
  card:      { backgroundColor: "#fff", borderRadius: 16, padding: 24 },
  title:     { fontSize: 20, fontWeight: "700", color: "#1E3A5F", textAlign: "center", marginBottom: 4 },
  subtitle:  { fontSize: 14, color: "#718096", textAlign: "center", marginBottom: 24 },
  label:     { fontSize: 13, fontWeight: "600", color: "#1a202c", marginBottom: 6 },
  input:     { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10, padding: 12,
               fontSize: 15, marginBottom: 14, backgroundColor: "#f7fafc" },
  btn:       { backgroundColor: "#4A90D9", borderRadius: 10, padding: 14, alignItems: "center", marginTop: 6 },
  btnText:   { color: "#fff", fontWeight: "700", fontSize: 16 },
  error:     { color: "#e53e3e", fontSize: 13, marginBottom: 8 },
});
