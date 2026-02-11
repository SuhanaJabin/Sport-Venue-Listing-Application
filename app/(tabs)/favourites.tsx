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
import { FavouriteCard } from "../../components/FavouriteCard";
const API_URL = process.env.EXPO_PUBLIC_API_URL!;
const FAVOURITES_KEY = "favourites";



export default function FavouriteScreen() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [favouriteVenues, setFavouriteVenues] = useState<Venue[]>([]);
  const [favourites, setFavourites] = useState<number[]>([]);
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
  const [previousFavourites, setPreviousFavourites] = useState<number[]>([]);

  const undoTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { fadeAnim, slideAnim } = useHeaderAnimation();

  // Refresh favourites when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadFavourites();
    }, []),
  );

  useEffect(() => {
    fetchVenues();
  }, []);

  useEffect(() => {
    if (venues.length > 0 && favourites.length > 0) {
      updateFavouriteVenues();
    } else if (favourites.length === 0) {
      setFavouriteVenues([]);
    }
  }, [favourites, venues]);

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

  const loadFavourites = async () => {
    try {
      const value = await SecureStore.getItemAsync(FAVOURITES_KEY);
      const parsed = value ? JSON.parse(value) : [];
      setFavourites(parsed);
    } catch (error) {
      console.log("Failed to load favourites", error);
    }
  };

  const saveFavourites = async (updatedFavourites: number[]) => {
    try {
      await SecureStore.setItemAsync(
        FAVOURITES_KEY,
        JSON.stringify(updatedFavourites),
      );
    } catch (error) {
      console.log("Failed to save favourites");
    }
  };

  const updateFavouriteVenues = () => {
    const favVenues = favourites
      .map((id) => venues.find((venue) => venue.id === id))
      .filter((venue): venue is Venue => venue !== undefined)
      .reverse();
    setFavouriteVenues(favVenues);
  };

  const removeLastFavourite = () => {
    if (favourites.length === 0) return;
    const lastAddedId = favourites[favourites.length - 1];
    const lastAddedVenue = venues.find((v) => v.id === lastAddedId);
    if (lastAddedVenue) {
      setSelectedVenue({ id: lastAddedId, name: lastAddedVenue.name });
      setConfirmationVisible(true);
    }
  };

  const removeFromFavourites = (venueId: number, venueName: string) => {
    setSelectedVenue({ id: venueId, name: venueName });
    setConfirmationVisible(true);
  };

  const handleConfirmRemoval = () => {
    if (!selectedVenue) return;
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
    }
    setRemovingId(selectedVenue.id);
    setPreviousFavourites([...favourites]);
    setLastRemovedVenue(selectedVenue);
    setTimeout(() => {
      const updatedFavourites = favourites.filter(
        (id) => id !== selectedVenue.id,
      );
      setFavourites(updatedFavourites);
      saveFavourites(updatedFavourites);
      setConfirmationVisible(false);
      setSelectedVenue(null);
      setRemovingId(null);
      setUndoVisible(true);
      undoTimeoutRef.current = setTimeout(() => {
        setUndoVisible(false);
        setLastRemovedVenue(null);
        setPreviousFavourites([]);
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
    setFavourites(previousFavourites);
    saveFavourites(previousFavourites);
    setUndoVisible(false);
    setLastRemovedVenue(null);
    setPreviousFavourites([]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["left", "right"]}>
        <StatusBar barStyle="light-content" backgroundColor="#DC2626" />
        <Header
          title="My Favorite Venues"
          subtitle={`${favouriteVenues.length} ${favouriteVenues.length === 1 ? "venue" : "venues"} saved`}
          emoji="❤️"
          headerColor="#DC2626"
          fadeAnim={fadeAnim}
          slideAnim={slideAnim}
        />
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#EF4444" />
          <Text style={styles.loadingText}>Loading favourites...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <StatusBar barStyle="light-content" backgroundColor="#DC2626" />
      <Header
        title="My Favourite Venues"
        subtitle={`${favouriteVenues.length} ${favouriteVenues.length === 1 ? "venue" : "venues"} saved`}
        emoji="❤️"
        headerColor="#720a0a"
        additionalButton={
            favouriteVenues.length > 0
            ? { text: " Remove last added venue", onPress: removeLastFavourite }
            : undefined
        }
        fadeAnim={fadeAnim}
        slideAnim={slideAnim}
      />

      <View style={styles.contentWrapper}>
        <FlatList
          data={favouriteVenues}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>💔</Text>
              <Text style={styles.emptyText}>No favourites yet</Text>
              <Text style={styles.emptySubtext}>
                Add venues to favourites from the home screen
              </Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <FavouriteCard
              item={item}
              index={index}
              onRemove={removeFromFavourites}
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
