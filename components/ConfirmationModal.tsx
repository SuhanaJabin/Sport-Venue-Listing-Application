import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type ConfirmationModalProps = {
  visible: boolean;
  venueName: string;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message?: string;
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const ConfirmationModal = ({
  visible,
  venueName,
  onConfirm,
  onCancel,
  title = "Remove favourite?",
  message = "Are you sure you want to remove",
}: ConfirmationModalProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
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

  const animateClose = (callback: () => void) => {
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
    ]).start(callback);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={() => animateClose(onCancel)}
      statusBarTranslucent
    >
      <View style={styles.modalOverlay}>
        <Animated.View style={[styles.modalBackdrop, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={() => animateClose(onCancel)}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.confirmationModal,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <View style={styles.confirmationIcon}>
            <Ionicons name="trash-outline" size={40} color="#DC2626" />
          </View>

          <Text style={styles.confirmationTitle}>{title}</Text>

          <Text style={styles.confirmationMessage}>
            {message}{" "}
            <Text style={styles.confirmationVenueName}>"{venueName}"</Text> from
            your favourites?
          </Text>

          <View style={styles.confirmationButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => animateClose(onCancel)}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => animateClose(onConfirm)}
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

const styles = StyleSheet.create({
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
    fontSize: 18,
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
});
