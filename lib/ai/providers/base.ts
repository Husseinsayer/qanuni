// ===== Iraqi Legal Assistant - AI Provider Base Interface =====
import type { AIConfig, Message } from "../types";

// === Stream Chunk for SSE ===
export type StreamChunk = {
  content: string;
  done: boolean;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
};

// === Provider Response ===
export type ProviderResponse = {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason: string;
};

// === Base AI Provider Interface ===
export interface AIProvider {
  readonly name: string;

  // Non-streaming response
  chat(
    messages: Message[],
    systemPrompt: string,
    config: AIConfig
  ): Promise<ProviderResponse>;

  // Streaming response
  stream(
    messages: Message[],
    systemPrompt: string,
    config: AIConfig
  ): AsyncGenerator<StreamChunk, void, unknown>;

  // Validate provider config
  validate(config: AIConfig): { valid: boolean; error?: string };

  // Get available models
  getModels(): string[];
}

// === Provider Registry ===
const providers = new Map<string, AIProvider>();

export function registerProvider(provider: AIProvider): void {
  providers.set(provider.name, provider);
}

export function getProvider(name: string): AIProvider | undefined {
  return providers.get(name);
}

export function getAllProviders(): AIProvider[] {
  return Array.from(providers.values());
}
