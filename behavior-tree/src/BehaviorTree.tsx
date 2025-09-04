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
import { ReactElement, useMemo } from "react";

import { Graph } from "./components/Graph";
import { GraphContextProvider } from "./components/GraphContextProvider";
import { parseBehaviorTreeXML } from "./parse";
import { BehaviorTreeLog, TBehaviorTree } from "./types";

import { RightSidebar } from "@/components/RightSidebar";

interface BehaviorTreeProps {
  xml?: string;
  logs?: BehaviorTreeLog;
}

export function BehaviorTree({ xml }: BehaviorTreeProps): ReactElement {
  const behaviorTree: TBehaviorTree | null = useMemo(() => {
    if (xml) {
      try {
        const parsedTree = parseBehaviorTreeXML(xml);
        return parsedTree;
      } catch (error) {
        console.error("Failed to parse behavior tree XML:", error);
      }
    }
    return null;
  }, [xml]);

  return (
    <GraphContextProvider>
      <div className="h-full w-full relative flex">
        <div className="flex-1 relative">
          <Graph behaviorTree={behaviorTree} />
        </div>

        <RightSidebar behaviorTree={behaviorTree} xml={xml} />
      </div>
    </GraphContextProvider>
  );
}
