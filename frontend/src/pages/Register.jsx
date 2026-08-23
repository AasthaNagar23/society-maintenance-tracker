import { useState } from "react";
import { registerUser } from "../services/api";
import "./Register.css";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(event) {
    event.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      await registerUser(
        name,
        email,
        phone,
        password
      );

      setMessage(
        "Registration successful! You can now login."
      );

      setName("");
      setEmail("");
      setPhone("");
      setPassword("");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="register-page">

      <div className="register-card">

        <h1>Society Maintenance Tracker</h1>

        <h2>Create Account</h2>

        <form
          className="register-form"
          onSubmit={handleRegister}
        >

          <div className="form-group">

            <label htmlFor="name">
              Full Name
            </label>

            <input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              required
            />

          </div>

          <div className="form-group">

            <label htmlFor="register-email">
              Email
            </label>

            <input
              id="register-email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
            />

          </div>

          <div className="form-group">

            <label htmlFor="phone">
              Phone
            </label>

            <input
              id="phone"
              type="tel"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(event) =>
                setPhone(event.target.value)
              }
              required
            />

          </div>

          <div className="form-group">

            <label htmlFor="register-password">
              Password
            </label>

            <input
              id="register-password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              required
            />

          </div>

          {error && (
            <p className="error-message">
              {error}
            </p>
          )}

          {message && (
            <p className="success-message">
              {message}
            </p>
          )}

          <button
            type="submit"
            className="register-button"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>

        </form>

        <p className="login-text">

          Already have an account?{" "}

          <span
            onClick={() => {
              window.location.href = "/";
            }}
            style={{ cursor: "pointer" }}
          >
            Login here
          </span>

        </p>

      </div>

    </div>
  );
}

export default Register;