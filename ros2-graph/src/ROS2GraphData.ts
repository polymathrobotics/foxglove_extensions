type NodeInfo = {
  name: string;
  namespace: string;
  publications: { 
    name: string; 
    types: string[], 
    qos: {
      depth: number;
      reliability: string;
      durability: string;
      history: string;
      deadline: string;
      lifespan: string;
      liveliness: string;
      liveliness_lease_duration: string;
    } 
  }[];
  subscriptions: { 
    name: string; 
    types: string[];
    qos: {
      depth: number;
      reliability: string;
      durability: string;
      history: string;
      deadline: string;
      lifespan: string;
      liveliness: string;
      liveliness_lease_duration: string;
    } 
  }[];
  services: { 
    name: string; 
    types: string[] 
  }[];
  clients: { 
    name: string; 
    types: string[] 
  }[];
  // parameters: string[];
};

export type ROS2GraphMessage = {
  nodes: NodeInfo[];
};

export type GetROS2GraphResponse = {
  success: boolean;
  message: string;
};