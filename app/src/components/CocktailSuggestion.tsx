import ShareButton from "./ShareButton";
import { Cocktail } from "../type";

interface Ingredient {
  name: string;
  amount: number;
  unit: string;
}

interface CocktailSuggestionProps {
  cocktail: Cocktail;
}

export default function CocktailSuggestion({
  cocktail,
}: CocktailSuggestionProps) {
  return (
    <div className="flex flex-col gap-2 rounded-3xl bg-neutral-900 p-6">
      <h3 className="mb-4 text-2xl">{cocktail.name}</h3>

      {/* Ingredients List */}
      <div className="mt-4">
        <h4 className="text-gray-400">Ingredients</h4>
        <ul className="mt-1">
          {[...cocktail.baseSpirits, ...cocktail.ingredients].map(
            (item, index) => (
              <li key={index} className="flex justify-between">
                {item.name}
                <span className="text-gray-400">
                  {item.amount} {item.unit}
                </span>
              </li>
            ),
          )}
        </ul>
      </div>

      {/* Technique */}
      {cocktail.technique && (
        <div className="mt-4">
          <h4 className="text-gray-400">Preparation</h4>
          <p className="mt-1">{cocktail.technique}</p>
        </div>
      )}

      {/* Garnish */}
      {cocktail.garnish && (
        <div className="mt-4">
          <h4 className="text-gray-400">Garnish</h4>
          <p className="mt-1">{cocktail.garnish}</p>
        </div>
      )}

      {/* Rationale */}
      <div className="mt-4">
        <p className="mt-1 text-gray-400">{cocktail.rationale}</p>
      </div>

      {/* Source Links */}
      {cocktail.source_links?.length > 0 && (
        <div className="mt-4 flex items-center gap-2">
          <span className="text-gray-400">References</span>
          {cocktail.source_links.map((source, index) => (
            <a
              key={index}
              href={source}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-4 w-4 items-center justify-center rounded-full border border-gray-400 text-xs text-gray-400"
            >
              {index + 1}
            </a>
          ))}
        </div>
      )}

      <ShareButton cocktail={cocktail} />
    </div>
  );
}
