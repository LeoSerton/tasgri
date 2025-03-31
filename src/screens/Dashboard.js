import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, FlatList, Alert } from "react-native";
import { auth, db } from "../firebaseConfig";
import { collection, getDocs, query, where, doc, getDoc, onSnapshot } from "firebase/firestore";
import { FAB } from "react-native-paper"; 

export default function Dashboard({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [userName, setUserName] = useState(""); 
  const [users, setUsers] = useState([]);
  const [selectedReminderTime, setSelectedReminderTime] = useState('5');

  const user = auth.currentUser;
  

      // Fetch the current logged in user's name and tasks from Firestore
  useEffect(() => {
    const fetchUserName = async () => {
      try {
        if (user) {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const { name } = userDoc.data();
            setUserName(`${name}`);
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

    useEffect(() => {
      const unsubscribe = () => {
        if (user) {
          const tasksRef = collection(db, "tasks");
          const q = query(tasksRef, where("assignedUsers", "array-contains", user.uid));
  
          // Use onSnapshot for real-time updates
          return onSnapshot(q, (querySnapshot) => {
            const taskData = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
  
            // Sort tasks: Incomplete first, ordered by priority; completed last
            const sortedTasks = taskData.sort((a, b) => {
              if (a.status === "Completed" && b.status !== "Completed") return 1;
              if (a.status !== "Completed" && b.status === "Completed") return -1;
              return a.priority - b.priority; // Lower priority value = higher priority
            });
  
            setTasks(sortedTasks);
          });
        }
      };
      return unsubscribe();
    }, [user]);
  



  const handleAddTask = () => {
    navigation.navigate("CreateTask");
  };

  // Fetch and render tasks to display on dashboard with task details
  const renderTask = ({ item }) => {
    let taskStyle = [styles.taskContainer];
  
    if (item.status === "Completed") {
      taskStyle.push(styles.completedTask); // Completed tasks are always green
    } else {
      // Apply priority-based colors only if not completed
      if (item.priority === "High") {
        taskStyle.push(styles.highPriorityTask);
      } else if (item.priority === "Medium") {
        taskStyle.push(styles.mediumPriorityTask);
      }
    }
  
    return (
      <View style={taskStyle}>
        <Text style={styles.taskTitle}>{item.name}</Text>
        <Text style={styles.taskDetails}>Description: {item.description}</Text>
        <Text style={styles.taskDetails}>Priority: {item.priority}</Text>
        <Text style={styles.taskDetails}>Status: {item.status}</Text>
        <Text style={styles.taskDetails}>
          Assigned Users:{" "}
          {item.assignedUsers
            .map((uid) => {
              const user = users.find((u) => u.id === uid);
              return user ? `${user.name} ${user.surname}` : "Unknown User";
            })
            .join(", ")}
        </Text>
        <Text style={styles.taskDetails}>
          Due Date: {item.dueDate ? item.dueDate.toDate().toLocaleString() : "No due date"}
        </Text>
        <Button 
          title="View Details"
          onPress={() => navigation.navigate("TaskDetail", { taskId: item.id })}
        />
      </View>
    );
  };
  

  return (
    <FlatList
      ListHeaderComponent={
        <View style={styles.container}>
          <Text style={styles.welcome}>Welcome, {userName}</Text>
          <FAB
            style={styles.fab}
            icon="plus"
            label="Add Task"
            onPress={handleAddTask}
          />
          
        </View>
      }
      data={tasks}
      keyExtractor={(item) => item.id}
      renderItem={renderTask}
      ListEmptyComponent={<Text style={styles.noTasks}>No tasks assigned to you yet.</Text>}
      
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f3f4f6",
  },
  welcome: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
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
    marginTop: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  taskDetails: {
    fontSize: 14,
    color: "#6b7280",
  },
  noTasks: {
    textAlign: "center",
    color: "#6b7280",
    marginTop: 20,
  },
  fab: {
    position: "absolute",
    right: 16,
    top: 16,
    backgroundColor: "#007AFF",
  },
  completedTask: {
    backgroundColor: "#d4edda", 
    opacity: 0.8, 
  },
  highPriorityTask: {
    backgroundColor: "#f8d7da", 
  },
  mediumPriorityTask: {
    backgroundColor: "#fff3cd", 
  },

});


