import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import BookingCard from '../components/BookingCard';
import Toast from '../components/Toast';

const DashboardPage = () => {
  const { getActiveBookings, getBookingHistory } = useApp();
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'history'
  const activeBookings = getActiveBookings();
  const bookingHistory = getBookingHistory();

  useEffect(() => {
    if (window.feather) {
      window.feather.replace();
    }
  }, [activeTab]);

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
                <span className="ml-2 text-xl font-bold text-gray-900">QueueZen</span>
              </div>
            </div>
            <div className="hidden md:ml-6 md:flex md:items-center md:space-x-8">
              <Link to="/dashboard" className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-indigo-500 text-sm font-medium">Dashboard</Link>
              <a href="#services" className="text-gray-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300 text-sm font-medium">Services</a>
              <a href="#" className="text-gray-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300 text-sm font-medium">History</a>
              <a href="#" className="text-gray-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300 text-sm font-medium">Profile</a>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-1 rounded-full text-gray-400 hover:text-gray-500">
                <i data-feather="bell" className="h-6 w-6"></i>
                <span className="notification-badge absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400"></span>
              </button>
              <Link to="/login" className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Sign Out
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="vanta-bg" id="vanta-bg"></div>
          <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Virtual Queue</span>
                <span className="block text-indigo-600">Management System</span>
              </h1>
              <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                Skip the line, save your time. Join queues remotely and get notified when it's your turn.
              </p>
              <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
                <div className="rounded-md shadow">
                  <Link to="/queue-booking" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10">
                    Join a Queue
                  </Link>
                </div>
                <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                  <Link to="/provider-dashboard" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10">
                    Manage Queue
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Queue Status Section */}
        <div className="bg-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center mb-8">
              <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Current Status</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Your Queue Positions
              </p>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('active')}
                  className={`${
                    activeTab === 'active'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Active Bookings ({activeBookings.length})
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`${
                    activeTab === 'history'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  History ({bookingHistory.length})
                </button>
              </nav>
            </div>

            {/* Active Bookings */}
            {activeTab === 'active' && (
              <div className="mt-10">
                {activeBookings.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <i data-feather="inbox" className="h-16 w-16 text-gray-300 mx-auto mb-4"></i>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Bookings</h3>
                    <p className="text-gray-500 mb-4">Join a queue to get started</p>
                    <Link
                      to="/queue-booking"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      <i data-feather="plus" className="h-4 w-4 mr-2"></i>
                      Join Queue
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {activeBookings.map((booking) => (
                      <BookingCard key={booking.id} booking={booking} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Booking History */}
            {activeTab === 'history' && (
              <div className="mt-10">
                {bookingHistory.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <i data-feather="clock" className="h-16 w-16 text-gray-300 mx-auto mb-4"></i>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Booking History</h3>
                    <p className="text-gray-500">Your completed and cancelled bookings will appear here</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {bookingHistory.map((booking) => (
                      <BookingCard key={booking.id} booking={booking} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Services Section */}
        <div id="services" className="bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Available Services</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Join a Queue Now
              </p>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                Select from our wide range of services to join a virtual queue.
              </p>
            </div>

            <div className="mt-10">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { icon: 'dollar-sign', title: 'Bank Services', desc: 'Open accounts, apply for loans, and other banking services.' },
                  { icon: 'heart', title: 'Healthcare', desc: 'Doctor appointments, lab tests, and medical consultations.' },
                  { icon: 'file-text', title: 'Government', desc: 'Passport services, licenses, and other government services.' },
                  { icon: 'shopping-bag', title: 'Retail', desc: 'In-store pickups, returns, and customer service.' }
                ].map((service, index) => (
                  <div key={index} className="queue-card bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                        <i data-feather={service.icon} className="h-6 w-6"></i>
                      </div>
                      <div className="mt-5">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">{service.title}</h3>
                        <p className="mt-2 text-sm text-gray-500">{service.desc}</p>
                      </div>
                      <div className="mt-5">
                        <Link
                          to="/queue-booking"
                          className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Join Queue
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="bg-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Process</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                How QueueZen Works
              </p>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                Simple steps to manage your queues efficiently.
              </p>
            </div>

            <div className="mt-10">
              <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
                {[
                  { num: '1', title: 'Select Service', desc: 'Choose from our list of available services to join the appropriate queue.' },
                  { num: '2', title: 'Get Position', desc: 'Receive your position in the queue and estimated wait time.' },
                  { num: '3', title: 'Get Notified', desc: 'Receive real-time notifications as your turn approaches.' }
                ].map((step) => (
                  <div key={step.num} className="relative">
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                      <span className="text-xl font-bold">{step.num}</span>
                    </div>
                    <div className="ml-16">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">{step.title}</h3>
                      <p className="mt-2 text-base text-gray-500">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Product</h3>
              <ul className="mt-4 space-y-4">
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Features</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Pricing</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white">API</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Company</h3>
              <ul className="mt-4 space-y-4">
                <li><a href="#" className="text-base text-gray-300 hover:text-white">About</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Blog</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Resources</h3>
              <ul className="mt-4 space-y-4">
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Documentation</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Guides</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Support</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Legal</h3>
              <ul className="mt-4 space-y-4">
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Privacy</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Terms</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-700 pt-8 md:flex md:items-center md:justify-between">
            <div className="flex space-x-6 md:order-2">
              <a href="#" className="text-gray-400 hover:text-gray-300">
                <i data-feather="twitter" className="h-6 w-6"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-300">
                <i data-feather="facebook" className="h-6 w-6"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-300">
                <i data-feather="instagram" className="h-6 w-6"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-300">
                <i data-feather="linkedin" className="h-6 w-6"></i>
              </a>
            </div>
            <p className="mt-8 text-base text-gray-400 md:mt-0 md:order-1">
              &copy; 2024 QueueZen. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DashboardPage;