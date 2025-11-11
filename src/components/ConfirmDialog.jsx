const ConfirmDialog = ({ title, message, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm">
      <div className="glass-card max-w-md w-full p-8 glow">
        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-gradient-accent bg-opacity-20 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-accent-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center mb-3">{title}</h2>

        {/* Message */}
        <p className="text-text-secondary text-center mb-8">{message}</p>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onCancel}
            className="flex-1 btn-outline py-3"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 btn-gradient py-3"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
