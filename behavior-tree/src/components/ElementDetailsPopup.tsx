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
import { X } from "lucide-react";
import { useEffect, useRef } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UUID_KEY } from "@/constants";
import { TBehaviorTree, PortDirection } from "@/types";
import { getNodeColor } from "@/utils/nodeStyles";

type SelectedElement = {
  id: string;
  name: string;
  type: string;
  attributes: Record<string, string | number | boolean>;
};

interface ElementDetailsPopupProps {
  element: SelectedElement;
  behaviorTree: TBehaviorTree | null;
  onClose: () => void;
}

export function ElementDetailsPopup({ element, behaviorTree, onClose }: ElementDetailsPopupProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Get model information
  const model = behaviorTree?.models[element.type];
  const uuid = element.attributes[UUID_KEY];

  const nodeColorScheme = getNodeColor(element.type);

  // Helper function to get port direction badge
  const getPortBadge = (attributeKey: string) => {
    if (!model) {
      return null;
    }

    const port = model.ports.find((p) => p.name === attributeKey);
    if (!port) {
      return null;
    }

    const badgeMap = {
      [PortDirection.INPUT]: { text: "I", variant: "secondary" as const },
      [PortDirection.OUTPUT]: { text: "O", variant: "default" as const },
      [PortDirection.INOUT]: { text: "IO", variant: "destructive" as const },
    };

    const badgeInfo = badgeMap[port.direction];
    return badgeInfo ? (
      <Badge variant={badgeInfo.variant} className="text-xs h-4 mr-2">
        {badgeInfo.text}
      </Badge>
    ) : null;
  };

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const attrs = Object.entries(element.attributes).filter(([key]) => key !== UUID_KEY);

  return (
    <div className="absolute bottom-4 right-4 z-50 w-80 max-h-96">
      <Card ref={cardRef} className="shadow-lg border-2">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2 relative">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {uuid && (
                  <Badge className="mr-2" style={{ backgroundColor: nodeColorScheme.badgeColor }}>
                    {uuid}
                  </Badge>
                )}
                <CardTitle className="text-sm font-medium truncate">{element.name}</CardTitle>
              </div>
              {model && (
                <div className="text-xs text-muted-foreground capitalize mt-1">
                  {model.type} node
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 flex-shrink-0"
              onClick={onClose}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Attributes
            </div>
            <div className="max-h-48 overflow-y-auto">
              <div className="space-y-1">
                {attrs.length !== 0 ? (
                  attrs.map(([key, value]) => (
                    <div key={key} className="flex justify-between items-start gap-2 py-1">
                      <div className="text-xs font-medium text-muted-foreground min-w-0 flex-shrink-0 flex items-center">
                        {getPortBadge(key)}
                        {key}:
                      </div>
                      <div className="text-xs font-mono text-right break-all">
                        {typeof value === "boolean" ? (
                          <Badge variant={value ? "default" : "secondary"} className="text-xs h-4">
                            {value.toString()}
                          </Badge>
                        ) : typeof value === "string" && value.length > 20 ? (
                          <span className="text-xs" title={value}>
                            {value.substring(0, 20)}...
                          </span>
                        ) : (
                          value.toString()
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-muted-foreground italic">No attributes</div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
