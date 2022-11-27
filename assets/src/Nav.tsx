import { Link } from "./pot/Router";

export default function Nav() {
  return (
    <nav style={{ background: "#c7d2fe", marginBottom: "10px" }}>
      <ol
        style={{ listStyleType: "none", display: "flex", padding: 0, gap: 10 }}
      >
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/admin">Admin</Link>
        </li>
        <li>
          <Link to="/fast">Fast</Link>
        </li>
        <li>
          <Link to="/404">404</Link>
        </li>
        <li>
          <Link to="/redirect">Redirect</Link>
        </li>
        <li>
          <Link to="/items">Outside pod 😡</Link>
        </li>
      </ol>
    </nav>
  );
}
