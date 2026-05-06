import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "../../services/api";

const QUICK = [
  "Study tips?",
  "My weak subjects?",
  "How does spaced repetition work?",
  "How is my schedule made?",
];

export default function ChatScreen() {
  const [messages, setMessages] = useState([
    { id: "0", role: "assistant", text: "Hi! I'm your AI study assistant 🎓\nAsk me about your schedule, weak subjects, or study tips!" }
  ]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const flatRef = useRef(null);

  useEffect(() => {
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");

    const userMsg = { id: Date.now().toString(), role: "user", text: msg };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.text }));
      const { data } = await api.post("/chat", { message: msg, history });
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(), role: "assistant", text: data.reply
      }]);
    } catch {
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(), role: "assistant",
        text: "Sorry, I'm having trouble responding. Please try again."
      }]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }) => (
    <View style={[
      styles.bubble,
      item.role === "user" ? styles.userBubble : styles.botBubble
    ]}>
      <Text style={[
        styles.bubbleText,
        item.role === "user" ? { color: "#fff" } : { color: "#1a202c" }
      ]}>{item.text}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#f0f4f8" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="bulb" size={20} color="#4A90D9" />
        </View>
        <View>
          <Text style={styles.headerName}>AI Study Assistant</Text>
          <Text style={styles.headerStatus}>● Online</Text>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatRef}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={renderMessage}
        contentContainerStyle={{ padding: 16, gap: 8 }}
        ListFooterComponent={loading
          ? <View style={styles.typingIndicator}>
              {[0, 1, 2].map((i) => (
                <View key={i} style={[styles.dot, { opacity: 0.4 + i * 0.2 }]} />
              ))}
            </View>
          : null}
      />

      {/* Quick replies */}
      <View style={styles.quickRow}>
        {QUICK.map((q) => (
          <TouchableOpacity key={q} onPress={() => sendMessage(q)} style={styles.quickBtn}>
            <Text style={styles.quickText}>{q}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Input bar */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Ask anything..."
          value={input}
          onChangeText={setInput}
          onSubmitEditing={() => sendMessage()}
          returnKeyType="send"
          editable={!loading}
        />
        <TouchableOpacity style={styles.sendBtn}
          onPress={() => sendMessage()} disabled={loading || !input.trim()}>
          {loading
            ? <ActivityIndicator color="#fff" size="small" />
            : <Ionicons name="send" size={18} color="#fff" />}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header:          { backgroundColor: "#1E3A5F", flexDirection: "row",
                     alignItems: "center", padding: 14, gap: 12 },
  avatar:          { width: 38, height: 38, borderRadius: 19,
                     backgroundColor: "#EBF4FF", justifyContent: "center", alignItems: "center" },
  headerName:      { color: "#fff", fontWeight: "700", fontSize: 15 },
  headerStatus:    { color: "#48bb78", fontSize: 12, marginTop: 1 },
  bubble:          { maxWidth: "78%", padding: 12, borderRadius: 16 },
  userBubble:      { backgroundColor: "#4A90D9", alignSelf: "flex-end",
                     borderBottomRightRadius: 4 },
  botBubble:       { backgroundColor: "#fff", alignSelf: "flex-start",
                     borderBottomLeftRadius: 4 },
  bubbleText:      { fontSize: 14, lineHeight: 20 },
  typingIndicator: { flexDirection: "row", gap: 5, padding: 12,
                     backgroundColor: "#fff", borderRadius: 16, alignSelf: "flex-start",
                     marginLeft: 16, marginBottom: 8 },
  dot:             { width: 8, height: 8, borderRadius: 4, backgroundColor: "#4A90D9" },
  quickRow:        { flexDirection: "row", flexWrap: "wrap", gap: 8,
                     paddingHorizontal: 12, paddingVertical: 8, backgroundColor: "#fff" },
  quickBtn:        { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
                     borderWidth: 1, borderColor: "#4A90D9" },
  quickText:       { color: "#4A90D9", fontSize: 12, fontWeight: "500" },
  inputRow:        { flexDirection: "row", padding: 12, backgroundColor: "#fff",
                     gap: 10, alignItems: "center" },
  input:           { flex: 1, borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 24,
                     paddingHorizontal: 16, paddingVertical: 10, fontSize: 14,
                     backgroundColor: "#f7fafc" },
  sendBtn:         { backgroundColor: "#4A90D9", width: 42, height: 42,
                     borderRadius: 21, justifyContent: "center", alignItems: "center" },
});
