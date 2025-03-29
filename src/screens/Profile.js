// import React, { useState, useEffect } from "react";
// import { View, Text, StyleSheet, Button, Alert } from "react-native";
// import { signOut, deleteUser } from "firebase/auth";
// import { auth } from "../firebaseConfig";
// import { doc, getDoc, deleteDoc } from "firebase/firestore";
// import { db } from "../firebaseConfig";

// export default function Profile({ navigation }) {
//   const [userDetails, setUserDetails] = useState(null);

//   useEffect(() => {
//     const fetchUserDetails = async () => {
//       if (!auth.currentUser) {
//         Alert.alert("Error", "No authenticated user found.");
//         return;
//       }

//       try {
//         const userDocRef = doc(db, "users", auth.currentUser.uid);
//         const userDoc = await getDoc(userDocRef);
//         if (userDoc.exists()) {
//           setUserDetails(userDoc.data());
//         } else {
//           console.log("User document not found");
//         }
//       } catch (error) {
//         Alert.alert("Error", "Failed to fetch user details: " + error.message);
//       }
//     };

//     fetchUserDetails();
//   }, []);

//   // Handle logout
//   const handleLogout = () => {
//     signOut(auth)
//       .then(() => {
//         Alert.alert("Logged Out", "You have been logged out.");
//         navigation.replace("Login");
//       })
//       .catch((error) => {
//         Alert.alert("Error", "Failed to log out: " + error.message);
//       });
//   };

//   // Handle account deletion
//   const handleDeleteAccount = () => {
//     const user = auth.currentUser;

//     if (!user) {
//       Alert.alert("Error", "No authenticated user found.");
//       return;
//     }

//     // Delete user data from Firestore
//     const deleteUserData = async () => {
//       try {
//         await deleteDoc(doc(db, "users", user.uid));
//         await deleteUser(user);
//         Alert.alert("Account Deleted", "Your account has been deleted.");
//         navigation.replace("Login");
//       } catch (error) {
//         Alert.alert("Error", "Failed to delete account: " + error.message);
//       }
//     };

//     Alert.alert(
//       "Confirm Deletion",
//       "Are you sure you want to delete your account? This action cannot be undone.",
//       [
//         { text: "Cancel" },
//         { text: "Delete", onPress: deleteUserData },
//       ]
//     );
//   };

//   return (
//     <View style={styles.container}>

//       {auth.currentUser && userDetails ? (
//         <View style={styles.detailsContainer}>
//           <Text style={styles.detailsText}>Name: {userDetails.name} {userDetails.surname}</Text>
//           <Text style={styles.detailsText}>Email: {auth.currentUser.email}</Text>
//         </View>
//       ) : (
//         <Text>Loading...</Text>
//       )}

//       <Button title="Log Out" onPress={handleLogout} />
//       <Button title="Delete Account" onPress={handleDeleteAccount} color="red" />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#f3f4f6",
//     padding: 20,
//   },
//   text: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: "#333",
//   },
//   detailsContainer: {
//     marginBottom: 20,
//   },
//   detailsText: {
//     fontSize: 16,
//     marginBottom: 10,
//   },
// });

import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Button, TextInput, Alert, Image } from "react-native";
import { signOut, deleteUser } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { launchImageLibrary } from "react-native-image-picker";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid"; // For generating unique image names

export default function Profile({ navigation }) {
  const [userDetails, setUserDetails] = useState(null);
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [profilePic, setProfilePic] = useState(null); // Holds the selected profile picture
  const [loading, setLoading] = useState(false);

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
          setName(userDoc.data().name);
          setSurname(userDoc.data().surname);
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

  // Function to handle image picker
  const pickImage = async () => {
    launchImageLibrary(
      {
        mediaType: "photo",
        quality: 0.5,
      },
      async (response) => {
        if (response.didCancel) {
          console.log("User cancelled image picker");
        } else if (response.errorMessage) {
          console.log("ImagePicker Error: ", response.errorMessage);
        } else {
          const source = { uri: response.assets[0].uri }; // Ensure correct asset reference
          setProfilePic(source); // Set selected image as the new profile picture
        }
      }
    );
  };

  // Function to handle profile update
  const handleProfileUpdate = async () => {
    setLoading(true);

    let profilePicUrl = userDetails?.profilePic;

    if (profilePic) {
      try {
        const storage = getStorage();
        const storageRef = ref(storage, "profile_pictures/" + uuidv4());
        const response = await fetch(profilePic.uri);
        const blob = await response.blob();

        // Upload image to Firebase Storage
        await uploadBytes(storageRef, blob);

        // Get the download URL of the uploaded image
        profilePicUrl = await getDownloadURL(storageRef);
      } catch (error) {
        setLoading(false);
        Alert.alert("Error", "Failed to upload profile picture: " + error.message);
        return;
      }
    }

    try {
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userDocRef, {
        name,
        surname,
        profilePic: profilePicUrl,
      });

      setUserDetails({ ...userDetails, name, surname, profilePic: profilePicUrl });
      Alert.alert("Profile Updated", "Your profile has been updated.");
    } catch (error) {
      Alert.alert("Error", "Failed to update profile: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {userDetails ? (
        <View style={styles.detailsContainer}>
          <Text style={styles.detailsText}>Name: {userDetails.name} {userDetails.surname}</Text>
          <TextInput
            style={styles.input}
            placeholder="Update Name"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Update Surname"
            value={surname}
            onChangeText={setSurname}
          />
          <View style={styles.profilePicContainer}>
            {profilePic ? (
              <Image source={profilePic} style={styles.profilePic} />
            ) : (
              <Text style={styles.placeholderText}>No Profile Picture</Text>
            )}
            <Button title="Change Profile Picture" onPress={pickImage} />
          </View>
        </View>
      ) : (
        <Text>Loading...</Text>
      )}

      <Button title="Update Profile" onPress={handleProfileUpdate} disabled={loading} />
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
  detailsContainer: {
    marginBottom: 20,
  },
  detailsText: {
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
    width: "80%",
  },
  profilePicContainer: {
    marginBottom: 16,
    alignItems: "center",
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  placeholderText: {
    fontSize: 16,
    color: "#888",
  },
});
