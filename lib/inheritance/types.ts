export interface HeirInfo {
  id: string;
  relationship: string;
  name: string;
  gender: "male" | "female";
  isAlive: boolean;
  isDeceased: boolean;
  deceasedBefore: boolean;
  hasChildren: boolean;
  childrenCount: number;
}

export interface AssetEntry {
  id: string;
  type: string;
  description: string;
  value: number;
  isDisputed: boolean;
}

export interface DebtEntry {
  id: string;
  type: string;
  description: string;
  value: number;
  isProven: boolean;
  isDisputed: boolean;
  hasDocuments: boolean;
}

export interface WillEntry {
  id: string;
  beneficiary: string;
  value: number;
  type: string;
  hasDocument: boolean;
  isDisputed: boolean;
}

export interface SpecialCase {
  id: string;
  type: string;
  description: string;
}

export interface WizardData {
  deceasedGender: string;
  deathDate: string;
  maritalStatus: string;
  legalSystem: string;
  hasCourtCase: boolean;
  hasJudgment: boolean;
  hasUncertainInfo: boolean;

  totalEstate: number;
  assets: AssetEntry[];
  debts: DebtEntry[];
  wills: WillEntry[];

  hasSpouse: boolean;
  spouseCount: number;
  spouses: HeirInfo[];

  hasChildren: boolean;
  sonsCount: number;
  daughtersCount: number;
  deceasedSons: number;
  deceasedSonsChildren: boolean;
  deceasedSonsChildrenCount: number;
  deceasedDaughters: number;

  fatherAlive: boolean;
  motherAlive: boolean;
  fatherDeceasedBefore: boolean;
  motherDeceasedBefore: boolean;

  hasSiblings: boolean;
  fullBrothers: number;
  fullSisters: number;
  paternalBrothers: number;
  paternalSisters: number;
  maternalBrothers: number;
  maternalSisters: number;
  deceasedBrothersChildren: boolean;

  hasGrandparents: boolean;
  paternalGrandfather: boolean;
  paternalGrandmother: boolean;
  maternalGrandfather: boolean;
  maternalGrandmother: boolean;

  hasDescendants: boolean;
  grandsonsFromSon: number;
  granddaughtersFromSon: number;
  grandsonsFromDaughter: number;
  granddaughtersFromDaughter: number;

  specialCases: SpecialCase[];
  additionalNotes: string;
}

export const INITIAL_WIZARD_DATA: WizardData = {
  deceasedGender: "",
  deathDate: "",
  maritalStatus: "",
  legalSystem: "",
  hasCourtCase: false,
  hasJudgment: false,
  hasUncertainInfo: false,

  totalEstate: 0,
  assets: [],
  debts: [],
  wills: [],

  hasSpouse: false,
  spouseCount: 0,
  spouses: [],

  hasChildren: false,
  sonsCount: 0,
  daughtersCount: 0,
  deceasedSons: 0,
  deceasedSonsChildren: false,
  deceasedSonsChildrenCount: 0,
  deceasedDaughters: 0,

  fatherAlive: false,
  motherAlive: false,
  fatherDeceasedBefore: false,
  motherDeceasedBefore: false,

  hasSiblings: false,
  fullBrothers: 0,
  fullSisters: 0,
  paternalBrothers: 0,
  paternalSisters: 0,
  maternalBrothers: 0,
  maternalSisters: 0,
  deceasedBrothersChildren: false,

  hasGrandparents: false,
  paternalGrandfather: false,
  paternalGrandmother: false,
  maternalGrandfather: false,
  maternalGrandmother: false,

  hasDescendants: false,
  grandsonsFromSon: 0,
  granddaughtersFromSon: 0,
  grandsonsFromDaughter: 0,
  granddaughtersFromDaughter: 0,

  specialCases: [],
  additionalNotes: "",
};

export interface HeirResult {
  relationship: string;
  name: string;
  gender: string;
  isAlive: boolean;
  fraction: string;
  percentage: number;
  amount: number;
  isExcluded: boolean;
  excludeReason: string;
  legalBasis: string;
  lawName: string;
  articleNumber: number;
  articleText: string;
}

export interface CalculationResult {
  status: "calculated" | "needs_review" | "needs_lawyer";
  totalEstate: number;
  debts: number;
  wills: number;
  willDeduction: number;
  netEstate: number;
  heirs: HeirResult[];
  excludedPersons: HeirResult[];
  legalReferences: { lawId: string; lawName: string; articleNumber: number; articleText: string }[];
  warnings: string[];
  needsLawyer: boolean;
  lawyerReason: string;
}

export interface WizardStep {
  id: number;
  title: string;
  icon: string;
  description: string;
  isRequired: boolean;
}

export const WIZARD_STEPS: WizardStep[] = [
  { id: 1, title: "بيانات المتوفى", icon: "User", description: "المعلومات الأساسية عن المتوفى", isRequired: true },
  { id: 2, title: "النظام القانوني", icon: "Scale", description: "النظام القانوني المطبق", isRequired: true },
  { id: 3, title: "التركة", icon: "Banknote", description: "أموال المتوفى", isRequired: true },
  { id: 4, title: "الديون والوصايا", icon: "FileText", description: "الديون والوصايا", isRequired: false },
  { id: 5, title: "الزوج أو الزوجة", icon: "HeartHandshake", description: "بيانات الزوج/الزوجة", isRequired: false },
  { id: 6, title: "الأبناء والبنات", icon: "Users", description: "الأبناء والأحفاد", isRequired: false },
  { id: 7, title: "الأب والأم", icon: "Users", description: "الوالدان", isRequired: false },
  { id: 8, title: "الإخوة والأخوات", icon: "Users", description: "الأشقاء والأموميين", isRequired: false },
  { id: 9, title: "الأقارب", icon: "Users", description: "الأجداد والأقارب الآخرون", isRequired: false },
  { id: 10, title: "الحالات الخاصة", icon: "AlertTriangle", description: "حالات خاصة", isRequired: false },
  { id: 11, title: "مراجعة البيانات", icon: "CheckCircle", description: "تأكد من صحة البيانات", isRequired: true },
  { id: 12, title: "النتيجة", icon: "Calculator", description: "حساب الأنصبة", isRequired: true },
];
