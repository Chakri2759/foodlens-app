import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Enter all fields");
      return;
    }

    try {
      // ✅ FIXED FETCH SYNTAX
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      // 🔍 Get raw response
      const text = await res.text();
      console.log("RAW RESPONSE:", text);

      // 🔐 Safe JSON parsing
      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.log("JSON Parse Error:", err);
        alert("Server is not returning valid JSON");
        return;
      }

      // ❌ Handle API errors
      if (!res.ok) {
        alert(data.detail || data.message || "Login failed");
        return;
      }

      // ✅ Validate response
      const userId = data?.user?._id;

      if (!userId) {
        alert("Invalid response from server");
        return;
      }

      console.log("USER ID:", userId);

      // 💾 Store user ID
      await AsyncStorage.setItem("user_id", userId);

      // 🚀 Navigate
      router.replace("/(tabs)/scan");

    } catch (err) {
      console.log("NETWORK ERROR:", err);
      alert("Network error. Check backend or IP.");
    }
  };

  return (
    <LinearGradient colors={["#020617", "#0F172A"]} style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor="#94A3B8"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor="#94A3B8"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />

      <Pressable style={styles.btn} onPress={handleLogin}>
        <Text style={styles.txt}>Login</Text>
      </Pressable>

      <Pressable onPress={() => router.push("/signup")}>
        <Text style={styles.link}>Create Account</Text>
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    color: "#fff",
    fontSize: 28,
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#020617",
    color: "#fff",
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
  },
  btn: {
    backgroundColor: "#0284C7",
    padding: 14,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 10,
  },
  txt: {
    color: "#fff",
    fontWeight: "600",
  },
  link: {
    color: "#38BDF8",
    marginTop: 15,
    textAlign: "center",
  },
});