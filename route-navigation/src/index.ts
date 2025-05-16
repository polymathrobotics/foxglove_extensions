import { ExtensionContext } from "@foxglove/extension";

import { initRouteNavigationPanel } from "./RouteNavigationPanel";

export function activate(extensionContext: ExtensionContext): void {
  extensionContext.registerPanel({ 
    name: "[Polymath] Route Navigation", 
    initPanel: initRouteNavigationPanel
  });
}
