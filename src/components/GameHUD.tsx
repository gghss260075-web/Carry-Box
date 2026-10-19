/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ForcePower, GameModeId, MapId, TeamColor } from '../types/game';
import { FORCE_POWERS, MAPS, GAME_MODES } from '../data/constants';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  LogOut,
  ChevronDown,
  ChevronUp,
  MapPin,
  Trophy,
  Zap,
  Hand,
} from 'lucide-react';
import { sounds } from '../services/sound';

interface GameHUDProps {
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
  onSwitchPower: (power: ForcePower) => void;
  onRespawn: () => void;
  onExitGame: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
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
  onSwitchPower,
  onRespawn,
  onExitGame,
}) => {
  const [isMuted, setIsMuted] = useState(sounds.isMuted());
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);

  const toggleMute = () => {
    const next = !isMuted;
    sounds.setMuted(next);
    setIsMuted(next);
  };

  const powersList: ForcePower[] = ['gravity', 'friction', 'elasticity', 'buoyancy'];
  const isTeamBattle = modeId === 'team_battle_3v3';

  return (
    <div className="pointer-events-none fixed inset-0 z-40 flex flex-col justify-between p-4 md:p-6 text-slate-100 select-none">
      {/* 1. TOP PERIMETER CLUSTER */}
      <div className="flex items-start justify-between">
        {/* Top Left: Map, Mode & Distance Radar */}
        <div className="pointer-events-auto flex flex-col gap-2 rounded-2xl border border-slate-700/60 bg-slate-900/90 p-3.5 shadow-lg max-w-xs">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400">
              <MapPin className="h-4 w-4" />
            </span>
            <div>
              <h4 className="text-xs font-black text-white">{MAPS[mapId].nameKo}</h4>
              <p className="text-[10px] text-slate-400">{GAME_MODES[modeId].nameKo}</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
            <span className="text-slate-400">목표 포털 거리:</span>
            <span className="font-mono font-bold text-amber-300 tabular-nums">{distanceToGoal} m</span>
          </div>

          {checkpointIndex > 0 && (
            <div className="flex items-center gap-1.5 rounded-lg bg-indigo-950/60 px-2 py-1 text-[11px] text-indigo-300 border border-indigo-500/30">
              <span>✓ 체크포인트 {checkpointIndex} 통과됨</span>
            </div>
          )}
        </div>

        {/* Top Center: Mission Tracker / Team Scores */}
        <div className="pointer-events-auto rounded-2xl border border-slate-700/60 bg-slate-900/90 px-6 py-3 shadow-xl text-center">
          {isTeamBattle ? (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                3v3 팀 대결 스코어 (목표: {targetBoxes}개)
              </span>
              <div className="mt-1 flex items-center justify-center gap-6 font-mono text-2xl font-black tabular-nums">
                <div className="flex items-center gap-2 text-rose-400">
                  <span className="text-xs font-sans uppercase">RED</span>
                  <span className="text-3xl font-black">{redScore}</span>
                </div>
                <span className="text-slate-600">:</span>
                <div className="flex items-center gap-2 text-blue-400">
                  <span className="text-3xl font-black">{blueScore}</span>
                  <span className="text-xs font-sans uppercase">BLUE</span>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                내 팀: <strong className={playerTeam === 'red' ? 'text-rose-400' : 'text-blue-400'}>{playerTeam.toUpperCase()}</strong>
              </span>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-400">
                <Trophy className="h-4 w-4" />
                <span>협동 에너지 상자 운반 현황</span>
              </div>
              <div className="mt-1 flex items-center justify-center gap-3">
                <div className="flex gap-1.5">
                  {Array.from({ length: targetBoxes }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-4 w-8 rounded-md transition-all ${
                        i < coopDelivered
                          ? 'bg-emerald-500 shadow-md shadow-emerald-500/50'
                          : 'bg-slate-800 border border-slate-700'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-mono text-lg font-black text-white tabular-nums">
                  {coopDelivered} / {targetBoxes}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Top Right: System controls */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={onRespawn}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700/60 bg-slate-900/90 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800 transition shadow"
            title="체크포인트로 복귀 (R)"
          >
            <RotateCcw className="h-3.5 w-3.5 text-indigo-400" />
            <span className="hidden sm:inline">체크포인트 복귀</span>
            <kbd className="rounded bg-slate-800 px-1 py-0.5 text-[10px] text-slate-400">R</kbd>
          </button>

          <button
            onClick={toggleMute}
            className="rounded-xl border border-slate-700/60 bg-slate-900/90 p-2 text-slate-300 hover:bg-slate-800 transition shadow"
            title={isMuted ? '음소거 해제' : '음소거'}
          >
            {isMuted ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4" />}
          </button>

          <button
            onClick={onExitGame}
            className="rounded-xl border border-rose-500/40 bg-slate-900/90 p-2 text-rose-400 hover:bg-rose-950/60 transition shadow"
            title="게임 나가기 (로비 이동)"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 2. UNIFIED BOTTOM CONTROL DOCK (Zero Viewport Occlusion) */}
      <div className="pointer-events-auto mx-auto flex flex-col items-center max-w-3xl w-full">
        {/* Collapse / Expand Toggle Tab */}
        <button
          onClick={() => setIsDockCollapsed(!isDockCollapsed)}
          className="flex items-center gap-1.5 rounded-t-xl bg-slate-900/95 border-t border-x border-slate-700/60 px-4 py-1 text-[11px] font-semibold text-slate-400 hover:text-white transition shadow"
        >
          {isDockCollapsed ? (
            <>
              <ChevronUp className="h-3.5 w-3.5" />
              <span>능력 및 조작 독 펼치기</span>
            </>
          ) : (
            <>
              <ChevronDown className="h-3.5 w-3.5" />
              <span>조작 가이드 접기</span>
            </>
          )}
        </button>

        {/* Main Dock Container */}
        <div
          className={`w-full rounded-2xl border border-slate-700/70 bg-slate-900/95 p-3 md:p-4 shadow-2xl transition-all duration-300 ${
            isDockCollapsed ? 'hidden' : 'flex flex-col gap-3'
          }`}
        >
          {/* Active Power Summary */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-bold text-slate-200">
                현재 활성화된 과학의 힘:
              </span>
              <span
                className="text-xs font-black px-2 py-0.5 rounded-md"
                style={{
                  color: FORCE_POWERS[activePower].color,
                  backgroundColor: `${FORCE_POWERS[activePower].color}22`,
                }}
              >
                {FORCE_POWERS[activePower].nameKo}
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <Hand className="h-3.5 w-3.5 text-indigo-400" />
              <span>상자 잡기/놓기: <kbd className="rounded bg-slate-800 px-1 py-0.5 font-bold text-slate-300">E</kbd></span>
            </div>
          </div>

          {/* 4 Force Power Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {powersList.map((pKey, idx) => {
              const cfg = FORCE_POWERS[pKey];
              const isSelected = activePower === pKey;

              return (
                <button
                  key={pKey}
                  onClick={() => onSwitchPower(pKey)}
                  className={`relative flex flex-col items-start rounded-xl p-2.5 text-left transition-all ${
                    isSelected
                      ? 'bg-slate-800 ring-2 ring-indigo-400 shadow-md translate-y-[-2px]'
                      : 'bg-slate-800/60 hover:bg-slate-800/90 text-slate-300'
                  }`}
                  style={{
                    borderColor: isSelected ? cfg.color : 'transparent',
                  }}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
                      {cfg.nameKo.split(' ')[0]}
                    </span>
                    <kbd className="rounded bg-slate-700 px-1.5 py-0.5 text-[10px] font-bold text-slate-300">
                      {idx + 1}
                    </kbd>
                  </div>
                  <p className="mt-1 text-[10px] text-slate-400 leading-snug line-clamp-1">
                    {cfg.effectSummary}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Single Flat Control Hint Line */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 font-medium">
            <span><strong>WASD</strong> 이동</span>
            <span>·</span>
            <span><strong>Space</strong> 점프</span>
            <span>·</span>
            <span><strong>E</strong> 상자 들기/밀기</span>
            <span>·</span>
            <span><strong>R</strong> 체크포인트</span>
            <span>·</span>
            <span><strong>1~4</strong> 과학의 힘 전환</span>
          </div>
        </div>
      </div>
    </div>
  );
};
