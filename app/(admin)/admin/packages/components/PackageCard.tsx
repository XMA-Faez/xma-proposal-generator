"use client";

import { DragEndEvent } from "@dnd-kit/core";
import { Card } from "@/components/ui/design-card";
import { PackageHeader } from "./PackageHeader";
import { PackageFields } from "./PackageFields";
import { FeaturesList } from "./FeaturesList";

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

interface PackageCardProps {
  pkg: Package;
  isCollapsed: boolean;
  isEditMode: boolean;
  isSaving: boolean;
  selectedFeatures: Set<string>;
  setPackagesAction: React.Dispatch<React.SetStateAction<Package[]>>;
  onToggleCollapseAction: (packageId: string) => void;
  onStartEditAction: (packageId: string) => void;
  onCancelEditAction: (packageId: string) => void;
  onSaveAction: (packageId: string) => void;
  onDuplicateAction: (packageId: string) => void;
  onDeleteAction: (packageId: string) => void;
  onUpdateFieldAction: (packageId: string, field: string, value: unknown) => void;
  toggleFeatureSelectionAction: (id: string) => void;
  onAddFeatureAction: (packageId: string) => void;
  onDeleteFeatureAction: (packageId: string, featureId: string) => void;
  onDragEndAction: (event: DragEndEvent, packageId: string) => void;
  markAsChangedAction: () => void;
}

export function PackageCard({
  pkg,
  isCollapsed,
  isEditMode,
  isSaving,
  selectedFeatures,
  setPackagesAction,
  onToggleCollapseAction,
  onStartEditAction,
  onCancelEditAction,
  onSaveAction,
  onDuplicateAction,
  onDeleteAction,
  onUpdateFieldAction,
  toggleFeatureSelectionAction,
  onAddFeatureAction,
  onDeleteFeatureAction,
  onDragEndAction,
  markAsChangedAction,
}: PackageCardProps) {
  return (
    <Card variant="primary" size="lg">
      <div className="space-y-4">
        <PackageHeader
          pkg={pkg}
          isCollapsed={isCollapsed}
          isEditMode={isEditMode}
          isSaving={isSaving}
          onToggleCollapse={onToggleCollapseAction}
          onStartEdit={onStartEditAction}
          onCancelEdit={onCancelEditAction}
          onSave={onSaveAction}
          onDuplicate={onDuplicateAction}
          onDelete={onDeleteAction}
        />

        {!isCollapsed && (
          <>
            <PackageFields
              pkg={pkg}
              isEditMode={isEditMode}
              onUpdateField={onUpdateFieldAction}
              onMarkAsChanged={markAsChangedAction}
            />

            <FeaturesList
              pkg={pkg}
              isEditMode={isEditMode}
              selectedFeatures={selectedFeatures}
              setPackagesAction={setPackagesAction}
              toggleFeatureSelection={toggleFeatureSelectionAction}
              onAddFeature={onAddFeatureAction}
              onDeleteFeature={onDeleteFeatureAction}
              onDragEnd={onDragEndAction}
              markAsChanged={markAsChangedAction}
            />
          </>
        )}
      </div>
    </Card>
  );
}