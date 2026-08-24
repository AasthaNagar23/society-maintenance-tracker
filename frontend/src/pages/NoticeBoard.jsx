import { useEffect, useState } from "react";
import {
  getNotices,
  createNotice,
  updateNotice,
  deleteNotice,
} from "../services/api";
import "./NoticeBoard.css";

function NoticeBoard() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [user, setUser] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isImportant, setIsImportant] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch {
      setUser(null);
    }

    loadNotices();
  }, []);

  async function loadNotices() {
    try {
      setLoading(true);
      setError("");

      const data = await getNotices();

      setNotices(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load notices");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setTitle("");
    setContent("");
    setIsImportant(false);
    setIsPinned(false);
    setEditingNotice(null);
    setShowForm(false);
  }

  function openCreateForm() {
    setEditingNotice(null);
    setTitle("");
    setContent("");
    setIsImportant(false);
    setIsPinned(false);
    setShowForm(true);
  }

  function openEditForm(notice) {
    setEditingNotice(notice);

    setTitle(notice.title || "");
    setContent(notice.content || "");
    setIsImportant(Boolean(notice.is_important));
    setIsPinned(Boolean(notice.is_pinned));

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!title.trim()) {
      alert("Please enter a notice title.");
      return;
    }

    if (!content.trim()) {
      alert("Please enter notice content.");
      return;
    }

    try {
      setSaving(true);

      if (editingNotice) {
        await updateNotice(
          editingNotice.id,
          title.trim(),
          content.trim(),
          isImportant,
          isPinned
        );
      } else {
        await createNotice(
          title.trim(),
          content.trim(),
          isImportant,
          isPinned
        );
      }

      resetForm();
      await loadNotices();
    } catch (err) {
      alert(err.message || "Failed to save notice");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(noticeId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this notice?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteNotice(noticeId);

      await loadNotices();
    } catch (err) {
      alert(err.message || "Failed to delete notice");
    }
  }

  function handleBack() {
    if (user?.role === "admin") {
      window.location.href = "/";
    } else {
      window.location.href = "/";
    }
  }

  function formatDate(dateValue) {
    if (!dateValue) {
      return "Recently posted";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Recently posted";
    }

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  const isAdmin = user?.role === "admin";

  return (
    <div className="notice-page">

      {/* HEADER */}

      <header className="notice-header">

        <div
          className="notice-brand"
          onClick={handleBack}
        >
          <div className="notice-brand-mark">
            S
          </div>

          <div>
            <h1>Society OS</h1>
            <span>
              {isAdmin
                ? "Society Control Room"
                : "Resident Portal"}
            </span>
          </div>
        </div>

        <div className="notice-header-actions">

          <button
            className="notice-back-button"
            onClick={handleBack}
          >
            ← Dashboard
          </button>

          {isAdmin && (
            <button
              className="notice-create-button"
              onClick={openCreateForm}
            >
              <span>+</span>
              Create Notice
            </button>
          )}

        </div>

      </header>


      {/* MAIN */}

      <main className="notice-content">

        {/* HERO */}

        <section className="notice-hero">

          <div className="notice-hero-content">

            <div className="notice-eyebrow">
              <span></span>
              COMMUNITY UPDATES
            </div>

            <h2>
              Society Notice Board
            </h2>

            <p>
              Stay informed about important announcements,
              maintenance updates and community activities.
            </p>

          </div>

          <div className="notice-hero-visual">
            <div className="notice-ring ring-one"></div>
            <div className="notice-ring ring-two"></div>

            <div className="notice-emblem">
              <span>!</span>
            </div>
          </div>

        </section>


        {/* ADMIN FORM */}

        {isAdmin && showForm && (
          <section className="notice-form-card">

            <div className="notice-form-header">

              <div>
                <span className="notice-card-label">
                  {editingNotice
                    ? "UPDATE NOTICE"
                    : "NEW ANNOUNCEMENT"}
                </span>

                <h3>
                  {editingNotice
                    ? "Edit Notice"
                    : "Create Notice"}
                </h3>
              </div>

              <button
                className="notice-close-button"
                onClick={resetForm}
                type="button"
              >
                ×
              </button>

            </div>

            <form onSubmit={handleSubmit}>

              <label>
                Notice Title

                <input
                  type="text"
                  placeholder="Enter notice title"
                  value={title}
                  onChange={(e) =>
                    setTitle(e.target.value)
                  }
                  maxLength={150}
                />
              </label>

              <label>
                Notice Content

                <textarea
                  placeholder="Write the announcement..."
                  value={content}
                  onChange={(e) =>
                    setContent(e.target.value)
                  }
                  rows={6}
                />
              </label>

              <div className="notice-options">

                <label className="notice-checkbox">

                  <input
                    type="checkbox"
                    checked={isImportant}
                    onChange={(e) =>
                      setIsImportant(e.target.checked)
                    }
                  />

                  <span>
                    Mark as Important
                  </span>

                </label>

                <label className="notice-checkbox">

                  <input
                    type="checkbox"
                    checked={isPinned}
                    onChange={(e) =>
                      setIsPinned(e.target.checked)
                    }
                  />

                  <span>
                    Pin to Top
                  </span>

                </label>

              </div>

              <div className="notice-form-actions">

                <button
                  type="button"
                  className="notice-cancel-button"
                  onClick={resetForm}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="notice-save-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingNotice
                    ? "Update Notice"
                    : "Publish Notice"}
                </button>

              </div>

            </form>

          </section>
        )}


        {/* SECTION HEADER */}

        <section className="notice-list-section">

          <div className="notice-list-heading">

            <div>
              <span className="notice-card-label">
                SOCIETY COMMUNICATION
              </span>

              <h3>
                Latest Notices
              </h3>
            </div>

            <div className="notice-count">
              {notices.length}{" "}
              {notices.length === 1
                ? "notice"
                : "notices"}
            </div>

          </div>


          {/* LOADING */}

          {loading && (
            <div className="notice-state">

              <div className="notice-spinner"></div>

              <h3>
                Loading notices
              </h3>

              <p>
                Getting the latest society announcements...
              </p>

            </div>
          )}


          {/* ERROR */}

          {!loading && error && (
            <div className="notice-state error-state">

              <div className="notice-state-icon">
                !
              </div>

              <h3>
                Unable to load notices
              </h3>

              <p>
                {error}
              </p>

              <button
                onClick={loadNotices}
              >
                Try Again
              </button>

            </div>
          )}


          {/* EMPTY */}

          {!loading &&
            !error &&
            notices.length === 0 && (
              <div className="notice-state">

                <div className="notice-state-icon">
                  N
                </div>

                <h3>
                  No notices yet
                </h3>

                <p>
                  Society announcements will appear here.
                </p>

                {isAdmin && (
                  <button
                    onClick={openCreateForm}
                  >
                    Create First Notice
                  </button>
                )}

              </div>
            )}


          {/* NOTICE LIST */}

          {!loading &&
            !error &&
            notices.length > 0 && (

              <div className="notice-list">

                {notices.map((notice) => (

                  <article
                    className={`notice-card ${
                      notice.is_pinned
                        ? "notice-pinned"
                        : ""
                    }`}
                    key={notice.id}
                  >

                    <div className="notice-card-top">

                      <div className="notice-icon">
                        {notice.is_pinned
                          ? "★"
                          : "N"}
                      </div>

                      <div className="notice-card-main">

                        <div className="notice-card-title-row">

                          <h4>
                            {notice.title}
                          </h4>

                          <div className="notice-badges">

                            {notice.is_important && (
                              <span className="important-badge">
                                Important
                              </span>
                            )}

                            {notice.is_pinned && (
                              <span className="pinned-badge">
                                Pinned
                              </span>
                            )}

                          </div>

                        </div>

                        <span className="notice-date">
                          Posted{" "}
                          {formatDate(
                            notice.created_at
                          )}
                        </span>

                      </div>

                    </div>


                    <div className="notice-card-content">

                      <p>
                        {notice.content}
                      </p>

                    </div>


                    {isAdmin && (
                      <div className="notice-admin-actions">

                        <button
                          className="notice-edit-button"
                          onClick={() =>
                            openEditForm(notice)
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="notice-delete-button"
                          onClick={() =>
                            handleDelete(notice.id)
                          }
                        >
                          Delete
                        </button>

                      </div>
                    )}

                  </article>

                ))}

              </div>

            )}

        </section>

      </main>

    </div>
  );
}

export default NoticeBoard;