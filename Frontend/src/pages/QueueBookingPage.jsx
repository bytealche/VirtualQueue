import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { mockServices } from '../utils/mockData';
import { generateQueueId } from '../utils/utils';
import { useApp } from '../context/AppContext';
import Toast from '../components/Toast';
import QRCode from '../components/QRCode';
import SearchFilter from '../components/SearchFilter';
import Breadcrumbs from '../components/Breadcrumbs';

const QueueBookingPage = () => {
  const navigate = useNavigate();
  const { addBooking } = useApp();
  const [toast, setToast] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationData, setConfirmationData] = useState({});
  const [formData, setFormData] = useState({
    serviceCategory: '',
    serviceProvider: '',
    serviceType: '',
    bookingDate: '',
    bookingTime: '',
    numberOfPeople: 1,
    notes: '',
    smsNotif: true,
    emailNotif: true,
    appNotif: true
  });
  const [queueInfo, setQueueInfo] = useState({
    show: false,
    peopleInQueue: 0,
    estimatedWait: 0,
    avgServiceTime: 0
  });
  const [providers, setProviders] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);

  useEffect(() => {
    if (window.feather) {
      window.feather.replace();
    }

    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, bookingDate: today }));
  }, []);

  useEffect(() => {
    if (window.feather) {
      window.feather.replace();
    }
  }, [showModal, queueInfo.show]);

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setFormData(prev => ({
      ...prev,
      serviceCategory: category,
      serviceProvider: '',
      serviceType: ''
    }));

    if (category && mockServices[category]) {
      setProviders(mockServices[category].providers);
      setServiceTypes([]);
    } else {
      setProviders([]);
      setServiceTypes([]);
    }

    setQueueInfo(prev => ({ ...prev, show: false }));
  };

  const handleProviderChange = (e) => {
    const providerId = e.target.value;
    setFormData(prev => ({
      ...prev,
      serviceProvider: providerId,
      serviceType: ''
    }));

    if (providerId && formData.serviceCategory) {
      setServiceTypes(mockServices[formData.serviceCategory].types);
    } else {
      setServiceTypes([]);
    }

    setQueueInfo(prev => ({ ...prev, show: false }));
  };

  const handleServiceTypeChange = (e) => {
    const serviceType = e.target.value;
    setFormData(prev => ({
      ...prev,
      serviceType
    }));

    if (serviceType) {
      // Show queue information with random data
      const peopleInQueue = Math.floor(Math.random() * 20) + 5;
      const avgServiceTime = Math.floor(Math.random() * 5) + 2;
      const estimatedWait = peopleInQueue * avgServiceTime;

      setQueueInfo({
        show: true,
        peopleInQueue,
        avgServiceTime,
        estimatedWait
      });
    } else {
      setQueueInfo(prev => ({ ...prev, show: false }));
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Form submitted');

    // Validate required fields
    if (!formData.serviceCategory || !formData.serviceProvider || !formData.serviceType || !formData.bookingDate || !formData.bookingTime) {
      setToast({ message: 'Please fill in all required fields', type: 'error' });
      return;
    }

    setIsLoading(true);
    console.log('Loading started');

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Create booking
    const queueId = generateQueueId();
    const position = queueInfo.peopleInQueue + 1;
    const estimatedWait = queueInfo.estimatedWait + queueInfo.avgServiceTime;

    console.log('Queue ID generated:', queueId);

    // Get provider name
    const provider = providers.find(p => p.id === parseInt(formData.serviceProvider));
    const providerName = provider ? provider.name : '';

    // Create booking object
    const bookingData = {
      queueId,
      position,
      estimatedWait,
      category: formData.serviceCategory,
      provider: providerName,
      providerAddress: provider ? provider.address : '',
      service: formData.serviceType,
      date: formData.bookingDate,
      time: formData.bookingTime,
      numberOfPeople: formData.numberOfPeople,
      notes: formData.notes,
      notifications: {
        sms: formData.smsNotif,
        email: formData.emailNotif,
        app: formData.appNotif
      }
    };

    console.log('Booking data:', bookingData);

    // Add to context
    try {
      const savedBooking = addBooking(bookingData);
      console.log('Booking saved:', savedBooking);

      setConfirmationData({
        queueId,
        position,
        estimatedWait: `${estimatedWait} minutes`,
        bookingId: savedBooking.id
      });

      console.log('Confirmation data set');

      setIsLoading(false);
      setShowModal(true);
      console.log('Modal should show now');
      
      setToast({ message: 'Queue booking confirmed!', type: 'success' });
    } catch (error) {
      console.error('Error saving booking:', error);
      setIsLoading(false);
      setToast({ message: 'Error saving booking. Please try again.', type: 'error' });
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    navigate('/dashboard');
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
                <span className="ml-2 text-xl font-bold text-gray-900">QueueZen</span>
              </div>
            </div>
            <div className="flex items-center">
              <Link to="/dashboard" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                <i data-feather="arrow-left" className="h-5 w-5 inline mr-1"></i>
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Breadcrumbs 
          items={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Book Queue' }
          ]}
        />
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Book a Queue</h2>
            
            {/* Booking Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Service Selection */}
              <div>
                <label htmlFor="serviceCategory" className="block text-sm font-medium text-gray-700">Service Category</label>
                <select
                  id="serviceCategory"
                  name="serviceCategory"
                  required
                  value={formData.serviceCategory}
                  onChange={handleCategoryChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Select a service category</option>
                  <option value="bank">Banking Services</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="government">Government Services</option>
                  <option value="retail">Retail Services</option>
                </select>
              </div>

              {/* Service Provider */}
              <div>
                <label htmlFor="serviceProvider" className="block text-sm font-medium text-gray-700">Service Provider</label>
                <select
                  id="serviceProvider"
                  name="serviceProvider"
                  required
                  disabled={!formData.serviceCategory}
                  value={formData.serviceProvider}
                  onChange={handleProviderChange}
                  className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${!formData.serviceCategory ? 'bg-gray-100' : ''}`}
                >
                  <option value="">First select a category</option>
                  {providers.map(provider => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name} - {provider.address}
                    </option>
                  ))}
                </select>
              </div>

              {/* Service Type */}
              <div>
                <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700">Specific Service</label>
                <select
                  id="serviceType"
                  name="serviceType"
                  required
                  disabled={!formData.serviceProvider}
                  value={formData.serviceType}
                  onChange={handleServiceTypeChange}
                  className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${!formData.serviceProvider ? 'bg-gray-100' : ''}`}
                >
                  <option value="">First select a provider</option>
                  {serviceTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Queue Info Display */}
              {queueInfo.show && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <i data-feather="info" className="h-5 w-5 text-indigo-600 mr-2"></i>
                    <h3 className="text-sm font-semibold text-indigo-900">Current Queue Status</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-indigo-600">{queueInfo.peopleInQueue}</p>
                      <p className="text-xs text-gray-600">People in Queue</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-indigo-600">{queueInfo.estimatedWait}</p>
                      <p className="text-xs text-gray-600">Est. Wait (min)</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-indigo-600">{queueInfo.avgServiceTime}</p>
                      <p className="text-xs text-gray-600">Avg. Service (min)</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Date and Time Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="bookingDate" className="block text-sm font-medium text-gray-700">Preferred Date</label>
                  <input
                    id="bookingDate"
                    name="bookingDate"
                    type="date"
                    required
                    value={formData.bookingDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="bookingTime" className="block text-sm font-medium text-gray-700">Preferred Time</label>
                  <input
                    id="bookingTime"
                    name="bookingTime"
                    type="time"
                    required
                    value={formData.bookingTime}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              {/* Number of People */}
              <div>
                <label htmlFor="numberOfPeople" className="block text-sm font-medium text-gray-700">Number of People</label>
                <input
                  id="numberOfPeople"
                  name="numberOfPeople"
                  type="number"
                  min="1"
                  max="10"
                  required
                  value={formData.numberOfPeople}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">Maximum 10 people per booking</p>
              </div>

              {/* Additional Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Additional Notes (Optional)</label>
                <textarea
                  id="notes"
                  name="notes"
                  rows="3"
                  value={formData.notes}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Any special requirements or notes..."
                ></textarea>
              </div>

              {/* Notification Preferences */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notification Preferences</label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      id="smsNotif"
                      name="smsNotif"
                      type="checkbox"
                      checked={formData.smsNotif}
                      onChange={handleChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="smsNotif" className="ml-2 block text-sm text-gray-900">
                      SMS Notifications
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="emailNotif"
                      name="emailNotif"
                      type="checkbox"
                      checked={formData.emailNotif}
                      onChange={handleChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="emailNotif" className="ml-2 block text-sm text-gray-900">
                      Email Notifications
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="appNotif"
                      name="appNotif"
                      type="checkbox"
                      checked={formData.appNotif}
                      onChange={handleChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="appNotif" className="ml-2 block text-sm text-gray-900">
                      In-App Notifications
                    </label>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3">
                <Link
                  to="/dashboard"
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isLoading ? (
                    <>
                      <div className="spinner-small mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Confirm Booking
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Booking Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">Booking Confirmed!</h3>
                <p className="text-sm text-gray-500 mb-4">Your queue position has been reserved.</p>
                
                {/* QR Code */}
                <div className="flex justify-center mb-4">
                  {confirmationData.queueId ? (
                    <QRCode value={confirmationData.queueId} size={150} />
                  ) : (
                    <div className="w-[150px] h-[150px] bg-gray-200 flex items-center justify-center rounded">
                      <span className="text-gray-500">Loading...</span>
                    </div>
                  )}
                </div>
                
                {/* Booking Details */}
                <div className="bg-gray-50 p-4 rounded-md mb-4 text-left">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">Queue ID:</span>
                      <span className="text-indigo-600 font-semibold">{confirmationData.queueId}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">Position:</span>
                      <span className="font-semibold">{confirmationData.position}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">Est. Wait:</span>
                      <span className="font-semibold">{confirmationData.estimatedWait}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">Date:</span>
                      <span className="font-semibold">{formData.bookingDate}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">Time:</span>
                      <span className="font-semibold">{formData.bookingTime}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setToast({ message: 'QR Code downloaded!', type: 'success' });
                    }}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download QR Code
                  </button>
                  
                  <button
                    onClick={() => {
                      setToast({ message: 'Booking details copied to clipboard!', type: 'success' });
                    }}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Share Booking
                  </button>

                  <button
                    onClick={() => {
                      setToast({ message: 'Added to calendar!', type: 'success' });
                    }}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Add to Calendar
                  </button>
                  
                  <button
                    onClick={handleModalClose}
                    className="w-full px-4 py-2 bg-indigo-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    Go to Dashboard
                  </button>
                </div>

                {/* Help Text */}
                <p className="text-xs text-gray-500 mt-4">
                  Show this QR code at the service counter. You'll receive notifications when it's your turn.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QueueBookingPage;