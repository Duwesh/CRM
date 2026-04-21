/**
 * FirmEdge Frontend Constants
 * Global constant values used across the application directory.
 */

export const CLIENT_TYPES = [
  "Company (Pvt Ltd)",
  "Company (Ltd)",
  "LLP",
  "Partnership Firm",
  "Proprietorship",
  "Individual",
  "HUF",
  "Trust / NGO",
  "AOP / BOI"
];

export const SERVICE_OPTIONS = [
  "ITR Filing", 
  "GST Returns", 
  "TDS/TCS", 
  "Statutory Audit", 
  "Tax Audit", 
  "Internal Audit", 
  "Company Law", 
  "ROC Filings", 
  "Payroll", 
  "Bookkeeping", 
  "Advisory", 
  "FEMA/RBI", 
  "Litigation", 
  "Transfer Pricing"
];

export const INDUSTRY_SECTORS = [
  "Manufacturing",
  "Trading",
  "Services / IT",
  "Real Estate / Construction",
  "Healthcare",
  "Hospitality",
  "Education",
  "BFSI",
  "NGO / Charitable",
  "Individual / Salaried",
  "Agriculture",
  "Other"
];

export const CONSTITUTION_TYPES = [
  "Resident",
  "Non-Resident (NRI)",
  "Foreign Company",
  "Domestic Company"
];

export const CLIENT_SOURCES = [
  "Referral",
  "Walk-in",
  "Website",
  "Social Media",
  "Existing Client",
  "Other"
];

export const CLIENT_STATUSES = [
  "Active",
  "Inactive",
  "Prospect"
];

export const LEAD_STAGES = [
  "New Lead",
  "Contacted",
  "Meeting",
  "Proposal",
  "Negotiation",
  "Won",
  "Lost"
];

export const LEAD_SOURCES = [
  "Referral",
  "Walk-in",
  "LinkedIn",
  "Cold Call",
  "Website",
  "Social Media",
  "Other"
];

export const INTERACTION_TYPES = [
  { value: "Phone Call", label: "Phone Call" },
  { value: "Meeting", label: "Meeting" },
  { value: "Email", label: "Email" },
  { value: "WhatsApp", label: "WhatsApp" },
  { value: "Video Call", label: "Video Call" },
  { value: "Letter", label: "Letter" },
];

export const INTERACTION_TYPE_VARIANTS = {
  "Phone Call": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Meeting": "bg-teal-500/10 text-teal-400 border-teal-500/20",
  "Email": "bg-amber-400/10 text-amber-400 border-amber-400/20",
  "WhatsApp": "bg-green-500/10 text-green-400 border-green-500/20",
  "Video Call": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "Letter": "bg-white/5 text-text-2 border-border",
};

export const REMINDER_PRIORITY_STYLES = {
  high: "bg-red-500/10 text-red-400 border-red-500/20",
  medium: "bg-amber-400/10 text-amber-400 border-amber-400/20",
  low: "bg-green-500/10 text-green-400 border-green-500/20",
};

