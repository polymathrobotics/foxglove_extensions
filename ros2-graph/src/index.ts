import { ExtensionContext } from "@foxglove/extension";

import { initROS2GraphPanel } from "./ROS2GraphPanel";

export function activate(extensionContext: ExtensionContext): void {
  extensionContext.registerPanel({ 
    name: "[Polymath] ROS2 Graph", 
    initPanel: initROS2GraphPanel 
  });
}
