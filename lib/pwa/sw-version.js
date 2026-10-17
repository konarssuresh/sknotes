/**
 * Placeholder replaced at build time by `scripts/inject-sw-version.mjs`.
 * @see docs/integrations/pwa-next-netlify.md
 */
export const SKNOTES_SW_VERSION_PLACEHOLDER = "__SKNOTES_SW_VERSION__";

/**
 * @param {{ packageVersion: string, gitSha: string, buildDate?: string }} input
 * @returns {string}
 */
export function formatSwVersion({ packageVersion, gitSha, buildDate }) {
  const sha = gitSha || "nogit";
  const date = buildDate || new Date().toISOString().slice(0, 10);
  return `${packageVersion}-${sha}-${date}`;
}
