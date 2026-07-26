// ===== Iraqi Legal Assistant - Anthropic Claude Provider (Stub) =====
import type { AIConfig, Message } from "../types";
import type { AIProvider, ProviderResponse, StreamChunk } from "./base";
import { registerProvider } from "./base";

class ClaudeProvider implements AIProvider {
  readonly name = "claude";

  async chat(
    _messages: Message[],
    _systemPrompt: string,
    _config: AIConfig
  ): Promise<ProviderResponse> {
    throw new Error("مزود Anthropic Claude قيد التطوير. يرجى استخدام OpenAI حالياً.");
  }

  async *stream(
    _messages: Message[],
    _systemPrompt: string,
    _config: AIConfig
  ): AsyncGenerator<StreamChunk, void, unknown> {
    throw new Error("مزود Anthropic Claude قيد التطوير. يرجى استخدام OpenAI حالياً.");
  }

  validate(_config: AIConfig): { valid: boolean; error?: string } {
    return { valid: false, error: "مزود Claude غير مدعوم بعد" };
  }

  getModels(): string[] {
    return ["claude-3-5-sonnet-20241022", "claude-3-haiku-20240307"];
  }
}

registerProvider(new ClaudeProvider());
