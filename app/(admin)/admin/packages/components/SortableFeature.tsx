"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GripVertical,
  Trash2,
  Check,
  X,
} from "lucide-react";

interface PackageFeature {
  id: string;
  package_id: string;
  text: string;
  is_included: boolean | null;
  is_bold: boolean | null;
  order_index: number;
  color?: string | null;
}

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
  features: PackageFeature[];
}

interface SortableFeatureProps {
  feature: PackageFeature;
  onDeleteFeature: (packageId: string, featureId: string) => void;
  setPackagesAction: React.Dispatch<React.SetStateAction<Package[]>>;
  packageId: string;
  selectedFeatures: Set<string>;
  toggleFeatureSelection: (id: string) => void;
  markAsChanged: () => void;
  isEditMode: boolean;
}

export function SortableFeature({
  feature,
  onDeleteFeature,
  setPackagesAction,
  packageId,
  selectedFeatures,
  toggleFeatureSelection,
  markAsChanged,
  isEditMode,
}: SortableFeatureProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: feature.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isSelected = selectedFeatures.has(feature.id);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-2 rounded transition-all ${
        isSelected
          ? "bg-blue-50 border-blue-200"
          : "hover:bg-zinc-900 border-transparent hover:border-zinc-700"
      } border`}
    >
      <Checkbox
        checked={isSelected}
        onCheckedChange={() => toggleFeatureSelection(feature.id)}
        className="mr-2"
      />

      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-zinc-800 rounded"
      >
        <GripVertical className="h-4 w-4 text-gray-400" />
      </div>

      {isEditMode ? (
        <Checkbox
          checked={feature.is_included !== false}
          onCheckedChange={(checked) => {
            setPackagesAction((prev) =>
              prev.map((p) =>
                p.id === packageId
                  ? {
                      ...p,
                      features: p.features.map((f) =>
                        f.id === feature.id
                          ? { ...f, is_included: checked }
                          : f,
                      ),
                    }
                  : p,
              ),
            );
            markAsChanged();
          }}
        />
      ) : (
        <div className="w-4 h-4 flex items-center justify-center">
          {feature.is_included !== false ? (
            <Check className="h-3 w-3 text-green-500" />
          ) : (
            <X className="h-3 w-3 text-red-500" />
          )}
        </div>
      )}

      {isEditMode ? (
        <>
          <Checkbox
            checked={feature.is_bold || false}
            onCheckedChange={(checked) => {
              setPackagesAction((prev) =>
                prev.map((p) =>
                  p.id === packageId
                    ? {
                        ...p,
                        features: p.features.map((f) =>
                          f.id === feature.id
                            ? { ...f, is_bold: checked }
                            : f,
                        ),
                      }
                    : p,
                ),
              );
              markAsChanged();
            }}
            className="ml-2"
          />
          <label className="text-sm">Bold</label>
        </>
      ) : (
        <div className="ml-2 text-xs text-gray-500">
          {feature.is_bold ? "Bold" : ""}
        </div>
      )}

      {isEditMode ? (
        <Input
          value={feature.text}
          onChange={(e) => {
            setPackagesAction((prev) =>
              prev.map((p) =>
                p.id === packageId
                  ? {
                      ...p,
                      features: p.features.map((f) =>
                        f.id === feature.id
                          ? { ...f, text: e.target.value }
                          : f,
                      ),
                    }
                  : p,
              ),
            );
            markAsChanged();
          }}
          className="flex-1"
        />
      ) : (
        <p
          className={`flex-1 ${
            feature.is_bold ? "font-bold" : ""
          }`}
        >
          {feature.text}
        </p>
      )}

      {isEditMode ? (
        <Select
          value={feature.color || "default"}
          onValueChange={(value) => {
            setPackagesAction((prev) =>
              prev.map((p) =>
                p.id === packageId
                  ? {
                      ...p,
                      features: p.features.map((f) =>
                        f.id === feature.id
                          ? { ...f, color: value === "default" ? null : value }
                          : f,
                      ),
                    }
                  : p,
              ),
            );
            markAsChanged();
          }}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default</SelectItem>
            <SelectItem value="green">Green</SelectItem>
            <SelectItem value="blue">Blue</SelectItem>
            <SelectItem value="yellow">Yellow</SelectItem>
          </SelectContent>
        </Select>
      ) : (
        <div className="w-32 text-xs text-gray-500">
          {feature.color || "Default"}
        </div>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDeleteFeature(packageId, feature.id)}
      >
        <Trash2 className="h-4 w-4 text-red-500 transition" />
      </Button>
    </div>
  );
}