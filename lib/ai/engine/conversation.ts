// ===== Iraqi Legal Assistant - Conversation Manager =====
import type {
  Conversation,
  Message,
  CaseType,
  MessageMetadata,
} from "../types";
import {
  getConversations,
  setConversations,
  addConversation,
  updateConversation,
  deleteConversation,
} from "../settings-store";

// === Generate Unique ID ===
function generateId(): string {
  return `conv_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// === Conversation Manager Class ===
export class ConversationManager {
  private conversations: Conversation[];
  private currentConversation: Conversation | null = null;

  constructor() {
    this.conversations = getConversations();
  }

  // === Get All Conversations ===
  getAll(): Conversation[] {
    return this.conversations;
  }

  // === Get Current Conversation ===
  getCurrent(): Conversation | null {
    return this.currentConversation;
  }

  // === Create New Conversation ===
  create(title?: string, language: "ar" | "ar-iq" = "ar"): Conversation {
    const conversation: Conversation = {
      id: generateId(),
      title: title || "محادثة جديدة",
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      language,
      status: "active",
    };

    this.currentConversation = conversation;
    addConversation(conversation);
    this.conversations = getConversations();

    return conversation;
  }

  // === Load Conversation ===
  load(id: string): Conversation | null {
    const conversation = this.conversations.find((c) => c.id === id);
    if (conversation) {
      this.currentConversation = conversation;
    }
    return conversation || null;
  }

  // === Add Message to Current Conversation ===
  addMessage(
    role: "user" | "assistant" | "system",
    content: string,
    metadata?: MessageMetadata
  ): Message | null {
    if (!this.currentConversation) return null;

    const message: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      role,
      content,
      timestamp: Date.now(),
      metadata,
    };

    this.currentConversation.messages.push(message);
    this.currentConversation.updatedAt = Date.now();

    // Auto-generate title from first user message
    if (
      role === "user" &&
      this.currentConversation.messages.filter((m) => m.role === "user").length === 1
    ) {
      this.currentConversation.title =
        content.length > 50 ? content.substring(0, 50) + "..." : content;
    }

    updateConversation(this.currentConversation.id, {
      messages: this.currentConversation.messages,
      title: this.currentConversation.title,
    });

    return message;
  }

  // === Update Message with Law References ===
  updateMessage(
    messageId: string,
    updates: Partial<Message>
  ): void {
    if (!this.currentConversation) return;

    const msgIdx = this.currentConversation.messages.findIndex(
      (m) => m.id === messageId
    );
    if (msgIdx === -1) return;

    this.currentConversation.messages[msgIdx] = {
      ...this.currentConversation.messages[msgIdx],
      ...updates,
    };

    updateConversation(this.currentConversation.id, {
      messages: this.currentConversation.messages,
    });
  }

  // === Set Case Type ===
  setCaseType(caseType: CaseType): void {
    if (!this.currentConversation) return;

    this.currentConversation.caseType = caseType;
    updateConversation(this.currentConversation.id, { caseType });
  }

  // === Rate Conversation ===
  rate(rating: number): void {
    if (!this.currentConversation) return;

    this.currentConversation.rating = rating;
    updateConversation(this.currentConversation.id, { rating });
  }

  // === Archive Conversation ===
  archive(): void {
    if (!this.currentConversation) return;

    this.currentConversation.status = "archived";
    updateConversation(this.currentConversation.id, { status: "archived" });
    this.currentConversation = null;
  }

  // === Delete Conversation ===
  delete(id: string): void {
    deleteConversation(id);
    this.conversations = getConversations();

    if (this.currentConversation?.id === id) {
      this.currentConversation = null;
    }
  }

  // === Search Conversations ===
  search(query: string): Conversation[] {
    const queryLower = query.toLowerCase();
    return this.conversations.filter(
      (c) =>
        c.title.toLowerCase().includes(queryLower) ||
        c.messages.some((m) => m.content.toLowerCase().includes(queryLower))
    );
  }

  // === Get Statistics ===
  getStats(): {
    total: number;
    active: number;
    archived: number;
    totalMessages: number;
    averageMessages: number;
  } {
    const total = this.conversations.length;
    const active = this.conversations.filter((c) => c.status === "active").length;
    const archived = this.conversations.filter(
      (c) => c.status === "archived"
    ).length;
    const totalMessages = this.conversations.reduce(
      (sum, c) => sum + c.messages.length,
      0
    );

    return {
      total,
      active,
      archived,
      totalMessages,
      averageMessages: total > 0 ? Math.round(totalMessages / total) : 0,
    };
  }
}

// === Singleton Instance ===
let managerInstance: ConversationManager | null = null;

export function getConversationManager(): ConversationManager {
  if (!managerInstance) {
    managerInstance = new ConversationManager();
  }
  return managerInstance;
}
