import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Easing,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FavouriteCardProps } from '../types/venue';


export const FavouriteCard = ({
  item,
  index,
  onRemove,
  getSportColor,
  isRemoving,
}: FavouriteCardProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const trashAnimatedValue = useRef(new Animated.Value(1)).current;
  const removeSlideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay: index * 100,
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
          toValue: -500,
          duration: 300,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isRemoving]);

  const handleTrashPress = () => {
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
          <TouchableOpacity
            onPress={handleTrashPress}
            style={styles.removeButtonIcon}
            activeOpacity={0.6}
          >
            <Animated.View
              style={{ transform: [{ scale: trashAnimatedValue }] }}
            >
              <Ionicons name="trash-outline" size={20} color="#DC2626" />
            </Animated.View>
          </TouchableOpacity>

          <View style={styles.cardHeader}>
            <Text style={styles.name} numberOfLines={1}>
              {item.name}
            </Text>
            <View style={styles.ratingBadge}>
              <Text style={styles.star}>⭐</Text>
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
          </View>

          <Text style={styles.address} numberOfLines={2}>
            {item.address}
          </Text>

          <View style={styles.distanceBadge}>
            <Text style={styles.distance}>📍 {item.kilometres} km away</Text>
          </View>

          <View style={styles.sportsWrapper}>
            <Text style={styles.sportsLabel}>Sports:</Text>
            <View style={styles.sportsTags}>
              {item.sports.map((sport: string, sportIndex: number) => {
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

const styles = StyleSheet.create({
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
  distanceBadge: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    marginBottom: 10,
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
  },});