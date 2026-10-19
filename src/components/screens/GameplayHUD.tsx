/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ForcePower, GameModeId, MapId, TeamColor } from '../../types/game';
import { RotateCcw, Volume2, VolumeX, LogOut, Orbit, Wind, Sparkles, Droplets } from 'lucide-react';
import { sounds } from '../../services/sound';

interface GameplayHUDProps {
  mapId: MapId;
  modeId: GameModeId;
  playerTeam: TeamColor;
  activePower: ForcePower;
  redScore: number;
  blueScore: number;
  coopDelivered: number;
  targetBoxes: number;
  distanceToGoal: number;
  checkpointIndex: number;
  isGrabbingBox: boolean;
  onSwitchPower: (power: ForcePower) => void;
  onToggleGrab: () => void;
  onRespawn: () => void;
  onExitGame: () => void;
}

export const GameplayHUD: React.FC<GameplayHUDProps> = ({
  mapId,
  modeId,
  playerTeam,
  activePower,
  redScore,
  blueScore,
  coopDelivered,
  targetBoxes,
  distanceToGoal,
  checkpointIndex,
  isGrabbingBox,
  onSwitchPower,
  onToggleGrab,
  onRespawn,
  onExitGame,
}) => {
  const [isMuted, setIsMuted] = React.useState(sounds.isMuted());

  const toggleMute = () => {
    const next = !isMuted;
    sounds.setMuted(next);
    setIsMuted(next);
  };

  const isTeamBattle = modeId === 'team_battle_3v3';

  return (
    <div className="pointer-events-none fixed inset-0 z-40 flex flex-col justify-between p-5 md:p-8 select-none font-sans text-white">
      {/* 1. TOP BAR: Team Score Pill on Left + Radar Minimap on Right (matching Panel 6) */}
      <div className="flex items-start justify-between">
        {/* Top-Left: Team Score Pill Bar (matching Panel 6: [2] 우리 팀 | 상대 팀 [3]) */}
        <div className="pointer-events-auto flex items-center shadow-2xl rounded-full bg-slate-900/80 backdrop-blur-md p-1 border border-white/20">
          {isTeamBattle ? (
            <div className="flex items-center gap-1.5">
              {/* 우리 팀 Pill (Blue) */}
              <div className="flex items-center gap-2 rounded-full bg-blue-600 px-3.5 py-1.5 text-xs font-black shadow">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-blue-700 font-black text-xs">
                  {playerTeam === 'red' ? redScore : blueScore}
                </span>
                <span>우리 팀</span>
              </div>

              {/* 상대 팀 Pill (Red) */}
              <div className="flex items-center gap-2 rounded-full bg-rose-600 px-3.5 py-1.5 text-xs font-black shadow">
                <span>상대 팀</span>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-rose-700 font-black text-xs">
                  {playerTeam === 'red' ? blueScore : redScore}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-black shadow">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-emerald-700 font-black text-xs">
                {coopDelivered}
              </span>
              <span>협동 박스 운반 ({coopDelivered}/{targetBoxes})</span>
            </div>
          )}

          {/* Distance Indicator */}
          <div className="px-3 text-[11px] font-bold text-amber-300">
            목표: {distanceToGoal}m
          </div>
        </div>

        {/* Top-Right: Circular Minimap / Radar (matching Panel 6 circular radar) */}
        <div className="pointer-events-auto flex items-center gap-3">
          {/* Controls: Mute & Exit */}
          <button
            onClick={toggleMute}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md border border-white/20 text-white shadow"
          >
            {isMuted ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <button
            onClick={onExitGame}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900/80 hover:bg-rose-900/80 backdrop-blur-md border border-white/20 text-white shadow"
            title="나가기"
          >
            <LogOut className="h-4 w-4" />
          </button>

          {/* Radar Disk (matching Panel 6) */}
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-slate-900/85 backdrop-blur-md border-2 border-slate-700 shadow-2xl overflow-hidden">
            {/* Concentric rings */}
            <div className="absolute h-14 w-14 rounded-full border border-sky-500/30" />
            <div className="absolute h-8 w-8 rounded-full border border-sky-500/40" />

            {/* Rotating radar sweep */}
            <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/20 to-transparent rounded-full animate-spin [animation-duration:3s]" />

            {/* Radar Blips */}
            {/* Player (Center Green) */}
            <div className="relative z-10 h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            {/* Box (Yellow Blip) */}
            <div className="absolute top-4 right-5 h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_6px_#facc15]" />
            {/* Goal (Red Blip) */}
            <div className="absolute top-3 left-6 h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e]" />
            {/* Teammate (Blue Blip) */}
            <div className="absolute bottom-5 left-6 h-2 w-2 rounded-full bg-sky-400 shadow-[0_0_6px_#38bdf8]" />
          </div>
        </div>
      </div>

      {/* 2. BOTTOM BAR: Box Action Pill on Left + 4 Circular Skill Buttons on Right (matching Panel 6) */}
      <div className="flex items-end justify-between">
        {/* Bottom-Left: [E] 박스 놓기 > / [E] 박스 들기 > Pill Button (matching Panel 6) */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={onToggleGrab}
            className="flex items-center gap-2 rounded-full bg-slate-900/90 hover:bg-slate-800 backdrop-blur-md px-5 py-3 border-2 border-white/30 text-white font-black text-sm shadow-2xl transition hover:scale-105 active:scale-95"
          >
            <kbd className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-slate-950 text-xs font-black">
              E
            </kbd>
            <span>{isGrabbingBox ? '박스 놓기 >' : '박스 들기 >'}</span>
          </button>

          <button
            onClick={onRespawn}
            className="flex items-center gap-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md px-3.5 py-3 border border-white/20 text-white text-xs font-bold shadow"
            title="체크포인트 복귀 (R)"
          >
            <RotateCcw className="h-4 w-4 text-sky-400" />
            <kbd className="text-[10px] text-slate-400">R</kbd>
          </button>
        </div>

        {/* Bottom-Right: 4 Circular Scientific Force Skill Buttons (matching Panel 6) */}
        <div className="pointer-events-auto flex items-center gap-3">
          {/* 1. 중력 (Purple / Violet) */}
          <button
            onClick={() => onSwitchPower('gravity')}
            className={`group relative flex flex-col items-center justify-center h-16 w-16 md:h-20 md:w-20 rounded-full border-4 transition-all duration-200 shadow-2xl ${
              activePower === 'gravity'
                ? 'bg-purple-600 border-white ring-4 ring-purple-400/50 scale-110'
                : 'bg-purple-900/80 border-purple-400/40 opacity-80 hover:scale-105 hover:opacity-100'
            }`}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
              <Orbit className="h-5 w-5 text-white" />
            </div>
            <span className="text-[11px] md:text-xs font-black text-white mt-0.5">중력</span>
            <kbd className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 border border-white text-[10px] font-bold text-white shadow">
              1
            </kbd>
          </button>

          {/* 2. 마찰력 (Amber / Orange) */}
          <button
            onClick={() => onSwitchPower('friction')}
            className={`group relative flex flex-col items-center justify-center h-16 w-16 md:h-20 md:w-20 rounded-full border-4 transition-all duration-200 shadow-2xl ${
              activePower === 'friction'
                ? 'bg-amber-600 border-white ring-4 ring-amber-400/50 scale-110'
                : 'bg-amber-900/80 border-amber-400/40 opacity-80 hover:scale-105 hover:opacity-100'
            }`}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
              <Wind className="h-5 w-5 text-white" />
            </div>
            <span className="text-[11px] md:text-xs font-black text-white mt-0.5">마찰력</span>
            <kbd className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 border border-white text-[10px] font-bold text-white shadow">
              2
            </kbd>
          </button>

          {/* 3. 탄성력 (Golden Yellow Spring) */}
          <button
            onClick={() => onSwitchPower('elasticity')}
            className={`group relative flex flex-col items-center justify-center h-16 w-16 md:h-20 md:w-20 rounded-full border-4 transition-all duration-200 shadow-2xl ${
              activePower === 'elasticity'
                ? 'bg-yellow-500 border-white ring-4 ring-yellow-400/50 scale-110'
                : 'bg-yellow-800/80 border-yellow-400/40 opacity-80 hover:scale-105 hover:opacity-100'
            }`}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-[11px] md:text-xs font-black text-white mt-0.5">탄성력</span>
            <kbd className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 border border-white text-[10px] font-bold text-white shadow">
              3
            </kbd>
          </button>

          {/* 4. 부력 (Cyan Water Droplets) */}
          <button
            onClick={() => onSwitchPower('buoyancy')}
            className={`group relative flex flex-col items-center justify-center h-16 w-16 md:h-20 md:w-20 rounded-full border-4 transition-all duration-200 shadow-2xl ${
              activePower === 'buoyancy'
                ? 'bg-cyan-500 border-white ring-4 ring-cyan-400/50 scale-110'
                : 'bg-cyan-900/80 border-cyan-400/40 opacity-80 hover:scale-105 hover:opacity-100'
            }`}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
              <Droplets className="h-5 w-5 text-white" />
            </div>
            <span className="text-[11px] md:text-xs font-black text-white mt-0.5">부력</span>
            <kbd className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 border border-white text-[10px] font-bold text-white shadow">
              4
            </kbd>
          </button>
        </div>
      </div>
    </div>
  );
};
