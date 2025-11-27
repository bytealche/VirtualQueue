import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

/** Robust scroll helper that accounts for fixed navbar height */
function scrollToSectionById(id) {
  if (!id) return;
  // element may not exist immediately if React is still mounting; try a few times
  const tryScroll = () => {
    const el = document.getElementById(id);
    if (!el) return false;
    // compute offset for fixed nav (adjust if your nav height differs)
    const nav = document.querySelector("nav");
    const navHeight = nav ? nav.getBoundingClientRect().height : 80; // fallback 80px
    const top =
      el.getBoundingClientRect().top + window.pageYOffset - navHeight - 12; // extra spacing
    window.scrollTo({ top, behavior: "smooth" });
    return true;
  };

  // Try immediately, if not found retry a few times (useful when navigating to route first)
  if (!tryScroll()) {
    let attempts = 0;
    const idInt = setInterval(() => {
      attempts += 1;
      if (tryScroll() || attempts > 20) clearInterval(idInt);
    }, 100);
  }
}

/** Unified click handler */
function handleAnchorClick(e, id) {
  e.preventDefault();
  // if we're on another route (HashRouter), navigate to home first then scroll
  const isHome =
    window.location.hash === "" ||
    window.location.hash === "#/" ||
    window.location.pathname === "/";
  if (isHome) {
    scrollToSectionById(id);
  } else {
    // Go to home route then scroll after small delay
    window.location.hash = "/";
    setTimeout(() => scrollToSectionById(id), 450); // wait for Home to render
  }
}

