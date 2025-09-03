import { ReactElement } from "react";

interface BehaviorTreeProps {
  xml?: string;
}

export function BehaviorTree({ xml }: BehaviorTreeProps): ReactElement {
  if (!xml) {
    return <div className="p-4 text-gray-500">No behavior tree data available</div>;
  }

  return (
    <div className="p-4">
      <pre className="font-mono text-sm whitespace-pre-wrap break-words bg-gray-50 p-3 rounded border bg-red-100">
        {xml}
      </pre>
    </div>
  );
}
