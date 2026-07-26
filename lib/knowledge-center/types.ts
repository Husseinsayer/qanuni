// ===== Legal Knowledge Center - Type Definitions =====

export interface KnowledgeBaseItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null; // Soft delete
  isActive: boolean;
}

// ─────────────────────────────────────────────
// 1. Legal Procedures (الإجراءات القانونية)
// ─────────────────────────────────────────────
export interface LegalProcedure extends KnowledgeBaseItem {
  name: string;
  category: string;
  shortDescription: string;
  detailedDescription: string;
  steps: ProcedureStep[];
  requiredDocuments: string[];
  conditions: string[];
  estimatedDuration: string;
  fees: string; // optional
  competentAuthority: string;
  governorate: string; // optional
  notes: string;
  keywords: string[];
}

export interface ProcedureStep {
  id: string;
  order: number;
  title: string;
  description: string;
}

// ─────────────────────────────────────────────
// 2. Legal Templates (النماذج القانونية)
// ─────────────────────────────────────────────
export interface LegalTemplate extends KnowledgeBaseItem {
  name: string;
  category: string;
  description: string;
  content: string; // The template text
  variables: TemplateVariable[];
  keywords: string[];
  notes: string;
}

export interface TemplateVariable {
  id: string;
  name: string;
  placeholder: string;
  defaultValue: string;
  required: boolean;
}

// ─────────────────────────────────────────────
// 3. Services & Links (الخدمات والروابط الرسمية)
// ─────────────────────────────────────────────
export interface GovService extends KnowledgeBaseItem {
  name: string;
  category: string;
  governmentBody: string;
  officialUrl: string;
  description: string;
  serviceType: string;
  requiresLogin: boolean;
  isFullyElectronic: boolean;
  supportedGovernorates: string[];
  notes: string;
}

// ─────────────────────────────────────────────
// 4. Q&A Library (مكتبة الأسئلة والأجوبة)
// ─────────────────────────────────────────────
export interface KnowledgeQA extends KnowledgeBaseItem {
  question: string;
  answer: string;
  category: string;
  keywords: string[];
  importance: "high" | "medium" | "low";
  notes: string;
}

// ─────────────────────────────────────────────
// 5. Legal Terms (المصطلحات القانونية)
// ─────────────────────────────────────────────
export interface LegalTerm extends KnowledgeBaseItem {
  name: string;
  simplifiedDefinition: string;
  legalDefinition: string;
  examples: string[];
  keywords: string[];
  notes: string;
  // Book/document specific fields
  documentTitle: string;
  author: string;
  publicationDate: string;
  documentContent: string;
  category: string;
}

// ─────────────────────────────────────────────
// 6. Government Bodies (الجهات الحكومية)
// ─────────────────────────────────────────────
export interface GovernmentBody extends KnowledgeBaseItem {
  name: string;
  description: string;
  jurisdiction: string;
  address: string;
  governorate: string;
  phoneNumbers: string[];
  website: string;
  workingHours: string;
  notes: string;
}

// ─────────────────────────────────────────────
// 7. Required Documents (المستندات المطلوبة)
// ─────────────────────────────────────────────
export interface RequiredDocument extends KnowledgeBaseItem {
  name: string;
  description: string;
  category: string;
  notes: string;
}

// ─────────────────────────────────────────────
// 8. Keywords (الكلمات المفتاحية)
// ─────────────────────────────────────────────
export interface Keyword extends KnowledgeBaseItem {
  name: string;
  category: string;
  notes: string;
  // Future relations
  relatedProcedureIds: string[];
  relatedTemplateIds: string[];
  relatedQAIds: string[];
  relatedServiceIds: string[];
  relatedTermIds: string[];
}

// ─────────────────────────────────────────────
// Audit Log Entry
// ─────────────────────────────────────────────
export interface KnowledgeAuditEntry {
  id: string;
  timestamp: string;
  section: string;
  entityId: string;
  entityName: string;
  action: "create" | "update" | "delete" | "restore";
  details: string;
}

