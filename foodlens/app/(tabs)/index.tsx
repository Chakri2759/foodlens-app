import { View, Text, StyleSheet, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={["#020617", "#0F172A", "#020617"]}
      style={styles.container}
    >
      {/* App Icon */}
      <Ionicons
        name="scan-circle-outline"
        size={90}
        color="#38BDF8"
        style={{ marginBottom: 20 }}
      />

      {/* App Title */}
      <Text style={styles.title}>FoodLens</Text>
      <Text style={styles.subtitle}>Smart Ingredient Insight</Text>

      {/* Description */}
      <Text style={styles.description}>
        Scan packaged food labels and understand ingredients with scientific
        clarity and personalized health insights.
      </Text>

      {/* Buttons */}
      <View style={styles.buttonGroup}>
        <Pressable
          style={styles.primaryButton}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.primaryText}>Login</Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => router.push("/signup")}
        >
          <Text style={styles.secondaryText}>Sign Up</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    color: "#E0F2FE",
    fontSize: 36,
    fontWeight: "800",
  },
  subtitle: {
    color: "#93C5FD",
    fontSize: 16,
    marginTop: 6,
    letterSpacing: 1,
  },
  description: {
    color: "#CBD5E1",
    fontSize: 14,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 40,
    lineHeight: 22,
  },
  buttonGroup: {
    width: "100%",
    gap: 16,
  },
  primaryButton: {
    backgroundColor: "#0284C7",
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
  },
  primaryText: {
    color: "#E0F2FE",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    borderWidth: 1.5,
    borderColor: "#38BDF8",
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
  },
  secondaryText: {
    color: "#38BDF8",
    fontSize: 16,
    fontWeight: "700",
  },
});
