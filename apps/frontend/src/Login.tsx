import { useState, type FormEvent } from "react";

import { api } from "./api/client";
import { getApiErrorMessages } from "./api/errors";
import { useNavigate } from "react-router-dom";
import { TEST_ID } from "./constant/testIds.ts";

type LoggedInUser = {
  email: string;
  username: string;
  bio: string | null;
  image: string | null;
  token: string;
};

type LoginApiResponse = {
  success: boolean;
  message: string;
  data: LoggedInUser;
};

type LoginProps = {
  onAuthSuccess: () => void;
};

function Login({ onAuthSuccess }: LoginProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessages([]);
    setIsSubmitting(true);

    try {
      const response = await api.post<LoginApiResponse>("/users/login", {
        user: {
          email,
          password,
        },
      });

      const user = response.data.data;

      localStorage.setItem("token", user.token);
      onAuthSuccess();
      navigate("/dashboard");
    } catch (error) {
      setErrorMessages(
        getApiErrorMessages(
          error,
          "Login failed. Please check your email and password.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <article className="card">
      <h1 className="card-title">Login</h1>

      <p className="form-help">
        Sign in with an existing backend user. A successful login will store the
        JWT token and show the user details.
      </p>

      {errorMessages.length > 0 && (
        <div className="form-error">
          <ul className="error-list">
            {errorMessages.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleLogin}>
        <div className="form-field">
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            data-testid={TEST_ID.LOGIN.EMAIL_INPUT}
            placeholder="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div className="form-field">
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            data-testid={TEST_ID.LOGIN.PASSWORD_INPUT}
            placeholder="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        <button
          className="primary-button"
          data-testid={TEST_ID.LOGIN.BUTTON}
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
      </form>
    </article>
  );
}

export default Login;
