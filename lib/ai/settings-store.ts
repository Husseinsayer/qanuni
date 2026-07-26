// ===== Iraqi Legal Assistant - Settings Store =====
"use client";

import type {
  AIConfig,
  AnswerSettings,
  ConfidenceSettings,
  ChatSettings,
  BotInstructions,
  SystemPrompt,
  Question,
  Conversation,
} from "./types";
import {
  defaultAIConfig,
  defaultAnswerSettings,
  defaultConfidenceSettings,
  defaultChatSettings,
  defaultBotInstructions,
} from "./config";

// Storage Keys
const KEYS = {
  AI_CONFIG: "iq_legal_ai_config",
  ANSWER_SETTINGS: "iq_legal_answer_settings",
  CONFIDENCE_SETTINGS: "iq_legal_confidence_settings",
  CHAT_SETTINGS: "iq_legal_chat_settings",
  BOT_INSTRUCTIONS: "iq_legal_bot_instructions",
  SYSTEM_PROMPTS: "iq_legal_system_prompts",
  QUESTIONS: "iq_legal_questions",
  CONVERSATIONS: "iq_legal_conversations",
} as const;

// === Generic Storage Helpers ===
function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch { /* silent */ }
}

// === AI Config ===
export function getAIConfig(): AIConfig {
  return load<AIConfig>(KEYS.AI_CONFIG, defaultAIConfig);
}

export function setAIConfig(config: AIConfig): void {
  save(KEYS.AI_CONFIG, config);
}

// === Answer Settings ===
export function getAnswerSettings(): AnswerSettings {
  return load<AnswerSettings>(KEYS.ANSWER_SETTINGS, defaultAnswerSettings);
}

export function setAnswerSettings(settings: AnswerSettings): void {
  save(KEYS.ANSWER_SETTINGS, settings);
}

// === Confidence Settings ===
export function getConfidenceSettings(): ConfidenceSettings {
  return load<ConfidenceSettings>(KEYS.CONFIDENCE_SETTINGS, defaultConfidenceSettings);
}

export function setConfidenceSettings(settings: ConfidenceSettings): void {
  save(KEYS.CONFIDENCE_SETTINGS, settings);
}

// === Chat Settings ===
export function getChatSettings(): ChatSettings {
  return load<ChatSettings>(KEYS.CHAT_SETTINGS, defaultChatSettings);
}

export function setChatSettings(settings: ChatSettings): void {
  save(KEYS.CHAT_SETTINGS, settings);
}

// === Bot Instructions ===
export function getBotInstructions(): BotInstructions {
  return load<BotInstructions>(KEYS.BOT_INSTRUCTIONS, defaultBotInstructions);
}

export function setBotInstructions(instructions: BotInstructions): void {
  save(KEYS.BOT_INSTRUCTIONS, instructions);
}

