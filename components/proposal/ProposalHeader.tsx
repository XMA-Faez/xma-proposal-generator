import React from "react";

interface ProposalHeaderProps {
  clientName: string;
  companyName: string;
  proposalDate: string;
  orderId?: string; // Add optional order ID field
}

const ProposalHeader: React.FC<ProposalHeaderProps> = ({
  clientName,
  companyName,
  proposalDate,
  orderId, // Add order ID to props
}) => {
  return (
    <div className="mb-8">
      <div className="bg-zinc-800 rounded-lg p-6 shadow-lg border-t-4 border-red-500">
        {/* Header */}
        <div className="mb-8 text-center pb-6 border-b border-zinc-700">
          <img
            src="/XMA-White.svg"
            alt="XMA Agency Logo"
            className="h-12 mx-auto mb-6"
          />
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent mb-2">
            MARKETING PROPOSAL
          </h1>
          <p className="text-zinc-400 text-lg">
            Prepared exclusively for{" "}
            <span className="text-white font-medium">{companyName}</span>
          </p>

          {/* Display Order ID if available */}
          {orderId && (
            <div className="mt-3 inline-block bg-red-600/20 text-red-400 text-sm font-medium px-3 py-1 rounded">
              Order ID: {orderId}
            </div>
          )}
        </div>

        {/* Client Information */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-zinc-900/50 p-4 rounded-lg hover:bg-zinc-900 transition-colors">
            <p className="text-sm text-zinc-400">Client Name:</p>
            <p className="font-medium text-lg">{clientName}</p>
          </div>
          <div className="bg-zinc-900/50 p-4 rounded-lg hover:bg-zinc-900 transition-colors">
            <p className="text-sm text-zinc-400">Company:</p>
            <p className="font-medium text-lg">{companyName}</p>
          </div>
          <div className="bg-zinc-900/50 p-4 rounded-lg hover:bg-zinc-900 transition-colors">
            <p className="text-sm text-zinc-400">Proposal Date:</p>
            <p className="font-medium text-lg">{proposalDate}</p>
          </div>
          {orderId && (
            <div className="bg-zinc-900/50 p-4 rounded-lg hover:bg-zinc-900 transition-colors">
              <p className="text-sm text-zinc-400">Order ID:</p>
              <p className="font-medium text-lg">{orderId}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProposalHeader;
