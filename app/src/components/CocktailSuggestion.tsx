interface Ingredient {
  name: string;
  amount: number;
  unit: string;
}

interface Cocktail {
  name: string;
  baseSpirits: Ingredient[];
  liqueurs: Ingredient[];
  ingredients: Ingredient[];
  garnish: string;
  reason: string;
  relevanceScore: number;
  sources?: string[];
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

      <div>
        <ul className="mt-1">
          {[
            ...(cocktail.baseSpirits?.length > 0 ? cocktail.baseSpirits : []),
            ...(cocktail.liqueurs?.length > 0 ? cocktail.liqueurs : []),
            ...(cocktail.ingredients?.length > 0 ? cocktail.ingredients : []),
          ].map((item, index) => (
            <li key={index} className="flex justify-between">
              {item.name}
              <span className="text-gray-400">
                {item.amount} {item.unit}
              </span>
            </li>
          ))}
        </ul>
        {cocktail.garnish && (
          <div className="flex justify-between">
            <div>{cocktail.garnish}</div>
            <span className="text-gray-400">Garnish</span>
          </div>
        )}
      </div>
      <p className="mt-4 text-gray-400">{cocktail.reason}</p>
      {cocktail.sources && cocktail.sources.length > 0 && (
        <div className="mt-4 flex items-center gap-2">
          <span className="text-sm text-gray-400">References</span>
          <div className="flex gap-2">
            {cocktail.sources.map((source, index) => (
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
        </div>
      )}
    </div>
  );
}
