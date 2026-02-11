import React, { useRef, useEffect, useState } from "react";
import {
  Animated,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Easing,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type UndoSnackbarProps = {
  visible: boolean;
  venueName: string;
  onUndo: () => void;
};

export const UndoSnackbar = ({
  visible,
  venueName,
  onUndo,
}: UndoSnackbarProps) => {
  const slideAnim = useRef(new Animated.Value(100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
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
      ]).start(() => setShouldRender(false));
    }
  }, [visible]);

  if (!shouldRender) return null;

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

const styles = StyleSheet.create({
  undoSnackbar: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: "#DC2626",
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
    borderWidth: 2,
    borderColor: "#EF4444",
  },
  undoContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  undoText: {
    color: "#FFFFFF",
    fontSize: 15,
    marginLeft: 10,
    flex: 1,
    fontFamily: Platform.OS === "ios" ? "Avenir" : "sans-serif",
  },
  undoVenueName: {
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: Platform.OS === "ios" ? "Avenir-Heavy" : "sans-serif-medium",
  },
  undoButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#EF4444",
  },
  undoButtonText: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
    fontFamily: Platform.OS === "ios" ? "Avenir-Heavy" : "sans-serif-medium",
  },
});
