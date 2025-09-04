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

import { parseBehaviorTreeXML } from "./parse";

describe("parseBehaviorTreeXML", () => {
  it("should parse inline XML with basic structure", () => {
    const inlineXML = `
      <root BTCPP_format="4" main_tree_to_execute="TestTree">
        <BehaviorTree ID="TestTree">
          <Sequence name="test_sequence" _uid="1">
            <Action name="simple_action" _uid="2" param="value"/>
          </Sequence>
        </BehaviorTree>

        <TreeNodesModel>
          <Action ID="Action">
            <input_port name="param" type="string">Description for param</input_port>
          </Action>
        </TreeNodesModel>
      </root>
    `;

    const result = parseBehaviorTreeXML(inlineXML);

    // Check models
    expect(result.models).toHaveProperty("Action");
    expect(result.models.Action!.type).toBe("action");
    expect(result.models.Action!.ports).toHaveLength(1);
    expect(result.models.Action!.ports[0]!.name).toBe("param");
    expect(result.models.Action!.ports[0]!.description).toBe("Description for param");

    // Check root structure
    expect(result.root.id).toBe("1");
    expect(result.root.name).toBe("test_sequence");
    expect(result.root.model).toBe("Sequence");
    expect(result.root.children).toHaveLength(1);

    // Check child
    const child = result.root.children![0];
    expect(child!.id).toBe("2");
    expect(child!.name).toBe("simple_action");
    expect(child!.model).toBe("Action");
    expect(child!.attributes?.param).toBe("value");
  });

  it("should parse simple behavior tree and populate models and root", () => {
    const xmlPath = resolve(__dirname, "fixtures", "bt-simple.xml");
    const xmlContent = readFileSync(xmlPath, "utf-8");

    const result = parseBehaviorTreeXML(xmlContent);

    // Check that models object is not empty
    expect(Object.keys(result.models).length).toBeGreaterThan(0);

    // Check that specific models from TreeNodesModel are present
    expect(result.models).toHaveProperty("CheckBattery");
    expect(result.models).toHaveProperty("NavigateToTarget");
    expect(result.models).toHaveProperty("Action");

    // Check that root exists and has required properties
    expect(result.root).toBeDefined();
    expect(result.root.id).toBeDefined();
    expect(result.root.name).toBe("root_sequence");
    expect(result.root.model).toBe("Sequence");

    // Check that root has children
    expect(result.root.children).toBeDefined();
    expect(Array.isArray(result.root.children)).toBe(true);
    expect(result.root.children?.length).toBeGreaterThan(0);
  });

  it("should populate root values", () => {
    const xmlPath = resolve(__dirname, "fixtures", "bt-simple.xml");
    const xmlContent = readFileSync(xmlPath, "utf-8");

    const result = parseBehaviorTreeXML(xmlContent);

    // Check root node properties
    expect(result.root.id).toBe("1"); // Uses _uid now
    expect(result.root.name).toBe("root_sequence");
    expect(result.root.model).toBe("Sequence");

    // Check root has 3 children
    expect(result.root.children).toHaveLength(3);

    // Check first child (CheckBattery)
    const firstChild = result.root.children![0];
    expect(firstChild).toBeDefined();
    expect(firstChild!.id).toBe("2"); // Uses _uid now
    expect(firstChild!.name).toBe("battery_check");
    expect(firstChild!.model).toBe("CheckBattery");
    expect(firstChild!.children).toBeUndefined();

    // Check second child (Fallback)
    const secondChild = result.root.children![1];
    expect(secondChild).toBeDefined();
    expect(secondChild!.id).toBe("3"); // Uses _uid now
    expect(secondChild!.name).toBe("navigation_fallback");
    expect(secondChild!.model).toBe("Fallback");
    expect(secondChild!.children).toHaveLength(2);

    // Check Fallback's children
    expect(secondChild!.children![0]!.id).toBe("4"); // Uses _uid now
    expect(secondChild!.children![0]!.name).toBe("navigate_primary");
    expect(secondChild!.children![0]!.model).toBe("NavigateToTarget");
    expect(secondChild!.children![0]!.attributes?.target).toBe("home");

    expect(secondChild!.children![1]!.id).toBe("5"); // Uses _uid now
    expect(secondChild!.children![1]!.name).toBe("navigate_backup");
    expect(secondChild!.children![1]!.model).toBe("NavigateToTarget");
    expect(secondChild!.children![1]!.attributes?.target).toBe("safe_zone");

    // Check third child (Action)
    const thirdChild = result.root.children![2];
    expect(thirdChild).toBeDefined();
    expect(thirdChild!.id).toBe("6"); // Uses _uid now
    expect(thirdChild!.name).toBe("report_status");
    expect(thirdChild!.model).toBe("Action");
    expect(thirdChild!.attributes?.message).toBe("Task completed");
  });

  describe("complex behavior tree parsing", () => {
    it("should parse complex behavior-tree.xml with many models", () => {
      const xmlPath = resolve(__dirname, "fixtures", "behavior-tree.xml");
      const xmlContent = readFileSync(xmlPath, "utf-8");

      const result = parseBehaviorTreeXML(xmlContent);

      // Check that models object has many entries (should be 80+ custom models plus built-ins)
      expect(Object.keys(result.models).length).toBeGreaterThan(80);

      // Check some specific custom models from TreeNodesModel
      expect(result.models).toHaveProperty("AddMultipleToQueue");
      expect(result.models).toHaveProperty("NavSatFixSubscriber");
      expect(result.models).toHaveProperty("IsTrue");
      expect(result.models).toHaveProperty("ModifyCortexQueueService");

      // Check built-in models are still present
      expect(result.models).toHaveProperty("Sequence");
      expect(result.models).toHaveProperty("Fallback");

      // Verify model types
      expect(result.models.AddMultipleToQueue).toBeDefined();
      expect(result.models.AddMultipleToQueue!.type).toBe("action");
      expect(result.models.IsTrue).toBeDefined();
      expect(result.models.IsTrue!.type).toBe("condition");
      expect(result.models.ForceSuccess).toBeDefined();
      expect(result.models.ForceSuccess!.type).toBe("decorator");
      expect(result.models.ReactiveSequence).toBeDefined();
      expect(result.models.ReactiveSequence!.type).toBe("control");
    });

    it("should parse complex root structure correctly", () => {
      const xmlPath = resolve(__dirname, "fixtures", "behavior-tree.xml");
      const xmlContent = readFileSync(xmlPath, "utf-8");

      const result = parseBehaviorTreeXML(xmlContent);

      // Check root is ReactiveSequence
      expect(result.root.model).toBe("ReactiveSequence");
      expect(result.root.name).toBe("ReactiveSequence");
      expect(result.root.attributes?._uid).toBe("1");

      // ReactiveSequence should have many children
      expect(result.root.children).toBeDefined();
      expect(result.root.children!.length).toBeGreaterThan(10);

      // Check first child is a Fallback
      const firstChild = result.root.children![0];
      expect(firstChild!.model).toBe("Fallback");
      expect(firstChild!.name).toBe("Fallback");
      expect(firstChild!.attributes?._uid).toBe("2");
    });

    it("should handle deeply nested tree structure", () => {
      const xmlPath = resolve(__dirname, "fixtures", "behavior-tree.xml");
      const xmlContent = readFileSync(xmlPath, "utf-8");

      const result = parseBehaviorTreeXML(xmlContent);

      // Navigate to a deeply nested node: Root > Fallback > Sequence > NavSatFixSubscriber
      const fallback = result.root.children![0]; // First Fallback
      expect(fallback).toBeDefined();
      expect(fallback!.children).toHaveLength(3); // IsTrue, Sequence, Sequence

      const sequence = fallback!.children![1]; // Second child (first Sequence)
      expect(sequence).toBeDefined();
      expect(sequence!.model).toBe("Sequence");
      expect(sequence!.children).toHaveLength(4); // NavSatFixSubscriber, InitializePoseTransformer, SetBool, SetBool

      const navSatFixSubscriber = sequence!.children![0];
      expect(navSatFixSubscriber).toBeDefined();
      expect(navSatFixSubscriber!.model).toBe("NavSatFixSubscriber");
      expect(navSatFixSubscriber!.attributes?._uid).toBe("5");
      expect(navSatFixSubscriber!.attributes?.topic_name).toBe("/gps/fix");
    });

    it("should parse node attributes correctly", () => {
      const xmlPath = resolve(__dirname, "fixtures", "behavior-tree.xml");
      const xmlContent = readFileSync(xmlPath, "utf-8");

      const result = parseBehaviorTreeXML(xmlContent);

      // Find a node with multiple attributes: Nav2GoalCommander
      // Navigate deep into the tree to find it
      let nav2GoalCommander: any = null;

      function findNodeByModel(node: any, model: string): any {
        if (node.model === model) {
          return node;
        }
        if (node.children) {
          for (const child of node.children) {
            const found = findNodeByModel(child, model);
            if (found) {
              return found;
            }
          }
        }
        return null;
      }

      nav2GoalCommander = findNodeByModel(result.root, "Nav2GoalCommander");

      expect(nav2GoalCommander).toBeDefined();
      expect(nav2GoalCommander.attributes?._uid).toBe("71");
      expect(nav2GoalCommander.attributes?.action_name).toBe("navigate_through_poses");
      expect(nav2GoalCommander.attributes?.existence_timeout).toBe("2");
      expect(nav2GoalCommander.attributes?.response_timeout).toBe("30");
      expect(nav2GoalCommander.attributes?.cancel_goal_on_halt).toBe("false");
    });

    it("should parse models with complex port definitions", () => {
      const xmlPath = resolve(__dirname, "fixtures", "behavior-tree.xml");
      const xmlContent = readFileSync(xmlPath, "utf-8");

      const result = parseBehaviorTreeXML(xmlContent);

      // Check NavSatFixSubscriber model
      const navSatModel = result.models.NavSatFixSubscriber;
      expect(navSatModel).toBeDefined();
      expect(navSatModel!.type).toBe("action");
      expect(navSatModel!.ports.length).toBe(3); // output_port, inout_port, input_port

      // Check port details
      const outputPort = navSatModel!.ports.find((p) => p.direction === "output");
      expect(outputPort).toBeDefined();
      expect(outputPort!.name).toBe("geopose_stamped");
      expect(outputPort!.type).toContain("geographic_msgs::msg::GeoPoseStamped");

      // Check IsTrue condition model
      const isTrueModel = result.models.IsTrue;
      expect(isTrueModel).toBeDefined();
      expect(isTrueModel!.type).toBe("condition");
      expect(isTrueModel!.ports.length).toBe(1);
      expect(isTrueModel!.ports[0]!.name).toBe("boolean");
      expect(isTrueModel!.ports[0]!.type).toBe("bool");
      expect(isTrueModel!.ports[0]!.description).toBe(
        "Boolean to decide success or failure off of",
      );
    });
  });
});
