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
import assert from "node:assert/strict";
import { test } from "node:test";

import { normalizeGraph } from "../src/normalize.ts";
import type { RawGraph } from "../src/types.ts";

const zero = { sec: 0, nsec: 0 };
const qos = {
  depth: 10,
  deadline: zero,
  lifespan: zero,
  history: 1,
  reliability: 1,
  durability: 2,
  liveliness: 1,
  liveliness_lease_duration: zero,
};
const parameters = [
  {
    name: "use_sim_time",
    type: 1,
    description: "",
    additional_constraints: "",
    read_only: false,
    dynamic_typing: false,
    floating_point_range: [],
    integer_range: [],
  },
];
const parameter_values = [
  {
    type: 1,
    bool_value: false,
    integer_value: 0,
    double_value: 0,
    string_value: "",
    byte_array_value: [],
    bool_array_value: [],
    integer_array_value: [],
    double_array_value: [],
    string_array_value: [],
  },
];

// rosgraph_monitor_msgs/msg/Graph, published by graph-monitor 0.2.x
const monitorGraph: RawGraph = {
  timestamp: { sec: 1, nsec: 2 },
  nodes: [
    {
      name: "/talker",
      publishers: [{ name: "/chatter", type: "std_msgs/msg/String", qos }],
      subscriptions: [],
      parameters,
      parameter_values,
    },
  ],
};

// rosgraph_msgs/msg/Graph, published by graph-monitor >= 0.3.0
const rosgraphGraph = {
  nodes: [
    {
      name: "/talker",
      parameters,
      parameter_values,
      publishers: [
        {
          name: "/chatter",
          type: { name: "std_msgs/msg/String", hash: { version: 1, value: new Uint8Array(32) } },
          qos,
        },
      ],
      subscriptions: [],
      service_clients: [],
      service_servers: [],
      action_clients: [],
      action_servers: [],
    },
  ],
};

test("passes rosgraph_monitor_msgs topic types through", () => {
  const graph = normalizeGraph(monitorGraph);
  assert.equal(graph.timestamp, monitorGraph.timestamp);
  assert.equal(graph.nodes[0]?.publishers[0]?.type, "std_msgs/msg/String");
});

test("flattens rosgraph_msgs InterfaceType to its name", () => {
  const graph = normalizeGraph(rosgraphGraph);
  assert.equal(graph.timestamp, undefined);
  assert.equal(graph.nodes[0]?.publishers[0]?.type, "std_msgs/msg/String");
  assert.deepEqual(graph.nodes[0]?.publishers[0]?.qos, qos);
  assert.deepEqual(graph.nodes[0]?.parameters, parameters);
  assert.deepEqual(graph.nodes[0]?.parameter_values, parameter_values);
});
