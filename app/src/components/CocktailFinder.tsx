import { useState } from "react";
import { cn } from "../utils";
import CocktailSuggestion from "./CocktailSuggestion";

const API_URL =
  import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:5000";

export default function CocktailFinder() {
  const [preferences, setPreferences] = useState({
    flavorProfile: [],
    strength: [],
    baseSpirit: "",
    sparkling: "no",
  });

  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const flavorOptions = [
    {
      name: "Sweet",
      bg: "bg-pink-500",
      border: "border-pink-500",
      text: "text-black",
    },
    {
      name: "Sour",
      bg: "bg-green-500",
      border: "border-green-500",
      text: "text-black",
    },
    {
      name: "Salty",
      bg: "bg-sky-500",
      border: "border-sky-500",
      text: "text-black",
    },
    {
      name: "Bitter",
      bg: "bg-yellow-500",
      border: "border-yellow-500",
      text: "text-black",
    },
    {
      name: "Fruity",
      bg: "bg-amber-500",
      border: "border-amber-500",
      text: "text-black",
    },
    {
      name: "Umami",
      bg: "bg-emerald-500",
      border: "border-emerald-500",
      text: "text-black",
    },
    {
      name: "Spicy",
      bg: "bg-red-500",
      border: "border-red-500",
      text: "text-black",
    },
    {
      name: "Herbal",
      bg: "bg-lime-500",
      border: "border-lime-500",
      text: "text-black",
    },
  ];

  const toggleFlavor = (flavor: string) => {
    setPreferences((prev) => ({
      ...prev,
      flavorProfile: prev.flavorProfile.includes(flavor)
        ? prev.flavorProfile.filter((f) => f !== flavor)
        : [...prev.flavorProfile, flavor],
    }));
  };

  const handleStrengthChange = (strength: string) => {
    setPreferences((prev) => ({
      ...prev,
      strength: prev.strength.includes(strength)
        ? prev.strength.filter((s) => s !== strength)
        : [...prev.strength, strength],
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/suggest-cocktails`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        throw new Error("Failed to get suggestions");
      }

      const data = await response.json();
      setSuggestions(data.suggestions);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="relative container mx-auto p-4">
        <h1 className="mt-8 text-4xl">Cocktail Finder</h1>
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-y-4">
          <div>
            <label className="font-semibold">Flavor Profile</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {flavorOptions.map((flavor) => (
                <button
                  className={cn(
                    "rounded-full border px-4 py-2",
                    preferences.flavorProfile.includes(flavor.name)
                      ? `${flavor.bg} ${flavor.border} ${flavor.text}`
                      : `border-white text-white`,
                  )}
                  type="button"
                  key={flavor.name}
                  onClick={() => toggleFlavor(flavor.name)}
                >
                  {flavor.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="font-semibold">Strength Preference</label>
            <div className="flex flex-wrap gap-2">
              {["Light", "Medium", "Strong"].map((strength) => (
                <label key={strength}>
                  <input
                    type="checkbox"
                    value={strength}
                    checked={preferences.strength.includes(strength)}
                    onChange={() => handleStrengthChange(strength)}
                  />
                  <span>{strength}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="font-semibold">Base Spirit</label>
            <input
              className="block w-full border-b border-white py-2"
              type="text"
              value={preferences.baseSpirit}
              onChange={(e) =>
                setPreferences({ ...preferences, baseSpirit: e.target.value })
              }
              placeholder="e.g., Vodka, Rum, Whiskey"
            />
          </div>
          <div>
            <label className="font-semibold">Sparkling Preference</label>
            <div className="flex flex-wrap gap-2">
              <label>
                <input
                  type="radio"
                  name="sparkling"
                  value="no"
                  checked={preferences.bubbles === "no"}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      bubbles: e.target.value,
                    })
                  }
                />
                <span>No Sparkling</span>
              </label>
              <label>
                <input
                  type="radio"
                  name="sparkling"
                  value="yes"
                  checked={preferences.bubbles === "yes"}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      bubbles: e.target.value,
                    })
                  }
                />
                <span>With Sparkling</span>
              </label>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className={cn(
              "rounded-full border border-white px-4 py-2 text-white",
              loading && "cursor-not-allowed bg-white text-black",
            )}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="mr-3 size-5 animate-spin text-black"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Mixing your drink...may take up to 30 secs
              </span>
            ) : (
              "Get Suggestions"
            )}
          </button>
        </form>

        {error && <div className="mt-2 text-red-500">{error}</div>}

        <div className="mt-8 flex flex-col gap-y-6">
          {suggestions.map((cocktail, index) => (
            <CocktailSuggestion key={index} cocktail={cocktail} />
          ))}
        </div>
      </div>
    </div>
  );
}
