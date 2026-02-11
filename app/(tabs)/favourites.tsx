import { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  TouchableOpacity,
  Platform,
  Animated,
  Modal,
  Dimensions,
  Easing,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const API_URL = process.env.EXPO_PUBLIC_API_URL!;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

type Venue = {
  id: number;
  name: string;
  address: string;
  kilometres: number;
  rating: number;
  sports: string[];
};

const FAVORITES_KEY = "favorites";

// Confirmation Modal Component
type ConfirmationModalProps = {
  visible: boolean;
  venueName: string;
  onConfirm: () => void;
  onCancel: () => void;
};

const ConfirmationModal = ({
  visible,
  venueName,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      // Reset values
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);

      // Open animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          damping: 15,
          stiffness: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleCancel = () => {
    // Close animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      onCancel();
    });
  };

  const handleConfirm = () => {
    // Close animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      onConfirm();
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleCancel}
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
            onPress={handleCancel}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.confirmationModal,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Icon */}
          <View style={styles.confirmationIcon}>
            <Ionicons name="trash-outline" size={48} color="#DC2626" />
          </View>

          {/* Title */}
          <Text style={styles.confirmationTitle}>Remove Favorite?</Text>

          {/* Message */}
          <Text style={styles.confirmationMessage}>
            Are you sure you want to remove{" "}
            <Text style={styles.confirmationVenueName}>"{venueName}"</Text> from
            your favorites?
          </Text>

          {/* Buttons */}
          <View style={styles.confirmationButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.removeButton}
              onPress={handleConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

// Undo Snackbar Component
type UndoSnackbarProps = {
  visible: boolean;
  venueName: string;
  onUndo: () => void;
};

const UndoSnackbar = ({ visible, venueName, onUndo }: UndoSnackbarProps) => {
  const slideAnim = useRef(new Animated.Value(100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      // Show animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Hide animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 100,
          duration: 250,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShouldRender(false);
      });
    }
  }, [visible]);

  // Don't render if not visible and animation is complete
  if (!shouldRender) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.undoSnackbar,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.undoContent}>
        <Ionicons name="checkmark-circle" size={22} color="#10B981" />
        <Text style={styles.undoText} numberOfLines={1}>
          <Text style={styles.undoVenueName}>{venueName}</Text> removed
        </Text>
      </View>
      <TouchableOpacity
        style={styles.undoButton}
        onPress={onUndo}
        activeOpacity={0.7}
      >
        <Text style={styles.undoButtonText}>UNDO</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Favorite Card Component with Animation
type FavoriteCardProps = {
  item: Venue;
  index: number;
  totalCount: number;
  onRemove: (venueId: number, venueName: string) => void;
  getSportColor: (sport: string) => {
    bg: string;
    border: string;
    text: string;
  };
  isRemoving: boolean;
};

