import { PanelExtensionContext } from "@foxglove/extension";
import { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { 
  CortexModifyCommandRequest, 
  CortexFlowCommandRequest,
  CortexCommandResponse 
} from "./CortexCommands";
import { formatUtcTimestampToLocalString } from "./utils";
import { 
  CortexFeedback,
  getCortexStatusColor,
  getCortexStatusEnum
 } from "./CortexFeedback";
import {
  TreeView
} from "./TreeView"


// Panel method
function CortexPanel({ context }: { context: PanelExtensionContext }) {
  const [error, setError] = useState<string>();
  const [modify_command_response, setModifyCommandResponse] = useState<CortexCommandResponse | null>(null);
  const [flow_command_response, setFlowCommandResponse] = useState<CortexCommandResponse | null>(null);

  const frame_id_restored =
    typeof context.initialState === "object" &&
    context.initialState !== null &&
    "frame_id" in context.initialState
      ? String((context.initialState as any).frame_id)
      : "";
  const [frameIDInputValue, setFrameIDInputValue] = useState<string>(frame_id_restored);
  const [hoveringInputFrameID, setHoveringInputFrameID] = useState(false);

  const pos_x_restored =
    typeof context.initialState === "object" &&
    context.initialState !== null &&
    "pos_x" in context.initialState
      ? String((context.initialState as any).pos_x)
      : "";
  const [posXInputValue, setPosXInputValue] = useState<string>(pos_x_restored);
  const [hoveringInputPosX, setHoveringInputPosX] = useState(false);

  const pos_y_restored =
    typeof context.initialState === "object" &&
    context.initialState !== null &&
    "pos_y" in context.initialState
      ? String((context.initialState as any).pos_y)
      : "";
  const [posYInputValue, setPosYInputValue] = useState<string>(pos_y_restored);
  const [hoveringInputPosY, setHoveringInputPosY] = useState(false);

  const orientation_x_restored =
    typeof context.initialState === "object" &&
    context.initialState !== null &&
    "orientation_x" in context.initialState
      ? String((context.initialState as any).orientation_x)
      : "";
  const [orientationXInputValue, setOrientationXInputValue] = useState<string>(orientation_x_restored);
  const [hoveringInputOrientationX, setHoveringInputOrientationX] = useState(false);

  const orientation_y_restored =
    typeof context.initialState === "object" &&
    context.initialState !== null &&
    "orientation_y" in context.initialState
      ? String((context.initialState as any).orientation_y)
      : "";
  const [orientationYInputValue, setOrientationYInputValue] = useState<string>(orientation_y_restored);
  const [hoveringInputOrientationY, setHoveringInputOrientationY] = useState(false);

  const orientation_z_restored =
    typeof context.initialState === "object" &&
    context.initialState !== null &&
    "orientation_z" in context.initialState
      ? String((context.initialState as any).orientation_z)
      : "";
  const [orientationZInputValue, setOrientationZInputValue] = useState<string>(orientation_z_restored);
  const [hoveringInputOrientationZ, setHoveringInputOrientationZ] = useState(false);

  const orientation_w_restored =
    typeof context.initialState === "object" &&
    context.initialState !== null &&
    "orientation_w" in context.initialState
      ? String((context.initialState as any).orientation_w)
      : "";
  const [orientationWInputValue, setOrientationWInputValue] = useState<string>(orientation_w_restored);
  const [hoveringInputOrientationW, setHoveringInputOrientationW] = useState(false);

  const [addCommandHoveringButton, setAddCommandHoveringButton] = useState(false);
  const [loadingAddCommandButton, setLoadingAddCommandButton] = useState(false);
  const [stopHoveringButton, setStopHoveringButton] = useState(false);
  const [loadingStopButton, setLoadingStopButton] = useState(false);
  const [pauseHoveringButton, setPauseHoveringButton] = useState(false);
  const [loadingPauseButton, setLoadingPauseButton] = useState(false);
  const [resumeHoveringButton, setResumeHoveringButton] = useState(false);
  const [loadingResumeButton, setLoadingResumeButton] = useState(false);
  const [loadingFlowButtons, setLoadingFlowButtons] = useState(false);

  // Feedback subscription
  const [cortexFeedback, setCortexFeedback] = useState<CortexFeedback | null>(null);

  useEffect(() => {
    context.subscribe && context.subscribe([{ topic: "/cortex/feedback" }]);
    context.watch && context.watch("currentFrame");
  }, [context]);

  useEffect(() => {
    context.onRender = (renderState, done) => {
      const feedbackMsg = renderState.currentFrame?.find(
        (msg) => msg.topic === "/cortex/feedback"
      );
      
      if (feedbackMsg?.message) {
        setCortexFeedback(feedbackMsg.message as CortexFeedback);
      }
      done();
    };
  }, [context]);

  // Service calls
  const callCortexModifyCommandService = async () => {
    setLoadingAddCommandButton(true);
    setError(undefined);
    setModifyCommandResponse(null);

    // Parse & guard for input
    const parsed_pos_x_val = parseFloat(posXInputValue);
    const parsed_pos_y_val = parseFloat(posYInputValue);
    const parsed_orientation_x_val = parseFloat(orientationXInputValue);
    const parsed_orientation_y_val = parseFloat(orientationYInputValue);
    const parsed_orientation_z_val = parseFloat(orientationZInputValue);
    const parsed_orientation_w_val = parseFloat(orientationWInputValue);

    if (isNaN(parsed_pos_x_val) || 
        isNaN(parsed_pos_y_val) || 
        isNaN(parsed_orientation_x_val) || 
        isNaN(parsed_orientation_y_val) || 
        isNaN(parsed_orientation_z_val) ||
        isNaN(parsed_orientation_w_val)
      ) {
      setError("Please enter a valid pose value");
      setLoadingAddCommandButton(false);
      return;
    }
    const parsed_frame_id_val = frameIDInputValue.trim();
    if (!parsed_frame_id_val) {
      setError("Please enter a valid frame ID");
      setLoadingAddCommandButton(false);
      return;
    }

    // Fill in request message
    const request: CortexModifyCommandRequest = {
      mode: 0,
      commands: [{
        type: 2,
        navigation: {
          type: 1,
          relative_path: {
            poses: [{
              header: {
                frame_id: parsed_frame_id_val
              },
              pose: {
                position: {
                  x: parsed_pos_x_val,
                  y: parsed_pos_y_val
                },
                orientation: {
                  x: parsed_orientation_x_val,
                  y: parsed_orientation_y_val,
                  z: parsed_orientation_z_val,
                  w: parsed_orientation_w_val
                }
              }
            }]
          }
        }
      }]
    }

    // Call service
    try {
      const raw = await context.callService?.("/cortex/modify_command", request);
      const res = raw as CortexCommandResponse;
      if(res){
        setModifyCommandResponse(res);
        setError(undefined);
      }
      setError(undefined);
      context.saveState({ frame_id: parsed_frame_id_val });
      context.saveState({ pos_x: parsed_pos_x_val });
      context.saveState({ pos_y: parsed_pos_y_val });
      context.saveState({ orientation_x: parsed_orientation_x_val });
      context.saveState({ orientation_y: parsed_orientation_y_val });
      context.saveState({ orientation_z: parsed_orientation_z_val });
      context.saveState({ orientation_w: parsed_orientation_w_val });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoadingAddCommandButton(false);
    }
  }

  const callCortexFlowCommandService = async (flow_command_val: number) => {
    // Check if flow command is set
    if (flow_command_val === -1) {
      setError("Please select a flow command (Stop, Pause, Resume)");
      return;
    }

    // Check if flow command is valid
    if (![0, 1, 2].includes(flow_command_val)) {
      setError("Invalid flow command value");
      return;
    }

    setError(undefined);
    setFlowCommandResponse(null);

    setLoadingFlowButtons(true);

    if(flow_command_val === 0) setLoadingStopButton(true);
    if(flow_command_val === 1) setLoadingPauseButton(true);
    if(flow_command_val === 2) setLoadingResumeButton(true);

    const request: CortexFlowCommandRequest = {
      command: {
        command: flow_command_val
      }
    };

    // Call service
    try {
      const raw = await context.callService?.("/cortex/flow_command", request);
      const res = raw as CortexCommandResponse;
      if(res){
        setFlowCommandResponse(res);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoadingFlowButtons(false);
      setLoadingStopButton(false);
      setLoadingPauseButton(false);
      setLoadingResumeButton(false);
    }
  }

  // Styles ------------------
  const panelStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
    padding: 24,
    gridAutoRows: "minmax(0, auto)",

    height: "100%",
    overflowY: "auto",
  };
  const titleStyle: React.CSSProperties = {
    whiteSpace: "nowrap",
    overflow: "hidden", 
    textOverflow: "ellipsis",
    fontSize: 18,
    maxWidth: "100%",
    fontWeight: "bold",
    marginBottom: "10px",
  };
  const labelTextStyle: React.CSSProperties = {
    whiteSpace: "nowrap",
    overflow: "hidden", 
    textOverflow: "ellipsis",
    maxWidth: "100%",
    paddingLeft: "5px",
    paddingBottom: "5px",
    marginTop: "5px",
  };

  const commonCellStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    borderRadius: 4,
    resize: "vertical",
  };

  const inputDataStyle: React.CSSProperties = {
    flex: 1, 
    border: "1px solid #ccc",
    fontFamily: "monospace",
    fontSize: 12,
    lineHeight: 1.4,
    borderRadius: 4,
    background: "var(--foxglove-panel-surface)",
    color: "var(--foxglove-text-primary)",
    resize: "vertical",
    outline: "none",
    textAlign: "center",
    alignSelf: "stretch",
    marginBottom: 4,

    maxWidth: "100%",
    overflow: "hidden", 
    textOverflow: "ellipsis",
  };
  const inputFrameIDHoverStyle: React.CSSProperties = hoveringInputFrameID ? {
    borderColor: "#fff",
  } : {};
  const inputPosXHoverStyle: React.CSSProperties = hoveringInputPosX ? {
    borderColor: "#fff",
  } : {};
  const inputPosYHoverStyle: React.CSSProperties = hoveringInputPosY ? {
    borderColor: "#fff",
  } : {};
  const inputOrientationXHoverStyle: React.CSSProperties = hoveringInputOrientationX ? {
    borderColor: "#fff",
  } : {};
  const inputOrientationYHoverStyle: React.CSSProperties = hoveringInputOrientationY ? {
    borderColor: "#fff",
  } : {};
  const inputOrientationZHoverStyle: React.CSSProperties = hoveringInputOrientationZ ? {
    borderColor: "#fff",
  } : {};
  const inputOrientationWHoverStyle: React.CSSProperties = hoveringInputOrientationW ? {
    borderColor: "#fff",
  } : {};

  const addCommandButtonStyle: React.CSSProperties = {
    alignSelf: "center",
    flexShrink: 1,
    overflow: "hidden", 
    textOverflow: "ellipsis",
    maxWidth: "70%",
    whiteSpace: "nowrap",
    padding: "10px 10px",
    border: "none",
    borderRadius: 2,
    backgroundColor: "#00b409",
    fontSize: "0.73rem",
    fontWeight: "bold",
    color: "#fff",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
    marginTop: "20px",
    marginBottom: "20px",
    width: "70%",
  };
  const addCommandButtonHoverStyle: React.CSSProperties = addCommandHoveringButton
    ? { backgroundColor: "#018c08" } : {};
  const addCommandButtonLoadingStyle: React.CSSProperties = loadingAddCommandButton
    ? { backgroundColor: "gray" } : {};

  const stopButtonStyle: React.CSSProperties = {
    alignSelf: "center",
    flexShrink: 1,
    overflow: "hidden", 
    textOverflow: "ellipsis",
    maxWidth: "70%",
    whiteSpace: "nowrap",
    padding: "10px 10px",
    border: "none",
    borderRadius: 2,
    backgroundColor: "#dd0000",
    fontSize: "0.73rem",
    fontWeight: "bold",
    color: "#fff",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
    marginTop: "10px",
    width: "70%",
  };
  const stopButtonHoverStyle: React.CSSProperties = stopHoveringButton
    ? { backgroundColor: "#ba0000" } : {};
  const stopButtonLoadingStyle: React.CSSProperties = loadingStopButton || loadingFlowButtons
    ? { backgroundColor: "gray" } : {};

  const pauseButtonStyle: React.CSSProperties = {
    alignSelf: "center",
    flexShrink: 1,
    overflow: "hidden", 
    textOverflow: "ellipsis",
    maxWidth: "70%",
    whiteSpace: "nowrap",
    padding: "10px 10px",
    border: "none",
    borderRadius: 2,
    backgroundColor: "#ffd700",
    fontSize: "0.73rem",
    fontWeight: "bold",
    color: "black",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
    marginTop: "10px",
    width: "70%",
  };
  const pauseButtonHoverStyle: React.CSSProperties = pauseHoveringButton
    ? { backgroundColor: "#c9aa02" } : {};
  const pauseButtonLoadingStyle: React.CSSProperties = loadingPauseButton || loadingFlowButtons
    ? { backgroundColor: "gray", color: "#fff", } : {};

  const resumeButtonStyle: React.CSSProperties = {
    alignSelf: "center",
    flexShrink: 1,
    overflow: "hidden", 
    textOverflow: "ellipsis",
    maxWidth: "70%",
    whiteSpace: "nowrap",
    padding: "10px 10px",
    border: "none",
    borderRadius: 2,
    backgroundColor: "#0079ca",
    fontSize: "0.73rem",
    fontWeight: "bold",
    color: "#fff",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
    marginTop: "10px",
    marginBottom: "20px",
    width: "70%",
  };
  const resumeButtonHoverStyle: React.CSSProperties = resumeHoveringButton
    ? { backgroundColor: "#006bb3" } : {};
  const resumeButtonLoadingStyle: React.CSSProperties = loadingResumeButton || loadingFlowButtons
    ? { backgroundColor: "gray" } : {};

  const responseStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    flexShrink: 1,
    borderRadius: 4,
    overflow: "hidden", 
    textOverflow: "ellipsis",
    maxWidth: "90%",
    padding: "20px",
    backgroundColor: "#1f1f26",
    placeSelf: "center",
    minWidth: "90%",
  }

  const blockStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    flexShrink: 1,
    borderRadius: 4,
    overflowX: "hidden",
    maxWidth: "100%",
    maxHeight: "100%",
    minWidth: "0%",
    height: "95%",
    padding: "10px",
    border: "1px solid gray",
    overflowY: "auto",
    gridColumn: "2 / span 1",
    marginBottom: "10px",
    whiteSpace: "wrap",
  };
  // -------------------------


  return (
     <div style={panelStyle}>

      <div style={{gridColumn: "1 / span 1",}}>
        <div style={{...titleStyle, }}>Navigation Command</div>

        <div style={{
          ...commonCellStyle, 
          }}>

          <label style={{...labelTextStyle, fontWeight: "bold",}}>Frame ID</label>
          <div style={{whiteSpace: "nowrap", marginTop: "5px", placeSelf: "center", width: "100%",}}>
            <input
              id="frame_id"
              type="text"
              value={frameIDInputValue}
              onChange={e => setFrameIDInputValue(e.target.value)}
              onMouseEnter={() => setHoveringInputFrameID(true)}
              onMouseLeave={() => setHoveringInputFrameID(false)}
              style={{ 
                ...inputDataStyle , 
                ...inputFrameIDHoverStyle, 
                width: "96%",
                alignSelf: "center",
              }}
            />
          </div>
          
          <label style={{...labelTextStyle, fontWeight: "bold",}}>Position</label>

          <div style={{whiteSpace: "nowrap", marginTop: "5px", placeSelf: "center", width: "70%",}}>
            <label style={{
              ...labelTextStyle, 
              paddingLeft: "15px",
              paddingRight: "22px",
              }}>x:</label>
            <input
              id="pos_x"
              type="number"
              value={posXInputValue}
              onChange={e => setPosXInputValue(e.target.value)}
              onMouseEnter={() => setHoveringInputPosX(true)}
              onMouseLeave={() => setHoveringInputPosX(false)}
              style={{ 
                ...inputDataStyle , 
                ...inputPosXHoverStyle, 
                width: "70%",
              }}
            />
          </div>

          <div style={{whiteSpace: "nowrap", marginTop: "5px", placeSelf: "center", width: "70%",}}>
            <label style={{
              ...labelTextStyle, 
              paddingLeft: "15px",
              paddingRight: "22px",
              }}>y:</label>
            <input
              id="pos_y"
              type="number"
              value={posYInputValue}
              onChange={e => setPosYInputValue(e.target.value)}
              onMouseEnter={() => setHoveringInputPosY(true)}
              onMouseLeave={() => setHoveringInputPosY(false)}
              style={{ 
                ...inputDataStyle , 
                ...inputPosYHoverStyle, 
                width: "70%",
              }}
            />
          </div>

          <label style={{...labelTextStyle, fontWeight: "bold",}}>Orientation</label>

          <div style={{whiteSpace: "nowrap", marginTop: "5px", placeSelf: "center", width: "70%",}}>
            <label style={{
              ...labelTextStyle, 
              paddingLeft: "15px",
              paddingRight: "22px",
              }}>x:</label>
            <input
              id="orientation_x"
              type="number"
              value={orientationXInputValue}
              onChange={e => setOrientationXInputValue(e.target.value)}
              onMouseEnter={() => setHoveringInputOrientationX(true)}
              onMouseLeave={() => setHoveringInputOrientationX(false)}
              style={{ 
                ...inputDataStyle , 
                ...inputOrientationXHoverStyle, 
                width: "70%",
              }}
            />
          </div>

          <div style={{whiteSpace: "nowrap", marginTop: "5px", placeSelf: "center", width: "70%",}}>
            <label style={{
              ...labelTextStyle, 
              paddingLeft: "15px",
              paddingRight: "22px",
              }}>y:</label>
            <input
              id="orientation_y"
              type="number"
              value={orientationYInputValue}
              onChange={e => setOrientationYInputValue(e.target.value)}
              onMouseEnter={() => setHoveringInputOrientationY(true)}
              onMouseLeave={() => setHoveringInputOrientationY(false)}
              style={{ 
                ...inputDataStyle , 
                ...inputOrientationYHoverStyle, 
                width: "70%",
              }}
            />
          </div>

          <div style={{whiteSpace: "nowrap", marginTop: "5px", placeSelf: "center", width: "70%",}}>
            <label style={{
              ...labelTextStyle, 
              paddingLeft: "15px",
              paddingRight: "22px",
              }}>z:</label>
            <input
              id="orientation_z"
              type="number"
              value={orientationZInputValue}
              onChange={e => setOrientationZInputValue(e.target.value)}
              onMouseEnter={() => setHoveringInputOrientationZ(true)}
              onMouseLeave={() => setHoveringInputOrientationZ(false)}
              style={{ 
                ...inputDataStyle , 
                ...inputOrientationZHoverStyle, 
                width: "70%",
              }}
            />
          </div>

          <div style={{whiteSpace: "nowrap", marginTop: "5px", placeSelf: "center", width: "70%",}}>
            <label style={{
              ...labelTextStyle, 
              paddingLeft: "15px",
              paddingRight: "20px",
              }}>w:</label>
            <input
              id="orientation_w"
              type="number"
              value={orientationWInputValue}
              onChange={e => setOrientationWInputValue(e.target.value)}
              onMouseEnter={() => setHoveringInputOrientationW(true)}
              onMouseLeave={() => setHoveringInputOrientationW(false)}
              style={{ 
                ...inputDataStyle , 
                ...inputOrientationWHoverStyle, 
                width: "70%",
              }}
            />
          </div>

          <button
            style={{ 
              ...addCommandButtonStyle, 
              ...addCommandButtonHoverStyle,
              ...addCommandButtonLoadingStyle,
            }}
            onClick={callCortexModifyCommandService}
            disabled={loadingAddCommandButton}
            onMouseEnter={() => setAddCommandHoveringButton(true)}
            onMouseLeave={() => setAddCommandHoveringButton(false)}
          >
            {loadingAddCommandButton ? "Requesting…" : "Add Command"}
          </button>
        
          <label style={{...labelTextStyle, fontWeight: "bold",}}>Response</label>
          {(
            <pre style={{ ...responseStyle }}>
              <div style={{
                overflow: "hidden", 
                textOverflow: "ellipsis",
                }}><strong>success:</strong> {" "}
                {modify_command_response?.success.toString() ?? ""}
              </div>
              <div style={{
                overflow: "hidden", 
                textOverflow: "ellipsis",
                whiteSpace: "wrap",
                }}><strong>message:</strong> {" "}
                {modify_command_response?.message.toString() ?? ""}
              </div>

            </pre>
          )}
        </div>

        <div style={{...commonCellStyle, marginTop: "20px",}}>
          <div style={{...titleStyle, marginTop: "20px",}}>Flow Command</div>
        
          <button
            style={{ 
              ...stopButtonStyle, 
              ...stopButtonHoverStyle,
              ...stopButtonLoadingStyle,
            }}
            onClick={() => callCortexFlowCommandService(0)}
            disabled={loadingStopButton || loadingFlowButtons}
            onMouseEnter={() => setStopHoveringButton(true)}
            onMouseLeave={() => setStopHoveringButton(false)}
          >
            {loadingFlowButtons ? (loadingStopButton ? "Requesting…" : "Stop") : "Stop"}
          </button>

          <button
            style={{ 
              ...pauseButtonStyle, 
              ...pauseButtonHoverStyle,
              ...pauseButtonLoadingStyle,
            }}
            onClick={() => callCortexFlowCommandService(1)}
            disabled={loadingPauseButton || loadingFlowButtons}
            onMouseEnter={() => setPauseHoveringButton(true)}
            onMouseLeave={() => setPauseHoveringButton(false)}
          >
            {loadingFlowButtons ? (loadingPauseButton ? "Requesting…" : "Pause") : "Pause"}
          </button>

          <button
            style={{ 
              ...resumeButtonStyle, 
              ...resumeButtonHoverStyle, 
              ...resumeButtonLoadingStyle,
            }}
            onClick={() => callCortexFlowCommandService(2)}
            disabled={loadingResumeButton || loadingFlowButtons}
            onMouseEnter={() => setResumeHoveringButton(true)}
            onMouseLeave={() => setResumeHoveringButton(false)}
          >
            {loadingFlowButtons ? (loadingResumeButton ? "Requesting…" : "Resume") : "Resume"}
          </button>

          <label style={{...labelTextStyle, fontWeight: "bold",}}>Response</label>
          {(
            <pre style={{ ...responseStyle }}>
              <div style={{
                overflow: "hidden", 
                textOverflow: "ellipsis",
                }}><strong>success:</strong> {" "}
                {flow_command_response?.success.toString() ?? ""}
              </div>
              <div style={{
                overflow: "hidden", 
                textOverflow: "ellipsis",
                whiteSpace: "wrap",
                }}><strong>message:</strong> {" "}
                {flow_command_response?.message.toString() ?? ""}
              </div>

            </pre>
          )}          
        </div>

        {error && (
            <div style={{
              ...commonCellStyle, 
              }}>
              <label style={{
                ...labelTextStyle, 
                fontWeight: "bold",
                color: "crimson", 
                paddingBottom: "0px",
                }}>Error</label>
              <pre style={{ ...responseStyle }}>
                <div style={{ 
                  color: "crimson",
                  gridColumn: "1 / span 1", 
                  overflow: "hidden", 
                  textOverflow: "ellipsis", 
                  whiteSpace: "wrap",
                  }}>{error}</div>
              </pre>
            </div>
          )}
      </div>

      
      <div style={{gridColumn: "2 / span 1",}}>
        <div style={{...titleStyle, }}>Feedback</div>

        <div style={{...blockStyle, }}>
          {cortexFeedback ? (
            <div>
              <div style={{ fontSize: "12px", marginBottom: "2px", color: "GrayText" }}>
                Timestamp (UTC)
              </div>
              <div style={{ fontSize: "12px", marginBottom: "10px", marginLeft: "5px" }}>
                <div style={{marginBottom: 3}}><span style={{color: "GrayText", fontSize: "10px"}}>{formatUtcTimestampToLocalString(cortexFeedback.timestamp_utc.sec, cortexFeedback.timestamp_utc.nsec)}</span></div>
                <div><span style={{color: "#84bdfc"}}>sec </span>  <span style={{color: "#80DA74"}}>{cortexFeedback.timestamp_utc.sec}</span></div>
                <div><span style={{color: "#84bdfc"}}>nsec </span>  <span style={{color: "#80DA74"}}>{cortexFeedback.timestamp_utc.nsec.toString().padStart(9, "0")}</span></div>
              </div>

              <div style={{ fontSize: "12px", marginBottom: "10px", color: "GrayText" }}>
                Cortex Status
              </div>
              <div style={{ fontWeight: "bold", fontSize: "24px", color: getCortexStatusColor(cortexFeedback.cortex_status.status), marginBottom: "4px" }}>
                {getCortexStatusEnum(cortexFeedback.cortex_status.status)}
              </div>

              <div style={{ fontSize: "13px", marginBottom: "15px", color: "#fff" }}>
                {cortexFeedback.cortex_status.description}
              </div>
            
              <TreeView
                data={(() => {
                  const { timestamp_utc, cortex_status, ...rest } = cortexFeedback;
                  return rest;
                })()}
                defaultExpanded={true}
              />
            </div>
          ) : (
            <div style={{ fontStyle: "italic", color: "#888" }}>No feedback available</div>
          )}
        </div>

      </div>

    </div>

  )
}

export function initCortexPanel(context: PanelExtensionContext): () => void {
  const root = createRoot(context.panelElement);
  root.render(<CortexPanel context={context} />);

  return () => {
    root.unmount();
  };
}