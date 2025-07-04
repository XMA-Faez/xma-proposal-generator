"use client";

import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  X,
  Loader2,
  Edit,
  Trash2,
} from "lucide-react";

interface Package {
  id: string;
  name: string;
  price: number;
  currency: string | null;
  usd_price: number | null;
  is_popular: boolean | null;
  description: string | null;
  created_at: string | null;
  updated_at: string | null;
  features: unknown[];
}

interface PackageHeaderProps {
  pkg: Package;
  isCollapsed: boolean;
  isEditMode: boolean;
  isSaving: boolean;
  onToggleCollapse: (packageId: string) => void;
  onStartEdit: (packageId: string) => void;
  onCancelEdit: (packageId: string) => void;
  onSave: (packageId: string) => void;
  onDuplicate: (packageId: string) => void;
  onDelete: (packageId: string) => void;
}

export function PackageHeader({
  pkg,
  isCollapsed,
  isEditMode,
  isSaving,
  onToggleCollapse,
  onStartEdit,
  onCancelEdit,
  onSave,
  onDuplicate,
  onDelete,
}: PackageHeaderProps) {
  return (
    <div className="flex justify-between items-start">
      <div 
        className="flex items-center gap-3 cursor-pointer rounded p-2 -m-2 flex-1"
        onClick={() => onToggleCollapse(pkg.id)}
      >
        <div className="p-1">
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
        <h2 className="text-lg font-semibold">{pkg.name}</h2>
        {pkg.is_popular && (
          <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">
            Popular
          </span>
        )}
      </div>
      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
        {isEditMode ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCancelEdit(pkg.id)}
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => onSave(pkg.id)}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Check className="h-4 w-4 mr-1" />
              )}
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStartEdit(pkg.id)}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDuplicate(pkg.id)}
            >
              <Copy className="h-4 w-4 mr-1" />
              Duplicate
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(pkg.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
