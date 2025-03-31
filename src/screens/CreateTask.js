import React, { useEffect, useState } from "react";
import { View, Text, Button, TextInput, StyleSheet, FlatList, Alert } from "react-native";
import { auth, db } from "../firebaseConfig";
import { collection, getDocs, query, where, addDoc, doc, getDoc } from "firebase/firestore";
import MultiSelect from "react-native-multiple-select";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Notifications from 'expo-notifications';

export default function Dashboard({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [userName, setUserName] = useState(""); 
  const [taskName, setTaskName] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [assignedUsers, setAssignedUsers] = useState([]); 
  const [taskPriority, setTaskPriority] = useState("Low"); 
  const [taskStatus, setTaskStatus] = useState("Pending"); 
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedReminderTime, setSelectedReminderTime] = useState('5');

  const handleReminderChange = (itemValue) => {
    setSelectedReminderTime(itemValue);
  };

  const user = auth.currentUser;

  const [reminderTime, setReminderTime] = useState(5); // set default reminder time to desired time

  //function to prevent 'r' from triggering the fast refresh in Expo
  //function called in input text boxes
  const handleKeyPress = (e) => {
    if (e.nativeEvent.key === "r" || e.nativeEvent.key === "R") {
      e.preventDefault(); 
    }
  };
  

      // Fetch the current logged in user's name from Firestore
  useEffect(() => {
    const fetchUserName = async () => {
      try {
        if (user) {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const { name, surname } = userDoc.data();
            setUserName(`${name} ${surname}`);
          } else {
            console.log("User document not found in Firestore.");
          }
        }
      } catch (error) {
        Alert.alert("Error", "Failed to fetch user data: " + error.message);
      }
    };

    fetchUserName();
  }, [user]);


      // Fetch all added users for the multi selection list
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = collection(db, "users");
        const querySnapshot = await getDocs(usersRef);
        const userList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(userList);
      } catch (error) {
        Alert.alert("Error", "Failed to fetch users: " + error.message);
      }
    };
    fetchUsers();
  }, []);


// Create new task to add to Firebase
const handleCreateTask = async () => {
  if (!taskName || assignedUsers.length === 0 || !dueDate) {
    Alert.alert("Error", "Task name, assigned users, and due date are required.");
    return;
  }

  // Calculate the reminder time (in milliseconds for firebase)
  let reminderTimestamp = null;
  if (reminderTime > 0) {
    reminderTimestamp = new Date(dueDate).getTime() - reminderTime * 60 * 1000; // Subtract reminder time (in minutes)
  }

  // Task details that can be altered
  try {
    await addDoc(collection(db, "tasks"), {
      name: taskName,
      description: taskDescription,
      priority: taskPriority,
      status: taskStatus,
      assignedUsers,
      dueDate: dueDate, 
      reminderTime: reminderTimestamp,
      createdAt: new Date(),
    });

    // Reset task form fields
    setTaskName("");
    setTaskDescription("");
    setAssignedUsers([]);
    setTaskPriority("Low");
    setTaskStatus("Pending");

    // If reminder is set, schedule the notification
    if (reminderTimestamp) {
      scheduleReminder(reminderTimestamp);
    }

    // Show success message and navigate back to dashboard
    Alert.alert("Success", "Task created successfully!");
    navigation.navigate("Main");
  } catch (error) {
    Alert.alert("Error", "Failed to create task: " + error.message);
  }
};

   // Function to show date picker
   const showDatePickerHandler = () => {
    setShowDatePicker(true);
  };

  // Function to handle date change from the picker
  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || dueDate;
    setShowDatePicker(false);
    setDueDate(currentDate);
  };

// Function to schedule the reminder notification using Expo
const scheduleReminder = async (reminderTimestamp) => {
    const reminderTime = new Date(reminderTimestamp);
  
    // Schedule a local notification (using Expo Notifications)
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Reminder: Task is due soon!",
        body: "You have a task reminder.",
      },
      trigger: {
        date: reminderTime, 
      },
    });
  };


  return (
    <FlatList
      ListHeaderComponent={
        <View style={styles.container}>
          <View style={styles.createTaskContainer}>
            <Text style={styles.sectionTitle}>Create New Task</Text>
            <TextInput
              style={styles.input}
              placeholder="Task Name"
              value={taskName}
              onChangeText={setTaskName}
              onKeyPress={handleKeyPress}
            />
            <TextInput
              style={styles.input}
              placeholder="Task Description"
              value={taskDescription}
              onChangeText={setTaskDescription}
              onKeyPress={handleKeyPress}
            />
            <MultiSelect
              items={users.map((user) => ({
                id: user.id,
                name: `${user.name} ${user.surname}`,
              }))}
              uniqueKey="id"
              onSelectedItemsChange={setAssignedUsers}
              selectedItems={assignedUsers}
              selectText="Assign Users"
              searchInputPlaceholderText="Search Users..."
              tagRemoveIconColor="#007bff"
              tagBorderColor="#007bff"
              tagTextColor="#007bff"
              selectedItemTextColor="#007bff"
              selectedItemIconColor="#007bff"
              itemTextColor="#000"
              displayKey="name"
              searchInputStyle={{ color: "#007bff" }}
              styleDropdownMenuSubsection={{
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 8,
                padding: 8,
              }}
            />
            <Text style={styles.sectionTitle}>Task Priority</Text>
            <Picker selectedValue={taskPriority} onValueChange={setTaskPriority} style={styles.input}>
              <Picker.Item label="Low" value="Low" />
              <Picker.Item label="Medium" value="Medium" />
              <Picker.Item label="High" value="High" />
            </Picker>
            <Text style={styles.sectionTitle}>Task Status</Text>
            <Picker selectedValue={taskStatus} onValueChange={setTaskStatus} style={styles.input}>
              <Picker.Item label="Pending" value="Pending" />
              <Picker.Item label="In Progress" value="In Progress" />
              <Picker.Item label="Completed" value="Completed" />
            </Picker>
            <Text style={styles.sectionTitle}>Reminder Time</Text>
            <Picker selectedValue={selectedReminderTime} 
                    onValueChange={handleReminderChange} 
            >
            <Picker.Item label="5 minutes" value="5" />
            <Picker.Item label="10 minutes" value="10" />
            <Picker.Item label="15 minutes" value="15" />
            <Picker.Item label="30 minutes" value="30" />
            </Picker>

            <Text style={styles.sectionTitle}>Due Date and Time</Text>
            <Button title={`Select Due Date: ${dueDate.toLocaleString()}`} onPress={showDatePickerHandler} />
            {showDatePicker && (
              <DateTimePicker
                value={dueDate}
                mode="datetime"
                display="default"
                onChange={handleDateChange}
              />
            )}

            <Button title="Create Task" onPress={handleCreateTask} />
          </View>
          
        </View>
      }
      
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f3f4f6",
    marginTop: 40,
  },
  createTaskContainer: {
    marginBottom: 20,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
  },
  taskContainer: {
    backgroundColor: "#ffffff",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
});