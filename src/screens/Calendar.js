import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { Calendar } from "react-native-calendars";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

export default function CalendarScreen() {
  const [markedDates, setMarkedDates] = useState({});
  const [selectedDate, setSelectedDate] = useState("");
  const [tasksForSelectedDate, setTasksForSelectedDate] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
    const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchTasks();
  }, []);

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

  const fetchTasks = async () => {
    try {
      const tasksSnapshot = await getDocs(collection(db, "tasks"));
      const tasks = tasksSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      let newMarkedDates = {};

      tasks.forEach((task) => {
        if (task.dueDate) {
          // Handle Firestore Timestamp or Date object
          const taskDate = task.dueDate.seconds
            ? new Date(task.dueDate.seconds * 1000).toISOString().split("T")[0]
            : new Date(task.dueDate).toISOString().split("T")[0];

          newMarkedDates[taskDate] = {
            marked: true,
            dotColor:
              task.priority === "High"
                ? "red"
                : task.priority === "Medium"
                ? "orange"
                : "blue",
          };
        }
      });

      setMarkedDates(newMarkedDates);
      setAllTasks(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);

    // Get tasks for the selected date
    const filteredTasks = allTasks.filter((task) => {
      if (!task.dueDate) return false;

      const taskDate = task.dueDate.seconds
        ? new Date(task.dueDate.seconds * 1000).toISOString().split("T")[0]
        : new Date(task.dueDate).toISOString().split("T")[0];

      return taskDate === day.dateString;
    });

    setTasksForSelectedDate(filteredTasks);
  };

  return (
    <View style={styles.container}>
      <Calendar
        markedDates={markedDates}
        markingType="dot"
        onDayPress={handleDayPress}
      />
      <View style={styles.taskList}>
        <Text style={styles.taskHeader}>
          Tasks for {selectedDate || "Select a date"}
        </Text>
        <FlatList
          data={tasksForSelectedDate}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.taskItem}>
              <Text style={styles.taskName}>{item.name}</Text> 
              <Text style={styles.taskDetails}>Description: {item.description}</Text>
              <Text style={styles.taskPriority}>Priority: {item.priority}</Text>
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
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.noTaskText}>No tasks for this date</Text>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#fff",
  },
  taskList: {
    marginTop: 20,
  },
  taskHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  taskItem: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  taskName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  taskPriority: {
    fontSize: 14,
    color: "gray",
  },
    taskDetails: {
        fontSize: 14,
        color: "gray",
    },
    taskStatus: {
        fontSize: 14,
        color: "gray",
    },
    taskAssignedUsers: {
        fontSize: 14,
        color: "gray",
    },
  noTaskText: {
    fontSize: 14,
    color: "gray",
    textAlign: "center",
    marginTop: 10,
  },
});
