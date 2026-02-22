import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { robotReducer, initialState, type RobotState, type RobotAction } from "./robotReducer";
import type { RobotCommand } from "../types/robot";

interface RobotContextValue {
  state: RobotState;
  dispatch: React.Dispatch<RobotAction>;
  selectRobot: (id: string | null) => void;
  issueCommand: (robot_id: string, command: RobotCommand) => void;
  registerCommandSender: (fn: (robot_id: string, command: RobotCommand) => void) => void;
}

const RobotContext = createContext<RobotContextValue | null>(null);

export function RobotProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(robotReducer, initialState);
  const commandSenderRef = useRef<((id: string, cmd: RobotCommand) => void) | null>(null);

  const registerCommandSender = useCallback(
    (fn: (robot_id: string, command: RobotCommand) => void) => {
      commandSenderRef.current = fn;
    },
    []
  );

  const selectRobot = useCallback(
    (id: string | null) => dispatch({ type: "SELECT_ROBOT", robot_id: id }),
    []
  );

  const issueCommand = useCallback((robot_id: string, command: RobotCommand) => {
    dispatch({ type: "OPTIMISTIC_COMMAND", robot_id, command });
    commandSenderRef.current?.(robot_id, command);
  }, []);

  return (
    <RobotContext.Provider value={{ state, dispatch, selectRobot, issueCommand, registerCommandSender }}>
      {children}
    </RobotContext.Provider>
  );
}

export function useRobotStore(): RobotContextValue {
  const ctx = useContext(RobotContext);
  if (!ctx) throw new Error("useRobotStore must be used within <RobotProvider>");
  return ctx;
}
