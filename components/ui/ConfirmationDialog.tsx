"use client";

import React from "react";
import { X, AlertTriangle, Loader2 } from "lucide-react";

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: React.ReactNode; // Allow custom content for the message
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing?: boolean;
  error?: string | null;
  icon?: React.ReactNode;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  isProcessing = false,
  error = null,
  icon = null,
}) => {
  if (!isOpen) return null;

  // Prevent clicking the backdrop from closing the dialog when processing
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isProcessing) {
      onCancel();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-zinc-800 rounded-lg shadow-xl max-w-md w-full animate-bounce-in overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-zinc-700">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          {!isProcessing && (
            <button
              onClick={onCancel}
              className="text-zinc-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-5">
          <div className="flex items-start">
            {icon ? (
              <div className="shrink-0 mr-4 text-red-500">{icon}</div>
            ) : (
              <div className="shrink-0 mr-4 text-red-500">
                <AlertTriangle size={24} />
              </div>
            )}
            <div>
              {typeof message === "string" ? (
                <p className="text-zinc-300">{message}</p>
              ) : (
                message
              )}
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mt-4 p-3 bg-red-900/30 border border-red-800 rounded-md text-red-300 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 bg-zinc-900 flex justify-end gap-3">
          {!isProcessing && (
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded transition-colors"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-900 disabled:cursor-not-allowed text-white rounded transition-colors flex items-center"
          >
            {isProcessing && (
              <Loader2 size={16} className="mr-2 animate-spin" />
            )}
            {isProcessing ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
