import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/auth";
import { providerAPI } from "../services/provider";

const AppContext = createContext();
export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  // user = undefined → loading
  // user = null → not logged in
  // user = object → logged in
  const [user, setUser] = useState(undefined);
  const [loading, setLoading] = useState(true);

  const [providers, setProviders] = useState([]);

  // ============================================================
  // INIT — Restore session + preload provider list
  // ============================================================
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

    // No saved session → user is logged out
    if (!token || !savedUser) {
      setUser(null);
      setLoading(false);
      return;
    }

    const parsedUser = JSON.parse(savedUser);

    try {
      // If provider → verify token by requesting profile
      if (parsedUser.user_type === "provider") {
        const profile = await providerAPI.profile(); // MUST return valid JWT info
        setUser(profile);

        // Save providerId for dashboard (optional but useful)
        localStorage.setItem("providerId", profile.id);
      }

      // Customer (temporarily use stored data until you add /customer/profile)
      else {
        setUser(parsedUser);
      }
    } catch (err) {
      console.error("Session restore failed:", err);
      logout(); // auto-logout on token failure
    }

    setLoading(false);
  };

  // ============================================================
  // LOAD PROVIDERS LIST (Public)
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

      return { success: true };
    } catch {
      return { success: false, message: "Server error" };
    }
  };

  // ============================================================
  // REGISTER
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

      if (response.success) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));

        if (response.user.user_type === "provider") {
          localStorage.setItem("providerId", response.user.id);
        }

        setUser(response.user);
      }

      return response;
    } catch {
      return { success: false, message: "Registration failed" };
    }
  };

  // ============================================================
  // LOGOUT — MUST remove providerId also
  // ============================================================
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("providerId"); // 🔥 REQUIRED FIX
    setUser(null);
  };

  // ============================================================
  // PROVIDE GLOBAL VALUES
  // ============================================================
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
