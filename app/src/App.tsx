import { useAuth0 } from '@auth0/auth0-react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import CocktailFinder from './components/CocktailFinder';

function App() {
  const { isAuthenticated } = useAuth0();

  return (
    <Router>
      <Routes>
        <Route path="/" element={<CocktailFinder />} />
        
        <Route
          path="/twist"
          element={isAuthenticated ? <CocktailFinder /> : <Login />}
        />
        
        {/* <Route path="/login" element={<Login />} /> */}
      </Routes>
    </Router>
  );
}

export default App;