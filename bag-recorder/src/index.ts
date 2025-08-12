import { ExtensionContext } from "@foxglove/extension";

import { initBagRecorderPanel } from "./BagRecorderPanel";

export function activate(extensionContext: ExtensionContext): void {
  extensionContext.registerPanel({
    name: "[Polymath] Bag Recorder",
    initPanel: initBagRecorderPanel
  });
}
