import { useEffect, useState } from "react";

import { api } from "./api/client";
import { getApiErrorMessages } from "./api/errors";
import { TEST_ID } from "./constant/testIds.ts";

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

function Dashboard() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setErrorMessages([
          "You are not logged in. Please login or register first.",
        ]);
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.get<CurrentUserApiResponse>("/user");

        setCurrentUser(response.data.data);
        setErrorMessages([]);
      } catch (error) {
        setErrorMessages(
          getApiErrorMessages(
            error,
            "Failed to load the current user from the backend.",
          ),
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setCurrentUser(null);
    setErrorMessages([
      "You have logged out. Please login again to view the dashboard.",
    ]);
  };

  if (isLoading) {
    return (
      <article className="card" data-testid={TEST_ID.DASHBOARD.CARD}>
        <h1 className="card-title">Dashboard</h1>
        <span className="status-badge" data-testid={TEST_ID.DASHBOARD.LOADING}>
          Loading current user...
        </span>
      </article>
    );
  }

  if (errorMessages.length > 0) {
    return (
      <article className="card" data-testid={TEST_ID.DASHBOARD.CARD}>
        <h1 className="card-title">Dashboard</h1>

        <div className="form-error" data-testid={TEST_ID.DASHBOARD.ERROR}>
          <ul className="error-list">
            {errorMessages.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </div>
      </article>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <article className="card" data-testid={TEST_ID.DASHBOARD.CARD}>
      <div className="user-header">
        <h1 className="card-title" data-testid={TEST_ID.DASHBOARD.USERNAME}>
          {currentUser.username}
        </h1>
        <span className="status-badge">✓ Current user loaded</span>
      </div>

      <div className="detail-row">
        <span className="detail-label">Email</span>
        <span className="detail-value" data-testid={TEST_ID.DASHBOARD.EMAIL}>
          {currentUser.email}
        </span>
      </div>

      <div className="detail-row">
        <span className="detail-label">Bio</span>
        <span className="detail-value" data-testid={TEST_ID.DASHBOARD.BIO}>
          {currentUser.bio || "N/A"}
        </span>
      </div>

      <div className="detail-row">
        <span className="detail-label">Token</span>
        <span className="token-value" data-testid={TEST_ID.DASHBOARD.TOKEN}>
          {currentUser.token}
        </span>
      </div>

      <div className="card-actions">
        <button
          className="secondary-button"
          data-testid={TEST_ID.DASHBOARD.LOGOUT_BUTTON}
          type="button"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </article>
  );
}

export default Dashboard;
