"use client";

import React from "react";

interface ClientInformationFormProps {
  clientName: string;
  setClientName: (value: string) => void;
  companyName: string;
  setCompanyName: (value: string) => void;
  proposalDate: string;
  setProposalDate: (value: string) => void;
  additionalInfo: string;
  setAdditionalInfo: (value: string) => void;
}

const ClientInformationForm: React.FC<ClientInformationFormProps> = ({
  clientName,
  setClientName,
  companyName,
  setCompanyName,
  proposalDate,
  setProposalDate,
  additionalInfo,
  setAdditionalInfo,
}) => {
  return (
    <div className="bg-zinc-800 rounded-lg p-6 mb-8">
      <h2 className="text-xl font-bold mb-4 text-red-500">
        Client Information
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">
            Client Name*
          </label>
          <input
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">
            Company Name*
          </label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
        </div>
      </div>
      <div className="mt-4">
        <label className="block text-sm font-medium text-zinc-400 mb-1">
          Proposal Date*
        </label>
        <input
          type="date"
          value={proposalDate}
          onChange={(e) => setProposalDate(e.target.value)}
          className="w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          required
        />
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-zinc-400 mb-1">
          Additional Information (Optional)
        </label>
        <textarea
          value={additionalInfo}
          onChange={(e) => setAdditionalInfo(e.target.value)}
          placeholder="Add any specific requirements, project details, or notes for the client..."
          className="w-full h-32 bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <p className="text-xs text-zinc-500 mt-1">
          This information will be displayed in the proposal and can
          include project scope, timeline expectations, or any other
          relevant details.
        </p>
      </div>
    </div>
  );
};

export default ClientInformationForm;
