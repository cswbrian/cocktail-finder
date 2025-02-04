import { useAuth0 } from "@auth0/auth0-react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import CocktailFinder from "./components/CocktailFinder";
import { useEffect } from "react";

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
