import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function Profile() {
  const router = useRouter();

  const handleContinue = () => {
    router.replace("/(tabs)/home");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Ionicons name="medical-outline" size={80} color="#21B3A6" />
          <Text style={styles.title}>Health Profile</Text>
          <Text style={styles.subtitle}>Step 2 of 2</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardText}>
            This is your temporary Profile Setup screen.
          </Text>
          <Text style={styles.cardSubText}>
            Eventually, caretakers will enter the patient's Gender, Date of
            Birth, Height, and Weight here to finalize their database record.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>
            Continue to Home Dashboard
          </Text>
          <Ionicons
            name="arrow-forward"
            size={20}
            color="#FFFFFF"
            style={styles.arrowIcon}
          />
        </TouchableOpacity>
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
    paddingHorizontal: 30,
    justifyContent: "center",
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginTop: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#8A94A6",
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#F8F9FA",
    borderColor: "#E0E0E0",
    borderRadius: 12,
    borderWidth: 1,
    padding: 25,
    marginBottom: 40,
  },
  cardText: {
    color: "#1A1A1A",
    fontSize: 16,
    fontWeight: "bold",
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 10,
  },
  cardSubText: {
    color: "#666666",
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
  },
  continueButton: {
    backgroundColor: "#21B3A6",
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  arrowIcon: {
    marginLeft: 10,
  },
});