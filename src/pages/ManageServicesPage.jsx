import { useState } from 'react';
import { Link } from 'react-router-dom';

const ManageServicesPage = () => {
  const [services, setServices] = useState([
    { id: '1', name: 'General Consultation', avgTime: '15 mins', isActive: true },
    { id: '2', name: 'Priority Service', avgTime: '10 mins', isActive: true },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [newService, setNewService] = useState({
    name: '',
    avgTime: '',
    description: ''
  });

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const handleAddService = (e) => {
    e.preventDefault();
    const service = {
      id: Date.now().toString(),
      name: newService.name,
      avgTime: newService.avgTime,
      description: newService.description,
      isActive: true
    };
    setServices([...services, service]);
    setNewService({ name: '', avgTime: '', description: '' });
    setShowAddModal(false);
    showToast('Service added successfully', 'success');
  };

  const handleDeleteService = (id) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      setServices(services.filter(s => s.id !== id));
      showToast('Service deleted', 'success');
    }
  };

  const toggleServiceStatus = (id) => {
    setServices(services.map(s => 
      s.id === id ? { ...s, isActive: !s.isActive } : s
    ));
    showToast('Service status updated', 'success');
  };

  return (
    <div className="min-h-screen bg-primary text-text-primary">
      {/* Toast */}
      {toast.show && (
        <div className={`fixed top-5 right-5 z-50 toast toast-${toast.type}`}>
          <div className="flex items-center justify-between">
            <p style={{ fontWeight: 300 }}>{toast.message}</p>
            <button onClick={() => setToast({ show: false, message: '', type: '' })} className="ml-4 hover:opacity-70">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Add Service Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm">
          <div className="glass-card max-w-lg w-full p-8 glow">
            <h2 className="text-2xl mb-6" style={{ fontWeight: 200 }}>Add New Service</h2>
            <form onSubmit={handleAddService} className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ fontWeight: 300 }}>Service Name *</label>
                <input
                  type="text"
                  value={newService.name}
                  onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-accent-green"
                  placeholder="e.g., Premium Consultation"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-2" style={{ fontWeight: 300 }}>Average Time *</label>
                <input
                  type="text"
                  value={newService.avgTime}
                  onChange={(e) => setNewService({ ...newService, avgTime: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-accent-green"
                  placeholder="e.g., 20 mins"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-2" style={{ fontWeight: 300 }}>Description</label>
                <textarea
                  value={newService.description}
                  onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-accent-green"
                  rows="3"
                  placeholder="Service description..."
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 btn-gradient py-3">Add Service</button>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-outline px-8 py-3">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <nav className="glass-card sticky top-0 z-40 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/provider-dashboard">
              <img src="/logo.svg" alt="Logo" className="h-11 w-auto" />
            </Link>
            <Link to="/provider-dashboard" className="btn-outline py-2 px-4 text-sm">Back to Dashboard</Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl mb-2" style={{ fontWeight: 200 }}>Manage Services</h1>
            <p className="text-text-secondary text-lg" style={{ fontWeight: 300 }}>
              Add, edit, or remove your service offerings
            </p>
          </div>
          <button onClick={() => setShowAddModal(true)} className="btn-gradient inline-flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Service
          </button>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service.id} className="glass-card p-6 glow-hover">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl mb-2" style={{ fontWeight: 200 }}>{service.name}</h3>
                  <p className="text-text-secondary text-sm" style={{ fontWeight: 300 }}>
                    ⏱️ {service.avgTime}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs ${service.isActive ? 'bg-green-500 bg-opacity-20 text-green-400' : 'bg-red-500 bg-opacity-20 text-red-400'}`}>
                  {service.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {service.description && (
                <p className="text-text-secondary text-sm mb-4" style={{ fontWeight: 300 }}>
                  {service.description}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => toggleServiceStatus(service.id)}
                  className="flex-1 btn-outline py-2 text-sm"
                >
                  {service.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => handleDeleteService(service.id)}
                  className="btn-outline py-2 px-4 text-sm text-red-400 hover:border-red-400"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {services.length === 0 && (
          <div className="text-center py-12 glass-card">
            <svg className="w-16 h-16 mx-auto text-text-secondary mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-xl mb-2" style={{ fontWeight: 200 }}>No services yet</h3>
            <p className="text-text-secondary mb-6" style={{ fontWeight: 300 }}>Add your first service to get started</p>
            <button onClick={() => setShowAddModal(true)} className="btn-gradient inline-block">
              Add Your First Service
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageServicesPage;