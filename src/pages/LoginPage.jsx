import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useApp } from "../context/AppContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useApp();
  const [searchParams] = useSearchParams();

  // Get role from URL
  const typeFromUrl = searchParams.get("type");

  // Maintain selected role
  const [userType, setUserType] = useState(typeFromUrl || "customer");

  // Sync with URL if changed
  useEffect(() => {
    if (typeFromUrl && typeFromUrl !== userType) {
      setUserType(typeFromUrl);
    }
  }, [typeFromUrl]);

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Toast + Loader
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
      setToast({ show: true, message: "Please fill in all fields", type: "error" });
      return;
    }

    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);

      // Guard: backend must return result object
      if (!result || typeof result !== "object") {
        setToast({ show: true, message: "Unexpected server response", type: "error" });
        return;
      }

      if (!result.success) {
        setToast({
          show: true,
          message: result.message || "Login failed",
          type: "error",
        });
        return;
      }

      // Guard: user must be returned
      if (!result.user || typeof result.user !== "object") {
        setToast({
          show: true,
          message: "Malformed user data returned",
          type: "error",
        });
        return;
      }

      // Extract user role from backend
      const backendRole = result.user.user_type; // snake_case confirmed

      if (!backendRole) {
        setToast({
          show: true,
          message: "User role not returned by server",
          type: "error",
        });
        return;
      }

      // Prevent wrong login type (customer trying provider and vice versa)
      if (backendRole !== userType) {
        setToast({
          show: true,
          message: "User not found",
          type: "error",
        });
        return;
      }

      // Success
      setToast({ show: true, message: "Login successful!", type: "success" });

      // Redirect
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
      {/* Background Glow */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-accent rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-accent-reverse rounded-full blur-3xl"></div>
      </div>

      {/* Toast */}
      {toast.show && (
        <div className={`fixed top-5 right-5 z-50 toast toast-${toast.type} animate-slideIn`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {toast.type === "success" && (
                <svg className="w-6 h-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <p className="font-light">{toast.message}</p>
            </div>
            <button onClick={() => setToast({ show: false, message: "", type: "" })}>
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
              <img
                src={`${import.meta.env.BASE_URL}/logo.svg`}
                alt="QueMe Logo"
                className="h-10 w-auto"
              />
            </Link>
          </div>

          <h2 className="text-3xl font-extralight text-center mb-2">Welcome Back</h2>
          <p className="text-text-secondary text-center mb-8 font-light">Login to continue to your account</p>

          {/* User Type Toggle */}
          <div className="flex glass-card p-1 mb-6">
            <button
              type="button"
              onClick={() => {
                setUserType("customer");
                navigate(`${location.pathname}?type=customer`);
              }}
              className={`flex-1 py-3 px-6 rounded-lg transition-all ${
                userType === "customer"
                  ? "text-primary"
                  : "text-text-secondary hover:text-text-primary"
              }`}
              style={{
                background:
                  userType === "customer"
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
                setUserType("provider");
                navigate(`${location.pathname}?type=provider`);
              }}
              className={`flex-1 py-3 px-6 rounded-lg transition-all ${
                userType === "provider"
                  ? "text-primary"
                  : "text-text-secondary hover:text-text-primary"
              }`}
              style={{
                background:
                  userType === "provider"
                    ? "linear-gradient(135deg, #24FB94 0%, #13C0BD 100%)"
                    : "transparent",
                fontWeight: 300,
              }}
            >
              Provider
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
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
                placeholder="email@example.com"
                required
              />
            </div>

            {/* Password + Toggle */}
            <div>
              <label htmlFor="password" className="block text-sm font-light mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-12 rounded-lg focus:ring-2 focus:ring-accent-green font-light"
                  placeholder="••••••••"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-gray-600 text-accent-green focus:ring-accent-green"
                />
                <span className="text-sm text-text-secondary font-light">
                  Remember me
                </span>
              </label>

              <Link to="/forgot-password" className="text-sm text-accent-green hover:text-accent-cyan">
                Forgot password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-gradient py-3 text-lg font-light disabled:opacity-50"
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

          {/* Divider */}
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

          {/* Register Redirect */}
          <Link
            to={`/register?type=${userType}`}
            className="block w-full btn-outline py-3 text-center text-lg font-light"
          >
            Create Account
          </Link>

          {/* Back to Home */}
          <div className="text-center mt-6">
            <Link to="/" className="text-sm text-text-secondary hover:text-accent-green">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
