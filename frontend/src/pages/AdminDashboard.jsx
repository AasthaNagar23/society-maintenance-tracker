import { useEffect, useState } from "react";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [residents, setResidents] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("access_token");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  async function fetchData() {
    try {
      setLoading(true);
      setError("");

      const [
        dashboardResponse,
        complaintsResponse,
        maintenanceResponse,
        residentsResponse,
      ] = await Promise.all([
        fetch("http://127.0.0.1:8000/admin/dashboard/summary", {
          headers,
        }),
        fetch("http://127.0.0.1:8000/admin/complaints", {
          headers,
        }),
        fetch("http://127.0.0.1:8000/admin/maintenance", {
          headers,
        }),
        fetch("http://127.0.0.1:8000/admin/residents", {
          headers,
        }),
      ]);

      const dashboardData = await dashboardResponse.json();
      const complaintsData = await complaintsResponse.json();
      const maintenanceData = await maintenanceResponse.json();
      const residentsData = await residentsResponse.json();

      if (!dashboardResponse.ok) {
        throw new Error(
          dashboardData.detail || "Failed to load dashboard"
        );
      }

      if (!complaintsResponse.ok) {
        throw new Error(
          complaintsData.detail || "Failed to load complaints"
        );
      }

      if (!maintenanceResponse.ok) {
        throw new Error(
          maintenanceData.detail || "Failed to load maintenance"
        );
      }

      if (!residentsResponse.ok) {
        throw new Error(
          residentsData.detail || "Failed to load residents"
        );
      }

      setDashboard(dashboardData);
      setComplaints(complaintsData);
      setMaintenance(maintenanceData);
      setResidents(residentsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function updateStatus(id, newStatus) {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/admin/complaints/${id}/status`,
        {
          method: "PUT",
          headers: {
            ...headers,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
            note: `Status changed to ${newStatus}`,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to update status"
        );
      }

      await fetchData();
    } catch (err) {
      alert(err.message);
    }
  }

  async function updatePriority(id, newPriority) {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/admin/complaints/${id}/priority?priority=${encodeURIComponent(
          newPriority
        )}`,
        {
          method: "PUT",
          headers,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to update priority"
        );
      }

      await fetchData();
    } catch (err) {
      alert(err.message);
    }
  }

  async function deleteComplaint(id) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this complaint?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/admin/complaints/${id}`,
        {
          method: "DELETE",
          headers,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to delete complaint"
        );
      }

      await fetchData();
    } catch (err) {
      alert(err.message);
    }
  }

  async function deleteMaintenance(id) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this maintenance record?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/admin/maintenance/${id}`,
        {
          method: "DELETE",
          headers,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to delete maintenance"
        );
      }

      await fetchData();
    } catch (err) {
      alert(err.message);
    }
  }

  function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    window.location.href = "/";
  }

  const filteredComplaints = complaints.filter((complaint) => {
    const query = search.toLowerCase();

    const matchesSearch =
      !search ||
      complaint.description?.toLowerCase().includes(query) ||
      complaint.category?.toLowerCase().includes(query);

    const matchesStatus =
      !statusFilter || complaint.status === statusFilter;

    const matchesPriority =
      !priorityFilter || complaint.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const pendingMaintenance = maintenance.filter(
    (item) => item.status === "pending"
  ).length;

  const paidMaintenance = maintenance.filter(
    (item) => item.status !== "pending"
  ).length;

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner"></div>
        <p>Loading Society Control Room...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-error-page">
        <div className="admin-error-box">
          <div className="admin-error-icon">!</div>

          <h2>Unable to load Control Room</h2>

          <p>{error}</p>

          <button onClick={fetchData}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-page">

      {/* HEADER */}

      <header className="admin-header">

        <div
          className="admin-brand"
          onClick={() => {
            window.location.href = "/";
          }}
        >
          <div className="admin-brand-mark">
            S
          </div>

          <div>
            <h1>Society OS</h1>
            <span>Society Control Room</span>
          </div>
        </div>

        <div className="admin-header-right">

          <div className="admin-live-status">
            <span></span>
            System Operational
          </div>

          <button
            className="admin-logout"
            onClick={logout}
          >
            Logout
          </button>

        </div>

      </header>

      <main className="admin-content">

        {/* HERO */}

        <section className="admin-hero">

          <div className="admin-hero-content">

            <div className="admin-eyebrow">
              ADMINISTRATION • SOCIETY OS
            </div>

            <h2>
              Society Control Room
            </h2>

            <p>
              A centralized command space for complaints,
              maintenance, residents and everyday society
              operations.
            </p>

            <div className="hero-actions">

              <button
                className="create-maintenance-btn"
                onClick={() => {
                  window.location.href =
                    "/create-maintenance";
                }}
              >
                <span>+</span>
                Create Maintenance
              </button>

              <button
                className="hero-refresh-btn"
                onClick={fetchData}
              >
                ↻ Refresh Data
              </button>

            </div>

          </div>

          <div className="hero-decoration">
            <div className="hero-ring ring-one"></div>
            <div className="hero-ring ring-two"></div>
            <div className="hero-ring ring-three"></div>

            <div className="hero-emblem">
              <span>SO</span>
            </div>
          </div>

        </section>

        {/* OVERVIEW */}

        <section className="admin-overview">

          <div className="section-heading">

            <div>
              <span>LIVE OVERVIEW</span>

              <h3>
                Society at a glance
              </h3>
            </div>

            <div className="overview-note">
              Updated just now
            </div>

          </div>

          <div className="admin-stat-grid">

            <div className="admin-stat-card residents-stat">
              <div className="stat-top">
                <span>RESIDENTS</span>
                <div className="stat-icon">R</div>
              </div>

              <strong>
                {dashboard.total_residents ?? 0}
              </strong>

              <p>Registered residents</p>
            </div>

            <div className="admin-stat-card complaints-stat">
              <div className="stat-top">
                <span>COMPLAINTS</span>
                <div className="stat-icon">C</div>
              </div>

              <strong>
                {dashboard.total_complaints ?? 0}
              </strong>

              <p>Total submitted issues</p>
            </div>

            <div className="admin-stat-card open-stat">
              <div className="stat-top">
                <span>OPEN</span>
                <div className="stat-icon">!</div>
              </div>

              <strong>
                {dashboard.open_complaints ?? 0}
              </strong>

              <p>Awaiting action</p>
            </div>

            <div className="admin-stat-card progress-stat">
              <div className="stat-top">
                <span>IN PROGRESS</span>
                <div className="stat-icon">→</div>
              </div>

              <strong>
                {dashboard.in_progress_complaints ?? 0}
              </strong>

              <p>Currently being handled</p>
            </div>

            <div className="admin-stat-card resolved-stat">
              <div className="stat-top">
                <span>RESOLVED</span>
                <div className="stat-icon">✓</div>
              </div>

              <strong>
                {dashboard.resolved_complaints ?? 0}
              </strong>

              <p>Successfully resolved</p>
            </div>

            <div className="admin-stat-card pending-stat">
              <div className="stat-top">
                <span>MAINTENANCE DUE</span>
                <div className="stat-icon">₹</div>
              </div>

              <strong>
                {dashboard.pending_maintenance ??
                  pendingMaintenance}
              </strong>

              <p>Pending payments</p>
            </div>

          </div>

        </section>

        {/* COMPLAINTS */}

        <section className="admin-panel complaints-panel">

          <div className="panel-header">

            <div>
              <span>ISSUE OPERATIONS</span>

              <h3>
                Complaint Management
              </h3>

              <p>
                Review, prioritize and resolve resident
                complaints.
              </p>
            </div>

            <div className="panel-count">
              <strong>
                {filteredComplaints.length}
              </strong>

              <span>visible issues</span>
            </div>

          </div>

          <div className="admin-filters">

            <div className="search-wrapper">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search complaints..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
            >
              <option value="">All Status</option>
              <option value="Open">Open</option>
              <option value="In Progress">
                In Progress
              </option>
              <option value="Resolved">
                Resolved
              </option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) =>
                setPriorityFilter(e.target.value)
              }
            >
              <option value="">All Priority</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">
                Critical
              </option>
            </select>

          </div>

          {filteredComplaints.length === 0 ? (

            <div className="admin-empty">
              <div>✓</div>

              <h3>No complaints found</h3>

              <p>
                Try changing your search or filters.
              </p>
            </div>

          ) : (

            <div className="admin-complaint-list">

              {filteredComplaints.map((complaint) => {

                const priority =
                  complaint.priority || "Medium";

                const statusClass =
                  complaint.status
                    ?.toLowerCase()
                    .replace(/\s+/g, "-");

                return (
                  <article
                    className="admin-complaint-card"
                    key={complaint.id}
                  >

                    <div className="complaint-main">

                      <div className="complaint-category-icon">
                        {complaint.category
                          ?.charAt(0)
                          ?.toUpperCase() || "!"}
                      </div>

                      <div className="complaint-body">

                        <div className="complaint-heading">

                          <div className="complaint-title-area">

                            <h4>
                              {complaint.category}
                            </h4>

                            <span>
                              Complaint #{complaint.id}
                              {" • "}
                              Resident #{complaint.user_id}
                            </span>

                          </div>

                          <div className="complaint-badges">

                            <span
                              className={`priority-badge priority-${priority.toLowerCase()}`}
                            >
                              {priority}
                            </span>

                            <span
                              className={`status-badge status-${statusClass}`}
                            >
                              {complaint.status}
                            </span>

                          </div>

                        </div>

                        <p className="complaint-description">
                          {complaint.description}
                        </p>

                        <div className="complaint-actions">

                          <label>
                            Status

                            <select
                              value={complaint.status}
                              onChange={(e) =>
                                updateStatus(
                                  complaint.id,
                                  e.target.value
                                )
                              }
                            >
                              <option value="Open">
                                Open
                              </option>

                              <option value="In Progress">
                                In Progress
                              </option>

                              <option value="Resolved">
                                Resolved
                              </option>
                            </select>
                          </label>

                          <label>
                            Priority

                            <select
                              value={priority}
                              onChange={(e) =>
                                updatePriority(
                                  complaint.id,
                                  e.target.value
                                )
                              }
                            >
                              <option value="Low">
                                Low
                              </option>

                              <option value="Medium">
                                Medium
                              </option>

                              <option value="High">
                                High
                              </option>

                              <option value="Critical">
                                Critical
                              </option>
                            </select>
                          </label>

                          <button
                            className="delete-button"
                            onClick={() =>
                              deleteComplaint(
                                complaint.id
                              )
                            }
                          >
                            Delete
                          </button>

                        </div>

                      </div>

                    </div>

                  </article>
                );
              })}

            </div>
          )}

        </section>

        {/* LOWER GRID */}

        <div className="admin-lower-grid">

          {/* MAINTENANCE */}

          <section className="admin-panel maintenance-panel">

            <div className="panel-header">

              <div>
                <span>FINANCE OPERATIONS</span>

                <h3>
                  Maintenance
                </h3>

                <p>
                  Track society payment records.
                </p>
              </div>

              <div className="maintenance-mini-stats">

                <span>
                  Paid
                  <strong>
                    {paidMaintenance}
                  </strong>
                </span>

                <span>
                  Pending
                  <strong>
                    {pendingMaintenance}
                  </strong>
                </span>

              </div>

            </div>

            {maintenance.length === 0 ? (

              <div className="admin-empty">
                <div>₹</div>

                <h3>
                  No maintenance records
                </h3>

                <p>
                  Maintenance records will appear here.
                </p>
              </div>

            ) : (

              <div className="maintenance-admin-list">

                {maintenance.map((item) => (

                  <div
                    className="maintenance-admin-card"
                    key={item.id}
                  >

                    <div
                      className={`maintenance-admin-icon ${
                        item.status === "pending"
                          ? "is-pending"
                          : "is-paid"
                      }`}
                    >
                      {item.status === "pending"
                        ? "₹"
                        : "✓"}
                    </div>

                    <div className="maintenance-admin-info">

                      <div className="maintenance-admin-title">

                        <h4>
                          {item.month}
                        </h4>

                        <span
                          className={
                            item.status === "pending"
                              ? "admin-payment-pending"
                              : "admin-payment-paid"
                          }
                        >
                          {item.status}
                        </span>

                      </div>

                      <div className="maintenance-meta">

                        <span>
                          Resident #{item.user_id}
                        </span>

                        <span>
                          ₹
                          {Number(
                            item.amount
                          ).toLocaleString("en-IN")}
                        </span>

                        <span>
                          Due: {item.due_date}
                        </span>

                        {item.paid_at && (
                          <span>
                            Paid:{" "}
                            {new Date(
                              item.paid_at
                            ).toLocaleDateString(
                              "en-IN"
                            )}
                          </span>
                        )}

                      </div>

                    </div>

                    <button
                      className="delete-button"
                      onClick={() =>
                        deleteMaintenance(item.id)
                      }
                    >
                      Delete
                    </button>

                  </div>

                ))}

              </div>
            )}

          </section>

          {/* RESIDENTS */}

          <section className="admin-panel residents-panel">

            <div className="panel-header">

              <div>
                <span>
                  COMMUNITY DIRECTORY
                </span>

                <h3>
                  Residents
                </h3>

                <p>
                  Registered community members.
                </p>
              </div>

              <div className="panel-count">
                <strong>
                  {residents.length}
                </strong>

                <span>residents</span>
              </div>

            </div>

            {residents.length === 0 ? (

              <div className="admin-empty">
                <div>R</div>

                <h3>
                  No residents found
                </h3>

                <p>
                  There are no registered residents.
                </p>
              </div>

            ) : (

              <div className="resident-grid">

                {residents.map((resident) => (

                  <div
                    className="resident-card"
                    key={resident.id}
                  >

                    <div className="resident-avatar">
                      {resident.name
                        ?.charAt(0)
                        ?.toUpperCase() || "R"}
                    </div>

                    <div className="resident-details">

                      <h4>
                        {resident.name}
                      </h4>

                      <span>
                        Resident #{resident.id}
                      </span>

                      <p>
                        {resident.email}
                      </p>

                      <p>
                        {resident.phone}
                      </p>

                    </div>

                    <div className="resident-role">
                      {resident.role}
                    </div>

                  </div>

                ))}

              </div>
            )}

          </section>

        </div>

      </main>

    </div>
  );
}

export default AdminDashboard;