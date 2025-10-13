import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Toast from '../components/Toast';
import CustomerDetailsModal from '../components/CustomerDetailsModal';

const ProviderDashboardPage = () => {
  const [toast, setToast] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [stats, setStats] = useState({
    totalInQueue: 24,
    servedToday: 45,
    avgWaitTime: '18 min',
    serviceRate: '3.2/min'
  });
  const [queueItems, setQueueItems] = useState([
    { position: 1, token: 'QZ-00046', customer: 'Jane Smith', service: 'Account Opening', waitTime: 5, status: 'waiting' },
    { position: 2, token: 'QZ-00047', customer: 'Mike Johnson', service: 'Loan Application', waitTime: 12, status: 'waiting' },
    { position: 3, token: 'QZ-00048', customer: 'Sarah Williams', service: 'Credit Card', waitTime: 19, status: 'waiting' },
    { position: 4, token: 'QZ-00049', customer: 'David Brown', service: 'Investment', waitTime: 26, status: 'waiting' },
    { position: 5, token: 'QZ-00050', customer: 'Emily Davis', service: 'Account Opening', waitTime: 33, status: 'waiting' }
  ]);
  const [notifications] = useState([
    { id: 1, message: 'New customer joined the queue', time: '2 min ago', unread: true },
    { id: 2, message: 'Customer feedback received - 5 stars', time: '15 min ago', unread: true },
    { id: 3, message: 'Average wait time increased', time: '1 hour ago', unread: false },
    { id: 4, message: 'Daily report is ready', time: '2 hours ago', unread: false }
  ]);

  useEffect(() => {
    if (window.feather) {
      window.feather.replace();
    }

    // Update stats periodically
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        totalInQueue: Math.max(0, prev.totalInQueue + (Math.random() > 0.5 ? 1 : -1)),
        servedToday: prev.servedToday + 1,
        avgWaitTime: `${Math.floor(Math.random() * 5) + 15} min`,
        serviceRate: `${(Math.random() * 2 + 2).toFixed(1)}/min`
      }));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const handleCallNext = () => {
    setToast({ message: 'Calling next customer...', type: 'info' });
    setTimeout(() => {
      if (queueItems.length > 0) {
        setQueueItems(prev => prev.slice(1));
        setToast({ message: 'Customer QZ-00046 has been called', type: 'success' });
      }
    }, 1000);
  };

  const handlePauseQueue = () => {
    setIsPaused(!isPaused);
    if (!isPaused) {
      setToast({ message: 'Queue has been paused', type: 'warning' });
    } else {
      setToast({ message: 'Queue has been resumed', type: 'success' });
    }
  };

  const handleComplete = () => {
    setToast({ message: 'Service completed successfully', type: 'success' });
    setTimeout(() => handleCallNext(), 1000);
  };

  const handleNoShow = () => {
    setToast({ message: 'Customer marked as no-show', type: 'warning' });
    setTimeout(() => handleCallNext(), 1000);
  };

  const handleViewDetails = (token) => {
    const customer = queueItems.find(item => item.token === token);
    if (customer) {
      setSelectedCustomer(customer);
      setShowCustomerModal(true);
    }
  };

  const handleRemove = (token) => {
    if (window.confirm(`Are you sure you want to remove ${token} from the queue?`)) {
      setQueueItems(prev => prev.filter(item => item.token !== token));
      setToast({ message: `${token} has been removed from the queue`, type: 'success' });
    }
  };

  return (
    <div className="bg-gray-50">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <i data-feather="clock" className="h-8 w-8 text-indigo-600"></i>
                <span className="ml-2 text-xl font-bold text-gray-900">QueueZen Provider</span>
              </div>
            </div>
            <div className="hidden md:ml-6 md:flex md:items-center md:space-x-8">
              <a href="#" className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-indigo-500 text-sm font-medium">Dashboard</a>
              <a href="#" className="text-gray-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300 text-sm font-medium">Queue Management</a>
              <a href="#" className="text-gray-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300 text-sm font-medium">Analytics</a>
              <a href="#" className="text-gray-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300 text-sm font-medium">Settings</a>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-1 rounded-full text-gray-400 hover:text-gray-500"
              >
                <i data-feather="bell" className="h-6 w-6"></i>
                <span className="notification-badge absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400"></span>
              </button>
              <Link to="/login" className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">
                Sign Out
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Overview */}
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Stat Card 1 */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <i data-feather="users" className="h-6 w-6 text-gray-400"></i>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dt className="text-sm font-medium text-gray-500 truncate">Total in Queue</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{stats.totalInQueue}</dd>
                  </div>
                </div>
              </div>
            </div>

            {/* Stat Card 2 */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <i data-feather="user-check" className="h-6 w-6 text-green-400"></i>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dt className="text-sm font-medium text-gray-500 truncate">Served Today</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{stats.servedToday}</dd>
                  </div>
                </div>
              </div>
            </div>

            {/* Stat Card 3 */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <i data-feather="clock" className="h-6 w-6 text-yellow-400"></i>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dt className="text-sm font-medium text-gray-500 truncate">Avg Wait Time</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{stats.avgWaitTime}</dd>
                  </div>
                </div>
              </div>
            </div>

            {/* Stat Card 4 */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <i data-feather="trending-up" className="h-6 w-6 text-indigo-400"></i>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dt className="text-sm font-medium text-gray-500 truncate">Service Rate</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{stats.serviceRate}</dd>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Queue Controls */}
        <div className="mt-8 px-4 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Queue Control Panel</h2>
              <div className="flex space-x-3">
                <button
                  onClick={handlePauseQueue}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <i data-feather={isPaused ? "play" : "pause"} className="h-4 w-4 mr-2"></i>
                  {isPaused ? 'Resume Queue' : 'Pause Queue'}
                </button>
                <button
                  onClick={handleCallNext}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <i data-feather="user-plus" className="h-4 w-4 mr-2"></i>
                  Call Next
                </button>
              </div>
            </div>

            {/* Current Serving */}
            <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
              <h3 className="text-sm font-semibold text-indigo-900 mb-3">Currently Serving</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center bg-white p-3 rounded-md">
                  <div>
                    <p className="font-medium text-gray-900">Token #QZ-00045</p>
                    <p className="text-sm text-gray-500">John Doe - Bank Account Opening</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleComplete}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                    >
                      <i data-feather="check" className="h-4 w-4 inline"></i> Complete
                    </button>
                    <button
                      onClick={handleNoShow}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                    >
                      <i data-feather="x" className="h-4 w-4 inline"></i> No Show
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Queue List */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Waiting Queue</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Token</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wait Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {queueItems.map((item) => (
                      <tr key={item.token}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="position-indicator">{item.position}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{item.token}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.customer}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{item.service}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm time-display">{item.waitTime} min</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="badge badge-warning">
                            <span className="status-dot status-waiting"></span>
                            Waiting
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleViewDetails(item.token)}
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                          >
                            <svg className="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleRemove(item.token)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <svg className="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 px-4 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Manage Services */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 bg-indigo-100 rounded-lg p-3">
                  <i data-feather="settings" className="h-6 w-6 text-indigo-600"></i>
                </div>
                <h3 className="ml-3 text-lg font-medium text-gray-900">Manage Services</h3>
              </div>
              <p className="text-sm text-gray-500 mb-4">Configure your service offerings and queue settings</p>
              <button className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200">
                Configure Services
              </button>
            </div>

            {/* View Analytics */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                  <i data-feather="bar-chart-2" className="h-6 w-6 text-green-600"></i>
                </div>
                <h3 className="ml-3 text-lg font-medium text-gray-900">View Analytics</h3>
              </div>
              <p className="text-sm text-gray-500 mb-4">Track performance metrics and customer insights</p>
              <button className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200">
                View Reports
              </button>
            </div>

            {/* Customer Feedback */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
                  <i data-feather="message-square" className="h-6 w-6 text-yellow-600"></i>
                </div>
                <h3 className="ml-3 text-lg font-medium text-gray-900">Feedback</h3>
              </div>
              <p className="text-sm text-gray-500 mb-4">Review customer feedback and ratings</p>
              <button className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200">
                View Feedback
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Notification Panel */}
      {showNotifications && (
        <div className="fixed right-0 top-16 w-80 bg-white shadow-lg rounded-l-lg z-50">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notif) => (
              <div key={notif.id} className={`notification-item ${notif.unread ? 'unread' : ''}`}>
                <div className="flex items-start">
                  <i data-feather="bell" className="h-5 w-5 text-gray-400 mr-3 mt-1"></i>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{notif.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                  </div>
                  {notif.unread && <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Customer Details Modal */}
      {showCustomerModal && (
        <CustomerDetailsModal
          customer={selectedCustomer}
          onClose={() => setShowCustomerModal(false)}
        />
      )}
    </div>
  );
};

export default ProviderDashboardPage;