const EmptyState = ({ icon, title, message, actionLabel, onAction }) => {
  return (
    <div className="text-center py-12 px-4 bg-gray-50 rounded-lg">
      <div className="mx-auto h-16 w-16 text-gray-300 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6 max-w-sm mx-auto">{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;