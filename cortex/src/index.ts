import { ExtensionContext } from "@foxglove/extension";

import { initCortexPanel } from "./CortexPanel";

export function activate(extensionContext: ExtensionContext): void {
  extensionContext.registerPanel({ name: "[Polymath] Cortex", initPanel: initCortexPanel });
}