const FavoriteCard = ({
  item,
  index,
  totalCount,
  onRemove,
  getSportColor,
  isRemoving,
}: FavoriteCardProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const trashAnimatedValue = useRef(new Animated.Value(1)).current;
  const removeSlideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation with staggered delay
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay: index * 100, // Stagger each card
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Exit animation when removing
  useEffect(() => {
    if (isRemoving) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(removeSlideAnim, {
          toValue: -SCREEN_WIDTH,
          duration: 300,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isRemoving]);

  const handleTrashPress = () => {
    // Spring animation for trash icon
    Animated.sequence([
      Animated.spring(trashAnimatedValue, {
        toValue: 1.4,
        friction: 3,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.spring(trashAnimatedValue, {
        toValue: 1,
        friction: 3,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onRemove(item.id, item.name);
  };

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }, { translateX: removeSlideAnim }],
      }}
    >
      <TouchableOpacity activeOpacity={0.7}>
        <View style={styles.card}>
          {/* Remove Button with Animation */}
          <TouchableOpacity
            onPress={handleTrashPress}
            style={styles.removeButtonIcon}
            activeOpacity={0.6}
          >
            <Animated.View
              style={{
                transform: [{ scale: trashAnimatedValue }],
              }}
            >
              <Ionicons name="trash-outline" size={20} color="#DC2626" />
            </Animated.View>
          </TouchableOpacity>

          {/* Venue name + rating */}
          <View style={styles.cardHeader}>
            <Text style={styles.name} numberOfLines={1}>
              {item.name}
            </Text>
            <View style={styles.headerRight}>
              <View style={styles.ratingBadge}>
                <Text style={styles.star}>⭐</Text>
                <Text style={styles.ratingText}>{item.rating}</Text>
              </View>
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
              {item.sports.map((sport, sportIndex) => {
                const colors = getSportColor(sport);
                return (
                  <View
                    key={sportIndex}
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

  // Undo functionality states
  const [undoVisible, setUndoVisible] = useState(false);
  const [lastRemovedVenue, setLastRemovedVenue] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [previousFavorites, setPreviousFavorites] = useState<number[]>([]);
  const undoTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Update favorite venues based on favorites array
  const updateFavoriteVenues = () => {
    const favVenues = favorites
      .map((id) => venues.find((venue) => venue.id === id))
      .filter((venue): venue is Venue => venue !== undefined)
      .reverse(); // Reverse to show newest favorites first (LIFO display)

    setFavoriteVenues(favVenues);
  };

  // Remove last added favorite (LIFO - Last In, First Out)
  const removeLastFavorite = () => {
    if (favorites.length === 0) {
      return;
    }

    // Show confirmation modal for last added favorite
    const lastAddedId = favorites[favorites.length - 1];
    const lastAddedVenue = venues.find((v) => v.id === lastAddedId);

    if (lastAddedVenue) {
      setSelectedVenue({ id: lastAddedId, name: lastAddedVenue.name });
      setConfirmationVisible(true);
    }
  };

  // Remove specific favorite
  const removeFromFavorites = (venueId: number, venueName: string) => {
    setSelectedVenue({ id: venueId, name: venueName });
    setConfirmationVisible(true);
  };

  // Confirm removal
  const handleConfirmRemoval = () => {
    if (!selectedVenue) return;

    // Clear any existing undo timeout
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
    }

    // Set removing state to trigger animation
    setRemovingId(selectedVenue.id);

    // Store previous state for undo
    setPreviousFavorites([...favorites]);
    setLastRemovedVenue(selectedVenue);

    // Wait for animation to complete before updating state
    setTimeout(() => {
      const updatedFavorites = favorites.filter(
        (id) => id !== selectedVenue.id,
      );
      setFavorites(updatedFavorites);
      saveFavorites(updatedFavorites);
      setConfirmationVisible(false);
      setSelectedVenue(null);
      setRemovingId(null);

      // Show undo snackbar
      setUndoVisible(true);

      // Hide undo after 5 seconds
      undoTimeoutRef.current = setTimeout(() => {
        setUndoVisible(false);
        setLastRemovedVenue(null);
        setPreviousFavorites([]);
      }, 5000);
    }, 300); // Match animation duration
  };

  // Cancel removal
  const handleCancelRemoval = () => {
    setConfirmationVisible(false);
    setSelectedVenue(null);
  };

  // Handle undo
  const handleUndo = () => {
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
    }

    // Restore previous favorites
    setFavorites(previousFavorites);
    saveFavorites(previousFavorites);

    // Hide undo snackbar
    setUndoVisible(false);
    setLastRemovedVenue(null);
    setPreviousFavorites([]);
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
        <StatusBar barStyle="light-content" backgroundColor="#DC2626" />

        {/* Header */}
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
            <Text style={styles.emoji}>❤️</Text>
            <Text style={styles.title}>My Favorite Venues</Text>
            <Text style={styles.subtitle}>
              {favoriteVenues.length}{" "}
              {favoriteVenues.length === 1 ? "venue" : "venues"} saved
            </Text>

            {/* LIFO Remove Button */}
            {favoriteVenues.length > 0 && (
              <TouchableOpacity
                style={styles.lifoButton}
                onPress={removeLastFavorite}
                activeOpacity={0.7}
              >
                <Text style={styles.lifoButtonText}>🗑️ Remove Last Added</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
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

      {/* Header */}
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
          <Text style={styles.emoji}>❤️</Text>
          <Text style={styles.title}>My Favorite Venues</Text>
          <Text style={styles.subtitle}>
            {favoriteVenues.length}{" "}
            {favoriteVenues.length === 1 ? "venue" : "venues"} saved
          </Text>

          {/* LIFO Remove Button */}
          {favoriteVenues.length > 0 && (
            <TouchableOpacity
              style={styles.lifoButton}
              onPress={removeLastFavorite}
              activeOpacity={0.7}
            >
              <Text style={styles.lifoButtonText}>🗑️ Remove Last Added</Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      {/* Favorite Venues List */}
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
              totalCount={favoriteVenues.length}
              onRemove={removeFromFavorites}
              getSportColor={getSportColor}
              isRemoving={removingId === item.id}
            />
          )}
        />
      </View>

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={confirmationVisible}
        venueName={selectedVenue?.name || ""}
        onConfirm={handleConfirmRemoval}
        onCancel={handleCancelRemoval}
      />

      {/* Undo Snackbar */}
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
    // backgroundColor: "#DC2626",
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
    backgroundColor: "#DC2626",
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
    color: "#FCA5A5",
    marginTop: 8,
    textAlign: "center",
    letterSpacing: 0.5,
    fontWeight: "400",
    fontFamily: Platform.OS === "ios" ? "Avenir" : "sans-serif",
  },
  lifoButton: {
    marginTop: 16,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 2,
    borderColor: "#EF4444",
  },
  lifoButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#DC2626",
    fontFamily: Platform.OS === "ios" ? "Avenir-Heavy" : "sans-serif-medium",
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
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#DC2626",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderLeftWidth: 3,
    borderLeftColor: "#EF4444",
    position: "relative",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingRight: 50,
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
  removeButtonIcon: {
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 12,
    right: 12,
    padding: 6,
    zIndex: 10,
  },
  address: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
    marginBottom: 10,
    fontFamily: Platform.OS === "ios" ? "Avenir" : "sans-serif",
  },
  distanceContainer: {
    marginBottom: 10,
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
    alignItems: "flex-start",
    flexWrap: "wrap",
    marginTop: 2,
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
    color: "#DC2626",
    fontSize: 16,
    fontWeight: "500",
    fontFamily: Platform.OS === "ios" ? "Avenir" : "sans-serif",
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  confirmationModal: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 28,
    width: SCREEN_WIDTH * 0.85,
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  confirmationIcon: {
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#FEE2E2",
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignSelf: "center",
    borderWidth: 3,
    borderColor: "#FCA5A5",
  },
  confirmationTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginBottom: 12,
    fontFamily: Platform.OS === "ios" ? "Avenir-Heavy" : "sans-serif-medium",
  },
  confirmationMessage: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
    fontFamily: Platform.OS === "ios" ? "Avenir" : "sans-serif",
  },
  confirmationVenueName: {
    fontWeight: "700",
    color: "#1E293B",
    fontFamily: Platform.OS === "ios" ? "Avenir-Heavy" : "sans-serif-medium",
  },
  confirmationButtons: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E2E8F0",
  },
  cancelButtonText: {
    color: "#475569",
    fontSize: 16,
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Avenir-Heavy" : "sans-serif-medium",
  },
  removeButton: {
    flex: 1,
    backgroundColor: "#DC2626",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#DC2626",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  removeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Avenir-Heavy" : "sans-serif-medium",
  },

  // Undo Snackbar Styles
  // Update these styles in your StyleSheet:

  // Undo Snackbar Styles
  undoSnackbar: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: "#DC2626", // Changed from #1F2937 to match your theme
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    borderWidth: 2, // Added border
    borderColor: "#EF4444", // Added border color
  },
  undoContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  undoText: {
    color: "#FFFFFF", // Changed from #F9FAFB to white for better contrast
    fontSize: 15,
    marginLeft: 10,
    flex: 1,
    fontFamily: Platform.OS === "ios" ? "Avenir" : "sans-serif",
  },
  undoVenueName: {
    fontWeight: "700",
    color: "#FFFFFF", // Changed from #FFFFFF (same but kept for clarity)
    fontFamily: Platform.OS === "ios" ? "Avenir-Heavy" : "sans-serif-medium",
  },
  undoButton: {
    backgroundColor: "#FFFFFF", // Changed from #10B981 to white
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2, // Added border
    borderColor: "#EF4444", // Border color matching theme
  },
  undoButtonText: {
    color: "#DC2626", // Changed from #FFFFFF to red to match theme
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
    fontFamily: Platform.OS === "ios" ? "Avenir-Heavy" : "sans-serif-medium",
  },
});
