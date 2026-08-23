import { useEffect, useState } from "react";
import "./ResidentDashboard.css";

function ResidentDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    async function fetchDashboard() {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/dashboard",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Failed to load dashboard"
          );
        }

        setDashboard(data);
      } catch (err) {
        setError(err.message);
      }
    }

    fetchDashboard();
  }, []);

  if (error) {
    return (
      <div className="dashboard-page dashboard-state">
        <div className="state-card">
          <div className="state-icon">!</div>
          <h2>Unable to load dashboard</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="dashboard-page dashboard-state">
        <div className="state-card">
          <div className="loading-spinner"></div>
          <h2>Loading your dashboard</h2>
          <p>Getting the latest society information...</p>
        </div>
      </div>
    );
  }

  const complaints = dashboard.complaints || {};
  const maintenance = dashboard.maintenance || {};
  const user = dashboard.user || {};

  const totalComplaints = complaints.total || 0;
  const openComplaints = complaints.open || 0;
  const inProgressComplaints = complaints.in_progress || 0;
  const resolvedComplaints = complaints.resolved || 0;

  const pendingMaintenance = maintenance.pending || 0;
  const paidMaintenance = maintenance.paid || 0;

  const totalMaintenance =
    pendingMaintenance + paidMaintenance;

  const resolvedPercentage =
    totalComplaints === 0
      ? 0
      : Math.round(
          (resolvedComplaints / totalComplaints) * 100
        );

  const complaintScore =
    totalComplaints === 0
      ? 100
      : Math.round(
          (resolvedComplaints / totalComplaints) * 100
        );

  const maintenanceScore =
    totalMaintenance === 0
      ? 100
      : Math.round(
          (paidMaintenance / totalMaintenance) * 100
        );

  const healthScore = Math.round(
    complaintScore * 0.7 +
      maintenanceScore * 0.3
  );

  let healthLabel = "Excellent";
  let healthMessage =
    "Everything looks well managed.";

  if (healthScore < 80) {
    healthLabel = "Good";
    healthMessage =
      "A few things need attention.";
  }

  if (healthScore < 60) {
    healthLabel = "Needs Attention";
    healthMessage =
      "Some complaints or payments need attention.";
  }

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    window.location.href = "/";
  }

  return (
    <div className="dashboard-page">

      {/* HEADER */}

      <header className="dashboard-header">

        <div className="brand-area">

          <div className="brand-mark">
            S
          </div>

          <div className="brand-text">
            <h1>Society OS</h1>
            <p>Resident Portal</p>
          </div>

        </div>

        <div className="user-info">

          <div className="user-avatar">
            {user.name?.charAt(0).toUpperCase()}
          </div>

          <div className="user-details">
            <span className="welcome-small">
              Welcome
            </span>

            <strong>
              {user.name}
            </strong>
          </div>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </header>


      {/* MAIN */}

      <main className="dashboard-content">

        {/* HERO */}

        <section className="welcome-section">

          <div className="hero-content">

            <div className="hero-eyebrow">
              <span className="status-dot"></span>
              RESIDENT DASHBOARD
            </div>

            <h2>
              Welcome back,
              <br />
              {user.name}
            </h2>

            <p>
              Manage complaints, maintenance payments
              and your society activity from one place.
            </p>

            <div className="dashboard-actions">

              <button
                className="primary-action"
                onClick={() =>
                  (window.location.href = "/complaint")
                }
              >
                <span className="action-plus">+</span>
                Raise Complaint
              </button>

              <button
                onClick={() =>
                  (window.location.href = "/my-complaints")
                }
              >
                My Complaints
                <span>→</span>
              </button>

              <button
                onClick={() =>
                  (window.location.href = "/maintenance")
                }
              >
                Maintenance
                <span>→</span>
              </button>

            </div>

          </div>

          {/* CUSTOM BUILDING VISUAL */}

          <div className="hero-visual">

            <div className="visual-circle circle-one"></div>
            <div className="visual-circle circle-two"></div>

            <div className="building">

              <div className="building-top">
                <div className="building-sign">
                  S
                </div>
              </div>

              <div className="building-body">

                <span></span>
                <span></span>
                <span></span>

                <span></span>
                <span></span>
                <span></span>

                <span></span>
                <span></span>
                <span></span>

              </div>

              <div className="building-door"></div>

            </div>

          </div>

        </section>


        {/* SECTION TITLE */}

        <div className="section-heading">

          <div>
            <span className="section-label">
              SOCIETY
            </span>

            <h2>
              Overview
            </h2>
          </div>

          <div className="live-indicator">
            <span></span>
            Live Data
          </div>

        </div>


        {/* OVERVIEW */}

        <section className="dashboard-overview">

          {/* HEALTH */}

          <div className="health-card">

            <div className="health-header">

              <div>
                <span className="card-eyebrow">
                  SOCIETY HEALTH
                </span>

                <h3>
                  {healthLabel}
                </h3>
              </div>

              <div className="health-icon">
                +
              </div>

            </div>

            <div className="health-score">

              <div
                className="score-ring"
                style={{
                  "--score": `${healthScore * 3.6}deg`,
                }}
              >
                <div className="score-inner">
                  <strong>
                    {healthScore}
                  </strong>

                  <span>/100</span>
                </div>
              </div>

              <div className="health-details">

                <strong>
                  {healthMessage}
                </strong>

                <p>
                  Score is based on complaint resolution
                  and maintenance payment activity.
                </p>

              </div>

            </div>

          </div>


          {/* COMPLAINT ACTIVITY */}

          <div className="complaint-card">

            <div className="complaint-card-header">

              <div>
                <span className="card-eyebrow">
                  COMPLAINT ACTIVITY
                </span>

                <div className="complaint-total">
                  <strong>
                    {totalComplaints}
                  </strong>

                  <span>
                    total complaints
                  </span>
                </div>
              </div>

              <div className="complaint-icon">
                C
              </div>

            </div>


            {/* RESOLUTION */}

            <div className="resolution-section">

              <div className="resolution-top">

                <span>
                  RESOLVED
                </span>

                <strong>
                  {resolvedPercentage}%
                </strong>

              </div>

              <div className="resolution-track">

                <div
                  className="resolution-fill"
                  style={{
                    width: `${resolvedPercentage}%`,
                  }}
                ></div>

              </div>

            </div>


            {/* STATUS GRID */}

            <div className="complaint-status-grid">

              <div className="complaint-status open">

                <strong>
                  {openComplaints}
                </strong>

                <span>
                  Open
                </span>

              </div>

              <div className="complaint-status progress">

                <strong>
                  {inProgressComplaints}
                </strong>

                <span>
                  In Progress
                </span>

              </div>

              <div className="complaint-status resolved">

                <strong>
                  {resolvedComplaints}
                </strong>

                <span>
                  Resolved
                </span>

              </div>

            </div>

          </div>

        </section>


        {/* STATISTICS */}

        <section className="dashboard-cards">

          <div className="dashboard-card">

            <div className="stat-icon blue">
              C
            </div>

            <h3>Total Complaints</h3>

            <p>{totalComplaints}</p>

            <span>
              All reported issues
            </span>

          </div>


          <div className="dashboard-card">

            <div className="stat-icon amber">
              !
            </div>

            <h3>Open Complaints</h3>

            <p>{openComplaints}</p>

            <span>
              Awaiting action
            </span>

          </div>


          <div className="dashboard-card">

            <div className="stat-icon purple">
              →
            </div>

            <h3>In Progress</h3>

            <p>{inProgressComplaints}</p>

            <span>
              Currently being handled
            </span>

          </div>


          <div className="dashboard-card">

            <div className="stat-icon green">
              ✓
            </div>

            <h3>Resolved</h3>

            <p>{resolvedComplaints}</p>

            <span>
              Successfully completed
            </span>

          </div>


          <div className="dashboard-card">

            <div className="stat-icon orange">
              ₹
            </div>

            <h3>Pending Maintenance</h3>

            <p>{pendingMaintenance}</p>

            <span>
              Payments remaining
            </span>

          </div>


          <div className="dashboard-card">

            <div className="stat-icon teal">
              ✓
            </div>

            <h3>Paid Maintenance</h3>

            <p>{paidMaintenance}</p>

            <span>
              Payments completed
            </span>

          </div>

        </section>


        {/* BOTTOM */}

        <section className="dashboard-bottom">

          {/* ACTIVITY */}

          <div className="activity-card">

            <div className="activity-header">

              <div>

                <span className="card-eyebrow">
                  YOUR ACTIVITY
                </span>

                <h3>
                  Recent complaint status
                </h3>

              </div>

              <span className="activity-badge">
                RESIDENT
              </span>

            </div>


            <div className="activity-list">

              <div className="activity-item">

                <div className="activity-dot blue-dot"></div>

                <div>
                  <strong>
                    {openComplaints} open complaint
                    {openComplaints !== 1 ? "s" : ""}
                  </strong>

                  <p>
                    Issues waiting for action from
                    the society team.
                  </p>
                </div>

              </div>


              <div className="activity-item">

                <div className="activity-dot purple-dot"></div>

                <div>
                  <strong>
                    {inProgressComplaints} complaint
                    {inProgressComplaints !== 1 ? "s" : ""}
                    {" "}in progress
                  </strong>

                  <p>
                    Complaints currently being handled
                    by the society team.
                  </p>
                </div>

              </div>


              <div className="activity-item">

                <div className="activity-dot green-dot"></div>

                <div>
                  <strong>
                    {resolvedComplaints} resolved complaint
                    {resolvedComplaints !== 1 ? "s" : ""}
                  </strong>

                  <p>
                    Successfully completed complaints
                    in your history.
                  </p>
                </div>

              </div>

            </div>

          </div>


          {/* QUICK ACTION */}

          <div className="action-card">

            <div className="action-card-icon">
              +
            </div>

            <span className="card-eyebrow">
              QUICK ACTION
            </span>

            <h3>
              Need to report
              <br />
              something?
            </h3>

            <p>
              Submit a complaint and track its
              progress from your dashboard.
            </p>

            <button
              onClick={() =>
                (window.location.href = "/complaint")
              }
            >
              Report an Issue
              <span>→</span>
            </button>

          </div>

        </section>

      </main>

    </div>
  );
}

export default ResidentDashboard;