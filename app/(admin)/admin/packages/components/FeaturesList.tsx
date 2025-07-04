"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableFeature } from "./SortableFeature";

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

interface FeaturesListProps {
  pkg: Package;
  isEditMode: boolean;
  selectedFeatures: Set<string>;
  setPackagesAction: React.Dispatch<React.SetStateAction<Package[]>>;
  toggleFeatureSelection: (id: string) => void;
  onAddFeature: (packageId: string) => void;
  onDeleteFeature: (packageId: string, featureId: string) => void;
  onDragEnd: (event: DragEndEvent, packageId: string) => void;
  markAsChanged: () => void;
}

export function FeaturesList({
  pkg,
  isEditMode,
  selectedFeatures,
  setPackagesAction,
  toggleFeatureSelection,
  onAddFeature,
  onDeleteFeature,
  onDragEnd,
  markAsChanged,
}: FeaturesListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  return (
    <div className="border-t pt-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">Features</h3>
        <Button
          size="sm"
          onClick={() => onAddFeature(pkg.id)}
        >
          <Plus className="mr-1 h-3 w-3" /> Add Feature
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={(event) => onDragEnd(event, pkg.id)}
      >
        <SortableContext
          items={pkg.features.map((f) => f.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {pkg.features.map((feature) => (
              <SortableFeature
                key={feature.id}
                feature={feature}
                onDeleteFeature={onDeleteFeature}
                setPackagesAction={setPackagesAction}
                packageId={pkg.id}
                selectedFeatures={selectedFeatures}
                toggleFeatureSelection={toggleFeatureSelection}
                markAsChanged={markAsChanged}
                isEditMode={isEditMode}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}