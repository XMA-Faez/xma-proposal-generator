// src/data/packages.js
export const packages = [
  {
    id: 'pkg-base',
    name: 'Base',
    price: 8000, // Use numbers for calculation
    currency: 'AED',
    popular: false,
    features: [
        { text: '8 Total Ads', bold: true, included: true },
        { text: '5 Static Ads', included: true },
        { text: '3 Video Ads', included: true },
        { text: 'Ad Campaign(s) Set-up', included: true },
        { text: 'CRM', included: true },
        { text: 'WhatsApp Integration', included: true }
    ],
    description: 'Our foundational package designed for businesses starting with digital advertising, focusing on essential ad creation and setup.' // Replace with your description
  },
  {
    id: 'pkg-standard',
    name: 'Standard',
    price: 15000,
    currency: 'AED',
    popular: true,
    features: [
        { text: '18 Total Ads', bold: true, included: true },
        { text: '10 Static Ads', included: true },
        { text: '8 Video Ads', included: true },
        { text: 'Ad Campaign(s) Set-up', included: true },
        { text: 'CRM', included: true },
        { text: 'WhatsApp Integration', included: true }
    ],
    description: 'A balanced package offering a significant increase in ad volume, suitable for growing businesses aiming for broader reach and engagement.' // Replace with your description
  },
  {
    id: 'pkg-premium',
    name: 'Premium',
    price: 25000,
    currency: 'AED',
    popular: false,
    features: [
        { text: '34 Total Ads', bold: true, included: true },
        { text: '20 Static Ads', included: true },
        { text: '14 Video Ads', included: true },
        { text: 'Ad Campaign(s) Set-up', included: true },
        { text: 'CRM', included: true },
        { text: 'WhatsApp Integration', included: true }
    ],
    description: 'Our most comprehensive package, providing the highest ad volume for businesses seeking maximum market impact and lead generation.' // Replace with your description
  }
];
