import { VenueCardProps } from "../types/venue";
import { useRef, useEffect } from "react";
import {
  Animated,
  StyleSheet,
  Image,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const IMAGE_BASE_URL = process.env.EXPO_PUBLIC_IMAGE_BASE_URL!;

export const VenueCard = ({
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

const styles = StyleSheet.create({
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
});
