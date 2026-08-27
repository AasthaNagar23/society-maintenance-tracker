import { useState } from "react";
import "./CreateComplaint.css";

const API_URL =
  "https://society-maintenance-tracker-hok6.onrender.com";

function CreateComplaint() {
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
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

  function handlePhotoChange(event) {
    const selectedFile = event.target.files[0];

    setError("");
    setMessage("");

    if (!selectedFile) {
      setPhoto(null);
      setPhotoPreview("");
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setError(
        "Please select a JPG, PNG or WEBP image."
      );

      event.target.value = "";
      setPhoto(null);
      setPhotoPreview("");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError(
        "Photo size must be less than 5 MB."
      );

      event.target.value = "";
      setPhoto(null);
      setPhotoPreview("");
      return;
    }

    setPhoto(selectedFile);

    const previewUrl = URL.createObjectURL(
      selectedFile
    );

    setPhotoPreview(previewUrl);
  }

  function removePhoto() {
    setPhoto(null);
    setPhotoPreview("");

    const photoInput =
      document.getElementById("complaint-photo");

    if (photoInput) {
      photoInput.value = "";
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!category) {
      setError(
        "Please select a complaint category."
      );
      return;
    }

    if (!description.trim()) {
      setError("Please describe the issue.");
      return;
    }

    const token = localStorage.getItem(
      "access_token"
    );

    if (!token) {
      setError(
        "You are not logged in. Please login again."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      formData.append("category", category);
      formData.append("description", description);

      if (photo) {
        formData.append("photo", photo);
      }

      const response = await fetch(
        `${API_URL}/complaints`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Failed to create complaint"
        );
      }

      setMessage(
        "Complaint submitted successfully!"
      );

      setCategory("");
      setDescription("");
      setPhoto(null);
      setPhotoPreview("");

      const photoInput =
        document.getElementById(
          "complaint-photo"
        );

      if (photoInput) {
        photoInput.value = "";
      }
    } catch (err) {
      setError(
        err.message ||
          "Something went wrong while submitting the complaint."
      );
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
              <div className="step-number">
                01
              </div>

              <div className="step-content">
                <strong>
                  Choose a category
                </strong>

                <span>
                  Tell us what kind of issue you're
                  facing.
                </span>
              </div>
            </div>

            <div className="report-step">
              <div className="step-number">
                02
              </div>

              <div className="step-content">
                <strong>
                  Describe the issue
                </strong>

                <span>
                  Give us enough detail to understand
                  it.
                </span>
              </div>
            </div>

            <div className="report-step">
              <div className="step-number">
                03
              </div>

              <div className="step-content">
                <strong>
                  Submit & track
                </strong>

                <span>
                  Follow the progress from your
                  dashboard.
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
            {/* CATEGORY */}

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

            {/* DESCRIPTION */}

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
                  setDescription(
                    event.target.value
                  )
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

            {/* PHOTO UPLOAD */}

            <div className="form-group">
              <div className="field-heading">
                <label htmlFor="complaint-photo">
                  Add a photo
                </label>

                <span>Optional</span>
              </div>

              <div className="photo-upload-box">
                {!photoPreview ? (
                  <label
                    htmlFor="complaint-photo"
                    className="photo-upload-label"
                  >
                    <div className="photo-upload-icon">
                      📷
                    </div>

                    <div className="photo-upload-content">
                      <strong>
                        Upload a photo
                      </strong>

                      <span>
                        JPG, PNG or WEBP · Maximum
                        5 MB
                      </span>
                    </div>

                    <div className="photo-upload-action">
                      Choose file
                    </div>
                  </label>
                ) : (
                  <div className="photo-preview-container">
                    <img
                      src={photoPreview}
                      alt="Complaint preview"
                      className="photo-preview"
                    />

                    <div className="photo-preview-info">
                      <strong>
                        {photo?.name}
                      </strong>

                      <span>
                        {(
                          photo.size /
                          (1024 * 1024)
                        ).toFixed(2)}{" "}
                        MB
                      </span>
                    </div>

                    <button
                      type="button"
                      className="remove-photo-button"
                      onClick={removePhoto}
                    >
                      Remove
                    </button>
                  </div>
                )}

                <input
                  id="complaint-photo"
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  onChange={handlePhotoChange}
                  hidden
                />
              </div>
            </div>

            {/* SUBMIT */}

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

          {/* SUCCESS */}

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

          {/* ERROR */}

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