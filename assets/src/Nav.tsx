import { useState } from "react";
import { Link } from "./pot/Router";

export default function Nav({
  user,
  serverTime,
}: {
  user: string;
  serverTime: string;
}) {
  const [clientTime] = useState(() => {
    const date = new Date();
    return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
  });

  return (
    <nav style={{ background: "#c7d2fe", marginBottom: "10px" }}>
      <ol
        style={{ listStyleType: "none", display: "flex", padding: 0, gap: 10 }}
      >
        <li>
          <Link to="/pot">Home</Link>
        </li>
        <li>
          <Link to="/pot/admin">Admin</Link>
        </li>
        <li>
          <Link to="/pot/fast">Fast</Link>
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

        <li style={{ marginLeft: "auto" }}>
          Hi {user}! Server time: {serverTime} Client time:{" "}
          {clientTime.toString()}
        </li>
      </ol>
    </nav>
  );
}
