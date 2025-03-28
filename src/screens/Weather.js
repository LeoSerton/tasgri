import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import axios from "axios";

// Add weather widgets for cleanre design and add forcasting 

// Open Weather API key for getting real time weather data
// Create .env file to store API keys securely
const API_KEY = "b03edeb0689e9ed9dd698780d2168a87"; 

export default function Weather() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);

  // function to prevent 'r' refresh in expo
  const handleKeyPress = (e) => {
    if (e.nativeEvent.key === "r" || e.nativeEvent.key === "R") {
      e.preventDefault(); 
    }
  };

  const fetchWeather = async () => {
    if (!city) {
      Alert.alert("Error", "Please enter a city.");
      return;
    }

    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      );
      setWeather(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to fetch weather data. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Weather</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter city"
        value={city}
        onChangeText={setCity}
        onKeyPress={handleKeyPress}
      />
      <Button title="Get Weather" onPress={fetchWeather} />

      {weather && (
        <View style={styles.weatherContainer}>
          <Text style={styles.weatherText}>
            City: {weather.name}, {weather.sys.country}
          </Text>
          <Text style={styles.weatherText}>Temperature: {weather.main.temp}°C</Text>
          <Text style={styles.weatherText}>Humidity: {weather.main.humidity}%</Text>
          <Text style={styles.weatherText}>Condition: {weather.weather[0].description}</Text>
        </View>
      )}
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
  weatherContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  weatherText: {
    fontSize: 16,
    marginBottom: 8,
  },
});
