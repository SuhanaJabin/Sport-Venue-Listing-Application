export const getSportColor = (sport: string) => {
  const sportColors: {
    [key: string]: { bg: string; border: string; text: string };
  } = {
    Football: { bg: "#DCFCE7", border: "#22C55E", text: "#166534" },
    Cricket: { bg: "#FEF3C7", border: "#F59E0B", text: "#92400E" },
    Basketball: { bg: "#FFEDD5", border: "#F97316", text: "#9A3412" },
    Tennis: { bg: "#FEE2E2", border: "#EF4444", text: "#991B1B" },
    Volleyball: { bg: "#E0E7FF", border: "#6366F1", text: "#3730A3" },
    Badminton: { bg: "#FCE7F3", border: "#EC4899", text: "#9F1239" },
    "Table Tennis": { bg: "#DBEAFE", border: "#3B82F6", text: "#1E40AF" },
  };
  return (
    sportColors[sport] || {
      bg: "#F3F4F6",
      border: "#9CA3AF",
      text: "#374151",
    }
  );
};
