import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { AppProvider } from './context/AppContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import QueueBookingPage from './pages/QueueBookingPage';
import ProviderDashboardPage from './pages/ProviderDashboardPage';

function App() {
  useEffect(() => {
    // Replace feather icons on mount and updates
    if (window.feather) {
      window.feather.replace();
    }
  });

  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/queue-booking" element={<QueueBookingPage />} />
          <Route path="/provider-dashboard" element={<ProviderDashboardPage />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;