import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import {
  doc,
  onSnapshot,
  collection,
} from "firebase/firestore";
import { db, auth } from "../../config/firebase"; 
import { LineChart } from "react-native-chart-kit";

export default function Home() {
  const [loading, setLoading] = useState(true);
  
  const [deviceId, setDeviceId] = useState<string | null>(null);

  // States to hold the dynamic ThingSpeak credentials
  const [tsChannelId, setTsChannelId] = useState<string | null>(null);
  const [tsApiKey, setTsApiKey] = useState<string | null>(null);

  const [activity, setActivity] = useState("...");
  const [status, setStatus] = useState("...");

  const [bpmHistory, setBpmHistory] = useState<number[]>([]);
  const [spo2History, setSpo2History] = useState<number[]>([]);
  const [tempHistory, setTempHistory] = useState<number[]>([]);

  const [timeLabels, setTimeLabels] = useState<string[]>([]);

  const [bpm, setBpm] = useState<number | null>(null);
  const [spo2, setSpo2] = useState<number | null>(null);
  const [temp, setTemp] = useState<number | null>(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const unsub = onSnapshot(userRef, (snap) => {
      const data = snap.data();
      if (data?.deviceId) {
        setDeviceId(data.deviceId);
      }
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (!deviceId) return;

    const unsub = onSnapshot(doc(db, "devices", deviceId), (snap) => {
      const data = snap.data();
      if (data?.live_status) {
        setActivity(data.live_status.activity || "Resting");
        setStatus(data.live_status.currentSituation || "STABLE");
      }

      // Grab keys dynamically from the root of the document
      if (data?.thingspeakChannelId && data?.thingspeakApiKey) {
        setTsChannelId(data.thingspeakChannelId);
        setTsApiKey(data.thingspeakApiKey);
      }
    });
    return () => unsub();
  }, [deviceId]);

  useEffect(() => {
    if (!deviceId) return; 

    const unsub = onSnapshot(
      collection(db, "devices", deviceId, "telemetry_history"),
      (snap) => {
        const temps: number[] = [];

        snap.forEach(doc => {
          const d = doc.data();
          if (d.temperatureF) temps.push(d.temperatureF);
        });

        setTempHistory(temps.slice(-10));
        setTemp(temps[temps.length - 1] || null);

        setLoading(false); 
      }
    );
    return () => unsub();
  }, [deviceId]);

  useEffect(() => {
    // Only run fetch if we successfully loaded the keys from Firestore
    if (!tsChannelId || !tsApiKey) return;

    const fetchThingSpeak = async () => {
      try {
        // Dynamic URL injected with keys
        const url = `https://api.thingspeak.com/channels/${tsChannelId}/feeds.json?api_key=${tsApiKey}&results=10`;
        const res = await fetch(url);

        const data = await res.json();
        const feeds = data.feeds;

        const bpmArr: number[] = [];
        const spo2Arr: number[] = [];
        const times: string[] = [];

        feeds.forEach((f: any) => {
          if (f.field1 && f.field2) {
            spo2Arr.push(parseFloat(f.field1)); 
            bpmArr.push(parseInt(f.field2));    

            const date = new Date(f.created_at);
            const label = date.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });

            times.push(label);
          }
        });

        const last4Bpm = bpmArr.slice(-4);
        const last4Spo2 = spo2Arr.slice(-4);
        const last4Times = times.slice(-4);

        setBpmHistory(last4Bpm);
        setSpo2History(last4Spo2);
        setTimeLabels(last4Times);

        setBpm(last4Bpm[last4Bpm.length - 1]);
        setSpo2(last4Spo2[last4Spo2.length - 1]);

      } catch (err) {
        console.log("ThingSpeak Error: ", err);
      }
    };

    fetchThingSpeak();
    const interval = setInterval(fetchThingSpeak, 20000); 
    return () => clearInterval(interval);
  }, [tsChannelId, tsApiKey]); // Re-run if keys change

  if (loading || !deviceId) {
    return (
      <View style={styles.center}>
        <Text style={{ marginBottom: 10, color: "#6B7280" }}>Connecting to device...</Text>
        <ActivityIndicator size="large" color="#21B3A6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>24 Hour Activity</Text>

        <View style={styles.row}>
          <View style={[
            styles.status,
            { backgroundColor: status === "STABLE" ? "#21B3A6" : "#EF4444" }
          ]}>
            <Text style={styles.statusText}>Live status: {status}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Health Metrics</Text>

      {renderChart("Heart Rate", bpmHistory, bpm, timeLabels, "#EF4444")}
      {renderChart("Oxygen", spo2History, spo2, timeLabels, "#8B5CF6")}
      {renderChart("Temperature", tempHistory.slice(-4), temp, timeLabels, "#3B82F6")}

    </ScrollView>
  );
}

function renderChart(
  title: string,
  dataArr: number[],
  latest: any,
  labels: string[],
  color: string
) {

  const formattedLatest = latest != null 
    ? Number(latest).toFixed(title === "Heart Rate" ? 0 : 1) 
    : "--";

  return (
    <View style={styles.chartCard}>
      <Text style={styles.metricTitle}>{title}</Text>

      <LineChart
        data={{
          labels: labels.length ? labels : ["--", "--", "--", "--"],
          datasets: [{ data: dataArr.length ? dataArr : [0]}],
        }}
        width={Dimensions.get("window").width - 70} 
        height={180}
        chartConfig={{
          backgroundGradientFrom: "#fff",
          backgroundGradientTo: "#fff",
          color: () => color,
          strokeWidth: 3,
          decimalPlaces: 1,
        }}
        bezier
        withDots={true}
        withInnerLines={false}
        withOuterLines={false}
        style={{ borderRadius: 16 }}
      />

      <View style={styles.floatingBox}>
        <Text style={styles.timeText}>{labels[labels.length - 1]}</Text>
        <Text style={{ color, fontWeight: "bold" }}>
          {formattedLatest}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA", padding: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F5F7FA" },

  healthRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  gradeCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#21B3A6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  gradeText: { color: "#fff", fontWeight: "bold", fontSize: 20 },

  card: { backgroundColor: "#fff", padding: 15, borderRadius: 16, marginBottom: 20 },
  row: { flexDirection: "row", justifyContent: "space-between" },

  now: { backgroundColor: "#3B82F6", color: "#fff", padding: 6, borderRadius: 10 },
  status: { padding: 6, borderRadius: 10 },
  statusText: { color: "#fff", fontWeight: "bold" },

  sectionTitle: { fontWeight: "bold", marginBottom: 10 },

  chartCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding:15,
    marginBottom: 40,
    elevation: 0,
  },

  metricTitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 10,
  },

  floatingBox: {
    position: "absolute",
    right: 20,
    top: 60,
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 10,
    elevation: 4,
  },

  timeText: {
    fontSize: 10,
    color: "#9CA3AF",
  },
  
  gradeTitle: {
    fontWeight: "600",
    fontSize: 16,
  },

  gradeStatus: {
    color: "#21B3A6",
    fontWeight: "bold",
    fontSize: 14,
  },
});