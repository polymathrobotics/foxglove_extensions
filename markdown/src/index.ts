import { ExtensionContext } from "@foxglove/extension";

import { initMarkdownPanel } from "./MarkdownPanel";

export function activate(extensionContext: ExtensionContext): void {
  extensionContext.registerPanel({ name: "[Polymath] Markdown", initPanel: initMarkdownPanel });
}
