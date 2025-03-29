import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { doc, setDoc } from "firebase/firestore";


export default function SignupScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");

  // function to prevent 'r' refresh in expo
  const handleKeyPress = (e) => {
    if (e.nativeEvent.key === "r" || e.nativeEvent.key === "R") {
      e.preventDefault(); 
    }
  };
  

  const handleSignup = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save user details in Firestore Users collection and auth db
      await setDoc(doc(db, "users", user.uid), {
        name,
        surname,
        email,
        createdAt: new Date(),
      });

      alert("Signup Successful!");
      navigation.navigate("Main");
    } catch (error) {
      alert("Signup Failed: " + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Signup</Text>
      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={name}
        onChangeText={setName}
        // call funtion to prevent 'r' refresh in expo
        onKeyPress={handleKeyPress}
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={surname}
        onChangeText={setSurname}
        // call funtion to prevent 'r' refresh in expo
        onKeyPress={handleKeyPress}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        // call funtion to prevent 'r' refresh in expo
        onKeyPress={handleKeyPress}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        // call funtion to prevent 'r' refresh in expo
        onKeyPress={handleKeyPress}
      />
      <Button title="Signup" onPress={handleSignup} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
  },
});
