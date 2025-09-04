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
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  NodeTypes,
  Handle,
  Position,
  useReactFlow,
} from "@xyflow/react";
import { X } from "lucide-react";
import { ReactElement, useMemo, useCallback, useEffect, useRef } from "react";
import "@xyflow/react/dist/style.css";

import { generateDag, DagNode } from "../dag";
import { TBehaviorTree } from "../types";
import { ElementDetailsPopup } from "./ElementDetailsPopup";
import { useGraphContext, SelectedElement } from "./GraphContextProvider";
import { getNodeColor } from "../utils/nodeStyles";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";

import { UUID_KEY } from "@/constants";

interface GraphProps {
  behaviorTree: TBehaviorTree | null;
}

// Custom node component for behavior tree nodes
function BehaviorTreeNode({ data }: { data: DagNode }) {
  const { selectedElement, matchedNodeIds } = useGraphContext();
  const isSelected = selectedElement?.id === data.id;
  const isMatched = matchedNodeIds.has(data.id);
  const nodeColorScheme = getNodeColor(data.model);
  const nodeClassName = isSelected
    ? nodeColorScheme.nodeStyles.selected
    : nodeColorScheme.nodeStyles.default;
  const uuid = data.attributes?.[UUID_KEY] || "UNKNOWN_UUID";

  return (
    <div
      className={`px-3 py-2 shadow-sm border-2 rounded-lg min-w-24 text-center transition-all duration-200 ${nodeClassName} ${
        isSelected ? "transform scale-105" : "hover:shadow-md"
      } ${isMatched && !isSelected ? "opacity-100" : ""} ${matchedNodeIds.size > 0 && !isMatched ? "opacity-30" : ""}`}
      style={{
        width: data.width,
        height: data.height,
      }}
    >
      <Handle type="target" position={Position.Top} className="w-2 h-2" />

      <div
        className={`text-xs flex items-center justify-center mb-1 ${isSelected ? "font-bold text-gray-900 dark:text-white" : "font-semibold text-gray-700 dark:text-gray-200"}`}
      >
        <Badge className="mr-[8px]" style={{ backgroundColor: nodeColorScheme.badgeColor }}>
          {uuid}
        </Badge>
        <span className="truncate">{data.name}</span>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
    </div>
  );
}

const nodeTypes: NodeTypes = {
  behaviorTree: BehaviorTreeNode,
};

// Component to handle viewport centering - must be inside ReactFlow
function ViewportCenteringHandler({
  selectedElement,
  nodes,
}: {
  selectedElement: SelectedElement | null;
  nodes: Node[];
}) {
  const { setCenter } = useReactFlow();

  useEffect(() => {
    if (selectedElement && nodes.length > 0) {
      const targetNode = nodes.find((node) => node.id === selectedElement.id);
      if (targetNode) {
        setCenter(
          targetNode.position.x + (targetNode.width || 0) / 2,
          targetNode.position.y + (targetNode.height || 0) / 2,
          {
            zoom: 1.2,
            duration: 200,
          },
        );
      }
    }
  }, [selectedElement, nodes, setCenter]);

  return null; // This component doesn't render anything
}

