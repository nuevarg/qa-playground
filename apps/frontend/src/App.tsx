import { useCallback, useState, useEffect } from "react";
import { Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";

import { api } from "./api/client";
import Register from "./Register";
import Login from "./Login";
import HomeFeed from "./HomeFeed";
import { ProfilePage } from "./ProfilePage";
import { Avatar } from "./components/Avatar";
import Settings from "./Settings";


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
                  <Avatar src={currentUser.image} alt={currentUser.username} />
                </div>
                <div className="profile-dropdown-menu">
                  <Link className="profile-dropdown-item" to={`/profile/${currentUser.username}`}>
                    Profile
                  </Link>
                  <Link className="profile-dropdown-item" to="/settings">
                    Settings
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
          <Route
            path="/settings"
            element={
              currentUser ? (
                <div style={{ width: "min(100%, 560px)", marginTop: "24px" }}>
                  <Settings
                    currentUser={currentUser}
                    onUpdateSuccess={(updatedUser) => {
                      setCurrentUser(updatedUser);
                      navigate(`/profile/${updatedUser.username}`);
                    }}
                    onCancel={() => navigate(-1)}
                  />
                </div>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </section>
    </main>
  );
}

export default App;
