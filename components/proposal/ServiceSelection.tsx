"use client";

import React from "react";
import { formatPrice } from "@/lib/proposalUtils";
import { Card } from "@/components/ui/design-card";
import ServiceInfo from "./ServiceInfo";

interface Service {
  id: string;
  name: string;
  price: number;
  currency: string;
  description: string;
  is_monthly?: boolean;
  setup_fee?: number;
}

interface ServiceSelectionProps {
  services: Service[];
  selectedServices: Service[];
  toggleService: (service: Service) => void;
  includePackage: boolean;
}

const ServiceSelection: React.FC<ServiceSelectionProps> = ({
  services,
  selectedServices,
  toggleService,
  includePackage,
}) => {
  return (
    <Card className="mb-8">
      <h2 className="text-xl font-bold mb-4 text-text-primary">
        {includePackage ? "Additional Services (Optional)" : "Services"}
      </h2>
      <div className="space-y-4">
        {services.map((service) => {
          const isSelected = selectedServices.some(
            (s) => s.id === service.id
          );

          return (
            <Card
              key={service.id}
              variant="elevated"
              size="md"
              selected={isSelected}
              className="flex flex-col"
            >
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id={`service-${service.id}`}
                  checked={isSelected}
                  onChange={() => toggleService(service)}
                  className="mt-1 h-4 w-4 text-brand-primary focus:ring-brand-primary border-border-interactive rounded bg-surface-interactive"
                />
                <label
                  htmlFor={`service-${service.id}`}
                  className="ml-3 flex-grow cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        <span className="block font-medium text-text-primary">
                          {service.name}
                        </span>
                        <ServiceInfo service={service} />
                      </div>
                      <span className="block text-sm text-text-muted mt-1">
                        {service.description &&
                          service.description.substring(0, 80)}
                        ...
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="block font-medium text-text-primary">
                        {formatPrice(service.price)}{" "}
                        {service.currency}
                        {service.is_monthly &&
                          ` + ${service.setup_fee}/mo`}
                      </span>
                    </div>
                  </div>
                </label>
              </div>
            </Card>
          );
        })}
      </div>
    </Card>
  );
};

export default ServiceSelection;
