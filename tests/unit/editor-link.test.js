import { LinkNode, $createLinkNode, $isLinkNode } from "@lexical/link";
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  createEditor,
} from "lexical";
import { describe, expect, it } from "vitest";

import { validateLexicalContent } from "@/lib/domain/notes/lexical-validate";
import {
  applyLinkUpdate,
  readLinkFormState,
} from "@/lib/editor/apply-editor-link";

function createTestEditor() {
  return createEditor({
    namespace: "editor-link-test",
    nodes: [LinkNode],
    onError: (error) => {
      throw error;
    },
  });
}

describe("apply-editor-link", () => {
  it("wraps selected text in a link with the entered URL", async () => {
    const editor = createTestEditor();

    await editor.update(() => {
      const root = $getRoot();
      const paragraph = $createParagraphNode();
      const text = $createTextNode("hello world");
      paragraph.append(text);
      root.append(paragraph);
      text.select(0, 5);

      const result = applyLinkUpdate({
        url: "https://example.com",
        text: "hello",
        savedSelection: null,
      });
      expect(result).toEqual({ ok: true });
    });

    editor.getEditorState().read(() => {
      const paragraph = $getRoot().getFirstChild();
      const link = paragraph?.getChildren().find((node) => $isLinkNode(node));
      expect(link?.getURL()).toBe("https://example.com");
      expect(link?.getTextContent()).toBe("hello");
      expect(paragraph?.getTextContent()).toBe("hello world");
    });
  });

  it("inserts link text at a collapsed caret when nothing is selected", async () => {
    const editor = createTestEditor();
    let savedSelection = null;

    await editor.update(() => {
      const root = $getRoot();
      const paragraph = $createParagraphNode();
      const text = $createTextNode("prefix ");
      paragraph.append(text);
      root.append(paragraph);
      text.select(7, 7);
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        savedSelection = selection.clone();
      }
    });

    await editor.update(() => {
      const result = applyLinkUpdate({
        url: "https://docs.example.com",
        text: "Docs",
        savedSelection,
      });
      expect(result).toEqual({ ok: true });
    });

    editor.getEditorState().read(() => {
      const paragraph = $getRoot().getFirstChild();
      expect(paragraph?.getTextContent()).toBe("prefix Docs");
      const link = paragraph?.getChildren().find((node) => $isLinkNode(node));
      expect(link?.getURL()).toBe("https://docs.example.com");
      expect(link?.getTextContent()).toBe("Docs");
    });
  });

  it("updates an existing link instead of nesting a new one", async () => {
    const editor = createTestEditor();
    let savedSelection = null;

    await editor.update(() => {
      const root = $getRoot();
      const paragraph = $createParagraphNode();
      const link = $createLinkNode("https://old.example");
      const linkText = $createTextNode("Old label");
      link.append(linkText);
      paragraph.append(link);
      root.append(paragraph);
      linkText.select(0, 9);
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        savedSelection = selection.clone();
      }
      const formState = readLinkFormState(selection);
      expect(formState.isEditingLink).toBe(true);
      expect(formState.text).toBe("Old label");
      expect(formState.url).toBe("https://old.example");
    });

    await editor.update(() => {
      const result = applyLinkUpdate({
        url: "https://new.example",
        text: "New label",
        savedSelection,
      });
      expect(result).toEqual({ ok: true });
    });

    editor.getEditorState().read(() => {
      const links = [];
      const paragraph = $getRoot().getFirstChild();
      for (const child of paragraph?.getChildren() ?? []) {
        if ($isLinkNode(child)) {
          links.push(child);
        }
      }
      expect(links).toHaveLength(1);
      expect(links[0].getURL()).toBe("https://new.example");
      expect(links[0].getTextContent()).toBe("New label");
    });
  });

  it("rejects unsafe URLs without changing the document", async () => {
    const editor = createTestEditor();
    let savedSelection = null;
    let beforeJson = null;

    await editor.update(() => {
      const root = $getRoot();
      const paragraph = $createParagraphNode();
      const text = $createTextNode("keep me");
      paragraph.append(text);
      root.append(paragraph);
      text.select(0, 4);
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        savedSelection = selection.clone();
      }
    });

    beforeJson = editor.getEditorState().toJSON();

    await editor.update(() => {
      const result = applyLinkUpdate({
        url: "javascript:alert(1)",
        text: "bad",
        savedSelection,
      });
      expect(result).toEqual({ ok: false, error: "INVALID_URL" });
    });

    expect(editor.getEditorState().toJSON()).toEqual(beforeJson);
  });

  it("rejects empty link text without changing the document", async () => {
    const editor = createTestEditor();
    let savedSelection = null;

    await editor.update(() => {
      const root = $getRoot();
      const paragraph = $createParagraphNode();
      const text = $createTextNode("keep me");
      paragraph.append(text);
      root.append(paragraph);
      text.select(0, 4);
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        savedSelection = selection.clone();
      }
    });

    const beforeJson = editor.getEditorState().toJSON();

    await editor.update(() => {
      const result = applyLinkUpdate({
        url: "https://example.com",
        text: "   ",
        savedSelection,
      });
      expect(result).toEqual({ ok: false, error: "TEXT_REQUIRED" });
    });

    expect(editor.getEditorState().toJSON()).toEqual(beforeJson);
  });

  it("serializes inserted links for save validation", async () => {
    const editor = createTestEditor();
    let savedSelection = null;

    await editor.update(() => {
      const root = $getRoot();
      const paragraph = $createParagraphNode();
      const text = $createTextNode("read more");
      paragraph.append(text);
      root.append(paragraph);
      text.select(0, 9);
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        savedSelection = selection.clone();
      }
    });

    await editor.update(() => {
      applyLinkUpdate({
        url: "https://example.com/guide",
        text: "read more",
        savedSelection,
      });
    });

    const json = editor.getEditorState().toJSON();
    expect(() => validateLexicalContent(json)).not.toThrow();
    expect(JSON.stringify(json)).toContain("https://example.com/guide");
  });
});
