import { Routes, Route, Link } from "react-router-dom";

import Register from "./Register";
import Login from "./Login";

function App() {
  return (
    <div style={{ padding: "2rem" }}>
      <nav style={{ marginBottom: "2rem" }}>
        <Link to="/register">Register</Link>

        {" | "}

        <Link to="/login">Login</Link>
      </nav>

      <Routes>
        <Route path="/register" element={<Register />} />

        <Route path="/login" element={<Login />} />
      </Routes>
    </div>
  );
}

export default App;
