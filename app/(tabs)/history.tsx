import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { FallCard } from "../../components/FallDetectCard";
import EmergencyPopup from "../../components/EmergencyPopup";

import { db, auth } from "../../config/firebase";
import {
  collection,
  doc,
  onSnapshot,
  query,
  orderBy,
  setDoc,
} from "firebase/firestore";

export default function FallHistoryPage() {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [liveStatus, setLiveStatus] = useState("STABLE");
  const [incidents, setIncidents] = useState<any[]>([]);
  const [latestIncident, setLatestIncident] = useState<any>(null);

  // 🔵 STEP 1: Get deviceId from user
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, "users", user.uid);

    return onSnapshot(userRef, (snap) => {
      const data = snap.data();
      if (data?.deviceId) {
        setDeviceId(data.deviceId);
      }
    });
  }, []);

  // 🔴 STEP 2: Listen to live status
  useEffect(() => {
    if (!deviceId) return;

    const ref = doc(db, "devices", deviceId);

    return onSnapshot(ref, (snapshot) => {
      const data = snapshot.data();
      const status =
        data?.live_status?.currentSituation?.toUpperCase() || "STABLE";

      setLiveStatus(status);
    });
  }, [deviceId]);

  // 🟡 STEP 3: Listen to incidents
  useEffect(() => {
    if (!deviceId) return;

    const q = query(
      collection(db, "devices", deviceId, "incidents"),
      orderBy("timestamp", "desc")
    );

    return onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => doc.data());
      setIncidents(list);
      setLatestIncident(list[0]);
    });
  }, [deviceId]);

  // 🔥 Send command to ESP32
  const sendAction = async (action: string) => {
    if (!deviceId) return;

    await setDoc(doc(db, "devices", deviceId, "commands"), {
      action,
    });
  };

  // 🧠 Map status → UI
  const getStatusType = () => {
    if (liveStatus === "PENDING_RESPONSE") return "waiting";
    if (liveStatus === "UNRESPONSIVE") return "emergency";
    return null;
  };

  const showPopup = liveStatus === "UNRESPONSIVE";

  // 🟡 Loading fallback
  if (!deviceId) {
    return (
      <View style={styles.center}>
        <Text>Loading device...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container_bg}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Incidents Log</Text>

        <Text style={styles.section}>Current Situation</Text>

        {/* 🟢 CURRENT INCIDENT */}
        {liveStatus === "STABLE" ? (
          <Text>No Active Incidents</Text>
        ) : (
          <FallCard
            status={getStatusType() as any}
            gForce={latestIncident?.peakG || "-"}
            time={formatDate(latestIncident?.timestamp)}
            highlighted
          />
        )}

        <Text style={styles.section}>Recent History</Text>

        {/* 🟡 HISTORY */}
        {incidents.map((item, index) => (
          <FallCard
            key={index}
            status={mapHistoryStatus(item.status)}
            gForce={item.peakG}
            time={formatDate(item.timestamp)}
          />
        ))}
      </ScrollView>

      {/* 🔴 POPUP */}
      <EmergencyPopup
        visible={showPopup}
        gForce={latestIncident?.peakG || 0}
        bpm={76} // later connect real BPM
        onEmergency={() => sendAction("EMERGENCY_CONFIRMED")}
        onFalseAlarm={() => sendAction("FALSE_ALARM")}
      />
    </View>
  );
}

// 🔧 Helpers
const mapHistoryStatus = (status: string) => {
  if (status === "RESOLVED") return "resolved";
  if (status === "EMERGENCY") return "emergency";
  if (status === "FALSE_ALARM") return "false";
  return "resolved";
};

const formatDate = (timestamp: any) => {
  if (!timestamp) return "-";

  // If using millis
  return new Date(timestamp).toLocaleDateString();

  // Later: Firestore Timestamp → timestamp.toDate()
};

// 🎨 Styles
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
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});