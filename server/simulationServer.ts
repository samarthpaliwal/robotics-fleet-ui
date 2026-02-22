/**
 * Node.js WebSocket simulation server.
 * Streams realistic telemetry for ROBOT_COUNT robots.
 *
 * Run: npx ts-node server/simulationServer.ts
 * Or:  npm run server
 */

import { WebSocketServer, WebSocket } from "ws";

const PORT = 8080;
const ROBOT_COUNT = 50;
const TICK_MS = 200; // 5Hz per robot

const STATUSES = ["idle", "moving", "charging", "error"] as const;
type Status = (typeof STATUSES)[number];

interface RobotState {
  robot_id: string;
  battery_level: number;
  temperature: number;
  position: { x: number; y: number };
  velocity: number;
  status: Status;
}

const robots: RobotState[] = Array.from({ length: ROBOT_COUNT }, (_, i) => ({
  robot_id: `ROBOT-${String(i + 1).padStart(3, "0")}`,
  battery_level: 40 + Math.random() * 60,
  temperature: 20 + Math.random() * 15,
  position: { x: Math.random() * 100, y: Math.random() * 100 },
  velocity: Math.random() * 2,
  status: STATUSES[Math.floor(Math.random() * STATUSES.length)],
}));

function tickRobot(r: RobotState): void {
  // Gradual battery drain/charge
  r.battery_level = Math.max(0, Math.min(100, r.battery_level + (Math.random() - 0.52) * 0.5));

  // Temperature drift
  r.temperature = Math.max(15, Math.min(90, r.temperature + (Math.random() - 0.5) * 0.3));

  if (r.status === "moving") {
    r.position.x = Math.max(0, Math.min(100, r.position.x + (Math.random() - 0.5) * 0.5));
    r.position.y = Math.max(0, Math.min(100, r.position.y + (Math.random() - 0.5) * 0.5));
    r.velocity = 0.5 + Math.random() * 1.5;
  } else {
    r.velocity = Math.max(0, r.velocity - 0.05);
  }

  // Rare random status transition
  if (Math.random() < 0.002) {
    r.status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
  }

  // Auto-behavior rules
  if (r.battery_level < 15 && r.status !== "charging") r.status = "charging";
  if (r.battery_level > 90 && r.status === "charging") r.status = "idle";
}

const wss = new WebSocketServer({ port: PORT });

wss.on("connection", (ws) => {
  console.log(`[Server] Client connected. Total clients: ${wss.clients.size}`);

  ws.on("message", (data) => {
    try {
      const msg = JSON.parse(data.toString()) as { type: string; robot_id?: string; command?: string };

      if (msg.type === "ping") {
        ws.send(JSON.stringify({ type: "pong" }));
        return;
      }

      if (msg.type === "command" && msg.robot_id && msg.command) {
        console.log(`[Server] Command: ${msg.command} → ${msg.robot_id}`);

        // Simulate processing delay then ack
        setTimeout(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(
              JSON.stringify({ type: "ack", robot_id: msg.robot_id, command: msg.command })
            );
          }
        }, 200 + Math.random() * 300);
      }
    } catch {
      console.warn("[Server] Could not parse message from client");
    }
  });

  ws.on("close", () => {
    console.log(`[Server] Client disconnected. Total clients: ${wss.clients.size}`);
  });

  ws.on("error", (err) => {
    console.error("[Server] Client socket error:", err.message);
  });
});

// Stagger robot ticks to avoid burst-broadcasting all 50 in same event loop tick
robots.forEach((robot, i) => {
  setInterval(() => {
    tickRobot(robot);

    const msg = JSON.stringify({
      type: "telemetry",
      payload: { ...robot, last_updated: Date.now() },
    });

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    });
  }, TICK_MS + i * 4); // 4ms stagger per robot = smooth delivery
});

console.log(`[Server] FleetOS simulation server running on ws://localhost:${PORT}`);
console.log(`[Server] Streaming ${ROBOT_COUNT} robots at ${1000 / TICK_MS}Hz`);
