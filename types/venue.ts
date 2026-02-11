export type Venue = {
  id: number;
  name: string;
  address: string;
  kilometres: number;
  rating: number;
  sports: string[];
  logo?: string;
  favourite?: number;
  featured?: number;
  price?: { [key: string]: number };
};

// Venue Card Component with Animation
export type VenueCardProps = {
  item: Venue;
  isFavourite: boolean;
  onToggleFavourite: (venueId: number) => void;
  onPress: (venue: Venue) => void;
  getSportColor: (sport: string) => {
    bg: string;
    border: string;
    text: string;
  };
};

export type VenueModalProps = {
  visible: boolean;
  venue: Venue | null;
  onClose: () => void;
  isFavourite: boolean;
  onToggleFavourite: (venueId: number) => void;
  getSportColor: (sport: string) => {
    bg: string;
    border: string;
    text: string;
  };
};

// Favourite Card Component with Animation
export type FavouriteCardProps = {
  item: Venue;
  index: number;
  onRemove: (venueId: number, venueName: string) => void;
  getSportColor: (sport: string) => {
    bg: string;
    border: string;
    text: string;
  };
  isRemoving: boolean;
};
