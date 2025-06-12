import { useState } from "react";

type TreeViewProps = {
  data: any;
  label?: string;
  defaultExpanded?: boolean;
  level?: number;
};

export function TreeView({ data, label, defaultExpanded = true, level = 0 }: TreeViewProps) {
  // Special case: render uuid array as a single line hex string
  if (label === 'uuid') {
    const hexString = data.map((b: number) => b.toString(16).padStart(2, "0")).join(",");
    return (
      <div style={{ marginLeft: level, fontFamily: "monospace", fontSize: 12, marginTop: 4 }}>
        <span style={{ color: "#84bdfc" }}>{label} </span>
        <span style={{ color: "#80DA74" }}>{hexString}</span>
      </div>
    );
  }

  const [expanded, setExpanded] = useState(defaultExpanded);
  const isObject = data && typeof data === "object" && !Array.isArray(data);
  const isArray = Array.isArray(data);
  const isExpandable = isObject || isArray;

  // Don't render undefined/null
  if (data === undefined || data === null) return null;

  // Render primitive
  if (!isExpandable) {
    return (
      <div style={{ marginLeft: level, fontFamily: "monospace", fontSize: 12, marginTop: 4 }}>
        {label !== undefined ? <span style={{ color: "#84bdfc" }}>{label} </span> : null}
        <span style={{ color: "#80DA74" }}>{data.toString()}</span>
      </div>
    );
  }

  // Render object/array
  return (
    <div style={{ marginLeft: level, fontFamily: "monospace", fontSize: 12, marginBottom: 6, marginTop: 3 }}>
      {label !== undefined && (
        <span
          style={{ cursor: "pointer", color: "#84bdfc", }}
          onClick={() => setExpanded((e) => !e)}
        >
          {expanded ? "▼" : "▶"} {label}
        </span>
      )}
      {expanded && (
        <div style={{ paddingLeft: label !== undefined ? 10 : 0, }}>
          {isArray
            ? data.map((item: any, idx: number) => (
                <TreeView key={idx} data={item} label={String(idx)} defaultExpanded={true} level={level + 1} />
              ))
            : Object.entries(data).map(([k, v]) => (
                <TreeView key={k} data={v} label={k} defaultExpanded={true} level={level + 1} />
              ))}
        </div>
      )}
    </div>
  );
}