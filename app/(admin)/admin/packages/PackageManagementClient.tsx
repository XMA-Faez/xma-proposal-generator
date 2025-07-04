"use client";

import { useReducer, useMemo, useCallback } from "react";
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

interface PackageState {
  packages: Package[];
  collapsedPackages: Set<string>;
  selectedFeatures: Set<string>;
  editingPackages: Set<string>;
  packageSnapshots: Record<string, Package>;
}

type PackageAction = 
  | { type: 'SET_PACKAGES'; payload: Package[] }
  | { type: 'TOGGLE_COLLAPSE'; payload: string }
  | { type: 'TOGGLE_FEATURE_SELECTION'; payload: string }
  | { type: 'START_EDIT'; payload: { packageId: string; package: Package } }
  | { type: 'CANCEL_EDIT'; payload: string }
  | { type: 'UPDATE_PACKAGE_FIELD'; payload: { packageId: string; field: string; value: unknown } }
  | { type: 'CLEAR_SELECTED_FEATURES' };

function toggleSetItem<T>(set: Set<T>, item: T): Set<T> {
  const newSet = new Set(set);
  if (newSet.has(item)) {
    newSet.delete(item);
  } else {
    newSet.add(item);
  }
  return newSet;
}

function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as unknown as T;
  if (typeof obj === 'object') {
    const cloned = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
  return obj;
}

const packageReducer = (state: PackageState, action: PackageAction): PackageState => {
  switch (action.type) {
    case 'SET_PACKAGES':
      return { ...state, packages: action.payload };
    case 'TOGGLE_COLLAPSE':
      return {
        ...state,
        collapsedPackages: toggleSetItem(state.collapsedPackages, action.payload),
      };
    case 'TOGGLE_FEATURE_SELECTION':
      return {
        ...state,
        selectedFeatures: toggleSetItem(state.selectedFeatures, action.payload),
      };
    case 'START_EDIT':
      return {
        ...state,
        packageSnapshots: {
          ...state.packageSnapshots,
          [action.payload.packageId]: deepClone(action.payload.package),
        },
        editingPackages: new Set([...state.editingPackages, action.payload.packageId]),
      };
    case 'CANCEL_EDIT': {
      const snapshot = state.packageSnapshots[action.payload];
      const newSnapshots = { ...state.packageSnapshots };
      delete newSnapshots[action.payload];
      const newEditingPackages = new Set(state.editingPackages);
      newEditingPackages.delete(action.payload);
      return {
        ...state,
        packages: snapshot
          ? state.packages.map(pkg => pkg.id === action.payload ? snapshot : pkg)
          : state.packages,
        packageSnapshots: newSnapshots,
        editingPackages: newEditingPackages,
      };
    }
    case 'UPDATE_PACKAGE_FIELD':
      return {
        ...state,
        packages: state.packages.map(pkg =>
          pkg.id === action.payload.packageId
            ? { ...pkg, [action.payload.field]: action.payload.value }
            : pkg
        ),
      };
    case 'CLEAR_SELECTED_FEATURES':
      return { ...state, selectedFeatures: new Set() };
    default:
      return state;
  }
};

interface PackageManagementClientProps {
  initialPackages: Package[];
}

export default function PackageManagementClient({
  initialPackages,
}: PackageManagementClientProps) {
  const [state, dispatch] = useReducer(packageReducer, {
    packages: initialPackages,
    collapsedPackages: new Set(initialPackages.map(pkg => pkg.id)),
    selectedFeatures: new Set(),
    editingPackages: new Set(),
    packageSnapshots: {},
  });

  const { packages, collapsedPackages, selectedFeatures, editingPackages, packageSnapshots } = state;

  const setPackages = useCallback((newPackages: Package[]) => {
    dispatch({ type: 'SET_PACKAGES', payload: newPackages });
  }, []);

  const setPackageSnapshots = useCallback((updater: (prev: Record<string, Package>) => Record<string, Package>) => {
    const newSnapshots = updater(packageSnapshots);
    dispatch({ type: 'SET_PACKAGES', payload: packages.map(pkg => {
      const snapshot = newSnapshots[pkg.id];
      return snapshot || pkg;
    }) });
  }, [packages, packageSnapshots]);

  const setEditingPackages = useCallback((updater: (prev: Set<string>) => Set<string>) => {
    const newEditingPackages = updater(editingPackages);
    newEditingPackages.forEach(id => {
      if (!editingPackages.has(id)) {
        const pkg = packages.find(p => p.id === id);
        if (pkg) {
          dispatch({ type: 'START_EDIT', payload: { packageId: id, package: pkg } });
        }
      }
    });
  }, [packages, editingPackages]);

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
    () => {}, // Removed unused setOriginalPackages
    editingPackages,
    setEditingPackages,
  );

  const toggleCollapse = useCallback((packageId: string) => {
    dispatch({ type: 'TOGGLE_COLLAPSE', payload: packageId });
  }, []);

  const toggleFeatureSelection = useCallback((featureId: string) => {
    dispatch({ type: 'TOGGLE_FEATURE_SELECTION', payload: featureId });
  }, []);

  const startEditMode = useCallback((packageId: string) => {
    const pkg = packages.find(p => p.id === packageId);
    if (pkg) {
      dispatch({ type: 'START_EDIT', payload: { packageId, package: pkg } });
    }
  }, [packages]);

  const cancelPackageEdit = useCallback((packageId: string) => {
    dispatch({ type: 'CANCEL_EDIT', payload: packageId });
  }, []);

  const updatePackageField = useCallback((packageId: string, field: string, value: unknown) => {
    dispatch({ type: 'UPDATE_PACKAGE_FIELD', payload: { packageId, field, value } });
  }, []);

  const handleBulkDeleteFeaturesWithClear = useCallback(
    (selectedFeatures: Set<string>) => {
      handleBulkDeleteFeatures(selectedFeatures, () => dispatch({ type: 'CLEAR_SELECTED_FEATURES' }));
    },
    [handleBulkDeleteFeatures]
  );

  const memoizedPackageCards = useMemo(() => 
    packages.map((pkg) => (
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
        markAsChangedAction={() => {}}
      />
    )), 
    [
      packages, 
      collapsedPackages, 
      editingPackages, 
      isSaving, 
      selectedFeatures, 
      setPackages, 
      toggleCollapse, 
      startEditMode, 
      cancelPackageEdit, 
      savePackageChanges, 
      handleDuplicatePackage, 
      handleDeletePackage, 
      updatePackageField, 
      toggleFeatureSelection, 
      handleAddFeature, 
      handleDeleteFeature, 
      handleDragEnd
    ]
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Package Management</h1>
        <div className="flex gap-2">
          {selectedFeatures.size > 0 && (
            <Button 
              variant="destructive" 
              onClick={() => handleBulkDeleteFeaturesWithClear(selectedFeatures)}
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
        {memoizedPackageCards}
      </div>
    </div>
  );
}
