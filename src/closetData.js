export const INITIAL_CLOSET = [];

export const CATEGORIES = [
  { key: "ALL", label: "all" },
  { key: "TOP", label: "tops" },
  { key: "BOTTOM", label: "bottoms" },
  { key: "SHOES", label: "shoes" },
  { key: "SET", label: "sets" },
  { key: "HEAD_COVERING", label: "head cover" },
  { key: "HAT", label: "hats" },
  { key: "JEWELRY", label: "jewelry" },
  { key: "BAG", label: "bags" },
  { key: "BELT", label: "belts" },
];

export const NEUTRAL_COLORS = ["white", "black", "grey", "gray", "beige", "tan", "cream", "brown", "ivory", "khaki", "denim", "navy"];

// True if two colors can reasonably be worn together: either one is
// neutral, or they're the same color family. This is a simple stand-in
// for real style knowledge, not a guess.
export function colorsCompatible(colorA, colorB) {
  const a = (colorA || "").toLowerCase().trim();
  const b = (colorB || "").toLowerCase().trim();
  if (!a || !b) return true;
  if (NEUTRAL_COLORS.indexOf(a) !== -1 || NEUTRAL_COLORS.indexOf(b) !== -1) return true;
  if (a === b) return true;
  return false;
}