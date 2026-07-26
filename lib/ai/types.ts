// ===== Iraqi Legal Assistant - Core Types =====

// === Message Types ===
export type MessageRole = "user" | "assistant" | "system";

export type Message = {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  lawReferences?: LawReference[];
  confidence?: ConfidenceScore;
  caseType?: CaseType;
  metadata?: MessageMetadata;
};

export type MessageMetadata = {
  processingTime?: number;
  lawsSearched?: number;
  questionsAsked?: number;
  completionPercentage?: number;
};

// === Conversation Types ===
export type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  caseType?: CaseType;
  language: "ar" | "ar-iq";
  status: "active" | "completed" | "archived";
  rating?: number;
  tags?: string[];
};

// === Case Types ===
export type CaseType =
  | "personal"      // الأحوال الشخصية
  | "real_estate"   // العقارات
  | "criminal"      // الجنائية
  | "labor"         // العمل
  | "civil"         // المدني
  | "commercial"    // التجاري
  | "traffic"       // المرور
  | "companies"     // الشركات
  | "investment"    // الاستثمار
  | "unknown";      // غير محدد

// === Law Reference Types ===
export type LawReference = {
  lawId: string;
  lawName: string;
  articleNumber: number;
  articleText: string;
  relevance: number; // 0-1
  url: string;
};

// === Confidence Score ===
export type ConfidenceScore = {
  overall: number; // 0-100
  factors: ConfidenceFactor[];
  level: "high" | "medium" | "low" | "very_low";
  message: string;
};

export type ConfidenceFactor = {
  name: string;
  score: number; // 0-100
  weight: number;
  description: string;
};

// === Question Engine Types ===
export type Question = {
  id: string;
  text: string;
  caseType: CaseType;
  category: string;
  required: boolean;
  priority: number;
  condition?: QuestionCondition;
  options?: QuestionOption[];
};

export type QuestionCondition = {
  dependsOn: string;
  equals?: string | number;
  contains?: string;
};

export type QuestionOption = {
  label: string;
  value: string;
  nextQuestionId?: string;
};

export type QuestionAnswer = {
  questionId: string;
  answer: string;
  timestamp: number;
};

// === AI Provider Types ===
export type AIProviderType = "openai" | "gemini" | "claude" | "local";

export type AIConfig = {
  provider: AIProviderType;
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  presencePenalty: number;
  frequencyPenalty: number;
  streaming: boolean;
  timeout: number;
};

// === Search Types ===
export type SearchQuery = {
  text: string;
  caseType?: CaseType;
  limit: number;
  threshold: number;
  useSemantic: boolean;
  useExact: boolean;
};

export type SearchResult = {
  lawId: string;
  lawName: string;
  articleNumber: number;
  articleText: string;
  score: number;
  matchType: "semantic" | "exact" | "hybrid";
};

// === Enhanced Search Types ===
export type QuestionType =
  | "law_metadata"       // "كم مادة في قانون X", "متى صدر"
  | "article_content"    // "ما هي المادة X من قانون Y"
  | "legal_rule"         // "ما حكم", "ما هي عقوبة", "ما الحق"
  | "legal_definition"   // "ما هو تعريف", "عرف القانون"
  | "procedure"          // "كيف أقدم", "ما هي إجراءات"
  | "comparison"         // "الفرق بين"
  | "explanation"        // "اشرح", "فسر"
  | "general";           // كل ما عدى ذلك

export type QuestionClassification = {
  type: QuestionType;
  confidence: number; // 0-100
  lawName?: string;   // اسم القانون المذكور في السؤال
  lawId?: string;     // معرف القانون
  articleNum?: number; // رقم المادة المذكورة
};

export type MetadataMatch = {
  law: {
    id: string;
    name: string;
    articles: number;
    updated: string;
    category?: string;
    source?: string;
  };
  score: number;
  matchField: "name" | "id" | "category";
};

export type EnhancedSearchResult = {
  metadataMatches: MetadataMatch[];     // القوانين المطابقة (metadata)
  articles: SearchResult[];              // المواد المطابقة
  matchedLaw: MetadataMatch | null;      // القانون المحدد في السؤال
  classification: QuestionClassification; // تصنيف السؤال
  knowledgeContext: string;
  knowledgeResults: unknown[];
};

// === Answer Types ===
export type DBAnswer = {
  answer: string;
  quality: "high" | "medium" | "low";
  reason: string;
};

// === RAG Pipeline Types ===
export type ScoredArticle = {
  article: SearchResult;
  hybridScore: number;       // 0-100 normalized hybrid score
  boostFactors: string[];    // e.g., ["law_match", "exact_article"]
};

