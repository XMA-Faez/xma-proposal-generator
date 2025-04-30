"use client";

import React, { useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

interface ToastProps {
  isVisible: boolean;
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
  autoClose?: boolean;
  autoCloseTime?: number;
}

const Toast: React.FC<ToastProps> = ({
  isVisible,
  message,
  type = "success",
  onClose,
  autoClose = true,
  autoCloseTime = 3000,
}) => {
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isVisible && autoClose) {
      timer = setTimeout(() => {
        onClose();
      }, autoCloseTime);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isVisible, autoClose, autoCloseTime, onClose]);

  if (!isVisible) return null;

  // Determine icon and color based on type
  const getIconAndColor = () => {
    switch (type) {
      case "success":
        return {
          icon: <CheckCircle size={20} className="shrink-0" />,
          bgColor: "bg-green-800",
          textColor: "text-green-200",
          borderColor: "border-green-700",
        };
      case "error":
        return {
          icon: <AlertCircle size={20} className="shrink-0" />,
          bgColor: "bg-red-800",
          textColor: "text-red-200",
          borderColor: "border-red-700",
        };
      case "info":
      default:
        return {
          icon: <Info size={20} className="shrink-0" />,
          bgColor: "bg-blue-800",
          textColor: "text-blue-200",
          borderColor: "border-blue-700",
        };
    }
  };

  const { icon, bgColor, textColor, borderColor } = getIconAndColor();

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-slide-up">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${bgColor} ${textColor} border ${borderColor}`}
      >
        {icon}
        <p className="text-sm">{message}</p>
        <button
          onClick={onClose}
          className={`ml-2 p-1 rounded-full hover:bg-black/20 transition-colors`}
          aria-label="Close notification"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default Toast;
