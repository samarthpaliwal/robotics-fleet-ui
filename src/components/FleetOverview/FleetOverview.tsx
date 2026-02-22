import React, { useMemo } from "react";
import { useRobotStore } from "../../store/RobotContext";
import { useThrottledRobots } from "../../hooks/useThrottledRobots";
import { RobotCard } from "./RobotCard";

export function FleetOverview() {
  const { state, selectRobot } = useRobotStore();
  const displayRobots = useThrottledRobots(state.robots);

  const sortedRobots = useMemo(
    () =>
      Object.values(displayRobots).sort((a, b) => {
        if (a.status === "error" && b.status !== "error") return -1;
        if (b.status === "error" && a.status !== "error") return 1;
        return a.robot_id.localeCompare(b.robot_id);
      }),
    [displayRobots]
  );

  const errorCount = sortedRobots.filter((r) => r.status === "error").length;

  if (sortedRobots.length === 0) {
    return (
      <div style={{ color: "#64748b", textAlign: "center", padding: 40 }}>
        Waiting for robot telemetry…
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ color: "#e2e8f0", fontSize: 16, margin: 0 }}>
          Fleet ({sortedRobots.length} robots)
        </h2>
        {errorCount > 0 && (
          <span style={{ fontSize: 12, color: "#ef4444", fontWeight: 600 }}>
            ⚠ {errorCount} error{errorCount > 1 ? "s" : ""}
          </span>
        )}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
          gap: 12,
        }}
      >
        {sortedRobots.map((robot) => (
          <RobotCard
            key={robot.robot_id}
            robot={robot}
            isSelected={state.selectedRobotId === robot.robot_id}
            isPending={!!state.pendingCommands[robot.robot_id]}
            onClick={() => selectRobot(robot.robot_id)}
          />
        ))}
      </div>
    </div>
  );
}
