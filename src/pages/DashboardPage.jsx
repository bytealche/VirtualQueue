// DashboardPage.jsx - Real API integration (Stable + Reload Fixed)

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { bookingsAPI } from "../services/bookings";
import { queueAPI } from "../services/queue";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout, loading } = useApp(); // <-- loading from AppContext

  const [filter, setFilter] = useState("all");
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const [pageLoading, setPageLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [activeQueue, setActiveQueue] = useState(null);

  // Toast helper
  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  // 🔥 FIX: When refreshing the page, wait until AppContext finishes restoring authentication
  useEffect(() => {
    if (loading) return; // WAIT for restoreAuth()

    if (!user) {
      navigate("/login");
      return;
    }

    let mounted = true;

    const fetchAll = async () => {
      setPageLoading(true);
      try {
        // 1. Get bookings
        const bResp = await bookingsAPI.list();
        const userBookings = Array.isArray(bResp) ? bResp : [];

        // 2. Get upcoming (active queue position)
        const active =
          userBookings.find((b) => b.status === "upcoming") || null;

        let enrichedActive = active;

        if (active?.token) {
          try {
            const qResp = await queueAPI.getStatus(active.token);

            if (qResp?.success) {
              enrichedActive = {
                ...active,
                position: qResp.position,
                eta: qResp.estimatedWait,
                serviceName: qResp.serviceName,
                tokenId: qResp.tokenId,
              };
            }
          } catch (e) {
            console.warn("Failed queue status", e);
          }
        }

        if (mounted) {
          setBookings(userBookings);
          setActiveQueue(enrichedActive);
        }
      } catch (err) {
        console.error("Dashboard load failed:", err);
        showToast("Failed to load dashboard", "error");
      } finally {
        if (mounted) setPageLoading(false);
      }
    };

    fetchAll();

    // polling every 8 seconds
    const interval = setInterval(fetchAll, 8000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [user, loading, navigate]);

  // Prevent rendering dashboard while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white text-lg">
        Restoring session…
      </div>
    );
  }

  // Prevent showing dashboard UI before user is loaded
  if (!user) return null;

  // Filter bookings
  const filteredBookings = bookings.filter((b) =>
    filter === "all" ? true : b.status === filter
  );

  const stats = {
    total: bookings.length,
    upcoming: bookings.filter((b) => b.status === "upcoming").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  };

  const handleLogout = async () => {
    await logout();
    showToast("Logged out", "success");
    setTimeout(() => navigate("/"), 500);
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      const res = await bookingsAPI.cancel(bookingId);

      if (res?.success || res === true) {
        showToast("Booking cancelled", "success");
        setBookings((prev) => prev.filter((b) => b.id !== bookingId));

        if (activeQueue?.id === bookingId) setActiveQueue(null);
      } else {
        showToast(res?.message || "Cancel failed", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Network error", "error");
    }
  };

  const getStatusColor = (status) =>
    ({
      upcoming: "text-blue-400 bg-blue-500",
      completed: "text-green-400 bg-green-500",
      cancelled: "text-red-400 bg-red-500",
    }[status] || "text-gray-400 bg-gray-500");

  const getStatusIcon = (status) => {
    if (status === "upcoming")
      return (
        <svg
          className="w-4 h-4 inline-block mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeWidth="2" d="M12 8v4l3 3" />
          <circle cx="12" cy="12" r="9" strokeWidth="2" />
        </svg>
      );
    if (status === "completed")
      return (
        <svg
          className="w-4 h-4 inline-block mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      );
    if (status === "cancelled")
      return (
        <svg
          className="w-4 h-4 inline-block mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    return "•";
  };

  return (
    <div className="min-h-screen bg-primary text-text-primary">
      {/* Toast */}
      {toast.show && (
        <div className={`fixed top-5 right-5 z-50 toast toast-${toast.type}`}>
          <div className="flex items-center justify-between">
            <p style={{ fontWeight: 300 }}>{toast.message}</p>
            <button
              onClick={() => setToast({ show: false, message: "", type: "" })}
              className="ml-4 hover:opacity-70"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <nav className="glass-card sticky top-0 z-40 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
          <Link to="/" className="hover:opacity-80">
            <img
              className="h-11"
              src={`${import.meta.env.BASE_URL}/logo.svg`}
            />
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link
              className="text-accent-green"
              to="/dashboard"
              style={{ fontWeight: 300 }}
            >
              Dashboard
            </Link>
            <Link
              className="text-text-secondary hover:text-accent-green"
              to="/queue-booking"
              style={{ fontWeight: 300 }}
            >
              Book Queue
            </Link>

            <div className="border-l border-gray-800 pl-6 ml-6 flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm">{user.name}</p>
                <p className="text-xs text-text-secondary">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="btn-outline py-2 px-4 text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back */}
        <Link
          to="/"
          className="inline-flex items-center text-text-secondary hover:text-accent-green transition-colors mb-6"
          style={{ fontWeight: 300 }}
        >
          <svg
            className="w-5 h-5 mr-2"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 19l-7-7 7-7"
            ></path>
          </svg>
          Back to Home
        </Link>

        {/* Welcome + Active Queue */}
        <div className="mb-8">
          <h1 className="text-4xl mb-2" style={{ fontWeight: 200 }}>
            Welcome back,{" "}
            <span className="bg-gradient-accent bg-clip-text text-transparent">
              {user?.name ?? "User"}
            </span>
            !
          </h1>
          <p
            className="text-text-secondary text-lg"
            style={{ fontWeight: 300 }}
          >
            Manage your queue bookings and track your position
          </p>

          <div className="mt-6">
            <div className="glass-card p-4 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div
                  className="text-sm text-text-secondary"
                  style={{ fontWeight: 300 }}
                >
                  Live Queue Status
                </div>
                {loading && !activeQueue ? (
                  <div className="text-sm text-text-secondary mt-2">
                    Loading…
                  </div>
                ) : activeQueue ? (
                  <div className="mt-2">
                    <div
                      className="font-mono text-lg"
                      style={{ fontWeight: 200 }}
                    >
                      {activeQueue.token}
                    </div>
                    <div className="text-sm text-text-secondary mt-1">
                      Position: {activeQueue.position ?? "—"}
                    </div>
                    <div className="text-sm text-text-secondary mt-1">
                      ETA: {activeQueue.eta ?? "—"}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-text-secondary mt-2">
                    You are not in any active queue right now.
                  </div>
                )}
              </div>

              <div className="mt-4 md:mt-0 md:ml-4 flex gap-3">
                <Link
                  to={`/queue-status?token=${activeQueue?.token}`}
                  className="btn-outline inline-block"
                >
                  View Live Status
                </Link>

                <button
                  onClick={async () => {
                    try {
                      const listResp = await bookingsAPI.list();
                      const list = Array.isArray(listResp) ? listResp : [];
                      const active =
                        list.find((b) => b.status === "upcoming") || null;
                      setActiveQueue(active);
                      showToast("Queue refreshed", "success");
                    } catch (e) {
                      showToast("Failed to refresh", "error");
                    }
                  }}
                  className="btn-outline inline-flex items-center"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 4v6h6M20 20v-6h-6"
                    ></path>
                    <path
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M20 8a8 8 0 11-8-8"
                    ></path>
                  </svg>
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass-card p-6 glow-hover">
            <div className="flex items-center justify-between mb-2">
              <p
                className="text-text-secondary text-sm"
                style={{ fontWeight: 300 }}
              >
                Total Bookings
              </p>
              <svg
                className="w-8 h-8 text-accent-green"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <rect
                  x="3"
                  y="4"
                  width="18"
                  height="18"
                  rx="2"
                  ry="2"
                  strokeWidth="2"
                ></rect>
                <path
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 2v4M8 2v4M3 10h18"
                ></path>
              </svg>
            </div>
            <p
              className="text-3xl text-accent-green"
              style={{ fontWeight: 200 }}
            >
              {stats.total}
            </p>
          </div>

          <div className="glass-card p-6 glow-hover">
            <div className="flex items-center justify-between mb-2">
              <p
                className="text-text-secondary text-sm"
                style={{ fontWeight: 300 }}
              >
                Upcoming
              </p>
              <svg
                className="w-8 h-8 text-blue-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <circle cx="12" cy="12" r="10" strokeWidth="2"></circle>
                <path
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6l4 2"
                ></path>
              </svg>
            </div>
            <p className="text-3xl text-blue-400" style={{ fontWeight: 200 }}>
              {stats.upcoming}
            </p>
          </div>

          <div className="glass-card p-6 glow-hover">
            <div className="flex items-center justify-between mb-2">
              <p
                className="text-text-secondary text-sm"
                style={{ fontWeight: 300 }}
              >
                Completed
              </p>
              <svg
                className="w-8 h-8 text-green-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <circle cx="12" cy="12" r="10" strokeWidth="2"></circle>
                <path
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4"
                ></path>
              </svg>
            </div>
            <p className="text-3xl text-green-400" style={{ fontWeight: 200 }}>
              {stats.completed}
            </p>
          </div>

          <div className="glass-card p-6 glow-hover">
            <div className="flex items-center justify-between mb-2">
              <p
                className="text-text-secondary text-sm"
                style={{ fontWeight: 300 }}
              >
                Cancelled
              </p>
              <svg
                className="w-8 h-8 text-red-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <circle cx="12" cy="12" r="10" strokeWidth="2"></circle>
                <path
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 9l-6 6M9 9l6 6"
                ></path>
              </svg>
            </div>
            <p className="text-3xl text-red-400" style={{ fontWeight: 200 }}>
              {stats.cancelled}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-card p-6 mb-8 glow-hover">
          <h2 className="text-xl mb-4" style={{ fontWeight: 200 }}>
            Quick Actions
          </h2>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/queue-booking"
              className="btn-gradient inline-flex items-center"
            >
              <svg
                className="w-5 h-5 inline mr-2"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16M4 12h16"
                ></path>
              </svg>
              Book New Queue
            </Link>

            <Link
              to="/services"
              className="btn-outline inline-flex items-center"
            >
              <svg
                className="w-5 h-5 inline mr-2"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 7h18M3 12h18M3 17h18"
                ></path>
              </svg>
              Find Services
            </Link>

            <Link
              to={
                activeQueue?.token
                  ? `/queue-status?token=${activeQueue.token}`
                  : "#"
              }
              onClick={(e) => {
                if (!activeQueue?.token) {
                  e.preventDefault();
                  showToast("You are not in an active queue", "error");
                }
              }}
              className="btn-outline inline-flex items-center"
            >
              <svg
                className="w-5 h-5 inline mr-2"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 7h18M3 12h18M3 17h18"
                ></path>
              </svg>
              Live Queue Status
            </Link>
          </div>
        </div>

        {/* Bookings */}
        <div className="glass-card p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h2 className="text-2xl mb-4 sm:mb-0" style={{ fontWeight: 200 }}>
              My Bookings
            </h2>

            <div className="flex flex-wrap gap-2">
              {["all", "upcoming", "completed", "cancelled"].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setFilter(opt)}
                  className={`px-4 py-2 rounded-lg text-sm transition-all ${
                    filter === opt
                      ? "bg-gradient-accent text-primary"
                      : "glass-card text-text-secondary hover:text-text-primary"
                  }`}
                  style={{
                    background:
                      filter === opt
                        ? "linear-gradient(135deg, #24FB94 0%, #13C0BD 100%)"
                        : undefined,
                    fontWeight: 300,
                  }}
                >
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="py-8 text-center text-text-secondary">Loading…</div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 mx-auto text-text-secondary mb-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <rect
                  x="3"
                  y="4"
                  width="18"
                  height="18"
                  rx="2"
                  strokeWidth="2"
                ></rect>
              </svg>
              <h3 className="text-xl mb-2" style={{ fontWeight: 200 }}>
                No bookings found
              </h3>
              <p
                className="text-text-secondary mb-6"
                style={{ fontWeight: 300 }}
              >
                {filter === "all"
                  ? "You haven't made any bookings yet"
                  : `No ${filter} bookings available`}
              </p>
              <Link to="/queue-booking" className="btn-gradient inline-block">
                Book Your First Queue
              </Link>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredBookings.map((booking) => (
                <div key={booking.id} className="glass-card p-6 glow-hover">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex-1 mb-4 md:mb-0">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3
                            className="text-xl mb-1"
                            style={{ fontWeight: 200 }}
                          >
                            {booking.providerName}
                          </h3>
                          <p
                            className="text-text-secondary text-sm"
                            style={{ fontWeight: 300 }}
                          >
                            Booking ID:{" "}
                            <span className="font-mono text-accent-green">
                              #{booking.id}
                            </span>
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-lg text-xs ${getStatusColor(
                            booking.status
                          )} bg-opacity-20`}
                          style={{ fontWeight: 300 }}
                        >
                          {getStatusIcon(booking.status)}{" "}
                          {String(booking.status ?? "").toUpperCase()}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p
                            className="text-text-secondary mb-1"
                            style={{ fontWeight: 300 }}
                          >
                            Service Type
                          </p>
                          <p style={{ fontWeight: 300 }}>
                            {booking.serviceName ?? booking.serviceType ?? "—"}
                          </p>
                        </div>
                        <div>
                          <p
                            className="text-text-secondary mb-1"
                            style={{ fontWeight: 300 }}
                          >
                            Date & Time
                          </p>
                          <p style={{ fontWeight: 300 }}>
                            {booking.date ?? "—"}
                            {booking.time ? ` at ${booking.time}` : ""}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {booking.status === "upcoming" && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="btn-outline py-2 px-4 text-sm"
                        >
                          Cancel
                        </button>
                      )}
                      
                      <Link
                        to={`/booking/${booking.id}`}
                        className="btn-gradient py-2 px-4 text-sm"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
