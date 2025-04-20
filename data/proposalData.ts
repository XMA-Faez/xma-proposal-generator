// Main packages data
export const packages = [
  {
    name: "Base",
    price: "8,000",
    currency: "AED",
    usdPrice: "2,300",
    popular: false,
    features: [
      { text: "8 Total Ads", bold: true, included: true },
      { text: "5 Static Ads", included: true },
      { text: "3 Video Ads", included: true },
      { text: "Ad Campaign(s) Set-up", included: true },
      { text: "CRM", included: true },
      { text: "WhatsApp Integration", included: true },
    ],
    description:
      "Our Base package is perfect for businesses just starting their digital marketing journey. It provides essential advertising assets and foundational tools to establish your online presence and begin generating leads.",
  },
  {
    name: "Standard",
    price: "15,000",
    currency: "AED",
    usdPrice: "4,500",
    popular: true,
    features: [
      { text: "18 Total Ads", bold: true, included: true },
      { text: "10 Static Ads", included: true },
      { text: "8 Video Ads", included: true },
      { text: "Ad Campaign(s) Set-up", included: true },
      { text: "CRM", included: true },
      { text: "WhatsApp Integration", included: true },
    ],
    description:
      "Our most popular option, the Standard package delivers the perfect balance of value and performance. With more than double the advertising assets of the Base package, it gives you the resources needed to create a comprehensive marketing strategy.",
  },
  {
    name: "Premium",
    price: "25,000",
    currency: "AED",
    usdPrice: "6,800",
    popular: false,
    features: [
      { text: "34 Total Ads", bold: true, included: true },
      { text: "20 Static Ads", included: true },
      { text: "14 Video Ads", included: true },
      { text: "Ad Campaign(s) Set-up", included: true },
      { text: "CRM", included: true },
      { text: "WhatsApp Integration", included: true },
    ],
    description:
      "The Premium package is designed for businesses ready to dominate their market. With our most comprehensive set of advertising assets and full-service implementation, this package delivers maximum impact and results.",
  },
];

// Standalone products/services
export const standaloneServices = [
  {
    id: 1,
    name: "Website Optimization",
    price: 5000,
    currency: "AED",
    description:
      "Transform your existing website into a high-converting sales machine. Our optimization service includes speed improvements, SEO enhancements, mobile responsiveness, and conversion rate optimization to ensure your website performs at its best.",
  },
  {
    id: 2,
    name: "Website Creation",
    price: 10000,
    currency: "AED",
    description:
      "Get a professionally designed, custom-built website that perfectly represents your brand. Includes responsive design, SEO optimization, content management system, contact forms, and integration with your marketing tools.",
  },
  {
    id: 3,
    name: "CRM",
    price: 3000,
    setupFee: 300,
    monthly: true,
    currency: "AED",
    description:
      "Our CRM solution helps you manage customer relationships effectively. Includes lead capture, customer segmentation, automated follow-ups, sales pipeline management, and detailed reporting. Setup fee plus monthly subscription.",
  },
  {
    id: 4,
    name: "Content Package",
    price: 7500,
    currency: "AED",
    description:
      "Get 5 professionally produced videos to showcase your products or services. Our content team handles everything from concept to final delivery, ensuring high-quality videos that engage your audience and drive conversions.",
  },
];

// Terms and Conditions
export const termsAndConditions = [
  "1. Payment Terms: 100% payment required upfront to initiate the project.",
  "2. Revisions: Package includes up to 1 rounds of revisions for each deliverable.",
  "3. Timeline: Estimated completion time is 4-6 weeks from project start date, dependent on client feedback turnaround times.",
  "4. Content: Client is responsible for providing necessary content (brand asset, product information, account credentials etc.) within 3 days of project start.",
  "5. Intellectual Property: Upon full payment, client receives full rights to all deliverables created specifically for this project.",
  "6. Cancellation: In case of cancellation, client is responsible for payment of all work completed up to the cancellation date.",
  "7. Confidentiality: XMA Agency agrees to maintain confidentiality of all client information.",
  "8. Additional Services: Any services not specified in this proposal will require a separate agreement.",
  "9. Validity: This proposal is valid for 30 days from the date issued.",
];
