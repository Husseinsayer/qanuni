// ===== Iraqi Legal Assistant - AI Settings Admin Page =====
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAIConfig, setAIConfig } from "@/lib/ai/settings-store";
import { providerModels, providerNames, temperaturePresets } from "@/lib/ai/config";
import type { AIConfig, AIProviderType } from "@/lib/ai/types";
import { Save, Eye, EyeOff } from "lucide-react";
import { toast } from "@/lib/admin-toast";

export default function AISettingsPage() {
  const [config, setConfig] = useState<AIConfig>(getAIConfig());
  const [showApiKey, setShowApiKey] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleSave = () => {
    setAIConfig(config);
    toast.success("تم الحفظ", "تم حفظ إعدادات الذكاء الاصطناعي بنجاح");
  };

  const handleTestConnection = async () => {
    setTestResult("جاري اختبار الاتصال...");
    try {
      // Validate config
      if (!config.apiKey) {
        setTestResult("❌ API Key مطلوب");
        return;
      }

      // Proxy through server-side API to avoid CORS
      const response = await fetch("/api/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: config.apiKey,
          model: config.model,
          provider: config.provider,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setTestResult(`❌ فشل الاتصال: ${data.error}`);
        return;
      }

      setTestResult(`✅ الاتصال ناجح! رد النموذج: "${data.content}"`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "خطأ غير معروف";
      setTestResult(`❌ خطأ في الاختبار: ${msg.slice(0, 100)}`);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">إعدادات الذكاء الاصطناعي</h1>

      {/* Provider Selection */}
      <Card>
        <CardHeader>
          <CardTitle>مزود الخدمة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">المزود</label>
            <select
              value={config.provider}
              onChange={(e) =>
                setConfig({ ...config, provider: e.target.value as AIProviderType })
              }
              className="w-full rounded-xl border border-border bg-background px-4 py-2"
            >
              {Object.entries(providerNames).map(([key, name]) => (
                <option key={key} value={key}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">API Key</label>
            <div className="relative">
              <input
                type={showApiKey ? "text" : "password"}
                value={config.apiKey}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                placeholder="sk-..."
                className="w-full rounded-xl border border-border bg-background px-4 py-2 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showApiKey ? (
                  <EyeOff className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Eye className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">النموذج</label>
            <select
              value={config.model}
              onChange={(e) => setConfig({ ...config, model: e.target.value })}
              className="w-full rounded-xl border border-border bg-background px-4 py-2"
            >
              {providerModels[config.provider]?.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Generation Settings */}
      <Card>
        <CardHeader>
          <CardTitle>إعدادات التوليد</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              الحرارة: {config.temperature}
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={config.temperature}
              onChange={(e) =>
                setConfig({ ...config, temperature: parseFloat(e.target.value) })
              }
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              {temperaturePresets.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => setConfig({ ...config, temperature: preset.value })}
                  className="hover:text-accent"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              الحد الأقصى للرموز: {config.maxTokens}
            </label>
            <input
              type="range"
              min="256"
              max="4096"
              step="256"
              value={config.maxTokens}
              onChange={(e) =>
                setConfig({ ...config, maxTokens: parseInt(e.target.value) })
              }
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Top P: {config.topP}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={config.topP}
                onChange={(e) =>
                  setConfig({ ...config, topP: parseFloat(e.target.value) })
                }
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Presence Penalty: {config.presencePenalty}
              </label>
              <input
                type="range"
                min="-2"
                max="2"
                step="0.1"
                value={config.presencePenalty}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    presencePenalty: parseFloat(e.target.value),
                  })
                }
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Frequency Penalty: {config.frequencyPenalty}
              </label>
              <input
                type="range"
                min="-2"
                max="2"
                step="0.1"
                value={config.frequencyPenalty}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    frequencyPenalty: parseFloat(e.target.value),
                  })
                }
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                المهلة (مللي ثانية): {config.timeout}
              </label>
              <input
                type="range"
                min="5000"
                max="60000"
                step="5000"
                value={config.timeout}
                onChange={(e) =>
                  setConfig({ ...config, timeout: parseInt(e.target.value) })
                }
                className="w-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="streaming"
              checked={config.streaming}
              onChange={(e) =>
                setConfig({ ...config, streaming: e.target.checked })
              }
              className="rounded"
            />
            <label htmlFor="streaming" className="text-sm font-medium">
              تفعيل البث المباشر (Streaming)
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Test & Save */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 ml-2" />
              حفظ الإعدادات
            </Button>
            <Button variant="outline" onClick={handleTestConnection}>
              اختبار الاتصال
            </Button>
            {testResult && (
              <span className="text-sm">{testResult}</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
