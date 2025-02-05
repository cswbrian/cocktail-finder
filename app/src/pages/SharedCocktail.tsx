import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CocktailSuggestion from "../components/CocktailSuggestion";

export default function SharedCocktail() {
  const { encoded } = useParams();
  const [cocktail, setCocktail] = useState(null);

  useEffect(() => {
    if (encoded) {
      try {
        const decoded = atob(encoded);
        setCocktail(JSON.parse(decoded));
      } catch (error) {
        console.error("Failed to decode cocktail:", error);
      }
    }
  }, [encoded]);

  if (!cocktail) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <CocktailSuggestion cocktail={cocktail} />
    </div>
  );
}
