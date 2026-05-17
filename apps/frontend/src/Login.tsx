import { useState } from "react";
import { api } from "./api/client";
import { TEST_ID } from "./constant/testIds.ts";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const response = await api.post("/users/login", {
        user: {
          email,
          password,
        },
      });

      const token = response.data.user.token;

      localStorage.setItem("token", token);

      alert("Login successful!");
    } catch (error) {
      console.error(error);

      alert("Login failed");
    }
  };

  return (
    <div>
      <h1>Login</h1>

      <div>
        <input
          data-testid={TEST_ID.LOGIN.EMAIL_INPUT}
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <br />

      <div>
        <input
          data-testid={TEST_ID.LOGIN.PASSWORD_INPUT}
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <br />

      <button data-testid={TEST_ID.LOGIN.BUTTON} onClick={handleLogin}>
        Login
      </button>
    </div>
  );
}

export default Login;
