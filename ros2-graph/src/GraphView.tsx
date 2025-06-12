import { useState, useEffect, useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
  Edge,
  Node,
  Position,
  applyNodeChanges,
} from "reactflow";
import dagre from "dagre";

import type { ROS2GraphMessage } from "./ROS2GraphData"

const nodeMinWidth = 180;

function estimateNodeSize(label: string): { width: number; height: number } {
  const padding = 30;
  const charWidth = 8;
  var width = label.length * charWidth + padding;
  const height = 40;
  width = Math.max(width, nodeMinWidth);

  return { width, height };
}

function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  direction: "LR" | "TB" = "LR"
): { nodes: Node[]; edges: Edge[] } {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  
  g.setGraph({ 
    rankdir: direction,
    nodesep: 50,
    ranksep: 80,
  });

  for (const node of nodes) {
    const label = typeof node.data?.label === "string" ? node.data.label : "";
    const { width, height } = estimateNodeSize(label); 
    g.setNode(node.id, { width, height });
  }

  for (const edge of edges) {
    g.setEdge(edge.source, edge.target);
  }

  dagre.layout(g);

  const layoutedNodes = nodes.map((node) => {
    const pos = g.node(node.id);
    const { width, height } = g.node(node.id);
    return {
      ...node,
      position: {
        x: pos.x - width / 2,
        y: pos.y - height / 2,
      },
      sourcePosition: direction === "LR" ? Position.Right : Position.Bottom,
      targetPosition: direction === "LR" ? Position.Left : Position.Top,
      style: {
        ...node.style,
        width: width,
        height: height,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}

export function GraphViewComponent({ graphData }: { graphData: ROS2GraphMessage | undefined }) {
  if (!graphData || !graphData.nodes) return <div style={{ fontStyle: "italic", color: "#888" }}>No graph data available</div>;

  const [hideDeadSinks, setHideDeadSinks] = useState(true);
  const [hideLeafTopics, setHideLeafTopics] = useState(true);
  const [hideTF, setHideTF] = useState(true);
  const [hideRosInternal, setHideRosInternal] = useState(true);
  const [hideTopicStatistics, setHideTopicStatistics] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // State for nodes and edges
  const [rfNodes, setRfNodes] = useState<Node[]>([]);
  const [rfEdges, setRfEdges] = useState<Edge[]>([]);

  // Recompute layout only when data or filters change
  useEffect(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const topicNodeIds = new Set<string>();

    graphData.nodes.forEach((rosNode, idx) => {
      if (hideTF && rosNode.name.startsWith("/transform_listener_impl")) {
        return;
      }
      idx;
      nodes.push({
        id: `node:${rosNode.name}`,
        data: { label: rosNode.name },
        position: {x: 0, y: 0},
        draggable: true,
        style: {
          background: "#2a4365",
          color: "#fff",
          borderRadius: 4,
          border: selectedNodeId === `node:${rosNode.name}` 
            ? "3px solid #ccc" 
            : "1px solid #ccc",
          fontSize: 14,
        },
      });
      rosNode.publications.forEach((pub, i) => {
        const topicId = `topic:${pub.name}`;
        topicNodeIds.add(pub.name);
        edges.push({
          id: `pub:${rosNode.name}->${pub.name}:${i}`,
          source: `node:${rosNode.name}`,
          target: topicId,
        });
      });
      rosNode.subscriptions.forEach((sub, i) => {
        const topicId = `topic:${sub.name}`;
        topicNodeIds.add(sub.name);
        edges.push({
          id: `sub:${sub.name}->${rosNode.name}:${i}`,
          source: topicId,
          target: `node:${rosNode.name}`,
        });
      });
    });
    let topicIdx = 0;
    const visibleTopicNames = new Set<string>();
    for (const topicName of topicNodeIds) {
      const pubCount = edges.filter(e => e.source === `node:${topicName}` || e.source === `topic:${topicName}`).length;
      const subCount = edges.filter(e => e.target === `node:${topicName}` || e.target === `topic:${topicName}`).length;
      const isTF = topicName === "/tf" || topicName === "/tf_static";
      const isInternal = topicName === "/rosout" || topicName === "/parameter_events" || topicName === "/bond";
      const isLeaf = subCount === 0;
      const isDead = pubCount === 0;
      const isTopicStatistics = topicName === "/topic_statistics"
      if ((hideTF && isTF) ||
          (hideRosInternal && isInternal) ||
          (hideLeafTopics && isLeaf) ||
          (hideDeadSinks && isDead) ||
          (hideTopicStatistics && isTopicStatistics)) {
        continue; 
      }
      visibleTopicNames.add(topicName);
      nodes.push({
        id: `topic:${topicName}`,
        data: { label: topicName },
        position: {x: 0, y: 0},
        style: {
          background: "#444",
          color: "#fff",
          border: selectedNodeId === `topic:${topicName}`  
            ? "3px solid #ccc" 
            : "1px solid #888",
          fontSize: 12,
          borderRadius: 4,
        },
      });
      topicIdx++;
    }
    const visibleNodeIds = new Set(nodes.map(n => n.id));
    const nodeFilteredEdges = edges.filter(
      (e) => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target)
    );
    const filteredEdges = nodeFilteredEdges.filter((e) => {
      const sourceTopic = e.source.startsWith("topic:") ? e.source.slice(6) : null;
      const targetTopic = e.target.startsWith("topic:") ? e.target.slice(6) : null;
      if (sourceTopic && !visibleTopicNames.has(sourceTopic)) return false;
      if (targetTopic && !visibleTopicNames.has(targetTopic)) return false;
      return true;
    });
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, filteredEdges);
    setRfNodes(layoutedNodes);
    setRfEdges(layoutedEdges);
  }, [graphData, hideDeadSinks, hideLeafTopics, hideTF, hideRosInternal, hideTopicStatistics]);

  const getEdgeStyle = (edge: Edge): React.CSSProperties => {
    if (!selectedNodeId) return ({
      stroke: "#999",
      strokeWidth: 1.5,
    });
    return {
      stroke: edge.target === selectedNodeId ? "#00bfff" : edge.source === selectedNodeId ? "yellow" : "#999",
      strokeWidth: edge.source === selectedNodeId || edge.target === selectedNodeId ? 3.5 : 1.5,
      animationDuration: edge.source === selectedNodeId || edge.target === selectedNodeId ? "0.3s" : "",
    };
  };
  const styledEdges = rfEdges.map((edge) => ({
    ...edge,
    style: getEdgeStyle(edge),
  }));

  // Highlight nodes based on selectedNodeId (always up-to-date)
  const styledNodes = rfNodes.map((node) => {
    let border = node.style?.border;
    if (node.id.startsWith("node:")) {
      border = selectedNodeId === node.id ? "3px solid #ccc" : "1px solid #ccc";
    } else if (node.id.startsWith("topic:")) {
      border = selectedNodeId === node.id ? "3px solid #ccc" : "1px solid #888";
    }
    return {
      ...node,
      style: {
        ...node.style,
        border,
      },
    };
  });

  // Handle node drag
  const onNodesChange = useCallback((changes: any) => {
    setRfNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  // Get searchable IDs for search functionality
  const searchableIds = styledNodes.map((n) => n.id);

  return (
    <div style={{ 
      width: "100%", 
      height: "100%", 
      overflow: "hidden", 
      position: "relative",
      }}>
      <div style={{ 
        display: "flex",
        gap: 4,
        fontSize: 14,
        paddingBottom: 12,
        color: "gray",
        overflow: "hidden",
        whiteSpace: "nowrap",
      }}>
        <label><input type="checkbox" checked={hideDeadSinks} onChange={() => setHideDeadSinks(!hideDeadSinks)} /> Hide dead sinks</label>
        <label><input type="checkbox" checked={hideLeafTopics} onChange={() => setHideLeafTopics(!hideLeafTopics)} /> Hide leaf topics</label>
        <label><input type="checkbox" checked={hideTF} onChange={() => setHideTF(!hideTF)} /> Hide TF</label>
        <label><input type="checkbox" checked={hideRosInternal} onChange={() => setHideRosInternal(!hideRosInternal)} /> Hide ROS internal</label>
        <label><input type="checkbox" checked={hideTopicStatistics} onChange={() => setHideTopicStatistics(!hideTopicStatistics)} /> Hide Topic Statistics</label>
      
        {/* Search bar */}
        <input
          type="text"
          placeholder="Search node/topic..."
          value={searchQuery}
          onChange={(e) => {
            const query = e.target.value;
            setSearchQuery(query);

            if (query.length === 0) {
              setShowSuggestions(false);
              return;
            }

            const filtered = searchableIds.filter((id) =>
              id.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredSuggestions(filtered);
            setShowSuggestions(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && searchQuery.trim()) {
              const match = styledNodes.find((n) =>
                n.id.includes(searchQuery.trim())
              );
              if (match) {
                setSelectedNodeId(match.id);
              }
            }
          }}
          style={{
            width: "18%",
            padding: "2px 4px",
            marginLeft: "auto",
            backgroundColor: "transparent",
            color: "gray",
            fontSize: 12,
            overflow: "hidden",
            textOverflow: "ellipsis",
            borderRadius: 4,
            border: "0px solid #ccc",
            whiteSpace: "nowrap",
            outline: "none",
            boxShadow: "none",
          }}
        />

        {/* Suggestions drop down */}
        {showSuggestions && filteredSuggestions.length > 0 && (
        <div style={{
          position: "absolute",
          top: 26,
          right: 0,
          width: "18%",
          background: "rgba(0, 0, 0, 0.3)",
          color: "#ccc",
          border: "0px solid #444",
          zIndex: 10,
          maxHeight: "200px",
          overflowY: "auto",
          fontSize: 12,
        }}>
          {filteredSuggestions.map((suggestion) => (
            <div
              key={suggestion}
              style={{
                padding: "6px 10px",
                cursor: "pointer",
                borderBottom: "1px solid #333",
              }}
              onClick={() => {
                setSelectedNodeId(suggestion);
                setSearchQuery(suggestion);
                setShowSuggestions(false);
              }}
              onMouseDown={(e) => e.preventDefault()}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
      </div>
      
      <ReactFlow
        nodes={styledNodes}
        edges={styledEdges}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: "#999" },
          labelStyle: { fontSize: 10, fill: "#aaa" },
          type: "smoothstep",
        }}
        onNodeClick={(event, node) => {
          event.stopPropagation();
          setSelectedNodeId(node.id);
        }}
        onPaneClick={() => setSelectedNodeId(null)}
        onNodesChange={onNodesChange}
      >
        <Background />
        <Controls
          style={{ 
            position: "absolute",
            bottom: 35,
          }}
        />
      </ReactFlow>

      {/* Selected Node/Topic Info Panel */}
      {selectedNodeId && (
        <div style={{
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
        }}>
          {selectedNodeId.startsWith("node:") && (
            <>
              <div style={{
                fontSize: 16,
                fontWeight: "bold",
                marginBottom: "10px",
              }}>{selectedNodeId.slice(5)}</div>

              {/* List all of node's publishers */}
              {graphData?.nodes.find(n => `node:${n.name}` === selectedNodeId)?.publications.length ? (
                <>
                  <div><b>Publishers: </b></div>
                  <ul style={{ paddingLeft: "1em", margin: 0 }}>
                    {graphData?.nodes.find(n => `node:${n.name}` === selectedNodeId)?.publications.map((pub) => (
                      <li key={pub.name}>
                        <b>{pub.name}</b> ({pub.types.join(", ")})
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
              
              {/* List all of node's subscribers */}
              {graphData?.nodes.find(n => `node:${n.name}` === selectedNodeId)?.subscriptions.length ? (
                <>
                  <div><b>Subscribers: </b></div>
                  <ul style={{ paddingLeft: "1em", margin: 0 }}>
                    {graphData?.nodes.find(n => `node:${n.name}` === selectedNodeId)?.subscriptions.map((sub) => (
                      <li key={sub.name}>
                        <b>{sub.name}</b> ({sub.types.join(", ")})
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}

              {/* List all of node's services */}
              {graphData?.nodes.find(n => `node:${n.name}` === selectedNodeId)?.services.length ? (
                <>
                  <div><b>Services: </b></div>
                  <ul style={{ paddingLeft: "1em", margin: 0 }}>
                    {graphData?.nodes.find(n => `node:${n.name}` === selectedNodeId)?.services.map((srv) => (
                      <li key={srv.name}>
                        <b>{srv.name}</b> ({srv.types.join(", ")})
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}

              {/* List all of node's clients */}
              {graphData?.nodes.find(n => `node:${n.name}` === selectedNodeId)?.clients.length ? (
                <>
                  <div><b>Clients: </b></div>
                  <ul style={{ paddingLeft: "1em", margin: 0 }}>
                    {graphData?.nodes.find(n => `node:${n.name}` === selectedNodeId)?.clients.map((cli) => (
                      <li key={cli.name}>
                        <b>{cli.name}</b> ({cli.types.join(", ")})
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </>
          )}
          
          {selectedNodeId.startsWith("topic:") && (
            <>
              <div style={{
                fontSize: 16,
                fontWeight: "bold",
                marginBottom: "10px",
              }}>{selectedNodeId.slice(6)}</div>

              {/* List topic type */}
              <div style={{
                marginBottom: "10px",
              }}>
                {graphData?.nodes.filter(n => n.publications.some(pub => `topic:${pub.name}` === selectedNodeId)).map((node) => (
                  node.publications.filter(pub => `topic:${pub.name}` === selectedNodeId).map((pub) => (
                    <>{pub.types.join(", ")}</>
                  ))
                ))}
              </div>

              {/* List all of topic's publishers */}
              {(() => {
                const publishers = graphData?.nodes.flatMap(n =>
                  n.publications.filter(pub => `topic:${pub.name}` === selectedNodeId).map(pub => ({ node: n, pub }))
                ) || [];
                return publishers.length ? (
                  <>
                    <div><b>Publishers: </b></div>
                    <ul style={{ paddingLeft: "1em", margin: 0 }}>
                      {publishers.map(({ node, pub }) => (
                        <li key={node.name + pub.name}>
                          <b>{node.name}</b>
                          <ul style={{ paddingLeft: "1em", margin: 0 }}>
                            {Object.entries(pub.qos).map(([key, value]) => (
                              <li key={key}>{key}: {value}</li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : null;
              })()}
              {/* List all of topic's subscribers */}
              {(() => {
                const subscribers = graphData?.nodes.flatMap(n =>
                  n.subscriptions.filter(sub => `topic:${sub.name}` === selectedNodeId).map(sub => ({ node: n, sub }))
                ) || [];
                return subscribers.length ? (
                  <>
                    <div><b>Subscribers: </b></div>
                    <ul style={{ paddingLeft: "1em", margin: 0 }}>
                      {subscribers.map(({ node, sub }) => (
                        <li key={node.name + sub.name}>
                          <b>{node.name}</b>
                          <ul style={{ paddingLeft: "1em", margin: 0 }}>
                            {Object.entries(sub.qos).map(([key, value]) => (
                              <li key={key}>{key}: {value}</li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : null;
              })()}
            </>
          )}
        </div>
      )}
    </div>
  );
}