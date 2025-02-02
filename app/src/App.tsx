import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const API_URL = import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:5000";

function App() {
  const { loginWithRedirect, isAuthenticated, user, logout, getAccessTokenSilently } = useAuth0();
  const [preferences, setPreferences] = useState({
    flavorProfile: '',
    abv: '',
    strength: '',
    baseSpirit: ''
  });
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {!isAuthenticated ? (
          <button
            onClick={loginWithRedirect}
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Log In
          </button>
        ) : (
          <>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Welcome {user.name}</h1>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Log Out
              </button>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Flavor Profile</label>
                  <input
                    type="text"
                    value={preferences.flavorProfile}
                    onChange={(e) => setPreferences({...preferences, flavorProfile: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">ABV Range</label>
                  <input
                    type="text"
                    value={preferences.abv}
                    onChange={(e) => setPreferences({...preferences, abv: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="e.g., 10-15%"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Strength Preference</label>
                  <select
                    value={preferences.strength}
                    onChange={(e) => setPreferences({...preferences, strength: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="">Select strength</option>
                    <option value="Light">Light</option>
                    <option value="Medium">Medium</option>
                    <option value="Strong">Strong</option>
                  </select>
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
          </>
        )}
      </div>
    </div>
  );
}

export default App;