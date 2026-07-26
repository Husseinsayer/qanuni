// ===== Iraqi Legal Assistant - Local Model Provider (Stub) =====
import type { AIConfig, Message } from "../types";
import type { AIProvider, ProviderResponse, StreamChunk } from "./base";
import { registerProvider } from "./base";

class LocalProvider implements AIProvider {
  readonly name = "local";

  async chat(
    _messages: Message[],
    _systemPrompt: string,
    _config: AIConfig
  ): Promise<ProviderResponse> {
    throw new Error("المزود المحلي قيد التطوير. يرجى استخدام OpenAI حالياً.");
  }

  async *stream(
    _messages: Message[],
    _systemPrompt: string,
    _config: AIConfig
  ): AsyncGenerator<StreamChunk, void, unknown> {
    throw new Error("المزود المحلي قيد التطوير. يرجى استخدام OpenAI حالياً.");
  }

  validate(_config: AIConfig): { valid: boolean; error?: string } {
    return { valid: false, error: "المزود المحلي غير مدعوم بعد" };
  }

  getModels(): string[] {
    return ["llama-3.1-8b", "mistral-7b", "custom"];
  }
}

registerProvider(new LocalProvider());
