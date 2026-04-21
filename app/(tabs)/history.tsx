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
  
  // States to hold the dynamic ThingSpeak credentials
  const [tsChannelId, setTsChannelId] = useState<string | null>(null);
  const [tsApiKey, setTsApiKey] = useState<string | null>(null);

  const [liveBpm, setLiveBpm] = useState<number>(0);

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

  useEffect(() => {
    if (!deviceId) return;

    const ref = doc(db, "devices", deviceId);

    return onSnapshot(ref, (snapshot) => {
      const data = snapshot.data();
      const status =
        data?.live_status?.currentSituation?.toUpperCase() || "STABLE";

      setLiveStatus(status);

      // Grab keys dynamically from the root of the document
      if (data?.thingspeakChannelId && data?.thingspeakApiKey) {
        setTsChannelId(data.thingspeakChannelId);
        setTsApiKey(data.thingspeakApiKey);
      }
    });
  }, [deviceId]);

  useEffect(() => {
    if (!deviceId) return;

    const q = query(
      collection(db, "devices", deviceId, "incidents"),
      orderBy("timestamp", "desc")
    );

    return onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => doc.data());
      setIncidents(list);
      setLatestIncident(list); // Fixed: grabbing the first item for latest
    });
  }, [deviceId]);

  useEffect(() => {
    // Only run fetch if we successfully loaded the keys from Firestore
    if (!tsChannelId || !tsApiKey) return;

    const fetchThingSpeak = async () => {
      try {
        // Dynamic URL injected with keys
        const url = `https://api.thingspeak.com/channels/${tsChannelId}/feeds.json?api_key=${tsApiKey}&results=1`;
        const res = await fetch(url);
        const data = await res.json();
        const feeds = data.feeds;

        if (feeds && feeds.length > 0) {
          const latestFeed = feeds[feeds.length - 1];
          if (latestFeed.field2) {
            setLiveBpm(parseInt(latestFeed.field2));
          }
        }
      } catch (err) {
        console.log("ThingSpeak Error on History Page: ", err);
      }
    };

    fetchThingSpeak();
    const interval = setInterval(fetchThingSpeak, 20000); 
    return () => clearInterval(interval);
  }, [tsChannelId, tsApiKey]); // Re-run if keys change

  const sendAction = async (action: string) => {
    if (!deviceId) return;

    await setDoc(doc(db, "devices", deviceId, "commands"), {
      action,
    });
  };

  const getStatusType = () => {
    if (liveStatus === "PENDING_RESPONSE") return "waiting";
    if (liveStatus === "UNRESPONSIVE") return "emergency";
    return null;
  };

  const showPopup = liveStatus === "UNRESPONSIVE";

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

        {incidents.map((item, index) => (
          <FallCard
            key={index}
            status={mapHistoryStatus(item.status)}
            gForce={item.peakG}
            time={formatDate(item.timestamp)}
          />
        ))}
      </ScrollView>

      <EmergencyPopup
        visible={showPopup}
        gForce={latestIncident?.peakG || 0}
        bpm={liveBpm} 
        onEmergency={() => sendAction("EMERGENCY_CONFIRMED")}
        onFalseAlarm={() => sendAction("FALSE_ALARM")}
      />
    </View>
  );
}

const mapHistoryStatus = (status: string) => {
  if (status === "RESOLVED") return "resolved";
  if (status === "EMERGENCY") return "emergency";
  if (status === "FALSE_ALARM") return "false";
  return "resolved";
};

const formatDate = (timestamp: any) => {
  if (!timestamp) return "-";
  return new Date(timestamp).toLocaleDateString();
};

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
    flex: 2,
    justifyContent: "center",
    alignItems: "center",
  },
});