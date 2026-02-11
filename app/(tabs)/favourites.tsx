import { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  Platform,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "../../components/Header";
import { ConfirmationModal } from "../../components/ConfirmationModal";
import { UndoSnackbar } from "../../components/UndoSnackbar";
import { useHeaderAnimation } from "../../hooks/useHeaderAnimation";
import { getSportColor } from "../../constants/sportColors";
import { Venue } from "../../types/venue";
import { FavoriteCard } from "../../components/FavoriteCard";
const API_URL = process.env.EXPO_PUBLIC_API_URL!;
const FAVORITES_KEY = "favorites";



export default function FavoriteScreen() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [favoriteVenues, setFavoriteVenues] = useState<Venue[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [undoVisible, setUndoVisible] = useState(false);
  const [lastRemovedVenue, setLastRemovedVenue] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [previousFavorites, setPreviousFavorites] = useState<number[]>([]);

  const undoTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { fadeAnim, slideAnim } = useHeaderAnimation();

  // Refresh favorites when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, []),
  );

  useEffect(() => {
    fetchVenues();
  }, []);

  useEffect(() => {
    if (venues.length > 0 && favorites.length > 0) {
      updateFavoriteVenues();
    } else if (favorites.length === 0) {
      setFavoriteVenues([]);
    }
  }, [favorites, venues]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current);
      }
    };
  }, []);

  const fetchVenues = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setVenues(data);
    } catch (e) {
      console.log("Failed to load venues");
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const value = await SecureStore.getItemAsync(FAVORITES_KEY);
      const parsed = value ? JSON.parse(value) : [];
      setFavorites(parsed);
    } catch (error) {
      console.log("Failed to load favorites", error);
    }
  };

  const saveFavorites = async (updatedFavorites: number[]) => {
    try {
      await SecureStore.setItemAsync(
        FAVORITES_KEY,
        JSON.stringify(updatedFavorites),
      );
    } catch (error) {
      console.log("Failed to save favorites");
    }
  };

  const updateFavoriteVenues = () => {
    const favVenues = favorites
      .map((id) => venues.find((venue) => venue.id === id))
      .filter((venue): venue is Venue => venue !== undefined)
      .reverse();
    setFavoriteVenues(favVenues);
  };

  const removeLastFavorite = () => {
    if (favorites.length === 0) return;
    const lastAddedId = favorites[favorites.length - 1];
    const lastAddedVenue = venues.find((v) => v.id === lastAddedId);
    if (lastAddedVenue) {
      setSelectedVenue({ id: lastAddedId, name: lastAddedVenue.name });
      setConfirmationVisible(true);
    }
  };

  const removeFromFavorites = (venueId: number, venueName: string) => {
    setSelectedVenue({ id: venueId, name: venueName });
    setConfirmationVisible(true);
  };

  const handleConfirmRemoval = () => {
    if (!selectedVenue) return;
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
    }
    setRemovingId(selectedVenue.id);
    setPreviousFavorites([...favorites]);
    setLastRemovedVenue(selectedVenue);
    setTimeout(() => {
      const updatedFavorites = favorites.filter(
        (id) => id !== selectedVenue.id,
      );
      setFavorites(updatedFavorites);
      saveFavorites(updatedFavorites);
      setConfirmationVisible(false);
      setSelectedVenue(null);
      setRemovingId(null);
      setUndoVisible(true);
      undoTimeoutRef.current = setTimeout(() => {
        setUndoVisible(false);
        setLastRemovedVenue(null);
        setPreviousFavorites([]);
      }, 5000);
    }, 300);
  };

  const handleCancelRemoval = () => {
    setConfirmationVisible(false);
    setSelectedVenue(null);
  };

  const handleUndo = () => {
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
    }
    setFavorites(previousFavorites);
    saveFavorites(previousFavorites);
    setUndoVisible(false);
    setLastRemovedVenue(null);
    setPreviousFavorites([]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["left", "right"]}>
        <StatusBar barStyle="light-content" backgroundColor="#DC2626" />
        <Header
          title="My Favorite Venues"
          subtitle={`${favoriteVenues.length} ${favoriteVenues.length === 1 ? "venue" : "venues"} saved`}
          emoji="❤️"
          headerColor="#DC2626"
          fadeAnim={fadeAnim}
          slideAnim={slideAnim}
        />
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#EF4444" />
          <Text style={styles.loadingText}>Loading favorites...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <StatusBar barStyle="light-content" backgroundColor="#DC2626" />
      <Header
        title="My Favorite Venues"
        subtitle={`${favoriteVenues.length} ${favoriteVenues.length === 1 ? "venue" : "venues"} saved`}
        emoji="❤️"
        headerColor="#DC2626"
        additionalButton={
          favoriteVenues.length > 0
            ? { text: "🗑️ Remove Last Added", onPress: removeLastFavorite }
            : undefined
        }
        fadeAnim={fadeAnim}
        slideAnim={slideAnim}
      />

      <View style={styles.contentWrapper}>
        <FlatList
          data={favoriteVenues}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>💔</Text>
              <Text style={styles.emptyText}>No favorites yet</Text>
              <Text style={styles.emptySubtext}>
                Add venues to favorites from the home screen
              </Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <FavoriteCard
              item={item}
              index={index}
              onRemove={removeFromFavorites}
              getSportColor={getSportColor}
              isRemoving={removingId === item.id}
            />
          )}
        />
      </View>

      <ConfirmationModal
        visible={confirmationVisible}
        venueName={selectedVenue?.name || ""}
        onConfirm={handleConfirmRemoval}
        onCancel={handleCancelRemoval}
      />

      <UndoSnackbar
        visible={undoVisible}
        venueName={lastRemovedVenue?.name || ""}
        onUndo={handleUndo}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
    backgroundColor: "#F0F4F8",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 8,
    fontFamily: Platform.OS === "ios" ? "Avenir-Heavy" : "sans-serif-medium",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "Avenir" : "sans-serif",
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    color: "#DC2626",
    fontSize: 16,
    fontWeight: "500",
    fontFamily: Platform.OS === "ios" ? "Avenir" : "sans-serif",
  },

});
