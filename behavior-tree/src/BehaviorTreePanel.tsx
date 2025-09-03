import { PanelExtensionContext, SettingsTreeAction } from "@foxglove/extension";
import { ReactElement, useEffect, useLayoutEffect, useState } from "react";
import { createRoot } from "react-dom/client";

import { BehaviorTree } from "./BehaviorTree";
import "./index.css";

type PanelState = {
  behaviorTreeXmlTopic?: string;
};

function BehaviorTreePanel({ context }: { context: PanelExtensionContext }): ReactElement {
  const [panelState, setPanelState] = useState<PanelState>(() => {
    return (context.initialState as PanelState | undefined) ?? {};
  });
  const [behaviorTreeXml, setBehaviorTreeXml] = useState<string | undefined>();
  const [renderDone, setRenderDone] = useState<(() => void) | undefined>();

  // We use a layout effect to setup render handling for our panel. We also setup some topic subscriptions.
  useLayoutEffect(() => {
    // The render handler is run by the broader Foxglove system during playback when your panel
    // needs to render because the fields it is watching have changed. How you handle rendering depends on your framework.
    // You can only setup one render handler - usually early on in setting up your panel.
    //
    // Without a render handler your panel will never receive updates.
    //
    // The render handler could be invoked as often as 60hz during playback if fields are changing often.
    context.onRender = (renderState, done) => {
      // render functions receive a _done_ callback. You MUST call this callback to indicate your panel has finished rendering.
      // Your panel will not receive another render callback until _done_ is called from a prior render. If your panel is not done
      // rendering before the next render call, Foxglove shows a notification to the user that your panel is delayed.
      //
      // Set the done callback into a state variable to trigger a re-render.
      setRenderDone(() => done);

      // Process messages from the subscribed topic
      if (panelState.behaviorTreeXmlTopic && renderState.currentFrame) {
        const messages = renderState.currentFrame.filter(
          (msg) => msg.topic === panelState.behaviorTreeXmlTopic,
        );
        const latestMessage = messages[messages.length - 1]; // Get the latest message

        if (latestMessage) {
          const messageData = latestMessage.message as { data?: string };
          if (messageData.data) {
            setBehaviorTreeXml(messageData.data);
          }
        }
      }
    };

    // After adding a render handler, you must indicate which fields from RenderState will trigger updates.
    // If you do not watch any fields then your panel will never render since the panel context will assume you do not want any updates.

    // tell the panel context that we care about any update to the _topic_ field of RenderState
    context.watch("topics");

    // tell the panel context we want messages for the current frame for topics we've subscribed to
    // This corresponds to the _currentFrame_ field of render state.
    context.watch("currentFrame");

    // Subscribe to the selected topic
    if (panelState.behaviorTreeXmlTopic) {
      context.subscribe([{ topic: panelState.behaviorTreeXmlTopic }]);
    }
  }, [context, panelState.behaviorTreeXmlTopic]);

  // Setup panel settings
  useEffect(() => {
    const actionHandler = (action: SettingsTreeAction) => {
      if (
        action.action === "update" &&
        action.payload.path[0] === "behaviorTreeXmlTopic" &&
        action.payload.path[1] === "topic"
      ) {
        const newTopic = action.payload.value as string;
        setPanelState((prev) => ({ ...prev, behaviorTreeXmlTopic: newTopic }));
      }
    };

    context.updatePanelSettingsEditor({
      actionHandler,
      nodes: {
        behaviorTreeXmlTopic: {
          label: "Behavior Tree XML Topic",
          fields: {
            topic: {
              label: "Topic",
              input: "string",
              value: panelState.behaviorTreeXmlTopic ?? "",
            },
          },
        },
      },
    });
  }, [context, panelState.behaviorTreeXmlTopic]);

  // Save panel state
  useEffect(() => {
    context.saveState(panelState);
  }, [context, panelState]);

  // invoke the done callback once the render is complete
  useEffect(() => {
    renderDone?.();
  }, [renderDone]);

  return <BehaviorTree xml={behaviorTreeXml} />;
}

export function initBehaviorTreePanel(context: PanelExtensionContext): () => void {
  const root = createRoot(context.panelElement);
  root.render(<BehaviorTreePanel context={context} />);

  // Return a function to run when the panel is removed
  return () => {
    root.unmount();
  };
}