// === System Prompts ===
export const defaultSystemPrompt: SystemPrompt = {
  id: "default",
  name: "البرومبت الافتراضي",
  content: [
    "أنت المساعد القانوني الذكي العراقي.",
    "مهمتك مساعدة المواطنين العراقيين في فهم قوانينهم والحصول على إجابة قانونية دقيقة.",
    "",
    "القواعد الأساسية:",
    "1. لا تختلق أي معلومة قانونية. استخدم فقط المعلومات من قاعدة البيانات.",
    "2. إذا كانت المعلومات ناقصة، اسأل المستخدم أسئلة توضيحية.",
    "3. تحدث باللهجة العراقية إذا كان المستخدم يستخدم اللهجة العراقية.",
    "4. تحدث بالفصحى إذا كان المستخدم يستخدم الفصحى.",
    "5. كن محترماً وواضحاً في ردودك.",
    "6. اذكر المادة القانونية كدليل على إجابتك وليس الإجابة نفسها.",
    "",
    "شكل الإجابة:",
    "1. الجواب المباشر",
    "2. شرح مبسط",
    "3. تفسير قانوني",
    "4. الخطوات المقترحة",
    "5. الحالات المختلفة",
    "6. المواد القانونية المستخدمة",
    "7. روابط المواد داخل الموقع",
    "",
    "لا تبدأ بعرض المواد القانونية. ابدأ بالجواب المباشر أولاً.",
  ].join("\n"),
  isDefault: true,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

export function getSystemPrompts(): SystemPrompt[] {
  return load<SystemPrompt[]>(KEYS.SYSTEM_PROMPTS, [defaultSystemPrompt]);
}

export function setSystemPrompts(prompts: SystemPrompt[]): void {
  save(KEYS.SYSTEM_PROMPTS, prompts);
}

export function addSystemPrompt(prompt: SystemPrompt): void {
  const prompts = getSystemPrompts();
  prompts.push(prompt);
  setSystemPrompts(prompts);
}

export function updateSystemPrompt(id: string, updates: Partial<SystemPrompt>): void {
  const prompts = getSystemPrompts();
  const idx = prompts.findIndex((p) => p.id === id);
  if (idx !== -1) {
    prompts[idx] = { ...prompts[idx], ...updates, updatedAt: Date.now() };
    setSystemPrompts(prompts);
  }
}

export function deleteSystemPrompt(id: string): void {
  const prompts = getSystemPrompts().filter((p) => p.id !== id);
  setSystemPrompts(prompts);
}

// === Questions ===
export const defaultQuestions: Question[] = [
  // ===== الأحوال الشخصية =====
  {
    id: "personal_1",
    text: "ما علاقة المدعي بالشخص المعني؟",
    caseType: "personal",
    category: "علاقة",
    required: true,
    priority: 1,
    options: [
      { label: "زوج/زوجة", value: "spouse" },
      { label: "ابن/ابنة", value: "child" },
      { label: "أب/أم", value: "parent" },
      { label: "أخ/أخت", value: "sibling" },
      { label: "other", value: "other" },
    ],
  },
  {
    id: "personal_2",
    text: "ما سبب المشكلة القانونية؟",
    caseType: "personal",
    category: "سبب",
    required: true,
    priority: 2,
    options: [
      { label: "طلاق", value: "divorce" },
      { label: "حضانة أطفال", value: "custody" },
      { label: "نفقة", value: "alimony" },
      { label: "نسب", value: "paternity" },
      { label: "ميراث", value: "inheritance" },
      { label: "زواج", value: "marriage" },
    ],
  },
  {
    id: "personal_3",
    text: "هل هناك عقد زواج مسجل؟",
    caseType: "personal",
    category: "توثيق",
    required: false,
    priority: 3,
    options: [
      { label: "نعم", value: "yes" },
      { label: "لا", value: "no" },
      { label: "لا أعرف", value: "unknown" },
    ],
  },
  // ===== العقارات =====
  {
    id: "realestate_1",
    text: "ما نوع العقار؟",
    caseType: "real_estate",
    category: "نوع",
    required: true,
    priority: 1,
    options: [
      { label: "سكني", value: "residential" },
      { label: "تجاري", value: "commercial" },
      { label: "أرض فارغة", value: "land" },
      { label: "زراعي", value: "agricultural" },
    ],
  },
  {
    id: "realestate_2",
    text: "هل العقار مسجل في الدائرة العقارية؟",
    caseType: "real_estate",
    category: "تسجيل",
    required: true,
    priority: 2,
    options: [
      { label: "نعم", value: "yes" },
      { label: "لا", value: "no" },
      { label: "قيد الإجراءات", value: "pending" },
    ],
  },
  {
    id: "realestate_3",
    text: "ما المشكلة تحديداً؟",
    caseType: "real_estate",
    category: "مشكلة",
    required: true,
    priority: 3,
    options: [
      { label: "نزاع ملكية", value: "ownership_dispute" },
      { label: "تسجيل عقار", value: "registration" },
      { label: "قسمة عقار", value: "partition" },
      { label: "بيع وشراء", value: "sale" },
      { label: "رهن", value: "mortgage" },
    ],
  },
  // ===== الجنائية =====
  {
    id: "criminal_1",
    text: "ما التهمة الموجهة؟",
    caseType: "criminal",
    category: "تهمة",
    required: true,
    priority: 1,
  },
  {
    id: "criminal_2",
    text: "هل المتهم موقوف حالياً؟",
    caseType: "criminal",
    category: "حالة",
    required: true,
    priority: 2,
    options: [
      { label: "نعم", value: "yes" },
      { label: "لا", value: "no" },
      { label: "تحت الإقامة الجبرية", value: "house_arrest" },
    ],
  },
  {
    id: "criminal_3",
    text: "ما المرحلة الحالية للقضية؟",
    caseType: "criminal",
    category: "مرحلة",
    required: true,
    priority: 3,
    options: [
      { label: "تحقيق أولي", value: "investigation" },
      { label: "محاكمة", value: "trial" },
      { label: "استئناف", value: "appeal" },
      { label: "حكم نهائي", value: "final" },
    ],
  },
  // ===== قانون العمل =====
  {
    id: "labor_1",
    text: "ما نوع عقد العمل؟",
    caseType: "labor",
    category: "عقد",
    required: true,
    priority: 1,
    options: [
      { label: "محدد المدة", value: "fixed" },
      { label: "غير محدد المدة", value: "indefinite" },
      { label: "مؤقت", value: "temporary" },
    ],
  },
  {
    id: "labor_2",
    text: "ما مدة الخدمة بالسنوات؟",
    caseType: "labor",
    category: "مدة",
    required: true,
    priority: 2,
  },
  {
    id: "labor_3",
    text: "ما سبب المطالبة؟",
    caseType: "labor",
    category: "سبب",
    required: true,
    priority: 3,
    options: [
      { label: "فصل تعسفي", value: "wrongful_termination" },
      { label: "مكافأة نهاية الخدمة", value: "end_of_service" },
      { label: "أجور مستحقة", value: "unpaid_wages" },
      { label: "إصابات عمل", value: "work_injury" },
    ],
  },
  // ===== المرور =====
  {
    id: "traffic_1",
    text: "ما نوع المخالفة أو المشكلة؟",
    caseType: "traffic",
    category: "مخالفة",
    required: true,
    priority: 1,
    options: [
      { label: "سرعة", value: "speeding" },
      { label: "حادث مروري", value: "accident" },
      { label: "مخالفة إدارية", value: "administrative" },
      { label: "سياقة بدون رخصة", value: "no_license" },
    ],
  },
  // ===== الشركات =====
  {
    id: "companies_1",
    text: "ما نوع الشركة؟",
    caseType: "companies",
    category: "نوع",
    required: true,
    priority: 1,
    options: [
      { label: "مساهمة", value: "joint_stock" },
      { label: "محدودة", value: "limited" },
      { label: "تضامن", value: "partnership" },
      { label: "مؤسسة فردية", value: "sole_proprietorship" },
    ],
  },
  {
    id: "companies_2",
    text: "ما الإجراء المطلوب؟",
    caseType: "companies",
    category: "إجراء",
    required: true,
    priority: 2,
    options: [
      { label: "تأسيس شركة", value: "establishment" },
      { label: "تسجيل تعديلات", value: "amendments" },
      { label: "حل أو تصفية", value: "dissolution" },
    ],
  },
];

export function getQuestions(): Question[] {
  return load<Question[]>(KEYS.QUESTIONS, defaultQuestions);
}

export function setQuestions(questions: Question[]): void {
  save(KEYS.QUESTIONS, questions);
}

export function addQuestion(question: Question): void {
  const questions = getQuestions();
  questions.push(question);
  setQuestions(questions);
}

export function updateQuestion(id: string, updates: Partial<Question>): void {
  const questions = getQuestions();
  const idx = questions.findIndex((q) => q.id === id);
  if (idx !== -1) {
    questions[idx] = { ...questions[idx], ...updates };
    setQuestions(questions);
  }
}

export function deleteQuestion(id: string): void {
  const questions = getQuestions().filter((q) => q.id !== id);
  setQuestions(questions);
}

// === Conversations ===
export function getConversations(): Conversation[] {
  return load<Conversation[]>(KEYS.CONVERSATIONS, []);
}

export function setConversations(conversations: Conversation[]): void {
  save(KEYS.CONVERSATIONS, conversations);
}

export function addConversation(conversation: Conversation): void {
  const conversations = getConversations();
  conversations.unshift(conversation);
  setConversations(conversations);
}

export function updateConversation(id: string, updates: Partial<Conversation>): void {
  const conversations = getConversations();
  const idx = conversations.findIndex((c) => c.id === id);
  if (idx !== -1) {
    conversations[idx] = { ...conversations[idx], ...updates, updatedAt: Date.now() };
    setConversations(conversations);
  }
}

export function deleteConversation(id: string): void {
  const conversations = getConversations().filter((c) => c.id !== id);
  setConversations(conversations);
}
