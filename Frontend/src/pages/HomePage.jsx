import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  useEffect(() => {
    if (window.feather) {
      window.feather.replace();
    }

    // Smooth scrolling for anchor links
    const handleClick = (e) => {
      const href = e.target.closest('a')?.getAttribute('href');
      if (href?.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <div className="bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <i data-feather="clock" className="h-8 w-8 text-indigo-600"></i>
              <span className="ml-2 text-2xl font-bold text-gray-900">QueueZen</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-indigo-600 font-medium">Features</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-indigo-600 font-medium">How It Works</a>
              <a href="#services" className="text-gray-700 hover:text-indigo-600 font-medium">Services</a>
              <Link to="/login" className="text-gray-700 hover:text-indigo-600 font-medium">Login</Link>
              <Link to="/register" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-medium">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-gradient pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6">
              Skip the Line,<br/>Save Your Time
            </h1>
            <p className="text-xl md:text-2xl text-indigo-100 mb-8 max-w-3xl mx-auto">
              Join virtual queues remotely and get notified when it's your turn. No more waiting in physical lines!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="bg-white text-indigo-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 shadow-lg transform hover:scale-105 transition">
                Join as Customer
              </Link>
              <Link to="/register" className="bg-indigo-800 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-900 shadow-lg transform hover:scale-105 transition">
                Register as Provider
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-indigo-600 mb-2">1000+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-indigo-600 mb-2">500+</div>
              <div className="text-gray-600">Service Providers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-indigo-600 mb-2">50K+</div>
              <div className="text-gray-600">Queues Managed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-indigo-600 mb-2">95%</div>
              <div className="text-gray-600">Customer Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose QueueZen?</h2>
            <p className="text-xl text-gray-600">Modern queue management for modern businesses</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="feature-card bg-white p-8 rounded-xl shadow-lg transition-all duration-300">
              <div className="bg-indigo-100 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                <i data-feather="clock" className="h-8 w-8 text-indigo-600"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Save Time</h3>
              <p className="text-gray-600">No more standing in long physical queues. Join remotely and continue with your day.</p>
            </div>

            {/* Feature 2 */}
            <div className="feature-card bg-white p-8 rounded-xl shadow-lg transition-all duration-300">
              <div className="bg-green-100 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                <i data-feather="bell" className="h-8 w-8 text-green-600"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Real-time Alerts</h3>
              <p className="text-gray-600">Get instant notifications via SMS, email, or app when your turn approaches.</p>
            </div>

            {/* Feature 3 */}
            <div className="feature-card bg-white p-8 rounded-xl shadow-lg transition-all duration-300">
              <div className="bg-yellow-100 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                <i data-feather="trending-up" className="h-8 w-8 text-yellow-600"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Track Progress</h3>
              <p className="text-gray-600">Monitor your queue position and estimated wait time in real-time.</p>
            </div>

            {/* Feature 4 */}
            <div className="feature-card bg-white p-8 rounded-xl shadow-lg transition-all duration-300">
              <div className="bg-purple-100 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                <i data-feather="smartphone" className="h-8 w-8 text-purple-600"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Mobile Friendly</h3>
              <p className="text-gray-600">Access from any device - desktop, tablet, or mobile phone.</p>
            </div>

            {/* Feature 5 */}
            <div className="feature-card bg-white p-8 rounded-xl shadow-lg transition-all duration-300">
              <div className="bg-red-100 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                <i data-feather="shield" className="h-8 w-8 text-red-600"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Safe & Secure</h3>
              <p className="text-gray-600">Your data is protected with industry-standard security measures.</p>
            </div>

            {/* Feature 6 */}
            <div className="feature-card bg-white p-8 rounded-xl shadow-lg transition-all duration-300">
              <div className="bg-blue-100 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                <i data-feather="users" className="h-8 w-8 text-blue-600"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Multi-Queue</h3>
              <p className="text-gray-600">Manage multiple queue bookings across different services simultaneously.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Get started in just 3 simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="bg-indigo-600 text-white w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg">
                1
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Choose Service</h3>
              <p className="text-gray-600 text-lg">Select from banking, healthcare, government services, or retail. Find your preferred service provider.</p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="bg-indigo-600 text-white w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg">
                2
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Book Your Slot</h3>
              <p className="text-gray-600 text-lg">Reserve your position in the virtual queue. Choose date, time, and notification preferences.</p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="bg-indigo-600 text-white w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg">
                3
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Get Notified</h3>
              <p className="text-gray-600 text-lg">Receive real-time updates and notifications when it's your turn. Arrive just in time!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-xl text-gray-600">We support a wide range of industries</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Service 1 */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-8 rounded-xl text-white hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <i data-feather="dollar-sign" className="h-12 w-12 mb-4"></i>
              <h3 className="text-2xl font-bold mb-3">Banking</h3>
              <p className="text-blue-100">Account opening, loans, investments, and more banking services.</p>
            </div>

            {/* Service 2 */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-8 rounded-xl text-white hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <i data-feather="heart" className="h-12 w-12 mb-4"></i>
              <h3 className="text-2xl font-bold mb-3">Healthcare</h3>
              <p className="text-green-100">Doctor appointments, lab tests, medical consultations, and check-ups.</p>
            </div>

            {/* Service 3 */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-8 rounded-xl text-white hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <i data-feather="file-text" className="h-12 w-12 mb-4"></i>
              <h3 className="text-2xl font-bold mb-3">Government</h3>
              <p className="text-purple-100">Passport services, licenses, certificates, and government documents.</p>
            </div>

            {/* Service 4 */}
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-8 rounded-xl text-white hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <i data-feather="shopping-bag" className="h-12 w-12 mb-4"></i>
              <h3 className="text-2xl font-bold mb-3">Retail</h3>
              <p className="text-orange-100">Product pickups, returns, exchanges, and customer service assistance.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 hero-gradient">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Skip the Line?</h2>
          <p className="text-xl text-indigo-100 mb-8">Join thousands of satisfied users who save time every day</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-white text-indigo-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 shadow-lg transform hover:scale-105 transition">
              Sign Up Free
            </Link>
            <Link to="/login" className="bg-indigo-800 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-900 shadow-lg transform hover:scale-105 transition">
              Login Now
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
            <p className="text-xl text-gray-600">Real feedback from real people</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  <i data-feather="star" className="h-5 w-5 fill-current"></i>
                  <i data-feather="star" className="h-5 w-5 fill-current"></i>
                  <i data-feather="star" className="h-5 w-5 fill-current"></i>
                  <i data-feather="star" className="h-5 w-5 fill-current"></i>
                  <i data-feather="star" className="h-5 w-5 fill-current"></i>
                </div>
              </div>
              <p className="text-gray-600 mb-4">"QueueZen has transformed how I manage appointments. No more waiting in long lines at the bank!"</p>
              <div className="font-semibold text-gray-900">Rahul Sharma</div>
              <div className="text-gray-500 text-sm">Business Owner</div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  <i data-feather="star" className="h-5 w-5 fill-current"></i>
                  <i data-feather="star" className="h-5 w-5 fill-current"></i>
                  <i data-feather="star" className="h-5 w-5 fill-current"></i>
                  <i data-feather="star" className="h-5 w-5 fill-current"></i>
                  <i data-feather="star" className="h-5 w-5 fill-current"></i>
                </div>
              </div>
              <p className="text-gray-600 mb-4">"As a healthcare provider, this system has improved our efficiency significantly. Highly recommended!"</p>
              <div className="font-semibold text-gray-900">Dr. Priya Verma</div>
              <div className="text-gray-500 text-sm">Medical Practitioner</div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  <i data-feather="star" className="h-5 w-5 fill-current"></i>
                  <i data-feather="star" className="h-5 w-5 fill-current"></i>
                  <i data-feather="star" className="h-5 w-5 fill-current"></i>
                  <i data-feather="star" className="h-5 w-5 fill-current"></i>
                  <i data-feather="star" className="h-5 w-5 fill-current"></i>
                </div>
              </div>
              <p className="text-gray-600 mb-4">"Simple, efficient, and saves so much time. Perfect for managing multiple appointments in a day."</p>
              <div className="font-semibold text-gray-900">Anjali Patel</div>
              <div className="text-gray-500 text-sm">Working Professional</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <i data-feather="clock" className="h-8 w-8 text-indigo-400"></i>
                <span className="ml-2 text-2xl font-bold">QueueZen</span>
              </div>
              <p className="text-gray-400 mb-4">
                Making waiting lines a thing of the past. Join virtual queues and save your valuable time.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <i data-feather="facebook" className="h-6 w-6"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <i data-feather="twitter" className="h-6 w-6"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <i data-feather="instagram" className="h-6 w-6"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <i data-feather="linkedin" className="h-6 w-6"></i>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="text-gray-400 hover:text-white transition">Features</a></li>
                <li><a href="#how-it-works" className="text-gray-400 hover:text-white transition">How It Works</a></li>
                <li><a href="#services" className="text-gray-400 hover:text-white transition">Services</a></li>
                <li><Link to="/login" className="text-gray-400 hover:text-white transition">Login</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Contact Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 QueueZen. All rights reserved. | Developed for Educational Purposes</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;