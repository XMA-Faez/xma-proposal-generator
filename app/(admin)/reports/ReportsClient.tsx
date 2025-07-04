"use client";

import React, { useState, useMemo } from "react";
import { Card } from "@/components/ui/design-card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Pie, PieChart, Cell, ResponsiveContainer } from "recharts";
import { format, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type DateRange = {
  from: Date | undefined;
  to?: Date | undefined;
};

interface ReportsClientProps {
  initialProposals: any[];
}

const chartConfig = {
  sent: {
    label: "Sent",
    color: "var(--status-sent)",
  },
  accepted: {
    label: "Accepted",
    color: "var(--status-accepted)",
  },
  paid: {
    label: "Paid",
    color: "var(--status-paid)",
  },
  draft: {
    label: "Draft",
    color: "var(--status-draft)",
  },
  expired: {
    label: "Expired",
    color: "var(--status-expired)",
  },
  rejected: {
    label: "Rejected",
    color: "var(--status-rejected)",
  },
} satisfies ChartConfig;

const presets = [
  {
    label: "Last 7 days",
    getValue: () => ({
      from: subDays(new Date(), 6),
      to: new Date(),
    }),
  },
  {
    label: "Last 30 days",
    getValue: () => ({
      from: subDays(new Date(), 29),
      to: new Date(),
    }),
  },
  {
    label: "This week",
    getValue: () => ({
      from: startOfWeek(new Date()),
      to: endOfWeek(new Date()),
    }),
  },
  {
    label: "Month to date",
    getValue: () => ({
      from: startOfMonth(new Date()),
      to: new Date(),
    }),
  },
  {
    label: "This month",
    getValue: () => ({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    }),
  },
  {
    label: "Last month",
    getValue: () => {
      const today = new Date();
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1);
      return {
        from: startOfMonth(lastMonth),
        to: endOfMonth(lastMonth),
      };
    },
  },
  {
    label: "Last 3 months",
    getValue: () => {
      const today = new Date();
      const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
      return {
        from: threeMonthsAgo,
        to: today,
      };
    },
  },
  {
    label: "This year",
    getValue: () => ({
      from: new Date(new Date().getFullYear(), 0, 1),
      to: new Date(),
    }),
  },
];

