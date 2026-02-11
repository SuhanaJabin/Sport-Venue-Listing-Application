import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  Platform,
} from "react-native";
import { VenueCard } from "../../components/VenueCard";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Venue } from "../../types/venue";
import { VenueModal } from "../../components/VenueModal";
import { Header } from "../../components/Header";
import { getSportColor } from "../../constants/sportColors";
import { useHeaderAnimation } from "../../hooks/useHeaderAnimation";
import { useFavouritesManager } from "../../hooks/useFavoritesManager";
import { quickSort, filterVenues } from "../../utils/venueSearch";

const API_URL = process.env.EXPO_PUBLIC_API_URL!;
export default function HomeScreen() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [filteredVenues, setFilteredVenues] = useState<Venue[]>([]);
  const [favourites, setFavourites] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "none">("none");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const { fadeAnim, slideAnim } = useHeaderAnimation();
  const { loadFavourites, saveFavourites, toggleFavourite, isFavourite } =
    useFavouritesManager();

  // Refresh favourites when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const refreshFavourites = async () => {
        const loaded = await loadFavourites();
        setFavourites(loaded);
      };
      refreshFavourites();
    }, []),
  );

  useEffect(() => {
    fetchVenues();
    loadFavourites();
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

  const loadFavouritesData = async () => {
    const loaded = await loadFavourites();
    setFavourites(loaded);
  };

  // Open venue details modal
  const openVenueDetails = (venue: Venue) => {
    setSelectedVenue(venue);
    setModalVisible(true);
  };

  // Close venue details modal
  const closeVenueDetails = () => {
    setModalVisible(false);
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
        <Header
          title="VenueGo"
          subtitle="Sport venues, mapped for you"
          emoji="⚽🏏🏀"
          headerColor="#1E40AF"
          fadeAnim={fadeAnim}
          slideAnim={slideAnim}
        />
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
      <Header
        title="VenueGo"
        subtitle="Sport venues, mapped for you"
        emoji="⚽🏏🏀"
        searchQuery={searchQuery}
        onSearchChange={handleSearch}
        searching={searching}
        onClearSearch={() => handleSearch("")}
        sortOrder={sortOrder}
        onSort={handleSort}
        showSort={true}
        showSearchBar={true}
        headerColor="#1E40AF"
        fadeAnim={fadeAnim}
        slideAnim={slideAnim}
      />

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
              isFavourite={isFavourite(item.id, favourites)}
              onToggleFavourite={() => {
                const updated = toggleFavourite(item.id, favourites);
                setFavourites(updated);
                saveFavourites(updated);
              }}
              onPress={openVenueDetails}
              getSportColor={getSportColor}
            />
          )}
        />
      </View>

      <VenueModal
        visible={modalVisible}
        venue={selectedVenue}
        onClose={closeVenueDetails}
        isFavourite={
          selectedVenue ? isFavourite(selectedVenue.id, favourites) : false
        }
        onToggleFavourite={() => {
          if (selectedVenue) {
            const updated = toggleFavourite(selectedVenue.id, favourites);
            setFavourites(updated);
            saveFavourites(updated);
          }
        }}
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
});
