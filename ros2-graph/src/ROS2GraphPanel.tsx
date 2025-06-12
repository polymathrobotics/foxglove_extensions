import { PanelExtensionContext } from "@foxglove/extension";
import { useState } from "react";
import { createRoot } from "react-dom/client";

import "reactflow/dist/style.css";


// Custom
import type { 
  ROS2GraphMessage,
  GetROS2GraphResponse,
 } from "./ROS2GraphData"
import { TreeViewComponent } from "./ListView"
import { GraphViewComponent } from "./GraphView";


function ROS2GraphPanel({ context }: { context: PanelExtensionContext }) {
  const [graphData, setGraphData] = useState<ROS2GraphMessage>();
  const [hoveringButton, setHoveringButton] = useState(false);
  const [loadingButton, setLoadingButton] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "graph">("graph");
  const [hoveringListViewTab, setHoveringListViewTab] = useState(false);
  const [hoveringGraphViewTab, setHoveringGraphViewTab] = useState(false);
  context;

  const callGetROS2Graph = async () => {
    setLoadingButton(true);
    setGraphData(undefined);

    // Call service
    try {
      const raw = await context.callService?.("/get_ros2_graph", {});
      const res = raw as GetROS2GraphResponse;
      if (res?.success && res.message) {
        const parsed: ROS2GraphMessage = JSON.parse(res.message);
        setGraphData(parsed);
      }
    } catch (err) {} 
    finally {
      setLoadingButton(false);
    }
  };

  const blockStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    flexShrink: 1,
    borderRadius: 4,
    overflowX: "auto",
    whiteSpace: "nowrap",
    maxWidth: "100%",
    maxHeight: "100%",
    height: "100%",
    padding: "10px",
    border: "1px solid gray",
    placeSelf: "stretch",
    overflowY: "auto",
  };

  const buttonStyle: React.CSSProperties = {
    display: "flex",
    placeSelf: "center",
    flexShrink: 1,
    overflow: "hidden", 
    textOverflow: "ellipsis",
    maxWidth: "70%",
    whiteSpace: "nowrap",
    padding: "10px 30px",
    border: "none",
    borderRadius: 2,
    backgroundColor: "#0079ca",
    fontSize: "0.73rem",
    fontWeight: "bold",
    color: "#fff",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
    marginTop: 20,
    marginBottom: 20,
  };
  const buttonHoverStyle: React.CSSProperties = hoveringButton
    ? { backgroundColor: "#006bb3" } : {};
  
  const viewTabStyle: React.CSSProperties = {
    display: "flex",
    placeSelf: "center",
    flexShrink: 1,
    overflow: "hidden", 
    textOverflow: "ellipsis",
    maxWidth: "100%",
    width: "fit-content",
    height: "fit-content",
    whiteSpace: "nowrap",
    padding: "4px 8px",
    border: "none",
    borderRadius: 2,
    backgroundColor: "transparent",
    fontSize: "0.73rem",
    color: "#888",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
    marginTop: 15,
  };
  const listViewTabHoverStyle: React.CSSProperties = hoveringListViewTab
    ? { backgroundColor: "#1f1f26" } : {};
  const graphViewTabHoverStyle: React.CSSProperties = hoveringGraphViewTab
    ? { backgroundColor: "#1f1f26" } : {};

  return (
    <div style={{ 
      height: "100%", 
      display: "flex", 
      flexDirection: "column",
      paddingLeft: "2em",
      paddingRight: "2em",
      paddingTop: "1em",
      paddingBottom: "1em",
      width: "100%",
      }}>

      {/* Tab Selector */}
      <div style={{ display: "flex" }}>
        <button
          style={{ 
            ...viewTabStyle, 
            ...graphViewTabHoverStyle, 
            backgroundColor: viewMode === "graph" || hoveringGraphViewTab ? "#1f1f26" : "transparent",
            color: viewMode === "graph" ? "#fff" : "#888",
          }}
          onClick={() => setViewMode("graph")}
          onMouseEnter={() => setHoveringGraphViewTab(true)}
          onMouseLeave={() => setHoveringGraphViewTab(false)}
          >Graph View</button>
        <button 
          style={{ 
            ...viewTabStyle, 
            ...listViewTabHoverStyle,
            backgroundColor: viewMode === "list" || hoveringListViewTab ? "#1f1f26" : "transparent",
            color: viewMode === "list" ? "#fff" : "#888",
          }}
          onClick={() => setViewMode("list")}
          onMouseEnter={() => setHoveringListViewTab(true)}
          onMouseLeave={() => setHoveringListViewTab(false)}
          >List View</button>
      </div>

      <div style={blockStyle}>
        {/* Active View */}
        <div style={{ flex: 1, overflow: "auto" }}>
          {viewMode === "graph" ? (
            <GraphViewComponent graphData={graphData} />
          ) : (
            <TreeViewComponent graphData={graphData} />
          )}
        </div>
      </div>

      <div>
        <button
          style={{ 
            ...buttonStyle, 
            ...buttonHoverStyle, 
          }}
          onClick={callGetROS2Graph}
          disabled={loadingButton}
          onMouseEnter={() => setHoveringButton(true)}
          onMouseLeave={() => setHoveringButton(false)}
        >
          {loadingButton ? "Loading…" : "Refresh Graph"}
        </button>
      </div>
    </div>
  );
}

export function initROS2GraphPanel(context: PanelExtensionContext): () => void {
  const root = createRoot(context.panelElement);
  root.render(<ROS2GraphPanel context={context} />);

  // Return a function to run when the panel is removed
  return () => {
    root.unmount();
  };
}
