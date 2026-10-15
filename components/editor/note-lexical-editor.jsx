"use client";

import { CodeNode } from "@lexical/code";
import { LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TRANSFORMERS } from "@lexical/markdown";
import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

import { EditorToolbar } from "@/components/editor/editor-toolbar";
import { editorTheme } from "@/components/editor/editor-theme";
import { createEmptyLexicalContent } from "@/lib/domain/notes/defaults";

function onError(error) {
  console.error("[editor]", error);
}

function FocusBodyPlugin() {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      editor.focus(
        () => {
          const root = editor.getRootElement();
          if (root) {
            root.focus({ preventScroll: true });
          }
        },
        { defaultSelection: "rootStart" }
      );
    });
    return () => cancelAnimationFrame(id);
  }, [editor]);
  return null;
}

/**
 * @param {{
 *   editorKey: string;
 *   initialContent: unknown;
 *   onChange: (content: unknown) => void;
 * }} props
 */
export function NoteLexicalEditor({ editorKey, initialContent, onChange }) {
  const initialConfig = {
    namespace: "SKNotesEditor",
    theme: editorTheme,
    onError,
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode, CodeNode],
    editorState: JSON.stringify(initialContent ?? createEmptyLexicalContent()),
  };

  return (
    <LexicalComposer initialConfig={initialConfig} key={editorKey}>
      <EditorToolbar />
      <div className="relative">
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              className="text-body min-h-[50vh] py-2 focus:outline-none"
              aria-label="Note body"
            />
          }
          placeholder={
            <div className="text-muted-foreground pointer-events-none absolute top-2 left-0">
              Start writing…
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
      </div>
      <FocusBodyPlugin />
      <HistoryPlugin />
      <ListPlugin />
      <LinkPlugin />
      <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
      <OnChangePlugin
        onChange={(editorState) => {
          const json = editorState.toJSON();
          onChange(json);
        }}
      />
    </LexicalComposer>
  );
}
