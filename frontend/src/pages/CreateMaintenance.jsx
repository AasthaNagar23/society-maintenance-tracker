import { useEffect, useState } from "react";
import "./CreateMaintenance.css";

const API_URL =
  "https://society-maintenance-tracker-hok6.onrender.com";

function CreateMaintenance() {
  const [residents, setResidents] = useState([]);
  const [records, setRecords] = useState([]);

  const [userId, setUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [month, setMonth] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loadingRecords, setLoadingRecords] = useState(true);

  const token = localStorage.getItem("access_token");

  useEffect(() => {
    async function loadData() {
      try {
        setError("");

        // ================= RESIDENTS =================

        const residentsResponse = await fetch(
          `${API_URL}/admin/residents`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const residentsData =
          await residentsResponse.json();

        if (!residentsResponse.ok) {
          throw new Error(
            residentsData.detail ||
              "Failed to load residents"
          );
        }

        setResidents(
          residentsData.filter(
            (resident) =>
              resident.role === "resident"
          )
        );

        // ================= MAINTENANCE RECORDS =================

        const maintenanceResponse = await fetch(
          `${API_URL}/maintenance`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const maintenanceData =
          await maintenanceResponse.json();

        if (!maintenanceResponse.ok) {
          throw new Error(
            maintenanceData.detail ||
              "Failed to load maintenance records"
          );
        }

        setRecords(
          Array.isArray(maintenanceData)
            ? maintenanceData
            : []
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingRecords(false);
      }
    }

    if (token) {
      loadData();
    } else {
      setError(
        "You are not logged in. Please login again."
      );
      setLoadingRecords(false);
    }
  }, [token]);

  // ================= CREATE MAINTENANCE =================

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!token) {
      setError(
        "You are not logged in. Please login again."
      );
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/maintenance`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            user_id: Number(userId),
            amount: Number(amount),
            month,
            due_date: dueDate,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Failed to create maintenance"
        );
      }

      setMessage(
        "Maintenance created successfully!"
      );

      setUserId("");
      setAmount("");
      setMonth("");
      setDueDate("");

      // ================= REFRESH RECORDS =================

      const refreshResponse = await fetch(
        `${API_URL}/maintenance`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const refreshData =
        await refreshResponse.json();

      if (!refreshResponse.ok) {
        throw new Error(
          refreshData.detail ||
            "Maintenance created, but records could not be refreshed."
        );
      }

      setRecords(
        Array.isArray(refreshData)
          ? refreshData
          : []
      );
    } catch (err) {
      setError(err.message);
    }
  }

  // ================= DATE FORMAT =================

  function formatDate(dateString) {
    if (!dateString) return "—";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return dateString;
    }

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatDateTime(dateString) {
    if (!dateString) return "—";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return dateString;
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  // ================= PAYMENT STATUS =================

  function getStatus(record) {
    if (
      record.status?.toLowerCase() === "paid" ||
      record.paid === true ||
      record.payment_status?.toLowerCase() ===
        "paid"
    ) {
      return "Paid";
    }

    return "Pending";
  }

  return (
    <div className="create-maintenance-page">

      {/* ================= HEADER ================= */}

      <header className="maintenance-header">

        <div
          className="maintenance-brand"
          onClick={() => {
            window.location.href = "/";
          }}
        >
          <div className="maintenance-brand-mark">
            S
          </div>

          <div>
            <h1>Society OS</h1>
            <span>Maintenance Manager</span>
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

      {/* ================= MAIN ================= */}

      <main className="maintenance-main">

        {/* ================= CREATE SECTION ================= */}

        <section className="maintenance-create-section">

          <div className="maintenance-intro">

            <div className="maintenance-label">
              <span></span>
              MAINTENANCE
            </div>

            <h2>
              Manage society
              <br />
              payments.
            </h2>

            <p>
              Create a maintenance charge for a
              resident and keep track of payment
              details from one place.
            </p>

            <div className="maintenance-points">

              <div className="maintenance-point">
                <div className="point-number">
                  01
                </div>

                <div>
                  <strong>
                    Select resident
                  </strong>

                  <span>
                    Choose the resident receiving
                    the maintenance bill.
                  </span>
                </div>
              </div>

              <div className="maintenance-point">
                <div className="point-number">
                  02
                </div>

                <div>
                  <strong>
                    Add payment details
                  </strong>

                  <span>
                    Enter the amount, month and
                    due date.
                  </span>
                </div>
              </div>

              <div className="maintenance-point">
                <div className="point-number">
                  03
                </div>

                <div>
                  <strong>
                    Keep records updated
                  </strong>

                  <span>
                    Payment history stays available
                    for reference.
                  </span>
                </div>
              </div>

            </div>

          </div>

          {/* ================= FORM ================= */}

          <div className="maintenance-form-card">

            <div className="maintenance-form-top">

              <div>
                <span>
                  NEW PAYMENT
                </span>

                <h3>
                  Create Maintenance
                </h3>
              </div>

              <div className="ready-badge">
                <i></i>
                Ready
              </div>

            </div>

            <form onSubmit={handleSubmit}>

              <div className="maintenance-field">

                <div className="field-title">
                  <label>
                    Resident
                  </label>

                  <small>
                    Required
                  </small>
                </div>

                <select
                  value={userId}
                  onChange={(e) =>
                    setUserId(e.target.value)
                  }
                  required
                >
                  <option value="">
                    Select resident
                  </option>

                  {residents.map((resident) => (
                    <option
                      key={resident.id}
                      value={resident.id}
                    >
                      {resident.name} -{" "}
                      {resident.email}
                    </option>
                  ))}
                </select>

              </div>

              <div className="maintenance-field">

                <div className="field-title">
                  <label>
                    Maintenance Amount
                  </label>

                  <small>
                    Required
                  </small>
                </div>

                <div className="amount-box">
                  <span>₹</span>

                  <input
                    type="number"
                    min="1"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) =>
                      setAmount(e.target.value)
                    }
                    required
                  />
                </div>

              </div>

              <div className="maintenance-two-fields">

                <div className="maintenance-field">

                  <div className="field-title">
                    <label>
                      Billing Month
                    </label>
                  </div>

                  <input
                    type="text"
                    placeholder="August 2026"
                    value={month}
                    onChange={(e) =>
                      setMonth(e.target.value)
                    }
                    required
                  />

                </div>

                <div className="maintenance-field">

                  <div className="field-title">
                    <label>
                      Due Date
                    </label>
                  </div>

                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) =>
                      setDueDate(e.target.value)
                    }
                    required
                  />

                </div>

              </div>

              <button
                type="submit"
                className="create-maintenance-btn"
              >
                Create Maintenance
                <span>→</span>
              </button>

            </form>

            {/* SUCCESS MESSAGE */}

            {message && (
              <div className="maintenance-alert success">

                <div className="alert-icon">
                  ✓
                </div>

                <div>
                  <strong>
                    Maintenance created
                  </strong>

                  <p>
                    The payment record was added
                    successfully.
                  </p>
                </div>

              </div>
            )}

            {/* ERROR MESSAGE */}

            {error && (
              <div className="maintenance-alert error">

                <div className="alert-icon">
                  !
                </div>

                <div>
                  <strong>
                    Something went wrong
                  </strong>

                  <p>
                    {error}
                  </p>
                </div>

              </div>
            )}

          </div>

        </section>

        {/* ================= PAYMENT HISTORY ================= */}

        <section className="payment-history">

          <div className="history-heading">

            <div>
              <span className="history-label">
                PAYMENT HISTORY
              </span>

              <h2>
                Your Maintenance Records
              </h2>
            </div>

            <div className="record-count">
              <strong>
                {records.length}
              </strong>

              <span>
                {records.length === 1
                  ? "record"
                  : "records"}
              </span>
            </div>

          </div>

          <div className="history-divider"></div>

          {loadingRecords ? (

            <div className="history-empty">
              Loading payment records...
            </div>

          ) : records.length === 0 ? (

            <div className="history-empty">
              No maintenance records found.
            </div>

          ) : (

            <div className="history-list">

              {records.map((record) => {

                const status =
                  getStatus(record);

                return (
                  <article
                    className="payment-record"
                    key={record.id}
                  >

                    {/* LEFT */}

                    <div className="record-main">

                      <div className="record-month">
                        {record.month ||
                          "Maintenance"}
                      </div>

                      <div
                        className={`payment-status ${
                          status === "Paid"
                            ? "paid"
                            : "pending"
                        }`}
                      >
                        <span>
                          {status === "Paid"
                            ? "✓"
                            : "!"}
                        </span>

                        {status}
                      </div>

                    </div>

                    {/* DETAILS */}

                    <div className="record-details">

                      <div className="record-detail">

                        <span>
                          Amount
                        </span>

                        <strong>
                          ₹
                          {Number(
                            record.amount || 0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </strong>

                      </div>

                      <div className="record-detail">

                        <span>
                          Due Date
                        </span>

                        <strong>
                          {formatDate(
                            record.due_date
                          )}
                        </strong>

                      </div>

                      <div className="record-detail">

                        <span>
                          Paid On
                        </span>

                        <strong>
                          {record.paid_on
                            ? formatDateTime(
                                record.paid_on
                              )
                            : "Not paid yet"}
                        </strong>

                      </div>

                    </div>

                    {/* PAYMENT MARK */}

                    <div
                      className={`record-payment-mark ${
                        status === "Paid"
                          ? "paid"
                          : "pending"
                      }`}
                    >
                      <span>
                        {status === "Paid"
                          ? "✓"
                          : "!"}
                      </span>

                      <small>
                        {status === "Paid"
                          ? "Payment"
                          : "Pending"}
                      </small>
                    </div>

                  </article>
                );
              })}

            </div>
          )}

        </section>

      </main>

    </div>
  );
}

export default CreateMaintenance;