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
import type { Graph, RawGraph, RawTopic } from "./types";

/// Returns the topic type name from a rosgraph_monitor_msgs string or a rosgraph_msgs InterfaceType.
export function topicTypeName(type: RawTopic["type"]): string {
  return typeof type === "string" ? type : type.name;
}

function normalizeTopic(topic: RawTopic) {
  return { ...topic, type: topicTypeName(topic.type) };
}

/// Converts a rosgraph_monitor_msgs/msg/Graph or rosgraph_msgs/msg/Graph into the panel's Graph.
export function normalizeGraph(raw: RawGraph): Graph {
  return {
    timestamp: raw.timestamp,
    nodes: raw.nodes.map((node) => ({
      name: node.name,
      publishers: node.publishers.map(normalizeTopic),
      subscriptions: node.subscriptions.map(normalizeTopic),
      parameters: node.parameters,
      parameter_values: node.parameter_values,
    })),
  };
}
