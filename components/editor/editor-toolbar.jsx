"use client";

import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import { $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND } from "lexical";
import { $setBlocksType } from "@lexical/selection";
import { $findMatchingParent } from "@lexical/utils";
import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isSafeUrl } from "@/lib/domain/notes/safe-url";

export function EditorToolbar() {
  const [editor] = useLexicalComposerContext();
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkError, setLinkError] = useState("");

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

  const openLinkEditor = useCallback(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) {
        setLinkUrl("");
        setLinkOpen(true);
        return;
      }
      const node = selection.anchor.getNode();
      const linkParent = $findMatchingParent(node, $isLinkNode);
      if (linkParent && $isLinkNode(linkParent)) {
        setLinkUrl(linkParent.getURL());
      } else {
        setLinkUrl("");
      }
      setLinkOpen(true);
      setLinkError("");
    });
  }, [editor]);

  const applyLink = () => {
    const url = linkUrl.trim();
    if (!url) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
      setLinkOpen(false);
      return;
    }
    if (!isSafeUrl(url)) {
      setLinkError("This URL is not allowed.");
      return;
    }
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
    setLinkOpen(false);
    setLinkError("");
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
      <Button type="button" variant="ghost" size="sm" onClick={openLinkEditor}>
        Link
      </Button>
      {linkOpen ? (
        <div className="flex w-full flex-wrap items-end gap-2 pt-2">
          <div className="min-w-[12rem] flex-1">
            <Input
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://"
              aria-label="Link URL"
              aria-invalid={Boolean(linkError)}
            />
            {linkError ? (
              <p className="text-destructive text-caption mt-1">{linkError}</p>
            ) : null}
          </div>
          <Button type="button" size="sm" onClick={applyLink}>
            Save link
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setLinkOpen(false)}
          >
            Cancel
          </Button>
        </div>
      ) : null}
    </div>
  );
}
