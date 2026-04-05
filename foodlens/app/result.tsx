import { View, Text, StyleSheet, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function ResultScreen() {
  const router = useRouter();
  const { data } = useLocalSearchParams();

  const parsedData = data ? JSON.parse(data as string) : null;

  const result = parsedData?.final_result || "SAFE";
  const allergens = parsedData?.matched_allergens || [];
  const warnings = parsedData?.health_warnings || [];

  // 🎨 Dynamic Color + Icon
  const getResultStyle = () => {
    if (result === "SAFE") {
      return {
        color: "#22C55E",
        icon: "checkmark-circle",
      };
    } else if (result === "CAUTION") {
      return {
        color: "#FACC15",
        icon: "warning",
      };
    } else {
      return {
        color: "#EF4444",
        icon: "alert-circle",
      };
    }
  };

  const { color, icon } = getResultStyle();

  // 🧠 Dynamic Reason
  const getReason = () => {
    if (result === "SAFE") {
      return "This product is safe for your consumption based on your profile.";
    }

    if (result === "CAUTION") {
      return `Be careful. ${warnings.join(", ") || "Some ingredients may affect your health."}`;
    }

    return `Avoid this product. Detected allergens: ${allergens.join(", ")}`;
  };

  return (
    <LinearGradient
      colors={["#020617", "#0F172A", "#020617"]}
      style={styles.container}
    >
      <Ionicons name={icon as any} size={90} color={color} />

      <Text style={[styles.verdict, { color }]}>
        {result}
      </Text>

      <Text style={styles.reason}>{getReason()}</Text>

      <Pressable
        style={styles.backButton}
        onPress={() => router.replace("/")}
      >
        <Text style={styles.backText}>Go to Home</Text>
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  verdict: {
    fontSize: 32,
    fontWeight: "800",
    marginTop: 20,
  },
  reason: {
    color: "#CBD5E1",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginTop: 20,
  },
  backButton: {
    marginTop: 30,
    backgroundColor: "#0284C7",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  backText: {
    color: "#E0F2FE",
    fontSize: 16,
    fontWeight: "700",
  },
});