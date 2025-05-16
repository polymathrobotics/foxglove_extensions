import { PanelExtensionContext } from "@foxglove/extension";
import { useState } from "react";
import { createRoot } from "react-dom/client";

// Request type
type RouteNavigationRequest = {
  mode: number;
  commands: Array<{
    type: number;
    navigation: {
      type: number;
      options: {
        path_option: {
          name: string;
          params: 
            {
              key: string;
              value: string;
            }[]
        };
      };
      route_path: {
        type: number;
        goal_pose: {
            header: {
                frame_id: string;
            };
            pose: {
                position: {
                    x: number;
                    y: number;
                };
                orientation: {
                    w: number;
                };
            }
        };
        goal_node_id: number;
        goal_node_name: string;
      };
    };
  }>;
};

// Response type
type RouteNavigationResponse = {
  success: boolean;
  message: string;
};

// Common / repeated request information
const BASE_REQUEST = {
  mode: 0,
  commands: [{
    type: 2,
    navigation: {
      type: 2,
      options: {
        path_option: {
          name: "route_mode",
          params: [
            {
              key: "value",
              value: "true"
            }
          ]
        }
      },
      route_path: {
        type: 1,
        goal_pose: {
          header: {
              frame_id: "map"
          },
          pose: {
              position: {
                  x: 0.0,
                  y: 0.0,
              },
              orientation: {
                  w: 1.0
              }
          }
        },
        goal_node_id: 0,
        goal_node_name: "",
      }
    }
  }]
};

