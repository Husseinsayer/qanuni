"use client";

import { useCallback, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Highlight from "@tiptap/extension-highlight";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import type { TemplateVariable } from "@/lib/knowledge-center/types";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3,
  List, ListOrdered,
  AlignRight, AlignCenter, AlignLeft,
  Table as TableIcon, Rows, Columns, Trash2,
  Link as LinkIcon,
  Highlighter,
  Undo, Redo,
  Eye, EyeOff,
  Plus, X, Copy, Check,
  Type,
  Pilcrow,
  ChevronDown,
  Eraser,
  GripVertical,
} from "lucide-react";

// ─── Decorator Extension: highlights {{variable}} patterns ───
const VariableHighlight = Extension.create({
  name: "variableHighlight",
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("variableHighlight"),
        props: {
          decorations(state) {
            const doc = state.doc;
            const decorations: Decoration[] = [];
            const regex = /\{\{([^}]+)\}\}/g;
            doc.descendants((node, pos) => {
              if (node.isText) {
                let match;
                while ((match = regex.exec(node.text!)) !== null) {
                  const from = pos + match.index;
                  const to = from + match[0].length;
                  decorations.push(
                    Decoration.inline(from, to, {
                      class:
                        "variable-chip inline-flex items-center gap-1 rounded-md bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 text-xs font-semibold text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700",
                    })
                  );
                }
              }
            });
            return DecorationSet.create(doc, decorations);
          },
        },
      }),
    ];
  },
});

