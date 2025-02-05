import { useState } from "react";
import { cn } from "../utils";
import CocktailSuggestion from "./CocktailSuggestion";
import FlavorChart from "./FlavorChart";
import { API_URL, flavorOptions, baseSpiritOptions } from "../lib/const";
import * as Slider from "@radix-ui/react-slider";

interface Preferences {
  flavorProfile: string[];
  baseSpirits: (typeof baseSpiritOptions)[number][];
  bubbles: string;
  booziness: number;
  sweetness: number;
  sourness: number;
  bodyWeight: number;
  complexity: number;
}

export default function CocktailFinder() {
  const [preferences, setPreferences] = useState<Preferences>({
    flavorProfile: [],
    baseSpirits: [],
    bubbles: "no",
    booziness: 0,
    sweetness: 0,
    sourness: 0,
    bodyWeight: 0,
    complexity: 0,
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

  // const handleFlavorSelect = (
  //   sweetness: number | null,
  //   booziness: number | null,
  // ) => {
  //   setPreferences((prev) => ({
  //     ...prev,
  //     sweetness: sweetness || 0,
  //     booziness: booziness || 0,
  //   }));
  // };

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
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-y-4">
          <div>
            {/* Commented out FlavorChart
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
            */}

            <div className="mt-4">
              <label className="font-semibold">
                Booziness (Light to Strong)
              </label>
              <Slider.Root
                className="relative flex h-5 w-full touch-none items-center select-none"
                value={[preferences.booziness]}
                onValueChange={([value]) =>
                  setPreferences((prev) => ({ ...prev, booziness: value }))
                }
                max={10}
                step={1}
              >
                <Slider.Track className="relative h-1 grow rounded-full bg-gray-700">
                  <Slider.Range className="absolute h-full rounded-full bg-white" />
                </Slider.Track>
                <Slider.Thumb className="focus:ring-opacity-50 block h-5 w-5 rounded-full bg-white focus:ring-2 focus:ring-white focus:outline-none" />
              </Slider.Root>
            </div>

            <div className="mt-4">
              <label className="font-semibold">Sweetness (Dry to Sweet)</label>
              <Slider.Root
                className="relative flex h-5 w-full touch-none items-center select-none"
                value={[preferences.sweetness]}
                onValueChange={([value]) =>
                  setPreferences((prev) => ({ ...prev, sweetness: value }))
                }
                max={10}
                step={1}
              >
                <Slider.Track className="relative h-1 grow rounded-full bg-gray-700">
                  <Slider.Range className="absolute h-full rounded-full bg-white" />
                </Slider.Track>
                <Slider.Thumb className="focus:ring-opacity-50 block h-5 w-5 rounded-full bg-white focus:ring-2 focus:ring-white focus:outline-none" />
              </Slider.Root>
            </div>

            <div className="mt-4">
              <label className="font-semibold">
                Sourness (Not Sour to Very Sour)
              </label>
              <Slider.Root
                className="relative flex h-5 w-full touch-none items-center select-none"
                value={[preferences.sourness]}
                onValueChange={([value]) =>
                  setPreferences((prev) => ({ ...prev, sourness: value }))
                }
                max={10}
                step={1}
              >
                <Slider.Track className="relative h-1 grow rounded-full bg-gray-700">
                  <Slider.Range className="absolute h-full rounded-full bg-white" />
                </Slider.Track>
                <Slider.Thumb className="focus:ring-opacity-50 block h-5 w-5 rounded-full bg-white focus:ring-2 focus:ring-white focus:outline-none" />
              </Slider.Root>
            </div>

            <div className="mt-4">
              <label className="font-semibold">
                Body/Weight (Light to Heavy)
              </label>
              <Slider.Root
                className="relative flex h-5 w-full touch-none items-center select-none"
                value={[preferences.bodyWeight]}
                onValueChange={([value]) =>
                  setPreferences((prev) => ({ ...prev, bodyWeight: value }))
                }
                max={10}
                step={1}
              >
                <Slider.Track className="relative h-1 grow rounded-full bg-gray-700">
                  <Slider.Range className="absolute h-full rounded-full bg-white" />
                </Slider.Track>
                <Slider.Thumb className="focus:ring-opacity-50 block h-5 w-5 rounded-full bg-white focus:ring-2 focus:ring-white focus:outline-none" />
              </Slider.Root>
            </div>

            <div className="mt-4">
              <label className="font-semibold">
                Complexity (Simple to Complex)
              </label>
              <Slider.Root
                className="relative flex h-5 w-full touch-none items-center select-none"
                value={[preferences.complexity]}
                onValueChange={([value]) =>
                  setPreferences((prev) => ({ ...prev, complexity: value }))
                }
                max={10}
                step={1}
              >
                <Slider.Track className="relative h-1 grow rounded-full bg-gray-700">
                  <Slider.Range className="absolute h-full rounded-full bg-white" />
                </Slider.Track>
                <Slider.Thumb className="focus:ring-opacity-50 block h-5 w-5 rounded-full bg-white focus:ring-2 focus:ring-white focus:outline-none" />
              </Slider.Root>
            </div>
          </div>
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

        {suggestions.length > 0 && (
          <div className="mt-4 text-sm text-gray-400">
            Heads up: Our AI bartender might be a little tipsy - results may
            vary! 🍹
          </div>
        )}

        <div className="mt-8 flex flex-col gap-y-6">
          {suggestions.map((cocktail, index) => (
            <CocktailSuggestion key={index} cocktail={cocktail} />
          ))}
        </div>
      </div>
    </div>
  );
}
