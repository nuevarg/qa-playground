import { Routes, Route, Link, Navigate } from "react-router-dom";
import Register from "./Register";
import Login from "./Login";
import Dashboard from "./Dashboard";

function App() {
  return (
    <main className="app-shell">
      <nav className="top-nav">
        <Link className="nav-link" to="/login">
          Login
        </Link>
        <Link className="nav-link" to="/register">
          Register
        </Link>
        <Link className="nav-link" to="/dashboard">
          Dashboard
        </Link>
      </nav>

      <section className="page-center">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </section>
    </main>
  );
}

export default App;
