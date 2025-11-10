// ForgotPasswordPage.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState('email'); // 'email', 'otp', 'reset', 'success'
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    
    if (!email) {
      showToast('Please enter your email', 'error');
      return;
    }

    setLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate mock OTP
    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(mockOtp);
    
    setLoading(false);
    showToast(`OTP sent to ${email} (Mock OTP: ${mockOtp})`, 'success');
    setStep('otp');
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    
    const enteredOtp = otp.join('');
    
    if (enteredOtp.length !== 6) {
      showToast('Please enter complete OTP', 'error');
      return;
    }

    setLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Verify OTP (mock)
    if (enteredOtp === generatedOtp) {
      setLoading(false);
      showToast('OTP verified successfully!', 'success');
      setStep('reset');
    } else {
      setLoading(false);
      showToast('Invalid OTP. Please try again.', 'error');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    setLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    setLoading(false);
    showToast('Password reset successful!', 'success');
    setStep('success');
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(mockOtp);
    
    setLoading(false);
    showToast(`New OTP sent (Mock OTP: ${mockOtp})`, 'success');
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-accent rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-accent-reverse rounded-full blur-3xl"></div>
      </div>

      {/* Toast */}
      {toast.show && (
        <div className={`fixed top-5 right-5 z-50 toast toast-${toast.type}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <p style={{ fontWeight: 300 }}>{toast.message}</p>
            </div>
            <button onClick={() => setToast({ show: false, message: '', type: '' })} className="ml-4 hover:opacity-70">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-md relative z-10">
        <div className="glass-card p-8 glow-hover">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Link to="/" className="hover:opacity-80 transition-opacity">
              <img src="/logo.svg" alt="QueMe Logo" className="h-10 w-auto" />
            </Link>
          </div>

          {/* Step 1: Email */}
          {step === 'email' && (
            <>
              <h2 className="text-3xl font-extralight text-center mb-2">Forgot Password?</h2>
              <p className="text-text-secondary text-center mb-8 font-light">
                Enter your email to receive a verification code
              </p>

              <form onSubmit={handleSendOtp} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-light mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-accent-green font-light"
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-gradient py-3 text-lg font-light disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <span className="spinner-small mr-2"></span>
                      Sending...
                    </span>
                  ) : (
                    'Send Verification Code'
                  )}
                </button>
              </form>

              <div className="text-center mt-6">
                <Link to="/login" className="text-sm text-accent-green hover:text-accent-cyan transition-colors font-light">
                  ← Back to Login
                </Link>
              </div>
            </>
          )}

          {/* Step 2: OTP Verification */}
          {step === 'otp' && (
            <>
              <h2 className="text-3xl font-extralight text-center mb-2">Enter Verification Code</h2>
              <p className="text-text-secondary text-center mb-8 font-light">
                We sent a code to {email}
              </p>

              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div>
                  <label className="block text-sm font-light mb-2 text-center">
                    Enter 6-digit code
                  </label>
                  <div className="flex justify-center gap-2">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-12 h-12 text-center text-2xl rounded-lg focus:ring-2 focus:ring-accent-green font-light"
                        style={{ fontWeight: 300 }}
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-gradient py-3 text-lg font-light disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <span className="spinner-small mr-2"></span>
                      Verifying...
                    </span>
                  ) : (
                    'Verify Code'
                  )}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="text-sm text-accent-green hover:text-accent-cyan transition-colors font-light"
                  >
                    Didn't receive code? Resend
                  </button>
                </div>
              </form>

              <div className="text-center mt-6">
                <button 
                  onClick={() => setStep('email')}
                  className="text-sm text-text-secondary hover:text-accent-green transition-colors font-light"
                >
                  ← Change Email
                </button>
              </div>
            </>
          )}

          {/* Step 3: Reset Password */}
          {step === 'reset' && (
            <>
              <h2 className="text-3xl font-extralight text-center mb-2">Set New Password</h2>
              <p className="text-text-secondary text-center mb-8 font-light">
                Choose a strong password for your account
              </p>

              <form onSubmit={handleResetPassword} className="space-y-6">
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-light mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-accent-green font-light"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-light mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-accent-green font-light"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-gradient py-3 text-lg font-light disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <span className="spinner-small mr-2"></span>
                      Resetting...
                    </span>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </form>
            </>
          )}

          {/* Step 4: Success */}
          {step === 'success' && (
            <>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-accent-green bg-opacity-20 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-accent-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>

                <h2 className="text-3xl font-extralight mb-2">Password Reset Successful!</h2>
                <p className="text-text-secondary mb-8 font-light">
                  You can now login with your new password
                </p>

                <Link to="/login" className="btn-gradient inline-block w-full py-3 text-lg font-light">
                  Go to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

// ============================================
// UPDATE App.jsx - Add Route
// ============================================

/*
Add this import:
import ForgotPasswordPage from './pages/ForgotPasswordPage';

Add this route:
<Route path="/forgot-password" element={<ForgotPasswordPage />} />
*/