// Panel method
function RouteNavigationPanel({ context }: { context: PanelExtensionContext }) {
  // Common
  const [response, setResponse] = useState<RouteNavigationResponse | null>(null);
  const [error, setError] = useState<string>();

  // Goal Pose
  const pose_x_restored =
    typeof context.initialState === "object" &&
    context.initialState !== null &&
    "goal_pose_x" in context.initialState
      ? String((context.initialState as any).goal_pose_x)
      : "";
  const [poseXInputValue, setPoseXInputValue] = useState<string>(pose_x_restored);
  const pose_y_restored =
    typeof context.initialState === "object" &&
    context.initialState !== null &&
    "goal_pose_y" in context.initialState
      ? String((context.initialState as any).goal_pose_y)
      : "";
  const [poseYInputValue, setPoseYInputValue] = useState<string>(pose_y_restored);
  const [loadingPoseButton, setLoadingPoseButton] = useState(false);
  const [hoveringInputX, setHoveringInputX] = useState(false);
  const [hoveringInputY, setHoveringInputY] = useState(false);
  const [hoveringButtonPose, setHoveringButtonPose] = useState(false);

  // Goal Node ID
  const node_id_restored =
    typeof context.initialState === "object" &&
    context.initialState !== null &&
    "goal_node_id" in context.initialState
      ? String((context.initialState as any).goal_node_id)
      : "";
  const [nodeIDInputValue, setNodeIDInputValue] = useState<string>(node_id_restored);
  const [loadingIDButton, setLoadingIDButton] = useState(false);
  const [hoveringInputID, setHoveringInputID] = useState(false);
  const [hoveringButtonID, setHoveringButtonID] = useState(false);

  // Goal Node Name
  const node_name_restored =
    typeof context.initialState === "object" &&
    context.initialState !== null &&
    "goal_node_name" in context.initialState
      ? String((context.initialState as any).goal_node_name)
      : "";
  const [nodeNameInputValue, setNodeNameInputValue] = useState<string>(node_name_restored);
  const [loadingNameButton, setLoadingNameButton] = useState(false);
  const [hoveringInputName, setHoveringInputName] = useState(false);
  const [hoveringButtonName, setHoveringButtonName] = useState(false);

  // Service call by pose
  const callRouteNavigationByPose = async () => {
    setLoadingPoseButton(true);

    // Parse & guard for input
    const parsed_goal_pose_x_val = parseInt(poseXInputValue, 10);
    if (isNaN(parsed_goal_pose_x_val)) {
      setError("Please enter a valid pose x value");
      setLoadingPoseButton(false);
      return;
    }
    const parsed_goal_pose_y_val = parseInt(poseYInputValue, 10);
    if (isNaN(parsed_goal_pose_y_val)) {
      setError("Please enter a valid pose y value");
      setLoadingPoseButton(false);
      return;
    }

    // Fill in request message
    const request: RouteNavigationRequest = {
      ...BASE_REQUEST,
      commands: BASE_REQUEST.commands.map((cmd) => ({
        ...cmd,
        navigation: {
          ...cmd.navigation,
          route_path: {
            ...cmd.navigation.route_path,
            type: 0,
            goal_pose: {
              header: {
                frame_id: "map"
              },
              pose: {
                  position: {
                      x: parsed_goal_pose_x_val,
                      y: parsed_goal_pose_y_val,
                  },
                  orientation: {
                      w: 1.0
                  }
              }
            }
          },
        },
      })),
    };

    try {
      const raw = await context.callService?.("/cortex/modify_command", request);
      const res = raw as RouteNavigationResponse;
      if(res){
        setResponse(res);
        setError(undefined);
      }
      setError(undefined);
      context.saveState({ goal_pose_x: parsed_goal_pose_x_val });
      context.saveState({ goal_pose_y: parsed_goal_pose_y_val });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoadingPoseButton(false);
    }
  };

  // Service call by ID
  const callRouteNavigationByID = async () => {
    setLoadingIDButton(true);

    // Parse & guard for input
    const parsed_goal_node_id_val = parseInt(nodeIDInputValue, 10);
    if (isNaN(parsed_goal_node_id_val)) {
      setError("Please enter a valid node ID");
      setLoadingIDButton(false);
      return;
    }

    // Fill in request message
    const request: RouteNavigationRequest = {
      ...BASE_REQUEST,
      commands: BASE_REQUEST.commands.map((cmd) => ({
        ...cmd,
        navigation: {
          ...cmd.navigation,
          route_path: {
            ...cmd.navigation.route_path,
            type: 1,
            goal_node_id: parsed_goal_node_id_val,
          },
        },
      })),
    };

    try {
      const raw = await context.callService?.("/cortex/modify_command", request);
      const res = raw as RouteNavigationResponse;
      if(res){
        setResponse(res);
        setError(undefined);
      }
      setError(undefined);
      context.saveState({ goal_node_id: parsed_goal_node_id_val });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoadingIDButton(false);
    }
  };


  // Service call by name
  const callRouteNavigationByName = async () => {
    setLoadingNameButton(true);

    // Parse & guard for input
    const parsed_goal_node_name_val = nodeNameInputValue.trim();
    if (!parsed_goal_node_name_val) {
      setError("Please enter a valid node name");
      setLoadingNameButton(false);
      return;
    }

    // Fill in request message
    const request: RouteNavigationRequest = {
      ...BASE_REQUEST,
      commands: BASE_REQUEST.commands.map((cmd) => ({
        ...cmd,
        navigation: {
          ...cmd.navigation,
          route_path: {
            ...cmd.navigation.route_path,
            type: 2,
            goal_node_name: parsed_goal_node_name_val,
          },
        },
      })),
    };

    try {
      const raw = await context.callService?.("/cortex/modify_command", request);
      const res = raw as RouteNavigationResponse;
      if(res){
        setResponse(res);
        setError(undefined);
      }
      setError(undefined);
      context.saveState({ goal_node_name: parsed_goal_node_name_val });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoadingNameButton(false);
    }
  };
  

  // Styles ------------------------
  // Common
  const panelStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    padding: 24,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    borderRadius: 8,
  };
  const titleStyle: React.CSSProperties = {
    whiteSpace: "nowrap",
    overflow: "hidden", 
    textOverflow: "ellipsis",
    fontSize: 22,
    maxWidth: "100%",
    fontWeight: "bold",
  };
  const descriptionStyle: React.CSSProperties = {
    overflow: "hidden", 
    textOverflow: "ellipsis",
    maxWidth: "100%",
    padding: "0px 2px",
  };
  const labelTextStyle: React.CSSProperties = {
    whiteSpace: "nowrap",
    overflow: "hidden", 
    textOverflow: "ellipsis",
    maxWidth: "100%",
  };
  const rowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 12,
  };
  const buttonStyle: React.CSSProperties = {
    alignSelf: "center",

    flexShrink: 1,
    overflow: "hidden", 
    textOverflow: "ellipsis",
    maxWidth: "100%",
    whiteSpace: "nowrap",

    padding: "10px 20px",
    border: "none",
    borderRadius: 2,
    backgroundColor: "#0079ca",
    fontSize: "0.73rem",
    fontWeight: "bold",
    color: "#fff",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  };
  
  // Styles for requesting by pose
  const poseXYLabelTextStyle: React.CSSProperties = {
    whiteSpace: "nowrap",
    maxWidth: "100%",
  };
  const inputXYStyle: React.CSSProperties = {
    flex: 1, 
    border: "1px solid #ccc",
    fontFamily: "monospace",
    fontSize: 13,
    lineHeight: 1.4,
    borderRadius: 4,
    background: "var(--foxglove-panel-surface)",
    color: "var(--foxglove-text-primary)",
    resize: "vertical",
    outline: "none",
    textAlign: "center",

    maxWidth: "85%",
    overflow: "hidden", 
    textOverflow: "ellipsis",
  };
  const inputHoverXStyle: React.CSSProperties = hoveringInputX ? {
    borderColor: "#fff",
  } : {};
  const inputHoverYStyle: React.CSSProperties = hoveringInputY ? {
    borderColor: "#fff",
  } : {};
  const buttonPoseHoverStyle: React.CSSProperties = hoveringButtonPose
    ? { backgroundColor: "#006bb3" } : {};

  // Styles for requesting by ID
  const inputIDStyle: React.CSSProperties = {
    flex: 1, 
    border: "1px solid #ccc",
    fontFamily: "monospace",
    fontSize: 13,
    lineHeight: 1.4,
    borderRadius: 4,
    background: "var(--foxglove-panel-surface)",
    color: "var(--foxglove-text-primary)",
    resize: "vertical",
    outline: "none",
    textAlign: "center",

    maxWidth: "100%",
    overflow: "hidden", 
    textOverflow: "ellipsis",
  };
  const inputIDHoverStyle: React.CSSProperties = hoveringInputID ? {
    borderColor: "#fff",
  } : {};
  const buttonIDHoverStyle: React.CSSProperties = hoveringButtonID
    ? { backgroundColor: "#006bb3" } : {};

  // Styles for requesting by name
  const inputNameStyle: React.CSSProperties = {
    flex: 1, 
    border: "1px solid #ccc",
    fontFamily: "monospace",
    fontSize: 13,
    lineHeight: 1.4,
    borderRadius: 4,
    background: "var(--foxglove-panel-surface)",
    color: "var(--foxglove-text-primary)",
    resize: "vertical",
    outline: "none",
    textAlign: "center",

    maxWidth: "100%",
    overflow: "hidden", 
    textOverflow: "ellipsis",
  };
  const inputNameHoverStyle: React.CSSProperties = hoveringInputName ? {
    borderColor: "#fff",
  } : {};
  const buttonNameHoverStyle: React.CSSProperties = hoveringButtonName
    ? { backgroundColor: "#006bb3" } : {};
  // -------------------------------

  // Return panel
  return (
    <div style={panelStyle}>
      <div style={rowStyle}>
        <label style={titleStyle}>Route Navigation</label>
      </div>
      <div style={rowStyle}>
        <label style={descriptionStyle}>Note: A route graph needs to be loaded via Route Manager before requesting route navigation</label>
      </div>

      {/* By Pose */}
      <div style={rowStyle}>
        <label style={labelTextStyle}>Goal pose:</label>
      </div>
      <div style={rowStyle}>
        <label htmlFor="goal-pose-x" style={poseXYLabelTextStyle}>x:</label>
        <input
            id="goal-pose-x"
            type="number"
            value={poseXInputValue}
            onChange={e => setPoseXInputValue(e.target.value)}
            onMouseEnter={() => setHoveringInputX(true)}
            onMouseLeave={() => setHoveringInputX(false)}
            style={{ ...inputXYStyle, ...inputHoverXStyle }}
          />
      </div>
      <div style={rowStyle}>
        <label htmlFor="goal-pose-y" style={poseXYLabelTextStyle}>y:</label>
        <input
            id="goal-pose-y"
            type="number"
            value={poseYInputValue}
            onChange={e => setPoseYInputValue(e.target.value)}
            onMouseEnter={() => setHoveringInputY(true)}
            onMouseLeave={() => setHoveringInputY(false)}
            style={{ ...inputXYStyle, ...inputHoverYStyle }}
          />
      </div>
      <button
        style={{ ...buttonStyle, ...buttonPoseHoverStyle}}
        onClick={callRouteNavigationByPose}
        disabled={loadingPoseButton}
        onMouseEnter={() => setHoveringButtonPose(true)}
        onMouseLeave={() => setHoveringButtonPose(false)}
      >
        {loadingPoseButton ? "Requesting…" : "Request by Pose"}
      </button>

      {/* By ID */}
      <div style={rowStyle}>
        <label htmlFor="goal-node-id" style={labelTextStyle}>Goal node ID:</label>
      </div>
      <div style={rowStyle}>
        <input
          id="goal-node-id"
          type="number"
          value={nodeIDInputValue}
          onChange={e => setNodeIDInputValue(e.target.value)}
          onMouseEnter={() => setHoveringInputID(true)}
          onMouseLeave={() => setHoveringInputID(false)}
          style={{ ...inputIDStyle, ...inputIDHoverStyle }}
        />
      </div>

      <button
        style={{ ...buttonStyle, ...buttonIDHoverStyle}}
        onClick={callRouteNavigationByID}
        disabled={loadingIDButton}
        onMouseEnter={() => setHoveringButtonID(true)}
        onMouseLeave={() => setHoveringButtonID(false)}
      >
        {loadingIDButton ? "Requesting…" : "Request by ID"}
      </button>

      {/* By name */}
      <div style={rowStyle}>
        <label htmlFor="goal-node-name" style={labelTextStyle}>Goal node name:</label>
      </div>
      <div style={rowStyle}>
        <input
          id="goal-node-name"
          type="text"
          value={nodeNameInputValue}
          onChange={e => setNodeNameInputValue(e.target.value)}
          onMouseEnter={() => setHoveringInputName(true)}
          onMouseLeave={() => setHoveringInputName(false)}
          style={{ ...inputNameStyle, ...inputNameHoverStyle }}
        />
      </div>

      <button
        style={{ ...buttonStyle, ...buttonNameHoverStyle}}
        onClick={callRouteNavigationByName}
        disabled={loadingNameButton}
        onMouseEnter={() => setHoveringButtonName(true)}
        onMouseLeave={() => setHoveringButtonName(false)}
      >
        {loadingIDButton ? "Requesting…" : "Request by Name"}
      </button>

      {error && (
        <div style={{ color: "crimson", marginTop: 8 }}>{error}</div>
      )}

      {response && (
        <pre style={{ marginTop: 12 }}>
          {JSON.stringify(response, null, 2)}
        </pre>
      )}
    </div>
  );
}

export function initRouteNavigationPanel(context: PanelExtensionContext): () => void {
  const root = createRoot(context.panelElement);
  root.render(<RouteNavigationPanel context={context} />);

  return () => {
    root.unmount();
  };
}
