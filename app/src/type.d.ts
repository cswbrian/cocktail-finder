export interface Cocktail {
  name: string;
  baseSpirits: Ingredient[];
  ingredients: Ingredient[];
  technique: string;
  garnish: string;
  flavor_profile: {
    sweetness: number;
    booziness: number;
    balance_rating: number;
  };
  rationale: string;
  source_links: string[];
}
