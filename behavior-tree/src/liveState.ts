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
import { NODE_STATUS_NAMES } from "./types";
import type { BehaviorTreeLog, NodeStatusName, NodeStatusSnapshot } from "./types";

const VALID_NODE_STATUSES: ReadonlySet<string> = new Set(NODE_STATUS_NAMES);

export const EMPTY_NODE_STATUS_SNAPSHOT: NodeStatusSnapshot = {
  byUid: {},
  byName: {},
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value != null;
}

export function extractBehaviorTreeXml(message: unknown): string | undefined {
  if (typeof message === "string") {
    return message;
  }

  if (isRecord(message) && typeof message.data === "string") {
    return message.data;
  }

  return undefined;
}

export function extractBehaviorTreeLog(message: unknown): BehaviorTreeLog | undefined {
  let candidate = message;

  if (isRecord(candidate) && "data" in candidate) {
    candidate = candidate.data;
  }

  if (
    !isRecord(candidate) ||
    !Array.isArray(candidate.event_log) ||
    !candidate.event_log.every(isRecord)
  ) {
    return undefined;
  }

  return candidate as BehaviorTreeLog;
}

export function normalizeNodeStatus(value: unknown): NodeStatusName | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim().toUpperCase();
  return VALID_NODE_STATUSES.has(normalized) ? (normalized as NodeStatusName) : undefined;
}

export function applyBehaviorTreeLogs(
  previous: NodeStatusSnapshot,
  logs: readonly BehaviorTreeLog[],
): NodeStatusSnapshot {
  let byUid: Record<string, NodeStatusName> | undefined;
  let byName: Record<string, NodeStatusName> | undefined;

  for (const log of logs) {
    for (const event of log.event_log) {
      const status = normalizeNodeStatus(event.current_status);
      if (!status) {
        continue;
      }

      if (typeof event.uid === "number" && Number.isInteger(event.uid) && event.uid >= 0) {
        byUid ??= { ...previous.byUid };
        byUid[String(event.uid)] = status;
      }

      if (typeof event.node_name === "string" && event.node_name.length > 0) {
        byName ??= { ...previous.byName };
        byName[event.node_name] = status;
      }
    }
  }

  if (!byUid && !byName) {
    return previous;
  }

  return {
    byUid: byUid ?? previous.byUid,
    byName: byName ?? previous.byName,
  };
}
