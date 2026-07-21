// Copyright (c) 2025-present Polymath Robotics, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
import { PanelExtensionContext, SettingsTreeAction, Topic } from "@foxglove/extension";
import { ReactElement, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";

import { BehaviorTree } from "./BehaviorTree";
import {
  applyBehaviorTreeLogs,
  EMPTY_NODE_STATUS_SNAPSHOT,
  extractBehaviorTreeLog,
  extractBehaviorTreeXml,
} from "./liveState";
import "./styles/globals.css";
import { BehaviorTreeLog, NodeStatusSnapshot } from "./types";

type PanelState = {
  behaviorTreeXmlTopic?: string;
  behaviorTreeLogsTopic?: string;
};

const BEHAVIOR_TREE_XML_TOPIC_SCHEMA = "std_msgs/msg/String";
const BEHAVIOR_TREE_LOGS_TOPIC_SCHEMA = "nav2_msgs/msg/BehaviorTreeLog";

function BehaviorTreePanel({ context }: { context: PanelExtensionContext }): ReactElement {
  const [panelState, setPanelState] = useState<PanelState>(() => {
    return (context.initialState as PanelState | undefined) ?? {};
  });

  const [behaviorTreeXml, setBehaviorTreeXml] = useState<string | undefined>(undefined);
  const [nodeStatuses, setNodeStatuses] = useState<NodeStatusSnapshot>(
    EMPTY_NODE_STATUS_SNAPSHOT,
  );
  const behaviorTreeXmlRef = useRef<string | undefined>(undefined);

  const [renderDone, setRenderDone] = useState<(() => void) | undefined>();
  const [topics, setTopics] = useState<Topic[]>([]);

  const validBehaviorTreeXmlTopics = useMemo(
    () =>
      topics
        .filter((topic) => topic.schemaName === BEHAVIOR_TREE_XML_TOPIC_SCHEMA)
        .map((topic) => topic.name),
    [topics],
  );

  const validBehaviorTreeLogsTopics = useMemo(
    () =>
      topics
        .filter((topic) => topic.schemaName === BEHAVIOR_TREE_LOGS_TOPIC_SCHEMA)
        .map((topic) => topic.name),
    [topics],
  );

  useLayoutEffect(() => {
    behaviorTreeXmlRef.current = undefined;
    setBehaviorTreeXml(undefined);
  }, [panelState.behaviorTreeXmlTopic]);

  useLayoutEffect(() => {
    setNodeStatuses(EMPTY_NODE_STATUS_SNAPSHOT);
  }, [panelState.behaviorTreeXmlTopic, panelState.behaviorTreeLogsTopic]);

  // We use a layout effect to setup render handling for our panel. We also setup some topic subscriptions.
  useLayoutEffect(() => {
    // After adding a render handler, you must indicate which fields from RenderState will trigger updates.
    // If you do not watch any fields then your panel will never render since the panel context will assume you do not want any updates.

    // tell the panel context that we care about any update to the _topic_ field of RenderState
    context.watch("topics");

    // tell the panel context we want messages for the current frame for topics we've subscribed to
    // This corresponds to the _currentFrame_ field of render state.
    context.watch("currentFrame");
    context.watch("didSeek");

    context.onRender = (renderState, done) => {
      // render functions receive a _done_ callback. You MUST call this callback to indicate your panel has finished rendering.
      // Your panel will not receive another render callback until _done_ is called from a prior render. If your panel is not done
      // rendering before the next render call, Foxglove shows a notification to the user that your panel is delayed.
      //
      // Set the done callback into a state variable to trigger a re-render.
      setRenderDone(() => done);

      if (renderState.topics != null) {
        setTopics(renderState.topics as Topic[]);
      }

      const logsToApply: BehaviorTreeLog[] = [];
      let shouldResetStatuses = renderState.didSeek === true;

      for (const messageEvent of renderState.currentFrame ?? []) {
        if (messageEvent.topic === panelState.behaviorTreeXmlTopic) {
          const xmlData = extractBehaviorTreeXml(messageEvent.message);
          if (xmlData !== undefined && xmlData !== behaviorTreeXmlRef.current) {
            const isReplacingLoadedTree = behaviorTreeXmlRef.current !== undefined;
            behaviorTreeXmlRef.current = xmlData;
            setBehaviorTreeXml(xmlData);

            if (isReplacingLoadedTree) {
              shouldResetStatuses = true;
              logsToApply.length = 0;
            }
          }
        }

        if (messageEvent.topic === panelState.behaviorTreeLogsTopic) {
          const logData = extractBehaviorTreeLog(messageEvent.message);
          if (logData) {
            logsToApply.push(logData);
          }
        }
      }

      if (shouldResetStatuses || logsToApply.length > 0) {
        setNodeStatuses((previous) =>
          applyBehaviorTreeLogs(
            shouldResetStatuses ? EMPTY_NODE_STATUS_SNAPSHOT : previous,
            logsToApply,
          ),
        );
      }
    };

    return () => {
      context.onRender = undefined;
    };
  }, [context, panelState.behaviorTreeLogsTopic, panelState.behaviorTreeXmlTopic]);

  // Handle topic subscriptions in a separate effect that runs when topics change
  useEffect(() => {
    const subscriptions = [];

    if (panelState.behaviorTreeXmlTopic) {
      subscriptions.push({ topic: panelState.behaviorTreeXmlTopic });
    }

    if (panelState.behaviorTreeLogsTopic) {
      subscriptions.push({ topic: panelState.behaviorTreeLogsTopic });
    }

    if (subscriptions.length > 0) {
      context.subscribe(subscriptions);
    } else {
      // Subscribe to empty array to clear previous subscriptions
      context.subscribe([]);
    }
  }, [context, panelState.behaviorTreeXmlTopic, panelState.behaviorTreeLogsTopic]);

  // Setup panel settings
  useEffect(() => {
    const actionHandler = (action: SettingsTreeAction) => {

      const path = action.payload.path.join(".");
      if (action.action === "update" && path === "behaviorTreeTopics.behaviorTreeXmlTopic") {
        const newTopic = action.payload.value as string;
        setPanelState((prev) => ({ ...prev, behaviorTreeXmlTopic: newTopic }));
      }
      if (action.action === "update" && path === "behaviorTreeTopics.behaviorTreeLogsTopic") {
        const newTopic = action.payload.value as string;
        setPanelState((prev) => ({ ...prev, behaviorTreeLogsTopic: newTopic }));
      }
    };

    context.updatePanelSettingsEditor({
      actionHandler,
      nodes: {
        behaviorTreeTopics: {
          label: "Behavior Tree Topics",
          fields: {
            behaviorTreeXmlTopic: {
              label: "Behavior Tree XML Topic",
              input: "autocomplete",
              value: panelState.behaviorTreeXmlTopic ?? "",
              items: validBehaviorTreeXmlTopics,
            },
            behaviorTreeLogsTopic: {
              label: "Behavior Tree Logs Topic",
              input: "autocomplete",
              value: panelState.behaviorTreeLogsTopic ?? "",
              items: validBehaviorTreeLogsTopics,
            },
          },
        },
      },
    });
  }, [
    context,
    panelState.behaviorTreeXmlTopic,
    panelState.behaviorTreeLogsTopic,
    validBehaviorTreeXmlTopics,
    validBehaviorTreeLogsTopics,
  ]);

  // Save panel state
  useEffect(() => {
    context.saveState(panelState);
  }, [context, panelState]);

  // invoke the done callback once the render is complete
  useEffect(() => {
    renderDone?.();
  }, [renderDone]);

  return (
    // There is a bug with Foxglove's `renderState.colorScheme` prop where it doesn't update properly.
    <div className="h-full w-full dark">
      <BehaviorTree xml={behaviorTreeXml} nodeStatuses={nodeStatuses} />
    </div>
  );
}

export function initBehaviorTreePanel(context: PanelExtensionContext): () => void {
  const root = createRoot(context.panelElement);
  root.render(<BehaviorTreePanel context={context} />);

  // Return a function to run when the panel is removed
  return () => {
    root.unmount();
  };
}
