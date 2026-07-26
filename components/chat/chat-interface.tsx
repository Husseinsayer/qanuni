// ===== Iraqi Legal Assistant - Enhanced Chat Interface =====
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { Message, CaseType, ConfidenceScore, LawReference, Conversation, ChatSettings } from "@/lib/ai/types";
import { MessageBubble } from "./message-bubble";
import { TypingIndicator } from "./typing-indicator";
import { ChatInput } from "./chat-input";
import { SuggestedQuestions } from "./suggested-questions";
import { ConfidenceBadge } from "./confidence-badge";
import { LawReferences } from "./law-references";
import { ShareExport } from "./share-export";
import { ConversationSearch } from "./conversation-search";
import { ShortcutsHelp, useKeyboardShortcuts } from "./keyboard-shortcuts";
import {
  getConversations,
  addConversation,
  updateConversation,
  getChatSettings,
  getAIConfig,
  getBotInstructions,
} from "@/lib/ai/settings-store";
import {
  Plus,
  MessageSquare,
  Trash2,
  Menu,
  X,
  Copy,
  Share2,
  RotateCcw,
} from "lucide-react";

// === Chat State ===
type ChatState = {
  messages: Message[];
  isLoading: boolean;
  currentStreaming: string;
  error: string | null;
  caseType: CaseType | null;
  confidence: ConfidenceScore | null;
  lawReferences: LawReference[];
  answerSource: string;
  quality: string;
};

// === Initial Welcome Message ===
const getWelcomeMessage = (): Message => {
  const settings = getChatSettings();
  return {
    id: "welcome",
    role: "assistant",
    content: settings.welcomeMessage || `مرحباً! أنا **المساعد القانوني الذكي العراقي** 🎓

يمكنني مساعدتك في:
- فهم القوانين العراقية
- الإجابة على استفساراتك القانونية
- توضيح حقوقك وواجباتك
- إرشادك للخطوات القانونية المناسبة

كيف يمكنني مساعدتك اليوم؟`,
    timestamp: Date.now(),
  };
};

