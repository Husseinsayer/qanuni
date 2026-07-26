// ===== Iraqi Legal Assistant - OpenAI Provider =====
import type { AIConfig, Message } from "../types";
import type { AIProvider, ProviderResponse, StreamChunk } from "./base";
import { registerProvider } from "./base";

// === OpenAI Provider Implementation ===
class OpenAIProvider implements AIProvider {
  readonly name = "openai";

  private apiUrl = "https://api.openai.com/v1/chat/completions";

  chat(
    messages: Message[],
    systemPrompt: string,
    config: AIConfig
  ): Promise<ProviderResponse> {
    return this.makeRequest(messages, systemPrompt, config, false);
  }

  async *stream(
    messages: Message[],
    systemPrompt: string,
    config: AIConfig
  ): AsyncGenerator<StreamChunk, void, unknown> {
    const apiMessages = this.formatMessages(messages, systemPrompt);

    const response = await fetch(this.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: apiMessages,
        temperature: config.temperature,
        max_tokens: config.maxTokens,
        top_p: config.topP,
        presence_penalty: config.presencePenalty,
        frequency_penalty: config.frequencyPenalty,
        seed: 42,
        stream: true,
      }),
      signal: AbortSignal.timeout(config.timeout),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response body");

    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;

          const data = trimmed.slice(6);
          if (data === "[DONE]") {
            yield { content: "", done: true };
            return;
          }

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              yield {
                content: delta,
                done: false,
              };
            }
          } catch {
            // Skip malformed JSON lines
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  validate(config: AIConfig): { valid: boolean; error?: string } {
    if (!config.apiKey) {
      return { valid: false, error: "API Key مطلوب" };
    }
    if (!config.apiKey.startsWith("sk-")) {
      return { valid: false, error: "API Key غير صالح (يجب أن يبدأ بـ sk-)" };
    }
    if (!config.model) {
      return { valid: false, error: "Model مطلوب" };
    }
    return { valid: true };
  }

  getModels(): string[] {
    return ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"];
  }

  // === Private Helpers ===

  private formatMessages(
    messages: Message[],
    systemPrompt: string
  ): Array<{ role: string; content: string }> {
    const apiMessages: Array<{ role: string; content: string }> = [
      { role: "system", content: systemPrompt },
    ];

    for (const msg of messages) {
      apiMessages.push({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content,
      });
    }

    return apiMessages;
  }

  private async makeRequest(
    messages: Message[],
    systemPrompt: string,
    config: AIConfig,
    _stream: boolean
  ): Promise<ProviderResponse> {
    const apiMessages = this.formatMessages(messages, systemPrompt);

    const response = await fetch(this.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: apiMessages,
        temperature: config.temperature,
        max_tokens: config.maxTokens,
        top_p: config.topP,
        presence_penalty: config.presencePenalty,
        frequency_penalty: config.frequencyPenalty,
        seed: 42,
        stream: false,
      }),
      signal: AbortSignal.timeout(config.timeout),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const choice = data.choices?.[0];

    return {
      content: choice?.message?.content || "",
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
      },
      finishReason: choice?.finish_reason || "unknown",
    };
  }
}

// Register the provider
registerProvider(new OpenAIProvider());
