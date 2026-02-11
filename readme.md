# 📍 PlaySpot – Sports Venue Listing App

A React Native (Expo) mobile application that lists nearby sports venues, allows users to sort by distance using a Quick Sort algorithm, search venues, and manage favorites using a Stack (LIFO) structure.

This project was developed as part of a technical assessment with focus on clean architecture, functionality, and performance.

---

## 🚀 Features

### 🏟 Venue Listing
- Fetches venue data from provided API
- Displays:
  - Venue name
  - Address
  - Distance (in km)
  - Rating
  - Available sports
- Modern card-based UI

### 🔎 Search Functionality
- Search by:
  - Venue name
  - Address
  - Sport type
- Debounced search for smooth UX

### ↕ Distance Sorting
- Custom **Quick Sort algorithm**
- Toggle sorting:
  - Ascending
  - Descending
  - Reset

### ❤️ Favorites (Stack Implementation)
- Add/remove venues to favorites
- Stored locally using `expo-secure-store`
- Favorites displayed in **LIFO order**
- Option to:
  - Remove specific venue
  - Remove last added venue (Stack pop)

### 🎨 UI Enhancements
- Custom splash screen
- Adaptive Android icon
- Animated cards
- Responsive layout
- Professional color theme

---

## 🛠 Tech Stack

- React Native
- Expo SDK 54
- TypeScript
- Expo Router
- Expo Secure Store
- React Native Animated API

---

## 🌐 API Used

**Venue API**
