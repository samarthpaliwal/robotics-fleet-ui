import { useEffect, useRef } from "react";
import { WebSocketService } from "../services/websocketService";
import { useRobotStore } from "../store/RobotContext";
import type { RobotCommand, CommandPayload } from "../types/robot";

const WS_URL = (import.meta as { env: Record<string, string> }).env.VITE_WS_URL ?? "ws://localhost:8080";

export function useWebSocket(): void {
  const { dispatch, registerCommandSender } = useRobotStore();
  const serviceRef = useRef<WebSocketService | null>(null);

  useEffect(() => {
    const service = new WebSocketService({
      url: WS_URL,
      onMessage: (msg) => {
        switch (msg.type) {
          case "telemetry":
            dispatch({ type: "TELEMETRY_UPDATE", payload: msg.payload });
            break;
          case "ack":
            dispatch({ type: "COMMAND_ACK", robot_id: msg.robot_id });
            break;
          case "pong":
            console.debug("[WS] Pong received");
            break;
        }
      },
      onStatusChange: (status) => {
        dispatch({
          type: "SET_CONNECTION",
          status:
            status === "connected"
              ? "connected"
              : status === "error"
              ? "error"
              : "disconnected",
        });
      },
    });

    serviceRef.current = service;
    service.connect();

    registerCommandSender((robot_id: string, command: RobotCommand) => {
      const payload: CommandPayload = {
        type: "command",
        robot_id,
        command,
        issued_at: Date.now(),
      };
      service.sendCommand(payload);
    });

    return () => {
      service.destroy();
      serviceRef.current = null;
    };
  }, []);
}
