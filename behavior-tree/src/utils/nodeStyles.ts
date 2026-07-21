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
import type { NodeStatusName } from "../types";

export interface NodeColorScheme {
  nodeStyles: {
    default: string;
    selected: string;
  };
  popupStyle: string;
  badgeColor: string;
}

/**
 * Get color scheme for a behavior tree node based on its model type
 */
export function getNodeColor(modelType: string): NodeColorScheme {
  // Control flow nodes (blue)
  if (
    ["Sequence", "Fallback", "Parallel", "ReactiveSequence", "ReactiveFallback"].includes(modelType)
  ) {
    return {
      nodeStyles: {
        default: "bg-blue-100 border-blue-300 dark:bg-blue-900 dark:border-blue-600",
        selected: "bg-blue-300 border-blue-600 dark:bg-blue-700 dark:border-blue-400 shadow-lg ring-2 ring-blue-400/50 dark:ring-blue-500/50",
      },
      popupStyle: "bg-blue-100 border-blue-300 dark:bg-blue-900 dark:border-blue-600",
      badgeColor: "lightblue",
    };
  }

  // Decorator nodes (purple)
  if (["ForceSuccess", "ForceFailure", "Inverter", "Repeat", "Timeout"].includes(modelType)) {
    return {
      nodeStyles: {
        default: "bg-purple-100 border-purple-300 dark:bg-purple-900 dark:border-purple-600",
        selected: "bg-purple-300 border-purple-600 dark:bg-purple-700 dark:border-purple-400 shadow-lg ring-2 ring-purple-400/50 dark:ring-purple-500/50",
      },
      popupStyle: "bg-purple-100 border-purple-300 dark:bg-purple-900 dark:border-purple-600",
      badgeColor: "#DAB1DA",
    };
  }

  // Condition nodes (yellow)
  if (
    modelType.includes("IsTrue") ||
    modelType.includes("IsFalse") ||
    modelType.includes("Check")
  ) {
    return {
      nodeStyles: {
        default: "bg-yellow-100 border-yellow-300 dark:bg-yellow-900 dark:border-yellow-600",
        selected: "bg-yellow-300 border-yellow-600 dark:bg-yellow-700 dark:border-yellow-400 shadow-lg ring-2 ring-yellow-400/50 dark:ring-yellow-500/50",
      },
      popupStyle: "bg-yellow-100 border-yellow-300 dark:bg-yellow-900 dark:border-yellow-600",
      badgeColor: "#8B8000",
    };
  }

  // Default/Action nodes (green)
  return {
    nodeStyles: {
      default: "bg-green-100 border-green-300 dark:bg-green-900 dark:border-green-600",
      selected: "bg-green-300 border-green-600 dark:bg-green-700 dark:border-green-400 shadow-lg ring-2 ring-green-400/50 dark:ring-green-500/50",
    },
    popupStyle: "bg-green-100 border-green-300 dark:bg-green-900 dark:border-green-600",
    badgeColor: "lightgreen",
  };
}

/**
 * Get color scheme for a behavior tree node based on its latest runtime status.
 */
export function getNodeStatusColor(status: NodeStatusName): NodeColorScheme {
  switch (status) {
    case "IDLE":
      return {
        nodeStyles: {
          default: "bg-gray-100 border-gray-400 dark:bg-gray-800 dark:border-gray-500",
          selected: "bg-gray-200 border-gray-600 dark:bg-gray-700 dark:border-gray-300 shadow-lg ring-2 ring-gray-400/50",
        },
        popupStyle: "bg-gray-100 border-gray-400 dark:bg-gray-800 dark:border-gray-500",
        badgeColor: "#9ca3af",
      };
    case "RUNNING":
      return {
        nodeStyles: {
          default: "bg-amber-100 border-amber-500 dark:bg-amber-900 dark:border-amber-400 shadow-md ring-2 ring-amber-400/40 motion-safe:animate-pulse",
          selected: "bg-amber-200 border-amber-600 dark:bg-amber-800 dark:border-amber-300 shadow-lg ring-2 ring-amber-400/70 motion-safe:animate-pulse",
        },
        popupStyle: "bg-amber-100 border-amber-500 dark:bg-amber-900 dark:border-amber-400",
        badgeColor: "#f59e0b",
      };
    case "SUCCESS":
      return {
        nodeStyles: {
          default: "bg-emerald-100 border-emerald-500 dark:bg-emerald-900 dark:border-emerald-400",
          selected: "bg-emerald-200 border-emerald-600 dark:bg-emerald-800 dark:border-emerald-300 shadow-lg ring-2 ring-emerald-400/60",
        },
        popupStyle: "bg-emerald-100 border-emerald-500 dark:bg-emerald-900 dark:border-emerald-400",
        badgeColor: "#10b981",
      };
    case "FAILURE":
      return {
        nodeStyles: {
          default: "bg-red-100 border-red-500 dark:bg-red-950 dark:border-red-400",
          selected: "bg-red-200 border-red-600 dark:bg-red-900 dark:border-red-300 shadow-lg ring-2 ring-red-400/60",
        },
        popupStyle: "bg-red-100 border-red-500 dark:bg-red-950 dark:border-red-400",
        badgeColor: "#ef4444",
      };
    case "SKIPPED":
      return {
        nodeStyles: {
          default: "bg-slate-100 border-slate-400 dark:bg-slate-800 dark:border-slate-500",
          selected: "bg-slate-200 border-slate-600 dark:bg-slate-700 dark:border-slate-300 shadow-lg ring-2 ring-slate-400/50",
        },
        popupStyle: "bg-slate-100 border-slate-400 dark:bg-slate-800 dark:border-slate-500",
        badgeColor: "#64748b",
      };
  }
}
