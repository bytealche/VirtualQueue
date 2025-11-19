import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { login } = useApp();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    userType: "customer", // Add user type
    rememberMe: false,
  });

  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setToast({
        show: true,
        message: "Please fill in all fields",
        type: "error",
      });
      return;
    }

    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);

      // defensive: ensure result exists and has expected shape
      if (!result || typeof result !== "object") {
        setToast({
          show: true,
          message: "Unexpected server response",
          type: "error",
        });
        return;
      }

      // if backend returned success === false
      if (!result.success) {
        setToast({
          show: true,
          message: result.message || "Login failed",
          type: "error",
        });
        return;
      }

      // defensive: ensure result.user exists
      if (!result.user || typeof result.user !== "object") {
        setToast({
          show: true,
          message: "Malformed user data returned",
          type: "error",
        });
        return;
      }

      // backend uses snake_case: user_type
      const backendRole = result.user.user_type;
      const selectedRole = formData.userType;

      // missing role from backend
      if (!backendRole) {
        setToast({
          show: true,
          message: "User role not returned by server",
          type: "error",
        });
        return;
      }

      // block mismatched role selection
      if (backendRole !== selectedRole) {
        setToast({
          show: true,
          message: `User not found`,
          type: "error",
        });
        return;
      }

      // success: persist in context (your login probably already does), show toast, redirect
      setToast({ show: true, message: "Login successful!", type: "success" });

      // short delay for UX
      setTimeout(() => {
        if (backendRole === "provider") {
          navigate("/provider-dashboard");
        } else {
          navigate("/dashboard");
        }
      }, 700);
    } catch (err) {
      console.error("Login error:", err);
      setToast({
        show: true,
        message: err?.message || "Network error",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-accent rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-accent-reverse rounded-full blur-3xl"></div>
      </div>

      {toast.show && (
        <div
          className={`fixed top-5 right-5 z-50 toast toast-${toast.type} animate-slideIn`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {toast.type === "success" && (
                <svg
                  className="w-6 h-6 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
              <p className="font-light">{toast.message}</p>
            </div>
            <button
              onClick={() => setToast({ show: false, message: "", type: "" })}
              className="ml-4 hover:opacity-70 transition-opacity"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-md relative z-10">
        <div className="glass-card p-8 glow-hover">
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
            Welcome Back
          </h2>
          <p className="text-text-secondary text-center mb-8 font-light">
            Login to continue to your account
          </p>

          {/* User Type Toggle */}
          <div className="flex glass-card p-1 mb-6">
            <button
              type="button"
              onClick={() => {
                setFormData((prev) => ({ ...prev, userType: "customer" }));
                navigate(`${location.pathname}?type=customer`);
              }}
              className={`flex-1 py-3 px-6 rounded-lg transition-all ${
                formData.userType === "customer"
                  ? "text-primary"
                  : "text-text-secondary hover:text-text-primary"
              }`}
              style={{
                background:
                  formData.userType === "customer"
                    ? "linear-gradient(135deg, #24FB94 0%, #13C0BD 100%)"
                    : "transparent",
                fontWeight: 300,
              }}
            >
              Customer
            </button>

            <button
              type="button"
              onClick={() => {
                setFormData((prev) => ({ ...prev, userType: "provider" }));
                navigate(`${location.pathname}?type=provider`);
              }}
              className={`flex-1 py-3 px-6 rounded-lg transition-all ${
                formData.userType === "provider"
                  ? "text-primary"
                  : "text-text-secondary hover:text-text-primary"
              }`}
              style={{
                background:
                  formData.userType === "provider"
                    ? "linear-gradient(135deg, #24FB94 0%, #13C0BD 100%)"
                    : "transparent",
                fontWeight: 300,
              }}
            >
              Provider
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-light mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-accent-green font-light"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-light mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-accent-green font-light"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-gray-600 text-accent-green focus:ring-accent-green focus:ring-2"
                />
                <span className="text-sm text-text-secondary font-light">
                  Remember me
                </span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-accent-green hover:text-accent-cyan transition-colors font-light"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-gradient py-3 text-lg font-light disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <span className="spinner-small mr-2"></span>
                  Logging in...
                </span>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-secondary text-text-secondary font-light">
                Don't have an account?
              </span>
            </div>
          </div>

          <Link
            to="/register"
            className="block w-full btn-outline py-3 text-center text-lg font-light"
          >
            Create Account
          </Link>

          <div className="text-center mt-6">
            <Link
              to="/"
              className="text-sm text-text-secondary hover:text-accent-green transition-colors font-light"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