const HomePage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [menuOpen, setMenuOpen] = useState(false);

  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path
            fillRule="evenodd"
            d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z"
            clipRule="evenodd"
          />
        </svg>
      ),
      title: "Save Time",
      description: "Skip physical queues and join remotely from anywhere",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path
            fillRule="evenodd"
            d="M5.25 9a6.75 6.75 0 0113.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 01-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 11-7.48 0 24.585 24.585 0 01-4.831-1.244.75.75 0 01-.298-1.205A8.217 8.217 0 005.25 9.75V9zm4.502 8.9a2.25 2.25 0 104.496 0 25.057 25.057 0 01-4.496 0z"
            clipRule="evenodd"
          />
        </svg>
      ),
      title: "Real-time Alerts",
      description:
        "Get notified when your turn approaches via SMS, Email or App",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75zM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 01-1.875-1.875V8.625zM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 013 19.875v-6.75z" />
        </svg>
      ),
      title: "Track Progress",
      description: "Monitor your position and estimated wait time in real-time",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10.5 18.75a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3z" />
          <path
            fillRule="evenodd"
            d="M8.625.75A3.375 3.375 0 005.25 4.125v15.75a3.375 3.375 0 003.375 3.375h6.75a3.375 3.375 0 003.375-3.375V4.125A3.375 3.375 0 0015.375.75h-6.75zM7.5 4.125C7.5 3.504 8.004 3 8.625 3H9.75v.375c0 .621.504 1.125 1.125 1.125h2.25c.621 0 1.125-.504 1.125-1.125V3h1.125c.621 0 1.125.504 1.125 1.125v15.75c0 .621-.504 1.125-1.125 1.125h-6.75A1.125 1.125 0 017.5 19.875V4.125z"
            clipRule="evenodd"
          />
        </svg>
      ),
      title: "Mobile Friendly",
      description: "Access from any device - desktop, tablet or mobile phone",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path
            fillRule="evenodd"
            d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08zm3.094 8.016a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
            clipRule="evenodd"
          />
        </svg>
      ),
      title: "Safe & Secure",
      description: "Your data is protected with industry-standard security",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
        </svg>
      ),
      title: "Multi-Queue",
      description: "Manage multiple bookings across different services",
    },
  ];

  const services = [
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11.584 2.376a.75.75 0 01.832 0l9 6a.75.75 0 11-.832 1.248L12 3.901 3.416 9.624a.75.75 0 01-.832-1.248l9-6z" />
          <path
            fillRule="evenodd"
            d="M20.25 10.332v9.918H21a.75.75 0 010 1.5H3a.75.75 0 010-1.5h.75v-9.918a.75.75 0 01.634-.74A49.109 49.109 0 0112 9c2.59 0 5.134.202 7.616.592a.75.75 0 01.634.74zm-7.5 2.418a.75.75 0 00-1.5 0v6.75a.75.75 0 001.5 0v-6.75zm3-.75a.75.75 0 01.75.75v6.75a.75.75 0 01-1.5 0v-6.75a.75.75 0 01.75-.75zM9 12.75a.75.75 0 01.75.75v6.75a.75.75 0 01-1.5 0v-6.75A.75.75 0 019 12.75z"
            clipRule="evenodd"
          />
        </svg>
      ),
      title: "Banking",
      description: "Account opening, loans, and investments",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
        </svg>
      ),
      title: "Healthcare",
      description: "Doctor appointments and lab tests",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path
            fillRule="evenodd"
            d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625zM7.5 15a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 017.5 15zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H8.25z"
            clipRule="evenodd"
          />
          <path d="M12.971 1.816A5.23 5.23 0 0114.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 013.434 1.279 9.768 9.768 0 00-6.963-6.963z" />
        </svg>
      ),
      title: "Government",
      description: "Passport services and licenses",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path
            fillRule="evenodd"
            d="M7.5 6v.75H5.513c-.96 0-1.764.724-1.865 1.679l-1.263 12A1.875 1.875 0 004.25 22.5h15.5a1.875 1.875 0 001.865-2.071l-1.263-12a1.875 1.875 0 00-1.865-1.679H16.5V6a4.5 4.5 0 10-9 0zM12 3a3 3 0 00-3 3v.75h6V6a3 3 0 00-3-3zm-3 8.25a3 3 0 106 0v-.75a.75.75 0 011.5 0v.75a4.5 4.5 0 11-9 0v-.75a.75.75 0 011.5 0v.75z"
            clipRule="evenodd"
          />
        </svg>
      ),
      title: "Retail",
      description: "Product pickups and returns",
    },
  ];

  const testimonials = [
    {
      name: "Rahul Sharma",
      role: "Business Owner",
      rating: 5,
      text: "QueMe has transformed how I manage appointments. No more waiting in long lines!",
    },
    {
      name: "Dr. Priya Verma",
      role: "Medical Practitioner",
      rating: 5,
      text: "This system has improved our efficiency significantly. Highly recommended!",
    },
    {
      name: "Anjali Patel",
      role: "Working Professional",
      rating: 5,
      text: "Simple, efficient, and saves so much time. Perfect for managing multiple appointments.",
    },
  ];

  return (
    <div className="min-h-screen bg-primary text-text-primary relative">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo - Updated with new QUEME logo */}
            <Link
              to="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <img
                src={`${import.meta.env.BASE_URL}/logo.svg`}
                alt="QueMe Logo"
                className="h-11 w-auto"
              />
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                onClick={(e) => handleAnchorClick(e, "features")}
                className="text-text-secondary hover:text-white transition-colors font-light nav-link"
              >
                FEATURES
              </a>
              <a
                href="#how-it-works"
                onClick={(e) => handleAnchorClick(e, "how-it-works")}
                className="text-text-secondary hover:text-white transition-colors font-light nav-link"
              >
                HOW IT WORKS
              </a>
              <a
                href="#services"
                onClick={(e) => handleAnchorClick(e, "services")}
                className="text-text-secondary hover:text-white transition-colors font-light nav-link"
              >
                SERVICES
              </a>
              <Link to="/login" className="btn-outline-white">
                LOGIN
              </Link>
              <Link to="/register" className="btn-gradient">
                START FOR FREE
              </Link>
            </div>

            <button
              className="md:hidden text-text-primary"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {!menuOpen ? (
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
                    d="M4 6h16M4 12h16M4 18h16"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
            
          </div>
          {menuOpen && (
  <div
    className={`
      fixed top-20 right-0 h-[calc(100vh-5rem)] w-64 bg-[#0f0f0f]/95 backdrop-blur-xl
 z-50
      transform transition-transform duration-300 ease-in-out md:hidden
      ${menuOpen ? "translate-x-0" : "translate-x-full"}
    `}
  >
    {/* Layout Wrapper */}
    <div className="flex flex-col h-full">

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-6 mt-10">
        <div className="space-y-4">

          <a
            href="#features"
            onClick={(e) => {
              setMenuOpen(false);
              handleAnchorClick(e, "features");
            }}
            className="block py-3 px-4 rounded-lg hover:bg-white/5 transition-colors font-light"
          >
            Features
          </a>

          <a
            href="#how-it-works"
            onClick={(e) => {
              setMenuOpen(false);
              handleAnchorClick(e, "how-it-works");
            }}
            className="block py-3 px-4 rounded-lg hover:bg-white/5 transition-colors font-light"
          >
            How It Works
          </a>

          <a
            href="#services"
            onClick={(e) => {
              setMenuOpen(false);
              handleAnchorClick(e, "services");
            }}
            className="block py-3 px-4 rounded-lg hover:bg-white/5 transition-colors font-light"
          >
            Services
          </a>

        </div>
      </nav>

      {/* Footer at Bottom */}
      <div className="p-6 border-t border-white/10">
        <div className="space-y-2">

          <Link
            to="/login"
            className="block w-full btn-outline-white py-3 text-center"
            onClick={() => setMenuOpen(false)}
          >
            Login
          </Link>

          <Link
            to="/register"
            className="block w-full btn-gradient py-3 text-center"
            onClick={() => setMenuOpen(false)}
          >
            Start For Free
          </Link>

        </div>
      </div>

    </div>
  </div>
)}

        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Gradient Ribbon */}
        <div className="absolute right-0.5 top-0 left-0 w-10/2 opacity-90 pointer-events-none">
          <img
            src={`${import.meta.env.BASE_URL}/div.png`}
            alt=""
            className="w-screen h-auto"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="fade-in">
              <h1 className="text-5xl md:text-6xl font-extralight leading-tight mb-6 text-white">
                Skip the Line,
                <br />
                Save Your Time
              </h1>
              <p className="text-xl text-text-secondary mb-8 leading-relaxed font-light">
                Join virtual queues remotely and get notified when it's your
                turn. No more waiting in physical lines!
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link
                  to="/register?type=customer"
                  className="btn-outline-white text-center"
                >
                  Join as Customer
                </Link>
                <Link
                  to="/register?type=provider"
                  className="btn-gradient text-center"
                >
                  Register as Provider
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-5 h-5 text-white flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-white font-light">
                    1000+ Active Users
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-5 h-5 text-white flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-white font-light">
                    500+ Service Providers
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-5 h-5 text-white flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-white font-light">
                    50K+ Queues Managed
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-5 h-5 text-white flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-white font-light">
                    95% Customer Satisfaction
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose QueMe Section */}
      <section id="features" className="py-20 relative overflow-hidden">
        {/* More transparent background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light mb-4 text-white">
              Why Choose QueMe ?
            </h2>
            <p className="text-xl text-text-secondary font-light">
              Modern queue management for modern businesses
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="glass-card p-6 glow-hover"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-light mb-3 text-white">
                  {feature.title}
                </h3>
                <p className="text-text-secondary leading-relaxed font-light">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light mb-4 text-white">
              How It Works ?
            </h2>
            <p className="text-xl text-text-secondary font-light">
              Get started in just 3 simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                num: "1",
                title: "Choose Service",
                desc: "Select from banking, healthcare, government services or retail",
              },
              {
                num: "2",
                title: "Book Your Slot",
                desc: "Reserve your position in the virtual queue. Choose date, time and notifications",
              },
              {
                num: "3",
                title: "Get Notified",
                desc: "Receive real-time updates and notifications when it's your turn. Arrive just in time!",
              },
            ].map((step, index) => (
              <div
                key={index}
                className="text-center fade-in"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="w-20 h-20 rounded-full flex items-center justify-center text-primary text-3xl font-light mx-auto mb-6 bg-white">
                  {step.num}
                </div>
                <h3 className="text-2xl font-light mb-4 text-white">
                  {step.title}
                </h3>
                <p className="text-text-secondary leading-relaxed font-light">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light mb-4 text-white">
              Our Services
            </h2>
            <p className="text-xl text-text-secondary font-light">
              We support a wide range of industries
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <div
                key={index}
                className="glass-card p-6 text-center glow-hover"
              >
                <div className="w-16 h-16 rounded-xl flex items-center justify-center text-white mx-auto mb-4">
                  {service.icon}
                </div>
                <h3 className="text-xl font-light mb-3 text-white">
                  {service.title}
                </h3>
                <p className="text-text-secondary font-light">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light mb-4 text-white">
              What Our Users Say
            </h2>
            <p className="text-xl text-text-secondary font-light">
              Real feedback from real people
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="glass-card p-6 glow-hover">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-white fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-text-secondary mb-4 leading-relaxed font-light">
                  "{testimonial.text}"
                </p>
                <div>
                  <div className="font-light text-white">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-text-secondary font-light">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="glass-card p-12 glow">
            <h2 className="text-4xl md:text-5xl font-light mb-6 text-white">
              Ready to Skip the Line?
            </h2>
            <p className="text-xl text-text-secondary mb-8 font-light">
              Join thousands of satisfied users who save time every day
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn-gradient">
                Sign Up Free
              </Link>
              <Link to="/login" className="btn-outline-white">
                Login Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Direct on gradient background */}
      <footer className="relative py-12">
        {/* Bottom Gradient Background - Full Width */}
        <div className="absolute inset-0 -z-10">
          <img
            src={`${import.meta.env.BASE_URL}/footer-gradient.png`}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              {/* Updated Logo */}
              <Link
                to="/"
                className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity"
              >
                <img
                  src={`${import.meta.env.BASE_URL}/logo.svg`}
                  alt="QueMe Logo"
                  className="h-11 w-auto"
                />
              </Link>
              <p className="text-text-secondary text-sm mt-4 leading-relaxed font-light">
                Making waiting lines a thing of the past. Join virtual queues
                and save your valuable time.
              </p>
            </div>
            <div>
              <h3 className="font-light mb-4 text-lg text-white">
                Quick Links
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#features"
                    onClick={(e) => handleAnchorClick(e, "features")}
                    className="text-text-secondary hover:text-white transition-colors font-light footer-link"
                  >
                    FEATURES
                  </a>
                </li>
                <li>
                  <a
                    href="#how-it-works"
                    onClick={(e) => handleAnchorClick(e, "how-it-works")}
                    className="text-text-secondary hover:text-white transition-colors font-light footer-link"
                  >
                    HOW IT WORKS
                  </a>
                </li>
                <li>
                  <a
                    href="#services"
                    onClick={(e) => handleAnchorClick(e, "services")}
                    className="text-text-secondary hover:text-white transition-colors font-light footer-link"
                  >
                    SERVICES
                  </a>
                </li>
                <li>
                  <Link
                    to="/login"
                    className="text-text-secondary hover:text-white transition-colors font-light footer-link"
                  >
                    Login
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-light mb-4 text-lg text-white">Support</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="text-text-secondary hover:text-white transition-colors font-light footer-link"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-text-secondary hover:text-white transition-colors font-light footer-link"
                  >
                    Contact Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-text-secondary hover:text-white transition-colors font-light footer-link"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-text-secondary hover:text-white transition-colors font-light footer-link"
                  >
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-light mb-4 text-lg text-white">Connect</h3>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="text-text-secondary hover:text-white transition-colors footer-link"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-text-secondary hover:text-white transition-colors footer-link"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-text-secondary hover:text-white transition-colors footer-link"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-text-secondary hover:text-white transition-colors footer-link"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-white border-opacity-10 pt-8 text-center text-sm text-text-secondary">
            <p className="font-light">
              &copy; 2024 QueMe. All rights reserved. | Developed for
              Educational Purposes
            </p>
          </div>
        </div>
      </footer>

      <style>{`
        /* Nav and Footer Link Hover Effects */
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

        .footer-link {
          position: relative;
          display: inline-block;
          transition: transform 0.2s ease;
        }

        .footer-link:hover {
          transform: translateX(4px);
        }

        /* Less rounded buttons */
        .btn-gradient,
        .btn-outline-white {
          border-radius: 8px !important;
        }
      `}</style>
    </div>
  );
};

export default HomePage;
