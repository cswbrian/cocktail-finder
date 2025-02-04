export const API_URL =
  import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:5000";

export const flavorOptions = [
  {
    name: "Salty",
    bg: "bg-sky-400",
    border: "border-sky-400",
    text: "text-black",
  },
  {
    name: "Bitter",
    bg: "bg-yellow-400",
    border: "border-yellow-400",
    text: "text-black",
  },
  {
    name: "Fruity",
    bg: "bg-pink-400",
    border: "border-pink-400",
    text: "text-black",
  },
  {
    name: "Umami",
    bg: "bg-emerald-400",
    border: "border-emerald-400",
    text: "text-black",
  },
  {
    name: "Spicy",
    bg: "bg-red-400",
    border: "border-red-400",
    text: "text-black",
  },
  {
    name: "Herbal",
    bg: "bg-lime-400",
    border: "border-lime-400",
    text: "text-black",
  },
];

export const baseSpiritOptions = [
  "Vodka",
  "Gin",
  "Rum",
  "Tequila",
  "Whiskey",
  "Brandy",
];