export type RetrievalResult = {
  classification: QuestionClassification;
  articles: ScoredArticle[];
  matchedLaw: MetadataMatch | null;
  metadataMatches: MetadataMatch[];
  knowledgeContext: string;
  retrievalMetadata: {
    totalArticlesFound: number;
    topScore: number;
    queryType: string;
  };
};

export type ContextFormat =
  | "metadata_table"
  | "article_quote"
  | "rule_evidence"
  | "procedure_steps"
  | "comparison_table"
  | "general";

export type CitationEntry = {
  articleNum: number;
  lawName: string;
  lawId: string;
  text: string;
};

export type CitationMap = Record<string, CitationEntry>;  // "[1]" → entry

export type GenerationContext = {
  formattedContext: string;
  citations: CitationMap;
  tokenEstimate: number;
  format: ContextFormat;
  hasSufficientData: boolean;
};

export type GeneratedAnswer = {
  answer: string;
  quality: "high" | "medium" | "low";
  citations: CitationMap;
  answerSource: "metadata" | "article" | "rag" | "ai";
  confidence: number;
  warnings: string[];
};

export type VerificationResult = {
  passed: boolean;
  issues: string[];
  citationAccuracy: number;
  completenessScore: number;
  suggestions: string[];
};

export type RAGResponse = {
  answer: string;
  quality: "high" | "medium" | "low";
  answerSource: "metadata" | "article" | "rag" | "ai";
  confidence: number;
  classification: QuestionClassification;
  citations: CitationMap;
  verification?: string[];
};

// === Prompt Types ===
export type SystemPrompt = {
  id: string;
  name: string;
  content: string;
  isDefault: boolean;
  createdAt: number;
  updatedAt: number;
};

// === Answer Settings ===
export type AnswerSettings = {
  showLawReferences: boolean;
  showExplanation: boolean;
  showSteps: boolean;
  showWarnings: boolean;
  showLawLinks: boolean;
  maxLawsUsed: number;
  responseLanguage: "ar" | "ar-iq" | "auto";
};

// === Confidence Settings ===
export type ConfidenceSettings = {
  minConfidence: number;
  minLawsRequired: number;
  lowConfidenceAction: "ask_more" | "show_warning" | "limit_response";
};

// === Chat Settings ===
export type ChatSettings = {
  botName: string;
  botAvatar: string;
  welcomeMessage: string;
  primaryColor: string;
  suggestedQuestions: string[];
};

// === Bot Instructions ===
export type BotInstructions = {
  // سلوك البوت
  generalBehavior: string;
  responseStyle: "formal" | "simplified" | "balanced";
  languagePreference: "auto" | "fusha" | "iraqi";
  citationRequirement: "always" | "when_needed" | "never";
  showDisclaimer: boolean;
  maxResponseLength: "concise" | "detailed" | "comprehensive";
  responsePriority: "speed" | "accuracy" | "balanced";

  // الممنوعات
  disallowedActions: string[];
  restrictedTopics: string[];
  strictLawOnly: boolean;

  // الجمهور
  audienceMode: "everyone" | "lawyers_only" | "both";
  requireVerification: boolean;
  allowPublicAccess: boolean;

  // ميزات الرد
  askClarifyingQuestions: boolean;
  maxClarifyingQuestions: number;
  showPracticalSteps: boolean;
  showAlternativeInterpretations: boolean;
  showCourtProcedures: boolean;
  mentionUncertainty: boolean;
  referencePreviousConversations: boolean;

  // مصادر وميزات متقدمة
  legalSources: "laws_only" | "laws_and_rulings" | "all";
  mentionProvinceDifferences: boolean;
  urgentCaseDetection: boolean;
  suggestHumanLawyer: boolean;
  escalationThreshold: number;
};

// === Analytics Types ===
export type ChatAnalytics = {
  totalConversations: number;
  totalMessages: number;
  averageConfidence: number;
  averageResponseTime: number;
  topCaseTypes: { type: CaseType; count: number }[];
  topLaws: { lawId: string; lawName: string; count: number }[];
  userSatisfaction: number;
  dailyStats: DailyStats[];
};

export type DailyStats = {
  date: string;
  conversations: number;
  messages: number;
  avgConfidence: number;
};

// === Debug Types ===
export type DebugTrace = {
  step: string;
  input: unknown;
  output: unknown;
  duration: number;
  timestamp: number;
};

export type DebugResult = {
  query: string;
  understoodQuery: string;
  caseType: CaseType;
  questionsAsked: Question[];
  lawsRetrieved: LawReference[];
  lawSelectionReason: string[];
  confidence: ConfidenceScore;
  finalPrompt: string;
  rawResponse: string;
  finalResponse: string;
  trace: DebugTrace[];
  totalDuration: number;
};
