import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const API_URL = import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:5000";

export default function CocktailFinder() {
  const { user, logout, getAccessTokenSilently } = useAuth0();
  const [preferences, setPreferences] = useState({
    flavorProfile: [],
    strength: [],
    baseSpirit: '',
    bubbles: 'no'
  });

  console.log(preferences);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const flavorOptions = ['Sweet', 'Sour', 'Salty', 'Bitter', 'Umami', 'Fruity', 'Herbal', 'Spicy'];

  const toggleFlavor = (flavor: string) => {
    setPreferences(prev => ({
      ...prev,
      flavorProfile: prev.flavorProfile.includes(flavor)
        ? prev.flavorProfile.filter(f => f !== flavor)
        : [...prev.flavorProfile, flavor]
    }));
    };

  const handleStrengthChange = (strength: string) => {
    setPreferences(prev => ({
      ...prev,
      strength: prev.strength.includes(strength)
        ? prev.strength.filter(s => s !== strength)
        : [...prev.strength, strength]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`${API_URL}/api/suggest-cocktails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(preferences)
      });

      if (!response.ok) {
        throw new Error('Failed to get suggestions');
      }

      const data = await response.json();
      setSuggestions(data.suggestions);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-4 my-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-bold text-gray-900">Hello, {user?.name}</h1>
        <button
          onClick={logout}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Log Out
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="space-y-4">
        <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Flavor Profile</label>
            <div className="flex flex-wrap gap-2">
              {flavorOptions.map(flavor => (
                <button
                  type="button"
                  key={flavor}
                  onClick={() => toggleFlavor(flavor)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                    ${
                      preferences.flavorProfile.includes(flavor)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                  {flavor}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Strength Preference</label>
            <div className="mt-1 space-x-4">
              {['Light', 'Medium', 'Strong'].map(strength => (
                <label key={strength} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    value={strength}
                    checked={preferences.strength.includes(strength)}
                    onChange={() => handleStrengthChange(strength)}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{strength}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Base Spirit</label>
            <input
              type="text"
              value={preferences.baseSpirit}
              onChange={(e) => setPreferences({...preferences, baseSpirit: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="e.g., Vodka, Rum, Whiskey"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Bubbles Preference</label>
            <div className="mt-1 space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="bubbles"
                  value="no"
                  checked={preferences.bubbles === 'no'}
                  onChange={(e) => setPreferences({...preferences, bubbles: e.target.value})}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">No Bubbles</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="bubbles"
                  value="yes"
                  checked={preferences.bubbles === 'yes'}
                  onChange={(e) => setPreferences({...preferences, bubbles: e.target.value})}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">With Bubbles</span>
              </label>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
          >
            {loading ? 'Getting Suggestions...' : 'Get Suggestions'}
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-8">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {suggestions.map((cocktail, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{cocktail.name}</h3>
            <div className="space-y-2 text-gray-700">
              <p><span className="font-medium">Base Spirit:</span> {cocktail.baseSpirit}</p>
              <p><span className="font-medium">Ingredients:</span> {cocktail.otherIngredients.join(', ')}</p>
              {cocktail.potentialAllergens.length > 0 && (
                <p className="text-red-600 font-medium">
                  <span>Potential Allergens:</span> {cocktail.potentialAllergens.join(', ')}
                </p>
              )}
              <p><span className="font-medium">Why we recommend it:</span> {cocktail.reason}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 