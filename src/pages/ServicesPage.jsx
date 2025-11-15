import { useEffect, useState } from "react";
import { providerAPI } from "../services/provider";
import { Link } from "react-router-dom";

export default function ServicesPage() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProviders = async () => {
      try {
        const list = await providerAPI.getProviders();
        setProviders(list || []);
      } catch (err) {
        console.error("Failed loading providers", err);
      } finally {
        setLoading(false);
      }
    };

    loadProviders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-text-secondary">
        Loading services…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary text-text-primary px-6 py-10">
      <h1 className="text-4xl mb-6" style={{ fontWeight: 200 }}>
        Available <span className="bg-gradient-accent bg-clip-text text-transparent">Services</span>
      </h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {providers.map((p) => (
          <div key={p.id} className="glass-card p-6 glow-hover">
            <h2 className="text-xl mb-2" style={{ fontWeight: 200 }}>
              {p.business_name}
            </h2>
            <p className="text-text-secondary text-sm mb-2">
              {p.business_type}
            </p>
            <p className="text-text-secondary text-sm">📍 {p.address}</p>

            <Link
              to="/queue-booking"
              className="btn-gradient mt-4 inline-block"
            >
              Book Queue
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
