import * as rostime from "@foxglove/rostime";

import type { NodeInfo, ROS2GraphMessage } from "./types";

// ROS2 Parameter Type constants based on rcl_interfaces/msg/ParameterType.msg
// Reference: https://docs.ros2.org/foxy/api/rcl_interfaces/msg/ParameterType.html
const PARAMETER_TYPE_NAMES: Record<number, string> = {
  0: "Not Set",
  1: "Boolean",
  2: "Integer",
  3: "Double",
  4: "String",
  5: "Byte Array",
  6: "Boolean Array",
  7: "Integer Array",
  8: "Double Array",
  9: "String Array",
};

// Helper function to get human-readable parameter type name
function getParameterTypeName(type: number): string {
  return PARAMETER_TYPE_NAMES[type] ?? `Unknown (${type})`;
}

// Helper function to extract parameter value based on type
function formatParameterValue(paramValue: unknown): string {
  if (paramValue == null || typeof paramValue !== "object") {
    return "Not Set";
  }

  const value = paramValue as { type?: number; [key: string]: unknown };

  if (value.type === 0) {
    return "Not Set";
  }

  // Extract the correct value field based on type
  switch (value.type) {
    case 1: // PARAMETER_BOOL
      return value.bool_value === true ? "true" : value.bool_value === false ? "false" : "N/A";
    case 2: // PARAMETER_INTEGER
      return value.integer_value != null ? String(value.integer_value) : "N/A";
    case 3: // PARAMETER_DOUBLE
      return value.double_value != null ? String(value.double_value) : "N/A";
    case 4: // PARAMETER_STRING
      return value.string_value != null ? String(value.string_value) : "N/A";
    case 5: // PARAMETER_BYTE_ARRAY
      return Array.isArray(value.byte_array_value)
        ? `[${value.byte_array_value.join(", ")}]`
        : "N/A";
    case 6: // PARAMETER_BOOL_ARRAY
      return Array.isArray(value.bool_array_value)
        ? `[${value.bool_array_value.join(", ")}]`
        : "N/A";
    case 7: // PARAMETER_INTEGER_ARRAY
      return Array.isArray(value.integer_array_value)
        ? `[${value.integer_array_value.join(", ")}]`
        : "N/A";
    case 8: // PARAMETER_DOUBLE_ARRAY
      return Array.isArray(value.double_array_value)
        ? `[${value.double_array_value.join(", ")}]`
        : "N/A";
    case 9: // PARAMETER_STRING_ARRAY
      return Array.isArray(value.string_array_value)
        ? `[${value.string_array_value.join(", ")}]`
        : "N/A";
    default:
      return "Unknown Type";
  }
}

interface SelectedNodeProps {
  selectedNodeId: string | null;
  graphData: ROS2GraphMessage;
}

export function SelectedNode({
  selectedNodeId,
  graphData,
}: SelectedNodeProps): React.JSX.Element | null {
  if (!selectedNodeId) {
    return null;
  }

  const panelStyle: React.CSSProperties = {
    position: "absolute",
    bottom: 10,
    right: 10,
    background: "rgba(0, 0, 0, 0.5)",
    color: "#fff",
    padding: "20px 20px",
    borderRadius: 6,
    maxWidth: "30%",
    maxHeight: "40%",
    overflowY: "auto",
    overflowX: "auto",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    lineHeight: "1.4em",
    fontSize: 13,
    border: "0px solid #ccc",
    zIndex: 5,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: "10px",
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: "10px",
  };

  const listStyle: React.CSSProperties = {
    paddingLeft: "1em",
    margin: 0,
  };

  if (selectedNodeId.startsWith("node:")) {
    const nodeName = selectedNodeId.slice(5);
    const node: NodeInfo | undefined = graphData.nodes.find(
      (n) => `node:${n.name}` === selectedNodeId,
    );

    if (node == null) {
      return null;
    }

    return (
      <div style={panelStyle}>
        <div style={titleStyle}>{nodeName}</div>

        {/* Publishers */}
        {node.publishers.length > 0 && (
          <>
            <div>
              <b>Publishers: </b>
            </div>
            <ul style={listStyle}>
              {node.publishers.map((pub) => (
                <li key={pub.name}>
                  <b>{pub.name}</b> ({pub.type})
                </li>
              ))}
            </ul>
          </>
        )}

        {/* Subscribers */}
        {node.subscriptions.length > 0 && (
          <>
            <div>
              <b>Subscribers: </b>
            </div>
            <ul style={listStyle}>
              {node.subscriptions.map((sub) => (
                <li key={sub.name}>
                  <b>{sub.name}</b> ({sub.type})
                </li>
              ))}
            </ul>
          </>
        )}

        {/* Parameters */}
        {node.parameters.length > 0 && (
          <>
            <div>
              <b>Parameters: </b>
            </div>
            <ul style={listStyle}>
              {node.parameters.map((param, index) => {
                // Find corresponding parameter value
                const paramValue = node.parameter_values[index];
                return (
                  <li key={param.name}>
                    <b>{param.name}</b>
                    <ul style={listStyle}>
                      <li>Type: {getParameterTypeName(param.type)}</li>
                      {paramValue != null && <li>Value: {formatParameterValue(paramValue)}</li>}
                    </ul>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    );
  }

  if (selectedNodeId.startsWith("topic:")) {
    const topicName = selectedNodeId.slice(6);

    return (
      <div style={panelStyle}>
        <div style={titleStyle}>{topicName}</div>

        {/* Topic Type */}
        <div style={sectionStyle}>
          {graphData.nodes
            .filter((n) => n.publishers.some((pub) => `topic:${pub.name}` === selectedNodeId))
            .map((node) =>
              node.publishers
                .filter((pub) => `topic:${pub.name}` === selectedNodeId)
                .map((pub) => <span key={pub.name}>{pub.type}</span>),
            )}
        </div>

        {/* Topic Publishers */}
        {(() => {
          const publishers = graphData.nodes.flatMap((n) =>
            n.publishers
              .filter((pub) => `topic:${pub.name}` === selectedNodeId)
              .map((pub) => ({ node: n, pub })),
          );
          return publishers.length > 0 ? (
            <>
              <div>
                <b>Publishers: </b>
              </div>
              <ul style={listStyle}>
                {publishers.map(({ node, pub }) => (
                  <li key={node.name + pub.name}>
                    <b>{node.name}</b>
                    <ul style={listStyle}>
                      {Object.entries(pub.qos).map(([key, value]) => (
                        <li key={key}>
                          {key}: {typeof value === "number" ? value : rostime.toString(value)}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </>
          ) : null;
        })()}

        {/* Topic Subscribers */}
        {(() => {
          const subscribers = graphData.nodes.flatMap((n) =>
            n.subscriptions
              .filter((sub) => `topic:${sub.name}` === selectedNodeId)
              .map((sub) => ({ node: n, sub })),
          );
          return subscribers.length > 0 ? (
            <>
              <div>
                <b>Subscribers: </b>
              </div>
              <ul style={listStyle}>
                {subscribers.map(({ node, sub }) => (
                  <li key={node.name + sub.name}>
                    <b>{node.name}</b>
                    <ul style={listStyle}></ul>
                  </li>
                ))}
              </ul>
            </>
          ) : null;
        })()}
      </div>
    );
  }

  return null;
}
