// All domain types in one place. Extend here, never scatter types across files.

export type RobotStatus = "idle" | "moving" | "charging" | "error";

export interface RobotTelemetry {
  robot_id: string;
  battery_level: number;       // 0–100
  temperature: number;         // Celsius
  position: { x: number; y: number };
  velocity: number;            // m/s
  status: RobotStatus;
  last_updated: number;        // Unix ms timestamp
}

// Normalized store: keyed by robot_id for O(1) lookups
export type RobotMap = Record<string, RobotTelemetry>;

export type ConnectionState = "connecting" | "connected" | "disconnected" | "error";

export type RobotCommand =
  | "START"
  | "STOP"
  | "RETURN_TO_BASE"
  | "EMERGENCY_STOP";

export interface CommandPayload {
  type: "command";
  robot_id: string;
  command: RobotCommand;
  issued_at: number;
}

// Incoming WS message discriminated union
export type InboundMessage =
  | { type: "telemetry"; payload: RobotTelemetry }
  | { type: "ack"; robot_id: string; command: RobotCommand }
  | { type: "pong" };
