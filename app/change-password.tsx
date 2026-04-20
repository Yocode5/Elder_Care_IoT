import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { auth } from "../config/firebase";

export default function ChangePassword() {
  const router = useRouter();
  
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match.");
      return;
    }
    const user = auth.currentUser;
    if (!user || !user.email) {
      Alert.alert("Error", "User not logged in.");
      return;
    }
    setLoading(true);
    try {
      // re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, oldPassword);
      await reauthenticateWithCredential(user, credential);
      // update password
      await updatePassword(user, newPassword);
      Alert.alert("Success", "Password updated successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      if (router.canGoBack()) {
        router.back();
      } else {
       router.replace("/(tabs)/home" as any);
      }

    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
         Alert.alert("Error", "The old password you entered is incorrect.");
      } else if (error.code === 'auth/weak-password') {
         Alert.alert("Error", "The new password is too weak. Please use at least 6 characters.");
      } else {
         Alert.alert("Error", error.message || "Failed to update password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <View style={styles.mainContainer}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={styles.formContainer}>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              placeholder="Old Password"
              placeholderTextColor="#8A94A6"
              secureTextEntry
              value={oldPassword}
              onChangeText={setOldPassword}
            />
          </View>

          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              placeholder="New Password"
              placeholderTextColor="#8A94A6"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
          </View>

          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#8A94A6"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>

          <TouchableOpacity 
            style={[styles.submitBtn, loading && { opacity: 0.7 }]} 
            onPress={handlePasswordChange}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitBtnText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 25,
    paddingTop: Platform.OS === "ios" ? 60 : 50,
  },
  backButton: {
    padding: 5,
    marginLeft: -5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 25,
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 30,
  },
  formContainer: {
    marginTop: 10,
  },
  inputBox: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E6F0", 
    borderRadius: 15,      
    padding: 15,
    fontSize: 15,
    color: "#1A1A1A",       
    backgroundColor: "#FFF",
  },
  submitBtn: {
    backgroundColor: "#57B9AB", 
    paddingVertical: 16,
    borderRadius: 20,           
    alignItems: "center",
    marginTop: 10,
  },
  submitBtnText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});