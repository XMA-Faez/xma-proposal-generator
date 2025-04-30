import Image from "next/image";
import React from "react";

interface CompanyStampProps {
  orderId?: string | null;
}

const CompanyStamp: React.FC<CompanyStampProps> = ({ orderId }) => {
  return (
    <div className="mt-6 pt-4 border-t border-zinc-700">
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="mb-4 md:mb-0 md:mr-4 md:max-w-md">
          <h3 className="text-md font-bold mb-3">Legal Agreement</h3>
          <div className="text-sm text-zinc-300">
            <p>
              By accepting this proposal, the client agrees to enter into a legally binding contract 
              with xluxive digital marketing LLC under Order ID:{" "}
              <span className="font-semibold text-red-400">{orderId || "N/A"}</span>.
              This document serves as the official agreement between both parties and is subject 
              to the terms and conditions outlined herein.
            </p>
            <p className="mt-2">
              <strong className="text-white">Payment Acceptance:</strong> Receipt of payment for this proposal 
              constitutes full acceptance of all terms and conditions. Once payment is received, 
              work will commence according to the agreed timeline.
            </p>
          </div>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="bg-zinc-300 p-2 rounded-lg">
            <Image
              src="/NSGT Global Limited XMA Lead Flow Proposal.png" 
              alt="Company Stamp" 
              className="w-48 max-w-full h-auto"
              width={1000}
              height={500}
            />
          </div>
          <p className="mt-2 text-xs text-zinc-500">Official Company Stamp</p>
        </div>
      </div>
      
      <p className="mt-4 text-xs text-center text-zinc-400">
        This document is electronically generated and valid without signature. 
        The Order ID serves as the unique identifier for this contract.
      </p>
    </div>
  );
};

export default CompanyStamp;
