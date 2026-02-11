import * as SecureStore from "expo-secure-store";

const FAVORITES_KEY = "favorites";

export const useFavoritesManager = (initialFavorites: number[] = []) => {
  const loadFavorites = async (): Promise<number[]> => {
    try {
      const value = await SecureStore.getItemAsync(FAVORITES_KEY);
      return value ? JSON.parse(value) : [];
    } catch (error) {
      console.log("Failed to load favorites", error);
      return [];
    }
  };

  const saveFavorites = async (data: number[]): Promise<void> => {
    try {
      await SecureStore.setItemAsync(FAVORITES_KEY, JSON.stringify(data));
    } catch (error) {
      console.log("Failed to save favorites", error);
    }
  };

  const toggleFavorite = (venueId: number, favorites: number[]): number[] => {
    return favorites.includes(venueId)
      ? favorites.filter((id) => id !== venueId)
      : [...favorites, venueId];
  };

  const isFavorite = (venueId: number, favorites: number[]): boolean => {
    return favorites.includes(venueId);
  };

  return {
    loadFavorites,
    saveFavorites,
    toggleFavorite,
    isFavorite,
    FAVORITES_KEY,
  };
};
