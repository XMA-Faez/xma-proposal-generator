import React from "react";

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
  cancelButtonClass?: string;
  isProcessing?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
  icon?: React.ReactNode;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmButtonClass = "bg-red-600 hover:bg-red-700",
  cancelButtonClass = "bg-zinc-700 hover:bg-zinc-600",
  isProcessing = false,
  error = null,
  onConfirm,
  onCancel,
  icon,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-800 rounded-lg p-6 max-w-md w-full shadow-xl">
        <div className="flex items-start gap-4">
          {icon && <div className="flex-shrink-0 text-red-500">{icon}</div>}
          <div className="flex-grow">
            <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
            <div className="text-zinc-300 mb-5">{message}</div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-md text-red-300 text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            className={`px-4 py-2 ${cancelButtonClass} text-white rounded-md transition-colors`}
            onClick={onCancel}
            disabled={isProcessing}
          >
            {cancelText}
          </button>
          <button
            className={`px-4 py-2 ${confirmButtonClass} text-white rounded-md transition-colors flex items-center justify-center min-w-24`}
            onClick={onConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
