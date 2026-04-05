import { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

/* ─── Animated Card ─── */
function AnimatedCard({
  children,
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  style?: object;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        delay,
        tension: 60,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
}

/* ─── Bullet Item ─── */
function BulletItem({
  icon,
  text,
  delay,
}: {
  icon: string;
  text: string;
  delay: number;
}) {
  const scale = useRef(new Animated.Value(0.85)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        delay,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[styles.bulletRow, { opacity, transform: [{ scale }] }]}
    >
      <LinearGradient
        colors={["#0EA5E9", "#38BDF8"]}
        style={styles.bulletIconBg}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Ionicons name={icon as any} size={14} color="#fff" />
      </LinearGradient>
      <Text style={styles.bulletText}>{text}</Text>
    </Animated.View>
  );
}

/* ─── Divider ─── */
function GlowDivider() {
  return (
    <View style={styles.dividerRow}>
      <View style={styles.dividerLine} />
      <View style={styles.dividerDot} />
      <View style={styles.dividerLine} />
    </View>
  );
}

/* ─── Main Screen ─── */
export default function AboutScreen() {
  const headerScale = useRef(new Animated.Value(0.7)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const iconRotate = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Hero entrance
    Animated.parallel([
      Animated.spring(headerScale, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(iconRotate, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse loop on icon ring
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const spin = iconRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["-20deg", "0deg"],
  });

  const bullets = [
    {
      icon: "flask-outline",
      text: "Ingredient-level health analysis",
    },
    {
      icon: "person-circle-outline",
      text: "Personalized insights based on health conditions",
    },
    {
      icon: "shield-checkmark-outline",
      text: "Clear Safe / Caution / Avoid classification",
    },
    {
      icon: "bulb-outline",
      text: "User-friendly and explainable results",
    },
  ];

  return (
    <LinearGradient
      colors={["#020617", "#0F172A", "#020617"]}
      style={styles.container}
    >
      {/* Decorative ambient orbs */}
      <View style={styles.orbTopRight} />
      <View style={styles.orbBottomLeft} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero ── */}
        <Animated.View
          style={[
            styles.heroSection,
            { opacity: headerOpacity, transform: [{ scale: headerScale }] },
          ]}
        >
          {/* Pulsing ring */}
          <Animated.View
            style={[
              styles.iconRing,
              { transform: [{ scale: pulseAnim }] },
            ]}
          />

          {/* Icon wrapper */}
          <Animated.View
            style={[styles.iconWrapper, { transform: [{ rotate: spin }] }]}
          >
            <LinearGradient
              colors={["#0369A1", "#0EA5E9"]}
              style={styles.iconGradientBg}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons
                name="leaf-outline"
                size={44}
                color="#E0F2FE"
              />
            </LinearGradient>
          </Animated.View>

          <Text style={styles.appName}>FoodLens</Text>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>v1.0</Text>
            </View>
            <View style={[styles.badge, styles.badgeSecondary]}>
              <Text style={styles.badgeText}>Final Year Project</Text>
            </View>
          </View>
        </Animated.View>

        {/* ── Description Card ── */}
        <AnimatedCard delay={200}>
          <LinearGradient
            colors={["rgba(14,165,233,0.08)", "rgba(2,6,23,0.0)"]}
            style={styles.card}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.cardAccentBar} />
            <Text style={styles.cardBody}>
              FoodLens is a smart food-label analysis application designed to
              help consumers understand what they are really eating. By decoding
              complex ingredient names and additives, the app provides clear and
              science-backed insights into packaged food products.
            </Text>
          </LinearGradient>
        </AnimatedCard>

        <GlowDivider />

        {/* ── Why FoodLens ── */}
        <AnimatedCard delay={350}>
          <View style={styles.sectionHeader}>
            <LinearGradient
              colors={["#0EA5E9", "#38BDF8"]}
              style={styles.sectionIconBg}
            >
              <Ionicons name="help-circle-outline" size={16} color="#fff" />
            </LinearGradient>
            <Text style={styles.sectionTitle}>Why FoodLens?</Text>
          </View>
          <LinearGradient
            colors={["rgba(14,165,233,0.06)", "rgba(2,6,23,0.0)"]}
            style={styles.card}
          >
            <View style={styles.cardAccentBar} />
            <Text style={styles.cardBody}>
              Most existing food apps provide only generic health scores.
              FoodLens goes deeper by analyzing individual ingredients, their
              potential health effects, and suitability based on a user's
              personal health profile.
            </Text>
          </LinearGradient>
        </AnimatedCard>

        <GlowDivider />

        {/* ── Key Highlights ── */}
        <AnimatedCard delay={500}>
          <View style={styles.sectionHeader}>
            <LinearGradient
              colors={["#0EA5E9", "#38BDF8"]}
              style={styles.sectionIconBg}
            >
              <Ionicons name="star-outline" size={16} color="#fff" />
            </LinearGradient>
            <Text style={styles.sectionTitle}>Key Highlights</Text>
          </View>
        </AnimatedCard>

        <View style={styles.bulletsCard}>
          {bullets.map((b, i) => (
            <BulletItem
              key={i}
              icon={b.icon}
              text={b.text}
              delay={580 + i * 100}
            />
          ))}
        </View>

        <GlowDivider />

        {/* ── Disclaimer ── */}
        <AnimatedCard delay={980}>
          <View style={styles.sectionHeader}>
            <LinearGradient
              colors={["#F59E0B", "#FBBF24"]}
              style={styles.sectionIconBg}
            >
              <Ionicons
                name="warning-outline"
                size={16}
                color="#fff"
              />
            </LinearGradient>
            <Text style={styles.sectionTitle}>Disclaimer</Text>
          </View>
          <LinearGradient
            colors={[
              "rgba(245,158,11,0.07)",
              "rgba(2,6,23,0.0)",
            ]}
            style={[styles.card, styles.warningCard]}
          >
            <View style={[styles.cardAccentBar, styles.warningAccent]} />
            <Text style={styles.cardBody}>
              FoodLens is intended for informational purposes only. It does not
              replace professional medical advice. Users are encouraged to
              consult healthcare professionals for medical concerns.
            </Text>
          </LinearGradient>
        </AnimatedCard>

        {/* ── Footer ── */}
        {/* <AnimatedCard delay={1100} style={styles.footerWrapper}>
          <View style={styles.footerLine} />
          <Text style={styles.footerText}>
            Crafted with{" "}
            <Text style={{ color: "#F87171" }}>♥</Text>
            {"  ·  "}FoodLens 1.0{"  ·  "}Final Year Project
          </Text>
        </AnimatedCard> */}
      </ScrollView>
    </LinearGradient>
  );
}

/* ─── STYLES ─── */
const styles = StyleSheet.create({
  container: { flex: 1 },

  /* Ambient orbs */
  orbTopRight: {
    position: "absolute",
    top: -80,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(14,165,233,0.07)",
  },
  orbBottomLeft: {
    position: "absolute",
    bottom: 60,
    left: -100,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(56,189,248,0.05)",
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 50,
  },

  /* Hero */
  heroSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconRing: {
    position: "absolute",
    top: -14,
    width: 116,
    height: 116,
    borderRadius: 58,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.25)",
  },
  iconWrapper: {
    marginBottom: 18,
    shadowColor: "#38BDF8",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  iconGradientBg: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  appName: {
    color: "#E0F2FE",
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
  },
  badge: {
    backgroundColor: "rgba(14,165,233,0.15)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.3)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeSecondary: {
    backgroundColor: "rgba(100,116,139,0.15)",
    borderColor: "rgba(148,163,184,0.25)",
  },
  badgeText: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
  },

  /* Divider */
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    paddingHorizontal: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(56,189,248,0.15)",
  },
  dividerDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#38BDF8",
    marginHorizontal: 10,
    opacity: 0.6,
  },

  /* Section header */
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionIconBg: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  sectionTitle: {
    color: "#38BDF8",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.4,
  },

  /* Cards */
  card: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.12)",
    flexDirection: "row",
    overflow: "hidden",
  },
  warningCard: {
    borderColor: "rgba(245,158,11,0.18)",
  },
  cardAccentBar: {
    width: 3,
    borderRadius: 2,
    backgroundColor: "#0EA5E9",
    marginRight: 14,
    alignSelf: "stretch",
  },
  warningAccent: {
    backgroundColor: "#F59E0B",
  },
  cardBody: {
    flex: 1,
    color: "#CBD5E1",
    fontSize: 14,
    lineHeight: 23,
  },

  /* Bullets */
  bulletsCard: {
    backgroundColor: "rgba(14,165,233,0.04)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.1)",
    gap: 4,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(56,189,248,0.07)",
  },
  bulletIconBg: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  bulletText: {
    color: "#CBD5E1",
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },

  /* Footer */
  footerWrapper: {
    alignItems: "center",
    marginTop: 10,
  },
  footerLine: {
    width: 40,
    height: 2,
    borderRadius: 1,
    backgroundColor: "rgba(56,189,248,0.3)",
    marginBottom: 14,
  },
  footerText: {
    color: "#475569",
    fontSize: 12,
    letterSpacing: 0.5,
    fontWeight: "500",
  },
});
