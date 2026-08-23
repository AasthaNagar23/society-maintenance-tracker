import { useState } from "react";
import { loginUser, getCurrentUser } from "../services/api";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await loginUser(email, password);

      localStorage.setItem(
        "access_token",
        data.access_token
      );

      const user = await getCurrentUser();

      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      alert(`Welcome, ${user.name}!`);

      window.location.reload();

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">

      {/* LEFT SIDE */}

      <section className="login-intro">

        <div className="login-brand">

          <div className="login-brand-mark">
            S
          </div>

          <div>
            <strong>Society OS</strong>
            <span>
              Community management made simple
            </span>
          </div>

        </div>


        <div className="intro-content">

          <span className="intro-label">
            WELCOME BACK
          </span>

          <h1>
            Your society,
            <br />
            <span>in one place.</span>
          </h1>

          <p>
            Manage maintenance payments, report
            complaints and stay updated with
            everything happening around your society.
          </p>

        </div>


        <div className="login-features">

          <div className="login-feature">

            <div className="feature-icon">
              ₹
            </div>

            <div>
              <strong>Maintenance</strong>
              <span>
                Track your monthly payments
              </span>
            </div>

          </div>


          <div className="login-feature">

            <div className="feature-icon">
              !
            </div>

            <div>
              <strong>Complaints</strong>
              <span>
                Report and follow up on issues
              </span>
            </div>

          </div>


          <div className="login-feature">

            <div className="feature-icon">
              ✓
            </div>

            <div>
              <strong>Updates</strong>
              <span>
                Keep track of important changes
              </span>
            </div>

          </div>

        </div>


        <div className="login-footer">
          Society OS • Resident Portal
        </div>

      </section>


      {/* RIGHT SIDE */}

      <section className="login-form-area">

        <div className="login-card">

          {/* MOBILE BRAND */}

          <div className="mobile-brand">

            <div className="login-brand-mark">
              S
            </div>

            <strong>
              Society OS
            </strong>

          </div>


          {/* FORM HEADING */}

          <div className="form-heading">

            <span>
              ACCOUNT ACCESS
            </span>

            <h2>
              Welcome back
            </h2>

            <p>
              Sign in to continue to your dashboard.
            </p>

          </div>


          {/* LOGIN FORM */}

          <form
            className="login-form"
            onSubmit={handleLogin}
          >

            <div className="form-group">

              <label htmlFor="email">
                Email address
              </label>

              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
              />

            </div>


            <div className="form-group">

              <div className="password-heading">

                <label htmlFor="password">
                  Password
                </label>

                <span>
                  Required
                </span>

              </div>

              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
              />

            </div>


            {/* ERROR */}

            {error && (
              <div className="login-error">

                <span>
                  !
                </span>

                <p>
                  {error}
                </p>

              </div>
            )}


            {/* BUTTON */}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >

              {loading ? (
                <>
                  <span className="login-spinner"></span>
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <span>→</span>
                </>
              )}

            </button>

          </form>


          {/* REGISTER */}

          <div className="register-area">

            <span>
              Don't have an account?
            </span>

            <button
              type="button"
              onClick={() => {
                window.location.href = "/register";
              }}
            >
              Create one
            </button>

          </div>


          {/* NOTE */}

          <div className="login-note">
            Your account details are securely
            handled by Society OS.
          </div>

        </div>

      </section>

    </div>
  );
}

export default Login;