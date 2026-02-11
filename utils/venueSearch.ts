import { Venue } from "../types/venue";

export const quickSort = (arr: Venue[], ascending: boolean = true): Venue[] => {
  if (arr.length <= 1) return arr;

  const pivot = arr[Math.floor(arr.length / 2)];
  const left: Venue[] = [];
  const middle: Venue[] = [];
  const right: Venue[] = [];

  arr.forEach((venue) => {
    if (venue.kilometres < pivot.kilometres) left.push(venue);
    else if (venue.kilometres === pivot.kilometres) middle.push(venue);
    else right.push(venue);
  });

  return ascending
    ? [...quickSort(left, true), ...middle, ...quickSort(right, true)]
    : [...quickSort(right, false), ...middle, ...quickSort(left, false)];
};

export const filterVenues = (venues: Venue[], query: string): Venue[] => {
  if (!query.trim()) return venues;
  const lowerQuery = query.toLowerCase();
  return venues.filter(
    (venue) =>
      venue.name.toLowerCase().includes(lowerQuery) ||
      venue.address.toLowerCase().includes(lowerQuery) ||
      venue.sports.some((sport) => sport.toLowerCase().includes(lowerQuery)),
  );
};
