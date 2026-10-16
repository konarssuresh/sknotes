import { $createLinkNode, $isLinkNode } from "@lexical/link";
import { $findMatchingParent } from "@lexical/utils";
import {
  $createTextNode,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  $setSelection,
} from "lexical";

import { isSafeUrl } from "@/lib/domain/notes/safe-url";

/**
 * @param {import('lexical').RangeSelection | null | undefined} selection
 */
export function readLinkFormState(selection) {
  if (!$isRangeSelection(selection)) {
    return { text: "", url: "", isEditingLink: false };
  }

  const linkParent = $findMatchingParent(
    selection.anchor.getNode(),
    $isLinkNode
  );
  if (linkParent && $isLinkNode(linkParent)) {
    return {
      text: linkParent.getTextContent(),
      url: linkParent.getURL(),
      isEditingLink: true,
    };
  }

  return {
    text: selection.getTextContent(),
    url: "",
    isEditingLink: false,
  };
}

/**
 * Apply link insert/update inside `editor.update()`.
 *
 * @param {{
 *   url: string;
 *   text: string;
 *   savedSelection: import('lexical').BaseSelection | null;
 * }} params
 * @returns {{ ok: true } | { ok: false; error: 'TEXT_REQUIRED' | 'INVALID_URL' | 'NO_SELECTION' }}
 */
export function applyLinkUpdate({ url, text, savedSelection }) {
  if (savedSelection) {
    $setSelection(savedSelection);
  }

  const trimmedUrl = url.trim();
  const trimmedText = text.trim();
  if (!trimmedText) {
    return { ok: false, error: "TEXT_REQUIRED" };
  }
  if (!isSafeUrl(trimmedUrl)) {
    return { ok: false, error: "INVALID_URL" };
  }

  const selection = $getSelection();
  if (!$isRangeSelection(selection)) {
    return { ok: false, error: "NO_SELECTION" };
  }

  const linkParent = $findMatchingParent(
    selection.anchor.getNode(),
    $isLinkNode
  );
  if (linkParent && $isLinkNode(linkParent)) {
    linkParent.setURL(trimmedUrl);
    const children = linkParent.getChildren();
    if (children.length === 1 && $isTextNode(children[0])) {
      children[0].setTextContent(trimmedText);
    } else {
      linkParent.clear();
      linkParent.append($createTextNode(trimmedText));
    }
    return { ok: true };
  }

  const linkNode = $createLinkNode(trimmedUrl, {
    rel: "noopener noreferrer",
    target: "_blank",
  });
  linkNode.append($createTextNode(trimmedText));
  selection.insertNodes([linkNode]);
  return { ok: true };
}
