import { useState } from "react";
import "./CreateComplaint.css";

function CreateComplaint() {
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    {
      name: "Maintenance",
      icon: "🔧",
      description: "General society maintenance",
    },
    {
      name: "Plumbing",
      icon: "💧",
      description: "Pipes, taps or leakage",
    },
    {
      name: "Electrical",
      icon: "⚡",
      description: "Power or electrical issues",
    },
    {
      name: "Security",
      icon: "🛡️",
      description: "Safety and security concerns",
    },
    {
      name: "Cleaning",
      icon: "🧹",
      description: "Cleaning and hygiene",
    },
    {
      name: "Water",
      icon: "🚰",
      description: "Water supply issues",
    },
    {
      name: "Other",
      icon: "•••",
      description: "Something else",
    },
  ];

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setError("");

    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("You are not logged in. Please login again.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/complaints",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            category,
            description,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to create complaint"
        );
      }

      setMessage("Complaint submitted successfully!");
      setCategory("");
      setDescription("");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="complaint-page">

      <header className="complaint-header">
        <div
          className="complaint-brand"
          onClick={() => {
            window.location.href = "/";
          }}
        >
          <div className="complaint-brand-mark">
            S
          </div>

          <div className="complaint-brand-text">
            <h1>Society OS</h1>
            <span>Smart Issue Reporter</span>
          </div>
        </div>

        <button
          className="complaint-back"
          onClick={() => {
            window.location.href = "/";
          }}
        >
          <span>←</span>
          Dashboard
        </button>
      </header>

      <main className="complaint-content">

        <section className="complaint-intro">

          <div className="intro-badge">
            <span></span>
            RESIDENT SERVICES
          </div>

          <h2>
            Something needs
            <br />
            attention?
          </h2>

          <p>
            Tell us what happened and we'll make sure
            your issue reaches the right team.
          </p>

          <div className="report-steps">

            <div className="report-step">
              <div className="step-number">01</div>

              <div className="step-content">
                <strong>Choose a category</strong>
                <span>
                  Tell us what kind of issue you're facing.
                </span>
              </div>
            </div>

            <div className="report-step">
              <div className="step-number">02</div>

              <div className="step-content">
                <strong>Describe the issue</strong>
                <span>
                  Give us enough detail to understand it.
                </span>
              </div>
            </div>

            <div className="report-step">
              <div className="step-number">03</div>

              <div className="step-content">
                <strong>Submit & track</strong>
                <span>
                  Follow the progress from your dashboard.
                </span>
              </div>
            </div>

          </div>

        </section>

        <section className="complaint-form-card">

          <div className="form-card-header">

            <div>
              <span className="form-eyebrow">
                NEW REPORT
              </span>

              <h3>Report an issue</h3>
            </div>

            <div className="form-status">
              <span className="status-dot"></span>
              Ready
            </div>

          </div>

          <form
            onSubmit={handleSubmit}
            className="complaint-form"
          >

            <div className="form-group">

              <div className="field-heading">
                <label>
                  What is the issue about?
                </label>

                <span>Required</span>
              </div>

              <div className="category-grid">

                {categories.map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    className={`category-card ${
                      category === item.name
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      setCategory(item.name)
                    }
                  >
                    <div className="category-icon">
                      {item.icon}
                    </div>

                    <div className="category-info">
                      <strong>
                        {item.name}
                      </strong>

                      <span>
                        {item.description}
                      </span>
                    </div>

                    <div className="category-check">
                      {category === item.name
                        ? "✓"
                        : ""}
                    </div>
                  </button>
                ))}

              </div>
            </div>

            <div className="form-group">

              <div className="field-heading">
                <label htmlFor="complaint-description">
                  Describe the issue
                </label>

                <span>Required</span>
              </div>

              <textarea
                id="complaint-description"
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Example: Water is leaking from the pipe near the parking area..."
                rows="6"
                required
              />

              <div className="textarea-footer">
                <span>
                  Please provide location and relevant
                  details if possible.
                </span>

                <span>
                  {description.length} characters
                </span>
              </div>

            </div>

            <button
              type="submit"
              className="complaint-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="button-spinner"></span>
                  Submitting...
                </>
              ) : (
                <>
                  Submit Complaint
                  <span className="button-arrow">
                    →
                  </span>
                </>
              )}
            </button>

          </form>

          {message && (
            <div className="success-message">

              <div className="message-icon">
                ✓
              </div>

              <div>
                <strong>
                  Complaint submitted
                </strong>

                <p>
                  Your issue has been successfully
                  reported.
                </p>
              </div>

            </div>
          )}

          {error && (
            <div className="error-message">

              <div className="message-icon">
                !
              </div>

              <div>
                <strong>
                  Something went wrong
                </strong>

                <p>{error}</p>
              </div>

            </div>
          )}

        </section>

      </main>

    </div>
  );
}

export default CreateComplaint;