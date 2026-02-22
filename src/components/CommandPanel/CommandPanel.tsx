import React, { memo } from "react";
import { useRobotStore } from "../../store/RobotContext";
import type { RobotCommand } from "../../types/robot";

interface CommandConfig {
  command: RobotCommand;
  label: string;
  color: string;
  description: string;
}

const COMMANDS: CommandConfig[] = [
  { command: "START",          label: "▶ Start",           color: "#22c55e", description: "Begin task execution" },
  { command: "STOP",           label: "⏹ Stop",            color: "#f59e0b", description: "Halt current operation" },
  { command: "RETURN_TO_BASE", label: "🏠 Return to Base", color: "#3b82f6", description: "Navigate to charging dock" },
  { command: "EMERGENCY_STOP", label: "🛑 Emergency Stop", color: "#ef4444", description: "Immediate full stop" },
];

interface Props {
  robotId: string;
}

export const CommandPanel = memo(function CommandPanel({ robotId }: Props) {
  const { issueCommand, state } = useRobotStore();
  const isPending = !!state.pendingCommands[robotId];
  const isDisconnected = state.connectionState !== "connected";
  const disabled = isPending || isDisconnected;

  return (
    <div>
      <label style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: 1 }}>
        Commands
      </label>

      {(isPending || isDisconnected) && (
        <div style={{ marginTop: 8, fontSize: 12, color: "#f59e0b" }}>
          {isDisconnected ? "⚠ Disconnected — commands unavailable" : "⟳ Command in progress…"}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
        {COMMANDS.map(({ command, label, color, description }) => (
          <button
            key={command}
            title={description}
            disabled={disabled}
            onClick={() => issueCommand(robotId, command)}
            style={{
              background: "#0f172a",
              border: `1px solid ${disabled ? "#334155" : color}`,
              borderRadius: 8,
              padding: "10px 12px",
              color: disabled ? "#475569" : color,
              fontSize: 13,
              fontWeight: 600,
              cursor: disabled ? "not-allowed" : "pointer",
              transition: "all 0.15s",
              textAlign: "left",
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
});
