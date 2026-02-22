# 🤖 FleetOS — Real-Time Robotics Fleet Command Interface

A production-style fleet command dashboard for autonomous robots, built with React, TypeScript, and WebSockets.

## Tech Stack

- **React 18** + **Vite** — fast dev server, optimized builds
- **TypeScript** — strict typing throughout
- **WebSockets** — real-time bidirectional communication (no polling)
- **Context + useReducer** — normalized global state
- **Zero charting libraries** — custom SVG battery chart

## Quick Start

```bash
# Install dependencies
npm install

# Start the simulation server (Terminal 1)
npm run server

# Start the frontend dev server (Terminal 2)
npm run dev

# Open http://localhost:5173
```

## Architecture

```
src/
├── types/            # Shared TypeScript interfaces
├── services/         # WebSocket service (framework-agnostic class)
├── store/            # Global state (Context + useReducer)
├── hooks/            # useWebSocket, useThrottledRobots
└── components/
    ├── FleetOverview/   # Robot card grid
    ├── RobotDetail/     # Live detail panel + battery chart
    ├── CommandPanel/    # START / STOP / RETURN / EMERGENCY_STOP
    └── ConnectionStatus/
```

## Key Design Decisions

| Decision | Reason |
|---|---|
| Normalized `RobotMap` (not array) | O(1) updates — only changed robot re-renders |
| Class-based `WebSocketService` | Reconnect state is mutable instance state, not reactive |
| `useReducer` over `useState` | Complex state transitions are safer as pure reducer logic |
| `useThrottledRobots` hook | Caps render rate at ~10fps regardless of telemetry frequency |
| `React.memo` on cards | Robot A telemetry never triggers Robot B card repaint |
| Exponential backoff + jitter | Prevents thundering herd on server restart |
| Optimistic UI for commands | Commands feel instant; ACK confirms server applied them |

## Environment Variables

```env
VITE_WS_URL=ws://localhost:8080
```

## Production Build

```bash
npm run build
# Output in dist/
```
