import { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  TouchableOpacity,
  Platform,
  TextInput,
  Animated,
  Dimensions,
} from "react-native";
import { VenueCard } from "../components/VenueCard";
import * as SecureStore from "expo-secure-store";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Venue  } from "../types/venue";
import { VenueModal } from "../components/VenueModal";
import { getSportColor } from "../constants/sportColors";
const API_URL = process.env.EXPO_PUBLIC_API_URL!;
const IMAGE_BASE_URL = process.env.EXPO_PUBLIC_IMAGE_BASE_URL!;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const FAVORITES_KEY = "favorites";
export default function HomeScreen() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [filteredVenues, setFilteredVenues] = useState<Venue[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "none">("none");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const headerFadeAnim = useRef(new Animated.Value(0)).current;
  const headerSlideAnim = useRef(new Animated.Value(-50)).current;

  // Refresh favorites when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, []),
  );

  useEffect(() => {
    fetchVenues();
    loadFavorites();

    // Animate header on mount
    Animated.parallel([
      Animated.timing(headerFadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(headerSlideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const fetchVenues = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setVenues(data);
      setFilteredVenues(data);
    } catch (e) {
      console.log("Failed to load venues");
    } finally {
      setLoading(false);
    }
  };

  // Load favorites from AsyncStorage
  const loadFavorites = async () => {
    try {
      const value = await SecureStore.getItemAsync(FAVORITES_KEY);
      const parsed = value ? JSON.parse(value) : [];
      setFavorites(parsed);
    } catch (error) {
      console.log("Failed to load favorites", error);
    }
  };

  // Save favorites to AsyncStorage
  const saveFavorites = async (data: number[]) => {
    try {
      await SecureStore.setItemAsync(FAVORITES_KEY, JSON.stringify(data));
    } catch (error) {
      console.log("Failed to save favorites", error);
    }
  };

  // Toggle favorite status
  const toggleFavorite = (venueId: number) => {
    let updatedFavorites: number[];

    if (favorites.includes(venueId)) {
      // Remove from favorites
      updatedFavorites = favorites.filter((id) => id !== venueId);
    } else {
      // Add to favorites
      updatedFavorites = [...favorites, venueId];
    }

    setFavorites(updatedFavorites);
    saveFavorites(updatedFavorites);
  };

  // Check if venue is favorite
  const isFavorite = (venueId: number) => {
    return favorites.includes(venueId);
  };

  // Open venue details modal
  const openVenueDetails = (venue: Venue) => {
    setSelectedVenue(venue);
    setModalVisible(true);
  };

  // Close venue details modal
  const closeVenueDetails = () => {
    setModalVisible(false);
    // Clear selected venue after animation completes
    setTimeout(() => setSelectedVenue(null), 350);
  };

  // Quick Sort Algorithm Implementation
  const quickSort = (arr: Venue[], ascending: boolean = true): Venue[] => {
    if (arr.length <= 1) {
      return arr;
    }

    const pivot = arr[Math.floor(arr.length / 2)];
    const left: Venue[] = [];
    const middle: Venue[] = [];
    const right: Venue[] = [];

    for (const venue of arr) {
      if (venue.kilometres < pivot.kilometres) {
        left.push(venue);
      } else if (venue.kilometres === pivot.kilometres) {
        middle.push(venue);
      } else {
        right.push(venue);
      }
    }

    if (ascending) {
      return [...quickSort(left, true), ...middle, ...quickSort(right, true)];
    } else {
      return [...quickSort(right, false), ...middle, ...quickSort(left, false)];
    }
  };

  // Handle sorting
  const handleSort = () => {
    let newSortOrder: "asc" | "desc" | "none";
    let sortedVenues: Venue[];

    if (sortOrder === "none") {
      // Sort ascending
      sortedVenues = quickSort([...filteredVenues], true);
      newSortOrder = "asc";
    } else if (sortOrder === "asc") {
      // Sort descending
      sortedVenues = quickSort([...filteredVenues], false);
      newSortOrder = "desc";
    } else {
      // Reset to original order - need to refilter
      sortedVenues = venues.filter(
        (venue) =>
          venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          venue.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
          venue.sports.some((sport) =>
            sport.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
      );
      newSortOrder = "none";
    }

    setFilteredVenues(sortedVenues);
    setSortOrder(newSortOrder);
  };

  // Handle search with debounce and loader
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSortOrder("none"); // Reset sort when searching
    setSearching(true);

    // Debounce search
    setTimeout(() => {
      if (query.trim() === "") {
        setFilteredVenues(venues);
      } else {
        const filtered = venues.filter(
          (venue) =>
            venue.name.toLowerCase().includes(query.toLowerCase()) ||
            venue.address.toLowerCase().includes(query.toLowerCase()) ||
            venue.sports.some((sport) =>
              sport.toLowerCase().includes(query.toLowerCase()),
            ),
        );
        setFilteredVenues(filtered);
      }
      setSearching(false);
    }, 300); // 300ms delay for better UX
  };

  // Get sort button icon (compact version for inline display)
  const getSortButtonIcon = () => {
    if (sortOrder === "none") return "⇅";
    if (sortOrder === "asc") return "↑";
    return "↓";
  };



  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["left", "right"]}>
        <StatusBar barStyle="light-content" backgroundColor="#1E40AF" />
        {/* Header with Gradient */}
        <Animated.View
          style={[
            styles.headerWrapper,
            {
              opacity: headerFadeAnim,
              transform: [{ translateY: headerSlideAnim }],
            },
          ]}
        >
          <View style={styles.gradientHeader}>
            <Text style={styles.emoji}>⚽🏏🏀</Text>
            <Text style={styles.title}>Nearby Sports Venues</Text>
            <Text style={styles.subtitle}>Find the perfect place to play</Text>

            {/* Search Bar and Sort Button Row */}
            <View style={styles.controlsRow}>
              {/* Search Bar */}
              <View style={styles.searchContainer}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search venues or sports..."
                  placeholderTextColor="#94A3B8"
                  value={searchQuery}
                  onChangeText={handleSearch}
                />
                {searching ? (
                  <ActivityIndicator
                    size="small"
                    color="#3B82F6"
                    style={styles.searchLoader}
                  />
                ) : searchQuery.length > 0 ? (
                  <TouchableOpacity
                    onPress={() => handleSearch("")}
                    style={styles.clearButton}
                  >
                    <Text style={styles.clearButtonText}>✕</Text>
                  </TouchableOpacity>
                ) : null}
              </View>

              {/* Sort Button */}
              <TouchableOpacity
                style={styles.sortButton}
                onPress={handleSort}
                activeOpacity={0.7}
              >
                <Text style={styles.sortButtonText}>{getSortButtonIcon()}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading venues...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <StatusBar barStyle="light-content" backgroundColor="#1E40AF" />

      {/* Header with Gradient */}
      <Animated.View
        style={[
          styles.headerWrapper,
          {
            opacity: headerFadeAnim,
            transform: [{ translateY: headerSlideAnim }],
          },
        ]}
      >
        <View style={styles.gradientHeader}>
          <Text style={styles.emoji}>⚽🏏🏀</Text>
          <Text style={styles.title}>Nearby Sports Venues</Text>
          <Text style={styles.subtitle}>Find the perfect place to play</Text>

          {/* Search Bar and Sort Button Row */}
          <View style={styles.controlsRow}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search venues or sports..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={handleSearch}
              />
              {searching ? (
                <ActivityIndicator
                  size="small"
                  color="#3B82F6"
                  style={styles.searchLoader}
                />
              ) : searchQuery.length > 0 ? (
                <TouchableOpacity
                  onPress={() => handleSearch("")}
                  style={styles.clearButton}
                >
                  <Text style={styles.clearButtonText}>✕</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Sort Button */}
            <TouchableOpacity
              style={styles.sortButton}
              onPress={handleSort}
              activeOpacity={0.7}
            >
              <Text style={styles.sortButtonText}>{getSortButtonIcon()}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* Venue List */}
      <View style={styles.contentWrapper}>
        <FlatList
          data={filteredVenues}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyText}>No venues found</Text>
              <Text style={styles.emptySubtext}>
                Try searching with different keywords
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <VenueCard
              item={item}
              isFavorite={isFavorite(item.id)}
              onToggleFavorite={toggleFavorite}
              onPress={openVenueDetails}
              getSportColor={getSportColor}
            />
          )}
        />
      </View>

      {/* Venue Detail Modal */}
      <VenueModal
        visible={modalVisible}
        venue={selectedVenue}
        onClose={closeVenueDetails}
        isFavorite={selectedVenue ? isFavorite(selectedVenue.id) : false}
        onToggleFavorite={toggleFavorite}
        getSportColor={getSportColor}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F4F8",
  },
  contentWrapper: {
    flex: 1,
    backgroundColor: "#F0F4F8",
  },
  headerWrapper: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  gradientHeader: {
    backgroundColor: "#1E40AF",
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 60,
    alignItems: "center",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  emoji: {
    fontSize: 32,
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: 0.5,
    fontFamily: Platform.OS === "ios" ? "Avenir-Heavy" : "sans-serif-medium",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 15,
    color: "#BFDBFE",
    marginTop: 8,
    textAlign: "center",
    letterSpacing: 0.5,
    fontWeight: "400",
    fontFamily: Platform.OS === "ios" ? "Avenir" : "sans-serif",
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    marginHorizontal: 20,
    gap: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: "#E0E7FF",
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#1E293B",
    fontFamily: Platform.OS === "ios" ? "Avenir" : "sans-serif",
    padding: 0,
  },
  searchLoader: {
    marginLeft: 8,
  },
  clearButton: {
    padding: 4,
    marginLeft: 4,
  },
  clearButtonText: {
    fontSize: 16,
    color: "#64748B",
    fontWeight: "700",
  },
  sortButton: {
    backgroundColor: "#FFFFFF",
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 2,
    borderColor: "#3B82F6",
  },
  sortButtonText: {
    color: "#1E40AF",
    fontSize: 22,
    fontWeight: "700",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
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
    color: "#1E40AF",
    fontSize: 16,
    fontWeight: "500",
    fontFamily: Platform.OS === "ios" ? "Avenir" : "sans-serif",
  },


  bookButton: {
    backgroundColor: "#1E40AF",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#1E40AF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  bookButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.5,
    fontFamily: Platform.OS === "ios" ? "Avenir-Heavy" : "sans-serif-medium",
  },
});
