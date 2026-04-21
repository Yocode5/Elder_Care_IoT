import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from "react-native";

// If you use Lucide or Ionicons, you can replace the emoji with a real icon component
// import { Bell } from 'lucide-react-native';

type Props = {
  visible: boolean;
  gForce: number;
  bpm: number; // Added BPM as per the image
  onEmergency: () => void;
  onFalseAlarm: () => void;
};

const EmergencyPopup: React.FC<Props> = ({
  visible,
  gForce,
  bpm,
  onEmergency,
  onFalseAlarm,
}) => {
  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          
          {/* Circular Icon Header */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
               <Text style={{fontSize: 40}}>🔔</Text> 
            </View>
          </View>

          <Text style={styles.title}>Wearer Unresponsive</Text>

          <Text style={styles.info}>
            The wearer has not responded to the reassuring buzzer; assuming critical.
          </Text>

          {/* Metric Cards Section */}
          <View style={styles.metricsRow}>
            <View style={[styles.metricCard, { backgroundColor: '#D6D8FF' }]}>
              <Text style={styles.metricLabel}>G Force</Text>
              <Text style={styles.metricValue}>{gForce.toFixed(1)}</Text>
            </View>

            <View style={[styles.metricCard, { backgroundColor: '#FFC1E3' }]}>
              <Text style={styles.metricLabel}>BPM</Text>
              <Text style={styles.metricValue}>{bpm}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.emergencyBtn]}
              onPress={onEmergency}
            >
              <Text style={styles.buttonText}>Notify Emergency</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.falseBtn]}
              onPress={onFalseAlarm}
            >
              <Text style={styles.buttonText}>False Alarm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default EmergencyPopup;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)", // Darkened backdrop
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "85%",
    backgroundColor: "#FFFFFF",
    borderRadius: 30, // Softer corners as per image
    padding: 24,
    alignItems: "center",
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  iconContainer: {
    marginBottom: 15,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF8A8A', // Pinkish-red circle
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#000",
    textAlign: 'center',
    marginBottom: 10,
  },
  info: {
    color: "#666",
    textAlign: 'center',
    fontSize: 12,
    marginBottom: 20,
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    marginBottom: 30,
  },
  metricCard: {
    width: 90,
    height: 90,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
  },
  button: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  emergencyBtn: {
    backgroundColor: "#D96A6A", // Desaturated red/coral
  },
  falseBtn: {
    backgroundColor: "#2BB5B5", // Teal color from image
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
  },
});