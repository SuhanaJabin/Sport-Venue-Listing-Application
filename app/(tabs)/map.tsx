import { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  Platform,
  StatusBar,
} from "react-native";
import MapLibreGL from "@maplibre/maplibre-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const API_URL = process.env.EXPO_PUBLIC_API_URL!;

// MapLibre setup (NO API KEY, NO BILLING)
MapLibreGL.setAccessToken(null);

type Venue = {
  id: number;
  name: string;
  address: string;
  rating: number;
  sports: string[];
  latitude: number;
  longitude: number;
};

export default function MapScreen() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();

      // 📍 Base: Kozhikode
      const baseLat = 11.2588;
      const baseLng = 75.7804;

      // Scatter locations naturally
    const venuesWithCoords = data.map((venue: any) => ({
      ...venue,
      latitude: 11.2 + Math.random() * (11.35 - 11.2),
      longitude: 75.8 + Math.random() * (75.95 - 75.8),
    }));


      setVenues(venuesWithCoords);
    } catch (e) {
      console.log("Failed to load venues");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Loading map…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      {/* ✅ SAME AS home.tsx */}
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ✅ This wrapper prevents map from going under status bar */}
      <View style={styles.mapWrapper}>
        <MapLibreGL.MapView
          style={styles.map}
        //   styleURL="https://demotiles.maplibre.org/style.json"
        >
          <MapLibreGL.Camera
            zoomLevel={11}
            centerCoordinate={[75.7804, 11.2588]}
          />

          {venues.map((venue) => (
            <MapLibreGL.PointAnnotation
              key={venue.id.toString()}
              id={venue.id.toString()}
              coordinate={[venue.longitude, venue.latitude]}
            >
              <View style={styles.marker}>
                <Text style={styles.markerText}>🏟️</Text>
              </View>

              <MapLibreGL.Callout>
                <View style={styles.callout}>
                  <Text style={styles.calloutTitle}>{venue.name}</Text>
                  <Text style={styles.calloutText}>
                    Sports: {venue.sports.join(", ")}
                  </Text>
                  <Text style={styles.calloutText}>⭐ {venue.rating}</Text>
                </View>
              </MapLibreGL.Callout>
            </MapLibreGL.PointAnnotation>
          ))}
        </MapLibreGL.MapView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  // ✅ KEY FIX (same idea as HomeScreen layout)
  mapWrapper: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },

  map: {
    flex: 1,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  marker: {
    width: 36,
    height: 36,
    backgroundColor: "#DC2626",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },

  markerText: {
    fontSize: 16,
    color: "#FFFFFF",
  },

  callout: {
    width: 220,
    padding: 8,
  },

  calloutTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },

  calloutText: {
    fontSize: 13,
    color: "#444",
  },
});
