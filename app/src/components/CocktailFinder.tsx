import { useState } from "react";
import { cn } from "../utils";
import CocktailSuggestion from "./CocktailSuggestion";
import FlavorChart from "./FlavorChart";
import { API_URL, flavorOptions, baseSpiritOptions } from "../lib/const";

interface Preferences {
  flavorProfile: string[];
  baseSpirits: (typeof baseSpiritOptions)[number][];
  bubbles: string;
  sweetness: number;
  booziness: number;
}

export default function CocktailFinder() {
  const [preferences, setPreferences] = useState<Preferences>({
    flavorProfile: [],
    baseSpirits: [],
    bubbles: "no",
    sweetness: 0,
    booziness: 0,
  });

  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showExamples, setShowExamples] = useState(false);

  const toggleFlavor = (flavor: string) => {
    setPreferences((prev) => ({
      ...prev,
      flavorProfile: prev.flavorProfile.includes(flavor)
        ? prev.flavorProfile.filter((f) => f !== flavor)
        : [...prev.flavorProfile, flavor],
    }));
  };

  const handleFlavorSelect = (
    sweetness: number | null,
    booziness: number | null,
  ) => {
    setPreferences((prev) => ({
      ...prev,
      sweetness: sweetness || 0,
      booziness: booziness || 0,
    }));
  };

  const parsePartialJSON = (text: string) => {
    try {
      // First try parsing the complete JSON
      return JSON.parse(text);
    } catch (error) {
      // If parsing fails, try to recover partial data
      try {
        // Look for the last complete suggestion object
        const lastCompleteObject = text.lastIndexOf('},"suggestions":[');
        if (lastCompleteObject > 0) {
          const partialText = text.substring(0, lastCompleteObject + 1) + "}]}";
          return JSON.parse(partialText);
        }
      } catch (innerError) {
        // If partial parsing fails, return empty suggestions
        return { suggestions: [] };
      }
      return { suggestions: [] };
    }
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

      const data = parsePartialJSON(await response.text());
      setSuggestions(data.suggestions);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleBaseSpirit = (spirit: string) => {
    setPreferences((prev) => ({
      ...prev,
      baseSpirits: prev.baseSpirits.includes(spirit)
        ? prev.baseSpirits.filter((s) => s !== spirit)
        : prev.baseSpirits.length < 3
          ? [...prev.baseSpirits, spirit]
          : prev.baseSpirits,
    }));
  };

  return (
    <div>
      <div className="relative container mx-auto p-4">
        <h1 className="mt-8 text-4xl">Cocktail Finder</h1>
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-y-4">
          <div>
            <label className="font-semibold">
              Click on the chart to select your preference
            </label>

            <label className="mt-2 flex items-center gap-2 text-gray-400">
              <input
                type="checkbox"
                checked={showExamples}
                onChange={(e) => setShowExamples(e.target.checked)}
              />
              <span className="text-xs">Show example cocktails</span>
            </label>

            <FlavorChart
              onSelect={handleFlavorSelect}
              showExamples={showExamples}
            />
            <div>
              <label className="font-semibold">Flavour Profile</label>
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
          </div>
          <div>
            <label className="font-semibold">Base Spirits (Select Max 3)</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {baseSpiritOptions.map((spirit) => (
                <button
                  className={cn(
                    "rounded-full border px-4 py-2",
                    preferences.baseSpirits.includes(spirit)
                      ? "border-white bg-white text-black"
                      : "border-white text-white",
                    preferences.baseSpirits.length >= 3 &&
                      !preferences.baseSpirits.includes(spirit)
                      ? "cursor-not-allowed opacity-50"
                      : "",
                  )}
                  type="button"
                  key={spirit}
                  onClick={() => toggleBaseSpirit(spirit)}
                  disabled={
                    preferences.baseSpirits.length >= 3 &&
                    !preferences.baseSpirits.includes(spirit)
                  }
                >
                  {spirit}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="font-semibold">Bubbles</label>
            <div className="flex flex-wrap gap-2">
              <label>
                <input
                  type="radio"
                  name="bubbles"
                  value="no"
                  checked={preferences.bubbles === "no"}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      bubbles: e.target.value,
                    })
                  }
                />
                <span>No Bubbles</span>
              </label>
              <label>
                <input
                  type="radio"
                  name="bubbles"
                  value="yes"
                  checked={preferences.bubbles === "yes"}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      bubbles: e.target.value,
                    })
                  }
                />
                <span>With Bubbles</span>
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

        {error && <div className="mt-2 text-red-400">{error}</div>}

        <div className="mt-8 flex flex-col gap-y-6">
          {suggestions.map((cocktail, index) => (
            <CocktailSuggestion key={index} cocktail={cocktail} />
          ))}
        </div>
      </div>
    </div>
  );
}
