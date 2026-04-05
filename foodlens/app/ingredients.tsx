import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function IngredientsScreen() {
  const router = useRouter();
  const { data } = useLocalSearchParams();

  const parsedData = data ? JSON.parse(data as string) : null;

  // 🔥 NEW FORMAT (array of objects)
  const ingredients = parsedData?.ingredients || [];
  const allergens = parsedData?.matched_allergens || [];
  const warnings = parsedData?.health_warnings || [];

  return (
    <LinearGradient
      colors={["#020617", "#0F172A", "#020617"]}
      style={styles.container}
    >
      <Text style={styles.title}>Ingredient Breakdown</Text>

      <ScrollView contentContainerStyle={styles.list}>
        {ingredients.map((item: any, index: number) => {
          const name = item.original;
          const simple = item.simple;

          let risk = "Safe";

          if (allergens.includes(name)) risk = "Avoid";
          else if (warnings.length > 0) risk = "Caution";

          return (
            <IngredientCard
              key={index}
              name={name}
              simple={simple}
              risk={risk}
            />
          );
        })}
      </ScrollView>

      <Pressable
        style={styles.finalButton}
        onPress={() =>
          router.push({
            pathname: "/result",
            params: { data: JSON.stringify(parsedData) },
          })
        }
      >
        <Text style={styles.finalButtonText}>View Final Result</Text>
      </Pressable>
    </LinearGradient>
  );
}

/* ---------- Ingredient Card ---------- */
function IngredientCard({
  name,
  simple,
  risk,
}: {
  name: string;
  simple: string;
  risk: string;
}) {
  const [expanded, setExpanded] = useState(false);

  const riskColor =
    risk === "Safe"
      ? "#22C55E"
      : risk === "Caution"
      ? "#FACC15"
      : "#EF4444";

  return (
    <Pressable style={styles.card} onPress={() => setExpanded(!expanded)}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.ingredientName}>{name}</Text>

          {/* 🔥 SHOW SIMPLE MEANING */}
          {simple !== name && (
            <Text style={styles.simpleText}>→ {simple}</Text>
          )}
        </View>

        <View style={[styles.riskBadge, { backgroundColor: riskColor }]}>
          <Text style={styles.riskText}>{risk}</Text>
        </View>
      </View>

      {expanded && (
        <Text style={styles.reasonText}>
          {risk === "Safe"
            ? "This ingredient is generally safe."
            : risk === "Caution"
            ? "Consume in moderation based on your health profile."
            : "Avoid this ingredient due to your health conditions."}
        </Text>
      )}

      <Ionicons
        name={expanded ? "chevron-up" : "chevron-down"}
        size={20}
        color="#94A3B8"
        style={styles.chevron}
      />
    </Pressable>
  );
}

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },

  title: {
    color: "#E0F2FE",
    fontSize: 22,
    fontWeight: "700",
    marginTop: 20,
  },

  list: { paddingBottom: 20 },

  card: {
    backgroundColor: "#020617",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#1E293B",
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  ingredientName: {
    color: "#E5E7EB",
    fontSize: 16,
    fontWeight: "600",
  },

  // 🔥 NEW STYLE
  simpleText: {
    color: "#38BDF8",
    fontSize: 14,
    marginTop: 4,
  },

  riskBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },

  riskText: {
    color: "#020617",
    fontWeight: "700",
    fontSize: 12,
  },

  reasonText: {
    color: "#CBD5E1",
    fontSize: 14,
    marginTop: 12,
  },

  chevron: {
    alignSelf: "center",
    marginTop: 8,
  },

  finalButton: {
    backgroundColor: "#0284C7",
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
  },

  finalButtonText: {
    color: "#E0F2FE",
    fontSize: 16,
    fontWeight: "700",
  },
});