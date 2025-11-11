// QueueStatus.jsx - TEMPORARY VERSION WITH MOCK API
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { mockAPI } from '../context/AppContext';

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
      const data = await mockAPI.getQueueStatus(token);
      setQueue(data);
    } catch (err) {
      console.error('Error fetching queue status:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 7000);
    return () => clearInterval(interval);
  }, [token]);

  if (!token) {
    return (
      <div className="min-h-screen bg-primary text-text-primary flex items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto text-text-secondary mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
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
      <nav className="glass-card border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center hover:opacity-80">
            <img src="/logo.svg" alt="QueMe Logo" className="h-14 w-auto" />
          </Link>
          <Link to="/dashboard" className="btn-outline py-2 px-4 text-sm">
            Dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <Link to="/dashboard" className="text-text-secondary hover:text-accent-green mb-6 inline-flex items-center" style={{ fontWeight: 300 }}>
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7 7-7"></path>
          </svg>
          Back to Dashboard
        </Link>

        <h1 className="text-4xl mb-6" style={{ fontWeight: 200 }}>Live Queue Status</h1>

        <div className="glass-card p-8 text-center glow-hover">
          {loading ? (
            <div className="py-8">
              <div className="spinner mx-auto"></div>
              <p className="text-text-secondary mt-4" style={{ fontWeight: 300 }}>Loading queue status...</p>
            </div>
          ) : queue ? (
            <>
              <div className="mb-8">
                <p className="text-text-secondary text-sm mb-2" style={{ fontWeight: 300 }}>Your Token</p>
                <p className="font-mono text-4xl text-accent-green mb-2" style={{ fontWeight: 200 }}>{queue.tokenId}</p>
                <span className="inline-block px-4 py-1 rounded-full text-xs bg-accent-green bg-opacity-20 text-accent-green" style={{ fontWeight: 300 }}>
                  {queue.status?.toUpperCase() || 'ACTIVE'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="glass-card p-6 glow-hover">
                  <p className="text-text-secondary text-sm mb-2" style={{ fontWeight: 300 }}>Position in Queue</p>
                  <p className="text-4xl text-accent-green" style={{ fontWeight: 200 }}>{queue.position}</p>
                </div>

                <div className="glass-card p-6 glow-hover">
                  <p className="text-text-secondary text-sm mb-2" style={{ fontWeight: 300 }}>Estimated Wait</p>
                  <p className="text-4xl" style={{ fontWeight: 200 }}>{queue.estimatedWait}</p>
                </div>

                <div className="glass-card p-6 glow-hover">
                  <p className="text-text-secondary text-sm mb-2" style={{ fontWeight: 300 }}>Service</p>
                  <p className="text-2xl" style={{ fontWeight: 200 }}>{queue.serviceName}</p>
                </div>
              </div>

              <div className="glass-card p-6 mb-8 bg-accent-green bg-opacity-5 border border-accent-green border-opacity-30">
                <div className="flex items-start space-x-3">
                  <svg className="w-6 h-6 text-accent-green flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-left">
                    <p className="font-semibold text-accent-green mb-2" style={{ fontWeight: 300 }}>Important Information</p>
                    <ul className="text-sm text-text-secondary space-y-1" style={{ fontWeight: 300 }}>
                      <li>• Please arrive 10 minutes before your estimated time</li>
                      <li>• You will receive a notification when it's almost your turn</li>
                      <li>• This page auto-refreshes every 7 seconds</li>
                      <li>• Keep your token number ready for verification</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={fetchStatus} 
                  className="btn-gradient px-8 py-3 inline-flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 4v6h6M20 20v-6h-6"></path>
                    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M20 8a8 8 0 11-8-8"></path>
                  </svg>
                  Refresh Status
                </button>
                
                <Link to="/dashboard" className="btn-outline px-8 py-3 inline-flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                  </svg>
                  Back to Dashboard
                </Link>
              </div>
            </>
          ) : (
            <div className="py-8">
              <svg className="w-20 h-20 mx-auto text-text-secondary mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <h3 className="text-xl mb-2" style={{ fontWeight: 200 }}>Token Not Found</h3>
              <p style={{ fontWeight: 300 }} className="text-text-secondary mb-6">
                Invalid or expired token. Please check your booking details.
              </p>
              <Link to="/dashboard" className="btn-gradient inline-block px-8 py-3">
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