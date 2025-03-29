import React, { useState, useEffect } from "react";
import { View, Text, Button, TextInput, StyleSheet, Alert, ScrollView, Image } from "react-native";
import { db } from "../firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { Picker } from "@react-native-picker/picker";

export default function TaskDetails({ route }) {
  const { taskId } = route.params; // Get taskId passed from Dashboard
  const navigation = useNavigation();
  
  const [task, setTask] = useState(null);
  const [taskPriority, setTaskPriority] = useState("Low");
  const [taskStatus, setTaskStatus] = useState("Pending");
  const [imageUri, setImageUri] = useState(null);

  // Fetch task details from Firestore
  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        const taskRef = doc(db, "tasks", taskId);
        const taskDoc = await getDoc(taskRef);
        if (taskDoc.exists()) {
          const taskData = taskDoc.data();
          setTask(taskData);
          setTaskPriority(taskData.priority);
          setTaskStatus(taskData.status);
          setImageUri(taskData.imageUri || null); // Set imageUri if it exists
        } else {
          Alert.alert("Error", "Task not found.");
        }
      } catch (error) {
        Alert.alert("Error", "Failed to fetch task details: " + error.message);
      }
    };
    fetchTaskDetails();
  }, [taskId]);

  // Handle task updates
  const handleUpdateTask = async () => {
    if (!task) return;

    try {
      const taskRef = doc(db, "tasks", taskId);
      await updateDoc(taskRef, {
        priority: taskPriority,
        status: taskStatus,
        imageUri: imageUri || null, // Ensure imageUri is not undefined
      });

      Alert.alert("Success", "Task updated successfully!");
      navigation.goBack(); // Go back to dashboard
    } catch (error) {
      Alert.alert("Error", "Failed to update task: " + error.message);
    }
  };

  // Handle image picking
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.cancelled) {
      setImageUri(result.uri);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { flexGrow: 1 }]}>
      {task && (
        <>
          <View style={styles.taskContainer}>
            <Text style={styles.sectionTitle}>Task Details</Text>
            <TextInput
              style={styles.input}
              placeholder="Task Name"
              value={task.name}
              editable={false}
            />
            <TextInput
              style={styles.input}
              placeholder="Task Description"
              value={task.description}
              editable={false}
            />
            <Text style={styles.label}>Priority</Text>
            <Picker
              selectedValue={taskPriority}
              onValueChange={setTaskPriority}
              style={styles.input}
            >
              <Picker.Item label="Low" value="Low" />
              <Picker.Item label="Medium" value="Medium" />
              <Picker.Item label="High" value="High" />
            </Picker>
            <Text style={styles.label}>Status</Text>
            <Picker
              selectedValue={taskStatus}
              onValueChange={setTaskStatus}
              style={styles.input}
            >
              <Picker.Item label="Pending" value="Pending" />
              <Picker.Item label="In Progress" value="In Progress" />
              <Picker.Item label="Completed" value="Completed" />
            </Picker>
            <Button title="Save Task" onPress={handleUpdateTask} />
          </View>
          <Button title="Pick Image" onPress={pickImage} />
          {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}
          <Button title="Back to Dashboard" onPress={() => navigation.navigate("Main")} />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f3f4f6",
    marginTop: 40,
  },
  taskContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  label: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginBottom: 10,
  },
});
