import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../../config/firebase";

export default function Home() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("User");

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            if (userData.firstName) {
              setFirstName(userData.firstName);
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUserData();
  }, []);

  const confirmSignOut = () => {
    Alert.alert("Log Out", "Are you sure you want to log out of ElderCare?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Log Out",
        onPress: handleSignOut,
        style: "destructive",
      },
    ]);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.replace("/login");
    } catch (error: any) {
      Alert.alert("Error signing out", error.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Ionicons name="person-outline" size={24} color="#1A1A1A" />
            <Text style={styles.greeting}>Hello, {firstName}!</Text>
          </View>

          <TouchableOpacity onPress={confirmSignOut}>
            <Feather name="log-in" size={24} color="#666666" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>ElderCare Dashboard 🩺</Text>
          <View style={styles.card}>
            <Text style={styles.cardText}>
              This is your temporary home space. Eventually, this will hold the
              Health Grade, 24 Hour Activity pie chart, and real-time metrics!
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    paddingHorizontal: 25,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
    marginTop: 10,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  greeting: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginLeft: 10,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: "#1A1A1A",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#F8F9FA",
    borderColor: "#E0E0E0",
    borderRadius: 12,
    borderWidth: 1,
    padding: 25,
    width: "100%",
  },
  cardText: {
    color: "#666666",
    fontSize: 15,
    lineHeight: 24,
    textAlign: "center",
  },
});
