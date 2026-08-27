import { useEffect, useState } from "react";
import "./MyComplaints.css";

const API_URL =
  "https://society-maintenance-tracker-hok6.onrender.com";

function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);

  async function fetchComplaints() {
    const token = localStorage.getItem("access_token");

    try {
      setLoading(true);
      setError("");

      if (!token) {
        throw new Error(
          "You are not logged in. Please login again."
        );
      }

      const response = await fetch(
        `${API_URL}/complaints`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to load complaints"
        );
      }

      setComplaints(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      setError(
        err.message || "Failed to load complaints."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchComplaints();
  }, []);

  async function viewHistory(complaintId) {
    const token = localStorage.getItem("access_token");

    // If the same complaint is clicked again,
    // hide its history.
    if (selectedComplaint === complaintId) {
      setSelectedComplaint(null);
      setHistory([]);
      return;
    }

    try {
      setError("");
      setHistoryLoading(true);

      if (!token) {
        throw new Error(
          "You are not logged in. Please login again."
        );
      }

      const response = await fetch(
        `${API_URL}/complaints/${complaintId}/history`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Failed to load complaint history"
        );
      }

      setHistory(
        Array.isArray(data) ? data : []
      );

      setSelectedComplaint(complaintId);
    } catch (err) {
      setError(
        err.message ||
          "Failed to load complaint history."
      );
    } finally {
      setHistoryLoading(false);
    }
  }

  function getStatusClass(status) {
    const normalized = status
      ?.toLowerCase()
      .replace(/\s+/g, "_");

    if (normalized === "resolved") {
      return "status-resolved";
    }

    if (
      normalized === "in_progress" ||
      normalized === "in-progress"
    ) {
      return "status-progress";
    }

    return "status-open";
  }

  function getStatusLabel(status) {
    const normalized = status
      ?.toLowerCase()
      .replace(/\s+/g, "_");

    if (
      normalized === "in_progress" ||
      normalized === "in-progress"
    ) {
      return "In Progress";
    }

    if (normalized === "resolved") {
      return "Resolved";
    }

    return "Open";
  }

  function getCategoryIcon(category) {
    const icons = {
      Maintenance: "🔧",
      Plumbing: "💧",
      Electrical: "⚡",
      Security: "🛡️",
      Cleaning: "🧹",
      Water: "🚰",
      Other: "•••",
    };

    return icons[category] || "📋";
  }

  function getProgress(status) {
    const normalized = status
      ?.toLowerCase()
      .replace(/\s+/g, "_");

    if (normalized === "resolved") {
      return 100;
    }

    if (
      normalized === "in_progress" ||
      normalized === "in-progress"
    ) {
      return 55;
    }

    return 15;
  }

  function getHistoryStatus(item) {
    return (
      item.new_status ||
      item.status ||
      item.old_status ||
      "Open"
    );
  }

  function getHistoryNote(item) {
    return (
      item.note ||
      item.comment ||
      "Status updated"
    );
  }

  function formatHistoryDate(date) {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  if (loading) {
    return (
      <div className="complaints-loading">
        <div className="loading-spinner"></div>

        <p>
          Loading your complaints...
        </p>
      </div>
    );
  }

  if (
    error &&
    complaints.length === 0
  ) {
    return (
      <div className="complaints-error-page">
        <div className="error-box">

          <div className="error-icon">
            !
          </div>

          <h2>
            Unable to load complaints
          </h2>

          <p>
            {error}
          </p>

          <button
            onClick={fetchComplaints}
          >
            Try Again
          </button>

        </div>
      </div>
    );
  }

  return (
    <div className="complaints-page">

      {/* =========================================
          HEADER
          ========================================= */}

      <header className="complaints-header">

        <div
          className="complaints-brand"
          onClick={() => {
            window.location.href = "/";
          }}
        >

          <div className="complaints-brand-mark">
            S
          </div>

          <div>
            <h1>
              Society OS
            </h1>

            <span>
              Issue Tracking Center
            </span>
          </div>

        </div>

        <button
          className="complaints-dashboard-btn"
          onClick={() => {
            window.location.href = "/";
          }}
        >
          ← Dashboard
        </button>

      </header>

      {/* =========================================
          MAIN
          ========================================= */}

      <main className="complaints-content">

        <section className="complaints-title-section">

          <div>

            <div className="section-eyebrow">
              RESIDENT SERVICES
            </div>

            <h2>
              Your Issues
            </h2>

            <p>
              Track every complaint from submission
              to resolution.
            </p>

          </div>

          <div className="complaint-count">

            <strong>
              {complaints.length}
            </strong>

            <span>
              {complaints.length === 1
                ? "Complaint"
                : "Complaints"}
            </span>

          </div>

        </section>

        {/* =========================================
            ERROR
            ========================================= */}

        {error && (
          <div className="inline-error">
            <span>!</span>
            {error}
          </div>
        )}

        {/* =========================================
            EMPTY STATE
            ========================================= */}

        {complaints.length === 0 ? (

          <section className="no-complaints">

            <div className="empty-icon">
              ✓
            </div>

            <h2>
              All clear!
            </h2>

            <p>
              You haven't submitted any complaints yet.
              If something needs attention, you can
              report it from the dashboard.
            </p>

            <button
              onClick={() => {
                window.location.href =
                  "/complaint";
              }}
            >
              Raise a Complaint →
            </button>

          </section>

        ) : (

          /* =========================================
             COMPLAINT LIST
             ========================================= */

          <section className="complaints-list">

            {complaints.map((complaint) => {

              const progress =
                getProgress(
                  complaint.status
                );

              const isSelected =
                selectedComplaint ===
                complaint.id;

              return (
                <article
                  className={`complaint-item ${
                    isSelected
                      ? "complaint-expanded"
                      : ""
                  }`}
                  key={complaint.id}
                >

                  {/* CARD TOP */}

                  <div className="complaint-card-top">

                    <div className="category-icon-large">
                      {getCategoryIcon(
                        complaint.category
                      )}
                    </div>

                    <div className="complaint-main-info">

                      <div className="complaint-title-row">

                        <div>

                          <span className="complaint-id">
                            ISSUE #{complaint.id}
                          </span>

                          <h3>
                            {complaint.category}
                          </h3>

                        </div>

                        <span
                          className={`complaint-status ${getStatusClass(
                            complaint.status
                          )}`}
                        >
                          <span></span>

                          {getStatusLabel(
                            complaint.status
                          )}
                        </span>

                      </div>

                      <p className="complaint-description">
                        {complaint.description}
                      </p>

                    </div>

                  </div>

                  {/* PROGRESS */}

                  <div className="complaint-progress-section">

                    <div className="progress-header">

                      <span>
                        Resolution progress
                      </span>

                      <strong>
                        {progress}%
                      </strong>

                    </div>

                    <div className="progress-track">

                      <div
                        className="progress-fill"
                        style={{
                          width: `${progress}%`,
                        }}
                      ></div>

                    </div>

                    <div className="progress-labels">
                      <span>
                        Submitted
                      </span>

                      <span>
                        In Progress
                      </span>

                      <span>
                        Resolved
                      </span>
                    </div>

                  </div>

                  {/* CARD FOOTER */}

                  <div className="complaint-card-footer">

                    <span>
                      Complaint ID:{" "}
                      <strong>
                        #{complaint.id}
                      </strong>
                    </span>

                    <button
                      className="track-button"
                      onClick={() =>
                        viewHistory(
                          complaint.id
                        )
                      }
                    >
                      {isSelected
                        ? "Hide History ↑"
                        : "Track Complaint →"}
                    </button>

                  </div>

                  {/* HISTORY */}

                  {isSelected && (

                    <div className="history-section">

                      <div className="history-header">

                        <div>

                          <span>
                            ACTIVITY
                          </span>

                          <h3>
                            Complaint History
                          </h3>

                        </div>

                        <div className="history-live">
                          ● Live
                        </div>

                      </div>

                      {historyLoading ? (

                        <div className="history-loading">

                          <div className="small-spinner"></div>

                          Loading timeline...

                        </div>

                      ) : history.length === 0 ? (

                        <div className="no-history">

                          <span>
                            ○
                          </span>

                          <p>
                            No status history available
                            yet.
                          </p>

                        </div>

                      ) : (

                        <div className="timeline">

                          {history.map(
                            (item, index) => (

                              <div
                                className="timeline-item"
                                key={
                                  item.id ||
                                  `${item.changed_at || index}-${index}`
                                }
                              >

                                <div className="timeline-marker">

                                  <span>
                                    {index ===
                                    history.length - 1
                                      ? "●"
                                      : "✓"}
                                  </span>

                                </div>

                                <div className="timeline-content">

                                  <div className="timeline-top">

                                    <strong>
                                      {getStatusLabel(
                                        getHistoryStatus(
                                          item
                                        )
                                      )}
                                    </strong>

                                    <span>
                                      Update #{index + 1}
                                    </span>

                                  </div>

                                  <p>
                                    {getHistoryNote(
                                      item
                                    )}
                                  </p>

                                  {item.changed_at && (
                                    <small>
                                      {formatHistoryDate(
                                        item.changed_at
                                      )}
                                    </small>
                                  )}

                                </div>

                              </div>

                            )
                          )}

                        </div>

                      )}

                    </div>

                  )}

                </article>
              );
            })}

          </section>
        )}

      </main>

    </div>
  );
}

export default MyComplaints;