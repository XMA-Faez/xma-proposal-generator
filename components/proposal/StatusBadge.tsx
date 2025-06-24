"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface StatusBadgeProps {
  status: string;
  proposalId: string;
  onStatusChange?: (newStatus: string) => void;
  className?: string;
}

const statusOptions = [
  { value: "draft", label: "DRAFT", color: "bg-zinc-700 text-zinc-300" },
  { value: "sent", label: "SENT", color: "bg-blue-900 text-blue-300" },
  { value: "accepted", label: "ACCEPTED", color: "bg-green-900 text-green-300" },
  { value: "paid", label: "PAID", color: "bg-purple-900 text-purple-300" },
  { value: "rejected", label: "REJECTED", color: "bg-red-900 text-red-300" },
  { value: "expired", label: "EXPIRED", color: "bg-orange-900 text-orange-300" }
];

const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  proposalId, 
  onStatusChange,
  className = "" 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState(status?.toLowerCase() || "draft");
  
  // Find the current status object
  const statusObj = statusOptions.find(opt => opt.value === currentStatus) || statusOptions[0];

  // Close dropdown when clicking outside
  const closeDropdown = (e: MouseEvent) => {
    setIsOpen(false);
  };

  useEffect(() => {
    if (isOpen) {
      // Add a small delay to prevent immediate closing when opening
      const timer = setTimeout(() => {
        document.addEventListener('click', closeDropdown);
      }, 10);
      
      return () => {
        clearTimeout(timer);
        document.removeEventListener('click', closeDropdown);
      };
    }
  }, [isOpen]);

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus) {
      setIsOpen(false);
      return;
    }

    setIsUpdating(true);
    setError(null);
    
    try {
      // Try the alternative API endpoint first
      try {
        const response = await fetch(`/api/update-proposal-status`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            id: proposalId,
            status: newStatus 
          }),
        });
        
        if (!response.ok) {
          throw new Error('API endpoint failed');
        }
        
        await response.json();
      } 
      // If the API fails, fallback to direct Supabase
      catch (apiError) {
        console.log("API endpoint failed, using direct Supabase call");
        const { error } = await supabase
          .from("proposals")
          .update({ status: newStatus })
          .eq("id", proposalId);
          
        if (error) {
          throw error;
        }
      }

      // If we get here, the update was successful one way or another
      setCurrentStatus(newStatus);
      if (onStatusChange) {
        onStatusChange(newStatus);
      }
    } catch (err) {
      console.error("Error updating proposal status:", err);
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setIsUpdating(false);
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={(e) => {
          e.stopPropagation(); // Prevent event bubbling
          setIsOpen(!isOpen);
        }}
        className={`${statusObj.color} ${isUpdating ? "opacity-50" : ""} text-xs px-2 py-1 rounded flex items-center justify-between min-w-20`}
        disabled={isUpdating}
      >
        <span>{statusObj.label}</span>
        <svg 
          className={`ml-1 h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-40 mt-1 right-0 bg-zinc-800 border border-zinc-700 rounded shadow-lg min-w-32">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={(e) => {
                e.stopPropagation(); // Prevent event bubbling
                handleStatusChange(option.value);
              }}
              className={`block w-full text-left px-3 py-2 text-xs hover:bg-zinc-700 transition-colors
                ${option.value === currentStatus ? "bg-zinc-700" : ""}`}
            >
              <span className={`inline-block w-3 h-3 rounded-full mr-2 ${option.color.split(" ")[0]}`}></span>
              {option.label}
            </button>
          ))}
        </div>
      )}
      
      {error && (
        <div className="absolute top-full mt-1 right-0 bg-red-900/80 text-red-200 text-xs p-2 rounded shadow-lg z-50">
          {error}
        </div>
      )}
    </div>
  );
};

export default StatusBadge;
