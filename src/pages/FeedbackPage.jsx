import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";

const FeedbackPage = () => {
  const { user } = useApp();

  const [feedbacks, setFeedbacks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  // Fetch feedback from backend
  useEffect(() => {
    if (!user?.id || !token) return;

    const fetchFeedback = async () => {
      try {
        const res = await fetch(
          `https://queme.pythonanywhere.com/feedback/provider/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await res.json();
        if (Array.isArray(data)) {
          setFeedbacks(data);
        }
      } catch (err) {
        console.error("Feedback fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [user]);

  // Apply Filter
  const filteredFeedback =
    filter === "all"
      ? feedbacks
      : feedbacks.filter((f) => f.rating === parseInt(filter));

  // Average Rating
  const avgRating =
    feedbacks.length > 0
      ? (
          feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length
        ).toFixed(1)
      : "0.0";

  // Rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: feedbacks.filter((f) => f.rating === rating).length,
    percentage:
      feedbacks.length > 0
        ? (
            (feedbacks.filter((f) => f.rating === rating).length /
              feedbacks.length) *
            100
          ).toFixed(0)
        : 0,
  }));

  const renderStars = (rating) =>
    [...Array(5)].map((_, i) => (
      <svg
        key={i}
        className={`w-5 h-5 ${
          i < rating ? "text-yellow-400 fill-current" : "text-gray-600"
        }`}
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));

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
            <Link to="/provider-dashboard" className="btn-outline py-2 px-4 text-sm">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl mb-2" style={{ fontWeight: 200 }}>
          Customer Feedback
        </h1>
        <p className="text-text-secondary text-lg mb-8" style={{ fontWeight: 300 }}>
          View and respond to customer reviews
        </p>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12 glass-card">
            <p className="text-text-secondary text-lg">Loading feedback...</p>
          </div>
        )}

        {!loading && (
          <>
            {/* Overview Card */}
            <div className="glass-card p-6 mb-8 glow-hover">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Average Rating */}
                <div>
                  <p className="text-text-secondary mb-2" style={{ fontWeight: 300 }}>
                    Average Rating
                  </p>
                  <div className="flex items-center gap-4 mb-3">
                    <p className="text-5xl text-accent-green" style={{ fontWeight: 200 }}>
                      {avgRating}
                    </p>
                    <div className="flex">{renderStars(Math.round(avgRating))}</div>
                  </div>
                  <p className="text-text-secondary" style={{ fontWeight: 300 }}>
                    Based on {feedbacks.length} reviews
                  </p>
                </div>

                {/* Rating distribution */}
                <div>
                  {ratingDistribution.map((dist) => (
                    <div key={dist.rating} className="flex items-center gap-3 mb-2">
                      <span className="text-sm w-8">{dist.rating}★</span>
                      <div className="flex-1 bg-secondary rounded-full h-2">
                        <div
                          className="bg-accent-green h-2 rounded-full"
                          style={{ width: `${dist.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-text-secondary w-12 text-right">
                        {dist.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Filter */}
            <div className="flex gap-2 mb-6">
              {["all", "5", "4", "3", "2", "1"].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setFilter(rating)}
                  className={`px-4 py-2 rounded-lg text-sm ${
                    filter === rating
                      ? "bg-gradient-accent text-primary"
                      : "glass-card text-text-secondary"
                  }`}
                  style={{ fontWeight: 300 }}
                >
                  {rating === "all" ? "All" : `${rating}★`}
                </button>
              ))}
            </div>

            {/* Feedback List */}
            <div className="space-y-4">
              {filteredFeedback.map((fb) => (
                <div key={fb.id} className="glass-card p-6 glow-hover">
                  <div className="mb-3">
                    <h3 className="text-lg mb-1">{fb.customerName}</h3>
                    <div className="flex items-center gap-3 mb-1">
                      <div className="flex">{renderStars(fb.rating)}</div>
                      <span className="text-text-secondary text-sm">{fb.date}</span>
                    </div>
                    <p className="text-text-secondary text-sm">Service: {fb.service}</p>
                  </div>

                  <p className="mb-4">{fb.comment}</p>

                  <div className="flex justify-between border-t pt-4">
                    <button className="text-text-secondary hover:text-accent-green text-sm flex items-center">
                      Helpful ({fb.helpful})
                    </button>
                    <button className="btn-outline py-1 px-4 text-sm">Reply</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredFeedback.length === 0 && (
              <div className="text-center py-12 glass-card">
                <h3 className="text-xl mb-2">No feedback yet</h3>
                <p className="text-text-secondary">Customer reviews will appear here.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FeedbackPage;
