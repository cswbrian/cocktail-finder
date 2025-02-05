import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Header from "./components/Header";
import CocktailFinder from "./components/CocktailFinder";
import SharedCocktail from "./pages/SharedCocktail";

function App() {
  const { isAuthenticated } = useAuth0();

  useEffect(() => {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      // You can store the event and show a custom install button
      console.log("PWA install prompt available");
    });
  }, []);

  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<CocktailFinder />} />

        <Route
          path="/twist"
          element={isAuthenticated ? <CocktailFinder /> : <Login />}
        />
        <Route path="/cocktails/:encoded" element={<SharedCocktail />} />

        {/* <Route path="/login" element={<Login />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
