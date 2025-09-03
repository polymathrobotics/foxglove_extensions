import { ExtensionContext } from "@foxglove/extension";

import { initBehaviorTreePanel } from "./BehaviorTreePanel";

export function activate(extensionContext: ExtensionContext): void {
  extensionContext.registerPanel({ name: "behavior-tree", initPanel: initBehaviorTreePanel });
}
