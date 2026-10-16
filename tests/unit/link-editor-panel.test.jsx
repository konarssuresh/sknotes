import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LinkEditorPanel } from "@/components/editor/link-editor-panel";

describe("LinkEditorPanel", () => {
  it("calls onCancel when Escape is pressed", () => {
    const onCancel = vi.fn();
    render(
      <LinkEditorPanel
        linkText=""
        linkUrl=""
        urlError=""
        textError=""
        onLinkTextChange={vi.fn()}
        onLinkUrlChange={vi.fn()}
        onSubmit={vi.fn()}
        onCancel={onCancel}
      />
    );

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("submits through Add link button", () => {
    const onSubmit = vi.fn();
    render(
      <LinkEditorPanel
        linkText="Docs"
        linkUrl="https://example.com"
        urlError=""
        textError=""
        onLinkTextChange={vi.fn()}
        onLinkUrlChange={vi.fn()}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /add link/i }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
