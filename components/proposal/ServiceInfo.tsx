"use client";

import React, { useState } from "react";

interface ServiceInfoProps {
  service: {
    description: string;
  };
}

const ServiceInfo: React.FC<ServiceInfoProps> = ({ service }) => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="relative">
      <div
        className="text-blue-400 cursor-pointer hover:text-blue-300 ml-2"
        onClick={() => setShowInfo(!showInfo)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 inline"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      {showInfo && (
        <div className="absolute z-10 top-0 left-6 w-64 p-3 bg-zinc-800 border border-zinc-700 rounded-md shadow-lg text-sm">
          {service.description}
        </div>
      )}
    </div>
  );
};

export default ServiceInfo;
