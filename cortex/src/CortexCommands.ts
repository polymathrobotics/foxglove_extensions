// Modify Command Request type
export type CortexModifyCommandRequest = {
  mode: number;
  commands: Array<{
    type: number;
    navigation: {
      type: number;
      relative_path: {
        poses: Array<{
          header: {
            frame_id: string;
          };
          pose: {
            position: {
              x: number;
              y: number;
            };
            orientation: {
              x: number;
              y: number;
              z: number;
              w: number;
            };
          }
        }>;
      };
    };
  }>;
};

// Flow Command Request type
export type CortexFlowCommandRequest = {
  command: {
    command: number;
  }
}

// Commands Response type
export type CortexCommandResponse = {
  success: boolean;
  message: string;
};

