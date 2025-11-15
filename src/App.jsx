// App.jsx - Add new provider routes
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { AppProvider } from './context/AppContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import QueueBookingPage from './pages/QueueBookingPage';
import ProviderDashboardPage from './pages/ProviderDashboardPage';
import QueueStatus from "./pages/QueueStatus";
import ServicesPage from "./pages/ServicesPage";

// NEW IMPORTS
import ManageServicesPage from './pages/ManageServicesPage';
import AnalyticsPage from './pages/AnalyticsPage';
import FeedbackPage from './pages/FeedbackPage';

function App() {
  useEffect(() => {
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
          <Route path="/register" element={<RegisterPage />} /> xvb7hn8~12 4
          
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/queue-booking" element={<QueueBookingPage />} />
          <Route path="/provider-dashboard" element={<ProviderDashboardPage />} />
          <Route path="/queue-status" element={<QueueStatus />} />
          
          {/* NEW ROUTES */}
          <Route path="/provider/services" element={<ManageServicesPage />} />
          <Route path="/provider/analytics" element={<AnalyticsPage />} />
          <Route path="/provider/feedback" element={<FeedbackPage />} />
          <Route path="/services" element={<ServicesPage />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;