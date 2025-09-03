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
export enum ModelTypes {
  ACTION = "action",
  CONDITION = "condition",
  CONTROL = "control",
  DECORATOR = "decorator",
  SUBTREE = "subtree",
}

export enum NodeStatus {
  IDLE = 0,
  RUNNING = 1,
  SUCCESS = 2,
  FAILURE = 3,
  SKIPPED = 4,
}

export enum PortDirection {
  INPUT = "input",
  OUTPUT = "output",
  INOUT = "inout",
}

export type Port = {
  name: string;
  direction: PortDirection;
  type: string;
  description: string;
};

export type Model = {
  type: ModelTypes;
  id: string;
  ports: Port[];
};

export type TreeNode = {
  id: string;
  name: string;
  model: string;
  children?: TreeNode[];
  ports?: {
    [key: string]: string | number | boolean;
  };
  attributes?: {
    [key: string]: string | number | boolean;
  };
};

export type BehaviorTree = {
  models: {
    [name: string]: Model;
  };
  root: TreeNode;
  metadata?: {
    version?: string;
    description?: string;
    mainTreeToExecute?: string;
  };
};
