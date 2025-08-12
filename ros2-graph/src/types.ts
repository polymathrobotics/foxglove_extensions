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
import { Duration, Time } from "@foxglove/rostime";

type QosProfile = {
  depth: number;
  deadline: Duration;
  lifespan: Duration;
  history: number; // uint8 with constants: HISTORY_SYSTEM_DEFAULT=0, HISTORY_KEEP_LAST=1, HISTORY_KEEP_ALL=2, HISTORY_UNKNOWN=3
  reliability: number; // uint8 with constants: RELIABILITY_SYSTEM_DEFAULT=0, RELIABILITY_RELIABLE=1, RELIABILITY_BEST_EFFORT=2, RELIABILITY_UNKNOWN=3
  durability: number; // uint8 with constants: DURABILITY_SYSTEM_DEFAULT=0, DURABILITY_TRANSIENT_LOCAL=1, DURABILITY_VOLATILE=2, DURABILITY_UNKNOWN=3
  liveliness: number; // uint8 with constants: LIVELINESS_SYSTEM_DEFAULT=0, LIVELINESS_AUTOMATIC=1, LIVELINESS_MANUAL_BY_TOPIC=3, LIVELINESS_UNKNOWN=4
  liveliness_lease_duration: Duration;
};

// Topic type based on Topic.msg
type Topic = {
  name: string;
  qos: QosProfile;
  type: string;
};

// Parameter types (referenced in NodeInfo.msg)
type ParameterDescriptor = {
  name: string;
  type: number;
  description: string;
  additional_constraints: string;
  read_only: boolean;
  dynamic_typing: boolean;
  floating_point_range: unknown[];
  integer_range: unknown[];
};

type ParameterValue = {
  type: number;
  bool_value: boolean;
  integer_value: number;
  double_value: number;
  string_value: string;
  byte_array_value: number[];
  bool_array_value: boolean[];
  integer_array_value: number[];
  double_array_value: number[];
  string_array_value: string[];
};

// NodeInfo type based on NodeInfo.msg
export type NodeInfo = {
  name: string;
  publishers: Topic[];
  subscriptions: Topic[];
  parameters: ParameterDescriptor[];
  parameter_values: ParameterValue[];
};

// Graph type based on Graph.msg
export type Graph = {
  timestamp: Time;
  nodes: NodeInfo[];
};

// Main ROS2GraphMessage type - this represents the Graph message
export type ROS2GraphMessage = Graph;

export type GetROS2GraphResponse = {
  success: boolean;
  message: string;
};