// ─── Toolbar Button ───
function ToolBtn({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`rounded-lg p-1.5 transition-all duration-150 ${
        active
          ? "bg-accent text-white shadow-sm"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

// ─── Divider ───
function Divider() {
  return <div className="mx-1 h-5 w-px bg-border shrink-0" />;
}

// ─── Props ───
export interface LegalTemplateEditorProps {
  content: string;
  onChange: (html: string) => void;
  variables: TemplateVariable[];
  onVariablesChange: (vars: TemplateVariable[]) => void;
  placeholder?: string;
}

// ─── Predefined field types ───
const FIELD_TYPES = [
  { id: "name", label: "الاسم الكامل", placeholder: "{{الاسم_الكامل}}" },
  { id: "national_id", label: "رقم الهوية", placeholder: "{{رقم_الهوية}}" },
  { id: "date", label: "التاريخ", placeholder: "{{التاريخ}}" },
  { id: "address", label: "العنوان", placeholder: "{{العنوان}}" },
  { id: "phone", label: "رقم الهاتف", placeholder: "{{رقم_الهاتف}}" },
  { id: "amount", label: "المبلغ", placeholder: "{{المبلغ}}" },
  { id: "description", label: "الوصف", placeholder: "{{الوصف}}" },
  { id: "signature", label: "التوقيع", placeholder: "{{التوقيع}}" },
  { id: "court_name", label: "اسم المحكمة", placeholder: "{{اسم_المحكمة}}" },
  { id: "case_number", label: "رقم الدعوى", placeholder: "{{رقم_الدعوى}}" },
  { id: "party_name", label: "اسم الطرف", placeholder: "{{اسم_الطرف}}" },
  { id: "nationality", label: "الجنسية", placeholder: "{{الجنسية}}" },
  { id: "profession", label: "المهنة", placeholder: "{{المهنة}}" },
  { id: "amount_words", label: "المبلغ كتابة", placeholder: "{{المبلغ_كتابة}}" },
];

// ─── Main component ───
export default function LegalTemplateEditor({
  content,
  onChange,
  variables,
  onVariablesChange,
  placeholder = "ابدأ بكتابة نص النموذج هنا... استخدم {{اسم_المتغير}} لإدراج متغير",
}: LegalTemplateEditorProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [showVarPanel, setShowVarPanel] = useState(false);
  const [newVarName, setNewVarName] = useState("");
  const [copiedVar, setCopiedVar] = useState<string | null>(null);
  const [showFieldPalette, setShowFieldPalette] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["right", "center", "left"],
        defaultAlignment: "right",
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Placeholder.configure({ placeholder }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { dir: "ltr" },
      }),
      Highlight.configure({ multicolor: false }),
      TextStyle,
      Color,
      VariableHighlight,
    ],
    content: content || "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base dark:prose-invert max-w-none focus:outline-none min-h-[400px] px-4 py-4",
        dir: "rtl",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  // ── Insert template variable into editor ──
  const insertAtCursor = useCallback(
    (text: string) => {
      if (!editor) return;
      editor.chain().focus().insertContent(text).run();
    },
    [editor]
  );

  // ── Add variable ──
  const addVariable = useCallback(() => {
    if (!newVarName.trim()) return;
    const v: TemplateVariable = {
      id: `v-${Date.now()}`,
      name: newVarName.trim(),
      placeholder: "",
      defaultValue: "",
      required: true,
    };
    onVariablesChange([...variables, v]);
    setNewVarName("");
  }, [newVarName, variables, onVariablesChange]);

  const removeVariable = useCallback(
    (id: string) => {
      onVariablesChange(variables.filter((v) => v.id !== id));
    },
    [variables, onVariablesChange]
  );

  const copyVariable = useCallback((name: string) => {
    navigator.clipboard.writeText(`{{${name}}}`);
    setCopiedVar(name);
    setTimeout(() => setCopiedVar(null), 2000);
  }, []);

  // ── Insert table ──
  const insertTable = useCallback(() => {
    if (!editor) return;
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  }, [editor]);

  // ── Toggle link ──
  const toggleLink = useCallback(() => {
    if (!editor) return;
    if (editor.isActive("link")) {
      editor.chain().focus().unsetLink().run();
      setShowLinkInput(false);
      return;
    }
    setShowLinkInput(true);
  }, [editor]);

  const setLink = useCallback(() => {
    if (!editor || !linkUrl) return;
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: linkUrl })
      .run();
    setShowLinkInput(false);
    setLinkUrl("");
  }, [editor, linkUrl]);

  // ── Clear formatting ──
  const clearFormatting = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().clearNodes().unsetAllMarks().run();
  }, [editor]);

  // ── Preview HTML content ──
  const previewContent = content
    ? content.replace(/\{\{([^}]+)\}\}/g, (_, name) => {
        return `<span class="inline-flex items-center gap-1 rounded-md bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700">${name}</span>`;
      })
    : "";

  // ── Toolbar groups ──
  if (!editor) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-border bg-muted/20">
        <p className="text-sm text-muted-foreground">جاري تحميل المحرر...</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border shadow-sm" dir="rtl">
      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/20 px-2 py-1.5">
        {/* History */}
        <ToolBtn onClick={() => editor.chain().focus().undo().run()} title="تراجع (Ctrl+Z)">
          <Undo className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().redo().run()} title="إعادة (Ctrl+Shift+Z)">
          <Redo className="h-4 w-4" />
        </ToolBtn>
        <Divider />

        {/* Text Formatting */}
        <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="غامق (Ctrl+B)">
          <Bold className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="مائل (Ctrl+I)">
          <Italic className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="تحته خط (Ctrl+U)">
          <UnderlineIcon className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="يتوسطه خط">
          <Strikethrough className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive("highlight")} title="تظليل">
          <Highlighter className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn onClick={clearFormatting} title="مسح التنسيق">
          <Eraser className="h-4 w-4" />
        </ToolBtn>
        <Divider />

        {/* Headings */}
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="عنوان رئيسي">
          <Heading1 className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="عنوان فرعي">
          <Heading2 className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="عنوان فرعي أصغر">
          <Heading3 className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setParagraph().run()} active={editor.isActive("paragraph")} title="فقرة">
          <Pilcrow className="h-4 w-4" />
        </ToolBtn>
        <Divider />

        {/* Lists */}
        <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="قائمة نقطية">
          <List className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="قائمة مرقمة">
          <ListOrdered className="h-4 w-4" />
        </ToolBtn>
        <Divider />

        {/* Alignment */}
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="محاذاة يمين">
          <AlignRight className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="محاذاة وسط">
          <AlignCenter className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="محاذاة يسار">
          <AlignLeft className="h-4 w-4" />
        </ToolBtn>
        <Divider />

        {/* Table */}
        <div className="relative">
          <ToolBtn onClick={insertTable} title="إدراج جدول">
            <TableIcon className="h-4 w-4" />
          </ToolBtn>
          {editor.isActive("table") && (
            <div className="absolute top-full right-0 z-10 mt-1 flex gap-0.5 rounded-lg border border-border bg-popover p-1 shadow-lg">
              <button
                type="button"
                onClick={() => editor.chain().focus().addRowBefore().run()}
                title="إضافة صف قبله"
                className="rounded p-1 text-muted-foreground hover:bg-muted/60"
              >
                <Rows className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().addColumnBefore().run()}
                title="إضافة عمود قبله"
                className="rounded p-1 text-muted-foreground hover:bg-muted/60"
              >
                <Columns className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().deleteTable().run()}
                title="حذف الجدول"
                className="rounded p-1 text-red-500 hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Link */}
        <div className="relative">
          <ToolBtn onClick={toggleLink} active={editor.isActive("link")} title="رابط">
            <LinkIcon className="h-4 w-4" />
          </ToolBtn>
          {showLinkInput && (
            <div className="absolute top-full left-0 z-10 mt-1 flex items-center gap-1 rounded-lg border border-border bg-popover p-2 shadow-lg">
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://..."
                className="w-48 rounded-md border border-border bg-background px-2 py-1 text-xs outline-none focus:border-accent"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && setLink()}
                dir="ltr"
              />
              <button
                type="button"
                onClick={setLink}
                className="rounded-md bg-accent px-2 py-1 text-xs font-medium text-white hover:bg-accent/90"
              >
                تطبيق
              </button>
            </div>
          )}
        </div>
        <Divider />

        {/* Quick Fields Palette */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowFieldPalette(!showFieldPalette)}
            className={`flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-all ${
              showFieldPalette
                ? "bg-accent text-white"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            }`}
          >
            <Type className="h-3.5 w-3.5" />
            <span>حقول</span>
            <ChevronDown className="h-3 w-3" />
          </button>
          {showFieldPalette && (
            <div
              className="absolute top-full right-0 z-20 mt-1 grid grid-cols-2 gap-1 rounded-lg border border-border bg-popover p-2 shadow-lg"
              style={{ minWidth: "280px" }}
            >
              {FIELD_TYPES.map((field) => (
                <button
                  key={field.id}
                  type="button"
                  onClick={() => {
                    insertAtCursor(field.placeholder);
                    setShowFieldPalette(false);
                  }}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-right hover:bg-muted/60 transition-colors"
                >
                  <Plus className="h-3 w-3 shrink-0 text-accent" />
                  <span>{field.label}</span>
                  <span className="mr-auto font-mono text-[10px] text-muted-foreground">
                    {field.placeholder}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
        <Divider />

        {/* Variables Panel Toggle */}
        <ToolBtn onClick={() => setShowVarPanel(!showVarPanel)} active={showVarPanel} title="المتغيرات">
          <GripVertical className="h-4 w-4" />
        </ToolBtn>
        <Divider />

        {/* Preview Toggle */}
        <ToolBtn onClick={() => setShowPreview(!showPreview)} active={showPreview} title="معاينة">
          {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </ToolBtn>

        {/* Status indicator */}
        <div className="mr-auto flex items-center gap-2 text-[10px] text-muted-foreground">
          <span>{editor.storage.characterCount?.characters?.() ?? 0} حرف</span>
          <span>|</span>
          <span>{editor.storage.characterCount?.words?.() ?? 0} كلمة</span>
        </div>
      </div>

      {/* ── Editor / Preview ── */}
      {showPreview ? (
        <div className="min-h-[400px] p-4">
          <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
            {previewContent ? (
              <div dangerouslySetInnerHTML={{ __html: previewContent }} />
            ) : (
              <p className="text-muted-foreground text-sm">
                لا يوجد محتوى للمعاينة
              </p>
            )}
          </div>
        </div>
      ) : (
        <EditorContent editor={editor} />
      )}

      {/* ── Variables Panel (collapsible) ── */}
      {showVarPanel && (
        <div className="border-t border-border bg-muted/10 p-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold">
              المتغيرات <span className="text-muted-foreground font-normal">({variables.length})</span>
            </h4>
            <button
              type="button"
              onClick={() => setShowVarPanel(false)}
              className="rounded p-1 text-muted-foreground hover:bg-muted/60"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {variables.length === 0 ? (
            <p className="text-xs text-muted-foreground py-1">
              لم تضف أي متغيرات بعد. استخدم حقل الإضافة أدناه أو حقول سريعة من شريط الأدوات.
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {variables.map((v) => (
                <div
                  key={v.id}
                  className="group flex items-center gap-1 rounded-lg border border-border bg-background px-2 py-1 text-xs transition-colors hover:border-accent/30"
                >
                  <span className="font-mono font-medium text-accent">{`{{${v.name}}}`}</span>
                  <button
                    type="button"
                    onClick={() => {
                      insertAtCursor(`{{${v.name}}}`);
                    }}
                    className="rounded p-0.5 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-accent transition-all"
                    title="إدراج في المحرر"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => copyVariable(v.name)}
                    className="rounded p-0.5 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-green-600 transition-all"
                    title="نسخ"
                  >
                    {copiedVar === v.name ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeVariable(v.id)}
                    className="rounded p-0.5 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                    title="حذف"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              value={newVarName}
              onChange={(e) => setNewVarName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addVariable()}
              placeholder="اسم المتغير الجديد..."
              className="flex-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs outline-none focus:border-accent"
            />
            <button
              type="button"
              onClick={addVariable}
              disabled={!newVarName.trim()}
              className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent/90 disabled:opacity-50 transition-colors"
            >
              إضافة
            </button>
          </div>
        </div>
      )}

      {/* ── Bottom status bar ── */}
      <div className="flex items-center justify-between border-t border-border bg-muted/10 px-3 py-1 text-[10px] text-muted-foreground">
        <span>محرر نماذج قانونية | الاتجاه: يمين→يسار</span>
        <div className="flex items-center gap-3">
          <span>{content.length} حرف</span>
          <span>{content.split(/\{\{[^}]+\}\}/).length - 1} متغير</span>
        </div>
      </div>
    </div>
  );
}
