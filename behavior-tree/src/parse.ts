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
import { XMLParser } from "fast-xml-parser";

import { TBehaviorTree, TreeNode, Model, ModelTypes, PortDirection } from "./types";

type ParsedXMLObject = {
  root: {
    TreeNodesModel?: Record<string, any>;
    BehaviorTree?: any;
    [key: string]: any;
  };
};

export function parseBehaviorTreeXML(xmlContent: string): TBehaviorTree {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
  });

  const xmlObject = parser.parse(xmlContent) as ParsedXMLObject;

  const models = parseModels(xmlObject);
  const root = parseBehaviorTreeTag(xmlObject);

  return {
    models,
    root,
  };
}

function parseModels(xmlObject: ParsedXMLObject): TBehaviorTree["models"] {
  const models: TBehaviorTree["models"] = {};

  // Parse TreeNodesModel section
  const treeNodesModel = xmlObject?.root?.TreeNodesModel;
  if (treeNodesModel) {
    // Parse each node type (Action, Condition, Decorator, etc.)
    for (const [nodeType, nodeDefinitions] of Object.entries(treeNodesModel)) {
      const definitions = Array.isArray(nodeDefinitions) ? nodeDefinitions : [nodeDefinitions];

      for (const definition of definitions) {
        if (typeof definition === "object" && definition?.["@_ID"]) {
          const model: Model = {
            id: definition["@_ID"],
            type: getModelType(nodeType),
            ports: [],
          };

          // Parse ports (input_port, output_port, inout_port)
          for (const [portType, portData] of Object.entries(definition)) {
            if (portType.endsWith("_port")) {
              const ports = Array.isArray(portData) ? portData : [portData];

              for (const port of ports) {
                if (typeof port === "object" && port?.["@_name"]) {
                  model.ports.push({
                    name: port["@_name"],
                    direction: getPortDirection(portType),
                    type: port["@_type"] || "string",
                    description: port["#text"] || "",
                  });
                }
              }
            }
          }

          models[model.id] = model;
        }
      }
    }
  }

  // Add built-in control flow models
  models["Sequence"] = {
    id: "Sequence",
    type: ModelTypes.CONTROL,
    ports: [],
  };

  models["Fallback"] = {
    id: "Fallback",
    type: ModelTypes.CONTROL,
    ports: [],
  };

  return models;
}

function parseBehaviorTreeTag(xmlObject: ParsedXMLObject): TreeNode {
  const behaviorTree = xmlObject?.root?.BehaviorTree;

  if (!behaviorTree) {
    // Return default root if no BehaviorTree tag found
    return {
      id: "root",
      name: "root",
      model: "Sequence",
    };
  }

  // Find the first child element (should be the root node of the tree)
  const rootNodeKey = Object.keys(behaviorTree).find((key) => !key.startsWith("@_"));

  if (!rootNodeKey) {
    return {
      id: "root",
      name: "root",
      model: "Sequence",
    };
  }

  const rootNodeData = behaviorTree[rootNodeKey];
  return parseTreeNode(rootNodeKey, rootNodeData);
}

function parseTreeNode(nodeName: string, nodeData: any): TreeNode {
  const id = nodeData?.["@__uid"] || nodeData?.["@_ID"] || nodeData?.["@_name"] || nodeName;
  const name = nodeData?.["@_name"] || id;

  const node: TreeNode = {
    id,
    name,
    model: nodeName,
  };

  // Parse attributes (excluding special ones)
  const attributes: { [key: string]: string | number | boolean } = {};
  if (nodeData && typeof nodeData === "object") {
    for (const [key, value] of Object.entries(nodeData)) {
      if (key.startsWith("@_") && key !== "@_ID" && key !== "@_name") {
        const attrName = key.substring(2); // Remove "@_" prefix
        attributes[attrName] = value as string | number | boolean;
      }
    }
  }

  if (Object.keys(attributes).length > 0) {
    node.attributes = attributes;
  }

  // Parse children
  if (nodeData && typeof nodeData === "object") {
    const children: TreeNode[] = [];

    for (const [childKey, childValue] of Object.entries(nodeData)) {
      if (!childKey.startsWith("@_")) {
        if (Array.isArray(childValue)) {
          // Multiple children of the same type
          for (const childData of childValue) {
            children.push(parseTreeNode(childKey, childData));
          }
        } else if (typeof childValue === "object") {
          // Single child
          children.push(parseTreeNode(childKey, childValue));
        }
      }
    }

    if (children.length > 0) {
      node.children = children;
    }
  }

  return node;
}

function getModelType(nodeType: string): ModelTypes {
  const typeMap: { [key: string]: ModelTypes } = {
    Action: ModelTypes.ACTION,
    Condition: ModelTypes.CONDITION,
    Decorator: ModelTypes.DECORATOR,
    Control: ModelTypes.CONTROL,
    SubTree: ModelTypes.SUBTREE,
  };

  return typeMap[nodeType] || ModelTypes.ACTION;
}

function getPortDirection(portType: string): PortDirection {
  const directionMap: { [key: string]: PortDirection } = {
    input_port: PortDirection.INPUT,
    output_port: PortDirection.OUTPUT,
    inout_port: PortDirection.INOUT,
  };

  return directionMap[portType] || PortDirection.INPUT;
}
