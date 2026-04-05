import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  Animated,
  Easing,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImageManipulator from "expo-image-manipulator";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");
const FRAME_SIZE = width * 0.72;
const CORNER_SIZE = 28;

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();

  const [flash, setFlash] = useState<"off" | "on">("off");
  const [isStable, setIsStable] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  /* ── Animations ── */
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scanAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.4)).current;
  const cornerRotate = useRef(new Animated.Value(0)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;
  const captureScale = useRef(new Animated.Value(1)).current;
  const captureOpacity = useRef(new Animated.Value(1)).current;
  const statusAnim = useRef(new Animated.Value(0)).current;
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  /* ── Mount fade-in ── */
  useEffect(() => {
    Animated.timing(fadeIn, {
      toValue: 1,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  /* ── Scan line ── */
  useEffect(() => {
    scanAnim.setValue(0);
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: FRAME_SIZE - 2,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(scanAnim, {
          toValue: 0,
          duration: 40,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  /* ── Corner glow pulse ── */
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.35,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  /* ── Corner subtle rotation ── */
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(cornerRotate, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(cornerRotate, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  /* ── Button pulse ── */
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.12,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  /* ── Dot wave loader ── */
  const animateDotWave = () => {
    const dotAnim = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: -6,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      );
    Animated.parallel([
      dotAnim(dot1, 0),
      dotAnim(dot2, 120),
      dotAnim(dot3, 240),
    ]).start();
  };

  /* ── Status transition ── */
  useEffect(() => {
    Animated.spring(statusAnim, {
      toValue: isStable ? 1 : 0,
      friction: 5,
      tension: 80,
      useNativeDriver: true,
    }).start();
  }, [isStable]);

  /* ── Fake stability ── */
  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, [permission]);

  useEffect(() => {
    const interval = setInterval(
      () => setIsStable(Math.random() > 0.45),
      1500
    );
    return () => clearInterval(interval);
  }, []);

  /* ── Capture ── */
  const takePicture = async () => {
  if (!cameraRef.current || isCapturing) return;

  setIsCapturing(true);
  animateDotWave();

  Animated.parallel([
    Animated.sequence([
      Animated.timing(captureScale, {
        toValue: 0.88,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(captureScale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]),
    Animated.sequence([
      Animated.timing(captureOpacity, {
        toValue: 0.5,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(captureOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]),
  ]).start();

  const userId = await AsyncStorage.getItem("user_id");
  if (!userId) {
    alert("Please login again");
    setIsCapturing(false);
    return;
  }

  try {
    // ✅ Take picture (reduced quality for stability)
    const photo = await cameraRef.current.takePictureAsync({
      quality: 0.7,
      base64: false,
      exif: false,
    });

    console.log("Captured Image URI:", photo.uri);

    // ✅ NO CROPPING — use original image
    router.push({
      pathname: "/preview",
      params: { uri: photo.uri, user_id: userId },
    } as any);

  } catch (err) {
    console.error("Capture error:", err);
  } finally {
    setIsCapturing(false);
  }
};

  if (!permission?.granted) {
    return (
      <View style={styles.center}>
        <Ionicons name="camera-outline" size={48} color="#38BDF8" />
        <Text style={styles.permText}>Camera access required</Text>
        <Pressable
          style={styles.permButton}
          onPress={requestPermission}
        >
          <Text style={styles.permButtonText}>Grant Permission</Text>
        </Pressable>
      </View>
    );
  }

  const cornerSpin = cornerRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["-2deg", "2deg"],
  });

  return (
    <Animated.View style={[styles.container, { opacity: fadeIn }]}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        enableTorch={flash === "on"}
      />

      {/* Blur Overlay */}
      <View style={styles.overlay} pointerEvents="none">
        <BlurView intensity={70} tint="dark" style={styles.topShade} />
        <View style={styles.middleRow}>
          <BlurView intensity={70} tint="dark" style={styles.sideShade} />

          {/* ── Scanner Box ── */}
          <Animated.View style={[styles.box, { opacity: fadeIn }]}>
            {/* Ambient glow behind frame */}
            <Animated.View
              style={[styles.frameGlow, { opacity: glowAnim }]}
            />

            {/* Corners */}
            {["topLeft", "topRight", "bottomLeft", "bottomRight"].map(
              (pos) => (
                <Animated.View
                  key={pos}
                  style={[
                    styles.corner,
                    styles[pos as keyof typeof styles],
                    {
                      opacity: glowAnim,
                      transform: [{ rotate: cornerSpin }],
                    },
                  ]}
                />
              )
            )}

            {/* Scan Line + gradient fade */}
            <Animated.View
              style={[
                styles.scanLineWrap,
                { transform: [{ translateY: scanAnim }] },
              ]}
            >
              <LinearGradient
                colors={["transparent", "#38BDF855", "#38BDF8", "#38BDF855", "transparent"]}
                style={styles.scanLine}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
              {/* Glow dot on scan line */}
              <View style={styles.scanDot} />
            </Animated.View>

            {/* Crosshair center */}
            <View style={styles.crosshairH} />
            <View style={styles.crosshairV} />
          </Animated.View>

          <BlurView intensity={70} tint="dark" style={styles.sideShade} />
        </View>
        <BlurView intensity={70} tint="dark" style={styles.bottomShade} />
      </View>

      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.appLabel}>LABEL SCANNER</Text>

        {/* Status pill */}
        <Animated.View
          style={[
            styles.statusPill,
            isStable ? styles.statusReady : styles.statusAlign,
            {
              transform: [
                {
                  scale: statusAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.06],
                  }),
                },
              ],
            },
          ]}
        >
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isStable ? "#4ADE80" : "#FBBF24" },
            ]}
          />
          <Text style={styles.statusText}>
            {isStable ? "Ready to Scan" : "Align the Label"}
          </Text>
        </Animated.View>
      </View>

      {/* ── Flash toggle ── */}
      <Pressable
        style={styles.flashBtn}
        onPress={() => setFlash(flash === "off" ? "on" : "off")}
      >
        <BlurView intensity={50} tint="dark" style={styles.iconBlur}>
          <Ionicons
            name={flash === "on" ? "flash" : "flash-off"}
            size={20}
            color={flash === "on" ? "#38BDF8" : "#94A3B8"}
          />
        </BlurView>
      </Pressable>

      {/* ── Hint text below scanner ── */}
      <View style={styles.hintArea}>
        <Text style={styles.hintText}>
          Position the product label inside the frame
        </Text>
      </View>

      {/* ── Bottom capture area ── */}
      <View style={styles.bottom}>
        {/* Loading dots */}
        {isCapturing && (
          <View style={styles.dotRow}>
            {[dot1, dot2, dot3].map((d, i) => (
              <Animated.View
                key={i}
                style={[styles.dot, { transform: [{ translateY: d }] }]}
              />
            ))}
          </View>
        )}

        {/* Capture button */}
        <Animated.View
          style={{
            transform: [{ scale: captureScale }],
            opacity: captureOpacity,
          }}
        >
          {/* Outer ring pulse */}
          <Animated.View
            style={[
              styles.outerRing,
              { transform: [{ scale: pulseAnim }], opacity: glowAnim },
            ]}
          />

          <Pressable
            style={[styles.captureBtn, isCapturing && styles.captureBtnActive]}
            onPress={takePicture}
            disabled={isCapturing}
          >
            <LinearGradient
              colors={["#38BDF8", "#0284C7"]}
              style={styles.captureBtnInner}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons
                name={isCapturing ? "hourglass-outline" : "camera"}
                size={28}
                color="#fff"
              />
            </LinearGradient>
          </Pressable>
        </Animated.View>

        <Text style={styles.captureLabel}>
          {isCapturing ? "Processing…" : "Tap to Capture"}
        </Text>
      </View>
    </Animated.View>
  );
}

/* ─────────────── STYLES ─────────────── */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020617" },
  camera: { flex: 1 },

  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },

  topShade: { height: (height - FRAME_SIZE) / 2 },
  bottomShade: { height: (height - FRAME_SIZE) / 2 },

  middleRow: { flexDirection: "row" },

  sideShade: {
    width: (width - FRAME_SIZE) / 2,
    height: FRAME_SIZE,
  },

  /* ── Scanner Box ── */
  box: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },

  frameGlow: {
    position: "absolute",
    width: FRAME_SIZE + 30,
    height: FRAME_SIZE + 30,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#38BDF8",
    shadowColor: "#38BDF8",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 18,
  },

  corner: {
    position: "absolute",
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: "#38BDF8",
    shadowColor: "#38BDF8",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },

  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 4,
  },

  scanLineWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    height: 2,
  },

  scanLine: {
    width: "100%",
    height: 2,
  },

  scanDot: {
    position: "absolute",
    right: 8,
    top: -3,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#38BDF8",
    shadowColor: "#38BDF8",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },

  crosshairH: {
    position: "absolute",
    width: 20,
    height: 1,
    backgroundColor: "#38BDF830",
  },
  crosshairV: {
    position: "absolute",
    width: 1,
    height: 20,
    backgroundColor: "#38BDF830",
  },

  /* ── Header ── */
  header: {
    position: "absolute",
    top: 56,
    width: "100%",
    alignItems: "center",
    gap: 12,
  },

  appLabel: {
    color: "#38BDF8",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 4,
    opacity: 0.9,
  },

  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 7,
    borderWidth: 1,
  },

  statusReady: {
    backgroundColor: "#0F172ACC",
    borderColor: "#4ADE8044",
  },

  statusAlign: {
    backgroundColor: "#0F172ACC",
    borderColor: "#FBBF2444",
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  statusText: {
    color: "#E2E8F0",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.3,
  },

  /* ── Flash ── */
  flashBtn: {
    position: "absolute",
    top: 58,
    right: 20,
  },

  iconBlur: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#38BDF820",
  },

  /* ── Hint ── */
  hintArea: {
    position: "absolute",
    top: (height - FRAME_SIZE) / 2 + FRAME_SIZE + 16,
    width: "100%",
    alignItems: "center",
  },

  hintText: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 0.3,
  },

  /* ── Bottom ── */
  bottom: {
    position: "absolute",
    bottom: 48,
    width: "100%",
    alignItems: "center",
    gap: 14,
  },

  dotRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 4,
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#38BDF8",
  },

  outerRing: {
    position: "absolute",
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 1.5,
    borderColor: "#38BDF8",
    top: -4,
    left: -4,
  },

  captureBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#38BDF840",
    shadowColor: "#38BDF8",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 12,
  },

  captureBtnActive: {
    opacity: 0.75,
  },

  captureBtnInner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  captureLabel: {
    color: "#475569",
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 0.5,
  },

  /* ── Permission screen ── */
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#020617",
    gap: 16,
  },

  permText: {
    color: "#94A3B8",
    fontSize: 15,
    fontWeight: "500",
  },

  permButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#0284C7",
    marginTop: 4,
  },

  permButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
} as any);
