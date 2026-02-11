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
  Modal,
  Image,
  ScrollView,
  Dimensions,
  Easing,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";

const API_URL = process.env.EXPO_PUBLIC_API_URL!;
const IMAGE_BASE_URL = process.env.EXPO_PUBLIC_IMAGE_BASE_URL!;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

type Venue = {
  id: number;
  name: string;
  address: string;
  kilometres: number;
  rating: number;
  sports: string[];
  logo: string;
  favourite: number;
  featured: number;
  price: { [key: string]: number };
};

const FAVORITES_KEY = "favorites";

// Venue Card Component with Animation
type VenueCardProps = {
  item: Venue;
  isFavorite: boolean;
  onToggleFavorite: (venueId: number) => void;
  onPress: (venue: Venue) => void;
  getSportColor: (sport: string) => {
    bg: string;
    border: string;
    text: string;
  };
};

const VenueCard = ({
  item,
  isFavorite,
  onToggleFavorite,
  onPress,
  getSportColor,
}: VenueCardProps) => {
  const animatedValue = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleFavoritePress = () => {
    // Start bump animation
    Animated.sequence([
      Animated.spring(animatedValue, {
        toValue: 1.4,
        friction: 3,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.spring(animatedValue, {
        toValue: 1,
        friction: 3,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onToggleFavorite(item.id);
  };

  const imageUrl = `${IMAGE_BASE_URL}${item.logo}`;

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <TouchableOpacity activeOpacity={0.7} onPress={() => onPress(item)}>
        <View style={styles.card}>
          {/* Venue Image */}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.venueImage}
              resizeMode="cover"
            />
            {item.featured === 1 && (
              <View style={styles.featuredBadge}>
                <Text style={styles.featuredText}>⭐ FEATURED</Text>
              </View>
            )}
          </View>

          {/* Venue name + rating + favorite icon */}
          <View style={styles.cardHeader}>
            <Text style={styles.name} numberOfLines={1}>
              {item.name}
            </Text>
            <View style={styles.headerRight}>
              <View style={styles.ratingBadge}>
                <Text style={styles.star}>⭐</Text>
                <Text style={styles.ratingText}>{item.rating}</Text>
              </View>
              <TouchableOpacity
                onPress={handleFavoritePress}
                style={styles.favoriteButton}
                activeOpacity={0.6}
              >
                <Animated.Text
                  style={[
                    styles.favoriteIcon,
                    {
                      transform: [{ scale: animatedValue }],
                    },
                  ]}
                >
                  {isFavorite ? "❤️" : "🤍"}
                </Animated.Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Address */}
          <Text style={styles.address} numberOfLines={2}>
            {item.address}
          </Text>

          {/* Distance */}
          <View style={styles.distanceContainer}>
            <View style={styles.distanceBadge}>
              <Text style={styles.distance}>📍 {item.kilometres} km away</Text>
            </View>
          </View>

          {/* Sports Tags */}
          <View style={styles.sportsWrapper}>
            <Text style={styles.sportsLabel}>Sports:</Text>
            <View style={styles.sportsTags}>
              {item.sports.map((sport, index) => {
                const colors = getSportColor(sport);
                return (
                  <View
                    key={index}
                    style={[
                      styles.sportTag,
                      {
                        backgroundColor: colors.bg,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.sportTagText, { color: colors.text }]}>
                      {sport}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Venue Detail Modal Component
type VenueModalProps = {
  visible: boolean;
  venue: Venue | null;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (venueId: number) => void;
  getSportColor: (sport: string) => {
    bg: string;
    border: string;
    text: string;
  };
};

const VenueModal = ({
  visible,
  venue,
  onClose,
  isFavorite,
  onToggleFavorite,
  getSportColor,
}: VenueModalProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      // Reset values
      fadeAnim.setValue(0);
      slideAnim.setValue(SCREEN_HEIGHT);
      scaleAnim.setValue(0.9);

      // Open animation - smooth slide up
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 350,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 25,
          stiffness: 120,
          mass: 0.8,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          damping: 20,
          stiffness: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleClose = () => {
    // Close animation - smooth slide down
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 300,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 300,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  if (!venue) return null;

  const imageUrl = `${IMAGE_BASE_URL}${venue.logo}`;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.modalBackdrop,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={handleClose}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.modalContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalScrollContent}
            bounces={false}
          >
            {/* Hero Image */}
            <View style={styles.modalImageContainer}>
              <Image
                source={{ uri: imageUrl }}
                style={styles.modalImage}
                resizeMode="cover"
              />
              {venue.featured === 1 && (
                <View style={styles.modalFeaturedBadge}>
                  <Text style={styles.modalFeaturedText}>⭐ FEATURED</Text>
                </View>
              )}

              {/* Close Button */}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
                activeOpacity={0.8}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>

              {/* Favorite Button */}
              <TouchableOpacity
                style={styles.modalFavoriteButton}
                onPress={() => onToggleFavorite(venue.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalFavoriteIcon}>
                  {isFavorite ? "❤️" : "🤍"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.modalDetails}>
              {/* Title & Rating */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{venue.name}</Text>
                <View style={styles.modalRatingBadge}>
                  <Text style={styles.modalStar}>⭐</Text>
                  <Text style={styles.modalRatingText}>{venue.rating}</Text>
                </View>
              </View>

              {/* Address */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionIcon}>📍</Text>
                <Text style={styles.modalAddress}>{venue.address}</Text>
              </View>

              {/* Distance */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionIcon}>🚗</Text>
                <Text style={styles.modalDistance}>
                  {venue.kilometres} km away
                </Text>
              </View>

              {/* Sports Available */}
              <View style={styles.modalSportsSection}>
                <Text style={styles.modalSectionTitle}>Available Sports</Text>
                <View style={styles.modalSportsTags}>
                  {venue.sports.map((sport, index) => {
                    const colors = getSportColor(sport);
                    return (
                      <View
                        key={index}
                        style={[
                          styles.modalSportTag,
                          {
                            backgroundColor: colors.bg,
                            borderColor: colors.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.modalSportTagText,
                            { color: colors.text },
                          ]}
                        >
                          {sport}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>

              {/* Pricing */}
              <View style={styles.modalPricingSection}>
                <Text style={styles.modalSectionTitle}>Pricing</Text>
                {Object.entries(venue.price).map(([sport, price], index) => (
                  <View key={index} style={styles.priceRow}>
                    <View
                      style={[
                        styles.priceSportBadge,
                        {
                          backgroundColor: getSportColor(sport).bg,
                          borderColor: getSportColor(sport).border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.priceSportText,
                          { color: getSportColor(sport).text },
                        ]}
                      >
                        {sport}
                      </Text>
                    </View>
                    <Text style={styles.priceAmount}>₹{price}</Text>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

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

  // Sport-specific colors
  const getSportColor = (sport: string) => {
    const sportColors: {
      [key: string]: { bg: string; border: string; text: string };
    } = {
      Football: { bg: "#DCFCE7", border: "#22C55E", text: "#166534" },
      Cricket: { bg: "#FEF3C7", border: "#F59E0B", text: "#92400E" },
      Basketball: { bg: "#FFEDD5", border: "#F97316", text: "#9A3412" },
      Tennis: { bg: "#FEE2E2", border: "#EF4444", text: "#991B1B" },
      Volleyball: { bg: "#E0E7FF", border: "#6366F1", text: "#3730A3" },
      Badminton: { bg: "#FCE7F3", border: "#EC4899", text: "#9F1239" },
      "Table Tennis": { bg: "#DBEAFE", border: "#3B82F6", text: "#1E40AF" },
    };
    return (
      sportColors[sport] || {
        bg: "#F3F4F6",
        border: "#9CA3AF",
        text: "#374151",
      }
    );
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
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 0,
    marginBottom: 12,
    shadowColor: "#1E40AF",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E0E7FF",
  },
  imageContainer: {
    width: "100%",
    height: 180,
    position: "relative",
  },
  venueImage: {
    width: "100%",
    height: "100%",
  },
  featuredBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(251, 191, 36, 0.95)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#FBBF24",
  },
  featuredText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#78350F",
    letterSpacing: 0.5,
    fontFamily: Platform.OS === "ios" ? "Avenir-Heavy" : "sans-serif-medium",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    marginHorizontal: 14,
    marginBottom: 10,
  },
  name: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    flex: 1,
    marginRight: 10,
    fontFamily: Platform.OS === "ios" ? "Avenir-Heavy" : "sans-serif-medium",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#FBBF24",
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  star: {
    fontSize: 14,
    marginRight: 3,
  },
  ratingText: {
    fontWeight: "700",
    color: "#D97706",
    fontSize: 15,
    fontFamily: Platform.OS === "ios" ? "Avenir-Heavy" : "sans-serif-medium",
  },
  favoriteButton: {
    padding: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  favoriteIcon: {
    fontSize: 24,
  },
  address: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
    marginBottom: 10,
    marginHorizontal: 14,
    fontFamily: Platform.OS === "ios" ? "Avenir" : "sans-serif",
  },
  distanceContainer: {
    marginBottom: 10,
    marginHorizontal: 14,
  },
  distanceBadge: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  distance: {
    fontSize: 12,
    color: "#DC2626",
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "Avenir-Medium" : "sans-serif",
  },
  sportsWrapper: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 2,
    marginBottom: 14,
    marginHorizontal: 14,
  },
  sportsLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginRight: 8,
    marginTop: 5,
    fontFamily: Platform.OS === "ios" ? "Avenir-Medium" : "sans-serif",
  },
  sportsTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    flex: 1,
    gap: 6,
  },
  sportTag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  sportTagText: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.3,
    fontFamily: Platform.OS === "ios" ? "Avenir-Medium" : "sans-serif",
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

  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: SCREEN_HEIGHT * 0.92,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
  },
  modalScrollContent: {
    paddingBottom: 40,
  },
  modalImageContainer: {
    width: "100%",
    height: 280,
    position: "relative",
  },
  modalImage: {
    width: "100%",
    height: "100%",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  modalFeaturedBadge: {
    position: "absolute",
    top: 20,
    left: 20,
    backgroundColor: "rgba(251, 191, 36, 0.95)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#FBBF24",
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  modalFeaturedText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#78350F",
    letterSpacing: 0.8,
    fontFamily: Platform.OS === "ios" ? "Avenir-Heavy" : "sans-serif-medium",
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  closeButtonText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
  },
  modalFavoriteButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 2,
    borderColor: "#E0E7FF",
  },
  modalFavoriteIcon: {
    fontSize: 28,
  },
  modalDetails: {
    padding: 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    flex: 1,
    marginRight: 12,
    lineHeight: 32,
    fontFamily: Platform.OS === "ios" ? "Avenir-Heavy" : "sans-serif-medium",
  },
  modalRatingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#FBBF24",
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  modalStar: {
    fontSize: 16,
    marginRight: 4,
  },
  modalRatingText: {
    fontWeight: "700",
    color: "#D97706",
    fontSize: 15,
    fontFamily: Platform.OS === "ios" ? "Avenir-Heavy" : "sans-serif-medium",
  },
  modalSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#F8FAFC",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  modalSectionIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  modalAddress: {
    fontSize: 15,
    color: "#475569",
    flex: 1,
    lineHeight: 22,
    fontFamily: Platform.OS === "ios" ? "Avenir" : "sans-serif",
  },
  modalDistance: {
    fontSize: 15,
    color: "#DC2626",
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "Avenir-Medium" : "sans-serif",
  },
  modalSportsSection: {
    marginTop: 8,
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 14,
    fontFamily: Platform.OS === "ios" ? "Avenir-Heavy" : "sans-serif-medium",
  },
  modalSportsTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  modalSportTag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  modalSportTagText: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.3,
    fontFamily: Platform.OS === "ios" ? "Avenir-Medium" : "sans-serif",
  },
  modalPricingSection: {
    marginBottom: 28,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  priceSportBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 2,
  },
  priceSportText: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "Avenir-Medium" : "sans-serif",
  },
  priceAmount: {
    fontSize: 15,
    fontWeight: "700",
    color: "#059669",
    fontFamily: Platform.OS === "ios" ? "Avenir-Heavy" : "sans-serif-medium",
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
