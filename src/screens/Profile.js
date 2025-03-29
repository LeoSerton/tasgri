import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Button, Alert } from "react-native";
import { signOut, deleteUser } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

export default function Profile({ navigation }) {
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!auth.currentUser) {
        Alert.alert("Error", "No authenticated user found.");
        return;
      }

      try {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserDetails(userDoc.data());
        } else {
          console.log("User document not found");
        }
      } catch (error) {
        Alert.alert("Error", "Failed to fetch user details: " + error.message);
      }
    };

    fetchUserDetails();
  }, []);

  // Handle logout
  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        Alert.alert("Logged Out", "You have been logged out.");
        navigation.replace("Login");
      })
      .catch((error) => {
        Alert.alert("Error", "Failed to log out: " + error.message);
      });
  };

  // Handle account deletion
  const handleDeleteAccount = () => {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert("Error", "No authenticated user found.");
      return;
    }

    // Delete user data from Firestore
    const deleteUserData = async () => {
      try {
        await deleteDoc(doc(db, "users", user.uid));
        await deleteUser(user);
        Alert.alert("Account Deleted", "Your account has been deleted.");
        navigation.replace("Login");
      } catch (error) {
        Alert.alert("Error", "Failed to delete account: " + error.message);
      }
    };

    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel" },
        { text: "Delete", onPress: deleteUserData },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Profile Screen</Text>

      {auth.currentUser && userDetails ? (
        <View style={styles.detailsContainer}>
          <Text style={styles.detailsText}>Name: {userDetails.name} {userDetails.surname}</Text>
          <Text style={styles.detailsText}>Email: {auth.currentUser.email}</Text>
        </View>
      ) : (
        <Text>Loading...</Text>
      )}

      <Button title="Log Out" onPress={handleLogout} />
      <Button title="Delete Account" onPress={handleDeleteAccount} color="red" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    padding: 20,
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  detailsContainer: {
    marginBottom: 20,
  },
  detailsText: {
    fontSize: 16,
    marginBottom: 10,
  },
});
