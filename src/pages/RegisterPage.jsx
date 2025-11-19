import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useApp();

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialType = params.get("type") || "customer";

  const [userType, setUserType] = useState(initialType);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    businessName: "",
    businessType: "",
    address: "",
  });

  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setToast({
        show: true,
        message: "Passwords do not match",
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

    setLoading(true);

    const userData = {
      ...formData,
      userType,
    };

    const result = await register(userData);

    setLoading(false);

    if (result.success) {
      // NEW MESSAGE FOR EMAIL VERIFICATION
      setToast({
        show: true,
        message:
          "Registration successful! Check your email to verify your account.",
        type: "success",
      });

      // Redirect user to login after 2 sec
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } else {
      setToast({
        show: true,
        message: result.message || "Registration failed",
        type: "error",
      });
    }
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div
          className="absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl"
          style={{
            background: "linear-gradient(135deg, #24FB94 0%, #13C0BD 100%)",
          }}
        ></div>
        <div
          className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl"
          style={{
            background: "linear-gradient(135deg, #13C0BD 0%, #24FB94 100%)",
          }}
        ></div>
      </div>

      {toast.show && (
        <div className={`fixed top-5 right-5 z-50 toast toast-${toast.type}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {toast.type === "success" ? (
                <svg
                  className="w-6 h-6"
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
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
              <p style={{ fontWeight: 300 }}>{toast.message}</p>
            </div>
            <button
              onClick={() => setToast({ show: false, message: "", type: "" })}
              className="ml-4 hover:opacity-70"
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

      <div className="w-full max-w-2xl relative z-10">
        <div className="glass-card p-8 glow-hover">
          <div className="flex justify-center mb-8">
            <Link to="/">
              <img
                src={`${import.meta.env.BASE_URL}/logo.svg`}
                alt="QueMe"
                className="h-10 w-auto"
              />
            </Link>
          </div>

          <h2 className="text-3xl text-center mb-2" style={{ fontWeight: 200 }}>
            Create Account
          </h2>
          <p
            className="text-text-secondary text-center mb-8"
            style={{ fontWeight: 300 }}
          >
            Join QueMe and start saving time today
          </p>

          <div className="flex glass-card p-1 mb-8 max-w-md mx-auto">
            <button
              onClick={() => {
                setUserType("customer");
                navigate("/register?type=customer", { replace: true });
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
              onClick={() => {
                setUserType("provider");
                navigate("/register?type=provider", { replace: true });
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label
                  className="block text-sm mb-2"
                  style={{ fontWeight: 300 }}
                >
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-accent-green"
                  placeholder="John Doe"
                  style={{ fontWeight: 300 }}
                  required
                />
              </div>
              <div>
                <label
                  className="block text-sm mb-2"
                  style={{ fontWeight: 300 }}
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-accent-green"
                  placeholder="+91 98765 43210"
                  style={{ fontWeight: 300 }}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ fontWeight: 300 }}>
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-accent-green"
                placeholder="your@email.com"
                style={{ fontWeight: 300 }}
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label
                  className="block text-sm mb-2"
                  style={{ fontWeight: 300 }}
                >
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-accent-green"
                  placeholder="••••••••"
                  style={{ fontWeight: 300 }}
                  required
                />
              </div>
              <div>
                <label
                  className="block text-sm mb-2"
                  style={{ fontWeight: 300 }}
                >
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-accent-green"
                  placeholder="••••••••"
                  style={{ fontWeight: 300 }}
                  required
                />
              </div>
            </div>

            {userType === "provider" && (
              <>
                <div className="border-t border-gray-800 pt-6">
                  <h3 className="text-xl mb-4" style={{ fontWeight: 200 }}>
                    Business Information
                  </h3>

                  <div className="space-y-6">
                    <div>
                      <label
                        className="block text-sm mb-2"
                        style={{ fontWeight: 300 }}
                      >
                        Business Name
                      </label>
                      <input
                        type="text"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-accent-green"
                        placeholder="My Business"
                        style={{ fontWeight: 300 }}
                        required={userType === "provider"}
                      />
                    </div>

                    <div className="mt-4">
                      <label
                        className="block text-sm mb-2"
                        style={{ fontWeight: 300 }}
                      >
                        Business Type
                      </label>
                      <select
                        name="businessType"
                        value={formData.businessType}
                        onChange={handleChange}
                        className="w-full p-3 rounded-lg bg-secondary text-text-primary"
                        style={{ fontWeight: 300 }}
                        required={userType === "provider"}
                      >
                        <option value="" className="text-black">
                          Select type
                        </option>
                        <option value="banking" className="text-black">
                          Banking
                        </option>
                        <option value="healthcare" className="text-black">
                          Healthcare
                        </option>
                        <option value="government" className="text-black">
                          Government Services
                        </option>
                        <option value="retail" className="text-black">
                          Retail
                        </option>
                        <option value="restaurant" className="text-black">
                          Restaurant
                        </option>
                        <option value="salon" className="text-black">
                          Salon & Spa
                        </option>
                        <option value="other" className="text-black">
                          Other
                        </option>
                      </select>
                    </div>

                    <div>
                      <label
                        className="block text-sm mb-2"
                        style={{ fontWeight: 300 }}
                      >
                        Business Address
                      </label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        rows="3"
                        className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-accent-green"
                        placeholder="Full business address"
                        style={{ fontWeight: 300 }}
                        required={userType === "provider"}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-gradient py-3 text-lg disabled:opacity-50"
              style={{ fontWeight: 300 }}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <span className="spinner-small mr-2"></span>
                  Creating Account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span
                className="px-4 bg-secondary text-text-secondary"
                style={{ fontWeight: 300 }}
              >
                Already have an account?
              </span>
            </div>
          </div>

          <Link
            to="/login"
            className="block w-full btn-outline py-3 text-center text-lg font-light"
          >
            Login
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
    </div>
  );
};

export default RegisterPage;
