import type { RobotMap, RobotTelemetry, ConnectionState } from "../types/robot";

export interface RobotState {
  robots: RobotMap;
  connectionState: ConnectionState;
  selectedRobotId: string | null;
  pendingCommands: Record<string, string>;
}

export const initialState: RobotState = {
  robots: {},
  connectionState: "connecting",
  selectedRobotId: null,
  pendingCommands: {},
};

export type RobotAction =
  | { type: "TELEMETRY_UPDATE"; payload: RobotTelemetry }
  | { type: "SET_CONNECTION"; status: ConnectionState }
  | { type: "SELECT_ROBOT"; robot_id: string | null }
  | { type: "OPTIMISTIC_COMMAND"; robot_id: string; command: string }
  | { type: "COMMAND_ACK"; robot_id: string };

export function robotReducer(state: RobotState, action: RobotAction): RobotState {
  switch (action.type) {
    case "TELEMETRY_UPDATE":
      return {
        ...state,
        robots: {
          ...state.robots,
          [action.payload.robot_id]: action.payload,
        },
      };

    case "SET_CONNECTION":
      return { ...state, connectionState: action.status };

    case "SELECT_ROBOT":
      return { ...state, selectedRobotId: action.robot_id };

    case "OPTIMISTIC_COMMAND": {
      const robot = state.robots[action.robot_id];
      if (!robot) return state;
      return {
        ...state,
        pendingCommands: { ...state.pendingCommands, [action.robot_id]: action.command },
        robots: {
          ...state.robots,
          [action.robot_id]: {
            ...robot,
            status:
              action.command === "STOP" || action.command === "EMERGENCY_STOP"
                ? "idle"
                : action.command === "START" || action.command === "RETURN_TO_BASE"
                ? "moving"
                : robot.status,
          },
        },
      };
    }

    case "COMMAND_ACK": {
      const updated = { ...state.pendingCommands };
      delete updated[action.robot_id];
      return { ...state, pendingCommands: updated };
    }

    default:
      return state;
  }
}
