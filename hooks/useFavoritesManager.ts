import * as SecureStore from "expo-secure-store";

const FAVOURITES_KEY = "favourites";

export const useFavouritesManager = (initialFavourites: number[] = []) => {
  const loadFavourites = async (): Promise<number[]> => {
    try {
      const value = await SecureStore.getItemAsync(FAVOURITES_KEY);
      return value ? JSON.parse(value) : [];
    } catch (error) {
      console.log("Failed to load favourites", error);
      return [];
    }
  };

  const saveFavourites = async (data: number[]): Promise<void> => {
    try {
      await SecureStore.setItemAsync(FAVOURITES_KEY, JSON.stringify(data));
    } catch (error) {
      console.log("Failed to save favourites", error);
    }
  };

  const toggleFavourite = (venueId: number, favourites: number[]): number[] => {
    return favourites.includes(venueId)
      ? favourites.filter((id) => id !== venueId)
      : [...favourites, venueId];
  };

  const isFavourite = (venueId: number, favourites: number[]): boolean => {
    return favourites.includes(venueId);
  };

  return {
    loadFavourites,
    saveFavourites,
    toggleFavourite,
    isFavourite,
    FAVOURITES_KEY,
  };
};
