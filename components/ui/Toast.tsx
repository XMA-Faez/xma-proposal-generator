import React, { useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  isVisible: boolean;
  onClose: () => void;
}

const getToastStyles = (type: ToastType) => {
  switch (type) {
    case "success":
      return {
        bg: "bg-green-900/90",
        text: "text-green-100",
        border: "border-green-500/50",
        icon: <CheckCircle size={20} className="text-green-400" />
      };
    case "error":
      return {
        bg: "bg-red-900/90",
        text: "text-red-100",
        border: "border-red-500/50",
        icon: <XCircle size={20} className="text-red-400" />
      };
    case "info":
      return {
        bg: "bg-blue-900/90",
        text: "text-blue-100",
        border: "border-blue-500/50",
        icon: <AlertCircle size={20} className="text-blue-400" />
      };
  }
};

const Toast: React.FC<ToastProps> = ({
  message,
  type = "success",
  duration = 3000,
  isVisible,
  onClose
}) => {
  const styles = getToastStyles(type);
  
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [isVisible, duration, onClose]);
  
  if (!isVisible) return null;
  
  return (
    <div className={`fixed bottom-4 right-4 ${styles.bg} ${styles.text} px-4 py-3 rounded-md shadow-lg z-50 max-w-xs md:max-w-md transition-all flex items-center animate-slide-up`}>
      <div className="mr-3">
        {styles.icon}
      </div>
      <div className="flex-grow">
        {message}
      </div>
      <button 
        onClick={onClose}
        className="ml-3 p-1 rounded-full hover:bg-black/20 transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
