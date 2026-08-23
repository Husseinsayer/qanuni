"use client";

import { useState, useCallback, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3,
  List, ListOrdered, Quote,
  AlignRight, AlignCenter, AlignLeft,
  Link as LinkIcon, Image as ImageIcon,
  Highlighter, Code2,
  Undo, Redo,
  Eye, EyeOff,
  Pilcrow, Palette, Table as TableIcon, Minus, Braces, Video, Loader2,
} from "lucide-react";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Youtube from "@tiptap/extension-youtube";

// ─── Toolbar Button ───
function ToolBtn({
  onClick, active, title, children,
}: {
  onClick: () => void; active?: boolean; title: string; children: React.ReactNode;
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

function Divider() {
  return <div className="mx-1 h-5 w-px bg-border shrink-0" />;
}

// ─── Props ───
export interface BlogEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function BlogEditor({
  content,
  onChange,
  placeholder = "ابدأ بكتابة مقالك هنا...",
}: BlogEditorProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [showImageInput, setShowImageInput] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [showVideoInput, setShowVideoInput] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
        blockquote: {},
        code: {},
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["right", "center", "left"],
        defaultAlignment: "right",
      }),
      Placeholder.configure({ placeholder }),
      Link.configure({ openOnClick: false, HTMLAttributes: { dir: "ltr" } }),
      Highlight.configure({ multicolor: false }),
      Image,
      TextStyle,
      Color.configure({ types: [TextStyle.name] }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Youtube.configure({
        controls: true,
        nocookie: true,
      }),
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
    editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run();
    setShowLinkInput(false);
    setLinkUrl("");
  }, [editor, linkUrl]);

  const setImage = useCallback(() => {
    if (!editor || !imageUrl) return;
    editor.chain().focus().setImage({ src: imageUrl }).run();
    setShowImageInput(false);
    setImageUrl("");
  }, [editor, imageUrl]);

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (json.url) {
        editor.chain().focus().setImage({ src: json.url }).run();
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }, [editor]);

  const clearFormatting = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().clearNodes().unsetAllMarks().run();
  }, [editor]);

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
        {/* Color Picker */}
        <div className="relative">
          <ToolBtn onClick={() => setShowColorPicker(!showColorPicker)} active={showColorPicker} title="لون النص">
            <Palette className="h-4 w-4" />
          </ToolBtn>
          {showColorPicker && (
            <div className="absolute top-full left-0 z-10 mt-1 rounded-lg border border-border bg-popover p-2 shadow-lg" style={{ minWidth: "180px" }}>
              <div className="grid grid-cols-6 gap-1.5">
                {["#000000","#FF0000","#FF8C00","#FFD700","#00AA00","#0000FF","#4B0082","#8B008B","#FF1493","#808080","#A9A9A9","#FFFFFF"].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => { editor.chain().focus().setColor(c).run(); setShowColorPicker(false); }}
                    className="h-6 w-6 rounded-full border border-border hover:scale-110 transition-transform"
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => { editor.chain().focus().unsetColor().run(); setShowColorPicker(false); }}
                className="mt-2 w-full rounded-md bg-muted px-2 py-1 text-xs hover:bg-muted/80 transition-colors"
              >
                إزالة اللون
              </button>
            </div>
          )}
        </div>
        <ToolBtn onClick={clearFormatting} title="مسح التنسيق">
          <Code2 className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="كتلة برمجية">
          <Braces className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="خط أفقي">
          <Minus className="h-4 w-4" />
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

        {/* Blockquote */}
        <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="اقتباس">
          <Quote className="h-4 w-4" />
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
        <ToolBtn onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} title="جدول">
          <TableIcon className="h-4 w-4" />
        </ToolBtn>

        {/* Video */}
        <div className="relative">
          <ToolBtn onClick={() => setShowVideoInput(!showVideoInput)} active={showVideoInput} title="فيديو يوتيوب">
            <Video className="h-4 w-4" />
          </ToolBtn>
          {showVideoInput && (
            <div className="absolute top-full left-0 z-10 mt-1 flex items-center gap-1 rounded-lg border border-border bg-popover p-2 shadow-lg">
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="رابط يوتيوب..."
                className="w-48 rounded-md border border-border bg-background px-2 py-1 text-xs outline-none focus:border-accent"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && videoUrl) {
                    editor.chain().focus().setYoutubeVideo({ src: videoUrl }).run();
                    setShowVideoInput(false);
                    setVideoUrl("");
                  }
                }}
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => {
                  if (videoUrl) {
                    editor.chain().focus().setYoutubeVideo({ src: videoUrl }).run();
                    setShowVideoInput(false);
                    setVideoUrl("");
                  }
                }}
                disabled={!videoUrl}
                className="rounded-md bg-accent px-2 py-1 text-xs font-medium text-white hover:bg-accent/90 disabled:opacity-50"
              >
                إدراج
              </button>
            </div>
          )}
        </div>
        <Divider />

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

        {/* Image */}
        <div className="relative">
          <ToolBtn onClick={() => setShowImageInput(!showImageInput)} title="إدراج صورة">
            <ImageIcon className="h-4 w-4" />
          </ToolBtn>
          {showImageInput && (
            <div className="absolute top-full left-0 z-10 mt-1 flex flex-col gap-2 rounded-lg border border-border bg-popover p-2 shadow-lg" style={{ minWidth: "220px" }}>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="رابط الصورة..."
                className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs outline-none focus:border-accent"
                dir="ltr"
                onKeyDown={(e) => e.key === "Enter" && setImage()}
              />
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>أو</span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="rounded-md bg-muted px-2 py-1 hover:bg-muted/80 transition-colors disabled:opacity-50"
                >
                  {uploading ? (
                    <><Loader2 className="h-3 w-3 animate-spin inline" /> جاري الرفع...</>
                  ) : (
                    "رفع صورة"
                  )}
                </button>
              </div>
              <button
                type="button"
                onClick={setImage}
                disabled={!imageUrl || uploading}
                className="rounded-md bg-accent px-2 py-1 text-xs font-medium text-white hover:bg-accent/90 disabled:opacity-50"
              >
                {uploading ? "جاري الرفع..." : "إدراج"}
              </button>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
        <Divider />

        {/* Preview Toggle */}
        <ToolBtn onClick={() => setShowPreview(!showPreview)} active={showPreview} title="معاينة">
          {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </ToolBtn>

        {/* Stats */}
        <div className="mr-auto flex items-center gap-2 text-[10px] text-muted-foreground">
          <span>{editor.storage.characterCount?.characters?.() ?? editor.getText().length} حرف</span>
          <span>|</span>
          <span>{editor.getText().split(/\s+/).filter(Boolean).length} كلمة</span>
        </div>
      </div>

      {/* ── Editor / Preview ── */}
      {showPreview ? (
        <div className="min-h-[400px] p-6">
          <div
            className="blog-preview prose prose-sm sm:prose-base dark:prose-invert max-w-none [&_h2]:text-xl [&_h2]:font-extrabold [&_h2]:border-r-4 [&_h2]:border-accent [&_h2]:pr-3 [&_h2]:mb-4 [&_h2]:mt-6 [&_p]:leading-relaxed [&_p]:text-foreground/90 [&_blockquote]:border-r-accent [&_blockquote]:pr-4 [&_blockquote]:text-muted-foreground [&_img]:rounded-xl [&_img]:my-4 [&_table]:w-full [&_table]:border-collapse [&_table]:border [&_table]:border-border [&_th]:border [&_th]:border-border [&_th]:bg-muted [&_th]:px-3 [&_th]:py-2 [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:rounded-xl [&_pre]:bg-muted [&_pre]:p-4 [&_pre]:rounded-xl [&_pre]:overflow-x-auto [&_pre]:text-sm [&_hr]:my-6 [&_hr]:border-border"
            dangerouslySetInnerHTML={{
              __html: editor.getHTML() || "<p class='text-muted-foreground text-sm'>لا يوجد محتوى للمعاينة</p>",
            }}
          />
        </div>
      ) : (
        <EditorContent editor={editor} />
      )}

      {/* ── Bottom status bar ── */}
      <div className="flex items-center justify-between border-t border-border bg-muted/10 px-3 py-1 text-[10px] text-muted-foreground">
        <span>محرر المقالات | يدعم HTML والتنسيق الغني</span>
        <div className="flex items-center gap-3">
          <span>{editor.getHTML().length} بايت</span>
        </div>
      </div>
    </div>
  );
}
