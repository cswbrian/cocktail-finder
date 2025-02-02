import { useAuth0 } from '@auth0/auth0-react';
import Login from './components/Login';
import CocktailFinder from './components/CocktailFinder';

function App() {
  const { isAuthenticated } = useAuth0();

  return (
    <>
      {!isAuthenticated ? <Login /> : <CocktailFinder />}
    </>
  );
}

export default App;