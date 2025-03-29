// import React, { useState } from "react";
// import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
// import axios from "axios";
// import { OPEN_WEATHER_API_KEY } from "@env"

// // Add weather widgets for cleanre design and add forcasting 


// export default function Weather() {
//   const [city, setCity] = useState("");
//   const [weather, setWeather] = useState(null);

//   // function to prevent 'r' refresh in expo
//   const handleKeyPress = (e) => {
//     if (e.nativeEvent.key === "r" || e.nativeEvent.key === "R") {
//       e.preventDefault(); 
//     }
//   };

//   const fetchWeather = async () => {
//     if (!city) {
//       Alert.alert("Error", "Please enter a city.");
//       return;
//     }

//     try {
//       const response = await axios.get(
//         `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPEN_WEATHER_API_KEY}&units=metric`
//       );
//       setWeather(response.data);
//     } catch (error) {
//       console.error(error);
//       Alert.alert("Error", "Failed to fetch weather data. Please try again.");
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.heading}>Weather</Text>
//       <TextInput
//         style={styles.input}
//         placeholder="Enter city"
//         value={city}
//         onChangeText={setCity}
//         onKeyPress={handleKeyPress}
//       />
//       <Button title="Get Weather" onPress={fetchWeather} />

//       {weather && (
//         <View style={styles.weatherContainer}>
//           <Text style={styles.weatherText}>
//             City: {weather.name}, {weather.sys.country}
//           </Text>
//           <Text style={styles.weatherText}>Temperature: {weather.main.temp}°C</Text>
//           <Text style={styles.weatherText}>Humidity: {weather.main.humidity}%</Text>
//           <Text style={styles.weatherText}>Condition: {weather.weather[0].description}</Text>
//         </View>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: "center",
//     padding: 16,
//   },
//   heading: {
//     fontSize: 24,
//     fontWeight: "bold",
//     textAlign: "center",
//     marginBottom: 16,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     padding: 8,
//     marginBottom: 16,
//   },
//   weatherContainer: {
//     marginTop: 16,
//     padding: 16,
//     borderRadius: 8,
//     backgroundColor: "#f0f0f0",
//   },
//   weatherText: {
//     fontSize: 16,
//     marginBottom: 8,
//   },
// });

import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import axios from "axios";
import { OPEN_WEATHER_API_KEY } from "@env";
import { WebView } from "react-native-webview"; // Import WebView

export default function Weather() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  


  const fetchWeather = async () => {
    if (!city) {
      Alert.alert("Error", "Please enter a city.");
      return;
    }

    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPEN_WEATHER_API_KEY}&units=metric`
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

      {/* Live Weather Widget using WebView */}
      {city && (
        <View style={styles.widgetContainer}>
          <Text style={styles.widgetTitle}>Live Weather</Text>
          <WebView
            source={{
              uri: `https://openweathermap.org/weathermap?basemap=map&cities=true&layer=temperature&lat=${weather?.coord?.lat || 0}&lon=${weather?.coord?.lon || 0}&zoom=8`
            }}
            style={isFullScreen ? styles.fullScreenWebview : styles.webview}
            onTouchStart={() => setIsFullScreen(!isFullScreen)} // Toggle full screen on tap
          />
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
  widgetContainer: {
    marginTop: 20,
    height: 250,
  },
  widgetTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  webview: {
    height: 220,
  },
  forecastContainer: {
    marginTop: 20,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#e0f7fa",
  },
  forecastTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  forecastItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  fullScreenWebview: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  }
  
  
});


