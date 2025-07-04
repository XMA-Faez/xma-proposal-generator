"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { PackageCard } from "./components/PackageCard";
import { usePackageOperations } from "./hooks/usePackageOperations";

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

interface PackageManagementClientProps {
  initialPackages: Package[];
}

export default function PackageManagementClient({
  initialPackages,
}: PackageManagementClientProps) {
  const [packages, setPackages] = useState<Package[]>(initialPackages);
  const [collapsedPackages, setCollapsedPackages] = useState<Set<string>>(
    new Set(initialPackages.map(pkg => pkg.id)),
  );
  const [selectedFeatures, setSelectedFeatures] = useState<Set<string>>(
    new Set(),
  );
  const [editingPackages, setEditingPackages] = useState<Set<string>>(new Set());
  const [, setOriginalPackages] = useState<Package[]>(initialPackages);
  const [packageSnapshots, setPackageSnapshots] = useState<{[key: string]: Package}>({});

  const {
    isSaving,
    handleAddPackage,
    handleDeletePackage,
    handleDuplicatePackage,
    savePackageChanges,
    handleAddFeature,
    handleDeleteFeature,
    handleDragEnd,
    handleBulkDeleteFeatures,
  } = usePackageOperations(
    packages,
    setPackages,
    packageSnapshots,
    setPackageSnapshots,
    setOriginalPackages,
    editingPackages,
    setEditingPackages,
  );

  const toggleCollapse = (packageId: string) => {
    setCollapsedPackages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(packageId)) {
        newSet.delete(packageId);
      } else {
        newSet.add(packageId);
      }
      return newSet;
    });
  };

  const toggleFeatureSelection = (featureId: string) => {
    setSelectedFeatures((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(featureId)) {
        newSet.delete(featureId);
      } else {
        newSet.add(featureId);
      }
      return newSet;
    });
  };

  const startEditMode = (packageId: string) => {
    const pkg = packages.find(p => p.id === packageId);
    if (pkg) {
      setPackageSnapshots(prev => ({ ...prev, [packageId]: JSON.parse(JSON.stringify(pkg)) }));
      setEditingPackages(prev => new Set([...prev, packageId]));
    }
  };

  const cancelPackageEdit = (packageId: string) => {
    const snapshot = packageSnapshots[packageId];
    if (snapshot) {
      setPackages(prev => prev.map(pkg => 
        pkg.id === packageId ? snapshot : pkg
      ));
      setPackageSnapshots(prev => {
        const newSnapshots = { ...prev };
        delete newSnapshots[packageId];
        return newSnapshots;
      });
    }
    setEditingPackages(prev => {
      const newSet = new Set(prev);
      newSet.delete(packageId);
      return newSet;
    });
  };

  const markAsChanged = () => {
    // This function can remain for compatibility
  };

  const updatePackageField = (packageId: string, field: string, value: unknown) => {
    setPackages((prev) =>
      prev.map((pkg) =>
        pkg.id === packageId ? { ...pkg, [field]: value } : pkg,
      ),
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Package Management</h1>
        <div className="flex gap-2">
          {selectedFeatures.size > 0 && (
            <Button 
              variant="destructive" 
              onClick={() => handleBulkDeleteFeatures(selectedFeatures, setSelectedFeatures)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete {selectedFeatures.size} Features
            </Button>
          )}
          <Button onClick={handleAddPackage}>
            <Plus className="mr-2 h-4 w-4" /> Add Package
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {packages.map((pkg) => (
          <PackageCard
            key={pkg.id}
            pkg={pkg}
            isCollapsed={collapsedPackages.has(pkg.id)}
            isEditMode={editingPackages.has(pkg.id)}
            isSaving={isSaving}
            selectedFeatures={selectedFeatures}
            setPackagesAction={setPackages}
            onToggleCollapseAction={toggleCollapse}
            onStartEditAction={startEditMode}
            onCancelEditAction={cancelPackageEdit}
            onSaveAction={savePackageChanges}
            onDuplicateAction={handleDuplicatePackage}
            onDeleteAction={handleDeletePackage}
            onUpdateFieldAction={updatePackageField}
            toggleFeatureSelectionAction={toggleFeatureSelection}
            onAddFeatureAction={handleAddFeature}
            onDeleteFeatureAction={handleDeleteFeature}
            onDragEndAction={handleDragEnd}
            markAsChangedAction={markAsChanged}
          />
        ))}
      </div>
    </div>
  );
}
