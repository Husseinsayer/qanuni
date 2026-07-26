// ===== Iraqi Legal Assistant - AI Configuration =====
import type { AIConfig, AIProviderType, AnswerSettings, ConfidenceSettings, ChatSettings, BotInstructions } from "./types";

// Default AI Configuration
export const defaultAIConfig: AIConfig = {
  provider: "openai",
  apiKey: "",
  model: "gpt-4o-mini",
  temperature: 0.1,
  maxTokens: 2048,
  topP: 1,
  presencePenalty: 0,
  frequencyPenalty: 0,
  streaming: true,
  timeout: 30000,
};

// Default Answer Settings
export const defaultAnswerSettings: AnswerSettings = {
  showLawReferences: true,
  showExplanation: true,
  showSteps: true,
  showWarnings: true,
  showLawLinks: true,
  maxLawsUsed: 5,
  responseLanguage: "auto",
};

// Default Confidence Settings
export const defaultConfidenceSettings: ConfidenceSettings = {
  minConfidence: 60,
  minLawsRequired: 1,
  lowConfidenceAction: "ask_more",
};

// Default Bot Instructions
export const defaultBotInstructions: BotInstructions = {
  generalBehavior: [
    "كن محترماً ومهنياً في ردودك.",
    "قدم إجابات دقيقة بناءً على القانون العراقي فقط.",
    "لا تختلق أي معلومة قانونية.",
    "إذا كانت المعلومات ناقصة، اسأل المستخدم أسئلة توضيحية.",
    "اذكر المادة القانونية كدليل على إجابتك.",
    "تجنب التحيز أو التعصب.",
  ].join("\n"),
  responseStyle: "balanced",
  languagePreference: "auto",
  citationRequirement: "always",
  showDisclaimer: true,
  maxResponseLength: "detailed",
  responsePriority: "balanced",

  disallowedActions: [
    "تقديم استشارة قانونية ملزمة (استشر محامياً للحصول على استشارة رسمية)",
    "التحدث عن قضايا خارج نطاق القانون العراقي",
    "إعطاء أحكام أو توقعات قضائية",
    "الكشف عن معلومات سرية أو شخصية",
    "الترويج لأي جهة أو منتج",
  ],
  restrictedTopics: [
    "الأمن القومي العراقي",
    "الفتاوى الدينية (لست جهة دينية)",
  ],
  strictLawOnly: true,

  audienceMode: "everyone",
  requireVerification: false,
  allowPublicAccess: true,

  askClarifyingQuestions: true,
  maxClarifyingQuestions: 3,
  showPracticalSteps: true,
  showAlternativeInterpretations: false,
  showCourtProcedures: true,
  mentionUncertainty: true,
  referencePreviousConversations: false,

  legalSources: "laws_and_rulings",
  mentionProvinceDifferences: false,
  urgentCaseDetection: true,
  suggestHumanLawyer: true,
  escalationThreshold: 60,
};
export const defaultChatSettings: ChatSettings = {
  botName: "المساعد القانوني الذكي",
  botAvatar: "/bot-avatar.png",
  welcomeMessage: "مرحباً! أنا المساعد القانوني الذكي العراقي. كيف يمكنني مساعدتك اليوم؟",
  primaryColor: "#1E3A8A",
  suggestedQuestions: [
    "كيف أحصل على مكافأة نهاية الخدمة؟",
    "ما هي إجراءات تسجيل العقار؟",
    "كيف أسجل شركة جديدة؟",
    "ما هي حقوق المتهم في التحقيق؟",
  ],
};

// Provider Models Map
export const providerModels: Record<AIProviderType, string[]> = {
  openai: [
    "gpt-4o",
    "gpt-4o-mini",
    "gpt-4-turbo",
    "gpt-3.5-turbo",
  ],
  gemini: [
    "gemini-2.0-flash",
    "gemini-1.5-pro",
    "gemini-1.5-flash",
  ],
  claude: [
    "claude-3-5-sonnet-20241022",
    "claude-3-haiku-20240307",
  ],
  local: [
    "llama-3.1-8b",
    "mistral-7b",
    "custom",
  ],
};

// Provider Display Names
export const providerNames: Record<AIProviderType, string> = {
  openai: "OpenAI",
  gemini: "Google Gemini",
  claude: "Anthropic Claude",
  local: "Local Model",
};

// Temperature Presets
export const temperaturePresets = [
  { label: "دقيق (قانوني)", value: 0.3 },
  { label: "متوازن", value: 0.7 },
  { label: "إبداعي", value: 1.0 },
] as const;
