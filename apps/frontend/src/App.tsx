import { useCallback, useState } from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";

import Register from "./Register";
import Login from "./Login";
import Dashboard from "./Dashboard";
import HomeFeed from "./HomeFeed";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return Boolean(localStorage.getItem("token"));
  });

  const handleAuthSuccess = useCallback(() => {
    setIsAuthenticated(true);
  }, []);

  const handleLogoutSuccess = useCallback(() => {
    setIsAuthenticated(false);
  }, []);

  return (
    <main className="app-shell">
      <nav className="top-nav">
        <Link className="nav-link" to="/feed">
          Feed
        </Link>
        {isAuthenticated ? (
          <Link className="nav-link" to="/dashboard">
            Dashboard
          </Link>
        ) : (
          <>
            <Link className="nav-link" to="/login">
              Login
            </Link>
            <Link className="nav-link" to="/register">
              Register
            </Link>
          </>
        )}
      </nav>

      <section className="page-center">
        <Routes>
          <Route path="/" element={<Navigate to="/feed" replace />} />
          <Route path="/feed" element={<HomeFeed />} />
          <Route
            path="/login"
            element={<Login onAuthSuccess={handleAuthSuccess} />}
          />
          <Route
            path="/register"
            element={<Register onAuthSuccess={handleAuthSuccess} />}
          />
          <Route
            path="/dashboard"
            element={<Dashboard onLogoutSuccess={handleLogoutSuccess} />}
          />
        </Routes>
      </section>
    </main>
  );
}

export default App;
