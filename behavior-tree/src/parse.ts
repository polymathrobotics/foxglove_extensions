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

import { BehaviorTree, TreeNode, Model, ModelTypes, PortDirection } from "./types";

type ParsedXMLObject = {
  root: {
    TreeNodesModel?: Record<string, any>;
    BehaviorTree?: any;
    [key: string]: any;
  };
};

export function parseBehaviorTreeXML(xmlContent: string): BehaviorTree {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
  });

  const xmlObject = parser.parse(xmlContent) as ParsedXMLObject;

  const models = parseModels(xmlObject);

  return {
    models,
    root: {
      id: "root",
      name: "root",
      model: "Sequence",
    },
  };
}

function parseModels(xmlObject: ParsedXMLObject): BehaviorTree["models"] {
  const models: BehaviorTree["models"] = {};

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
