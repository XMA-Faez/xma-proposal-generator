"use client";

import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

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

interface PackageFieldsProps {
  pkg: Package;
  isEditMode: boolean;
  onUpdateField: (packageId: string, field: string, value: unknown) => void;
  onMarkAsChanged: () => void;
}

export function PackageFields({
  pkg,
  isEditMode,
  onUpdateField,
  onMarkAsChanged,
}: PackageFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="text-sm font-medium text-zinc-500">
            Name
          </label>
          {isEditMode ? (
            <Input
              value={pkg.name}
              onChange={(e) => {
                onUpdateField(pkg.id, "name", e.target.value);
                onMarkAsChanged();
              }}
              className="mt-1"
            />
          ) : (
            <p className="mt-1 font-medium">
              {pkg.name}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-zinc-500">
            AED Price
          </label>
          {isEditMode ? (
            <Input
              type="number"
              value={pkg.price}
              onChange={(e) => {
                onUpdateField(
                  pkg.id,
                  "price",
                  Number(e.target.value),
                );
                onMarkAsChanged();
              }}
              className="mt-1"
            />
          ) : (
            <p className="mt-1 font-medium">
              {pkg.price} AED
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-zinc-500">
            USD Price
          </label>
          {isEditMode ? (
            <Input
              type="number"
              value={pkg.usd_price || 0}
              onChange={(e) => {
                onUpdateField(
                  pkg.id,
                  "usd_price",
                  Number(e.target.value),
                );
                onMarkAsChanged();
              }}
              className="mt-1"
            />
          ) : (
            <p className="mt-1 font-medium">
              ${pkg.usd_price || 0} USD
            </p>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {isEditMode ? (
              <>
                <Checkbox
                  checked={pkg.is_popular || false}
                  onCheckedChange={(checked) => {
                    onUpdateField(pkg.id, "is_popular", checked);
                    onMarkAsChanged();
                  }}
                />
                <label className="text-sm font-medium">Popular</label>
              </>
            ) : (
              <p className="text-sm font-medium">
                {pkg.is_popular ? "Popular Package" : ""}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mb-4">
        <label className="text-sm font-medium text-zinc-500">
          Description
        </label>
        {isEditMode ? (
          <Input
            value={pkg.description || ""}
            onChange={(e) => {
              onUpdateField(
                pkg.id,
                "description",
                e.target.value,
              );
              onMarkAsChanged();
            }}
            className="mt-1"
            placeholder="Package description..."
          />
        ) : (
          <p className="mt-1 text-sm text-gray-600">
            {pkg.description || "No description"}
          </p>
        )}
      </div>
    </>
  );
}