# FleetOS: Real-Time Robotics Fleet Command Interface

FleetOS is a fleet command dashboard for autonomous robots, built with React 18, TypeScript and Vite. A small Node.js WebSocket server simulates 50 robots and streams telemetry (battery, temperature, position, velocity, status) to the browser roughly five times per second per robot. The UI shows the fleet as a card grid, lets you open a live detail panel with a battery history chart for one robot, and sends START / STOP / RETURN_TO_BASE / EMERGENCY_STOP commands back over the same socket with optimistic updates and server acknowledgements.

## Requirements

- Node.js 18 or newer and npm
- Two terminal windows (one for the simulation server, one for the Vite dev server)

## Setup

```bash
git clone https://github.com/samarthpaliwal/robotics-fleet-ui.git
cd robotics-fleet-ui
npm install
```

The frontend reads one optional environment variable at build time:

| Variable | Default | Purpose |
|---|---|---|
| `VITE_WS_URL` | `ws://localhost:8080` | WebSocket URL the browser connects to (`src/hooks/useWebSocket.ts`). |

Copy `.env.example` to `.env` if you need to point at a different server:

```env
# .env.example
VITE_WS_URL=ws://localhost:8080
```

The simulation server's port (8080), robot count (50) and tick interval (200 ms) are constants at the top of `server/simulationServer.ts`.

## Usage

Terminal 1, start the simulation server:

```bash
npm run server
# [Server] FleetOS simulation server running on ws://localhost:8080
# [Server] Streaming 50 robots at 5Hz
```

Terminal 2, start the frontend:

```bash
npm run dev
```

Open http://localhost:5173. The header shows the connection state; the grid fills with 50 robot cards sorted with error-state robots first. Click a card to open the detail panel on the right, which shows live telemetry, a rolling 30-point battery chart and the command buttons. Issuing a command greys the card and shows a spinner until the server's acknowledgement arrives (200 to 500 ms later). Stopping and restarting the server demonstrates automatic reconnection with exponential backoff.

Production build:

```bash
npm run build   # tsc && vite build, output in dist/
```

## How it works

- `server/simulationServer.ts` creates a `ws` WebSocketServer on port 8080, initialises 50 robots with random state, and ticks each one on its own staggered `setInterval` (200 ms + 4 ms per robot) so broadcasts are spread out rather than bursty. Battery drains or charges slowly, status changes rarely at random, and robots below 15% battery switch to charging. It answers `ping` with `pong` and replies to `command` messages with an `ack` after a short random delay. Commands are acknowledged but do not change the simulated robot's state on the server.
- `src/services/websocketService.ts` is a framework-free class that owns the socket: connect, JSON parsing and validation, a 15 s heartbeat ping, and reconnection with exponential backoff (1 s base, 30 s cap, up to 500 ms jitter).
- `src/store/` holds global state in a React Context with `useReducer`. Robots are stored in a normalised `RobotMap` keyed by `robot_id`, so a telemetry update replaces one entry. `OPTIMISTIC_COMMAND` sets the expected status immediately and records a pending command; `COMMAND_ACK` clears it.
- `src/hooks/useWebSocket.ts` wires the service to the store and registers the command sender. `src/hooks/useThrottledRobots.ts` snapshots the live map every 100 ms (about 10 fps) so the card grid does not re-render on every one of the ~250 telemetry messages per second.
- `RobotCard` is wrapped in `React.memo` so one robot's update does not repaint the others. `BatteryChart` is a hand-written SVG path over the last 30 battery readings; there is no charting library.

## Project layout

```
robotics-fleet-ui/
├── server/
│   └── simulationServer.ts   # ws-based telemetry simulator, port 8080
├── src/
│   ├── main.tsx              # React root wrapped in RobotProvider
│   ├── App.tsx               # Header, fleet grid, optional detail panel
│   ├── types/robot.ts        # Telemetry, command and message types
│   ├── services/websocketService.ts
│   ├── store/
│   │   ├── RobotContext.tsx  # Context provider, issueCommand, selectRobot
│   │   └── robotReducer.ts   # Normalised state + actions
│   ├── hooks/
│   │   ├── useWebSocket.ts
│   │   └── useThrottledRobots.ts
│   ├── components/
│   │   ├── FleetOverview/    # Grid and RobotCard
│   │   ├── RobotDetail/      # Detail panel and BatteryChart
│   │   ├── CommandPanel/     # START / STOP / RETURN_TO_BASE / EMERGENCY_STOP
│   │   └── ConnectionStatus/
│   └── styles/global.css
├── .env.example
├── index.html
├── vite.config.ts            # dev server on port 5173
└── tsconfig.json
```
