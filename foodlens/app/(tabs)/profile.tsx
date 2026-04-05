import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Pressable,
  Animated,
  Easing,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useState, useEffect, useRef, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

const HEALTH_ISSUES = [
  "None",
  "Diabetes",
  "High Blood Pressure",
  "Heart Disease",
  "Food Allergies",
  "Asthma",
  "Other",
];

const GENDERS = ["Male", "Female", "Other"];

/* ─── Animated Profile Item ─── */
function ProfileItem({
  label,
  value,
  icon,
  delay = 0,
}: {
  label: string;
  value: string;
  icon: string;
  delay?: number;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 500,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.profileItem, { opacity, transform: [{ translateY }] }]}>
      <View style={styles.profileItemIconWrap}>
        <Ionicons name={icon as any} size={16} color="#38BDF8" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.profileItemLabel}>{label}</Text>
        <Text style={styles.profileItemValue}>{value}</Text>
      </View>
      <View style={styles.profileItemDot} />
    </Animated.View>
  );
}

/* ─── Animated Choice Chip ─── */
function ChoiceChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const bg = useRef(new Animated.Value(active ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(bg, {
      toValue: active ? 1 : 0,
      duration: 220,
      useNativeDriver: false,
    }).start();
  }, [active]);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.93, duration: 80, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 180, easing: Easing.out(Easing.back(3)), useNativeDriver: true }),
    ]).start();
    onPress();
  };

  const borderColor = bg.interpolate({ inputRange: [0, 1], outputRange: ["#1E3A5F", "#38BDF8"] });
  const backgroundColor = bg.interpolate({ inputRange: [0, 1], outputRange: ["#0A1628", "#0369A1"] });

  return (
    <Animated.View style={[styles.chip, { borderColor, backgroundColor, transform: [{ scale }] }]}>
      <Pressable onPress={handlePress} style={styles.chipInner}>
        {active && (
          <Ionicons name="checkmark-circle" size={14} color="#7DD3FC" style={{ marginRight: 5 }} />
        )}
        <Text style={[styles.chipText, active && { color: "#E0F2FE" }]}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

/* ─── Main Screen ─── */
export default function ProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [health, setHealth] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [customIssue, setCustomIssue] = useState("");

  /* Animations */
  const headerScale = useRef(new Animated.Value(0.85)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const avatarRotate = useRef(new Animated.Value(0)).current;
  const editSlide = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  /* Avatar pulse glow loop */
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  /* Header entrance */
  const animateHeaderIn = useCallback(() => {
    Animated.parallel([
      Animated.spring(headerScale, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
      Animated.timing(headerOpacity, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  /* Edit mode flip */
  const toggleEdit = () => {
    const toValue = isEditing ? 0 : 1;
    Animated.spring(editSlide, { toValue, tension: 70, friction: 10, useNativeDriver: true }).start();

    /* Spin avatar on toggle */
    Animated.sequence([
      Animated.timing(avatarRotate, { toValue: isEditing ? 0 : 1, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();

    setIsEditing(!isEditing);
  };

  const avatarSpin = avatarRotate.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] });

  /* ── BACKEND (UNCHANGED) ── */
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const userId = await AsyncStorage.getItem("user_id");
        if (!userId) { setError("User not logged in"); setLoading(false); return; }

        const res = await fetch(`http://10.167.188.74:8000/get-user/${userId}`);
        const data = await res.json();

        if (data.error) {
          setError("User not found");
        } else {
          setAge(data.age || "N/A");
          setGender(data.gender || "N/A");
          setHealth(data.health_conditions?.[0] || "None");
        }
      } catch (err) {
        setError("Network error");
      } finally {
        setLoading(false);
        animateHeaderIn();
      }
    };
    loadProfile();
  }, []);

  /* ── LOADING ── */
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#38BDF8" />
        <Text style={[styles.text, { marginTop: 12, letterSpacing: 1.5, fontSize: 12 }]}>
          LOADING PROFILE…
        </Text>
      </View>
    );
  }

  /* ── ERROR ── */
  if (error) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={48} color="#F87171" />
        <Text style={[styles.text, { color: "#F87171", marginTop: 12 }]}>{error}</Text>
      </View>
    );
  }

  /* ── UI ── */
  return (
    <LinearGradient colors={["#020617", "#0A1628", "#020617"]} style={styles.container}>
      {/* Decorative top arc */}
      <View style={styles.topArc} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>

        {/* ── HEADER ── */}
        <Animated.View style={[styles.header, { opacity: headerOpacity, transform: [{ scale: headerScale }] }]}>

          {/* Glow ring */}
          <Animated.View style={[styles.avatarGlow, { opacity: glowOpacity, transform: [{ scale: pulseAnim }] }]} />

          {/* Avatar */}
          <Animated.View style={[styles.avatarRing, { transform: [{ scale: pulseAnim }, { rotate: avatarSpin }] }]}>
            <LinearGradient colors={["#0EA5E9", "#0284C7", "#075985"]} style={styles.avatarGradient}>
              <Ionicons name="person" size={46} color="#E0F2FE" />
            </LinearGradient>
          </Animated.View>

          <Text style={styles.title}>my profile</Text>
          <Text style={styles.subtitle}>Health & Personal Info</Text>

          {/* Edit/Save button */}
          <Pressable onPress={toggleEdit} style={({ pressed }) => [styles.editButton, pressed && { opacity: 0.85 }]}>
            <LinearGradient
              colors={isEditing ? ["#0369A1", "#075985"] : ["#0EA5E9", "#0284C7"]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.editButtonInner}
            >
              <Ionicons name={isEditing ? "save-outline" : "create-outline"} size={15} color="#E0F2FE" />
              <Text style={styles.editText}>{isEditing ? "Save Profile" : "Edit Profile"}</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        {/* ── DIVIDER ── */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerLabel}>{isEditing ? "EDITING" : "OVERVIEW"}</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* ── VIEW MODE ── */}
        {!isEditing && (
          <View style={styles.cardContainer}>
            {/* Stat strip */}
            <View style={styles.statStrip}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{age}</Text>
                <Text style={styles.statKey}>AGE</Text>
              </View>
              <View style={styles.statSep} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{gender === "N/A" ? "—" : gender.slice(0, 1)}</Text>
                <Text style={styles.statKey}>GENDER</Text>
              </View>
              <View style={styles.statSep} />
              <View style={styles.statItem}>
                <Ionicons name="heart-circle" size={22} color={health === "None" ? "#34D399" : "#F59E0B"} />
                <Text style={styles.statKey}>HEALTH</Text>
              </View>
            </View>

            <ProfileItem label="Age" value={age} icon="calendar-outline" delay={0} />
            <ProfileItem label="Gender" value={gender} icon="person-outline" delay={100} />
            <ProfileItem label="Health Condition" value={health} icon="medical-outline" delay={200} />
          </View>
        )}

        {/* ── EDIT MODE ── */}
        {isEditing && (
          <Animated.View style={[styles.editContainer]}>

            {/* Age field */}
            <View style={styles.fieldGroup}>
              <View style={styles.fieldHeader}>
                <Ionicons name="calendar-outline" size={14} color="#38BDF8" />
                <Text style={styles.fieldLabel}>Age</Text>
              </View>
              <TextInput
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
                style={styles.input}
                placeholderTextColor="#475569"
                selectionColor="#38BDF8"
              />
            </View>

            {/* Gender field */}
            <View style={styles.fieldGroup}>
              <View style={styles.fieldHeader}>
                <Ionicons name="person-outline" size={14} color="#38BDF8" />
                <Text style={styles.fieldLabel}>Gender</Text>
              </View>
              <View style={styles.chipRow}>
                {GENDERS.map((g) => (
                  <ChoiceChip key={g} label={g} active={gender === g} onPress={() => setGender(g)} />
                ))}
              </View>
            </View>

            {/* Health field */}
            <View style={styles.fieldGroup}>
              <View style={styles.fieldHeader}>
                <Ionicons name="medical-outline" size={14} color="#38BDF8" />
                <Text style={styles.fieldLabel}>Health Condition</Text>
              </View>
              <View style={styles.healthGrid}>
                {HEALTH_ISSUES.map((issue) => {
                  const active = health === issue;
                  return (
                    <Pressable
                      key={issue}
                      onPress={() => setHealth(issue)}
                      style={[styles.healthChip, active && styles.healthChipActive]}
                    >
                      {active && <View style={styles.healthChipDot} />}
                      <Text style={[styles.healthChipText, active && { color: "#7DD3FC" }]}>
                        {issue}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Custom */}
            {health === "Other" && (
              <View style={styles.fieldGroup}>
                <View style={styles.fieldHeader}>
                  <Ionicons name="pencil-outline" size={14} color="#38BDF8" />
                  <Text style={styles.fieldLabel}>Describe Your Condition</Text>
                </View>
                <TextInput
                  placeholder="e.g. Chronic migraine, Hypothyroidism…"
                  placeholderTextColor="#475569"
                  value={customIssue}
                  onChangeText={setCustomIssue}
                  style={[styles.input, { minHeight: 80, textAlignVertical: "top" }]}
                  multiline
                  selectionColor="#38BDF8"
                />
              </View>
            )}
          </Animated.View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

/* ─── STYLES ─── */
const styles = StyleSheet.create({
  container: { flex: 1 },

  topArc: {
    position: "absolute",
    top: -120,
    left: -60,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "#0EA5E9",
    opacity: 0.04,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#020617",
  },

  text: { color: "#E0F2FE" },

  /* ─ Header ─ */
  header: {
    alignItems: "center",
    paddingTop: 54,
    paddingBottom: 28,
  },

  avatarGlow: {
    position: "absolute",
    top: 44,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#0EA5E9",
  },

  avatarRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    padding: 3,
    backgroundColor: "#0EA5E9",
    shadowColor: "#38BDF8",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 20,
  },

  avatarGradient: {
    flex: 1,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    color: "#E0F2FE",
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginTop: 16,
  },

  subtitle: {
    color: "#475569",
    fontSize: 12,
    letterSpacing: 2,
    marginTop: 4,
    textTransform: "uppercase",
  },

  editButton: {
    marginTop: 20,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#0EA5E9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },

  editButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 11,
    gap: 8,
  },

  editText: {
    color: "#E0F2FE",
    fontWeight: "700",
    fontSize: 14,
    letterSpacing: 0.5,
  },

  /* ─ Divider ─ */
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 24,
    marginBottom: 20,
    gap: 10,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#1E293B",
  },

  dividerLabel: {
    color: "#334155",
    fontSize: 10,
    letterSpacing: 2.5,
    fontWeight: "700",
  },

  /* ─ View Mode Card ─ */
  cardContainer: {
    marginHorizontal: 20,
    backgroundColor: "#060F1E",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1E3A5F",
    overflow: "hidden",
    shadowColor: "#0EA5E9",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },

  statStrip: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#0F2440",
    backgroundColor: "#040D1A",
  },

  statItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
    gap: 4,
  },

  statValue: {
    color: "#38BDF8",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  statKey: {
    color: "#334155",
    fontSize: 9,
    letterSpacing: 2,
    fontWeight: "700",
  },

  statSep: {
    width: 1,
    backgroundColor: "#0F2440",
    marginVertical: 12,
  },

  profileItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#0A1628",
    gap: 14,
  },

  profileItemIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#0A1F3A",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#1E3A5F",
  },

  profileItemLabel: {
    color: "#475569",
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },

  profileItemValue: {
    color: "#E0F2FE",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 2,
  },

  profileItemDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#0EA5E9",
    opacity: 0.6,
  },

  /* ─ Edit Mode ─ */
  editContainer: {
    marginHorizontal: 20,
    gap: 4,
  },

  fieldGroup: {
    backgroundColor: "#060F1E",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1E3A5F",
  },

  fieldHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },

  fieldLabel: {
    color: "#7DD3FC",
    fontSize: 12,
    letterSpacing: 1.5,
    fontWeight: "700",
    textTransform: "uppercase",
  },

  input: {
    backgroundColor: "#040D1A",
    borderWidth: 1,
    borderColor: "#1E3A5F",
    borderRadius: 12,
    padding: 14,
    color: "#E0F2FE",
    fontSize: 15,
    letterSpacing: 0.3,
  },

  chipRow: {
    flexDirection: "row",
    gap: 10,
  },

  chip: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },

  chipInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 11,
  },

  chipText: {
    color: "#475569",
    fontWeight: "600",
    fontSize: 13,
  },

  /* ─ Health Grid ─ */
  healthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  healthChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: "#040D1A",
    borderWidth: 1,
    borderColor: "#1E3A5F",
    gap: 6,
  },

  healthChipActive: {
    borderColor: "#0EA5E9",
    backgroundColor: "#0A1F3A",
  },

  healthChipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#38BDF8",
  },

  healthChipText: {
    color: "#475569",
    fontSize: 13,
    fontWeight: "600",
  },
});
