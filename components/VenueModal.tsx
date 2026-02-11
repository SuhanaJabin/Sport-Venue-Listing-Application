import { VenueModalProps } from "../types/venue";
import { useRef, useEffect } from "react";
import {
  Animated,
  Modal,
  StyleSheet,
  Image,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Easing,
  Platform,
} from "react-native";

const IMAGE_BASE_URL = process.env.EXPO_PUBLIC_IMAGE_BASE_URL!;
const SCREEN_HEIGHT = 800; // Approximate screen height for animation

export const VenueModal = ({
  visible,
  venue,
  onClose,
  isFavourite,
  onToggleFavourite,
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
                onPress={() => onToggleFavourite(venue.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalFavoriteIcon}>
                  {isFavourite ? "❤️" : "🤍"}
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
                {venue.price &&
                  Object.entries(venue.price).map(([sport, price], index) => (
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

const styles = StyleSheet.create({
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
});
