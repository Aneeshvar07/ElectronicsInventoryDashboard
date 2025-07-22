// Modal Component
import {X} from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, size = 'max-w-2xl' }) => {
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className={`bg-[#FAF7F0] rounded-lg ${size} w-full max-h-[90vh] overflow-y-auto shadow-2xl`}>
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    );
  };

  export default Modal;

  