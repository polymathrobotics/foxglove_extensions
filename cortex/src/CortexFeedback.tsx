// Feedback type
export const getCortexStatusColor = (status: number): string => {
  if (status === 0) return "#dd0000";
  if (status === 1) return "gray";
  if (status === 2) return "#ffd700";
  if (status === 3) return "#00b409";
  if (status === 4) return "#00b409";
  return "#fff";
};

export const getCortexStatusEnum = (status: number): string => {
  if (status === 0) return "STOPPED";
  if (status === 1) return "IDLE";
  if (status === 2) return "PAUSED";
  if (status === 3) return "NAVIGATION_EXECUTING";
  if (status === 4) return "VEHICLE_EXECUTING";
  return "INVALID STATE";
};

export type CortexFeedback = {
  timestamp_utc: {
    sec: number;
    nsec: number;
  };
  cortex_status: { 
    status: number; 
    description: string;
  };
  navigation_feedback: {
    nav2_goal_status: {
      goal_info: {
        goal_id: {
          uuid: Array<number>;
        };
        stamp: {
          sec: number;
          nsec: number;
        };
      };
      status: number;
    };
    total_distance_remaining: number;
    target_pose: {
      header: {
        stamp: {
          sec: number;
          nsec: number;
        };
        frame_id: string;
      };
      pose: {
        position: {
          latitude: number;
          longitude: number;
          altitude: number;
        };
        orientation: {
          x: number;
          y: number;
          z: number;
          w: number;
        };
      };
    };
    final_pose: {
      header: {
        stamp: {
          sec: number;
          nsec: number;
        };
        frame_id: string;
      };
      pose: {
        position: {
          latitude: number;
          longitude: number;
          altitude: number;
        };
        orientation: {
          x: number;
          y: number;
          z: number;
          w: number;
        };
      };
    };
    current_pose_index: number;
    number_of_poses_remaining: number;
    navigation_time: {
      sec: number;
      nsec: number;
    };
    estimated_time_remaining: {
      sec: number;
      nsec: number;
    };
  };
  vehicle_feedback : {
    state: number;
    description: string;
    data: {
      key: string;
      value: string;
    }
  };
  current_pose: {
    header: {
      stamp: {
        sec: number;
        nsec: number;
      };
      frame_id: string;
    };
    pose: {
      position: {
        latitude: number;
        longitude: number;
        altitude: number;
      };
      orientation: {
        x: number;
        y: number;
        z: number;
        w: number;
      };
    };
  };
  current_command_index: number;
  number_commands_remaining: number;
};