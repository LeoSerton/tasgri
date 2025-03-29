import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
// import { createStackNavigator } from "@react-navigation/stack"
import { Ionicons } from "@expo/vector-icons";
import * as Font from "expo-font";
import AppLoading from "expo-app-loading";

// screens 
import LoginScreen from "./src/screens/LoginScreen";
import SignupScreen from "./src/screens/SignupScreen";
import Dashboard from "./src/screens/Dashboard";
import Profile from "./src/screens/Profile";
import Weather from "./src/screens/Weather";
import CreateTask from "./src/screens/CreateTask";
import TaskDetail from "./src/screens/TaskDetail";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();


// Bottom menu navigation
function BottomTabs() {
  return (
    <Tab.Navigator
  screenOptions={({ route }) => ({
    tabBarIcon: ({ focused, color, size }) => {
      let iconName;

      if (route.name === "Dashboard") {
        iconName = focused ? "home" : "home-outline";
      } else if (route.name === "Profile") {
        iconName = focused ? "person" : "person-outline";
      } else if (route.name === "Weather") {
        iconName = focused ? "cloud" : "cloud-outline";
      }
      return <Ionicons name={iconName} size={size} color={color} />;
    },
    tabBarActiveTintColor: "#007bff",
    tabBarInactiveTintColor: "gray",
    tabBarStyle: { backgroundColor: "#f8f9fa", height: 60 },
  })}
>
  <Tab.Screen name="Dashboard" component={Dashboard} />
  <Tab.Screen name="Weather" component={Weather} />
  <Tab.Screen name="Profile" component={Profile} />
  {/* <Tab.Screen name="CreateTask" component={CreateTask} /> */}
</Tab.Navigator>
  );
}

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        ...Ionicons.font,
      });
      setFontsLoaded(true);
    }
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="Main" component={BottomTabs} />
        <Stack.Screen name="CreateTask" component={CreateTask} />
        <Stack.Screen name="TaskDetail" component={TaskDetail} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
