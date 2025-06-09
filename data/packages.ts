// src/data/packages.js
export const packages = [
  {
    id: "pkg-ad-creation",
    name: "Ad Creation",
    price: 10000,
    currency: "AED",
    popular: false,
    features: [
      { text: "20 Total Ads", bold: true, included: true },
      { text: "10 Static Ads", included: true },
      { text: "10 Video Ads", included: true },
    ],
    description:
      "Professional ad creation package with high-quality static and video content for your marketing campaigns.",
  },
  {
    id: "pkg-lead-generator",
    name: "Lead Generator",
    price: 17500,
    currency: "AED",
    popular: true,
    features: [
      { text: "20 Total Ads", bold: true, included: true },
      { text: "10 Static Ads", included: true },
      { text: "10 Video Ads", included: true },
      { text: "CRM System", included: true },
      { text: "Ad Campaign(s) Set-up", included: true },
    ],
    description:
      "Complete lead generation solution with ad creation, CRM system, and professional campaign setup.",
  },
  {
    id: "pkg-lead-generator-plus",
    name: "Lead Generator +",
    price: 30000,
    currency: "AED",
    popular: false,
    features: [
      { text: "20 Total Ads", bold: true, included: true },
      { text: "10 Static Ads", included: true },
      { text: "10 Video Ads", included: true },
      { text: "CRM System", included: true },
      { text: "Ad Campaign(s) Set-up", included: true },
      { text: "Sales Funnel Audit", included: true },
      { text: "Sales Automation", included: true },
    ],
    description:
      "Premium lead generation package with comprehensive sales funnel optimization and automation features.",
  },
];
