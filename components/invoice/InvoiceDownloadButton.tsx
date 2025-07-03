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
    if (!mounted || typeof window === 'undefined') return;
    
    setIsGenerating(true);
    try {
      // Ensure we're in the browser environment
      if (typeof document === 'undefined') {
        throw new Error('PDF generation is only available in the browser');
      }

      console.log('Starting PDF generation...');
      console.log('Invoice data:', invoice);
      
      // Dynamic import with error handling
      const [React, { pdf }, { InvoicePDF }] = await Promise.all([
        import("react"),
        import("@react-pdf/renderer"),
        import("./InvoicePDF")
      ]);
      
      console.log('Modules imported successfully');
      
      // Validate invoice data
      if (!invoice || !invoice.invoiceNumber) {
        throw new Error('Invalid invoice data');
      }

      // Ensure line items exist and are properly formatted
      const processedInvoice = {
        ...invoice,
        lineItems: invoice.lineItems || [],
        subtotal: invoice.subtotal || 0,
        vatAmount: invoice.vatAmount || 0,
        totalAmount: invoice.totalAmount || 0,
      };
      
      // Create the PDF document element with proper React context
      const pdfDocument = React.createElement(InvoicePDF, { invoice: processedInvoice });
      
      console.log('PDF document created, generating blob...');
      
      // Generate PDF with timeout
      const pdfInstance = pdf(pdfDocument);
      const blob = await Promise.race([
        pdfInstance.toBlob(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('PDF generation timeout')), 30000)
        )
      ]);
      
      console.log('PDF blob generated successfully, size:', blob.size);
      
      // Validate blob
      if (!blob || blob.size === 0) {
        throw new Error('Generated PDF is empty');
      }
      
      // Create and trigger download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice_${invoice.invoiceNumber}_${invoice.clientCompany?.replace(/\s+/g, "_") || 'Unknown'}.pdf`;
      
      // Ensure the link is properly attached to the document
      document.body.appendChild(link);
      link.click();
      
      // Cleanup with delay to ensure download starts
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
        URL.revokeObjectURL(url);
      }, 100);
      
      console.log('PDF download initiated successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to generate PDF: ${errorMessage}`);
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