import { useCallback, useState, useEffect } from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import axios from "axios";

import { api } from "./api/client";
import Register from "./Register";
import Login from "./Login";
import HomeFeed from "./HomeFeed";
import { ProfilePage } from "./ProfilePage";


type CurrentUser = {
  id: number;
  email: string;
  username: string;
  bio: string | null;
  image: string | null;
  token: string;
};

type CurrentUserApiResponse = {
  success: boolean;
  message: string;
  data: CurrentUser;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return Boolean(localStorage.getItem("token"));
  });

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setCurrentUser(null);
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await api.get<CurrentUserApiResponse>("/user");
        setCurrentUser(response.data.data);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          localStorage.removeItem("token");
          setIsAuthenticated(false);
          setCurrentUser(null);
        }
      }
    };

    fetchUser();
  }, [isAuthenticated]);

  const handleAuthSuccess = useCallback(() => {
    setIsAuthenticated(true);
  }, []);

  const handleLogoutSuccess = useCallback(() => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  }, []);

  return (
    <main className="app-shell">
      <nav className="top-nav">
        <Link className="nav-link" to="/feed">
          Feed
        </Link>
        {isAuthenticated ? (
          <>
            {currentUser && (
              <Link className="nav-link" to={`/profile/${currentUser.username}`}>
                Profile
              </Link>
            )}
          </>
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
          <Route path="/feed" element={<HomeFeed currentUser={currentUser} />} />
          <Route
            path="/login"
            element={<Login onAuthSuccess={handleAuthSuccess} />}
          />
          <Route
            path="/register"
            element={<Register onAuthSuccess={handleAuthSuccess} />}
          />
          <Route
            path="/profile/:username"
            element={<ProfilePage currentUser={currentUser} onLogoutSuccess={handleLogoutSuccess} />}
          />
        </Routes>
      </section>
    </main>
  );
}

export default App;
