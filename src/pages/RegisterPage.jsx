import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";

const RegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useApp();
  const [searchParams] = useSearchParams();

  // URL type (sync)
  const typeFromUrl = searchParams.get("type");
  const [userType, setUserType] = useState(typeFromUrl || "customer");

  useEffect(() => {
    if (typeFromUrl && typeFromUrl !== userType) setUserType(typeFromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFromUrl]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    countryCode: "+91",
    phone: "",
    businessName: "",
    businessType: "",
    address: "",
  });

  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const countryCodes = [
    { code: "+91", country: "India", flag: "🇮🇳" },
    { code: "+1", country: "USA", flag: "🇺🇸" },
    { code: "+44", country: "UK", flag: "🇬🇧" },
    { code: "+61", country: "Australia", flag: "🇦🇺" },
    { code: "+971", country: "UAE", flag: "🇦🇪" },
  ];

  // Phone input: store only digits, max 10
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const digits = value.replace(/\D/g, "");
      // limit to 10 digits (local number)
      setFormData((prev) => ({ ...prev, phone: digits.slice(0, 10) }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validatePhone = (phone) => {
    return phone.length === 10 && /^[6-9]\d{9}$/.test(phone);
  };

  const validatePassword = (password) => {
    // Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    return passwordRegex.test(password);
  };

  const getPasswordStrength = (password) => {
    if (!password) return null;
    if (password.length < 8) return { text: "Too short", color: "text-red-400" };
    if (!/(?=.*[a-z])/.test(password)) return { text: "Add lowercase", color: "text-orange-400" };
    if (!/(?=.*[A-Z])/.test(password)) return { text: "Add uppercase", color: "text-orange-400" };
    if (!/(?=.*\d)/.test(password)) return { text: "Add number", color: "text-orange-400" };
    if (!/(?=.*[@$!%*?&#])/.test(password)) return { text: "Add special char", color: "text-orange-400" };
    return { text: "Strong password", color: "text-green-400" };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validations
    if (!validatePhone(formData.phone)) {
      setToast({ show: true, message: "Please enter a valid 10-digit phone number", type: "error" });
      return;
    }

    if (!validatePassword(formData.password)) {
      setToast({
        show: true,
        message: "Password must be at least 8 characters with uppercase, lowercase, number and special character",
        type: "error",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setToast({ show: true, message: "Passwords do not match", type: "error" });
      return;
    }

    setLoading(true);

    // Build payload, include snake_case user_type as requested
    const payload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: `${formData.countryCode}${formData.phone}`,
      user_type: userType, // snake_case for backend
      business_name: formData.businessName || undefined,
      business_type: formData.businessType || undefined,
      address: formData.address || undefined,
    };

    try {
      const result = await register(payload);

      // Defensive checks
      if (!result || typeof result !== "object") {
        setToast({ show: true, message: "Unexpected server response", type: "error" });
        setLoading(false);
        return;
      }

      if (!result.success) {
        setToast({ show: true, message: result.message || "Registration failed", type: "error" });
        setLoading(false);
        return;
      }

      // Success
      setToast({ show: true, message: "Registration successful! Check your email to verify your account.", type: "success" });

      // Redirect after short delay; send user to dashboard (or provider-dashboard)
      setTimeout(() => {
        if (userType === "provider") {
          navigate("/provider-dashboard");
        } else {
          navigate("/dashboard");
        }
      }, 1000);
    } catch (err) {
      console.error("Registration error:", err);
      setToast({ show: true, message: err?.message || "Network error", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);

  // helper to update URL when toggling userType (keeps UX consistent)
  const updateTypeUrl = (type) => {
    // Use navigate to update query param without adding history entry
    navigate(`${location.pathname}?type=${type}`, { replace: true });
    setUserType(type);
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl" style={{ background: "linear-gradient(135deg, #24FB94 0%, #13C0BD 100%)" }} />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl" style={{ background: "linear-gradient(135deg, #13C0BD 0%, #24FB94 100%)" }} />
      </div>

      {/* Toast */}
      {toast.show && (
        <div className={`fixed top-5 right-5 z-50 toast toast-${toast.type}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {toast.type === "success" ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <p style={{ fontWeight: 300 }}>{toast.message}</p>
            </div>
            <button onClick={() => setToast({ show: false, message: "", type: "" })} className="ml-4 hover:opacity-70">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-2xl relative z-10">
        <div className="glass-card p-8 glow-hover">
          <div className="flex justify-center mb-8">
            <Link to="/">
              <img src={`${import.meta.env.BASE_URL}/logo.svg`} alt="QueMe" className="h-10 w-auto" />
            </Link>
          </div>

          <h2 className="text-3xl text-center mb-2" style={{ fontWeight: 200 }}>
            Create Account
          </h2>
          <p className="text-text-secondary text-center mb-8" style={{ fontWeight: 300 }}>
            Join QueMe and start saving time today
          </p>

          {/* User Type Toggle */}
          <div className="flex glass-card p-1 mb-8 max-w-md mx-auto">
            <button
              type="button"
              onClick={() => updateTypeUrl("customer")}
              className={`flex-1 py-3 px-6 rounded-lg transition-all ${userType === "customer" ? "text-primary" : "text-text-secondary hover:text-text-primary"}`}
              style={{
                background: userType === "customer" ? "linear-gradient(135deg, #24FB94 0%, #13C0BD 100%)" : "transparent",
                fontWeight: 300,
              }}
            >
              Customer
            </button>

            <button
              type="button"
              onClick={() => updateTypeUrl("provider")}
              className={`flex-1 py-3 px-6 rounded-lg transition-all ${userType === "provider" ? "text-primary" : "text-text-secondary hover:text-text-primary"}`}
              style={{
                background: userType === "provider" ? "linear-gradient(135deg, #24FB94 0%, #13C0BD 100%)" : "transparent",
                fontWeight: 300,
              }}
            >
              Provider
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name & Phone */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm mb-2" style={{ fontWeight: 300 }}>
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
                <label className="block text-sm mb-2" style={{ fontWeight: 300 }}>
                  Phone Number
                </label>
                <div className="flex gap-2">
                  <select
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={handleChange}
                    className="px-2 py-3 rounded-lg focus:ring-2 focus:ring-accent-green w-24"
                    style={{ fontWeight: 300 }}
                  >
                    {countryCodes.map((c) => (
                      <option key={c.code} value={c.code} className="text-black">
                        {c.flag} {c.code}
                      </option>
                    ))}
                  </select>

                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="flex-1 px-4 py-3 rounded-lg focus:ring-2 focus:ring-accent-green"
                    placeholder="9876543210"
                    pattern="[0-9]*"
                    maxLength="10"
                    style={{ fontWeight: 300 }}
                    required
                  />
                </div>
                {formData.phone && !validatePhone(formData.phone) && (
                  <p className="text-red-400 text-xs mt-1">Enter valid 10-digit phone number (starting with 6-9)</p>
                )}
              </div>
            </div>

            {/* Email */}
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

            {/* Password + Confirm */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm mb-2" style={{ fontWeight: 300 }}>
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pr-12 rounded-lg focus:ring-2 focus:ring-accent-green"
                    placeholder="••••••••"
                    style={{ fontWeight: 300 }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary"
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

                {passwordStrength && <p className={`text-xs mt-1 ${passwordStrength.color}`}>{passwordStrength.text}</p>}
                <p className="text-xs text-text-secondary mt-1">Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char</p>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ fontWeight: 300 }}>
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pr-12 rounded-lg focus:ring-2 focus:ring-accent-green"
                    placeholder="••••••••"
                    style={{ fontWeight: 300 }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary"
                  >
                    {showConfirmPassword ? (
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

                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
                )}
              </div>
            </div>

            {/* Provider fields */}
            {userType === "provider" && (
              <div className="border-t border-gray-800 pt-6">
                <h3 className="text-xl mb-4" style={{ fontWeight: 200 }}>
                  Business Information
                </h3>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm mb-2" style={{ fontWeight: 300 }}>
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

                  <div>
                    <label className="block text-sm mb-2" style={{ fontWeight: 300 }}>
                      Business Type
                    </label>
                    <select
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-accent-green"
                      style={{ fontWeight: 300 }}
                      required={userType === "provider"}
                    >
                      <option value="" className="text-black">Select type</option>
                      <option value="banking" className="text-black">Banking</option>
                      <option value="healthcare" className="text-black">Healthcare</option>
                      <option value="government" className="text-black">Government Services</option>
                      <option value="retail" className="text-black">Retail</option>
                      <option value="restaurant" className="text-black">Restaurant</option>
                      <option value="salon" className="text-black">Salon & Spa</option>
                      <option value="other" className="text-black">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm mb-2" style={{ fontWeight: 300 }}>
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
            )}

            <button type="submit" disabled={loading} className="w-full btn-gradient py-3 text-lg disabled:opacity-50" style={{ fontWeight: 300 }}>
              {loading ? (
                <span className="flex items-center justify-center">
                  <span className="spinner-small mr-2" />
                  Creating Account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-800" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-secondary text-text-secondary" style={{ fontWeight: 300 }}>
                Already have an account?
              </span>
            </div>
          </div>

          <Link to={`/login?type=${userType}`} className="block w-full btn-outline py-3 text-center text-lg font-light">
            Login
          </Link>

          <div className="text-center mt-6">
            <Link to="/" className="text-sm text-text-secondary hover:text-accent-green transition-colors font-light">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
