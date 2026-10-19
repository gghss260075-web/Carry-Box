/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PeerPlayerInfo {
  id: string;
  name: string;
  team: string;
  color: string;
  hat: string;
  x?: number;
  y?: number;
  z?: number;
  rotY?: number;
  speed?: number;
  isGrounded?: boolean;
  isGrabbing?: boolean;
  power?: string;
}

export type PeerJoinCallback = (peer: PeerPlayerInfo) => void;
export type PeerLeaveCallback = (peerId: string) => void;
export type PeerStateCallback = (data: {
  id: string;
  x: number;
  y: number;
  z: number;
  rotY: number;
  speed: number;
  isGrounded: boolean;
  isGrabbing: boolean;
  power: string;
}) => void;
export type PeerBoxEventCallback = (data: {
  boxId: string;
  action: 'grab' | 'drop' | 'deliver';
  carrierId: string | null;
  power?: string;
}) => void;

class MultiplayerService {
  private ws: WebSocket | null = null;
  private isConnected: boolean = false;
  private onPeerJoinListeners: PeerJoinCallback[] = [];
  private onPeerLeaveListeners: PeerLeaveCallback[] = [];
  private onPeerStateListeners: PeerStateCallback[] = [];
  private onPeerBoxEventListeners: PeerBoxEventCallback[] = [];

  public connect(roomId: string, playerInfo: { id: string; name: string; team: string; color: string; hat: string }) {
    if (typeof window === 'undefined') return;

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.send({
          type: 'join_room',
          roomId,
          ...playerInfo,
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'room_peers') {
            msg.peers.forEach((p: PeerPlayerInfo) => {
              this.onPeerJoinListeners.forEach((cb) => cb(p));
            });
          } else if (msg.type === 'peer_joined') {
            this.onPeerJoinListeners.forEach((cb) => cb(msg.peer));
          } else if (msg.type === 'peer_left') {
            this.onPeerLeaveListeners.forEach((cb) => cb(msg.id));
          } else if (msg.type === 'peer_state') {
            this.onPeerStateListeners.forEach((cb) => cb(msg));
          } else if (msg.type === 'peer_box_event') {
            this.onPeerBoxEventListeners.forEach((cb) => cb(msg));
          }
        } catch {
          // ignore
        }
      };

      this.ws.onerror = () => {
        this.isConnected = false;
      };

      this.ws.onclose = () => {
        this.isConnected = false;
      };
    } catch {
      this.isConnected = false;
    }
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }

  public send(data: object) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(data));
      } catch {
        // ignore
      }
    }
  }

  public sendPlayerState(state: {
    x: number;
    y: number;
    z: number;
    rotY: number;
    speed: number;
    isGrounded: boolean;
    isGrabbing: boolean;
    power: string;
  }) {
    this.send({
      type: 'player_state',
      ...state,
    });
  }

  public sendBoxEvent(boxId: string, action: 'grab' | 'drop' | 'deliver', carrierId: string | null, power?: string) {
    this.send({
      type: 'box_event',
      boxId,
      action,
      carrierId,
      power,
    });
  }

  public onPeerJoin(cb: PeerJoinCallback) {
    this.onPeerJoinListeners.push(cb);
    return () => {
      this.onPeerJoinListeners = this.onPeerJoinListeners.filter((l) => l !== cb);
    };
  }

  public onPeerLeave(cb: PeerLeaveCallback) {
    this.onPeerLeaveListeners.push(cb);
    return () => {
      this.onPeerLeaveListeners = this.onPeerLeaveListeners.filter((l) => l !== cb);
    };
  }

  public onPeerState(cb: PeerStateCallback) {
    this.onPeerStateListeners.push(cb);
    return () => {
      this.onPeerStateListeners = this.onPeerStateListeners.filter((l) => l !== cb);
    };
  }

  public onPeerBoxEvent(cb: PeerBoxEventCallback) {
    this.onPeerBoxEventListeners.push(cb);
    return () => {
      this.onPeerBoxEventListeners = this.onPeerBoxEventListeners.filter((l) => l !== cb);
    };
  }

  public getIsConnected() {
    return this.isConnected;
  }
}

export const multiplayer = new MultiplayerService();
