import React from "react";
import {
  StyleSheet,
  Document,
  Page,
  Text,
  View,
  Image,
  Font,
} from "@react-pdf/renderer";
import { formatPrice } from "@/lib/proposalUtils";
import contractStyle from "@/data/contractStyle";

// Create PDF Document Component
const ProposalPDF = ({ proposalData, orderId, status }) => {
  // Current date for signature
  const currentDate = new Date().toLocaleDateString();

  // Format dates
  const formattedDate = new Date(
    proposalData.proposalDate,
  ).toLocaleDateString();

  // Calculate expiration date (30 days from proposal date)
  const expDate = new Date(proposalData.proposalDate);
  expDate.setDate(expDate.getDate() + 30);
  const expirationDate = expDate.toLocaleDateString();

  // Determine if proposal is expired
  const isExpired = new Date() > expDate;

  // Check if accepted or paid
  const isAcceptedOrPaid = ["accepted", "paid"].includes(
    status?.toLowerCase() || "",
  );

  // Calculate subtotal
  const calculateSubtotal = () => {
    let subtotal = 0;

    // Add package price if included
    if (proposalData.includePackage && proposalData.selectedPackage) {
      const packagePrice = parseFloat(
        proposalData.selectedPackage.price.toString().replace(/,/g, ""),
      );

      // Apply package discount
      if (proposalData.discounts?.packageDiscount?.value > 0) {
        if (proposalData.discounts.packageDiscount.type === "percentage") {
          subtotal +=
            packagePrice *
            (1 - proposalData.discounts.packageDiscount.value / 100);
        } else {
          subtotal += Math.max(
            0,
            packagePrice - proposalData.discounts.packageDiscount.value,
          );
        }
      } else {
        subtotal += packagePrice;
      }
    }

    // Add services prices
    if (
      proposalData.selectedServices &&
      Array.isArray(proposalData.selectedServices)
    ) {
      proposalData.selectedServices.forEach((service) => {
        const servicePrice = parseFloat(
          service.price.toString().replace(/,/g, ""),
        );
        const serviceDiscount =
          proposalData.discounts?.serviceDiscounts?.[service.id];

        if (serviceDiscount && serviceDiscount.value > 0) {
          if (serviceDiscount.type === "percentage") {
            subtotal += servicePrice * (1 - serviceDiscount.value / 100);
          } else {
            subtotal += Math.max(0, servicePrice - serviceDiscount.value);
          }
        } else {
          subtotal += servicePrice;
        }
      });
    }

    return subtotal;
  };

  const subtotal = calculateSubtotal();

  // Calculate discount
  const calculateDiscountAmount = () => {
    if (!proposalData.discounts?.overallDiscount?.value) return 0;

    if (proposalData.discounts.overallDiscount.type === "percentage") {
      return subtotal * (proposalData.discounts.overallDiscount.value / 100);
    } else {
      return proposalData.discounts.overallDiscount.value;
    }
  };

  const discountAmount = calculateDiscountAmount();
  const subtotalAfterDiscount = subtotal - discountAmount;

  // Calculate tax
  const calculateTaxAmount = () => {
    return proposalData.includeTax !== false ? subtotalAfterDiscount * 0.05 : 0;
  };

  const taxAmount = calculateTaxAmount();

  // Calculate total
  const totalAmount = subtotalAfterDiscount + taxAmount;

  // Check if there are monthly fees
  const hasMonthlyFees = () => {
    if (
      !proposalData.selectedServices ||
      !Array.isArray(proposalData.selectedServices)
    ) {
      return false;
    }

    return proposalData.selectedServices.some(
      (service) =>
        (service.monthly || service.is_monthly) &&
        (service.setupFee || service.setup_fee),
    );
  };

  // Calculate monthly fees
  const calculateMonthlyFees = () => {
    if (
      !proposalData.selectedServices ||
      !Array.isArray(proposalData.selectedServices)
    ) {
      return 0;
    }

    return proposalData.selectedServices.reduce((total, service) => {
      if (
        (service.monthly || service.is_monthly) &&
        (service.setupFee || service.setup_fee)
      ) {
        return (
          total +
          parseFloat(
            (service.setupFee || service.setup_fee)
              .toString()
              .replace(/,/g, ""),
          )
        );
      }
      return total;
    }, 0);
  };

  const monthlyFees = calculateMonthlyFees();

  // Compress features if needed
  const getFormattedFeatures = (features) => {
    if (!features || !Array.isArray(features) || features.length === 0)
      return null;

    // Sort by order_index or original order
    const sortedFeatures = [...features].sort(
      (a, b) => (a.order_index || 0) - (b.order_index || 0),
    );

    // Group features into two columns for larger feature sets
    if (sortedFeatures.length > 5) {
      const firstHalf = sortedFeatures.slice(
        0,
        Math.ceil(sortedFeatures.length / 2),
      );
      const secondHalf = sortedFeatures.slice(
        Math.ceil(sortedFeatures.length / 2),
      );

      return (
        <View style={{ flexDirection: "row" }}>
          <View style={{ flex: 1, marginRight: 5 }}>
            {firstHalf.map((feature, index) => (
              <View style={contractStyle.featureItem} key={`a-${index}`}>
                <Text style={contractStyle.featureBullet}>•</Text>
                <Text
                  style={{
                    ...contractStyle.featureText,
                    ...(feature.is_bold ? { fontWeight: "bold" } : {}),
                  }}
                >
                  {feature.text}
                </Text>
              </View>
            ))}
          </View>
          <View style={{ flex: 1 }}>
            {secondHalf.map((feature, index) => (
              <View style={contractStyle.featureItem} key={`b-${index}`}>
                <Text style={contractStyle.featureBullet}>•</Text>
                <Text
                  style={{
                    ...contractStyle.featureText,
                    ...(feature.is_bold ? { fontWeight: "bold" } : {}),
                  }}
                >
                  {feature.text}
                </Text>
              </View>
            ))}
          </View>
        </View>
      );
    } else {
      // Regular single column layout for smaller feature sets
      return (
        <>
          {sortedFeatures.map((feature, index) => (
            <View style={contractStyle.featureItem} key={index}>
              <Text style={contractStyle.featureBullet}>•</Text>
              <Text
                style={{
                  ...contractStyle.featureText,
                  ...(feature.is_bold ? { fontWeight: "bold" } : {}),
                }}
              >
                {feature.text}
              </Text>
            </View>
          ))}
        </>
      );
    }
  };

  // Two column approach for terms
  const renderTermsCompact = () => {
    // First 5 terms in first column, remaining in second column
    const terms = [
      "Payment Terms: 100% payment required upfront to initiate the project.",
      "Revisions: Package includes up to 1 rounds of revisions for each deliverable.",
      "Timeline: Estimated completion time is 4-6 weeks from project start date, dependent on client feedback turnaround times.",
      "Content: Client is responsible for providing necessary content (brand asset, product information, account credentials etc.) within 3 days of project start.",
      "Intellectual Property: Upon full payment, client receives full rights to all deliverables created specifically for this project.",
      "Cancellation and Satisfaction Guarantee: We offer a satisfaction guarantee for up to one month after campaign launch. If dissatisfied, client may request a refund, but will forfeit content ownership rights and may no longer use the content for advertising or posting. For retainer cancellations, clients may keep the CRM system for a reduced fee of 300 AED per month.",
      "Confidentiality: XMA Agency agrees to maintain confidentiality of all client information.",
      "Additional Services: Any services not specified in this proposal will require a separate agreement.",
      `Validity: This proposal is valid for 30 days from the date issued${isExpired ? " (EXPIRED)" : ` (Valid until ${expirationDate})`}`,
    ];

    return (
      <View style={contractStyle.termsGrid}>
        {terms.map((term, index) => (
          <View
            key={index}
            style={[
              contractStyle.termItemCompact,
              { width: index === 5 ? "100%" : "50%" },
            ]}
          >
            <Text>
              <Text style={{ fontWeight: "bold" }}>{index + 1}. </Text>
              <Text>{term}</Text>
            </Text>
          </View>
        ))}
      </View>
    );
  };

  // Define company information for XMA Agency
  const xmaInfo = {
    name: "Amir Mahdi Banki",
    title: "CEO, XLUXIVE DIGITAL MARKETING LLC",
    email: "admin@xma.ae",
    phone: "+971 50 810 7712",
  };

  return (
    <Document>
      <Page size="A4" style={contractStyle.page} wrap>
        {/* Watermark */}
        <View style={contractStyle.watermark}>
          <Image src="/XMA-black.png" style={contractStyle.watermarkImage} />
        </View>

        {/* Header */}
        <View style={contractStyle.header}>
          <View style={contractStyle.headerContent}>
            <Image src="/XMA-black.png" style={contractStyle.logo} />
            <Text style={contractStyle.title}>Marketing Contract</Text>
            <Text style={contractStyle.subtitle}>
              Prepared exclusively for {proposalData.companyName}
            </Text>

            {/* {status && ( */}
            {/*   <View */}
            {/*     style={{ */}
            {/*       ...contractStyle.statusBadge, */}
            {/*       backgroundColor: */}
            {/*         status === "accepted" */}
            {/*           ? "#ECFDF5" */}
            {/*           : status === "paid" */}
            {/*             ? "#F5F3FF" */}
            {/*             : status === "sent" */}
            {/*               ? "#EFF6FF" */}
            {/*               : status === "rejected" */}
            {/*                 ? "#FEF2F2" */}
            {/*                 : "#F3F4F6", */}
            {/*       color: */}
            {/*         status === "accepted" */}
            {/*           ? "#047857" */}
            {/*           : status === "paid" */}
            {/*             ? "#7C3AED" */}
            {/*             : status === "sent" */}
            {/*               ? "#1D4ED8" */}
            {/*               : status === "rejected" */}
            {/*                 ? "#DC2626" */}
            {/*                 : "#4B5563", */}
            {/*     }} */}
            {/*   > */}
            {/*     <Text>{status.toUpperCase()} PROPOSAL</Text> */}
            {/*   </View> */}
            {/* )} */}
          </View>
        </View>

        {/* Client Information */}
        <View style={contractStyle.clientInfo}>
          <View style={contractStyle.clientInfoBlock}>
            <Text style={contractStyle.clientInfoLabel}>Client Name:</Text>
            <Text style={contractStyle.clientInfoValue}>
              {proposalData.clientName}
            </Text>
          </View>

          <View style={contractStyle.clientInfoBlock}>
            <Text style={contractStyle.clientInfoLabel}>Company:</Text>
            <Text style={contractStyle.clientInfoValue}>
              {proposalData.companyName}
            </Text>
          </View>

          <View style={contractStyle.clientInfoBlock}>
            <Text style={contractStyle.clientInfoLabel}>Proposal Date:</Text>
            <Text style={contractStyle.clientInfoValue}>{formattedDate}</Text>
          </View>
        </View>

        {/* Order ID */}
        {orderId && (
          <View style={contractStyle.contractId}>
            <Text style={contractStyle.contractIdText}>
              <Text style={{ fontWeight: "bold" }}>
                Order ID / Contract Reference:
              </Text>{" "}
              {orderId}
            </Text>
          </View>
        )}

        {/* Project Details */}
        {proposalData.additionalInfo && (
          <View style={contractStyle.section}>
            <Text style={contractStyle.sectionTitle}>Project Details</Text>
            <View style={contractStyle.packageBox}>
              <Text style={{ fontSize: 9 }}>{proposalData.additionalInfo}</Text>
            </View>
          </View>
        )}

        {/* Investment Summary FIRST (moved up to ensure quote is on first page) */}
        <View style={contractStyle.section}>
          <Text style={contractStyle.sectionTitle}>Investment Summary</Text>

          <View style={contractStyle.summaryTable}>
            {/* Package row */}
            {proposalData.includePackage && proposalData.selectedPackage && (
              <View style={contractStyle.summaryRow}>
                <Text style={contractStyle.summaryCol1}>
                  {proposalData.selectedPackage.name} Package
                  {proposalData.discounts?.packageDiscount?.value > 0 &&
                    ` (${
                      proposalData.discounts.packageDiscount.type ===
                      "percentage"
                        ? proposalData.discounts.packageDiscount.value + "% OFF"
                        : "- " +
                          proposalData.discounts.packageDiscount.value +
                          " AED"
                    })`}
                </Text>
                <Text style={contractStyle.summaryCol2}>
                  {proposalData.discounts?.packageDiscount?.value > 0
                    ? proposalData.discounts.packageDiscount.type ===
                      "percentage"
                      ? formatPrice(
                          parseFloat(proposalData.selectedPackage.price) *
                            (1 -
                              proposalData.discounts.packageDiscount.value /
                                100),
                        )
                      : formatPrice(
                          parseFloat(proposalData.selectedPackage.price) -
                            proposalData.discounts.packageDiscount.value,
                        )
                    : proposalData.selectedPackage.price}{" "}
                  AED
                </Text>
              </View>
            )}

            {/* Service rows */}
            {proposalData.selectedServices &&
              proposalData.selectedServices.map((service, idx) => {
                const serviceDiscount =
                  proposalData.discounts?.serviceDiscounts?.[service.id];
                const originalPrice = parseFloat(
                  service.price.toString().replace(/,/g, ""),
                );
                let finalPrice = originalPrice;

                if (serviceDiscount && serviceDiscount.value > 0) {
                  if (serviceDiscount.type === "percentage") {
                    finalPrice =
                      originalPrice * (1 - serviceDiscount.value / 100);
                  } else {
                    finalPrice = Math.max(
                      0,
                      originalPrice - serviceDiscount.value,
                    );
                  }
                }

                return (
                  <View style={contractStyle.summaryRow} key={idx}>
                    <Text style={contractStyle.summaryCol1}>
                      {service.name}
                      {serviceDiscount &&
                        serviceDiscount.value > 0 &&
                        ` (${
                          serviceDiscount.type === "percentage"
                            ? serviceDiscount.value + "% OFF"
                            : "- " + serviceDiscount.value + " AED"
                        })`}
                    </Text>
                    <Text style={contractStyle.summaryCol2}>
                      {formatPrice(finalPrice)} AED
                    </Text>
                  </View>
                );
              })}

            {/* Subtotal */}
            <View style={contractStyle.summaryRow}>
              <Text
                style={{ ...contractStyle.summaryCol1, fontWeight: "bold" }}
              >
                Subtotal
              </Text>
              <Text
                style={{ ...contractStyle.summaryCol2, fontWeight: "bold" }}
              >
                {formatPrice(subtotal)} AED
              </Text>
            </View>

            {/* Overall Discount */}
            {proposalData.discounts?.overallDiscount?.value > 0 && (
              <View style={contractStyle.summaryRow}>
                <Text style={contractStyle.summaryCol1}>
                  Overall Discount (
                  {proposalData.discounts.overallDiscount.type === "percentage"
                    ? proposalData.discounts.overallDiscount.value + "%"
                    : formatPrice(
                        proposalData.discounts.overallDiscount.value,
                      ) + " AED"}
                  )
                </Text>
                <Text
                  style={{ ...contractStyle.summaryCol2, color: "#10B981" }}
                >
                  -{formatPrice(discountAmount)} AED
                </Text>
              </View>
            )}

            {/* Tax */}
            {proposalData.includeTax !== false && (
              <View style={contractStyle.summaryRow}>
                <Text style={contractStyle.summaryCol1}>VAT (5%)</Text>
                <Text style={contractStyle.summaryCol2}>
                  {formatPrice(taxAmount)} AED
                </Text>
              </View>
            )}

            {/* Total */}
            <View style={contractStyle.summaryTotal}>
              <Text style={contractStyle.summaryTotalLabel}>
                Total Investment{" "}
                {proposalData.includeTax !== false ? "(Inc. VAT)" : ""}
              </Text>
              <Text style={contractStyle.summaryTotalValue}>
                {formatPrice(totalAmount)} AED
              </Text>
            </View>

            {/* Monthly Fee */}
            {hasMonthlyFees() && (
              <Text style={contractStyle.monthlyNote}>
                Plus {formatPrice(monthlyFees)} AED monthly fee(s)
              </Text>
            )}
          </View>
        </View>

        {/* Package */}
        {proposalData.includePackage && proposalData.selectedPackage && (
          <View style={contractStyle.section}>
            <Text style={contractStyle.sectionTitle}>Selected Package</Text>
            <View style={contractStyle.packageBox}>
              <Text style={contractStyle.packageName}>
                {proposalData.selectedPackage.name} Package
              </Text>
              <Text style={contractStyle.packageDescription}>
                {proposalData.selectedPackage.description}
              </Text>

              <Text style={contractStyle.packagePrice}>
                Price: {proposalData.selectedPackage.price}{" "}
                {proposalData.selectedPackage.currency}
              </Text>

              {proposalData.selectedPackage.features &&
                proposalData.selectedPackage.features.length > 0 && (
                  <View style={contractStyle.featuresList}>
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: "bold",
                        marginBottom: 3,
                      }}
                    >
                      Features:
                    </Text>
                    {getFormattedFeatures(
                      proposalData.selectedPackage.features,
                    )}
                  </View>
                )}
            </View>
          </View>
        )}

        {/* Services */}
        {proposalData.selectedServices &&
          proposalData.selectedServices.length > 0 && (
            <View style={contractStyle.section}>
              <Text style={contractStyle.sectionTitle}>
                Additional Services
              </Text>
              <View
                style={{
                  flexDirection:
                    proposalData.selectedServices.length > 2 ? "row" : "column",
                  flexWrap: "wrap",
                }}
              >
                {proposalData.selectedServices.map((service, index) => (
                  <View
                    style={[
                      contractStyle.serviceBox,
                      proposalData.selectedServices.length > 2
                        ? {
                            width: "48%",
                            marginRight: index % 2 === 0 ? "4%" : 0,
                          }
                        : { width: "100%" },
                    ]}
                    key={index}
                  >
                    <Text style={contractStyle.serviceName}>
                      {service.name}
                    </Text>
                    <Text style={contractStyle.serviceDescription}>
                      {service.description && service.description.length > 100
                        ? service.description.substring(0, 100) + "..."
                        : service.description}
                    </Text>
                    <Text style={contractStyle.servicePrice}>
                      Price: {service.price} {service.currency || "AED"}
                      {(service.monthly || service.is_monthly) &&
                        (service.setupFee || service.setup_fee) &&
                        ` + ${service.setupFee || service.setup_fee} AED/month`}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

        {/* Terms & Conditions - using compact layout */}
        <View style={contractStyle.terms}>
          <Text style={contractStyle.termsTitle}>Terms and Conditions</Text>
          {renderTermsCompact()}
        </View>
        {/* Bank Information Section - Added before signatures */}
        <View style={contractStyle.bankInfoContainer}>
          <Text style={contractStyle.bankInfoTitle}>Payment Information</Text>
          <View style={contractStyle.bankInfoGrid}>
            <View style={contractStyle.bankInfoItem}>
              <Text style={contractStyle.bankInfoLabel}>Account Holder:</Text>
              <Text style={contractStyle.bankInfoValue}>
                XLUXIVE DIGITAL MARKETING L.L.C
              </Text>
            </View>
            <View style={contractStyle.bankInfoItem}>
              <Text style={contractStyle.bankInfoLabel}>IBAN:</Text>
              <Text style={contractStyle.bankInfoValue}>
                AE590860000009339072484
              </Text>
            </View>
            <View style={contractStyle.bankInfoItem}>
              <Text style={contractStyle.bankInfoLabel}>BIC/SWIFT:</Text>
              <Text style={contractStyle.bankInfoValue}>WIOBAEADXXX</Text>
            </View>
            <View style={contractStyle.bankInfoItem}>
              <Text style={contractStyle.bankInfoLabel}>Business Address:</Text>
              <Text style={contractStyle.bankInfoValue}>
                The Curve Building M44, Dubai, UAE
              </Text>
            </View>
          </View>
          <Text style={contractStyle.bankInfoNote}>
            Please reference your Order ID ({orderId || "as provided"}) when
            making payment
          </Text>
        </View>
        {/* Accepted or Signatures */}
        {isAcceptedOrPaid ? (
          <Text style={contractStyle.acceptedBadge}>
            This proposal has been {status?.toLowerCase()} and all terms are
            finalized.
          </Text>
        ) : (
          <View style={contractStyle.signatures}>
            <View style={contractStyle.signatureBlock}>
              <Text style={contractStyle.signatureTitle}>For XMA Agency:</Text>
              <View style={contractStyle.signatureLine} />
              <Text style={contractStyle.signedBy}>{xmaInfo.name}</Text>
              <Text style={contractStyle.signatureLabel}>{xmaInfo.title}</Text>
              <Text style={contractStyle.signatureDate}>{currentDate}</Text>

              {/* XMA stamp using the actual stamp image */}
              <View style={contractStyle.stamp}>
                <Image
                  src="/NSGT Global Limited XMA Lead Flow Proposal.png"
                  style={{ width: 120, height: 120 }}
                />
              </View>
            </View>

            <View style={contractStyle.signatureBlock}>
              <Text style={contractStyle.signatureTitle}>
                For {proposalData.companyName}:
              </Text>
              <View style={contractStyle.signatureLine} />
              <Text style={contractStyle.signatureLabel}>
                Name: _______________________
              </Text>
              <Text style={contractStyle.signatureLabel}>
                Position: ___________________
              </Text>
              <Text style={contractStyle.signatureLabel}>
                Date: _______________________
              </Text>
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={contractStyle.footer}>
          <Text style={contractStyle.contactInfo}>Contact Information:</Text>
          <Text style={contractStyle.contactInfo}>
            Email: {xmaInfo.email} | Phone: {xmaInfo.phone} | Website: xma.ae
          </Text>

          <Text style={contractStyle.printDate}>
            Printed on: {new Date().toLocaleString()}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default ProposalPDF;
