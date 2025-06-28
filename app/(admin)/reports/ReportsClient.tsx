"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Pie, PieChart, Cell, ResponsiveContainer } from "recharts";
import { format, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown } from "lucide-react";

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
          { name: "Sent/Active", value: sendRate, fill: "#1d4ed8" }, // blue-700 matching sent status
          { name: "Not Sent", value: 100 - sendRate, fill: "#3f3f46" }, // gray-700
        ],
        closeRate: [
          { name: "Closed", value: closeRate, fill: "#15803d" }, // green-700 matching accepted status
          { name: "Open", value: 100 - closeRate, fill: "#3f3f46" }, // gray-700
        ],
        acceptedRate: [
          { name: "Accepted", value: acceptedRate, fill: "#15803d" }, // green-700 matching accepted status
          { name: "Other", value: 100 - acceptedRate, fill: "#3f3f46" }, // gray-700
        ],
        paidRate: [
          { name: "Paid", value: paidRate, fill: "#7e22ce" }, // purple-700 matching paid status
          { name: "Unpaid", value: 100 - paidRate, fill: "#3f3f46" }, // gray-700
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
      <Card>
        <CardHeader>
          <CardTitle>Select Time Period</CardTitle>
          <CardDescription>Choose a date range to view analytics</CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedPreset}
            onValueChange={(value) => {
              const preset = presets.find(p => p.label === value);
              if (preset) {
                handlePresetClick(preset);
              }
            }}
          >
            <SelectTrigger className="w-full md:w-[280px] bg-zinc-800 border-zinc-700">
              <SelectValue placeholder="Select time period" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700">
              {presets.map((preset) => (
                <SelectItem 
                  key={preset.label} 
                  value={preset.label}
                  className="hover:bg-zinc-700 focus:bg-zinc-700"
                >
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {date?.from && date?.to && (
            <div className="mt-4 text-sm text-zinc-400">
              Showing data from {format(date.from, "MMM dd, yyyy")} to {format(date.to, "MMM dd, yyyy")}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Proposals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Send Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.rates.send.toFixed(1)}%</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Close Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.rates.close.toFixed(1)}%</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Paid Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.rates.paid.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">AED {new Intl.NumberFormat('en-US').format(Math.round(metrics.revenue.total))}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Discounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">AED {new Intl.NumberFormat('en-US').format(Math.round(metrics.revenue.totalDiscount))}</div>
            <div className="text-xs text-zinc-500 mt-1">{metrics.revenue.discountPercentage.toFixed(1)}% of original</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">AED {new Intl.NumberFormat('en-US').format(Math.round(metrics.revenue.averagePerProposal))}</div>
            <div className="text-xs text-zinc-500 mt-1">per paid proposal</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Revenue Before Discount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">AED {new Intl.NumberFormat('en-US').format(Math.round(metrics.revenue.totalBeforeDiscount))}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Proposal Status Distribution</CardTitle>
            <CardDescription>Overall status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Send Rate */}
        <Card>
          <CardHeader>
            <CardTitle>Send Rate</CardTitle>
            <CardDescription>Proposals sent vs drafts</CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Close Rate */}
        <Card>
          <CardHeader>
            <CardTitle>Close Rate</CardTitle>
            <CardDescription>Accepted + Paid proposals</CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Paid Rate */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Rate</CardTitle>
            <CardDescription>Paid vs unpaid proposals</CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
