"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProposalForm from "./ProposalForm";
import CustomProposalClient from "./CustomProposalClient";

// Create a client
const queryClient = new QueryClient();

interface ProposalGeneratorTabsProps {
  initialData: {
    packages: any[];
    services: any[];
  };
}

export default function ProposalGeneratorTabs({ initialData }: ProposalGeneratorTabsProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="bg-zinc-900 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-white mb-8">Proposal Generator</h1>
          
          <Tabs defaultValue="standard" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-zinc-800 text-gray-400">
              <TabsTrigger value="standard" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">Standard Proposal</TabsTrigger>
              <TabsTrigger value="custom" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">Custom Proposal</TabsTrigger>
            </TabsList>
            
            <TabsContent value="standard" className="space-y-6">
              <ProposalForm initialData={initialData} />
            </TabsContent>
            
            <TabsContent value="custom" className="space-y-6">
              <CustomProposalClient />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </QueryClientProvider>
  );
}
