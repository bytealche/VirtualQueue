import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const QueueBookingPage = () => {
  const navigate = useNavigate();
  const { user, providers, createBooking } = useApp();
  
  const [formData, setFormData] = useState({
    providerId: '',
    serviceType: '',
    notificationMethod: 'sms',
    notes: ''
  });
  
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [queueInfo, setQueueInfo] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [generatedToken, setGeneratedToken] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'providerId') {
      const provider = providers.find(p => p.id === value);
      setSelectedProvider(provider);
      if (provider) {
        setFormData(prev => ({ ...prev, serviceType: '' }));
        // Fetch queue info for this provider
        fetchQueueInfo(value);
      }
    }
  };

  const fetchQueueInfo = async (providerId) => {
    // Mock queue info - replace with real API
    const mockQueueSize = Math.floor(Math.random() * 15);
    const avgWaitTime = mockQueueSize * 5; // 5 mins per person
    
    setQueueInfo({
      currentQueueSize: mockQueueSize,
      estimatedWaitTime: avgWaitTime > 0 ? `${avgWaitTime} mins` : 'No wait',
      isOpen: true
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const currentPosition = (queueInfo?.currentQueueSize || 0) + 1;
      const tokenNumber = `TK${Date.now().toString().slice(-6)}`;
      const qrCodeData = `QUEME-${tokenNumber}-${formData.providerId}`;

      const bookingData = {
        ...formData,
        customerId: user.id,
        customerName: user.name,
        customerEmail: user.email,
        customerPhone: user.phone,
        providerName: selectedProvider?.businessName,
        status: 'upcoming',
        position: currentPosition,
        token: tokenNumber,
        qrCode: qrCodeData,
        joinedAt: new Date().toISOString()
      };

      const success = await createBooking(bookingData);
      
      if (success) {
        setGeneratedToken({
          token: tokenNumber,
          qrCode: qrCodeData,
          position: currentPosition,
          provider: selectedProvider?.businessName
        });
        setShowTokenModal(true);
      } else {
        setToast({ show: true, message: 'Failed to join queue', type: 'error' });
      }
    } catch (error) {
      setToast({ show: true, message: 'An error occurred. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary text-text-primary">
      {/* Toast */}
      {toast.show && (
        <div className={`fixed top-5 right-5 z-50 toast toast-${toast.type}`}>
          <div className="flex items-center justify-between">
            <p style={{ fontWeight: 300 }}>{toast.message}</p>
            <button onClick={() => setToast({ show: false, message: '', type: '' })} className="ml-4 hover:opacity-70">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Token Success Modal */}
      {showTokenModal && generatedToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm">
          <div className="glass-card max-w-md w-full p-8 glow">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-accent-green bg-opacity-20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-accent-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              
              <h2 className="text-2xl mb-2" style={{ fontWeight: 200 }}>Successfully Joined Queue!</h2>
              <p className="text-text-secondary mb-6" style={{ fontWeight: 300 }}>
                You're in line at {generatedToken.provider}
              </p>

              <div className="glass-card p-6 mb-6 border border-accent-green">
                <p className="text-text-secondary text-sm mb-2">Your Token Number</p>
                <p className="font-mono text-4xl text-accent-green mb-4" style={{ fontWeight: 200 }}>
                  {generatedToken.token}
                </p>
                
                <div className="bg-white p-4 rounded-lg mb-4 inline-block">
                  <div className="w-48 h-48 bg-gray-200 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-xs text-gray-600 mb-2">QR CODE</p>
                      <p className="text-[8px] text-gray-500 break-all px-2">{generatedToken.qrCode}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-text-secondary mb-1">Position</p>
                    <p className="text-2xl text-accent-green" style={{ fontWeight: 200 }}>#{generatedToken.position}</p>
                  </div>
                  <div>
                    <p className="text-text-secondary mb-1">Status</p>
                    <p className="text-accent-green" style={{ fontWeight: 300 }}>In Queue</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  to={`/queue-status?token=${generatedToken.token}`}
                  className="btn-gradient w-full inline-block py-3"
                  onClick={() => setShowTokenModal(false)}
                >
                  Track Live Status
                </Link>
                <button
                  onClick={() => {
                    setShowTokenModal(false);
                    navigate('/dashboard');
                  }}
                  className="btn-outline w-full py-3"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <nav className="glass-card sticky top-0 z-40 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/dashboard" className="hover:opacity-80 transition-opacity">
              <img src="/logo.svg" alt="QueMe Logo" className="h-11 w-auto" />
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="text-text-secondary hover:text-accent-green transition-colors" style={{ fontWeight: 300 }}>
                Dashboard
              </Link>
              <button onClick={() => navigate('/dashboard')} className="btn-outline py-2 px-4 text-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/dashboard" className="inline-flex items-center text-text-secondary hover:text-accent-green transition-colors mb-6" style={{ fontWeight: 300 }}>
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl mb-2" style={{ fontWeight: 200 }}>
            Join a <span className="bg-gradient-accent bg-clip-text text-transparent">Queue</span>
          </h1>
          <p className="text-text-secondary text-lg" style={{ fontWeight: 300 }}>
            Select a service and join the queue instantly
          </p>
        </div>

        <div className="glass-card p-8 glow-hover">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Service Provider */}
            <div>
              <label htmlFor="providerId" className="block text-sm mb-2" style={{ fontWeight: 300 }}>
                Select Service Provider *
              </label>
              <select
                id="providerId"
                name="providerId"
                value={formData.providerId}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-accent-green"
                style={{ fontWeight: 300 }}
              >
                <option value="">Choose a provider</option>
                {providers.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.businessName} - {provider.businessType}
                  </option>
                ))}
              </select>
            </div>

            {/* Provider Details + Queue Info */}
            {selectedProvider && (
              <>
                <div className="glass-card p-6 border border-accent-green">
                  <div className="flex items-start space-x-4">
                    <div className="bg-gradient-accent w-12 h-12 rounded-lg flex items-center justify-center text-primary flex-shrink-0">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg mb-1" style={{ fontWeight: 200 }}>{selectedProvider.businessName}</h3>
                      <p className="text-text-secondary text-sm mb-2" style={{ fontWeight: 300 }}>{selectedProvider.businessType}</p>
                      <p className="text-text-secondary text-sm" style={{ fontWeight: 300 }}>📍 {selectedProvider.address}</p>
                      <p className="text-text-secondary text-sm" style={{ fontWeight: 300 }}>📞 {selectedProvider.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Live Queue Status */}
                {queueInfo && (
                  <div className="glass-card p-6 bg-accent-green bg-opacity-5 border border-accent-green border-opacity-30">
                    <h3 className="text-lg mb-4 flex items-center" style={{ fontWeight: 300 }}>
                      <svg className="w-5 h-5 mr-2 text-accent-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Live Queue Status
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-text-secondary text-sm mb-1" style={{ fontWeight: 300 }}>People in Queue</p>
                        <p className="text-3xl text-accent-green" style={{ fontWeight: 200 }}>{queueInfo.currentQueueSize}</p>
                      </div>
                      <div>
                        <p className="text-text-secondary text-sm mb-1" style={{ fontWeight: 300 }}>Est. Wait Time</p>
                        <p className="text-3xl" style={{ fontWeight: 200 }}>{queueInfo.estimatedWaitTime}</p>
                      </div>
                    </div>
                    {queueInfo.currentQueueSize === 0 && (
                      <div className="mt-4 p-3 bg-accent-green bg-opacity-10 rounded-lg">
                        <p className="text-accent-green text-sm" style={{ fontWeight: 300 }}>
                          🎉 Queue is empty! You'll be first in line!
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Service Type */}
            <div>
              <label htmlFor="serviceType" className="block text-sm mb-2" style={{ fontWeight: 300 }}>
                Service Type *
              </label>
              <select
                id="serviceType"
                name="serviceType"
                value={formData.serviceType}
                onChange={handleChange}
                required
                disabled={!selectedProvider}
                className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-accent-green disabled:opacity-50"
                style={{ fontWeight: 300 }}
              >
                <option value="">Select service</option>
                <option value="consultation">Consultation</option>
                <option value="general">General Service</option>
                <option value="priority">Priority Service</option>
                <option value="appointment">Service Visit</option>
              </select>
            </div>

            {/* Notification Method */}
            <div>
              <label className="block text-sm mb-3" style={{ fontWeight: 300 }}>
                Notification Method *
              </label>
              <div className="grid grid-cols-3 gap-4">
                {['sms', 'email', 'app'].map((method) => (
                  <label
                    key={method}
                    className={`glass-card p-4 cursor-pointer transition-all ${
                      formData.notificationMethod === method
                        ? 'border-2 border-accent-green bg-accent-green bg-opacity-10'
                        : 'border border-transparent hover:border-accent-green'
                    }`}
                  >
                    <input
                      type="radio"
                      name="notificationMethod"
                      value={method}
                      checked={formData.notificationMethod === method}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="text-center">
                      <div className="text-2xl mb-2">
                        {method === 'sms' && '📱'}
                        {method === 'email' && '📧'}
                        {method === 'app' && '🔔'}
                      </div>
                      <div className="capitalize" style={{ fontWeight: 300 }}>{method}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm mb-2" style={{ fontWeight: 300 }}>
                Additional Notes (Optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-accent-green"
                placeholder="Any special requirements..."
                style={{ fontWeight: 300 }}
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading || !selectedProvider}
                className="flex-1 btn-gradient py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontWeight: 300 }}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <span className="spinner-small mr-2"></span>
                    Joining Queue...
                  </span>
                ) : (
                  'Join Queue Now'
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="btn-outline py-3 px-8"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Info Section */}
        <div className="glass-card p-6 mt-6">
          <h3 className="text-lg mb-4 flex items-center" style={{ fontWeight: 300 }}>
            <svg className="w-5 h-5 mr-2 text-accent-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            How It Works
          </h3>
          <ul className="space-y-2 text-sm text-text-secondary" style={{ fontWeight: 300 }}>
            <li className="flex items-start">
              <svg className="w-5 h-5 mr-2 text-accent-green flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              You'll get a unique token number and QR code instantly
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 mr-2 text-accent-green flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Track your position in real-time from the app
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 mr-2 text-accent-green flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Get notified when it's almost your turn
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 mr-2 text-accent-green flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Show your QR code at the counter for verification
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default QueueBookingPage;