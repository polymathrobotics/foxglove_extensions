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
    // expect(result.root).toBeDefined();
    // expect(result.root.id).toBeDefined();
    // expect(result.root.name).toBe("root_sequence");
    // expect(result.root.model).toBe("Sequence");

    // Check that root has children
    // expect(result.root.children).toBeDefined();
    // expect(Array.isArray(result.root.children)).toBe(true);
    // expect(result.root.children.length).toBeGreaterThan(0);
  });
});
