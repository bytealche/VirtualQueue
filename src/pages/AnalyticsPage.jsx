import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";

const AnalyticsPage = () => {
  const { user } = useApp();

  const [timeRange, setTimeRange] = useState("week");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [dailyData, setDailyData] = useState([]);
  const [serviceBreakdown, setServiceBreakdown] = useState([]);

  const token = localStorage.getItem("token");

  const fetchAnalytics = async (range) => {
    if (!user) return;

    setLoading(true);

    try {
      const res = await fetch(
        `https://queme.pythonanywhere.com/analytics/provider/${user.id}?range=${range}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();
      if (res.ok) {
        setStats({
          totalServed: data.totalServed ?? 0,
          avgWaitTime: data.avgWaitTime ?? "—",
          satisfaction: data.satisfaction ?? "—",
          peakHours: "2-4 PM", // You can compute or add later
        });

        setDailyData(data.dailyData || []);
        setServiceBreakdown(
          (data.serviceBreakdown || []).map((s) => ({
            service: s.service,
            count: s.count,
            percentage: 0, // Compute after
          }))
        );

        // Compute total for service breakdown
        const total = (data.serviceBreakdown || []).reduce(
          (sum, s) => sum + s.count,
          0
        );

        setServiceBreakdown((prev) =>
          prev.map((item) => ({
            ...item,
            percentage: total ? Math.round((item.count / total) * 100) : 0,
          }))
        );
      }
    } catch (err) {
      console.error("Analytics fetch error", err);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchAnalytics(timeRange);
  }, [timeRange, user]);

  const maxCustomers = Math.max(...dailyData.map((d) => d.customers), 1);

  if (loading || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading analytics…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary text-text-primary">
      {/* Header */}
      <nav className="glass-card sticky top-0 z-40 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/provider-dashboard">
              <img
                src={`${import.meta.env.BASE_URL}/logo.svg`}
                alt="Logo"
                className="h-11 w-auto"
              />
            </Link>
            <Link
              to="/provider-dashboard"
              className="btn-outline py-2 px-4 text-sm"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl mb-2" style={{ fontWeight: 200 }}>
              Analytics
            </h1>
            <p
              className="text-text-secondary text-lg"
              style={{ fontWeight: 300 }}
            >
              Track your performance and insights
            </p>
          </div>
          <div className="flex gap-2">
            {["day", "week", "month", "year"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  timeRange === range
                    ? "bg-gradient-accent text-primary"
                    : "glass-card text-text-secondary hover:text-text-primary"
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
            <p className="text-text-secondary text-sm mb-2">Total Customers</p>
            <p className="text-3xl text-accent-green">{stats.totalServed}</p>
          </div>

          <div className="glass-card p-6 glow-hover">
            <p className="text-text-secondary text-sm mb-2">
              Avg. Wait Time
            </p>
            <p className="text-3xl">{stats.avgWaitTime}</p>
          </div>

          <div className="glass-card p-6 glow-hover">
            <p className="text-text-secondary text-sm mb-2">Peak Hours</p>
            <p className="text-3xl">{stats.peakHours}</p>
          </div>

          <div className="glass-card p-6 glow-hover">
            <p className="text-text-secondary text-sm mb-2">
              Satisfaction
            </p>
            <p className="text-3xl text-accent-green">
              {stats.satisfaction}
            </p>
          </div>
        </div>

        {/* Daily Traffic Chart */}
        <div className="glass-card p-6 mb-8 glow-hover">
          <h2 className="text-xl mb-6" style={{ fontWeight: 200 }}>
            Daily Customer Traffic
          </h2>

          <div className="flex items-end justify-between h-64 gap-4">
            {dailyData.map((data) => (
              <div
                key={data.day}
                className="flex-1 flex flex-col items-center"
              >
                <div
                  className="w-full bg-gradient-accent rounded-t-lg transition-all"
                  style={{
                    height: `${(data.customers / maxCustomers) * 100}%`,
                  }}
                ></div>
                <p className="text-text-secondary text-sm mt-2">
                  {data.day}
                </p>
                <p className="text-accent-green text-xs">
                  {data.customers}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Service Breakdown */}
        <div className="glass-card p-6 glow-hover">
          <h2 className="text-xl mb-6" style={{ fontWeight: 200 }}>
            Service Breakdown
          </h2>
          <div className="space-y-4">
            {serviceBreakdown.map((item) => (
              <div key={item.service}>
                <div className="flex justify-between mb-2">
                  <span>{item.service}</span>
                  <span className="text-text-secondary">
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
