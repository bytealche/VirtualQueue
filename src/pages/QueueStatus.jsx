// QueueStatus.jsx - REAL API VERSION
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { queueAPI } from "../services/queue";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const QueueStatus = () => {
  const query = useQuery();
  const token = query.get("token");

  const [queue, setQueue] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await queueAPI.getStatus(token);

      if (res?.success) {
        const q = res;

        setQueue({
          tokenId: q.tokenId,
          position: q.position,
          estimatedWait: q.estimatedWait,
          serviceName: q.serviceName || "Service",
          status: q.status,
        });
      } else {
        setQueue(null);
      }
    } catch (err) {
      console.error("Queue status error:", err);
      setQueue(null);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchStatus();
    const i = setInterval(fetchStatus, 7000);
    return () => clearInterval(i);
  }, [token]);

  if (!token) {
    return (
      <div className="min-h-screen bg-primary text-text-primary flex items-center justify-center">
        <div className="text-center">
          <svg
            className="w-16 h-16 mx-auto text-text-secondary mb-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            ></path>
          </svg>
          <p style={{ fontWeight: 300 }}>No token provided.</p>
          <Link to="/dashboard" className="btn-outline mt-6 inline-block">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary text-text-primary">
      {/* Header */}
      <nav className="glass-card border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center hover:opacity-80">
            <img
              src={`${import.meta.env.BASE_URL}/logo.svg`}
              alt="QueMe Logo"
              className="h-14 w-auto"
            />
          </Link>
          <Link to="/dashboard" className="btn-outline py-2 px-4 text-sm">
            Dashboard
          </Link>
        </div>
      </nav>

      {/* Main */}
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Link
          to="/dashboard"
          className="text-text-secondary hover:text-accent-green mb-6 inline-flex items-center"
          style={{ fontWeight: 300 }}
        >
          <svg
            className="w-5 h-5 mr-2"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path strokeWidth="2" d="M10 19l-7-7 7-7"></path>
          </svg>
          Back to Dashboard
        </Link>

        <h1 className="text-4xl mb-6" style={{ fontWeight: 200 }}>
          Live Queue Status
        </h1>

        <div className="glass-card p-8 text-center glow-hover">
          {loading ? (
            <div className="py-8">
              <div className="spinner mx-auto"></div>
              <p
                className="text-text-secondary mt-4"
                style={{ fontWeight: 300 }}
              >
                Loading queue status...
              </p>
            </div>
          ) : queue ? (
            <>
              {/* Token */}
              <div className="mb-8">
                <p
                  className="text-text-secondary text-sm mb-2"
                  style={{ fontWeight: 300 }}
                >
                  Your Token
                </p>
                <p
                  className="font-mono text-4xl text-accent-green mb-2"
                  style={{ fontWeight: 200 }}
                >
                  {queue.tokenId}
                </p>
                <span
                  className="inline-block px-4 py-1 rounded-full text-xs bg-accent-green bg-opacity-20 text-accent-green"
                  style={{ fontWeight: 300 }}
                >
                  {queue.status?.toUpperCase()}
                </span>
              </div>

              {/* 3 Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="glass-card p-6 glow-hover">
                  <p className="text-text-secondary text-sm mb-2">
                    Position in Queue
                  </p>
                  <p className="text-4xl text-accent-green">{queue.position}</p>
                </div>

                <div className="glass-card p-6 glow-hover">
                  <p className="text-text-secondary text-sm mb-2">
                    Estimated Wait
                  </p>
                  <p className="text-4xl">{queue.estimatedWait}</p>
                </div>

                <div className="glass-card p-6 glow-hover">
                  <p className="text-text-secondary text-sm mb-2">Service</p>
                  <p className="text-2xl">{queue.serviceName}</p>
                </div>
              </div>

              {/* Info */}
              <div className="glass-card p-6 mb-8 bg-accent-green bg-opacity-5 border border-accent-green border-opacity-30">
                <div className="flex items-start space-x-3">
                  <svg
                    className="w-6 h-6 text-accent-green mt-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  <div>
                    <p
                      className="font-semibold text-accent-green mb-2"
                      style={{ fontWeight: 300 }}
                    >
                      Important Information
                    </p>
                    <ul className="text-sm text-text-secondary space-y-1">
                      <li>• Please arrive 10 minutes early</li>
                      <li>• You will be notified when it's almost your turn</li>
                      <li>• This page refreshes every 7 seconds</li>
                      <li>• Keep your token ready</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={fetchStatus}
                  className="btn-gradient px-8 py-3 inline-flex items-center justify-center"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path strokeWidth="2" d="M4 4v6h6M20 20v-6h-6"></path>
                    <path strokeWidth="2" d="M20 8a8 8 0 11-8-8"></path>
                  </svg>
                  Refresh Status
                </button>

                <Link
                  to="/dashboard"
                  className="btn-outline px-8 py-3 inline-flex items-center justify-center"
                >
                  Back to Dashboard
                </Link>
              </div>
            </>
          ) : (
            <div className="py-8">
              <svg
                className="w-20 h-20 mx-auto text-text-secondary mb-4"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <h3 className="text-xl mb-2" style={{ fontWeight: 200 }}>
                Token Not Found
              </h3>
              <p
                className="text-text-secondary mb-6"
                style={{ fontWeight: 300 }}
              >
                Invalid or expired token.
              </p>
              <Link
                to="/dashboard"
                className="btn-gradient px-8 py-3 inline-block"
              >
                Go to Dashboard
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QueueStatus;
