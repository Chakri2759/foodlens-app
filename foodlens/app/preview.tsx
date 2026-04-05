import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import * as ImageManipulator from "expo-image-manipulator";

import * as FileSystem from "expo-file-system/legacy";

const API_BASE = (
  process.env.EXPO_PUBLIC_API_URL ??
  "https://untrifling-disreputably-maryjo.ngrok-free.dev"
).replace(/\/$/, "");

const SCAN_TIMEOUT_MS = 60000; // 🔥 safer timeout

function pickParam(v: string | string[] | undefined): string | undefined {
  if (v == null) return undefined;
  return Array.isArray(v) ? v[0] : v;
}

export default function PreviewScreen() {
  const params = useLocalSearchParams<{ uri: string; user_id: string }>();
  const uri = pickParam(params.uri);
  const userId = pickParam(params.user_id);
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!uri || !userId) {
      alert("Missing image or user. Try logging in again.");
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      // 🔥 STEP 1: Ensure file exists
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        alert("Image not found. Please retake.");
        setLoading(false);
        return;
      }

      // 🔥 STEP 2: Copy to safe location (VERY IMPORTANT FIX)
      const safeUri = FileSystem.documentDirectory + "scan.jpg";

      await FileSystem.copyAsync({
        from: uri,
        to: safeUri,
      });

      // 🔥 STEP 3: Compress image
      const compressed = await ImageManipulator.manipulateAsync(
        safeUri,
        [{ resize: { width: 800 } }],
        {
          compress: 0.6,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      // 🔥 STEP 4: Prepare form data
      const formData = new FormData();
      formData.append("file", {
        uri: compressed.uri,
        name: "scan.jpg",
        type: "image/jpeg",
      } as any);

      formData.append("user_id", userId);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), SCAN_TIMEOUT_MS);

      // 🔥 STEP 5: API call
      const response = await fetch(`${API_BASE}/scan`, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        alert(data?.detail || "Server error");
        return;
      }

      if (data.error) {
        alert(data.error);
        return;
      }

      // 🔥 Navigate
      router.push({
        pathname: "/ingredients",
        params: {
          data: JSON.stringify(data),
        },
      });

    } catch (error) {
      console.error("ANALYZE ERROR:", error);

      if (error instanceof Error && error.name === "AbortError") {
        alert("Request timeout. Try again.");
      } else {
        alert("Failed to analyze image. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#020617", "#0F172A", "#1E3A8A"]}
      style={styles.container}
    >
      <Text style={styles.title}>Preview Image</Text>

      {/* 🔥 SAFE IMAGE DISPLAY */}
      {uri ? (
        <Image source={{ uri }} style={styles.image} />
      ) : (
        <Text style={{ color: "red" }}>Image not available</Text>
      )}

      {loading && <ActivityIndicator size="large" color="#38BDF8" />}

      <View style={styles.actions}>
        <Pressable style={styles.retakeButton} onPress={() => router.back()}>
          <Ionicons name="refresh" size={22} color="#38BDF8" />
          <Text style={styles.retakeText}>Retake</Text>
        </Pressable>

        <Pressable style={styles.analyzeButton} onPress={handleAnalyze}>
          <Ionicons name="scan" size={20} color="#fff" />
          <Text style={styles.analyzeText}>Analyze</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: "center" },

  title: {
    color: "#E0F2FE",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 20,
  },

  image: {
    width: "100%",
    height: "65%",
    borderRadius: 16,
    resizeMode: "contain",
    backgroundColor: "#020617",
  },

  actions: { flexDirection: "row", marginTop: 30, gap: 20 },

  retakeButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#38BDF8",
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 30,
  },

  retakeText: {
    color: "#38BDF8",
    fontSize: 16,
    marginLeft: 8,
    fontWeight: "600",
  },

  analyzeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0284C7",
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 30,
  },

  analyzeText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 8,
    fontWeight: "600",
  },
});