import { useState } from "react";
import type { ROS2GraphMessage } from "./ROS2GraphData"

function SubTreeNode({ label, children }: { label: string; children?: React.ReactNode }) {
  const [expanded, setExpanded] = useState(false);
  const [hovering, setHovering] = useState(false);

  const textBoxStyle: React.CSSProperties = {
    cursor: "pointer",
    backgroundColor: (expanded && children) || hovering ? "#1f1f26" : "transparent",
    transition: "background-color 0.2s ease", 
    maxWidth: "100%",
    width: "fit-content",
    minWidth: "fit-content",
    marginTop: "2px",
    overflowX: "auto",
    marginBottom: expanded && children ? "5px" : "0px",
    
    paddingLeft: "9px",
    paddingRight: "10px",
    paddingTop: "2px",
    paddingBottom: "1px",

    borderRadius: "4px",
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: "transparent",
  };

  const textStyle: React.CSSProperties = {
    whiteSpace: "nowrap",
    overflow: "hidden", 
    textOverflow: "ellipsis",
    maxWidth: "100%",

    fontFamily: "monospace",
    fontSize: 15,
  };

  return (
    <div style={{ 
      marginLeft: "1em",
      }}>
      <div style={{
        ...textBoxStyle,
      }}
      onClick={() => setExpanded(!expanded)}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      >
        <div
          style={{ 
            ...textStyle,
            cursor: "pointer", 
            userSelect: "none",
            display: "flex",
            transition: "background-color 0.2s ease", 
          }}
          onClick={() => setExpanded(!expanded)}
        >
            {expanded && children ? "▾ " : (children ? "▸ " : " ")} 

          {label}
        </div>
      </div>
      {expanded && <div>{children}</div>}
    </div>
  );
}

function SubTreeRoot({ label, children }: { label: string; children?: React.ReactNode }) {
  const [expanded, setExpanded] = useState(false);
  const [hovering, setHovering] = useState(false);

  const textBoxStyle: React.CSSProperties = {
    cursor: "pointer",
    backgroundColor: expanded || hovering ? "#1f1f26" : "transparent",
    transition: "background-color 0.2s ease", 
    maxWidth: "100%",
    width: "fit-content",
    minWidth: "fit-content",
    overflowX: "auto",
    marginTop: "2px",
    marginBottom: expanded ? "5px" : "0px",
    
    paddingLeft: "15px",
    paddingRight: "20px",
    paddingTop: "6px",
    paddingBottom: "6px",

    borderRadius: "4px",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: expanded ? "#ccc" : "transparent",
  };

  const textStyle: React.CSSProperties = {
    whiteSpace: "nowrap",
    overflow: "hidden", 
    textOverflow: "ellipsis",
    maxWidth: "100%",

    fontFamily: "monospace",
    fontSize: 16,
  };

  return (
    <div>
      <div style={{
        ...textBoxStyle,
      }}
      onClick={() => setExpanded(!expanded)}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      >
        <div
          style={{ 
            ...textStyle,
            userSelect: "none",
            display: "flex",
          }}
        >
          {label}
        </div>
      </div>

      {expanded && <div>{children}</div>}

    </div>
  );
}

export function TreeViewComponent({ graphData }: { graphData: ROS2GraphMessage | undefined }) {

  return (graphData ? (graphData.nodes.map((node) => (
          <SubTreeRoot key={node.name} label={node.name}>
            <SubTreeNode label="Publishers">
              {node.publications.map((pub) => (
                <SubTreeNode key={pub.name} label={pub.name}>
                  <SubTreeNode label={pub.types.join(",")} />
                  <SubTreeNode label={"QoS"}>
                    {Object.entries(pub.qos).map(([key, value]) => (
                      <SubTreeNode key={key} label={`${key}: ${value}`} />
                    ))}
                  </SubTreeNode>
                </SubTreeNode>
              ))}
            </SubTreeNode>
            <SubTreeNode label="Subscribers">
              {node.subscriptions.map((sub) => (
                <SubTreeNode key={sub.name} label={sub.name}>
                  <SubTreeNode label={sub.types.join(",")} />
                  <SubTreeNode label={"QoS"}>
                    {Object.entries(sub.qos).map(([key, value]) => (
                      <SubTreeNode key={key} label={`${key}: ${value}`} />
                    ))}
                  </SubTreeNode>
                </SubTreeNode>
              ))}
            </SubTreeNode>
            <SubTreeNode label="Services">
              {node.services.map((srv) => (
                <SubTreeNode key={srv.name} label={srv.name}>
                  <SubTreeNode label={srv.types.join(",")} />
                </SubTreeNode>
              ))}
            </SubTreeNode>
            <SubTreeNode label="Clients">
              {node.clients.map((cli) => (
                <SubTreeNode key={cli.name} label={cli.name}>
                  <SubTreeNode label={cli.types.join(",")} />
                </SubTreeNode>
              ))}
            </SubTreeNode>
            {/* <SubTreeNode label="Parameters">
              {node.parameters.map((param) => (
                <SubTreeNode key={param} label={param}/>
              ))}
            </SubTreeNode> */}
          </SubTreeRoot>
        ))) : (
          <div style={{ fontStyle: "italic", color: "#888" }}>No graph data available</div>
        ));
}