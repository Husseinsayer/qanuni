// ===== Iraqi Legal Assistant - Server-Safe Settings =====
// This file provides server-safe defaults without localStorage
import type {
  AIConfig,
  AnswerSettings,
  ConfidenceSettings,
  ChatSettings,
} from "./types";
import {
  defaultAIConfig,
  defaultAnswerSettings,
  defaultConfidenceSettings,
  defaultChatSettings,
} from "./config";

// Server-safe functions that return defaults (no localStorage)
export function getServerAIConfig(): AIConfig {
  return defaultAIConfig;
}

export function getServerAnswerSettings(): AnswerSettings {
  return defaultAnswerSettings;
}

export function getServerConfidenceSettings(): ConfidenceSettings {
  return defaultConfidenceSettings;
}

export function getServerChatSettings(): ChatSettings {
  return defaultChatSettings;
}
