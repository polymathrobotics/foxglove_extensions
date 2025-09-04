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
import { graphlib, layout } from "@dagrejs/dagre";

import { NODE_HEIGHT, NODE_WIDTH } from "./constants";
import { TBehaviorTree, TreeNode } from "./types";

export interface DagNode {
  id: string;
  name: string;
  model: string;
  width: number;
  height: number;
  x?: number;
  y?: number;
  attributes?: { [key: string]: string | number | boolean };
  selected?: boolean;
}

export interface DagEdge {
  source: string;
  target: string;
}

export interface DagGraph {
  nodes: DagNode[];
  edges: DagEdge[];
  graph: graphlib.Graph;
}

export interface DagOptions {
  direction?: "TB" | "BT" | "LR" | "RL";
  nodeWidth?: number;
  nodeHeight?: number;
  nodeSep?: number;
  edgeSep?: number;
  rankSep?: number;
}

const DEFAULT_OPTIONS: Required<DagOptions> = {
  direction: "TB",
  nodeWidth: 120,
  nodeHeight: 40,
  nodeSep: 20,
  edgeSep: 10,
  rankSep: 50,
};

export function generateDag(behaviorTree: TBehaviorTree, options: DagOptions = {}): DagGraph {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Create Dagre graph
  const g = new graphlib.Graph();
  g.setGraph({
    rankdir: opts.direction,
    nodesep: opts.nodeSep,
    edgesep: opts.edgeSep,
    ranksep: opts.rankSep,
  });
  g.setDefaultEdgeLabel(() => ({}));

  const nodes: DagNode[] = [];
  const edges: DagEdge[] = [];

  // Recursively process tree nodes
  function processNode(treeNode: TreeNode, parentId?: string): void {
    // Calculate node dimensions based on model type
    const dagNode: DagNode = {
      id: treeNode.id,
      name: treeNode.name,
      model: treeNode.model,
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
      attributes: treeNode.attributes,
    };

    nodes.push(dagNode);

    // Add node to Dagre graph
    g.setNode(treeNode.id, {
      label: treeNode.name,
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
    });

    // Add edge from parent if exists
    if (parentId) {
      edges.push({
        source: parentId,
        target: treeNode.id,
      });
      g.setEdge(parentId, treeNode.id);
    }

    // Process children
    if (treeNode.children) {
      for (const child of treeNode.children) {
        processNode(child, treeNode.id);
      }
    }
  }

  // Start processing from root
  processNode(behaviorTree.root);

  // Compute layout
  layout(g);

  // Update nodes with computed positions
  nodes.forEach((node) => {
    const dagNode = g.node(node.id);
    if (dagNode) {
      node.x = dagNode.x;
      node.y = dagNode.y;
    }
  });

  return {
    nodes,
    edges,
    graph: g,
  };
}
