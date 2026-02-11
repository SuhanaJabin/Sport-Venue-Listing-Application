import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState, useRef, useEffect } from "react";
import { Animated, Easing } from "react-native";

export default function TabLayout() {
  const [tabScales] = useState({
    home: new Animated.Value(1),
    favourites: new Animated.Value(1),
    map: new Animated.Value(1),
  });

  const animateTabPress = (tabName: "home" | "favourites" | "map") => {
    const scale = tabScales[tabName];
    scale.setValue(1);

    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.85,
        duration: 100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1.1,
        duration: 150,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#1E40AF",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          height: 110,
          paddingBottom: 20,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Venues",
          tabBarIcon: ({ color, size, focused }) => (
            <Animated.View
              style={{
                transform: [{ scale: tabScales.home }],
              }}
            >
              <Ionicons
                name={focused ? "location" : "location-outline"}
                size={size}
                color={color}
              />
            </Animated.View>
          ),
        }}
        listeners={{
          tabPress: () => animateTabPress("home"),
        }}
      />
      <Tabs.Screen
        name="favourites"
        options={{
          title: "Favourites",
          tabBarIcon: ({ color, size, focused }) => (
            <Animated.View
              style={{
                transform: [{ scale: tabScales.favourites }],
              }}
            >
              <Ionicons
                name={focused ? "heart" : "heart-outline"}
                size={size}
                color={color}
              />
            </Animated.View>
          ),
        }}
        listeners={{
          tabPress: () => animateTabPress("favourites"),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "Map",
          tabBarIcon: ({ color, size }) => (
            <Animated.View
              style={{
                transform: [{ scale: tabScales.map }],
              }}
            >
              <Ionicons name="map-outline" size={size} color={color} />
            </Animated.View>
          ),
        }}
        listeners={{
          tabPress: () => animateTabPress("map"),
        }}
      />
      ;
    </Tabs>
  );
}
