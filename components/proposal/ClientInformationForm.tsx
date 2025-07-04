"use client";

import React from "react";
import { commonClasses } from "@/lib/design-system";
import { Card } from "@/components/ui/design-card";

interface ClientInformationFormProps {
  clientName: string;
  setClientName: (value: string) => void;
  companyName: string;
  setCompanyName: (value: string) => void;
  proposalDate: string;
  setProposalDate: (value: string) => void;
  additionalInfo: string;
  setAdditionalInfo: (value: string) => void;
  validityDays: number;
  setValidityDays: (value: number) => void;
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
  validityDays,
  setValidityDays,
}) => {
  return (
    <Card className="mb-8">
      <h2 className="text-xl font-bold mb-4 text-text-primary">
        Client Information
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={`${commonClasses.label} mb-1`}>
            Client Name*
          </label>
          <input
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className={`w-full ${commonClasses.input} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-border-focus`}
            required
          />
        </div>
        <div>
          <label className={`${commonClasses.label} mb-1`}>
            Company Name*
          </label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className={`w-full ${commonClasses.input} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-border-focus`}
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <div>
          <label className={`${commonClasses.label} mb-1`}>
            Proposal Date*
          </label>
          <input
            type="date"
            value={proposalDate}
            onChange={(e) => setProposalDate(e.target.value)}
            className={`w-full ${commonClasses.input} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-border-focus`}
            required
          />
        </div>
        <div>
          <label className={`${commonClasses.label} mb-1`}>
            Validity Period (Days)*
          </label>
          <input
            type="number"
            value={validityDays}
            onChange={(e) => setValidityDays(parseInt(e.target.value) || 1)}
            min="1"
            max="365"
            className={`w-full ${commonClasses.input} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-border-focus`}
            required
          />
          <p className="text-xs text-text-subtle mt-1">
            Number of days this proposal will remain valid
          </p>
        </div>
      </div>

      <div className="mt-4">
        <label className={`${commonClasses.label} mb-1`}>
          Additional Information (Optional)
        </label>
        <textarea
          value={additionalInfo}
          onChange={(e) => setAdditionalInfo(e.target.value)}
          placeholder="Add any specific requirements, project details, or notes for the client..."
          className={`w-full h-32 ${commonClasses.input} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-border-focus`}
        />
        <p className="text-xs text-text-subtle mt-1">
          This information will be displayed in the proposal and can
          include project scope, timeline expectations, or any other
          relevant details.
        </p>
      </div>
    </Card>
  );
};

export default ClientInformationForm;
