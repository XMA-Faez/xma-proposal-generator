"use client";

import React from "react";
import { formatPrice } from "@/lib/proposalUtils";
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
    <div className="bg-zinc-800 rounded-lg p-6 mb-8">
      <h2 className="text-xl font-bold mb-4 text-red-500">
        {includePackage ? "Additional Services (Optional)" : "Services"}
      </h2>
      <div className="space-y-4">
        {services.map((service) => {
          const isSelected = selectedServices.some(
            (s) => s.id === service.id
          );

          return (
            <div
              key={service.id}
              className={`flex flex-col p-4 rounded-lg ${isSelected ? "bg-zinc-900 border border-red-500/50" : "bg-zinc-900"}`}
            >
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id={`service-${service.id}`}
                  checked={isSelected}
                  onChange={() => toggleService(service)}
                  className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-zinc-600 rounded bg-zinc-700"
                />
                <label
                  htmlFor={`service-${service.id}`}
                  className="ml-3 flex-grow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="block font-medium">
                        {service.name}
                      </span>
                      <span className="block text-sm text-zinc-400 mt-1">
                        {service.description &&
                          service.description.substring(0, 80)}
                        ...
                        <ServiceInfo service={service} />
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="block font-medium">
                        {formatPrice(service.price)}{" "}
                        {service.currency}
                        {service.is_monthly &&
                          ` + ${service.setup_fee}/mo`}
                      </span>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ServiceSelection;
