import { StyleSheet } from "@react-pdf/renderer";

// Create optimized styles for PDF - making elements more compact
const contractStyle = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 30,
  },
  watermark: {
    position: "absolute",
    opacity: 0.04,
    transform: "rotate(-30deg)",
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    zIndex: -1,
  },
  watermarkImage: {
    width: 400,
  },
  header: {
    marginBottom: 15,
    borderBottom: "1px solid #EEEEEE",
    paddingBottom: 10,
    textAlign: "center",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  headerContent: {
    flex: 1,
    alignItems: "center",
  },
  logo: {
    height: 40,
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: "#E53E3E",
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 12,
  },
  statusBadge: {
    marginTop: 5,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignSelf: "center",
  },
  clientInfo: {
    flexDirection: "row",
    marginBottom: 15,
    justifyContent: "space-between",
  },
  clientInfoBlock: {
    flex: 1,
    padding: 8,
    backgroundColor: "#F9FAFB",
    borderRadius: 5,
    marginHorizontal: 3,
  },
  clientInfoLabel: {
    fontSize: 8,
    color: "#6B7280",
  },
  clientInfoValue: {
    fontSize: 10,
    fontWeight: "bold",
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "#E53E3E",
    marginBottom: 5,
    paddingBottom: 3,
    borderBottom: "1px solid #EEEEEE",
  },
  contractId: {
    backgroundColor: "#F9FAFB",
    padding: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#E53E3E",
    borderLeftStyle: "solid",
    marginVertical: 10,
  },
  contractIdText: {
    fontSize: 10,
    color: "#E53E3E",
  },
  packageBox: {
    backgroundColor: "#F9FAFB",
    padding: 10,
    borderRadius: 5,
    marginBottom: 8,
  },
  packageName: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 3,
  },
  packageDescription: {
    fontSize: 9,
    marginBottom: 6,
  },
  packagePrice: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 3,
  },
  featuresList: {
    marginTop: 6,
  },
  featureItem: {
    flexDirection: "row",
    marginBottom: 2,
  },
  featureBullet: {
    width: 10,
    fontSize: 10,
  },
  featureText: {
    fontSize: 9,
    flex: 1,
  },
  serviceBox: {
    backgroundColor: "#F9FAFB",
    padding: 8,
    borderRadius: 5,
    marginBottom: 6,
  },
  serviceName: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 3,
  },
  serviceDescription: {
    fontSize: 9,
    marginBottom: 3,
  },
  servicePrice: {
    fontSize: 10,
    alignSelf: "flex-end",
  },
  summaryTable: {
    marginVertical: 8,
  },
  summaryRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    borderBottomStyle: "solid",
    paddingVertical: 4,
  },
  summaryCol1: {
    flex: 2,
    fontSize: 10,
  },
  summaryCol2: {
    flex: 1,
    fontSize: 10,
    textAlign: "right",
  },
  summaryTotal: {
    flexDirection: "row",
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    borderTopStyle: "solid",
    marginTop: 3,
  },
  summaryTotalLabel: {
    flex: 2,
    fontSize: 12,
    fontWeight: "bold",
  },
  summaryTotalValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: "bold",
    color: "#E53E3E",
    textAlign: "right",
  },
  monthlyNote: {
    fontSize: 8,
    color: "#6B7280",
    textAlign: "right",
    marginTop: 3,
  },
  terms: {
    fontSize: 8,
    backgroundColor: "#F9FAFB",
    padding: 8,
    borderRadius: 5,
    marginVertical: 10,
  },
  termsTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 6,
  },
  termItem: {
    flexDirection: "row",
    marginBottom: 2,
  },
  termNumber: {
    width: 14,
    fontWeight: "bold",
  },
  termText: {
    flex: 1,
  },
  signatures: {
    flexDirection: "row",
    marginVertical: 15,
    justifyContent: "space-between",
  },
  signatureBlock: {
    flex: 1,
    marginHorizontal: 10,
  },
  signatureTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 3,
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: "#CCCCCC",
    borderTopStyle: "solid",
    marginTop: 30,
    marginBottom: 5,
  },
  signatureLabel: {
    fontSize: 8,
    marginBottom: 3,
  },
  companySignature: {
    position: "absolute",
    top: 0,
    right: 5,
    width: 80,
    height: 80,
  },
  signatureDate: {
    fontSize: 8,
    color: "#6B7280",
    marginTop: 2,
  },
  signedBy: {
    fontSize: 9,
    fontWeight: "bold",
    marginBottom: 5,
  },
  acceptedBadge: {
    textAlign: "center",
    marginVertical: 15,
    padding: 10,
    backgroundColor: "#F0FDF4",
    borderRadius: 5,
    color: "#0F766E",
    fontSize: 10,
    fontWeight: "bold",
  },
  footer: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    borderTopStyle: "solid",
    paddingTop: 10,
    fontSize: 8,
    color: "#6B7280",
    textAlign: "center",
  },
  contactInfo: {
    marginBottom: 3,
  },
  printDate: {
    fontSize: 7,
    color: "#9CA3AF",
    textAlign: "right",
    marginTop: 15,
  },
  termsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  termItemCompact: {
    width: "50%",
    paddingRight: 5,
    marginBottom: 3,
  },
  stamp: {
    position: "absolute",
    width: 120,
    height: 120,
    opacity: 1,
    top: -10,
    right: -10,
    transform: "rotate(10deg)",
  },
  
  // Bank information styles
  bankInfoContainer: {
    backgroundColor: "#FEF9C3",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    marginTop: 50,
    borderLeftWidth: 3,
    borderLeftColor: "#CA8A04",
    borderLeftStyle: "solid",
  },
  bankInfoTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#78350F",
    marginBottom: 4,
  },
  bankInfoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  bankInfoItem: {
    width: "50%",
    marginBottom: 4,
  },
  bankInfoLabel: {
    fontSize: 8,
    color: "#78350F",
  },
  bankInfoValue: {
    fontSize: 9,
    fontWeight: "medium",
    color: "#78350F",
  },
  bankInfoNote: {
    fontSize: 8,
    color: "#78350F",
    fontStyle: "italic",
    marginTop: 4,
  }
});

export default contractStyle;
