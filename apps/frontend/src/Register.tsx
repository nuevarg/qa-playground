import { FormEvent, useState } from "react";

import { api } from "./api/client";
import { getApiErrorMessages } from "./api/errors";
import { useNavigate } from "react-router-dom";
import { TEST_ID } from "./constant/testIds.ts";

type RegisteredUser = {
  email: string;
  username: string;
  bio: string | null;
  image: string | null;
  token: string;
};

type RegisterApiResponse = {
  success: boolean;
  message: string;
  data: RegisteredUser;
};

type RegisterProps = {
  onAuthSuccess: () => void;
};

function Register({ onAuthSuccess }: RegisterProps) {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessages([]);
    setIsSubmitting(true);

    try {
      const response = await api.post<RegisterApiResponse>("/users", {
        user: {
          username,
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
          "Registration failed. Please check the form and try again.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <article className="card">
      <h1 className="card-title">Register</h1>

      <p className="form-help">
        Create a new backend user. The backend requires a unique username, a
        unique email, and a strong password.
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

      <form onSubmit={handleRegister}>
        <div className="form-field">
          <label htmlFor="register-username">Username</label>
          <input
            id="register-username"
            data-testid={TEST_ID.REGISTER.USERNAME_INPUT}
            placeholder="Username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
        </div>

        <div className="form-field">
          <label htmlFor="register-email">Email</label>
          <input
            id="register-email"
            data-testid={TEST_ID.REGISTER.EMAIL_INPUT}
            placeholder="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div className="form-field">
          <label htmlFor="register-password">Password</label>
          <input
            id="register-password"
            data-testid={TEST_ID.REGISTER.PASSWORD_INPUT}
            placeholder="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        <button
          className="primary-button"
          data-testid={TEST_ID.REGISTER.BUTTON}
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Creating account..." : "Register"}
        </button>
      </form>
    </article>
  );
}

export default Register;
