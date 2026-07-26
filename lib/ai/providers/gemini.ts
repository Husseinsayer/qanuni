// ===== Iraqi Legal Assistant - Google Gemini Provider =====
import type { AIConfig, Message } from "../types";
import type { AIProvider, ProviderResponse, StreamChunk } from "./base";
import { registerProvider } from "./base";

class GeminiProvider implements AIProvider {
  readonly name = "gemini";

  async chat(
    _messages: Message[],
    _systemPrompt: string,
    _config: AIConfig
  ): Promise<ProviderResponse> {
    throw new Error("مزود Google Gemini قيد التطوير. يرجى استخدام OpenAI حالياً.");
  }

  async *_stream(
    _messages: Message[],
    _systemPrompt: string,
    _config: AIConfig
  ): AsyncGenerator<StreamChunk, void, unknown> {
    throw new Error("مزود Google Gemini قيد التطوير. يرجى استخدام OpenAI حالياً.");
  }

  stream(
    _messages: Message[],
    _systemPrompt: string,
    _config: AIConfig
  ): AsyncGenerator<StreamChunk, void, unknown> {
    return this._stream(_messages, _systemPrompt, _config);
  }

  validate(config: AIConfig): { valid: boolean; error?: string } {
    if (!config.apiKey) {
      return { valid: false, error: "API Key مطلوب لمزود Gemini" };
    }
    return { valid: true };
  }

  getModels(): string[] {
    return ["gemini-2.0-flash", "gemini-1.5-pro", "gemini-1.5-flash"];
  }
}

registerProvider(new GeminiProvider());
