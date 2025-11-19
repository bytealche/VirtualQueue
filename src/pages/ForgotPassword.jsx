import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL;

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [loading, setLoading] = useState(false);

  const showToast = (message, type = "error") => {
    setToast({ show: true, message, type });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      showToast("Please enter your email.", "error");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(`${API_BASE}/auth/forgot-password`, {
        email,
      });

      showToast(res.data.message, "success");
    } catch (err) {
      if (err.response) {
        const msg = err.response.data.message;

        if (err.response.status === 403 && err.response.data.needs_verification) {
          showToast("Your email is not verified. Verification link has been sent.", "error");
          return;
        }

        if (err.response.status === 404) {
          showToast("Email not found in our system.", "error");
          return;
        }
      }

      showToast("Something went wrong. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-4 py-12 relative overflow-hidden">
      
      {/* Blurred gradient background (same as login) */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-accent rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-accent-reverse rounded-full blur-3xl"></div>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed top-5 right-5 z-50 toast toast-${toast.type} animate-slideIn`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">

              {toast.type === "success" && (
                <svg
                  className="w-6 h-6 flex-shrink-0 text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}

              {toast.type === "error" && (
                <svg
                  className="w-6 h-6 text-red-400 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}

              <p className="font-light">{toast.message}</p>
            </div>

            <button
              onClick={() => setToast({ show: false, message: "", type: "" })}
              className="ml-4 hover:opacity-70 transition-opacity"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Card */}
      <div className="w-full max-w-md relative z-10">
        <div className="glass-card p-8 glow-hover">

          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Link to="/" className="hover:opacity-80 transition-opacity">
              <img
                src={`${import.meta.env.BASE_URL}/logo.svg`}
                alt="QueMe Logo"
                className="h-10 w-auto"
              />
            </Link>
          </div>

          <h2 className="text-3xl font-extralight text-center mb-2">
            Forgot Password?
          </h2>
          <p className="text-text-secondary text-center mb-8 font-light">
            Enter your email to receive a reset link
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-light mb-2">
                Email Address
              </label>
              <input
                type="email"
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-accent-green font-light"
                placeholder="your@email.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-gradient py-3 text-lg font-light disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <div className="text-center mt-8">
            <Link
              to="/login"
              className="text-sm text-text-secondary hover:text-accent-green transition-colors font-light"
            >
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0); opacity: 1; }
        }
        .animate-slideIn { animation: slideIn 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default ForgotPasswordPage;
