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
import { PanelExtensionContext, Topic } from "@foxglove/extension";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";

import "reactflow/dist/style.css";

// Custom
import { GraphViewComponent } from "./GraphView";
import { DEFAULT_TOPIC_NAME, ROS2_GRAPH_SCHEMA_NAME } from "./constants";
import type { ROS2GraphMessage } from "./types";

function ROS2GraphPanel({ context }: { context: PanelExtensionContext }) {
  const [topicName, setTopicName] = useState<string | undefined>(DEFAULT_TOPIC_NAME);
  const [graphData, setGraphData] = useState<ROS2GraphMessage>();
  const [renderDone, setRenderDone] = useState<(() => void) | undefined>();
  const [topics, setTopics] = useState<Topic[]>([]);

  console.log(graphData);

  useLayoutEffect(() => {
    context.watch("currentFrame");
    context.watch("topics");

    context.onRender = (renderState, done) => {
      setRenderDone(() => done);
      if (renderState.topics != null) {
        setTopics(renderState.topics as Topic[]);
      }

      const lastMessage = renderState.currentFrame?.[renderState.currentFrame.length - 1];
      console.log("lastMessage", lastMessage);
      if (lastMessage?.message != null) {
        setGraphData(lastMessage.message as ROS2GraphMessage);
      }
    };
  }, [context]);

  useEffect(() => {
    if (topicName != null) {
      console.log("subscribing to topic", topicName);
      context.subscribe([{ topic: topicName }]);
    }
  }, [context, topicName]);

  // Create a list of valid topic names that can be subscribed to
  const validTopicNames = useMemo(() => {
    // Create a list of valid topic names that can be subscribed to
    const output = topics.filter((t) => t.schemaName === ROS2_GRAPH_SCHEMA_NAME).map((t) => t.name);
    // If a topic name is filled in that doesn't appear in the list, force add it to the top
    // so the setting is not lost
    if (topicName && !output.includes(topicName)) {
      output.unshift(topicName);
    }
    return output;
  }, [topics, topicName]);

  useEffect(() => {
    context.updatePanelSettingsEditor({
      actionHandler: (action) => {
        // This action handler callback is called when the user interacts with the panel settings.
        // We only care about settings field updates, so ignore all other actions
        const path = action.payload.path.join(".");
        if (action.action !== "update") {
          return;
        }

        if (path === "data.topic") {
          const topic = typeof action.payload.value === "string" ? action.payload.value : undefined;
          setTopicName(topic);
        }
      },
      nodes: {
        data: {
          label: "Data",
          fields: {
            topic: {
              input: "autocomplete",
              label: "Topic",
              help: "A `rosgraph` message topic to subscribe to",
              items: validTopicNames,
              value: topicName,
              error: undefined,
            },
          },
        },
      },
    });
  }, [context, topicName, validTopicNames]);

  useEffect(() => renderDone?.(), [renderDone]);

  if (!graphData) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        No graph data available
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
      }}
    >
      <GraphViewComponent graphData={graphData} />
    </div>
  );
}

export function initROS2GraphPanel(context: PanelExtensionContext): () => void {
  const root = createRoot(context.panelElement);
  root.render(<ROS2GraphPanel context={context} />);

  // Return a function to run when the panel is removed
  return () => {
    root.unmount();
  };
}
