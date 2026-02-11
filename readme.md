# 📍 Venue Finder – Sports Venue Listing App

A React Native (Expo) mobile app for listing nearby sports venues with custom Quick Sort algorithm, search, and Stack-based favorites management.

---

## 🚀 Features

- 🏟 **Venue Listing** - Browse venues with details (name, address, distance, rating, sports)
- 🔎 **Search** - Filter by venue name, address, or sport type
- ↕ **Quick Sort** - Custom sorting by distance (ascending/descending)
- ❤️ **Favorites (Stack)** - LIFO favorites with undo, locally persisted
- 🎨 **Animations** - Smooth card entrance, header, and modal transitions

---

## 🛠 Tech Stack

React Native • Expo SDK 54 • TypeScript • Expo Router • Expo Secure Store

---

## 📦 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Environment Variables

Create `.env`:

```
EXPO_PUBLIC_API_URL=https://your-api-domain.com/venues
```

### 3. Run the App

```bash
npm start
```

Then:

- **Android**: Press `a`
- **iOS**: Press `i`
- **Web**: Press `w`
- **Expo Go**: Press `s` and scan QR code

---

## 🔐 Environment Variables

| Variable              | Required | Description        |
| --------------------- | -------- | ------------------ |
| `EXPO_PUBLIC_API_URL` | ✅ Yes   | Venue API endpoint |

**Security:** Add `.env*` to `.gitignore`. Never commit sensitive data.

---

## 📁 Project Structure

```
venue-app/
├── app/(tabs)/          # Screen components (home, favorites, map)
├── components/          # Reusable UI components
├── hooks/              # Custom React hooks
├── utils/              # Utilities (search, sort)
├── types/              # TypeScript definitions
├── constants/          # App constants
└── assets/             # Images & icons
```

---

## 🔑 Key Implementations

- **Quick Sort Algorithm** (`utils/venueSearch.ts`) - O(n log n) venue sorting
- **Stack (LIFO)** - Favorites with secure storage
- **Custom Hooks** - Header animation & favorites management
- **Animations** - React Native Animated API for smooth transitions

---

## 🧪 Testing

Run linting and type checking:

```bash
npm run lint        # ESLint checks
npm run type-check  # TypeScript type checking
```

---

## 🐛 Troubleshooting

```bash
# Clear cache and restart
npm start -- --reset-cache

# Reinstall dependencies
rm -rf node_modules && npm install

# Android build clean
cd android && ./gradlew clean && cd ..
```

---

## 📱 Supported Platforms

✅ Android (API 21+) • ✅ iOS (12.0+) • ✅ Web • ✅ Expo Go

---

## ✨ Notes

- Requires active API connection to fetch venues
- Favorites persist locally between sessions
- Search is case-insensitive with partial matching
- All animations respect system reduce motion settings