// === Chat Interface Component ===
export function ChatInterface() {
  const [state, setState] = useState<ChatState>({
    messages: [getWelcomeMessage()],
    isLoading: false,
    currentStreaming: "",
    error: null,
    caseType: null,
    confidence: null,
    lawReferences: [],
    answerSource: "",
    quality: "",
  });

  const [chatSettings, setChatSettings] = useState<ChatSettings>(getChatSettings());
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConvId, setCurrentConvId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load settings and conversations
  useEffect(() => {
    const settings = getChatSettings();
    setChatSettings(settings);
    setSuggestions(settings.suggestedQuestions);
    setConversations(getConversations());
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.messages, state.currentStreaming]);

  // === Create New Conversation ===
  const createNewConversation = () => {
    setState({
      messages: [getWelcomeMessage()],
      isLoading: false,
      currentStreaming: "",
      error: null,
      caseType: null,
      confidence: null,
      lawReferences: [],
      answerSource: "",
      quality: "",
    });
    setCurrentConvId(null);
    const settings = getChatSettings();
    setSuggestions(settings.suggestedQuestions);
  };

  // === Load Conversation ===
  const loadConversation = (conv: Conversation) => {
    setState({
      messages: conv.messages,
      isLoading: false,
      currentStreaming: "",
      error: null,
      caseType: conv.caseType || null,
      confidence: null,
      lawReferences: [],
      answerSource: "",
      quality: "",
    });
    setCurrentConvId(conv.id);
    setSuggestions([]);
  };

  // === Delete Conversation ===
  const deleteConversation = (id: string) => {
    const updated = conversations.filter((c) => c.id !== id);
    setConversations(updated);
    localStorage.setItem("iq_legal_conversations", JSON.stringify(updated));
    if (currentConvId === id) {
      createNewConversation();
    }
  };

  // === Handle Send Message ===
  const handleSend = async (content: string) => {
    if (!content.trim() || state.isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: "user",
      content,
      timestamp: Date.now(),
    };

    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null,
      currentStreaming: "",
    }));

    setSuggestions([]);

    try {
      // Call API with settings
      const aiConfig = getAIConfig();
      const botInstructions = getBotInstructions();
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          conversationHistory: state.messages.slice(-10),
          aiConfig,
          botInstructions,
        }),
      });

      if (!response.ok) {
        let errMsg = "فشل الاتصال بالخادم";
        try { const e = await response.json(); errMsg = e.error || e.answer || errMsg; } catch {}
        throw new Error(errMsg);
      }

      const data = await response.json();

      // Add assistant message
      const assistantMessage: Message = {
        id: `assistant_${Date.now()}`,
        role: "assistant",
        content: data.answer,
        timestamp: Date.now(),
        lawReferences: data.lawReferences,
        confidence: data.confidence,
        caseType: data.caseType,
      };

      const newMessages = [...state.messages, userMessage, assistantMessage];

      setState((prev) => ({
        ...prev,
        messages: newMessages,
        isLoading: false,
        caseType: data.caseType,
        confidence: data.confidence,
        lawReferences: data.lawReferences || [],
        answerSource: data.answerSource || "",
        quality: data.quality || "",
      }));

      // Save to conversations
      const convTitle =
        state.messages.length <= 1
          ? content.length > 50
            ? content.substring(0, 50) + "..."
            : content
          : conversations.find((c) => c.id === currentConvId)?.title ||
            "محادثة جديدة";

      if (currentConvId) {
        updateConversation(currentConvId, {
          messages: newMessages,
          caseType: data.caseType,
        });
      } else {
        const newConv: Conversation = {
          id: `conv_${Date.now()}`,
          title: convTitle,
          messages: newMessages,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          caseType: data.caseType,
          language: "ar",
          status: "active",
        };
        addConversation(newConv);
        setCurrentConvId(newConv.id);
      }

      setConversations(getConversations());
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "حدث خطأ أثناء الاتصال. يرجى المحاولة مرة أخرى.",
      }));
    }
  };

  // === Copy Last Response ===
  const copyLastResponse = () => {
    const lastAssistant = [...state.messages]
      .reverse()
      .find((m) => m.role === "assistant");
    if (lastAssistant) {
      navigator.clipboard.writeText(lastAssistant.content);
    }
  };

  // === Regenerate Last Response ===
  const regenerateResponse = () => {
    const lastUser = [...state.messages]
      .reverse()
      .find((m) => m.role === "user");
    if (lastUser) {
      // Remove last assistant message
      setState((prev) => ({
        ...prev,
        messages: prev.messages.slice(0, -1),
      }));
      handleSend(lastUser.content);
    }
  };

  // === Handle Rating ===
  const handleRate = useCallback((messageId: string, rating: number, feedback?: string) => {
    // Here you would typically send the rating to your API
  }, []);

  // === Handle Quick Feedback ===
  const handleFeedback = useCallback((messageId: string, type: "helpful" | "not_helpful" | "report") => {
    // Here you would typically send the feedback to your API
  }, []);

  // === Keyboard Shortcuts ===
  useKeyboardShortcuts([
    {
      key: "n",
      ctrl: true,
      action: createNewConversation,
      description: "محادثة جديدة",
    },
    {
      key: "/",
      ctrl: true,
      action: () => setSidebarOpen(!sidebarOpen),
      description: "إظهار/إخفاء الشريط الجانبي",
    },
  ]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("ar-IQ", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="flex h-screen max-h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-72" : "w-0"
        } transition-all duration-300 border-l border-border bg-muted/30 flex flex-col overflow-hidden`}
      >
        {sidebarOpen && (
          <>
            {/* Sidebar Header */}
            <div className="p-4 border-b border-border space-y-3">
              <button
                onClick={createNewConversation}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white hover:bg-accent/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                محادثة جديدة
              </button>
              <ConversationSearch
                conversations={conversations}
                onSelect={loadConversation}
              />
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => loadConversation(conv)}
                  className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                    currentConvId === conv.id
                      ? "bg-accent/10 border border-accent/20"
                      : "hover:bg-muted"
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {conv.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(conv.updatedAt)}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conv.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {conversations.length === 0 && (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  لا توجد محادثات سابقة
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
            <div>
              <h2 className="font-bold">{chatSettings.botName || "المساعد القانوني الذكي"}</h2>
              <div className="text-xs text-green-500">متصل</div>
            </div>
          </div>

          {state.messages.length > 1 && (
            <div className="flex items-center gap-2">
              <ShortcutsHelp />
              {currentConvId && (
                <ShareExport
                  conversation={conversations.find((c) => c.id === currentConvId)!}
                />
              )}
              <button
                onClick={copyLastResponse}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                title="نسخ آخر إجابة"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={regenerateResponse}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                title="إعادة توليد"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {state.messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              onRate={handleRate}
              onFeedback={handleFeedback}
            />
          ))}

          {state.currentStreaming && (
            <MessageBubble
              message={{
                id: "streaming",
                role: "assistant",
                content: state.currentStreaming,
                timestamp: Date.now(),
              }}
              isStreaming
              showRating={false}
            />
          )}

          {state.isLoading && !state.currentStreaming && <TypingIndicator />}

          {state.error && (
            <div className="text-center text-red-500 text-sm py-2">
              {state.error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Confidence, Source & Law References */}
        {state.confidence && (
          <div className="px-4 py-2 border-t border-border bg-muted/30">
            <div className="flex items-center gap-4 flex-wrap">
              <ConfidenceBadge confidence={state.confidence} />
              {state.answerSource && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-600 border border-purple-200">
                  {state.answerSource === "metadata" && "معلومات قانون"}
                  {state.answerSource === "article" && "نص مادة"}
                  {state.answerSource === "rag" && "قاعدة بيانات"}
                  {state.answerSource === "ai" && "ذكاء اصطناعي"}
                  {![ "metadata", "article", "rag", "ai" ].includes(state.answerSource) && state.answerSource}
                </span>
              )}
              {state.quality && (
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
                  state.quality === "high" ? "bg-green-50 text-green-600 border-green-200" :
                  state.quality === "medium" ? "bg-yellow-50 text-yellow-600 border-yellow-200" :
                  "bg-red-50 text-red-600 border-red-200"
                }`}>
                  {state.quality === "high" && "عالية الجودة"}
                  {state.quality === "medium" && "متوسطة الجودة"}
                  {state.quality === "low" && "منخفضة الجودة"}
                </span>
              )}
              {state.lawReferences.length > 0 && (
                <LawReferences references={state.lawReferences} />
              )}
            </div>
          </div>
        )}

        {/* Suggested Questions */}
        {suggestions.length > 0 && state.messages.length <= 1 && (
          <div className="px-4 py-2 border-t border-border">
            <SuggestedQuestions questions={suggestions} onSelect={handleSend} />
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t border-border">
          <ChatInput
            onSend={handleSend}
            disabled={state.isLoading}
            placeholder="اكتب سؤالك القانوني هنا..."
          />
        </div>
      </div>
    </div>
  );
}
