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
import { describe, expect, it } from "vitest";

import {
  applyBehaviorTreeLogs,
  EMPTY_NODE_STATUS_SNAPSHOT,
  extractBehaviorTreeLog,
  extractBehaviorTreeXml,
  normalizeNodeStatus,
} from "./liveState";
import type { BehaviorTreeLog, BehaviorTreeLogEvent } from "./types";

const timestamp = { sec: 1, nsec: 2 };

function makeEvent(overrides: Partial<BehaviorTreeLogEvent> = {}): BehaviorTreeLogEvent {
  return {
    timestamp,
    node_name: "Navigate",
    uid: 7,
    previous_status: "IDLE",
    current_status: "RUNNING",
    ...overrides,
  };
}

function makeLog(...event_log: BehaviorTreeLogEvent[]): BehaviorTreeLog {
  return { timestamp, event_log };
}

describe("live behavior tree state", () => {
  it("extracts XML from raw and std_msgs/String-shaped messages", () => {
    expect(extractBehaviorTreeXml("<root />")).toBe("<root />");
    expect(extractBehaviorTreeXml({ data: "<root />" })).toBe("<root />");
    expect(extractBehaviorTreeXml({ data: 42 })).toBeUndefined();
  });

  it("extracts raw and data-wrapped BehaviorTreeLog messages", () => {
    const log = makeLog(makeEvent());
    expect(extractBehaviorTreeLog(log)).toBe(log);
    expect(extractBehaviorTreeLog({ data: log })).toBe(log);
    expect(extractBehaviorTreeLog({ event_log: "invalid" })).toBeUndefined();
    expect(extractBehaviorTreeLog({ event_log: [null] })).toBeUndefined();
  });

  it("normalizes known status strings and rejects unknown values", () => {
    expect(normalizeNodeStatus(" running ")).toBe("RUNNING");
    expect(normalizeNodeStatus("SUCCESS")).toBe("SUCCESS");
    expect(normalizeNodeStatus("UNKNOWN")).toBeUndefined();
  });

  it("applies every event in order and retains prior node state", () => {
    const first = applyBehaviorTreeLogs(EMPTY_NODE_STATUS_SNAPSHOT, [
      makeLog(
        makeEvent(),
        makeEvent({ uid: 8, node_name: "Plan", current_status: "SUCCESS" }),
      ),
    ]);
    const second = applyBehaviorTreeLogs(first, [
      makeLog(makeEvent({ previous_status: "RUNNING", current_status: "FAILURE" })),
    ]);

    expect(second.byUid).toEqual({ "7": "FAILURE", "8": "SUCCESS" });
    expect(second.byName).toEqual({ Navigate: "FAILURE", Plan: "SUCCESS" });
  });

  it("lets later log messages in the same frame overwrite earlier messages", () => {
    const result = applyBehaviorTreeLogs(EMPTY_NODE_STATUS_SNAPSHOT, [
      makeLog(makeEvent({ current_status: "RUNNING" })),
      makeLog(makeEvent({ previous_status: "RUNNING", current_status: "SUCCESS" })),
    ]);

    expect(result.byUid["7"]).toBe("SUCCESS");
    expect(result.byName.Navigate).toBe("SUCCESS");
  });

  it("retains the node-name fallback when a UID is invalid", () => {
    const result = applyBehaviorTreeLogs(EMPTY_NODE_STATUS_SNAPSHOT, [
      makeLog(makeEvent({ uid: Number.NaN, current_status: "RUNNING" })),
    ]);

    expect(result.byUid).toEqual({});
    expect(result.byName.Navigate).toBe("RUNNING");
  });

  it("ignores unsupported status values without allocating a new snapshot", () => {
    const result = applyBehaviorTreeLogs(EMPTY_NODE_STATUS_SNAPSHOT, [
      makeLog(makeEvent({ current_status: "UNKNOWN" })),
    ]);

    expect(result).toBe(EMPTY_NODE_STATUS_SNAPSHOT);
  });
});
