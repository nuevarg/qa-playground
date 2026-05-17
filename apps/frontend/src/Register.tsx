import { useState } from "react";
import { api } from "./api/client";
import { TEST_ID } from "./constant/testIds.ts";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      const response = await api.post("/users", {
        user: {
          username,
          email,
          password,
        },
      });

      console.log(response.data);

      alert("User registered successfully!");
    } catch (error) {
      console.error(error);

      alert("Registration failed");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Register</h1>

      <div>
        <input
          data-testid={TEST_ID.REGISTER.USERNAME_INPUT}
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <br />

      <div>
        <input
          data-testid={TEST_ID.REGISTER.EMAIL_INPUT}
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <br />

      <div>
        <input
          data-testid={TEST_ID.REGISTER.PASSWORD_INPUT}
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <br />

      <button data-testid={TEST_ID.REGISTER.BUTTON} onClick={handleRegister}>
        Register
      </button>
    </div>
  );
}

export default Register;
