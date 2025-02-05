import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CocktailSuggestion from "../components/CocktailSuggestion";
import LZString from "lz-string";

export default function SharedCocktail() {
  const { encoded } = useParams();
  const [cocktail, setCocktail] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (encoded) {
      try {
        const decoded = LZString.decompressFromEncodedURIComponent(encoded);
        if (decoded) {
          setCocktail(JSON.parse(decoded));
        } else {
          throw new Error("Failed to decompress data");
        }
      } catch (error) {
        console.error("Failed to decode cocktail:", error);
        navigate("/");
      }
    }
  }, [encoded, navigate]);

  if (!cocktail) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <CocktailSuggestion cocktail={cocktail} />
    </div>
  );
}
