"use client";

import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import { $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND } from "lexical";
import { $setBlocksType } from "@lexical/selection";
import { useCallback, useRef, useState } from "react";

import { LinkEditorPanel } from "@/components/editor/link-editor-panel";
import { Button } from "@/components/ui/button";
import {
  applyLinkUpdate,
  readLinkFormState,
} from "@/lib/editor/apply-editor-link";

export function EditorToolbar() {
  const [editor] = useLexicalComposerContext();
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkText, setLinkText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [textError, setTextError] = useState("");
  const savedSelectionRef = useRef(null);

  const formatBold = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
  };

  const formatItalic = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
  };

  const formatCode = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code");
  };

  const formatHeading = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode("h2"));
      }
    });
  };

  const formatQuote = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createQuoteNode());
      }
    });
  };

  const insertBulletList = () => {
    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
  };

  const insertNumberedList = () => {
    editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
  };

  const closeLinkEditor = useCallback(
    (restoreFocus = true) => {
      setLinkOpen(false);
      setUrlError("");
      setTextError("");
      savedSelectionRef.current = null;
      if (restoreFocus) {
        editor.focus();
      }
    },
    [editor]
  );

  const openLinkEditor = useCallback(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        savedSelectionRef.current = selection.clone();
        const formState = readLinkFormState(selection);
        setLinkText(formState.text);
        setLinkUrl(formState.url);
      } else {
        savedSelectionRef.current = null;
        setLinkText("");
        setLinkUrl("");
      }
      setUrlError("");
      setTextError("");
      setLinkOpen(true);
    });
  }, [editor]);

  const applyLink = async () => {
    setUrlError("");
    setTextError("");

    let result = { ok: false, error: "NO_SELECTION" };
    await editor.update(() => {
      result = applyLinkUpdate({
        url: linkUrl,
        text: linkText,
        savedSelection: savedSelectionRef.current,
      });
    });

    if (!result.ok) {
      if (result.error === "INVALID_URL") {
        setUrlError("This URL is not allowed.");
      } else if (result.error === "TEXT_REQUIRED") {
        setTextError("Enter link text.");
      }
      return;
    }

    closeLinkEditor(true);
  };

  const handleLinkButtonMouseDown = (event) => {
    event.preventDefault();
    if (linkOpen) {
      closeLinkEditor(false);
      return;
    }
    openLinkEditor();
  };

  return (
    <div className="border-border bg-background/95 sticky top-0 z-10 flex flex-wrap items-center gap-1 border-b py-2">
      <Button type="button" variant="ghost" size="sm" onClick={formatBold}>
        B
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={formatItalic}>
        I
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={formatHeading}>
        H2
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={insertBulletList}
      >
        •
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={insertNumberedList}
      >
        1.
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={formatQuote}>
        “
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={formatCode}>
        Code
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-expanded={linkOpen}
        aria-haspopup="dialog"
        onMouseDown={handleLinkButtonMouseDown}
      >
        Link
      </Button>
      {linkOpen ? (
        <LinkEditorPanel
          linkText={linkText}
          linkUrl={linkUrl}
          urlError={urlError}
          textError={textError}
          onLinkTextChange={setLinkText}
          onLinkUrlChange={setLinkUrl}
          onSubmit={applyLink}
          onCancel={() => closeLinkEditor(true)}
        />
      ) : null}
    </div>
  );
}
