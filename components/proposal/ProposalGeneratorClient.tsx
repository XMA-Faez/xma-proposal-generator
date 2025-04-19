"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ProposalForm from "./ProposalForm";

// Create a client
const queryClient = new QueryClient();

// Main Component Wrapper with QueryProvider
export default function ProposalGeneratorClient({ initialData }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ProposalForm initialData={initialData} />
    </QueryClientProvider>
  );
}
