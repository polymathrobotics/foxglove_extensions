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
import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, it, expect } from "vitest";

import { generateDag, DagOptions } from "./dag";
import { parseBehaviorTreeXML } from "./parse";
import { TBehaviorTree, ModelTypes } from "./types";

describe("generateDag", () => {
  // Helper function to create a simple behavior tree for testing
  function createSimpleBehaviorTree(): TBehaviorTree {
    return {
      models: {
        Sequence: { id: "Sequence", type: ModelTypes.CONTROL, ports: [] },
        CheckBattery: { id: "CheckBattery", type: ModelTypes.CONDITION, ports: [] },
        Action: { id: "Action", type: ModelTypes.ACTION, ports: [] },
      },
      root: {
        id: "root",
        name: "root_sequence",
        model: "Sequence",
        children: [
          {
            id: "battery_check",
            name: "battery_check",
            model: "CheckBattery",
          },
          {
            id: "action1",
            name: "action1",
            model: "Action",
            attributes: { message: "Hello World" },
          },
        ],
      },
    };
  }

  it("should generate basic dag structure", () => {
    const behaviorTree = createSimpleBehaviorTree();
    const dag = generateDag(behaviorTree);

    // Check nodes
    expect(dag.nodes).toHaveLength(3); // root + 2 children
    expect(dag.nodes.map((n) => n.id).sort()).toEqual(["action1", "battery_check", "root"]);

    // Check edges
    expect(dag.edges).toHaveLength(2); // root -> battery_check, root -> action1
    expect(dag.edges).toEqual(
      expect.arrayContaining([
        { source: "root", target: "battery_check" },
        { source: "root", target: "action1" },
      ]),
    );

    // Check that all nodes have positions after layout
    dag.nodes.forEach((node) => {
      expect(node.x).toBeDefined();
      expect(node.y).toBeDefined();
      expect(typeof node.x).toBe("number");
      expect(typeof node.y).toBe("number");
    });
  });

  it("should preserve node properties", () => {
    const behaviorTree = createSimpleBehaviorTree();
    const dag = generateDag(behaviorTree);

    const rootNode = dag.nodes.find((n) => n.id === "root");
    expect(rootNode).toBeDefined();
    expect(rootNode?.name).toBe("root_sequence");
    expect(rootNode?.model).toBe("Sequence");

    const actionNode = dag.nodes.find((n) => n.id === "action1");
    expect(actionNode?.attributes).toEqual({ message: "Hello World" });
  });

  it("should handle custom dag options", () => {
    const behaviorTree = createSimpleBehaviorTree();
    const options: DagOptions = {
      direction: "LR",
      nodeWidth: 200,
      nodeHeight: 60,
      nodeSep: 30,
      rankSep: 100,
    };

    const dag = generateDag(behaviorTree, options);

    // Check that dagre graph has correct configuration
    expect(dag.graph.graph().rankdir).toBe("LR");
    expect(dag.graph.graph().nodesep).toBe(30);
    expect(dag.graph.graph().ranksep).toBe(100);
  });

  it("should handle nodes with many attributes", () => {
    const behaviorTree: TBehaviorTree = {
      models: { Action: { id: "Action", type: ModelTypes.ACTION, ports: [] } },
      root: {
        id: "root",
        name: "complex_node",
        model: "Action",
        attributes: {
          param1: "value1",
          param2: "value2",
          param3: "value3",
        },
      },
    };

    const dag = generateDag(behaviorTree);
    const rootNode = dag.nodes[0];
    expect(rootNode).toBeDefined();

    // Many attributes should expand height
    expect(rootNode!.height).toBeGreaterThan(40); // Default height * 1.2
  });

  it("should work with parsed simple behavior tree", () => {
    const xmlPath = resolve(__dirname, "fixtures", "bt-simple.xml");
    const xmlContent = readFileSync(xmlPath, "utf-8");
    const behaviorTree = parseBehaviorTreeXML(xmlContent);

    const dag = generateDag(behaviorTree);

    // Should have all nodes from the simple tree
    // root_sequence + battery_check + navigation_fallback + navigate_primary + navigate_backup + report_status = 6 nodes
    expect(dag.nodes).toHaveLength(6);

    // Check hierarchical structure in edges
    const rootEdges = dag.edges.filter((e) => e.source === "1"); // Root _uid is "1"
    expect(rootEdges).toHaveLength(3); // Sequence has 3 direct children

    const fallbackEdges = dag.edges.filter((e) => e.source === "3"); // Fallback _uid is "3"
    expect(fallbackEdges).toHaveLength(2); // Fallback has 2 children

    // All nodes should have computed positions
    dag.nodes.forEach((node) => {
      expect(node.x).toBeDefined();
      expect(node.y).toBeDefined();
    });
  });

  it("should work with complex behavior tree", () => {
    const xmlPath = resolve(__dirname, "fixtures", "behavior-tree.xml");
    const xmlContent = readFileSync(xmlPath, "utf-8");
    const behaviorTree = parseBehaviorTreeXML(xmlContent);

    const dag = generateDag(behaviorTree);

    // Should handle large complex tree
    expect(dag.nodes.length).toBeGreaterThan(20);
    expect(dag.edges.length).toBeGreaterThan(20);

    // All nodes should have computed positions
    dag.nodes.forEach((node) => {
      expect(node.x).toBeDefined();
      expect(node.y).toBeDefined();
    });

    // Root should be ReactiveSequence
    const rootNode = dag.nodes.find((n) => n.model === "ReactiveSequence");
    expect(rootNode).toBeDefined();
  });

  it("should handle different layout directions", () => {
    const behaviorTree = createSimpleBehaviorTree();

    const directions: Array<"TB" | "BT" | "LR" | "RL"> = ["TB", "BT", "LR", "RL"];

    directions.forEach((direction) => {
      const dag = generateDag(behaviorTree, { direction });

      // Should generate valid layout for each direction
      expect(dag.nodes).toHaveLength(3);
      expect(dag.edges).toHaveLength(2);
      expect(dag.graph.graph().rankdir).toBe(direction);

      // All nodes should have positions
      dag.nodes.forEach((node) => {
        expect(node.x).toBeDefined();
        expect(node.y).toBeDefined();
      });
    });
  });

  it("should maintain parent-child relationships in edges", () => {
    const behaviorTree: TBehaviorTree = {
      models: {
        Sequence: { id: "Sequence", type: ModelTypes.CONTROL, ports: [] },
        Action: { id: "Action", type: ModelTypes.ACTION, ports: [] },
      },
      root: {
        id: "root",
        name: "root",
        model: "Sequence",
        children: [
          {
            id: "child1",
            name: "child1",
            model: "Action",
            children: [
              {
                id: "grandchild1",
                name: "grandchild1",
                model: "Action",
              },
            ],
          },
          {
            id: "child2",
            name: "child2",
            model: "Action",
          },
        ],
      },
    };

    const dag = generateDag(behaviorTree);

    expect(dag.edges).toEqual(
      expect.arrayContaining([
        { source: "root", target: "child1" },
        { source: "root", target: "child2" },
        { source: "child1", target: "grandchild1" },
      ]),
    );
  });

  it("should handle empty tree with just root", () => {
    const behaviorTree: TBehaviorTree = {
      models: { Action: { id: "Action", type: ModelTypes.ACTION, ports: [] } },
      root: {
        id: "root",
        name: "root",
        model: "Action",
      },
    };

    const dag = generateDag(behaviorTree);

    expect(dag.nodes).toHaveLength(1);
    expect(dag.edges).toHaveLength(0);
    expect(dag.nodes[0]!.id).toBe("root");
    expect(dag.nodes[0]!.x).toBeDefined();
    expect(dag.nodes[0]!.y).toBeDefined();
  });
});
