import React, { useState } from 'react';
import { termsAndConditions } from '@/data/proposalData';

const TermsAndConditions: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="mb-8 bg-zinc-800 rounded-lg p-6 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-red-500">
          Terms and Conditions
        </h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm bg-zinc-700 hover:bg-zinc-600 px-3 py-1 rounded text-zinc-300 transition-colors flex items-center"
        >
          {isExpanded ? (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
              Hide Details
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
              View Details
            </>
          )}
        </button>
      </div>
      
      {isExpanded ? (
        <div className="bg-zinc-900 p-5 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {termsAndConditions.map((term, index) => (
              <div key={index} className="flex">
                <div className="mr-3 text-red-500 font-bold">{index + 1}.</div>
                <div className="text-zinc-300">{term.substring(term.indexOf(".") + 1).trim()}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-zinc-900 p-5 rounded-lg">
          <p className="text-zinc-400 text-sm">
            This proposal is subject to our standard terms and conditions, including 50% payment upfront, 
            2 rounds of revisions, a 4-6 week timeline, and client-provided content requirements. 
            <span 
              onClick={() => setIsExpanded(true)} 
              className="text-red-400 hover:text-red-300 cursor-pointer ml-1"
            >
              Click to view all terms and conditions.
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

export default TermsAndConditions;
