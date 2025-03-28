import React from "react";
import { View, Text, StyleSheet } from "react-native";

// Boilerplate Code for profile screen; 
// Add basic user info and allow user to add a profile picture to be saved in Firebase Storage
// Add option to delete account / sign out
// Maybe add basic summary of current outstanding tasks 
const Profile = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Profile Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
});

export default Profile;
