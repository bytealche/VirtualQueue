import { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  // User State
  const [currentUser, setCurrentUser] = useState(null);
  
  // My Bookings State (persistent in state)
  const [myBookings, setMyBookings] = useState([]);
  
  // Load user and bookings on mount (simulating persistence)
  useEffect(() => {
    // In a real app, this would load from backend
    const savedUser = { name: 'John Doe', email: 'john@example.com', type: 'customer' };
    setCurrentUser(savedUser);
  }, []);

  // Add new booking
  const addBooking = (booking) => {
    const newBooking = {
      ...booking,
      id: Date.now(),
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    setMyBookings(prev => [...prev, newBooking]);
    return newBooking;
  };

  // Update booking
  const updateBooking = (id, updates) => {
    setMyBookings(prev =>
      prev.map(booking =>
        booking.id === id ? { ...booking, ...updates } : booking
      )
    );
  };

  // Cancel booking
  const cancelBooking = (id) => {
    updateBooking(id, { status: 'cancelled' });
  };

  // Complete booking
  const completeBooking = (id) => {
    updateBooking(id, { status: 'completed' });
  };

  // Get active bookings
  const getActiveBookings = () => {
    return myBookings.filter(b => b.status === 'active');
  };

  // Get booking history
  const getBookingHistory = () => {
    return myBookings.filter(b => b.status !== 'active');
  };

  const value = {
    currentUser,
    setCurrentUser,
    myBookings,
    addBooking,
    updateBooking,
    cancelBooking,
    completeBooking,
    getActiveBookings,
    getBookingHistory,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};