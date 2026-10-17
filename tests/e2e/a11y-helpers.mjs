import AxeBuilder from "@axe-core/playwright";
import { expect } from "@playwright/test";

/**
 * @param {import('@playwright/test').Page} page
 * @param {string} [contextLabel]
 */
export async function expectNoSeriousAxeViolations(
  page,
  contextLabel = "page"
) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
    .analyze();

  const blocking = results.violations.filter((violation) =>
    ["critical", "serious"].includes(violation.impact ?? "")
  );

  if (blocking.length > 0) {
    const summary = blocking
      .map(
        (v) => `${v.id} (${v.impact}): ${v.help} — ${v.nodes.length} node(s)`
      )
      .join("\n");
    expect(blocking, `axe on ${contextLabel}:\n${summary}`).toEqual([]);
  }
}
