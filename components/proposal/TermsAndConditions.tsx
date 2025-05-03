import React, { useState } from "react";
import { termsAndConditions } from "@/data/proposalData";

// Updated terms and conditions with satisfaction guarantee and cancellation policy
const updatedTermsAndConditions = [
  "1. Payment Terms: 100% payment required upfront to initiate the project.",
  "2. Revisions: Package includes up to 3 rounds of revisions for each deliverable.",
  "3. Timeline: Estimated completion time is 4-6 weeks from project start date, dependent on client feedback turnaround times.",
  "4. Content: Client is responsible for providing necessary content (brand asset, product information, account credentials etc.) within 3 days of project start.",
  "5. Intellectual Property: Upon full payment, client receives full rights to all deliverables created specifically for this project.",
  "6. Cancellation and Satisfaction Guarantee: We offer a satisfaction guarantee for up to one month after campaign launch. If dissatisfied, client may request a refund, but will forfeit content ownership rights and may no longer use the content for advertising or posting. For retainer cancellations, clients may keep the CRM system for a reduced fee of 300 AED per month.",
  "7. Confidentiality: XMA Agency agrees to maintain confidentiality of all client information.",
  "8. Additional Services: Any services not specified in this proposal will require a separate agreement.",
  "9. Validity: This proposal is valid for 30 days from the date issued.",
];

const TermsAndConditions: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mb-8 bg-zinc-800 rounded-lg p-6 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-red-500">Terms and Conditions</h2>
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
            {updatedTermsAndConditions.map((term, index) => (
              <div key={index} className="flex">
                <div className="mr-3 text-red-500 font-bold">{index + 1}.</div>
                <div className="text-zinc-300">
                  {term.substring(term.indexOf(".") + 1).trim()}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-zinc-900 p-5 rounded-lg">
          <p className="text-zinc-400 text-sm">
            This proposal is subject to our standard terms and conditions,
            including 100% payment upfront, 1 rounds of revisions, a 4-6 week
            timeline, and client-provided content requirements. We offer a
            satisfaction guarantee for up to one month after campaign launch.
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
