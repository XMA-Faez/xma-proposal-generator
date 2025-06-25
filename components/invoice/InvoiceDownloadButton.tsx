"use client";

import React, { useState, useEffect } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { InvoiceData } from "@/types/invoice";

interface InvoiceDownloadButtonProps {
  invoice: InvoiceData;
  variant?: "default" | "outline" | "ghost" | "link";
  size?: "default" | "sm" | "lg";
}

export const InvoiceDownloadButton: React.FC<InvoiceDownloadButtonProps> = ({
  invoice,
  variant = "default",
  size = "default",
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDownload = async () => {
    if (!mounted) return;
    
    setIsGenerating(true);
    try {
      // Dynamic import on client side only
      const React = await import("react");
      const { pdf } = await import("@react-pdf/renderer");
      const { InvoicePDF } = await import("./InvoicePDF");
      
      console.log('Creating PDF document...');
      
      // Create the PDF document element
      const pdfDocument = React.createElement(InvoicePDF, { invoice });
      
      console.log('Generating PDF blob...');
      
      // Generate PDF blob
      const blob = await pdf(pdfDocument).toBlob();
      
      console.log('PDF blob generated successfully');
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice_${invoice.invoiceNumber}_${invoice.clientCompany.replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('PDF download completed');
    } catch (error) {
      console.error('Error generating PDF:', error);
      console.error('Error details:', error);
      alert(`Failed to generate PDF: ${error.message || 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!mounted) {
    return (
      <Button variant={variant} size={size} disabled>
        <Download className="mr-2 h-4 w-4" />
        Loading...
      </Button>
    );
  }

  return (
    <Button 
      variant={variant} 
      size={size} 
      disabled={isGenerating}
      onClick={handleDownload}
    >
      <Download className="mr-2 h-4 w-4" />
      {isGenerating ? "Generating..." : "Download Invoice"}
    </Button>
  );
};