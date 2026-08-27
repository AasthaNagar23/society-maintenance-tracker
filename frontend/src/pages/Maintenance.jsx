import { useEffect, useState } from "react";
import "./Maintenance.css";

const API_URL = "https://society-maintenance-tracker-hok6.onrender.com";

function Maintenance() {
  const [maintenance, setMaintenance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payingId, setPayingId] = useState(null);

  const token = localStorage.getItem("access_token");

  async function fetchMaintenance() {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        throw new Error("You are not logged in. Please login again.");
      }

      const response = await fetch(
        `${API_URL}/maintenance`,
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
          data.detail || "Failed to load maintenance"
        );
      }

      setMaintenance(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      setError(
        err.message || "Failed to load maintenance records."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMaintenance();
  }, []);

  async function handlePayment(maintenanceId) {
    try {
      setPayingId(maintenanceId);
      setError("");

      if (!token) {
        throw new Error(
          "You are not logged in. Please login again."
        );
      }

      const response = await fetch(
        `${API_URL}/maintenance/${maintenanceId}/pay`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Payment failed"
        );
      }

      await fetchMaintenance();

      alert("Maintenance paid successfully!");
    } catch (err) {
      setError(
        err.message || "Payment failed. Please try again."
      );
    } finally {
      setPayingId(null);
    }
  }

  function formatDate(date) {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  }

  function formatDateTime(date) {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }
    );
  }

  const pendingCount = maintenance.filter(
    (item) =>
      item.status?.toLowerCase() === "pending"
  ).length;

  const paidCount = maintenance.filter(
    (item) =>
      item.status?.toLowerCase() !== "pending"
  ).length;

  const totalAmount = maintenance.reduce(
    (total, item) =>
      total + Number(item.amount || 0),
    0
  );

  const pendingAmount = maintenance
    .filter(
      (item) =>
        item.status?.toLowerCase() === "pending"
    )
    .reduce(
      (total, item) =>
        total + Number(item.amount || 0),
      0
    );

  if (loading) {
    return (
      <div className="maintenance-loading">
        <div className="maintenance-spinner"></div>

        <p>
          Loading your maintenance records...
        </p>
      </div>
    );
  }

  if (error && maintenance.length === 0) {
    return (
      <div className="maintenance-error-page">
        <div className="maintenance-error-box">

          <div className="maintenance-error-icon">
            !
          </div>

          <h2>
            Unable to load maintenance
          </h2>

          <p>{error}</p>

          <button onClick={fetchMaintenance}>
            Try Again
          </button>

        </div>
      </div>
    );
  }

  return (
    <div className="maintenance-page">

      {/* =========================================
          HEADER
          ========================================= */}

      <header className="maintenance-header">

        <div
          className="maintenance-brand"
          onClick={() => {
            window.location.href = "/";
          }}
        >
          <div className="maintenance-brand-mark">
            ₹
          </div>

          <div>
            <h1>Society OS</h1>

            <span>
              Maintenance & Payment Center
            </span>
          </div>
        </div>

        <button
          className="maintenance-dashboard-btn"
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

      <main className="maintenance-content">

        <section className="maintenance-title-section">

          <div>

            <div className="maintenance-eyebrow">
              RESIDENT FINANCE
            </div>

            <h2>
              Maintenance
            </h2>

            <p>
              Stay on top of your society payments
              and due dates.
            </p>

          </div>

          <div className="payment-status-badge">
            <span className="payment-status-dot"></span>
            Payments Secure
          </div>

        </section>

        {/* =========================================
            ERROR
            ========================================= */}

        {error && (
          <div className="maintenance-inline-error">
            <span>!</span>
            {error}
          </div>
        )}

        {/* =========================================
            SUMMARY CARDS
            ========================================= */}

        <section className="maintenance-summary">

          <div className="summary-card">

            <div className="summary-icon blue">
              ₹
            </div>

            <div>
              <span>Total Maintenance</span>

              <strong>
                ₹{totalAmount.toLocaleString("en-IN")}
              </strong>
            </div>

          </div>

          <div className="summary-card">

            <div className="summary-icon orange">
              !
            </div>

            <div>
              <span>Pending Amount</span>

              <strong>
                ₹{pendingAmount.toLocaleString("en-IN")}
              </strong>
            </div>

          </div>

          <div className="summary-card">

            <div className="summary-icon green">
              ✓
            </div>

            <div>
              <span>Paid Records</span>

              <strong>
                {paidCount}
              </strong>
            </div>

          </div>

          <div className="summary-card">

            <div className="summary-icon purple">
              #
            </div>

            <div>
              <span>Pending Records</span>

              <strong>
                {pendingCount}
              </strong>
            </div>

          </div>

        </section>

        {/* =========================================
            PAYMENT LIST
            ========================================= */}

        {maintenance.length === 0 ? (

          <section className="maintenance-empty">

            <div className="maintenance-empty-icon">
              ✓
            </div>

            <h2>
              No maintenance records
            </h2>

            <p>
              There are currently no maintenance
              payments assigned to your account.
            </p>

            <button
              onClick={() => {
                window.location.href = "/";
              }}
            >
              Back to Dashboard
            </button>

          </section>

        ) : (

          <section className="maintenance-section">

            <div className="maintenance-section-header">

              <div>

                <span>
                  PAYMENT HISTORY
                </span>

                <h3>
                  Your Maintenance Records
                </h3>

              </div>

              <div className="record-count">
                {maintenance.length}{" "}
                {maintenance.length === 1
                  ? "record"
                  : "records"}
              </div>

            </div>

            <div className="maintenance-list">

              {maintenance.map((item) => {

                const isPending =
                  item.status?.toLowerCase() === "pending";

                return (
                  <article
                    className={`maintenance-item ${
                      isPending
                        ? "maintenance-pending"
                        : "maintenance-paid"
                    }`}
                    key={item.id}
                  >

                    {/* LEFT */}

                    <div className="maintenance-item-left">

                      <div
                        className={`maintenance-month-icon ${
                          isPending
                            ? "month-pending"
                            : "month-paid"
                        }`}
                      >
                        {isPending ? "₹" : "✓"}
                      </div>

                      <div className="maintenance-info">

                        <div className="maintenance-item-heading">

                          <h3>
                            {item.month || "Maintenance"}
                          </h3>

                          <span
                            className={`maintenance-status ${
                              isPending
                                ? "status-pending"
                                : "status-paid"
                            }`}
                          >
                            <span></span>

                            {isPending
                              ? "Payment Due"
                              : "Paid"}
                          </span>

                        </div>

                        <div className="maintenance-details">

                          <div>
                            <span>
                              Amount
                            </span>

                            <strong>
                              ₹
                              {Number(
                                item.amount || 0
                              ).toLocaleString("en-IN")}
                            </strong>
                          </div>

                          <div>
                            <span>
                              Due Date
                            </span>

                            <strong>
                              {formatDate(
                                item.due_date
                              )}
                            </strong>
                          </div>

                          {item.paid_at && (
                            <div>
                              <span>
                                Paid On
                              </span>

                              <strong>
                                {formatDateTime(
                                  item.paid_at
                                )}
                              </strong>
                            </div>
                          )}

                        </div>

                      </div>

                    </div>

                    {/* RIGHT */}

                    <div className="maintenance-action">

                      {isPending ? (

                        <button
                          className="pay-button"
                          onClick={() =>
                            handlePayment(item.id)
                          }
                          disabled={
                            payingId === item.id
                          }
                        >

                          {payingId === item.id ? (
                            <>
                              <span className="button-spinner"></span>
                              Processing...
                            </>
                          ) : (
                            <>
                              Pay Maintenance
                              <span>→</span>
                            </>
                          )}

                        </button>

                      ) : (

                        <div className="paid-confirmation">

                          <span>✓</span>

                          Payment Complete

                        </div>

                      )}

                    </div>

                  </article>
                );
              })}

            </div>

          </section>
        )}

      </main>

    </div>
  );
}

export default Maintenance;