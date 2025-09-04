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
import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type SelectedElement = {
  id: string;
  name: string;
  type: string;
  attributes: Record<string, string | number | boolean>;
};

interface GraphContextValue {
  selectedElement: SelectedElement | null;
  setSelectedElement: (element: SelectedElement | null) => void;
  selectElement: (element: SelectedElement) => void;
  clearSelection: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  matchedNodeIds: Set<string>;
  setMatchedNodeIds: (ids: Set<string>) => void;
}

const GraphContext = createContext<GraphContextValue | undefined>(undefined);

interface GraphContextProviderProps {
  children: ReactNode;
}

export function GraphContextProvider({ children }: GraphContextProviderProps) {
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [matchedNodeIds, setMatchedNodeIds] = useState<Set<string>>(new Set());

  const selectElement = useCallback((element: SelectedElement) => {
    setSelectedElement(element);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedElement(null);
  }, []);

  const updateSearchQuery = useCallback((query: string) => {
    setSearchQuery(query);
    // The matched nodes will be calculated in the Graph component
    // since it has access to all nodes
  }, []);

  const value: GraphContextValue = {
    selectedElement,
    setSelectedElement,
    selectElement,
    clearSelection,
    searchQuery,
    setSearchQuery: updateSearchQuery,
    matchedNodeIds,
    setMatchedNodeIds,
  };

  return <GraphContext.Provider value={value}>{children}</GraphContext.Provider>;
}

export function useGraphContext() {
  const context = useContext(GraphContext);
  if (context === undefined) {
    throw new Error("useGraphContext must be used within a GraphContextProvider");
  }
  return context;
}
