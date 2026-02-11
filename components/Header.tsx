import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
  Animated,
} from "react-native";

type HeaderProps = {
  title: string;
  subtitle: string;
  emoji: string;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searching?: boolean;
  onClearSearch?: () => void;
  sortOrder?: "asc" | "desc" | "none";
  onSort?: () => void;
  showSort?: boolean;
  headerColor?: string;
  showSearchBar?: boolean;
  additionalButton?: {
    text: string;
    onPress: () => void;
  };
  fadeAnim?: Animated.Value;
  slideAnim?: Animated.Value;
};

export const Header = ({
  title,
  subtitle,
  emoji,
  searchQuery = "",
  onSearchChange,
  searching = false,
  onClearSearch,
  sortOrder = "none",
  onSort,
  showSort = false,
  headerColor = "#1E40AF",
  showSearchBar = false,
  additionalButton,
  fadeAnim,
  slideAnim,
}: HeaderProps) => {
  const getSortIcon = () => {
    if (sortOrder === "none") return "⇅";
    if (sortOrder === "asc") return "↑";
    return "↓";
  };

  const animatedStyle =
    fadeAnim && slideAnim
      ? {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }
      : {};

  const HeaderContent = (
    <View style={[styles.gradientHeader, { backgroundColor: headerColor }]}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text
        style={[
          styles.subtitle,
          { color: headerColor === "#1E40AF" ? "#BFDBFE" : "#FCA5A5" },
        ]}
      >
        {subtitle}
      </Text>

      {showSearchBar && (
        <View style={styles.controlsRow}>
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search venues or sports..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={onSearchChange}
            />
            {searching ? (
              <ActivityIndicator
                size="small"
                color="#3B82F6"
                style={styles.searchLoader}
              />
            ) : searchQuery.length > 0 ? (
              <TouchableOpacity
                onPress={onClearSearch}
                style={styles.clearButton}
              >
                <Text style={styles.clearButtonText}>✕</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {showSort && (
            <TouchableOpacity
              style={styles.sortButton}
              onPress={onSort}
              activeOpacity={0.7}
            >
              <Text style={styles.sortButtonText}>{getSortIcon()}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {additionalButton && (
        <TouchableOpacity
          style={styles.lifoButton}
          onPress={additionalButton.onPress}
          activeOpacity={0.7}
        >
          <Text style={styles.lifoButtonText}>{additionalButton.text}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return fadeAnim && slideAnim ? (
    <Animated.View style={[styles.headerWrapper, animatedStyle]}>
      {HeaderContent}
    </Animated.View>
  ) : (
    <View style={styles.headerWrapper}>{HeaderContent}</View>
  );
};

const styles = StyleSheet.create({
  headerWrapper: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  gradientHeader: {
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
});
