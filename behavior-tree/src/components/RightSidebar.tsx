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
  ChevronDown,
  ChevronRightIcon,
  Download,
  PanelRightOpen,
  PanelRightClose,
} from "lucide-react";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TBehaviorTree } from "@/types";

interface ModelCategoryProps {
  title: string;
  items: Array<{
    name: string;
    ports: Array<{
      direction: string;
      name: string;
      type: string;
      description: string;
    }>;
  }>;
}

interface XmlNodeProps {
  node: any;
  depth?: number;
}

function XmlNode({ node, depth = 0 }: XmlNodeProps) {
  const [isExpanded, setIsExpanded] = useState(depth < 2);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="text-xs">
      <div
        className="inline-flex items-center gap-1 py-0.5 px-1 hover:bg-accent/50 dark:hover:bg-accent/30 cursor-pointer whitespace-nowrap min-w-0 rounded-sm"
        style={{ marginLeft: `${depth * 12}px` }}
        onClick={() => hasChildren && setIsExpanded(!isExpanded)}
      >
        <div className="flex-shrink-0">
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRightIcon className="h-3 w-3" />
            )
          ) : (
            <div className="w-3" />
          )}
        </div>
        <span className="text-blue-600 dark:text-blue-300 font-mono">&lt;{node.name}</span>
        <span className="inline-flex items-center gap-1">
          {Object.entries(node.attributes || {}).map(([key, value]) => (
            <span key={key} className="text-green-600 dark:text-green-300 font-mono">
              {" "}
              <span className="text-purple-600 dark:text-purple-300">{key}</span>=
              <span className="text-orange-600 dark:text-orange-300">"{String(value)}"</span>
            </span>
          ))}
        </span>
        <span className="text-blue-600 dark:text-blue-300 font-mono">&gt;</span>
      </div>

      {hasChildren && isExpanded && (
        <div>
          {node.children.map((child: any, index: number) => (
            <XmlNode key={index} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function ModelCategory({ title, items }: ModelCategoryProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <CollapsibleTrigger className="flex items-center gap-1 w-full py-1 px-2 text-sm font-medium hover:bg-accent/50 dark:hover:bg-accent/30 text-left rounded-sm">
        {isExpanded ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRightIcon className="h-3 w-3" />
        )}
        {title} ({items.length})
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-0.5 ml-4">
          {items.map((item, index) => (
            <div
              key={index}
              className="py-1 px-2 hover:bg-accent/30 dark:hover:bg-accent/20 cursor-pointer rounded-sm"
            >
              <div className="text-xs font-mono text-foreground">{item.name}</div>
              {item.ports.length > 0 && (
                <div className="ml-2 space-y-1 mt-1">
                  {item.ports.map((port, portIndex) => {
                    const directionLabel =
                      port.direction === "input"
                        ? "in_port"
                        : port.direction === "output"
                          ? "out_port"
                          : "inout_port";
                    return (
                      <div key={portIndex} className="text-xs">
                        <div className="text-blue-600 dark:text-blue-300">
                          {directionLabel}: <span className="text-foreground">{port.name}</span>
                        </div>
                        <div className="font-mono text-xs text-muted-foreground ml-2 break-all">
                          {port.type}
                        </div>
                        {port.description && (
                          <div className="text-xs text-muted-foreground ml-2 italic">
                            {port.description}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function RightSidebar({
  behaviorTree,
  xml,
}: {
  behaviorTree: TBehaviorTree | null;
  xml?: string;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [width, setWidth] = useState(512); // Default width in pixels
  const [isResizing, setIsResizing] = useState(false);

  // Parse XML string to node structure for XmlNode component
  const xmlNodeData = React.useMemo(() => {
    if (!xml) {
      return null;
    }

    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xml, "text/xml");

      const parseElement = (element: Element): any => {
        const node = {
          name: element.tagName,
          attributes: {} as Record<string, string>,
          children: [] as any[],
        };

        // Parse attributes
        for (let i = 0; i < element.attributes.length; i++) {
          const attr = element.attributes[i];
          if (attr) {
            node.attributes[attr.name] = attr.value;
          }
        }

        // Parse children
        for (let i = 0; i < element.children.length; i++) {
          const child = element.children[i];
          if (child) {
            node.children.push(parseElement(child));
          }
        }

        return node;
      };

      const rootElement = xmlDoc.documentElement;
      if (rootElement) {
        return parseElement(rootElement);
      }
      return null;
    } catch (error) {
      console.error("Failed to parse XML:", error);
      return null;
    }
  }, [xml]);

  const downloadXml = () => {
    if (!xml) {
      return;
    }

    const blob = new Blob([xml], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "behavior-tree.xml";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) {
        return;
      }

      // Calculate new width based on mouse position
      const newWidth = window.innerWidth - e.clientX;

      // Constrain width between min and max values
      const constrainedWidth = Math.min(Math.max(newWidth, 200), 800);
      setWidth(constrainedWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      // Prevent text selection while resizing
      document.body.style.userSelect = "none";
      document.body.style.cursor = "ew-resize";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, [isResizing]);

  return (
    <div className="h-full relative">
      {/* Toggle button - always visible */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          setIsOpen(!isOpen);
        }}
        className="absolute top-2 right-2 z-10 h-8 w-8"
      >
        {isOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
      </Button>

      {/* Sidebar panel */}
      {isOpen && (
        <div
          className="h-full bg-background dark:bg-slate-900 border-l border-border dark:border-slate-700 flex flex-col relative"
          style={{ width: `${width}px` }}
        >
          {/* Resize handle */}
          <div
            className="absolute left-0 top-0 bottom-0 w-1 hover:w-2 cursor-ew-resize hover:bg-primary/20 dark:hover:bg-primary/30 transition-all z-20"
            onMouseDown={handleMouseDown}
          />

          {/* Header */}
          <div className="p-2 border-b border-border dark:border-slate-700 bg-background dark:bg-slate-900">
            <div className="h-8" /> {/* Spacer for the toggle button */}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            <Tabs defaultValue="xml" className="h-full flex flex-col">
              <div className="flex items-center m-2 mb-0">
                <TabsList className="grid flex-1 grid-cols-2">
                  <TabsTrigger value="xml" className="text-xs">
                    XML
                  </TabsTrigger>
                  <TabsTrigger value="models" className="text-xs">
                    Models
                  </TabsTrigger>
                </TabsList>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={downloadXml}
                  className="h-6 w-6 p-0 ml-2"
                  title="Download behavior-tree.xml"
                >
                  <Download className="h-3 w-3" />
                </Button>
              </div>

              <TabsContent value="xml" className="flex-1 m-0 p-0 overflow-hidden">
                <div className="h-full overflow-y-auto overflow-x-auto">
                  <div className="p-2 w-max">
                    {xmlNodeData ? (
                      <XmlNode node={xmlNodeData} />
                    ) : (
                      <div className="text-center text-sm text-muted-foreground p-4">
                        No XML data available
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="models" className="flex-1 m-0 p-0 overflow-hidden">
                <div className="h-full w-full overflow-auto">
                  <div className="p-2 space-y-1">
                    {behaviorTree?.models ? (
                      <>
                        {/* Group models by type */}
                        {(() => {
                          const modelsByType: {
                            [key: string]: Array<{
                              name: string;
                              ports: Array<{
                                direction: string;
                                name: string;
                                type: string;
                                description: string;
                              }>;
                            }>;
                          } = {};

                          Object.entries(behaviorTree.models).forEach(([modelName, model]) => {
                            const typeName = model.type;
                            if (!modelsByType[typeName]) {
                              modelsByType[typeName] = [];
                            }

                            modelsByType[typeName].push({
                              name: modelName,
                              ports: model.ports.map((port) => ({
                                direction: port.direction,
                                name: port.name,
                                type: port.type,
                                description: port.description,
                              })),
                            });
                          });

                          return Object.entries(modelsByType).map(([category, formattedItems]) => {
                            return formattedItems.length > 0 ? (
                              <ModelCategory
                                key={category}
                                title={category.charAt(0).toUpperCase() + category.slice(1)}
                                items={formattedItems}
                              />
                            ) : null;
                          });
                        })()}
                      </>
                    ) : (
                      <div className="text-center text-sm text-muted-foreground p-4">
                        No models data available
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </div>
  );
}
