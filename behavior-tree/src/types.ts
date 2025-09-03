export enum ModelTypes {
  ACTION = "action",
  CONDITION = "condition",
  CONTROL = "control",
  DECORATOR = "decorator",
  SUBTREE = "subtree",
}

export enum NodeStatus {
  IDLE = 0,
  RUNNING = 1,
  SUCCESS = 2,
  FAILURE = 3,
  SKIPPED = 4,
}

export enum PortDirection {
  INPUT = "input",
  OUTPUT = "output",
  INOUT = "inout",
}

export type Port = {
  name: string;
  direction: PortDirection;
  type: string;
  description: string;
};

export type Model = {
  type: ModelTypes;
  id: string;
  ports: Port[];
};

export type Node = {
  id: string;
  model: string;
};

export type BehaviorTree = {
  models: {
    [name: string]: Model;
  };
  tree: {
    id: string;
  };
};