// ─────────────────────────────────────────────
// Complete Knowledge Center Store
// ─────────────────────────────────────────────
export interface KnowledgeCenterData {
  procedures: LegalProcedure[];
  templates: LegalTemplate[];
  services: GovService[];
  qa: KnowledgeQA[];
  terms: LegalTerm[];
  governments: GovernmentBody[];
  documents: RequiredDocument[];
  keywords: Keyword[];
  auditLog: KnowledgeAuditEntry[];
}

// Section display config
export type KnowledgeSection =
  | "procedures"
  | "templates"
  | "services"
  | "qa"
  | "terms"
  | "governments"
  | "documents"
  | "keywords";

export const SECTION_CONFIG: Record<KnowledgeSection, { label: string; labelAr: string; icon: string }> = {
  procedures: { label: "Legal Procedures", labelAr: "الإجراءات القانونية", icon: "ClipboardList" },
  templates: { label: "Legal Templates", labelAr: "النماذج القانونية", icon: "FileText" },
  services: { label: "Services & Links", labelAr: "الخدمات والروابط الرسمية", icon: "ExternalLink" },
  qa: { label: "Q&A Library", labelAr: "مكتبة الأسئلة والأجوبة", icon: "HelpCircle" },
  terms: { label: "Books & Authors", labelAr: "الكتب والمؤلفات", icon: "BookOpen" },
  governments: { label: "Government Bodies", labelAr: "الجهات الحكومية", icon: "Building" },
  documents: { label: "Required Documents", labelAr: "المستندات المطلوبة", icon: "FileStack" },
  keywords: { label: "Keywords", labelAr: "الكلمات المفتاحية", icon: "Tag" },
};

// Predefined categories for each section
export const PROCEDURE_CATEGORIES = [
  "أحوال شخصية",
  "سجل مدني",
  "تجاري",
  "تسجيل عقارات",
  "عمل وتوظيف",
  "إقامة وسفر",
  "قضاء وعدل",
  "أمني",
  "تعليم",
  "صحة",
  "أخرى",
];

export const TEMPLATE_CATEGORIES = [
  "عقود",
  "استشارات",
  "مطالبات",
  "طعون",
  "أحوال شخصية",
  "تجاري",
  "عمل",
  "إداري",
  "أخرى",
];

export const SERVICE_CATEGORIES = [
  "حكومي إلكتروني",
  "تمويل",
  "صحة",
  "تعليم",
  "أمان",
  "قضاء",
  "أحوال شخصية",
  "تجاري",
  "أخرى",
];

export const QA_CATEGORIES = [
  "قانون مدني", "قانون عقوبات", "أحوال شخصية", "قانون عمل",
  "قانون تجاري", "قانون إداري", "إجراءات قانونية", "حقوق أساسية", "أخرى",
];

export const TERM_CATEGORIES = [
  "قانونية", "قضائية", "دستورية", "تجارية",
  "عقارية", "أحوال شخصية", "أكاديمية", "مراجع", "أخرى",
];

export const GOVERNMENT_CATEGORIES = [
  "قضاء", "أمني", "إداري", "تعليم", "صحة", "مالية", "بلدية", "أخرى",
];

export const DOCUMENT_CATEGORIES = [
  "هوية", "سجل مدني", "أحوال شخصية", "عقارات", "تجاري", "عمل", "أخرى",
];

export const KEYWORD_CATEGORIES = [
  "إجراءات", "نماذج", "أسئلة", "خدمات", "مصطلحات", "عناوين", "أخرى",
];

export const GOVERNORATES = [
  "بغداد", "البصرة", "نينوى", "أربيل", "السليمانية", "دهوك",
  "كركوك", "النجف", "كربلاء", "بابل", "ديالى", "الأنبار",
  "صلاح الدين", "القادسية", "ميسان", "المثنى", "واسط", "ذي قار",
];
