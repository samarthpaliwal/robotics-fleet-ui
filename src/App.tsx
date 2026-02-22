import React from "react";
import { useWebSocket } from "./hooks/useWebSocket";
import { FleetOverview } from "./components/FleetOverview/FleetOverview";
import { RobotDetail } from "./components/RobotDetail/RobotDetail";
import { ConnectionStatus } from "./components/ConnectionStatus/ConnectionStatus";
import { useRobotStore } from "./store/RobotContext";

function AppInner() {
  useWebSocket();
  const { state } = useRobotStore();

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", color: "#e2e8f0", fontFamily: "Inter, system-ui, sans-serif" }}>
      <header
        style={{
          borderBottom: "1px solid #1e293b",
          padding: "14px 28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: "-0.3px" }}>🤖 FleetOS</span>
          <span style={{ marginLeft: 12, fontSize: 12, color: "#475569" }}>Command Interface v1.0</span>
        </div>
        <ConnectionStatus />
      </header>

      <main
        style={{
          display: "grid",
          gridTemplateColumns: state.selectedRobotId ? "1fr 340px" : "1fr",
          gap: 20,
          padding: 24,
          maxWidth: 1400,
          margin: "0 auto",
        }}
      >
        <FleetOverview />
        {state.selectedRobotId && <RobotDetail />}
      </main>
    </div>
  );
}

export default function App() {
  return <AppInner />;
}
