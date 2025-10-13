import { useEffect } from 'react';
import { getToastIcon } from '../utils/utils';

const Toast = ({ message, type = 'info', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  useEffect(() => {
    if (window.feather) {
      window.feather.replace();
    }
  }, []);

  return (
    <div className={`toast toast-${type}`}>
      <div className="flex items-center">
        <i data-feather={getToastIcon(type)} className="h-5 w-5 mr-3"></i>
        <span>{message}</span>
      </div>
    </div>
  );
};

export default Toast;