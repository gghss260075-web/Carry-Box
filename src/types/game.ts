/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ForcePower = 'gravity' | 'friction' | 'elasticity' | 'buoyancy';

export interface ForcePowerConfig {
  id: ForcePower;
  name: string;
  nameKo: string;
  iconName: string;
  color: string;
  auraColor: number;
  description: string;
  effectSummary: string;
  multiplier: number;
}

export type MapId = 'sky_stairway' | 'glacier_canyon' | 'desert_ruins' | 'urban_construction';

export interface MapConfig {
  id: MapId;
  name: string;
  nameKo: string;
  subtitle?: string;
  tagline: string;
  difficulty: '쉬움' | '보통' | '어려움' | '매우 어려움';
  themeColor: string;
  skyColor: number;
  fogColor: number;
  groundColor: number;
  hazards: string[];
  recommendedForce: ForcePower;
  boxTargetCount: number;
  thumbnailUrl?: string;
}

export type GameModeId = 'coop_haul' | 'team_battle_3v3';

export interface GameModeConfig {
  id: GameModeId;
  name: string;
  nameKo: string;
  tagline?: string;
  description: string;
  playersPerTeam: number;
  targetBoxes: number;
  winCondition: string;
}

export type TeamColor = 'red' | 'blue' | 'neutral';

export interface CosmeticItem {
  id: string;
  name: string;
  category: 'hat' | 'shirt' | 'pants' | 'color';
  description: string;
  previewColor?: string;
  unlockedByDefault?: boolean;
  requiredWins?: number;
}

export interface PlayerStats {
  username: string;
  totalMatches: number;
  wins: number;
  losses: number;
  coopClears: number;
  boxesDelivered: number;
  bestTimeSky: number;
  bestTimeGlacier: number;
  bestTimeDesert: number;
  bestTimeUrban: number;
  favoritePower: ForcePower;
  selectedColor: string;
  selectedHat: string;
  selectedShirt: string;
  selectedPants: string;
  unlockedCosmetics: string[];
}

export interface PlayerInput {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  jump: boolean;
  grab: boolean;
  respawn: boolean;
  powerIndex: number;
}

export interface PhysicalBoxState {
  id: string;
  x: number;
  y: number;
  z: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  carrierId: string | null;
  team: TeamColor;
  delivered: boolean;
  powerApplied: ForcePower | null;
}

export interface PlayerSlot {
  id: string;
  name: string;
  isBot: boolean;
  isHost: boolean;
  isReady: boolean;
  team: TeamColor;
  color: string;
  hat: string;
  shirt?: string;
  pants?: string;
  speechText?: string;
  avatarId: string;
}

export interface LobbyChatMessage {
  id: string;
  sender: string;
  text: string;
  isSystem?: boolean;
}

export interface RoomState {
  roomId: string;
  mapId: MapId;
  modeId: GameModeId;
  status: 'waiting' | 'matching' | 'lobby' | 'in_game' | 'finished';
  slots: PlayerSlot[];
  timeRemaining?: number;
}

export interface MatchResult {
  winnerTeam: TeamColor | 'coop_clear';
  redScore: number;
  blueScore: number;
  clearTimeSeconds: number;
  boxesDelivered: number;
  mvpName: string;
}
