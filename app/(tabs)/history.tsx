import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { FallCard } from "../../components/FallDetectCard";
import EmergencyPopup from "../../components/EmergencyPopup";

export default function FallHistoryPage() {
  return (
    <View style={styles.container_bg}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Incidents Log</Text>

        <Text style={styles.section}>Current Situation</Text>

        <FallCard
          status="waiting"
          gForce="0.98"
          time="20/04/2026"
          highlighted
        />

        <Text style={styles.section}>Recent History</Text>

        <FallCard status="resolved" gForce="0.75" time="18/04/2026" />
        <FallCard status="emergency" gForce="1.20" time="17/04/2026" />
        <FallCard status="false" gForce="0.40" time="15/04/2026" />
      </ScrollView>
      <EmergencyPopup
        visible={true}
        gForce={1.20}
        bpm={72}
        onEmergency={() => {}}
        onFalseAlarm={() => {}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#F9FAFB",
    marginTop: 16,
    paddingTop: 25,
  },

  container_bg: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },


  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },

  section: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
    marginTop: 16,
  },
});