import { useState } from 'react';
import { Link } from 'react-router-dom';

const AnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState('week');

  // Mock analytics data
  const stats = {
    totalServed: 156,
    avgWaitTime: '12 mins',
    peakHours: '2-4 PM',
    satisfaction: '4.5/5'
  };

  const dailyData = [
    { day: 'Mon', customers: 25 },
    { day: 'Tue', customers: 32 },
    { day: 'Wed', customers: 28 },
    { day: 'Thu', customers: 35 },
    { day: 'Fri', customers: 40 },
    { day: 'Sat', customers: 38 },
    { day: 'Sun', customers: 22 }
  ];

  const serviceBreakdown = [
    { service: 'General Consultation', count: 85, percentage: 54 },
    { service: 'Priority Service', count: 45, percentage: 29 },
    { service: 'Premium Service', count: 26, percentage: 17 }
  ];

  const maxCustomers = Math.max(...dailyData.map(d => d.customers));

  return (
    <div className="min-h-screen bg-primary text-text-primary">
      {/* Header */}
      <nav className="glass-card sticky top-0 z-40 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/provider-dashboard">
              <img src="/logo.svg" alt="Logo" className="h-11 w-auto" />
            </Link>
            <Link to="/provider-dashboard" className="btn-outline py-2 px-4 text-sm">Back to Dashboard</Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl mb-2" style={{ fontWeight: 200 }}>Analytics</h1>
            <p className="text-text-secondary text-lg" style={{ fontWeight: 300 }}>
              Track your performance and insights
            </p>
          </div>
          <div className="flex gap-2">
            {['day', 'week', 'month', 'year'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  timeRange === range
                    ? 'bg-gradient-accent text-primary'
                    : 'glass-card text-text-secondary hover:text-text-primary'
                }`}
                style={{ fontWeight: 300 }}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="glass-card p-6 glow-hover">
            <p className="text-text-secondary text-sm mb-2" style={{ fontWeight: 300 }}>Total Customers</p>
            <p className="text-3xl text-accent-green" style={{ fontWeight: 200 }}>{stats.totalServed}</p>
          </div>
          <div className="glass-card p-6 glow-hover">
            <p className="text-text-secondary text-sm mb-2" style={{ fontWeight: 300 }}>Avg. Wait Time</p>
            <p className="text-3xl" style={{ fontWeight: 200 }}>{stats.avgWaitTime}</p>
          </div>
          <div className="glass-card p-6 glow-hover">
            <p className="text-text-secondary text-sm mb-2" style={{ fontWeight: 300 }}>Peak Hours</p>
            <p className="text-3xl" style={{ fontWeight: 200 }}>{stats.peakHours}</p>
          </div>
          <div className="glass-card p-6 glow-hover">
            <p className="text-text-secondary text-sm mb-2" style={{ fontWeight: 300 }}>Satisfaction</p>
            <p className="text-3xl text-accent-green" style={{ fontWeight: 200 }}>{stats.satisfaction}</p>
          </div>
        </div>

        {/* Daily Traffic Chart */}
        <div className="glass-card p-6 mb-8 glow-hover">
          <h2 className="text-xl mb-6" style={{ fontWeight: 200 }}>Daily Customer Traffic</h2>
          <div className="flex items-end justify-between h-64 gap-4">
            {dailyData.map((data) => (
              <div key={data.day} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-gradient-accent rounded-t-lg transition-all hover:opacity-80" 
                     style={{ height: `${(data.customers / maxCustomers) * 100}%` }}>
                </div>
                <p className="text-text-secondary text-sm mt-2" style={{ fontWeight: 300 }}>{data.day}</p>
                <p className="text-accent-green text-xs" style={{ fontWeight: 300 }}>{data.customers}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Service Breakdown */}
        <div className="glass-card p-6 glow-hover">
          <h2 className="text-xl mb-6" style={{ fontWeight: 200 }}>Service Breakdown</h2>
          <div className="space-y-4">
            {serviceBreakdown.map((item) => (
              <div key={item.service}>
                <div className="flex justify-between mb-2">
                  <span style={{ fontWeight: 300 }}>{item.service}</span>
                  <span className="text-text-secondary" style={{ fontWeight: 300 }}>
                    {item.count} ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-gradient-accent h-2 rounded-full transition-all"
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;