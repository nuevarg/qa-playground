import { useCallback, useState, useEffect } from "react";
import { Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
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

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    handleLogoutSuccess();
    navigate("/login");
  }, [handleLogoutSuccess, navigate]);

  return (
    <main className="app-shell">
      <nav className="top-nav">
        <Link className="nav-link" to="/feed">
          Feed
        </Link>
        <div className="nav-right">
          {isAuthenticated ? (
            currentUser && (
              <div className="profile-dropdown-container">
                <div className="profile-dropdown-trigger">
                  {currentUser.image ? (
                    <img alt="" src={currentUser.image} />
                  ) : (
                    <svg viewBox="0 0 24 24" className="default-avatar-svg" fill="currentColor">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  )}
                </div>
                <div className="profile-dropdown-menu">
                  <Link className="profile-dropdown-item" to={`/profile/${currentUser.username}`}>
                    Profile
                  </Link>
                  <button className="profile-dropdown-item" onClick={handleLogout} style={{ width: "100%", textAlign: "left" }}>
                    Logout
                  </button>
                </div>
              </div>
            )
          ) : (
            <div style={{ display: "flex", gap: "12px" }}>
              <Link className="nav-link" to="/login">
                Login
              </Link>
              <Link className="nav-link" to="/register">
                Register
              </Link>
            </div>
          )}
        </div>
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
            element={
              <ProfilePage
                currentUser={currentUser}
                onUserUpdate={(updatedUser) => setCurrentUser(updatedUser)}
              />
            }
          />
        </Routes>
      </section>
    </main>
  );
}

export default App;
