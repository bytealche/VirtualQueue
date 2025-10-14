import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { validateEmail, validatePhone } from '../utils/utils';
import Toast from '../components/Toast';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('customer');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    terms: false,
    businessName: '',
    serviceType: '',
    address: ''
  });
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (window.feather) {
      window.feather.replace();
    }
  }, [userType]);

  const showFieldError = (field, message) => {
    setErrors(prev => ({ ...prev, [field]: message }));
  };

  const hideFieldError = (field) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    hideFieldError(name);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    let isValid = true;

    // Validation
    if (formData.fullName.length < 3) {
      showFieldError('fullName', 'Please enter your full name');
      isValid = false;
    }

    if (!validateEmail(formData.email)) {
      showFieldError('email', 'Please enter a valid email');
      isValid = false;
    }

    if (!validatePhone(formData.phone)) {
      showFieldError('phone', 'Please enter a valid phone number');
      isValid = false;
    }

    if (formData.password.length < 8) {
      showFieldError('password', 'Password must be at least 8 characters');
      isValid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      showFieldError('confirmPassword', 'Passwords do not match');
      isValid = false;
    }

    if (!formData.terms) {
      setToast({ message: 'Please accept the terms and conditions', type: 'warning' });
      isValid = false;
    }

    if (isValid) {
      setToast({ message: 'Registration successful! Redirecting...', type: 'success' });
      
      setTimeout(() => {
        if (userType === 'customer') {
          navigate('/dashboard');
        } else {
          navigate('/provider-dashboard');
        }
      }, 1500);
    }
  };

  return (
    <div className="bg-gray-50">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="flex justify-center">
              <i data-feather="clock" className="h-12 w-12 text-indigo-600"></i>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Create your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                Sign in
              </Link>
            </p>
          </div>
          
          {/* Registration Form */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {/* User Type Selection */}
            <div>
              <label className="text-sm font-medium text-gray-700">Account Type</label>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="radio"
                    id="customer"
                    name="userType"
                    value="customer"
                    checked={userType === 'customer'}
                    onChange={(e) => setUserType(e.target.value)}
                    className="sr-only peer"
                  />
                  <label
                    htmlFor="customer"
                    className="flex items-center justify-center p-3 border-2 border-gray-300 rounded-lg cursor-pointer peer-checked:border-indigo-600 peer-checked:bg-indigo-50 hover:bg-gray-50"
                  >
                    <i data-feather="user" className="h-5 w-5 mr-2"></i>
                    <span className="text-sm font-medium">Customer</span>
                  </label>
                </div>
                <div>
                  <input
                    type="radio"
                    id="provider"
                    name="userType"
                    value="provider"
                    checked={userType === 'provider'}
                    onChange={(e) => setUserType(e.target.value)}
                    className="sr-only peer"
                  />
                  <label
                    htmlFor="provider"
                    className="flex items-center justify-center p-3 border-2 border-gray-300 rounded-lg cursor-pointer peer-checked:border-indigo-600 peer-checked:bg-indigo-50 hover:bg-gray-50"
                  >
                    <i data-feather="briefcase" className="h-5 w-5 mr-2"></i>
                    <span className="text-sm font-medium">Provider</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`mt-1 appearance-none block w-full px-3 py-2 border ${errors.fullName ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="John Doe"
                />
                {errors.fullName && (
                  <span className="error-message show text-red-500 text-sm">{errors.fullName}</span>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`mt-1 appearance-none block w-full px-3 py-2 border ${errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="john@example.com"
                />
                {errors.email && (
                  <span className="error-message show text-red-500 text-sm">{errors.email}</span>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className={`mt-1 appearance-none block w-full px-3 py-2 border ${errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="+91 9876543210"
                />
                {errors.phone && (
                  <span className="error-message show text-red-500 text-sm">{errors.phone}</span>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`mt-1 appearance-none block w-full px-3 py-2 border ${errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="••••••••"
                />
                {errors.password && (
                  <span className="error-message show text-red-500 text-sm">{errors.password}</span>
                )}
                <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters</p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`mt-1 appearance-none block w-full px-3 py-2 border ${errors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="••••••••"
                />
                {errors.confirmPassword && (
                  <span className="error-message show text-red-500 text-sm">{errors.confirmPassword}</span>
                )}
              </div>

              {/* Provider-specific fields */}
              {userType === 'provider' && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">Business Name</label>
                    <input
                      id="businessName"
                      name="businessName"
                      type="text"
                      value={formData.businessName}
                      onChange={handleChange}
                      className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="ABC Services"
                    />
                  </div>

                  <div>
                    <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700">Service Type</label>
                    <select
                      id="serviceType"
                      name="serviceType"
                      value={formData.serviceType}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="">Select service type</option>
                      <option value="bank">Banking</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="government">Government</option>
                      <option value="retail">Retail</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">Business Address</label>
                    <textarea
                      id="address"
                      name="address"
                      rows="3"
                      value={formData.address}
                      onChange={handleChange}
                      className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Enter your business address"
                    ></textarea>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                checked={formData.terms}
                onChange={handleChange}
                required
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                I agree to the <a href="#" className="text-indigo-600 hover:text-indigo-500">Terms and Conditions</a>
              </label>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create Account
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;