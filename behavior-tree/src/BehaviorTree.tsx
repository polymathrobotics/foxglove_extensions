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
import { ReactElement } from "react";

interface BehaviorTreeProps {
  xml?: string;
}

export function BehaviorTree({ xml }: BehaviorTreeProps): ReactElement {
  if (!xml) {
    return <div className="p-4 text-gray-500">No behavior tree data available</div>;
  }

  return (
    <div className="p-10">
      <pre className="font-mono text-lg whitespace-pre-wrap break-words bg-gray-50 p-3 rounded border">
        {xml}
      </pre>
    </div>
  );
}
