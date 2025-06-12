"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Trash2, Edit2, Check, X } from "lucide-react";

interface CustomTermsFormProps {
  terms: "standard" | "custom";
  customTerms: string[];
  onTermsChange: (terms: "standard" | "custom", customTerms?: string[]) => void;
}

export default function CustomTermsForm({
  terms,
  customTerms,
  onTermsChange,
}: CustomTermsFormProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newTerm, setNewTerm] = useState("");
  const [currentInput, setCurrentInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when switching to custom terms
  useEffect(() => {
    if (terms === "custom" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [terms]);

  const handleAddTerm = () => {
    if (!currentInput.trim()) return;
    
    const updatedTerms = [...customTerms, currentInput.trim()];
    onTermsChange("custom", updatedTerms);
    setCurrentInput("");
    
    // Focus back to input for next term
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTerm();
    }
  };

  const handleEditTerm = (index: number, value: string) => {
    if (!value.trim()) return;
    
    const updatedTerms = [...customTerms];
    updatedTerms[index] = value.trim();
    onTermsChange("custom", updatedTerms);
    setEditingIndex(null);
  };

  const handleRemoveTerm = (index: number) => {
    const updatedTerms = customTerms.filter((_, i) => i !== index);
    onTermsChange("custom", updatedTerms);
  };

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setNewTerm(customTerms[index]);
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setNewTerm("");
    // Focus back to main input
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-300 mb-2 block">Terms Type</label>
        <select
          value={terms}
          onChange={(e) => onTermsChange(e.target.value as "standard" | "custom", customTerms)}
          className="w-full rounded-md bg-zinc-700 border-zinc-600 text-white px-3 py-2"
        >
          <option value="standard">Standard Terms</option>
          <option value="custom">Custom Terms</option>
        </select>
      </div>

      {terms === "custom" && (
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-300">Custom Terms & Conditions</label>
          
          {/* Always-ready input for new terms */}
          <div className="mb-4">
            <Input
              ref={inputRef}
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="bg-zinc-600 border-zinc-500 text-white"
              placeholder={`${customTerms.length + 1}. Enter term or condition (Press Enter to add)`}
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-1">
              Press Enter to add the term and move to the next one
            </p>
          </div>
          
          {/* Existing Terms */}
          {customTerms.map((term, index) => (
            <Card key={index} className="p-4 bg-zinc-700 border-zinc-600">
              {editingIndex === index ? (
                <div className="space-y-3">
                  <Input
                    value={newTerm}
                    onChange={(e) => setNewTerm(e.target.value)}
                    className="bg-zinc-600 border-zinc-500 text-white"
                    placeholder="Enter term or condition"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleEditTerm(index, newTerm);
                      }
                    }}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={cancelEdit}
                      className="text-gray-400 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleEditTerm(index, newTerm)}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-sm text-gray-300 leading-relaxed">{term}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => startEdit(index)}
                      className="text-gray-400 hover:text-white"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveTerm(index)}
                      className="text-gray-400 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}

          {customTerms.length === 0 && (
            <p className="text-sm text-gray-500 italic">
              No custom terms added yet. Start typing above to add your first term.
            </p>
          )}
        </div>
      )}
    </div>
  );
}