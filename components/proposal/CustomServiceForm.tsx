"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { commonClasses, brandButtonVariants } from "@/lib/design-system";
import { Plus, Trash2, Edit2, Check, X, GripVertical, ChevronUp, ChevronDown } from "lucide-react";
import { CustomService, PaymentType } from "./CustomProposalClient";

interface CustomServiceFormProps {
  services: CustomService[];
  onAddService: (service: CustomService) => void;
  onUpdateService: (id: string, service: CustomService) => void;
  onRemoveService: (id: string) => void;
}

export default function CustomServiceForm({
  services,
  onAddService,
  onUpdateService,
  onRemoveService,
}: CustomServiceFormProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentFeature, setCurrentFeature] = useState("");
  const featureInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<Omit<CustomService, "id">>({
    name: "",
    description: "",
    features: [],
    price: 0,
    paymentType: "monthly",
    isMainService: false,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      features: [],
      price: 0,
      paymentType: "monthly",
      isMainService: false,
    });
    setCurrentFeature("");
    setIsAdding(false);
    setEditingId(null);
  };

  const handleAddFeature = () => {
    if (!currentFeature.trim()) return;
    
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, currentFeature.trim()],
    }));
    setCurrentFeature("");
    
    // Focus back to input for next feature
    setTimeout(() => {
      if (featureInputRef.current) {
        featureInputRef.current.focus();
      }
    }, 0);
  };

  const handleFeatureKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddFeature();
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleFeatureChange = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.map((f, i) => (i === index ? value : f)),
    }));
  };

  const moveFeatureUp = (index: number) => {
    if (index === 0) return;
    setFormData((prev) => {
      const newFeatures = [...prev.features];
      [newFeatures[index - 1], newFeatures[index]] = [newFeatures[index], newFeatures[index - 1]];
      return { ...prev, features: newFeatures };
    });
  };

  const moveFeatureDown = (index: number) => {
    if (index === formData.features.length - 1) return;
    setFormData((prev) => {
      const newFeatures = [...prev.features];
      [newFeatures[index], newFeatures[index + 1]] = [newFeatures[index + 1], newFeatures[index]];
      return { ...prev, features: newFeatures };
    });
  };

  const handleSubmit = () => {
    if (!formData.name || formData.price < 0) {
      alert("Please fill in service name and enter a valid price (0 or higher)");
      return;
    }

    if (formData.features.length === 0) {
      alert("Please add at least one feature");
      return;
    }

    const service: CustomService = {
      id: editingId || Date.now().toString(),
      ...formData,
    };

    if (editingId) {
      onUpdateService(editingId, service);
    } else {
      onAddService(service);
    }

    resetForm();
  };

  const startEdit = (service: CustomService) => {
    setEditingId(service.id);
    setFormData({
      name: service.name,
      description: service.description,
      features: service.features,
      price: service.price,
      paymentType: service.paymentType,
      isMainService: service.isMainService,
    });
    setIsAdding(true);
  };

  const hasMainService = services.some((s) => s.isMainService);

  return (
    <div className="space-y-4">
      {/* Existing Services */}
      {services.map((service) => (
        <Card key={service.id} variant="elevated" size="md">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-text-primary">{service.name}</h3>
                {service.isMainService && (
                  <span className="text-xs bg-brand-primary text-text-primary px-2 py-1 rounded">
                    Main Service
                  </span>
                )}
              </div>
              <p className="text-sm text-text-secondary mt-1">{service.description}</p>
              <ul className="mt-2 space-y-1">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="text-sm text-text-muted">
                    • {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex items-center gap-4 text-sm">
                <span className="text-text-primary font-medium">
                  {service.price.toLocaleString()} AED
                </span>
                <span className="text-text-muted">
                  {service.paymentType === "monthly" ? "per month" : "one-time"}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => startEdit(service)}
                className="text-text-muted hover:text-text-primary"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onRemoveService(service.id)}
                className="text-text-muted hover:text-semantic-error"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}

      {/* Add/Edit Form */}
      {isAdding ? (
        <Card variant="elevated" size="md">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Service Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-surface-interactive border-border-interactive text-text-primary"
              />
              {!hasMainService && !editingId && (
                <label className="flex items-center gap-2 text-sm text-text-secondary whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={formData.isMainService}
                    onChange={(e) =>
                      setFormData({ ...formData, isMainService: e.target.checked })
                    }
                    className="rounded border-gray-300"
                  />
                  Main Service
                </label>
              )}
            </div>

            <Textarea
              placeholder="Service Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-surface-interactive border-border-interactive text-text-primary"
              rows={3}
            />

            <div>
              <label className="text-sm font-medium text-text-secondary mb-2 block">Features</label>
              
              {/* Always-ready input for new features */}
              <div className="mb-3">
                <Input
                  ref={featureInputRef}
                  value={currentFeature}
                  onChange={(e) => setCurrentFeature(e.target.value)}
                  onKeyPress={handleFeatureKeyPress}
                  className="bg-surface-interactive border-border-interactive text-text-primary"
                  placeholder={`Feature ${formData.features.length + 1} (Press Enter to add)`}
                />
                <p className="text-xs text-text-muted mt-1">
                  Press Enter to add the feature and move to the next one
                </p>
              </div>

              {/* Existing Features */}
              {formData.features.map((feature, index) => (
                <div key={index} className="flex gap-2 mb-2 items-center">
                  <span className="text-sm text-text-muted w-6">{index + 1}.</span>
                  <span className="flex-1 text-sm text-text-secondary bg-surface-elevated px-3 py-2 rounded border border-border-primary">
                    {feature}
                  </span>
                  
                  {/* Move buttons */}
                  <div className="flex flex-col">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => moveFeatureUp(index)}
                      disabled={index === 0}
                      className="text-text-muted hover:text-text-primary p-1 h-auto"
                    >
                      <ChevronUp className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => moveFeatureDown(index)}
                      disabled={index === formData.features.length - 1}
                      className="text-text-muted hover:text-text-primary p-1 h-auto"
                    >
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveFeature(index)}
                    className="text-text-muted hover:text-semantic-error"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              {formData.features.length === 0 && (
                <p className="text-sm text-text-muted italic">
                  No features added yet. Start typing above to add your first feature.
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-text-secondary mb-1 block">Price (AED)</label>
                <Input
                  type="number"
                  placeholder="0"
                  min="0"
                  step="0.01"
                  value={formData.price.toString()}
                  onChange={(e) => {
                    const value = e.target.value;
                    const numValue = value === "" ? 0 : parseFloat(value);
                    setFormData({ ...formData, price: isNaN(numValue) ? 0 : numValue });
                  }}
                  className="bg-surface-interactive border-border-interactive text-text-primary"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-text-secondary mb-1 block">Payment Type</label>
                <select
                  value={formData.paymentType}
                  onChange={(e) =>
                    setFormData({ ...formData, paymentType: e.target.value as PaymentType })
                  }
                  className="w-full rounded-md bg-surface-interactive border-border-interactive text-text-primary px-3 py-2"
                >
                  <option value="monthly">Monthly</option>
                  <option value="fixed">One-time</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={resetForm}
                className="text-text-muted hover:text-text-primary"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                className="bg-brand-primary hover:bg-interactive-primary-hover text-text-primary"
              >
                <Check className="h-4 w-4 mr-1" />
                {editingId ? "Update" : "Add"} Service
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Button
          onClick={() => setIsAdding(true)}
          variant="outline"
          className="w-full bg-surface-elevated border-border-primary text-text-secondary hover:text-text-primary hover:bg-surface-elevated"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      )}
    </div>
  );
}
