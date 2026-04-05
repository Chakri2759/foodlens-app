import {
  View,
  Text,
  StyleSheet,
  Switch,
  Pressable,
  ScrollView,
  Animated,
  Easing,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useState, useRef, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

/* ─────────────────────────────────────────
   Mount-animation hook: fade + slide up
───────────────────────────────────────── */
function useMountAnim(delay = 0) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(22)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 520,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 520,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return { opacity, translateY };
}

/* ─────────────────────────────────────────
   Animated section label
───────────────────────────────────────── */
function SectionLabel({
  label,
  darkMode,
  delay,
}: {
  label: string;
  darkMode: boolean;
  delay: number;
}) {
  const { opacity, translateY } = useMountAnim(delay);
  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <View style={styles.sectionLabelRow}>
        <Text
          style={[styles.sectionTitle, !darkMode && { color: "#0284C7" }]}
        >
          {label}
        </Text>
        <View
          style={[
            styles.sectionLine,
            { backgroundColor: darkMode ? "#1E293B" : "#BAE6FD" },
          ]}
        />
      </View>
    </Animated.View>
  );
}

/* ─────────────────────────────────────────
   Setting row with press scale + glow pulse on toggle
───────────────────────────────────────── */
function SettingRow({
  icon,
  label,
  sublabel,
  value,
  onToggle,
  darkMode,
  delay,
}: any) {
  const { opacity, translateY } = useMountAnim(delay);
  const scale = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  const handleToggle = (v: boolean) => {
    // Pulse glow then fade
    Animated.sequence([
      Animated.timing(glowOpacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(glowOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
    onToggle(v);
  };

  const onPressIn = () =>
    Animated.spring(scale, {
      toValue: 0.975,
      useNativeDriver: true,
      speed: 50,
    }).start();

  const onPressOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
    }).start();

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <Pressable onPressIn={onPressIn} onPressOut={onPressOut}>
        <Animated.View style={{ transform: [{ scale }] }}>
          {/* Glow halo */}
          <Animated.View
            style={[
              styles.rowGlow,
              {
                opacity: glowOpacity,
                backgroundColor: darkMode
                  ? "rgba(56,189,248,0.12)"
                  : "rgba(2,132,199,0.10)",
              },
            ]}
            pointerEvents="none"
          />

          <View
            style={[
              styles.settingRow,
              !darkMode && {
                backgroundColor: "#F0F9FF",
                borderColor: "#BAE6FD",
              },
            ]}
          >
            {/* Icon badge */}
            <View
              style={[
                styles.iconBadge,
                {
                  backgroundColor: darkMode
                    ? "rgba(56,189,248,0.10)"
                    : "rgba(2,132,199,0.10)",
                },
              ]}
            >
              <Ionicons
                name={icon}
                size={20}
                color={darkMode ? "#38BDF8" : "#0284C7"}
              />
            </View>

            {/* Text */}
            <View style={styles.rowTextBlock}>
              <Text
                style={[
                  styles.settingLabel,
                  !darkMode && { color: "#020617" },
                ]}
              >
                {label}
              </Text>
              {sublabel ? (
                <Text
                  style={[
                    styles.settingSubLabel,
                    !darkMode && { color: "#0284C7" },
                  ]}
                >
                  {sublabel}
                </Text>
              ) : null}
            </View>

            <Switch
              value={value}
              onValueChange={handleToggle}
              trackColor={{
                false: darkMode ? "#1E293B" : "#CBD5E1",
                true: darkMode ? "#0284C7" : "#38BDF8",
              }}
              thumbColor={value ? "#E0F2FE" : darkMode ? "#475569" : "#94A3B8"}
            />
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

/* ─────────────────────────────────────────
   Info row
───────────────────────────────────────── */
function InfoRow({
  icon,
  text,
  darkMode,
  delay,
}: any) {
  const { opacity, translateY } = useMountAnim(delay);
  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <View
        style={[
          styles.infoRow,
          !darkMode && {
            backgroundColor: "#F0F9FF",
            borderColor: "#BAE6FD",
          },
        ]}
      >
        <View
          style={[
            styles.iconBadge,
            {
              backgroundColor: darkMode
                ? "rgba(148,163,184,0.10)"
                : "rgba(2,132,199,0.08)",
            },
          ]}
        >
          <Ionicons
            name={icon}
            size={18}
            color={darkMode ? "#94A3B8" : "#0284C7"}
          />
        </View>
        <Text
          style={[styles.infoText, !darkMode && { color: "#334155" }]}
        >
          {text}
        </Text>
      </View>
    </Animated.View>
  );
}

/* ─────────────────────────────────────────
   Main Screen
───────────────────────────────────────── */
export default function SettingsScreen() {
  const router = useRouter();

  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [personalization, setPersonalization] = useState(true);

  // Header entrance
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerY = useRef(new Animated.Value(-16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(headerY, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Logout press
  const logoutScale = useRef(new Animated.Value(1)).current;
  const logoutOpacity = useRef(new Animated.Value(1)).current;

  const { opacity: logoutMountOpacity, translateY: logoutMountY } =
    useMountAnim(560);

  const onLogoutPressIn = () =>
    Animated.parallel([
      Animated.spring(logoutScale, {
        toValue: 0.96,
        useNativeDriver: true,
        speed: 50,
      }),
      Animated.timing(logoutOpacity, {
        toValue: 0.75,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

  const onLogoutPressOut = () =>
    Animated.parallel([
      Animated.spring(logoutScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
      }),
      Animated.timing(logoutOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

  return (
    <LinearGradient
      colors={
        darkMode
          ? ["#020617", "#0F172A", "#020617"]
          : ["#E6F4FE", "#F8FAFC", "#E6F4FE"]
      }
      style={styles.container}
    >
      {/* Decorative blurred orb */}
      <View
        pointerEvents="none"
        style={[
          styles.orb,
          {
            backgroundColor: darkMode
              ? "rgba(56,189,248,0.07)"
              : "rgba(2,132,199,0.07)",
          },
        ]}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <Animated.View
          style={{
            opacity: headerOpacity,
            transform: [{ translateY: headerY }],
            marginBottom: 28,
          }}
        >
          <View style={styles.headerRow}>
            <View>
              <Text
                style={[
                  styles.eyebrow,
                  !darkMode && { color: "#0284C7" },
                ]}
              >
                YOUR ACCOUNT
              </Text>
              <Text
                style={[
                  styles.title,
                  !darkMode && { color: "#020617" },
                ]}
              >
                Settings
              </Text>
            </View>
            {/* Avatar placeholder */}
            <LinearGradient
              colors={["#0284C7", "#38BDF8"]}
              style={styles.avatar}
            >
              <Ionicons name="person" size={20} color="#E0F2FE" />
            </LinearGradient>
          </View>

          {/* Thin accent divider */}
          <View
            style={[
              styles.headerDivider,
              !darkMode && { backgroundColor: "#BAE6FD" },
            ]}
          />
        </Animated.View>

        {/* ── Appearance ── */}
        <SectionLabel label="Appearance" darkMode={darkMode} delay={80} />
        <SettingRow
          icon="moon-outline"
          label="Dark Mode"
          sublabel="Adjust display theme"
          value={darkMode}
          onToggle={setDarkMode}
          darkMode={darkMode}
          delay={120}
        />

        {/* ── Preferences ── */}
        <SectionLabel label="Preferences" darkMode={darkMode} delay={200} />
        <SettingRow
          icon="notifications-outline"
          label="Notifications"
          sublabel="Alerts & push messages"
          value={notifications}
          onToggle={setNotifications}
          darkMode={darkMode}
          delay={240}
        />
        <SettingRow
          icon="heart-outline"
          label="Health Personalization"
          sublabel="Tailor insights to you"
          value={personalization}
          onToggle={setPersonalization}
          darkMode={darkMode}
          delay={300}
        />

        {/* ── Information ── */}
        <SectionLabel label="Information" darkMode={darkMode} delay={380} />
        <InfoRow
          icon="shield-checkmark-outline"
          text="Your data is processed securely and used only for analysis."
          darkMode={darkMode}
          delay={420}
        />
        <InfoRow
          icon="analytics-outline"
          text="Ingredient analysis is based on verified scientific references."
          darkMode={darkMode}
          delay={460}
        />

        {/* ── Logout ── */}
        <Animated.View
          style={{
            opacity: logoutMountOpacity,
            transform: [{ translateY: logoutMountY }],
          }}
        >
          <Pressable
            onPressIn={onLogoutPressIn}
            onPressOut={onLogoutPressOut}
            onPress={() => router.replace("/")}
          >
            <Animated.View
              style={[
                styles.logoutButton,
                !darkMode && { borderColor: "#EF4444", backgroundColor: "#FFF5F5" },
                { transform: [{ scale: logoutScale }], opacity: logoutOpacity },
              ]}
            >
              <LinearGradient
                colors={["rgba(239,68,68,0.10)", "rgba(239,68,68,0.04)"]}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
              <Text style={styles.logoutText}>Sign Out</Text>
            </Animated.View>
          </Pressable>
        </Animated.View>

        {/* Version tag */}
        <Animated.Text
          style={[
            styles.versionText,
            !darkMode && { color: "#94A3B8" },
            { opacity: logoutMountOpacity },
          ]}
        >
          v2.4.1 · NutriScan
        </Animated.Text>
      </ScrollView>
    </LinearGradient>
  );
}

/* ─────────────────────────────────────────
   Styles
───────────────────────────────────────── */
const styles = StyleSheet.create({
  container: { flex: 1 },

  orb: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 160,
    top: -80,
    right: -80,
    // React Native doesn't support CSS blur but the translucent circle adds depth
  },

  content: {
    padding: 24,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 48,
  },

  /* Header */
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  eyebrow: {
    color: "#38BDF8",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 4,
  },
  title: {
    color: "#E0F2FE",
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  headerDivider: {
    height: 1,
    backgroundColor: "#1E293B",
    marginTop: 20,
    borderRadius: 1,
  },

  /* Section label */
  sectionLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 12,
    gap: 10,
  },
  sectionTitle: {
    color: "#38BDF8",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
  sectionLine: {
    flex: 1,
    height: 1,
    borderRadius: 1,
  },

  /* Setting row */
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0B1629",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1E293B",
    marginBottom: 10,
    gap: 12,
    overflow: "hidden",
  },
  rowGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    zIndex: 0,
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  rowTextBlock: {
    flex: 1,
  },
  settingLabel: {
    color: "#E5E7EB",
    fontSize: 15,
    fontWeight: "600",
  },
  settingSubLabel: {
    color: "#38BDF8",
    fontSize: 12,
    marginTop: 2,
    opacity: 0.75,
  },

  /* Info row */
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: "#0B1629",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1E293B",
    marginBottom: 10,
  },
  infoText: {
    color: "#94A3B8",
    fontSize: 13.5,
    lineHeight: 20,
    flex: 1,
    paddingTop: 1,
  },

  /* Logout */
  logoutButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 32,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#EF4444",
    overflow: "hidden",
    gap: 8,
  },
  logoutText: {
    color: "#EF4444",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  /* Version */
  versionText: {
    color: "#334155",
    fontSize: 12,
    textAlign: "center",
    marginTop: 20,
    letterSpacing: 0.5,
  },
});
