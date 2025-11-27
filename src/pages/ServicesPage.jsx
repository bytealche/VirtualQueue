// ServicesPage.js — Bright Glass Nav + Separate Navigation + Auth Protected

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { providerAPI } from "../services/provider";
import { useApp } from "../context/AppContext";

export default function ServicesPage() {
  const { user, loading, logout } = useApp();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [providers, setProviders] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);

  // AUTH PROTECTION
  useEffect(() => {
    if (loading) return;
    if (!user) navigate("/login");
  }, [loading, user, navigate]);

  // LOAD PROVIDERS
  useEffect(() => {
    const loadProviders = async () => {
      try {
        const list = await providerAPI.getProviders();
        const providerList = Object.values(list).filter(
          (item) => item && typeof item === "object" && item.id
        );
        setProviders(providerList);
      } catch (e) {
        console.error("Failed to load providers", e);
      } finally {
        setPageLoading(false);
      }
    };
    loadProviders();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex justify-center items-center text-white">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary text-text-primary">
      {/* NAVIGATION — Bright HomePage-style Glass */}
      <nav className="fixed top-0 left-0 w-full z-50 glass-card border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/dashboard" className="hover:opacity-80 transition-opacity">
              <img
                src={`${import.meta.env.BASE_URL}/logo.svg`}
                alt="Logo"
                className="h-11 w-auto"
              />
            </Link>

            {/* DESKTOP NAV */}
            <div className="hidden md:flex items-center space-x-8">

              <Link
                to="/dashboard"
                className="text-text-secondary hover:text-white transition-colors font-light nav-link"
              >
                Dashboard
              </Link>

              <Link
                to="/queue-booking"
                className="text-text-secondary hover:text-white transition-colors font-light nav-link"
              >
                Bookings
              </Link>

              <Link
                to="/services"
                className="text-white transition-colors font-light nav-link"
              >
                Services
              </Link>

              <div className="flex items-center space-x-4 border-l border-white/10 pl-6 ml-6">
                <div className="text-right">
                  <p className="text-sm">{user.name}</p>
                  <p className="text-xs text-text-secondary">{user.email}</p>
                </div>

                <button onClick={handleLogout} className="btn-outline-white py-2 px-4 text-sm">
                  Logout
                </button>
              </div>
            </div>

            {/* MOBILE MENU BUTTON */}
            <button
              className="md:hidden text-text-primary"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {!menuOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>

          {/* MOBILE DRAWER */}
          {menuOpen && (
            <div
              className={`fixed top-20 right-0 h-[calc(100vh-5rem)] w-64 bg-[#0f0f0f]/90 backdrop-blur-xl z-50 transform transition-transform duration-300 md:hidden ${
                menuOpen ? "translate-x-0" : "translate-x-full"
              }`}
            >
              <div className="flex flex-col h-full">
                <nav className="flex-1 overflow-y-auto p-6 space-y-4 mt-6">

                  <Link
                    to="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="block py-3 px-4 rounded-lg hover:bg-white/5 transition-colors font-light"
                  >
                    Dashboard
                  </Link>

                  <Link
                    to="/queue-booking"
                    onClick={() => setMenuOpen(false)}
                    className="block py-3 px-4 rounded-lg hover:bg-white/5 transition-colors font-light"
                  >
                    Bookings
                  </Link>

                  <Link
                    to="/services"
                    onClick={() => setMenuOpen(false)}
                    className="block py-3 px-4 rounded-lg hover:bg-white/5 transition-colors font-light"
                  >
                    Services
                  </Link>

                  {/* USER INFO */}
                  <div className="mt-6 p-4 rounded-lg bg-white/5">
                    <p className="text-sm">{user.name}</p>
                    <p className="text-xs text-text-secondary">{user.email}</p>
                  </div>
                </nav>

                {/* FOOTER */}
                <div className="p-6 border-t border-white/10">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full btn-outline-white py-3 text-center"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* PAGE CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <h1 className="text-4xl mb-6" style={{ fontWeight: 200 }}>
          Available{" "}
          <span className="bg-gradient-accent bg-clip-text text-transparent">Services</span>
        </h1>

        {pageLoading ? (
          <div className="text-text-secondary">Loading services…</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.map((p) => (
              <div key={p.id} className="glass-card p-6 glow-hover">
                <h2 className="text-xl mb-2" style={{ fontWeight: 200 }}>
                  {p.business_name}
                </h2>
                <p className="text-text-secondary text-sm mb-2">{p.business_type}</p>
                <p className="text-text-secondary text-sm">📍 {p.address}</p>

                <Link
                  to="/queue-booking"
                  state={{ providerId: p.id }}
                  className="btn-gradient mt-4 inline-block"
                >
                  Book Queue
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* NAV-LINK ANIMATION STYLE */}
      <style>{`
        .nav-link {
          position: relative;
          padding-bottom: 4px;
        }
        .nav-link::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(135deg, #24fb94 0%, #13c0bd 100%);
          transition: width 0.3s ease;
        }
        .nav-link:hover::after {
          width: 100%;
        }
      `}</style>
    </div>
  );
}
