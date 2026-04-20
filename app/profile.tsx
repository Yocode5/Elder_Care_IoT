import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";
import { Fonts } from "../constants/theme";

export default function Profile() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [fullName, setFullName] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [gender, setGender] = useState("Male");
  const [dob, setDob] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  const genderOptions = ["Male", "Female", "Other"];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setFullName(`${data.firstName} ${data.lastName}`);
            setDeviceId(data.deviceId || "");
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setFetching(false);
      }
    };
    fetchUserData();
  }, []);

  const handleCreateProfile = async () => {
    if (!fullName || !deviceId || !gender || !dob || !height || !weight) {
      Alert.alert("Error", "Please fill in all health metrics");
      return;
    }
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No user logged in");
      const nameParts = fullName.trim().split(" ");
      await updateDoc(doc(db, "users", user.uid), {
        firstName: nameParts[0],
        lastName: nameParts.slice(1).join(" "),
        deviceId,
        gender,
        dob,
        height,
        weight,
        profileCompleted: true,
      });
      Alert.alert("Success", "Health profile created!");
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#57B9AB" />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <View style={styles.tealBackground} />

      <View style={styles.navBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.navigate("/(tabs)")}>
          <Ionicons name="chevron-back" size={24} color="#57B9AB" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        nestedScrollEnabled={true} 
      >
        
        <View style={styles.avatarWrapper}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={50} color="#8E8E93" />
          </View>
        </View>

        <View style={styles.whiteCard}>
          <View style={styles.inputBox}>
            <Text style={styles.label}>First name & Last name</Text>
            <TextInput style={styles.input} value={fullName} onChangeText={setFullName} />
          </View>

          <View style={[styles.row, { zIndex: 5000 }]}> 
            <View style={[styles.inputBox, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Device ID</Text>
              <TextInput style={styles.input} value={deviceId} onChangeText={setDeviceId} />
            </View>
            
            <View style={{ flex: 1, zIndex: 6000 }}>
              <Text style={styles.label}>Gender</Text>
              <TouchableOpacity 
                style={styles.dropdownHeader} 
                onPress={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <Text style={styles.dropdownValue}>{gender}</Text>
                <Ionicons 
                  name={isDropdownOpen ? "chevron-up" : "chevron-down"} 
                  size={18} 
                  color="#57B9AB" 
                />
              </TouchableOpacity>

              {isDropdownOpen && (
                <View style={styles.floatingList}>
                  {genderOptions.map((option) => (
                    <TouchableOpacity 
                      key={option} 
                      style={styles.dropdownOption}
                      onPress={() => {
                        setGender(option);
                        setIsDropdownOpen(false);
                      }}
                    >
                      <Text style={[
                        styles.optionText, 
                        gender === option && { color: "#57B9AB", fontWeight: "bold" }
                      ]}>
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          <View style={styles.inputBox}>
            <Text style={styles.label}>Date of birth</Text>
            <View style={styles.dropdownContainer}>
              <TextInput style={styles.input} value={dob} placeholder="YYYY/MM/DD" onChangeText={setDob} />
              <Ionicons name="calendar-outline" size={20} color="#57B9AB" style={styles.iconRight} />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputBox, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Height (cm)</Text>
              <TextInput style={styles.input} value={height} keyboardType="numeric" onChangeText={setHeight} />
            </View>
            <View style={[styles.inputBox, { flex: 1 }]}>
              <Text style={styles.label}>Weight (kg)</Text>
              <TextInput style={styles.input} value={weight} keyboardType="numeric" onChangeText={setWeight} />
            </View>
          </View>

          <View style={styles.inputBox}>
            <Text style={styles.label}>Password</Text>
            <TextInput style={styles.input} secureTextEntry placeholder="••••••••" />
          </View>

          <TouchableOpacity style={styles.linkRight}>
            <Text style={styles.linkText}>Change Password</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.submitBtn} onPress={handleCreateProfile}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitBtnText}>Create profile</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tealBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 350,
    backgroundColor: "#57B9AB",
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 40,
  },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 25,
    paddingTop: Platform.OS === "ios" ? 60 : 50,
    zIndex: 100,
  },
  backButton: {
    backgroundColor: "#FFF",
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFF",
    marginLeft: 60,
  },
  scrollContent: {
    paddingTop: 40,
    paddingBottom: 40,
  },
  avatarWrapper: {
    alignItems: "center",
    zIndex: 2,
    marginTop: 20,
  },
  avatarCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#C8E9E6",
    borderWidth: 5,
    borderColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  whiteCard: {
    backgroundColor: "#FFF",
    marginHorizontal: 25,
    marginTop: -55, 
    paddingTop: 80,
    paddingHorizontal: 20,
    paddingBottom: 30,
    borderRadius: 30,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  inputBox: {
    marginBottom: 15,
  },
  label: {
    color: "#8A94A6",
    fontSize: 13,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E6F0",
    borderRadius: 15,
    padding: 12,
    fontSize: 15,
    color: "#1A1A1A",
  },
  
  dropdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E6F0",
    borderRadius: 15,
    padding: 12,
    backgroundColor: "#FFF",
    height: 48,
  },
  dropdownValue: {
    fontSize: 14,
    color: "#1A1A1A",
  },
  floatingList: {
    position: "absolute", 
    top: 70, 
    left: 0,
    right: 0,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E0E6F0",
    borderRadius: 15,
    zIndex: 9999, 
    elevation: 5, 
    shadowColor: "#000", 
    shadowOpacity: 0.1,
    shadowRadius: 10,
    overflow: "hidden",
  },
  dropdownOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  optionText: {
    fontSize: 14,
    color: "#4A4A4A",
  },
  
  row: {
    flexDirection: "row",
   
  },
  dropdownContainer: {
    justifyContent: "center",
  },
  iconRight: {
    position: "absolute",
    right: 15,
  },
  linkRight: {
    alignItems: "flex-end",
    marginBottom: 25,
  },
  linkText: {
    color: "#57B9AB",
    fontWeight: "bold",
  },
  submitBtn: {
    backgroundColor: "#57B9AB",
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: "center",
  },
  submitBtnText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});