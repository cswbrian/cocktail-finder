interface Cocktail {
  name: string;
  baseSpirit: string;
  otherIngredients: string[];
  potentialAllergens: string[];
  reason: string;
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

      <p>
        <span>Base Spirit:</span> {cocktail.baseSpirit}
      </p>
      <p>
        <span>Ingredients:</span> {cocktail.otherIngredients.join(", ")}
      </p>
      {cocktail.potentialAllergens.length > 0 && (
        <p>
          <span>Potential Allergens:</span>{" "}
          {cocktail.potentialAllergens.join(", ")}
        </p>
      )}
      <p>
        <span>Why we recommend it:</span> {cocktail.reason}
      </p>
    </div>
  );
}
