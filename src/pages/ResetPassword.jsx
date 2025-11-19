import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL;

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setToast({
        show: true,
        message: "Invalid or expired password reset link.",
        type: "error",
      });
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.password || !formData.confirmPassword) {
      setToast({
        show: true,
        message: "Please fill in all fields",
        type: "error",
      });
      return;
    }

    if (formData.password.length < 6) {
      setToast({
        show: true,
        message: "Password must be at least 6 characters",
        type: "error",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setToast({
        show: true,
        message: "Passwords do not match",
        type: "error",
      });
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(`${API_BASE}/auth/reset-password`, {
        token,
        password: formData.password,
      });

      setToast({
        show: true,
        message: "Password reset successful! Redirecting...",
        type: "success",
      });

      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong.";
      setToast({ show: true, message: msg, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-4 py-12 relative overflow-hidden">

      {/* BLURRED GRADIENT BACKGROUND (same as login) */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-accent rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-accent-reverse rounded-full blur-3xl"></div>
      </div>

      {/* TOAST NOTIFICATION (same design as login) */}
      {toast.show && (
        <div className={`fixed top-5 right-5 z-50 toast toast-${toast.type} animate-slideIn`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {toast.type === "success" && (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}

              {toast.type === "error" && (
                <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}

              <p className="font-light">{toast.message}</p>
            </div>

            <button
              onClick={() => setToast({ show: false, message: "", type: "" })}
              className="ml-4 hover:opacity-70 transition-opacity"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-md relative z-10">
        <div className="glass-card p-8 glow-hover">

          {/* LOGO */}
          <div className="flex justify-center mb-8">
            <Link to="/" className="hover:opacity-80 transition-opacity">
              <img
                src={`${import.meta.env.BASE_URL}/logo.svg`}
                alt="QueMe Logo"
                className="h-10 w-auto"
              />
            </Link>
          </div>

          <h2 className="text-3xl font-extralight text-center mb-2">Reset Your Password</h2>
          <p className="text-text-secondary text-center mb-8 font-light">
            Enter a new password to continue
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-light mb-2">New Password</label>
              <input
                type="password"
                name="password"
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-accent-green font-light"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-light mb-2">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-accent-green font-light"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-gradient py-3 text-lg font-light disabled:opacity-50"
            >
              {loading ? "Updating..." : "Reset Password"}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-secondary text-text-secondary font-light">
                Remembered your password?
              </span>
            </div>
          </div>

          <Link to="/login" className="block w-full btn-outline py-3 text-center text-lg font-light">
            Back to Login
          </Link>

          <div className="text-center mt-6">
            <Link to="/" className="text-sm text-text-secondary hover:text-accent-green transition-colors font-light">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0); opacity: 1; }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ResetPasswordPage;
