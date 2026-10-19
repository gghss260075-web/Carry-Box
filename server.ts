/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const port = process.env.PORT || 3000;

app.use(express.json());

// In-memory room state for real-time multiplayer
interface NetworkClient {
  ws: WebSocket;
  id: string;
  name: string;
  roomId: string;
  team: string;
  color: string;
  hat: string;
}

const clients = new Map<WebSocket, NetworkClient>();

const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws) => {
  ws.on('message', (messageRaw) => {
    try {
      const msg = JSON.parse(messageRaw.toString());
      if (msg.type === 'join_room') {
        const clientInfo: NetworkClient = {
          ws,
          id: msg.id,
          name: msg.name,
          roomId: msg.roomId,
          team: msg.team || 'neutral',
          color: msg.color || '#fb7185',
          hat: msg.hat || 'hardhat',
        };
        clients.set(ws, clientInfo);

        // Broadcast join to all peers in same room
        const roomPeers = Array.from(clients.values()).filter(
          (c) => c.roomId === msg.roomId && c.id !== msg.id
        );

        // Send existing peers to newly joined player
        ws.send(
          JSON.stringify({
            type: 'room_peers',
            peers: roomPeers.map((p) => ({
              id: p.id,
              name: p.name,
              team: p.team,
              color: p.color,
              hat: p.hat,
            })),
          })
        );

        // Inform other peers of new player
        roomPeers.forEach((p) => {
          if (p.ws.readyState === WebSocket.OPEN) {
            p.ws.send(
              JSON.stringify({
                type: 'peer_joined',
                peer: {
                  id: clientInfo.id,
                  name: clientInfo.name,
                  team: clientInfo.team,
                  color: clientInfo.color,
                  hat: clientInfo.hat,
                },
              })
            );
          }
        });
      } else if (msg.type === 'player_state') {
        const sender = clients.get(ws);
        if (!sender) return;

        // Broadcast movement to all other players in same room
        clients.forEach((other) => {
          if (other.roomId === sender.roomId && other.id !== sender.id && other.ws.readyState === WebSocket.OPEN) {
            other.ws.send(
              JSON.stringify({
                type: 'peer_state',
                id: sender.id,
                x: msg.x,
                y: msg.y,
                z: msg.z,
                rotY: msg.rotY,
                speed: msg.speed,
                isGrounded: msg.isGrounded,
                isGrabbing: msg.isGrabbing,
                power: msg.power,
              })
            );
          }
        });
      } else if (msg.type === 'box_event') {
        const sender = clients.get(ws);
        if (!sender) return;

        // Broadcast box grab / deliver events
        clients.forEach((other) => {
          if (other.roomId === sender.roomId && other.id !== sender.id && other.ws.readyState === WebSocket.OPEN) {
            other.ws.send(
              JSON.stringify({
                type: 'peer_box_event',
                boxId: msg.boxId,
                action: msg.action,
                carrierId: msg.carrierId,
                power: msg.power,
              })
            );
          }
        });
      }
    } catch {
      // ignore parsing errors
    }
  });

  ws.on('close', () => {
    const leaving = clients.get(ws);
    if (leaving) {
      clients.delete(ws);
      clients.forEach((other) => {
        if (other.roomId === leaving.roomId && other.ws.readyState === WebSocket.OPEN) {
          other.ws.send(
            JSON.stringify({
              type: 'peer_left',
              id: leaving.id,
            })
          );
        }
      });
    }
  });
});

// REST endpoints
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    game: 'Human Force Fall (험난한 힘의 탑)',
    activePlayers: clients.size,
  });
});

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(port, () => {
    console.log(`[Human Force Fall] Game server running on port ${port}`);
  });
}

startServer();
