import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Image,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { auth } from "../config/firebase";
import { Fonts } from "../constants/theme";

export default function Index() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [authChecking, setAuthChecking] = useState(true);
  const [targetRoute, setTargetRoute] = useState<"/(tabs)/home" | "/login">(
    "/login",
  );

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setTargetRoute("/(tabs)/home");
      } else {
        setTargetRoute("/login");
      }
      setAuthChecking(false);
    });

    const timer = setTimeout(() => {
      if (!authChecking) {
        router.replace(targetRoute);
      }
    }, 2500);

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, [authChecking, targetRoute]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>
          <Text style={styles.titleTeal}>Elder </Text>
          <Text style={styles.titleBlack}>Care</Text>
        </Text>

        <Text style={styles.tagline}>Digitizing Care, One Step at a Time</Text>

        {authChecking && (
          <ActivityIndicator
            size="small"
            color="#21B3A6"
            style={{ marginTop: 20 }}
          />
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    width: "100%",
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontFamily: Fonts.rounded,
    fontWeight: "bold",
    marginBottom: 10,
  },
  titleTeal: {
    color: "#21B3A6",
  },
  titleBlack: {
    color: "#1A1A1A",
  },
  tagline: {
    fontSize: 14,
    color: "#4A4A4A",
    fontWeight: "500",
    letterSpacing: 0.3,
  },
});