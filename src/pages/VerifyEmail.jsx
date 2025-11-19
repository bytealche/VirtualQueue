import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { apiRequest } from "../services/apiClient";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();

  const [message, setMessage] = useState("Verifying your email...");
  const [status, setStatus] = useState("loading"); // loading, success, error

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (!token) {
      setMessage("Invalid verification link.");
      setStatus("error");
      return;
    }

    verifyEmail(token);
  }, []);

  const verifyEmail = async (token) => {
    setMessage("Verifying...");
    setStatus("loading");

    const res = await apiRequest(
      "/auth/verify-email",
      "GET",
      null,
      false,
      token // IMPORTANT: custom token for verification
    );

    if (res.success) {
      setMessage("Email verified successfully! Redirecting to login...");
      setStatus("success");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } else {
      setMessage(res.message || "Email verification failed.");
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary text-center px-6">
      <div className="glass-card p-10 max-w-lg w-full">
        <h2 className="text-3xl mb-4" style={{ fontWeight: 200 }}>
          Email Verification
        </h2>

        {status === "loading" && (
          <div className="text-lg" style={{ fontWeight: 300 }}>
            🔄 {message}
          </div>
        )}

        {status === "success" && (
          <div className="text-lg text-green-400" style={{ fontWeight: 300 }}>
            ✅ {message}
          </div>
        )}

        {status === "error" && (
          <div className="text-lg text-red-400" style={{ fontWeight: 300 }}>
            ❌ {message}
          </div>
        )}
      </div>
    </div>
  );
}
