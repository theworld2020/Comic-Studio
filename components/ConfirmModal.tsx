import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-lg border-4 border-banana-yellow w-full max-w-md space-y-6">
        <h2 className="text-2xl font-bold text-center text-jungle-green">Are you sure?</h2>
        <p className="text-center text-banana-brown text-lg">{message}</p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <button
            onClick={onConfirm}
            className="w-full sm:w-auto px-8 py-3 bg-sunset-orange text-white text-xl font-bold rounded-full shadow-lg hover:bg-orange-500 transform hover:scale-105 transition-all duration-300"
          >
            Yes, Continue
          </button>
          <button
            onClick={onCancel}
            className="w-full sm:w-auto px-8 py-3 bg-gray-300 text-banana-brown text-xl font-bold rounded-full shadow-lg hover:bg-gray-400 transform hover:scale-105 transition-all duration-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
