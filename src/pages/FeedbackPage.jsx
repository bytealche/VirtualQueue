import { useState } from 'react';
import { Link } from 'react-router-dom';

const FeedbackPage = () => {
  const [filter, setFilter] = useState('all');

  // Mock feedback data
  const feedbacks = [
    {
      id: '1',
      customerName: 'Rahul Sharma',
      rating: 5,
      comment: 'Excellent service! Very quick and professional.',
      service: 'General Consultation',
      date: '2024-01-15',
      helpful: 12
    },
    {
      id: '2',
      customerName: 'Priya Verma',
      rating: 4,
      comment: 'Good experience, but wait time could be improved.',
      service: 'Priority Service',
      date: '2024-01-14',
      helpful: 8
    },
    {
      id: '3',
      customerName: 'Amit Patel',
      rating: 5,
      comment: 'Amazing! The queue system made everything so smooth.',
      service: 'General Consultation',
      date: '2024-01-14',
      helpful: 15
    },
    {
      id: '4',
      customerName: 'Anjali Singh',
      rating: 3,
      comment: 'Service was okay. Staff could be more friendly.',
      service: 'Premium Service',
      date: '2024-01-13',
      helpful: 5
    },
    {
      id: '5',
      customerName: 'Vikram Kumar',
      rating: 5,
      comment: 'Best service center in the area. Highly recommended!',
      service: 'General Consultation',
      date: '2024-01-13',
      helpful: 20
    }
  ];

  const filteredFeedback = filter === 'all' 
    ? feedbacks 
    : feedbacks.filter(f => f.rating === parseInt(filter));

  const avgRating = (feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length).toFixed(1);
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: feedbacks.filter(f => f.rating === rating).length,
    percentage: (feedbacks.filter(f => f.rating === rating).length / feedbacks.length * 100).toFixed(0)
  }));

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <svg
        key={i}
        className={`w-5 h-5 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`}
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

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
        <div className="mb-8">
          <h1 className="text-4xl mb-2" style={{ fontWeight: 200 }}>Customer Feedback</h1>
          <p className="text-text-secondary text-lg" style={{ fontWeight: 300 }}>
            View and respond to customer reviews
          </p>
        </div>

        {/* Overview Card */}
        <div className="glass-card p-6 mb-8 glow-hover">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Average Rating */}
            <div className="text-center md:text-left">
              <p className="text-text-secondary mb-2" style={{ fontWeight: 300 }}>Average Rating</p>
              <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                <p className="text-5xl text-accent-green" style={{ fontWeight: 200 }}>{avgRating}</p>
                <div className="flex">{renderStars(Math.round(avgRating))}</div>
              </div>
              <p className="text-text-secondary" style={{ fontWeight: 300 }}>
                Based on {feedbacks.length} reviews
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {ratingDistribution.map((dist) => (
                <div key={dist.rating} className="flex items-center gap-3">
                  <span className="text-sm w-8" style={{ fontWeight: 300 }}>{dist.rating}★</span>
                  <div className="flex-1 bg-secondary rounded-full h-2">
                    <div
                      className="bg-accent-green h-2 rounded-full transition-all"
                      style={{ width: `${dist.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-text-secondary w-12 text-right" style={{ fontWeight: 300 }}>
                    {dist.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-6">
          {['all', '5', '4', '3', '2', '1'].map((rating) => (
            <button
              key={rating}
              onClick={() => setFilter(rating)}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                filter === rating
                  ? 'bg-gradient-accent text-primary'
                  : 'glass-card text-text-secondary hover:text-text-primary'
              }`}
              style={{ fontWeight: 300 }}
            >
              {rating === 'all' ? 'All' : `${rating}★`}
            </button>
          ))}
        </div>

        {/* Feedback List */}
        <div className="space-y-4">
          {filteredFeedback.map((feedback) => (
            <div key={feedback.id} className="glass-card p-6 glow-hover">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg mb-1" style={{ fontWeight: 300 }}>{feedback.customerName}</h3>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex">{renderStars(feedback.rating)}</div>
                    <span className="text-text-secondary text-sm" style={{ fontWeight: 300 }}>
                      {feedback.date}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary" style={{ fontWeight: 300 }}>
                    Service: {feedback.service}
                  </p>
                </div>
              </div>

              <p className="text-text-primary mb-4" style={{ fontWeight: 300 }}>
                {feedback.comment}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                <button className="text-text-secondary hover:text-accent-green transition-colors text-sm flex items-center" style={{ fontWeight: 300 }}>
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                  Helpful ({feedback.helpful})
                </button>
                <button className="btn-outline py-1 px-4 text-sm">
                  Reply
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredFeedback.length === 0 && (
          <div className="text-center py-12 glass-card">
            <svg className="w-16 h-16 mx-auto text-text-secondary mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <h3 className="text-xl mb-2" style={{ fontWeight: 200 }}>No feedback yet</h3>
            <p className="text-text-secondary" style={{ fontWeight: 300 }}>
              Customer reviews will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackPage;