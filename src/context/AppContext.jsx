// ============================================
// TEMPORARY AppContext.jsx WITH MOCK API
// Replace this with the real API version when backend is ready
// ============================================

import { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

// Mock data storage (temporary - simulates backend)
const mockStorage = {
  users: [],
  currentUser: null,
  bookings: [],
  providers: [
    {
      id: '1',
      businessName: 'City Bank',
      businessType: 'Banking',
      address: '123 Main Street, Downtown',
      phone: '+91 98765 43210'
    },
    {
      id: '2',
      businessName: 'HealthCare Plus',
      businessType: 'Healthcare',
      address: '456 Medical Center, Health District',
      phone: '+91 98765 43211'
    },
    {
      id: '3',
      businessName: 'Government Services Center',
      businessType: 'Government',
      address: '789 Admin Block, City Center',
      phone: '+91 98765 43212'
    }
  ]
};

// Initialize mock data from localStorage
if (typeof window !== 'undefined') {
  const savedData = localStorage.getItem('queme_mock_data');
  if (savedData) {
    const parsed = JSON.parse(savedData);
    mockStorage.users = parsed.users || [];
    mockStorage.currentUser = parsed.currentUser || null;
    mockStorage.bookings = parsed.bookings || [];
  }
}

// Save to localStorage
const saveMockData = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('queme_mock_data', JSON.stringify({
      users: mockStorage.users,
      currentUser: mockStorage.currentUser,
      bookings: mockStorage.bookings
    }));
  }
};

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState(mockStorage.providers);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (mockStorage.currentUser) {
      const foundUser = mockStorage.users.find(u => u.id === mockStorage.currentUser);
      if (foundUser) {
        setUser(foundUser);
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const foundUser = mockStorage.users.find(u => u.email === email);
  
  if (!foundUser) {
    return { success: false, message: 'User not found. Please register first.' };
  }

  if (foundUser.password !== password) {
    return { success: false, message: 'Invalid password' };
  }

  // Login successful
  mockStorage.currentUser = foundUser.id;
  saveMockData();
  
  // Remove password before setting user
  const { password: pwd, ...userWithoutPassword } = foundUser;
  setUser(userWithoutPassword);
  
  // Return user data so LoginPage can check userType
  return { success: true, user: userWithoutPassword };
};

  const register = async (userData) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if user already exists
    const existingUser = mockStorage.users.find(u => u.email === userData.email);
    if (existingUser) {
      return { success: false, message: 'Email already registered' };
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
      password: userData.password, // In real app, this would be hashed
      phone: userData.phone,
      userType: userData.userType || 'customer',
      businessName: userData.businessName,
      businessType: userData.businessType,
      address: userData.address,
      createdAt: new Date().toISOString()
    };

    mockStorage.users.push(newUser);
    mockStorage.currentUser = newUser.id;
    saveMockData();

    // Set user without password
    const { password, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    
    return { success: true };
  };

  const logout = async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    mockStorage.currentUser = null;
    saveMockData();
    setUser(null);
  };

  const createBooking = async (bookingData) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const newBooking = {
    ...bookingData,
    id: Date.now().toString(),
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString(),
    createdAt: new Date().toISOString()
  };

  mockStorage.bookings.push(newBooking);
  saveMockData();
  
  return true;
};

  const value = {
    user,
    loading,
    providers,
    login,
    register,
    logout,
    createBooking,
    setUser,
    setProviders,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// ============================================
// TEMPORARY Mock API for Dashboard & Other Pages
// Add these functions to handle API calls
// ============================================

// Mock API helper for pages to use
export const mockAPI = {
  // Get user bookings
  getUserBookings: async (userId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const userBookings = mockStorage.bookings.filter(
      b => b.customerId === userId
    );
    
    return userBookings;
  },

  // Get active queue
  getActiveQueue: async (userId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock active queue - return null or mock data
    const activeBooking = mockStorage.bookings.find(
      b => b.customerId === userId && b.status === 'upcoming'
    );

    if (activeBooking) {
      return {
        token: `TK${activeBooking.id.slice(-6)}`,
        tokenId: activeBooking.id,
        position: Math.floor(Math.random() * 10) + 1,
        eta: '15-20 mins',
        serviceName: activeBooking.serviceType
      };
    }

    return null;
  },

  // Cancel booking
  cancelBooking: async (bookingId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const bookingIndex = mockStorage.bookings.findIndex(b => b.id === bookingId);
    if (bookingIndex !== -1) {
      mockStorage.bookings[bookingIndex].status = 'cancelled';
      saveMockData();
      return { success: true };
    }
    
    return { success: false, message: 'Booking not found' };
  },

  // Get queue status
  getQueueStatus: async (token) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Find booking by token
    const booking = mockStorage.bookings.find(
      b => `TK${b.id.slice(-6)}` === token || b.id === token
    );

    if (booking) {
      return {
        tokenId: `TK${booking.id.slice(-6)}`,
        position: Math.floor(Math.random() * 10) + 1,
        estimatedWait: '15-20 mins',
        serviceName: booking.serviceType,
        status: booking.status
      };
    }

    return null;
  }
};

// ============================================
// INSTRUCTIONS FOR USING MOCK API
// ============================================

/*
TO USE IN DASHBOARDPAGE.JSX:

Replace fetch calls with mock API:

// OLD:
const res = await fetch(ENDPOINTS.bookings, { credentials: 'include' });
if (res.ok) {
  const b = await res.json();
  setBookings(Array.isArray(b) ? b : []);
}

// NEW (TEMPORARY):
import { mockAPI } from '../context/AppContext';

const b = await mockAPI.getUserBookings(user.id);
setBookings(Array.isArray(b) ? b : []);


// For active queue:
const q = await mockAPI.getActiveQueue(user.id);
setActiveQueue(q || null);


// For cancel booking:
const result = await mockAPI.cancelBooking(bookingId);
if (result.success) {
  showToast('Booking cancelled', 'success');
  setBookings(prev => prev.filter(b => b.id !== bookingId));
}


TO USE IN QUEUESTATUS.JSX:

// OLD:
const res = await fetch(`/api/queue/status?token=${token}`);
const data = await res.json();
setQueue(data);

// NEW (TEMPORARY):
import { mockAPI } from '../context/AppContext';

const data = await mockAPI.getQueueStatus(token);
setQueue(data);

*/