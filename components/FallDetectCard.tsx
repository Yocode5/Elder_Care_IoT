import React from "react";
import { StyleSheet, Text, View } from "react-native";

type FallStatus = "waiting" | "resolved" | "emergency" | "false";

interface FallCardProps {
  status: FallStatus;
  gForce: string | number;
  time: string;
  highlighted?: boolean;
}

const statusColors: Record<FallStatus, { bg: string; text: string }> = {
  waiting: { bg: "#FEFCE8", text: "#EA9B3B" },
  resolved: { bg: "#DCFCE7", text: "#166534" },
  emergency: { bg: "#FEE2E2", text: "#991B1B" },
  false: { bg: "#E5E7EB", text: "#374151" },
};

const statusLabels: Record<FallStatus, string> = {
  waiting: "Waiting Response",
  resolved: "Resolved",
  emergency: "Emergency",
  false: "False Alarm",
};

export const FallCard = ({
  status,
  gForce,
  time,
  highlighted = false,
}: FallCardProps) => {
  const colors = statusColors[status];
  const statusLabel = statusLabels[status];

  return (
    <View
      style={[
        styles.container,
        highlighted ? styles.containerHighlighted : styles.containerNormal,
      ]}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.badge,
              highlighted ? styles.badgeHighlighted : styles.badgeNormal,
            ]}
          >
            <Text style={{ fontSize: 16 }}>Bell</Text>
          </View>

          <Text
            style={[
              styles.title,
              highlighted ? styles.titleHighlighted : styles.titleNormal,
            ]}
          >
            Fall Detected
          </Text>
        </View>

        <View
          style={[
            styles.status,
            {
              backgroundColor: highlighted ? "rgba(0,0,0,0.2)" : colors.bg,
            },
          ]}
        >
          <Text
            style={{
              color: highlighted ? "#fff" : colors.text,
              fontSize: 12,
            }}
          >
            {statusLabel}
          </Text>
        </View>
      </View>

      <View style={styles.details}>
        <Text
          style={[
            styles.detailText,
            { color: highlighted ? "#fff" : "#000" },
          ]}
        >
          G Force: {gForce}
        </Text>

        <Text
          style={[
            styles.detailText,
            { color: highlighted ? "#fff" : "#000" },
          ]}
        >
          Time: {time}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    backgroundColor: "#fff",
  },

  containerHighlighted: {
    backgroundColor: "#14b8a6",
  },

  containerNormal: {
    backgroundColor: "#fff",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  badge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8, // 👈 instead of gap
  },

  badgeHighlighted: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },

  badgeNormal: {
    backgroundColor: "#CCFBF1",
  },

  title: {
    fontSize: 16,
    fontWeight: "600",
  },

  titleHighlighted: {
    color: "#fff",
  },

  titleNormal: {
    color: "#000",
  },

  status: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },

  details: {
    marginTop: 4,
  },

  detailText: {
    fontSize: 14,
    marginBottom: 4,
  },
});