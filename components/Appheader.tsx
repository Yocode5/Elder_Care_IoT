import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { auth, db } from "../config/firebase";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AppHeader() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [firstName, setFirstName] = useState("User");

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setFirstName(snap.data().firstName || "User");
        }
      }
    };

    fetchUserData();
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  const confirmSignOut = () => {
    Alert.alert("Log Out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", onPress: handleSignOut, style: "destructive" },
    ]);
  };

  return (
    <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
      <View style={styles.userInfo}>
        <Ionicons name="person-outline" size={22} color="#1A1A1A" />
        <Text style={styles.greeting}>Hello, {firstName}!</Text>
      </View>

      <TouchableOpacity onPress={confirmSignOut}>
        <Feather name="log-out" size={22} color="#666" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 25,
    paddingVertical: 15,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  greeting: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
  },
});