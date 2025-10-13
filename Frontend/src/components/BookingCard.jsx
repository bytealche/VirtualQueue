import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import QRCode from './QRCode';
import FeedbackModal from './FeedbackModal';
import ConfirmDialog from './ConfirmDialog';

const BookingCard = ({ booking }) => {
  const { cancelBooking, updateBooking } = useApp();
  const [showQR, setShowQR] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
   const [showFeedback, setShowFeedback] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(booking.position);
  const [estimatedWait, setEstimatedWait] = useState(booking.estimatedWait);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
   
  useEffect(() => {
    if (window.feather) {
      window.feather.replace();
    }
  }, [showQR, showDetails]);

  // Simulate position updates
  useEffect(() => {
    if (booking.status !== 'active') return;

    const interval = setInterval(() => {
      setCurrentPosition(prev => {
        const newPos = Math.max(1, prev - 1);
        if (newPos !== prev) {
          updateBooking(booking.id, { position: newPos });
          setEstimatedWait(prev => Math.max(0, prev - 3));
        }
        return newPos;
      });
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [booking.status, booking.id, updateBooking]);

  const handleCancel = () => {
  setShowCancelDialog(true);
};

const confirmCancel = () => {
  cancelBooking(booking.id);
  setShowCancelDialog(false);
};

  const handleArrived = () => {
    updateBooking(booking.id, { hasArrived: true });
    alert('Thank you for confirming your arrival! You will be called soon.');
  };

  const progressPercentage = booking.position ? 100 - (currentPosition / booking.position * 100) : 0;

  return (
    <div className="queue-card bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
              <i data-feather="clock" className="h-6 w-6 text-white"></i>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">{booking.service}</h3>
              <p className="text-sm text-gray-500">{booking.provider}</p>
            </div>
          </div>
          <span className={`badge ${booking.status === 'active' ? 'badge-success' : booking.status === 'completed' ? 'badge-info' : 'badge-danger'}`}>
            {booking.status}
          </span>
        </div>

        {/* Queue ID */}
        <div className="mb-4 p-3 bg-indigo-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Queue ID</p>
              <p className="text-lg font-bold text-indigo-600">{booking.queueId}</p>
            </div>
            <button
              onClick={() => setShowQR(!showQR)}
              className="text-indigo-600 hover:text-indigo-700"
            >
              <i data-feather="maximize-2" className="h-5 w-5"></i>
            </button>
          </div>
        </div>

        {/* Position & Wait Time */}
        {booking.status === 'active' && (
          <>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">#{currentPosition}</p>
                <p className="text-xs text-gray-600">Position</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{estimatedWait}m</p>
                <p className="text-xs text-gray-600">Est. Wait</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-indigo-600 h-3 rounded-full progress-bar-animated transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1 text-center">
                {currentPosition >= 3 ? 'Waiting...' : currentPosition === 2 ? 'Almost your turn!' : 'Your turn next!'}
</p>
</div>
</>
)}
{/* Date & Time */}
    <div className="mb-4 flex items-center text-sm text-gray-600">
      <i data-feather="calendar" className="h-4 w-4 mr-2"></i>
      <span>{booking.date} at {booking.time}</span>
    </div>

    {/* Action Buttons */}
    <div className="flex gap-2">
      {booking.status === 'active' && (
        <>
          {!booking.hasArrived && currentPosition <= 5 && (
            <button
              onClick={handleArrived}
              className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              <i data-feather="check-circle" className="h-4 w-4 mr-1"></i>
              I've Arrived
            </button>
          )}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <i data-feather="info" className="h-4 w-4 mr-1"></i>
            Details
          </button>
          <button
            onClick={handleCancel}
            className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
          >
            <i data-feather="x-circle" className="h-4 w-4 mr-1"></i>
            Cancel
          </button>
        </>
      )}
     {booking.status === 'completed' && (
  <>
    <button 
      onClick={() => setShowFeedback(true)}
      className="w-full inline-flex justify-center items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
    >
      <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
      Rate Service
    </button>
    
    {/* Feedback Modal */}
    {showFeedback && (
      <FeedbackModal
        booking={booking}
        onClose={() => setShowFeedback(false)}
        onSubmit={(feedbackData) => {
          updateBooking(booking.id, { feedback: feedbackData });
          setShowFeedback(false);
          alert('Thank you for your feedback!');
        }}
      />
    )}
  </>
)}
    </div>
  </div>

  {/* QR Code Modal */}
  {showQR && (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Your QR Code</h3>
          <button onClick={() => setShowQR(false)} className="text-gray-500 hover:text-gray-700">
            <i data-feather="x" className="h-5 w-5"></i>
          </button>
        </div>
        <div className="flex justify-center mb-4">
          <QRCode value={booking.queueId} size={200} />
        </div>
        <p className="text-sm text-center text-gray-600 mb-4">
          Show this code at the service counter
        </p>
        <button
          onClick={() => alert('QR Code downloaded!')}
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <i data-feather="download" className="h-4 w-4 inline mr-2"></i>
          Download QR Code
        </button>
      </div>
    </div>
  )}

  {/* Details Modal */}
  {showDetails && (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Booking Details</h3>
          <button onClick={() => setShowDetails(false)} className="text-gray-500 hover:text-gray-700">
            <i data-feather="x" className="h-5 w-5"></i>
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-500">Queue ID</p>
            <p className="font-semibold">{booking.queueId}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Service</p>
            <p className="font-semibold">{booking.service}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Provider</p>
            <p className="font-semibold">{booking.provider}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Address</p>
            <p className="font-semibold">{booking.providerAddress}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Date & Time</p>
            <p className="font-semibold">{booking.date} at {booking.time}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Number of People</p>
            <p className="font-semibold">{booking.numberOfPeople}</p>
          </div>
          {booking.notes && (
            <div>
              <p className="text-xs text-gray-500">Notes</p>
              <p className="font-semibold">{booking.notes}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-gray-500">Notifications</p>
            <div className="flex gap-2 mt-1">
              {booking.notifications.sms && <span className="badge badge-info">SMS</span>}
              {booking.notifications.email && <span className="badge badge-info">Email</span>}
              {booking.notifications.app && <span className="badge badge-info">App</span>}
            </div>
          </div>
        </div>
        <div className="mt-6 pt-4 border-t">
          <button
            onClick={() => alert('Directions opened in maps')}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 mb-2"
          >
            <i data-feather="navigation" className="h-4 w-4 inline mr-2"></i>
            Get Directions
          </button>
          <button
            onClick={() => alert('Contact info: +91 98765 43210')}
            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            <i data-feather="phone" className="h-4 w-4 inline mr-2"></i>
            Contact Provider
          </button>
        </div>
      </div>
    </div>
  )}
  {/* Cancel Confirmation Dialog */}
<ConfirmDialog
  isOpen={showCancelDialog}
  title="Cancel Booking"
  message="Are you sure you want to cancel this booking? This action cannot be undone."
  confirmText="Yes, Cancel"
  cancelText="No, Keep it"
  type="danger"
  onConfirm={confirmCancel}
  onCancel={() => setShowCancelDialog(false)}
/>
</div>
  );
};

export default BookingCard;