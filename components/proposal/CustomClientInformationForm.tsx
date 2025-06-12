"use client";

import React from "react";
import { Input } from "@/components/ui/input";

interface ClientInfo {
  clientName: string;
  companyName: string;
  proposalDate: string;
  additionalInfo?: string;
}

interface CustomClientInformationFormProps {
  clientInfo: ClientInfo;
  onChange: (clientInfo: ClientInfo) => void;
}

export default function CustomClientInformationForm({
  clientInfo,
  onChange,
}: CustomClientInformationFormProps) {
  const handleChange = (field: keyof ClientInfo, value: string) => {
    onChange({
      ...clientInfo,
      [field]: value,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Client Name *
        </label>
        <Input
          type="text"
          value={clientInfo.clientName}
          onChange={(e) => handleChange("clientName", e.target.value)}
          className="bg-zinc-700 border-zinc-600 text-white"
          placeholder="Enter client name"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Company Name *
        </label>
        <Input
          type="text"
          value={clientInfo.companyName}
          onChange={(e) => handleChange("companyName", e.target.value)}
          className="bg-zinc-700 border-zinc-600 text-white"
          placeholder="Enter company name"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Proposal Date *
        </label>
        <Input
          type="date"
          value={clientInfo.proposalDate}
          onChange={(e) => handleChange("proposalDate", e.target.value)}
          className="bg-zinc-700 border-zinc-600 text-white"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Additional Information (Optional)
        </label>
        <textarea
          value={clientInfo.additionalInfo || ""}
          onChange={(e) => handleChange("additionalInfo", e.target.value)}
          placeholder="Add any specific requirements, project details, or notes for the client..."
          className="w-full h-32 bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          rows={4}
        />
        <p className="text-xs text-gray-500 mt-1">
          This information will be displayed in the proposal and can include project scope, timeline expectations, or any other relevant details.
        </p>
      </div>
    </div>
  );
}