export function Graph({ behaviorTree }: GraphProps): ReactElement {
  const {
    selectedElement,
    selectElement,
    clearSelection,
    searchQuery,
    setSearchQuery,
    setMatchedNodeIds,
    matchedNodeIds,
  } = useGraphContext();

  const searchInputRef = useRef<HTMLInputElement>(null);
  const reactFlowContainerRef = useRef<HTMLDivElement>(null);

  // Generate DAG layout when behavior tree changes
  const dagGraph = useMemo(() => {
    if (!behaviorTree) {
      return null;
    }

    try {
      return generateDag(behaviorTree, {
        direction: "TB",
        nodeWidth: 120,
        nodeHeight: 70,
        nodeSep: 30,
        rankSep: 80,
      });
    } catch (error) {
      console.error("Failed to generate DAG:", error);
      return null;
    }
  }, [behaviorTree]);

  // Convert DAG to React Flow nodes and edges
  const { nodes, edges } = useMemo(() => {
    if (!dagGraph) {
      return { nodes: [], edges: [] };
    }

    const reactFlowNodes: Node[] = dagGraph.nodes.map((dagNode) => ({
      id: dagNode.id,
      type: "behaviorTree",
      position: { x: dagNode.x ?? 0, y: dagNode.y ?? 0 },
      data: dagNode as unknown as Record<string, unknown>,
      draggable: false,
      style: {},
    }));

    const reactFlowEdges: Edge[] = dagGraph.edges.map((dagEdge, index) => ({
      id: `${dagEdge.source}-${dagEdge.target}-${index}`,
      source: dagEdge.source,
      target: dagEdge.target,
      type: "smoothstep",
      style: { stroke: "#6b7280", strokeWidth: 2 },
      animated: false,
    }));

    return { nodes: reactFlowNodes, edges: reactFlowEdges };
  }, [dagGraph]);

  // Update matched nodes when search query changes
  useEffect(() => {
    if (!dagGraph || !searchQuery) {
      setMatchedNodeIds(new Set());
      return;
    }

    const query = searchQuery.toLowerCase();
    const matched = new Set<string>();

    dagGraph.nodes.forEach((node) => {
      // Search in node name
      if (node.name.toLowerCase().includes(query)) {
        matched.add(node.id);
        return;
      }

      // Search in node model/type
      if (node.model.toLowerCase().includes(query)) {
        matched.add(node.id);
        return;
      }

      // Search in attributes
      if (node.attributes) {
        const attributesMatch = Object.entries(node.attributes).some(([key, value]) => {
          const keyMatch = key.toLowerCase().includes(query);
          const valueMatch = String(value).toLowerCase().includes(query);
          return keyMatch || valueMatch;
        });

        if (attributesMatch) {
          matched.add(node.id);
        }
      }
    });

    setMatchedNodeIds(matched);

    // If only one match, select it automatically
    if (matched.size === 1) {
      const matchedNode = dagGraph.nodes.find((n) => n.id === Array.from(matched)[0]);
      if (matchedNode) {
        selectElement({
          id: matchedNode.id,
          name: matchedNode.name,
          type: matchedNode.model,
          attributes: matchedNode.attributes || {},
        });
      }
    }
  }, [searchQuery, dagGraph, setMatchedNodeIds, selectElement]);

  // Add keyboard shortcut for search (Ctrl+F) - only when ReactFlow container is focused
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only trigger if ReactFlow container has focus or contains the focused element
      if (
        reactFlowContainerRef.current &&
        (reactFlowContainerRef.current.contains(document.activeElement) ||
          document.activeElement === reactFlowContainerRef.current)
      ) {
        if (event.ctrlKey && event.key === "f") {
          event.preventDefault();
          // Use setTimeout to ensure focus happens after current event processing
          setTimeout(() => {
            if (searchInputRef.current) {
              searchInputRef.current.focus();
              searchInputRef.current.select(); // Also select any existing text
            }
          }, 0);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      const dagNode = node.data as unknown as DagNode;

      // Format the node data for the popup
      const element: SelectedElement = {
        id: dagNode.id,
        name: dagNode.name,
        type: dagNode.model,
        attributes: dagNode.attributes || {},
      };

      selectElement(element);
    },
    [selectElement],
  );

  const onClosePopup = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  if (!behaviorTree) {
    return (
      <div className="h-full w-full flex items-center justify-center text-gray-500">
        No behavior tree loaded
      </div>
    );
  }

  if (!dagGraph) {
    return (
      <div className="h-full w-full flex items-center justify-center text-red-500">
        Failed to generate graph layout
      </div>
    );
  }

  return (
    <div ref={reactFlowContainerRef} className="h-full w-full relative" tabIndex={0}>
      <div className="absolute top-2 right-2 z-10 flex items-center flex-col">
        <div className="relative">
          <Input
            ref={searchInputRef}
            placeholder="Search nodes..."
            className="w-[250px] pr-8"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
            tabIndex={0}
            autoComplete="off"
          />
          {searchQuery && (
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              onClick={() => {
                setSearchQuery("");
              }}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {matchedNodeIds.size > 0 && searchQuery && (
          <span className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {matchedNodeIds.size} match{matchedNodeIds.size !== 1 ? "es" : ""}
          </span>
        )}
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{}}
        minZoom={0.1}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
      >
        <Controls />
        <Background />
        <ViewportCenteringHandler selectedElement={selectedElement} nodes={nodes} />
      </ReactFlow>

      {selectedElement && (
        <ElementDetailsPopup
          element={selectedElement}
          behaviorTree={behaviorTree}
          onClose={onClosePopup}
        />
      )}
    </div>
  );
}
