import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AnimatedListItem } from "@/components/motion/animated-presence";

vi.mock("motion/react", async () => {
  const actual = await vi.importActual("motion/react");
  return {
    ...actual,
    useReducedMotion: () => true,
    motion: {
      li: ({ children, ...props }) => <li {...props}>{children}</li>,
    },
    AnimatePresence: ({ children }) => children,
  };
});

describe("AnimatedListItem", () => {
  it("renders children when reduced motion is enabled", () => {
    render(
      <ul>
        <AnimatedListItem show>
          <span>Note row</span>
        </AnimatedListItem>
      </ul>
    );
    expect(screen.getByText("Note row")).toBeInTheDocument();
  });
});
