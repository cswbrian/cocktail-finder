import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header>
      <nav className="container mx-auto p-4">
        <Link to="/">
          <h1 className="mt-8 text-4xl">Cocktail Finder</h1>
        </Link>
      </nav>
    </header>
  );
}
