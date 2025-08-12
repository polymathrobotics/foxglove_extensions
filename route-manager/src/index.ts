import { ExtensionContext } from "@foxglove/extension";

import { initRouteManagerPanel } from "./RouteManagerPanel";

export function activate(extensionContext: ExtensionContext): void {
  extensionContext.registerPanel({
    name: "[Polymath] Route Manager",
    initPanel: initRouteManagerPanel
  });
}
