"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { commonClasses } from "@/lib/design-system";
import ProposalForm from "./ProposalForm";
import CustomProposalClient from "./CustomProposalClient";

// Create a client
const queryClient = new QueryClient();

interface Package {
  id: string;
  name: string;
  price: number;
  features: Array<{
    id: string;
    name: string;
    description: string;
  }>;
}

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
}

interface ProposalGeneratorTabsProps {
  initialData: {
    packages: Package[];
    services: Service[];
  };
}

export default function ProposalGeneratorTabs({ initialData }: ProposalGeneratorTabsProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <div className={commonClasses.pageContainer}>
        <div className={commonClasses.contentContainer}>
          <h1 className="text-3xl font-bold text-text-primary mb-8">Proposal Generator</h1>
          
          <Tabs defaultValue="standard" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="standard">Standard Proposal</TabsTrigger>
              <TabsTrigger value="custom">Custom Proposal</TabsTrigger>
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
