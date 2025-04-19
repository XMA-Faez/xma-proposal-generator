import React, { useState } from 'react';
import { saveProposal } from '@/lib/supabase';

interface SaveProposalButtonProps {
  proposalData: any;
  encodedData: string;
  onSuccess: (result: any) => void;
}

const SaveProposalButton: React.FC<SaveProposalButtonProps> = ({ 
  proposalData, 
  encodedData,
  onSuccess
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSaveProposal = async () => {
    setIsSaving(true);
    setError(null);
    
    try {
      const result = await saveProposal(proposalData, encodedData);
      onSuccess(result);
    } catch (err) {
      console.error('Error saving proposal:', err);
      setError(err instanceof Error ? err.message : 'Failed to save proposal');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleSaveProposal}
        disabled={isSaving}
        className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSaving ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Saving...</span>
          </>
        ) : (
          <span>Save to Database</span>
        )}
      </button>
      
      {error && (
        <div className="mt-2 text-red-500 text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

export default SaveProposalButton;