export default function ReportsClient({ initialProposals }: ReportsClientProps) {
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });
  const [selectedPreset, setSelectedPreset] = useState("Last 30 days");

  // Filter proposals based on date range
  const filteredProposals = useMemo(() => {
    if (!date?.from) return initialProposals;
    
    return initialProposals.filter((proposal) => {
      const proposalDate = new Date(proposal.created_at);
      if (date.to) {
        return proposalDate >= date.from && proposalDate <= date.to;
      } else {
        // If only from date is selected, show proposals from that date onwards
        return proposalDate >= date.from;
      }
    });
  }, [initialProposals, date]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const total = filteredProposals.length;
    const statusCounts = filteredProposals.reduce((acc, proposal) => {
      const status = proposal.status?.toLowerCase() || 'draft';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate rates
    const sent = statusCounts.sent || 0;
    const accepted = statusCounts.accepted || 0;
    const paid = statusCounts.paid || 0;
    const draft = statusCounts.draft || 0;
    const expired = statusCounts.expired || 0;
    const rejected = statusCounts.rejected || 0;

    const sendRate = total > 0 ? ((sent + accepted + paid) / total) * 100 : 0;
    const closeRate = total > 0 ? ((accepted + paid) / total) * 100 : 0;
    const acceptedRate = total > 0 ? (accepted / total) * 100 : 0;
    const paidRate = total > 0 ? (paid / total) * 100 : 0;

    // Calculate revenue and discounts
    let totalRevenue = 0;
    let totalDiscount = 0;
    let totalBeforeDiscount = 0;

    filteredProposals.forEach((proposal) => {
      // Only count revenue for paid proposals
      if (proposal.proposal_data && proposal.status?.toLowerCase() === 'paid') {
        const data = proposal.proposal_data;
        const discounts = data.discounts || {
          packageDiscount: { type: "percentage", value: 0 },
          serviceDiscounts: {},
          overallDiscount: { type: "percentage", value: 0 },
        };

        // Calculate package price
        let packagePrice = 0;
        let discountedPackagePrice = 0;
        
        if (data.includePackage !== false && data.selectedPackage) {
          packagePrice = parseInt(data.selectedPackage.price?.toString().replace(/,/g, '') || '0');
          
          // Apply package discount
          if (discounts.packageDiscount.type === 'percentage') {
            discountedPackagePrice = packagePrice * (1 - discounts.packageDiscount.value / 100);
          } else {
            discountedPackagePrice = packagePrice - discounts.packageDiscount.value;
          }
          discountedPackagePrice = Math.max(0, discountedPackagePrice);
        }

        // Calculate services price
        let servicesPrice = 0;
        let discountedServicesPrice = 0;
        
        if (Array.isArray(data.selectedServices)) {
          data.selectedServices.forEach((service) => {
            const servicePrice = parseInt(service.price?.toString().replace(/,/g, '') || '0');
            servicesPrice += servicePrice;
            
            // Apply service discount
            const serviceDiscount = discounts.serviceDiscounts?.[service.id] || { type: "percentage", value: 0 };
            let discountedServicePrice = servicePrice;
            
            if (serviceDiscount.type === 'percentage') {
              discountedServicePrice = servicePrice * (1 - serviceDiscount.value / 100);
            } else {
              discountedServicePrice = servicePrice - serviceDiscount.value;
            }
            
            discountedServicesPrice += Math.max(0, discountedServicePrice);
          });
        }

        // Calculate subtotal after package and service discounts
        const subtotal = discountedPackagePrice + discountedServicesPrice;
        
        // Apply overall discount
        let finalPriceBeforeTax = subtotal;
        if (discounts.overallDiscount.type === 'percentage') {
          finalPriceBeforeTax = subtotal * (1 - discounts.overallDiscount.value / 100);
        } else {
          finalPriceBeforeTax = subtotal - discounts.overallDiscount.value;
        }
        finalPriceBeforeTax = Math.max(0, finalPriceBeforeTax);

        // Add tax if applicable
        const includeTax = data.includeTax !== false;
        const taxAmount = includeTax ? finalPriceBeforeTax * 0.05 : 0;
        const finalPrice = finalPriceBeforeTax + taxAmount;

        // Calculate total discount amount
        const originalTotal = packagePrice + servicesPrice;
        const discountAmount = originalTotal - finalPriceBeforeTax;

        totalBeforeDiscount += originalTotal;
        totalDiscount += discountAmount;
        totalRevenue += finalPrice;
      }
    });

    return {
      total,
      statusCounts,
      rates: {
        send: sendRate,
        close: closeRate,
        accepted: acceptedRate,
        paid: paidRate,
      },
      revenue: {
        total: totalRevenue,
        totalBeforeDiscount,
        totalDiscount,
        averagePerProposal: paid > 0 ? totalRevenue / paid : 0,
        discountPercentage: totalBeforeDiscount > 0 ? (totalDiscount / totalBeforeDiscount) * 100 : 0,
      },
      chartData: {
        status: [
          { name: "Draft", value: draft, fill: chartConfig.draft.color },
          { name: "Sent", value: sent, fill: chartConfig.sent.color },
          { name: "Accepted", value: accepted, fill: chartConfig.accepted.color },
          { name: "Paid", value: paid, fill: chartConfig.paid.color },
          { name: "Expired", value: expired, fill: chartConfig.expired.color },
          { name: "Rejected", value: rejected, fill: chartConfig.rejected.color },
        ].filter(item => item.value > 0),
        sendRate: [
          { name: "Sent/Active", value: sendRate, fill: "var(--status-sent)" },
          { name: "Not Sent", value: 100 - sendRate, fill: "var(--surface-interactive)" },
        ],
        closeRate: [
          { name: "Closed", value: closeRate, fill: "var(--status-accepted)" },
          { name: "Open", value: 100 - closeRate, fill: "var(--surface-interactive)" },
        ],
        acceptedRate: [
          { name: "Accepted", value: acceptedRate, fill: "var(--status-accepted)" },
          { name: "Other", value: 100 - acceptedRate, fill: "var(--surface-interactive)" },
        ],
        paidRate: [
          { name: "Paid", value: paidRate, fill: "var(--status-paid)" },
          { name: "Unpaid", value: 100 - paidRate, fill: "var(--surface-interactive)" },
        ],
      },
    };
  }, [filteredProposals]);

  const handlePresetClick = (preset: typeof presets[0]) => {
    const range = preset.getValue();
    setDate(range);
    setSelectedPreset(preset.label);
  };

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <Card variant="primary" size="lg">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-text-primary">Select Time Period</h3>
          <p className="text-sm text-text-muted">Choose a date range to view analytics</p>
        </div>
        <div>
          <Select
            value={selectedPreset}
            onValueChange={(value) => {
              const preset = presets.find(p => p.label === value);
              if (preset) {
                handlePresetClick(preset);
              }
            }}
          >
            <SelectTrigger className="w-full md:w-[280px] bg-surface-elevated border-border-primary">
              <SelectValue placeholder="Select time period" />
            </SelectTrigger>
            <SelectContent className="bg-surface-elevated border-border-primary">
              {presets.map((preset) => (
                <SelectItem 
                  key={preset.label} 
                  value={preset.label}
                  className="hover:bg-surface-interactive focus:bg-surface-interactive"
                >
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {date?.from && date?.to && (
            <div className="mt-4 text-sm text-text-muted">
              Showing data from {format(date.from, "MMM dd, yyyy")} to {format(date.to, "MMM dd, yyyy")}
            </div>
          )}
        </div>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="primary" size="md">
          <h4 className="text-sm font-medium text-text-muted mb-2">Total Proposals</h4>
          <div className="text-2xl font-bold text-text-primary">{metrics.total}</div>
        </Card>
        
        <Card variant="primary" size="md">
          <h4 className="text-sm font-medium text-text-muted mb-2">Send Rate</h4>
          <div className="text-2xl font-bold text-text-primary">{metrics.rates.send.toFixed(1)}%</div>
        </Card>
        
        <Card variant="primary" size="md">
          <h4 className="text-sm font-medium text-text-muted mb-2">Close Rate</h4>
          <div className="text-2xl font-bold text-text-primary">{metrics.rates.close.toFixed(1)}%</div>
        </Card>
        
        <Card variant="primary" size="md">
          <h4 className="text-sm font-medium text-text-muted mb-2">Paid Rate</h4>
          <div className="text-2xl font-bold text-text-primary">{metrics.rates.paid.toFixed(1)}%</div>
        </Card>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="primary" size="md">
          <h4 className="text-sm font-medium text-text-muted mb-2">Total Revenue</h4>
          <div className="text-2xl font-bold text-text-primary">AED {new Intl.NumberFormat('en-US').format(Math.round(metrics.revenue.total))}</div>
        </Card>
        
        <Card variant="primary" size="md">
          <h4 className="text-sm font-medium text-text-muted mb-2">Total Discounts</h4>
          <div className="text-2xl font-bold text-text-primary">AED {new Intl.NumberFormat('en-US').format(Math.round(metrics.revenue.totalDiscount))}</div>
          <div className="text-xs text-text-subtle mt-1">{metrics.revenue.discountPercentage.toFixed(1)}% of original</div>
        </Card>
        
        <Card variant="primary" size="md">
          <h4 className="text-sm font-medium text-text-muted mb-2">Average Revenue</h4>
          <div className="text-2xl font-bold text-text-primary">AED {new Intl.NumberFormat('en-US').format(Math.round(metrics.revenue.averagePerProposal))}</div>
          <div className="text-xs text-text-subtle mt-1">per paid proposal</div>
        </Card>
        
        <Card variant="primary" size="md">
          <h4 className="text-sm font-medium text-text-muted mb-2">Revenue Before Discount</h4>
          <div className="text-2xl font-bold text-text-primary">AED {new Intl.NumberFormat('en-US').format(Math.round(metrics.revenue.totalBeforeDiscount))}</div>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card variant="primary" size="lg">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-text-primary">Proposal Status Distribution</h3>
            <p className="text-sm text-text-muted">Overall status breakdown</p>
          </div>
          <div>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={metrics.chartData.status}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {metrics.chartData.status.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </Card>

        {/* Send Rate */}
        <Card variant="primary" size="lg">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-text-primary">Send Rate</h3>
            <p className="text-sm text-text-muted">Proposals sent vs drafts</p>
          </div>
          <div>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={metrics.chartData.sendRate}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name} ${value.toFixed(1)}%`}
                  >
                    {metrics.chartData.sendRate.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </Card>

        {/* Close Rate */}
        <Card variant="primary" size="lg">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-text-primary">Close Rate</h3>
            <p className="text-sm text-text-muted">Accepted + Paid proposals</p>
          </div>
          <div>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={metrics.chartData.closeRate}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name} ${value.toFixed(1)}%`}
                  >
                    {metrics.chartData.closeRate.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </Card>

        {/* Paid Rate */}
        <Card variant="primary" size="lg">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-text-primary">Payment Rate</h3>
            <p className="text-sm text-text-muted">Paid vs unpaid proposals</p>
          </div>
          <div>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={metrics.chartData.paidRate}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name} ${value.toFixed(1)}%`}
                  >
                    {metrics.chartData.paidRate.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
