import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// ProviderDashboard.jsx
// API-ready provider dashboard component that follows the same UI conventions
// as other pages in the codebase (glass-card, btn-gradient, btn-outline, etc.).
// IMPORTANT: This file intentionally contains NO demo/static data. All data is
// loaded from API endpoints. Replace the endpoint URLs below with your
// backend routes (or provide the data via props / context).

const ProviderDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [services, setServices] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [queue, setQueue] = useState({ current: null, waiting: [] });
  const [stats, setStats] = useState({ total: 0, servedToday: 0, avgWait: null, serviceTime: null });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // Update these endpoints according to your backend routes
  const ENDPOINTS = {
    profile: '/api/provider/profile',
    services: '/api/provider/services',
    queue: '/api/provider/queue',
    stats: '/api/provider/stats',
    callNext: (serviceId) => `/api/provider/services/${serviceId}/call-next`,
    pauseQueue: (serviceId) => `/api/provider/services/${serviceId}/pause`,
    markComplete: (tokenId) => `/api/provider/queue/${tokenId}/complete`,
    noShow: (tokenId) => `/api/provider/queue/${tokenId}/noshow`
  };

  useEffect(() => {
    // initial load
    fetchAll();

    // Optional: poll queue & stats every X seconds
    const interval = setInterval(() => {
      if (selectedServiceId) {
        fetchQueue(selectedServiceId);
        fetchStats(selectedServiceId);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [selectedServiceId]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [profileRes, servicesRes] = await Promise.all([
        fetch(ENDPOINTS.profile),
        fetch(ENDPOINTS.services)
      ]);

      if (profileRes.ok) setProfile(await profileRes.json());
      if (servicesRes.ok) {
        const srv = await servicesRes.json();
        setServices(Array.isArray(srv) ? srv : []);

        // auto-select first service if available
        if (Array.isArray(srv) && srv.length > 0 && !selectedServiceId) {
          setSelectedServiceId(srv[0].id);
        }
      }

      // If a service is selected, fetch queue & stats
      if (selectedServiceId) {
        await Promise.all([fetchQueue(selectedServiceId), fetchStats(selectedServiceId)]);
      }
    } catch (err) {
      console.error('Fetch error', err);
      showToast('Failed to load dashboard. Please check your network.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchQueue = async (serviceId) => {
    if (!serviceId) return;
    try {
      const res = await fetch(`${ENDPOINTS.queue}?serviceId=${encodeURIComponent(serviceId)}`);
      if (res.ok) {
        const data = await res.json();
        // Expecting { current: {...} | null, waiting: [...] }
        setQueue({
          current: data.current || null,
          waiting: Array.isArray(data.waiting) ? data.waiting : []
        });
      }
    } catch (err) {
      console.error('Queue fetch error', err);
    }
  };

  const fetchStats = async (serviceId) => {
    if (!serviceId) return;
    try {
      const res = await fetch(`${ENDPOINTS.stats}?serviceId=${encodeURIComponent(serviceId)}`);
      if (res.ok) {
        const data = await res.json();
        setStats({
          total: data.total ?? 0,
          servedToday: data.servedToday ?? 0,
          avgWait: data.avgWait ?? null,
          serviceTime: data.serviceTime ?? null
        });
      }
    } catch (err) {
      console.error('Stats fetch error', err);
    }
  };

  const callNext = async () => {
    if (!selectedServiceId) return showToast('Select a service first', 'error');
    try {
      const res = await fetch(ENDPOINTS.callNext(selectedServiceId), { method: 'POST' });
      if (res.ok) {
        showToast('Called next customer', 'success');
        await fetchQueue(selectedServiceId);
        await fetchStats(selectedServiceId);
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.message || 'Failed to call next', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error while calling next', 'error');
    }
  };

  const pauseQueue = async () => {
    if (!selectedServiceId) return showToast('Select a service first', 'error');
    try {
      const res = await fetch(ENDPOINTS.pauseQueue(selectedServiceId), { method: 'POST' });
      if (res.ok) {
        showToast('Queue paused/resumed', 'success');
        await fetchQueue(selectedServiceId);
      } else {
        showToast('Failed to pause queue', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error while pausing queue', 'error');
    }
  };

  const markComplete = async (tokenId) => {
    if (!tokenId) return;
    try {
      const res = await fetch(ENDPOINTS.markComplete(tokenId), { method: 'POST' });
      if (res.ok) {
        showToast('Marked complete', 'success');
        await fetchQueue(selectedServiceId);
        await fetchStats(selectedServiceId);
      } else {
        showToast('Failed to mark complete', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error while updating token', 'error');
    }
  };

  const markNoShow = async (tokenId) => {
    if (!tokenId) return;
    try {
      const res = await fetch(ENDPOINTS.noShow(tokenId), { method: 'POST' });
      if (res.ok) {
        showToast('Marked no-show', 'success');
        await fetchQueue(selectedServiceId);
        await fetchStats(selectedServiceId);
      } else {
        showToast('Failed to mark no-show', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error while updating token', 'error');
    }
  };

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  // Render helpers
  const formatNumber = (value) => (value === null || value === undefined ? '—' : value);

  return (
    <div className="min-h-screen bg-primary text-text-primary">
      {/* Toast */}
      {toast.show && (
        <div className={`fixed top-5 right-5 z-50 toast toast-${toast.type}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <p style={{ fontWeight: 300 }}>{toast.message}</p>
            </div>
            <button onClick={() => setToast({ show: false, message: '', type: '' })} className="ml-4 hover:opacity-70">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <nav className="glass-card sticky top-0 z-40 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img src="/logo.svg" alt="Logo" className="h-11 w-auto" />
            </Link>

            <div className="hidden md:flex items-center space-x-6">
              <a href="/dashboard" className="text-text-secondary" style={{ fontWeight: 300 }}>Dashboard</a>
              <a href="/queue-booking" className="text-text-secondary hover:text-accent-green transition-colors" style={{ fontWeight: 300 }}>Book Queue</a>
              <div className="flex items-center space-x-4 border-l border-gray-800 pl-6 ml-6">
                <button onClick={() => window.location.href = '/logout'} className="btn-outline py-2 px-4 text-sm">Sign out</button>
              </div>
            </div>

            <button className="md:hidden text-text-primary">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl mb-2" style={{ fontWeight: 200 }}>
            Provider Dashboard
          </h1>
          <p className="text-text-secondary text-lg" style={{ fontWeight: 300 }}>Manage services, queues and monitor performance</p>
        </div>

        {/* Top Area: QR / Business card and Service selector */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-6 flex flex-col items-center justify-center">
            {/* QR / Business card area - no demo data. Show loading / empty state */}
            {loading && !profile ? (
              <div className="w-full text-center py-12">Loading profile…</div>
            ) : (
              <>
                <div className="w-28 h-28 rounded-full overflow-hidden mb-4 flex items-center justify-center bg-white">
                  {profile && profile.logoUrl ? (
                    <img src={profile.logoUrl} alt="Business Logo" className="w-full h-full object-contain" />
                  ) : (
                    <div className="text-text-secondary">No logo</div>
                  )}
                </div>

                <h2 className="text-xl mb-2" style={{ fontWeight: 300 }}>{profile?.businessName ?? '—'}</h2>

                <div className="w-full mt-4">
                  <button
                    className="btn-gradient w-full"
                    onClick={() => {
                      if (!profile) return showToast('Profile not available', 'error');
                      // Download/Show QR - backend should return a QR URL
                      if (profile.qrUrl) window.open(profile.qrUrl, '_blank');
                      else showToast('QR not generated for this provider', 'error');
                    }}
                  >
                    Download QR
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="glass-card p-6 md:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl" style={{ fontWeight: 200 }}>Select Service to manage</h3>
              <div className="text-sm text-text-secondary" style={{ fontWeight: 300 }}>Manage queues and settings per service</div>
            </div>

            <div className="mt-4">
              <select
                className="w-full p-3 rounded-lg bg-secondary text-text-primary"
                value={selectedServiceId}
                onChange={(e) => {
                  setSelectedServiceId(e.target.value);
                  fetchQueue(e.target.value);
                  fetchStats(e.target.value);
                }}
              >
                <option value="">Select a service</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="glass-card p-4 text-center">
                  <p className="text-sm text-text-secondary" style={{ fontWeight: 300 }}>Total in Queue</p>
                  <p className="text-2xl mt-2" style={{ fontWeight: 200 }}>{formatNumber(stats.total)}</p>
                </div>

                <div className="glass-card p-4 text-center">
                  <p className="text-sm text-text-secondary" style={{ fontWeight: 300 }}>Served Today</p>
                  <p className="text-2xl mt-2" style={{ fontWeight: 200 }}>{formatNumber(stats.servedToday)}</p>
                </div>

                <div className="glass-card p-4 text-center">
                  <p className="text-sm text-text-secondary" style={{ fontWeight: 300 }}>Avg. wait Time</p>
                  <p className="text-2xl mt-2" style={{ fontWeight: 200 }}>{stats.avgWait ?? '—'}</p>
                </div>

                <div className="glass-card p-4 text-center">
                  <p className="text-sm text-text-secondary" style={{ fontWeight: 300 }}>Service Time</p>
                  <p className="text-2xl mt-2" style={{ fontWeight: 200 }}>{stats.serviceTime ?? '—'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Queue Control Panel */}
        <div className="glass-card p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl" style={{ fontWeight: 200 }}>Queue Control Panel</h3>
            <div className="flex items-center space-x-3">
              <button className="btn-outline py-2 px-4" onClick={pauseQueue}>
                Pause Queue
              </button>
              <button className="btn-gradient py-2 px-4" onClick={callNext}>
                Call Next
              </button>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-sm text-text-secondary mb-2" style={{ fontWeight: 300 }}>Currently Serving</h4>
            <div className="bg-secondary p-4 rounded-lg flex items-center justify-between">
              {queue.current ? (
                <>
                  <div>
                    <div className="text-sm text-text-secondary">Token</div>
                    <div className="text-lg font-mono" style={{ fontWeight: 200 }}>{queue.current.token}</div>
                    <div className="text-sm text-text-secondary mt-1">{queue.current.customerName}</div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button className="btn-outline py-2 px-4" onClick={() => markComplete(queue.current.id)}>Complete</button>
                    <button className="btn-outline py-2 px-4" onClick={() => markNoShow(queue.current.id)}>No Show</button>
                  </div>
                </>
              ) : (
                <div className="py-6 text-text-secondary">No one is being served right now.</div>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm text-text-secondary mb-4" style={{ fontWeight: 300 }}>Waiting Queue</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-text-secondary text-left">
                    <th className="py-2">Position</th>
                    <th className="py-2">Token</th>
                    <th className="py-2">Customer</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {queue.waiting.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-text-secondary">No customers in queue</td>
                    </tr>
                  ) : (
                    queue.waiting.map((item, i) => (
                      <tr key={item.id} className="border-t border-gray-800">
                        <td className="py-3 font-light">{i + 1}</td>
                        <td className="py-3 font-mono">{item.token}</td>
                        <td className="py-3 font-light">{item.customerName ?? '—'}</td>
                        <td className="py-3 font-light">{item.status ?? 'Waiting'}</td>
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <button className="btn-outline py-1 px-3" onClick={() => window.open(`/customer/${item.customerId}`, '_blank')}>View</button>
                            <button className="btn-outline py-1 px-3" onClick={() => markNoShow(item.id)}>Mark No-Show</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="glass-card p-6">
            <h4 className="text-lg mb-3" style={{ fontWeight: 200 }}>Manage Services</h4>
            <p className="text-text-secondary mb-4" style={{ fontWeight: 300 }}>Configure your service offerings and queue settings.</p>
            <Link to="/provider/services" className="btn-outline">Configure Services</Link>
          </div>

          <div className="glass-card p-6">
            <h4 className="text-lg mb-3" style={{ fontWeight: 200 }}>View Analytics</h4>
            <p className="text-text-secondary mb-4" style={{ fontWeight: 300 }}>Track performance metrics and customer insights.</p>
            <Link to="/provider/analytics" className="btn-outline">View Reports</Link>
          </div>

          <div className="glass-card p-6">
            <h4 className="text-lg mb-3" style={{ fontWeight: 200 }}>Feedback</h4>
            <p className="text-text-secondary mb-4" style={{ fontWeight: 300 }}>Review customer feedback and ratings.</p>
            <Link to="/provider/feedback" className="btn-outline">View Feedback</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;
