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
import type { BehaviorTreeLog, NodeStatusSnapshot } from "./types";

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

  const [renderDone, setRenderDone] = useState<(() => void) | undefined>(undefined);
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

  // A different XML topic represents a different tree source.
  useLayoutEffect(() => {
    behaviorTreeXmlRef.current = undefined;
    setBehaviorTreeXml(undefined);
  }, [panelState.behaviorTreeXmlTopic]);

  // Topic changes invalidate node statuses accumulated from the old source.
  useLayoutEffect(() => {
    setNodeStatuses(EMPTY_NODE_STATUS_SNAPSHOT);
  }, [panelState.behaviorTreeXmlTopic, panelState.behaviorTreeLogsTopic]);

  // We use a layout effect to set up render handling for the panel.
  useLayoutEffect(() => {
    // After adding a render handler, indicate which RenderState fields trigger updates.
    context.watch("topics");
    context.watch("currentFrame");
    context.watch("didSeek");

    context.onRender = (renderState, done) => {
      // Foxglove waits for this callback before sending the next render frame.
      setRenderDone(() => done);

      if (renderState.topics != null) {
        setTopics(renderState.topics as Topic[]);
      }

      const logsToApply: BehaviorTreeLog[] = [];
      let shouldResetStatuses = renderState.didSeek === true;

      // Process every message in frame order. A BehaviorTreeLog can itself contain
      // multiple transitions, which applyBehaviorTreeLogs also processes in order.
      for (const messageEvent of renderState.currentFrame ?? []) {
        if (messageEvent.topic === panelState.behaviorTreeXmlTopic) {
          const xmlData = extractBehaviorTreeXml(messageEvent.message);
          if (xmlData !== undefined && xmlData !== behaviorTreeXmlRef.current) {
            const isReplacingLoadedTree = behaviorTreeXmlRef.current !== undefined;
            behaviorTreeXmlRef.current = xmlData;
            setBehaviorTreeXml(xmlData);

            if (isReplacingLoadedTree) {
              shouldResetStatuses = true;
              // Logs earlier in this frame belong to the tree being replaced.
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

  // Keep subscriptions aligned with the two selected topics.
  useEffect(() => {
    const subscriptions: { topic: string }[] = [];

    if (panelState.behaviorTreeXmlTopic) {
      subscriptions.push({ topic: panelState.behaviorTreeXmlTopic });
    }

    if (panelState.behaviorTreeLogsTopic) {
      subscriptions.push({ topic: panelState.behaviorTreeLogsTopic });
    }

    context.subscribe(subscriptions);
  }, [context, panelState.behaviorTreeXmlTopic, panelState.behaviorTreeLogsTopic]);

  // Set up panel settings.
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

  // Save panel state.
  useEffect(() => {
    context.saveState(panelState);
  }, [context, panelState]);

  // Invoke the done callback once the React render is complete.
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

  // Return a function to run when the panel is removed.
  return () => {
    root.unmount();
  };
}
