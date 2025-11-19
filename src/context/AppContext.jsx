import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/auth";
import { providerAPI } from "../services/provider";

const AppContext = createContext();
export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(undefined); // undefined = checking session
  const [loading, setLoading] = useState(true);

  const [providers, setProviders] = useState([]);

  useEffect(() => {
    restoreAuth();
    loadProviders();
  }, []);

  // ============================================================
  // RESTORE SESSION FROM LOCALSTORAGE
  // ============================================================
  const restoreAuth = async () => {
    setLoading(true);

    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    // No saved session
    if (!token || !savedUser) {
      setUser(null);
      setLoading(false);
      return;
    }

    let parsedUser;
    try {
      parsedUser = JSON.parse(savedUser);
    } catch (err) {
      console.warn("Invalid user JSON, clearing session.");
      logout();
      setLoading(false);
      return;
    }

    try {
      // Provider — refresh profile
      if (parsedUser.user_type === "provider") {
        const profile = await providerAPI.profile();
        setUser(profile);
        localStorage.setItem("providerId", profile.id);
      } else {
        // Customer — keep stored session (until you add /customer/profile)
        setUser(parsedUser);
      }
    } catch (err) {
      console.error("Session restore failed:", err);
      logout();
    }

    setLoading(false);
  };

  // ============================================================
  // LOAD PROVIDERS LIST
  // ============================================================
  const loadProviders = async () => {
    try {
      const data = await providerAPI.getProviders();
      if (Array.isArray(data)) setProviders(data);
    } catch (err) {
      console.error("Provider fetch error:", err);
    }
  };

  // ============================================================
  // LOGIN
  // ============================================================
 const login = async (email, password) => {
  try {
    const response = await authAPI.login({ email, password });

    if (!response.success) {
      return { success: false, message: response.message };
    }

    const userData = response.user;

    // Save session
    localStorage.setItem("token", response.token);
    localStorage.setItem("user", JSON.stringify(userData));

    if (userData.user_type === "provider") {
      localStorage.setItem("providerId", userData.id);
    }

    setUser(userData);

    // 🔥 MUST return userData to LoginPage
    return { success: true, user: userData };

  } catch {
    return { success: false, message: "Server error" };
  }
};


  // ============================================================
  // REGISTER (updated for email verification)
  // ============================================================
  const register = async (form) => {
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        user_type: form.userType,
        business_name: form.businessName,
        business_type: form.businessType,
        address: form.address,
      };

      const response = await authAPI.register(payload);

      // ❗ Email verification returns ONLY success + message
      // NO USER, NO TOKEN — DO NOT STORE ANYTHING

      return response; 
    } catch {
      return { success: false, message: "Registration failed" };
    }
  };

  // ============================================================
  // LOGOUT
  // ============================================================
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("providerId");
    setUser(null);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        loading,
        providers,
        login,
        register,
        logout,
        setProviders,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
