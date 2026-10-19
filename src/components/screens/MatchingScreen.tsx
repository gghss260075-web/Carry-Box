/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GameModeId, MapId, PlayerSlot } from '../../types/game';
import { MAPS } from '../../data/constants';
import { ArrowLeft, Loader2, Bot, Sparkles } from 'lucide-react';

interface MatchingScreenProps {
  mapId: MapId;
  modeId: GameModeId;
  playerName: string;
  playerColor: string;
  playerHat: string;
  playerShirt: string;
  playerPants: string;
  onMatchComplete: (roster: PlayerSlot[]) => void;
  onCancel: () => void;
}

export const MatchingScreen: React.FC<MatchingScreenProps> = ({
  mapId,
  modeId,
  playerName,
  playerColor,
  playerHat,
  playerShirt,
  playerPants,
  onMatchComplete,
  onCancel,
}) => {
  const [progress, setProgress] = useState(15);
  const currentMap = MAPS[mapId];

  // Prepare full roster
  const ourTeamSlots: PlayerSlot[] = [
    {
      id: 'local_player',
      name: playerName || 'Player_1234',
      isBot: false,
      isHost: true,
      isReady: true,
      team: 'blue',
      color: playerColor,
      hat: playerHat,
      shirt: playerShirt,
      pants: playerPants,
      speechText: '준비됐어요!',
      avatarId: 'p0',
    },
    {
      id: 'bot_1',
      name: 'BOT-1',
      isBot: true,
      isHost: false,
      isReady: true,
      team: 'blue',
      color: '#38bdf8',
      hat: 'hardhat',
      shirt: 'basic_hoodie',
      pants: 'denim_jeans',
      speechText: '잡아요!',
      avatarId: 'b1',
    },
    {
      id: 'bot_2',
      name: 'BOT-2',
      isBot: true,
      isHost: false,
      isReady: true,
      team: 'blue',
      color: '#34d399',
      hat: 'beanie',
      shirt: 'striped_tee',
      pants: 'cargo_pants',
      speechText: '가자!',
      avatarId: 'b2',
    },
  ];

  const enemyTeamSlots: PlayerSlot[] = [
    {
      id: 'bot_3',
      name: 'BOT-3',
      isBot: true,
      isHost: false,
      isReady: true,
      team: 'red',
      color: '#f87171',
      hat: 'hardhat',
      shirt: 'work_vest',
      pants: 'denim_jeans',
      speechText: '힘 내보자구요!',
      avatarId: 'b3',
    },
    {
      id: 'bot_4',
      name: 'BOT-4',
      isBot: true,
      isHost: false,
      isReady: true,
      team: 'red',
      color: '#fb923c',
      hat: 'catears',
      shirt: 'hero_suit',
      pants: 'track_joggers',
      speechText: '막아낼게요!',
      avatarId: 'b4',
    },
    {
      id: 'bot_5',
      name: 'BOT-5',
      isBot: true,
      isHost: false,
      isReady: true,
      team: 'red',
      color: '#c084fc',
      hat: 'crown',
      shirt: 'winter_sweater',
      pants: 'sport_shorts',
      speechText: '이겨봅시다!',
      avatarId: 'b5',
    },
  ];

  const fullRoster = [...ourTeamSlots, ...enemyTeamSlots];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            onMatchComplete(fullRoster);
          }, 400);
          return 100;
        }
        return prev + 18;
      });
    }, 450);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-900 select-none p-6 md:p-10 flex flex-col justify-between text-slate-100">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-sky-950/40 to-slate-950 pointer-events-none" />

      {/* Top Header: ← 팀 매칭 중... (matching Panel 4) */}
      <div className="relative z-10 flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-white shadow transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">팀 매칭 중...</h1>
        </div>

        {/* Expected wait time badge */}
        <div className="rounded-xl bg-slate-800/90 px-4 py-2 text-xs font-bold text-slate-300 border border-slate-700/60 shadow">
          예상 대기 시간 : <strong className="text-sky-400">10초</strong>
        </div>
      </div>

      {/* Center Layout: Our Team VS Enemy Team + Right Map Card (matching Panel 4) */}
      <div className="relative z-10 my-auto flex flex-col lg:flex-row items-center justify-center gap-6 py-6 max-w-5xl mx-auto w-full">
        {/* Matchup Container */}
        <div className="flex flex-1 flex-col sm:flex-row items-center justify-center gap-4 w-full">
          {/* 우리 팀 (Blue Container) */}
          <div className="w-full sm:w-64 rounded-2xl border-2 border-blue-500/60 bg-blue-950/40 p-4 shadow-xl">
            <div className="text-center pb-2.5 border-b border-blue-500/30 mb-3">
              <h3 className="text-sm font-black text-blue-300">우리 팀</h3>
            </div>

            <div className="space-y-2">
              {ourTeamSlots.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center gap-2.5 rounded-xl bg-slate-900/90 p-2.5 border border-blue-500/20 shadow-sm"
                >
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full text-slate-900 shadow shrink-0 font-bold"
                    style={{ backgroundColor: player.color }}
                  >
                    {player.isBot ? <Bot className="h-4 w-4 text-slate-950" /> : <Sparkles className="h-4 w-4 text-slate-950" />}
                  </div>
                  <span className="text-xs font-black text-white truncate">{player.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* VS Center Badge */}
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 border-2 border-slate-700 text-lg font-black text-amber-400 shadow-xl shrink-0">
            VS
          </div>

          {/* 상대 팀 (Red Container) */}
          <div className="w-full sm:w-64 rounded-2xl border-2 border-red-500/60 bg-red-950/40 p-4 shadow-xl">
            <div className="text-center pb-2.5 border-b border-red-500/30 mb-3">
              <h3 className="text-sm font-black text-red-300">상대 팀</h3>
            </div>

            <div className="space-y-2">
              {enemyTeamSlots.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center gap-2.5 rounded-xl bg-slate-900/90 p-2.5 border border-red-500/20 shadow-sm"
                >
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full text-slate-900 shadow shrink-0 font-bold"
                    style={{ backgroundColor: player.color }}
                  >
                    <Bot className="h-4 w-4 text-slate-950" />
                  </div>
                  <span className="text-xs font-black text-white truncate">{player.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Map Thumbnail Preview */}
        <div className="w-full sm:w-56 rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl text-center shrink-0">
          <div className="h-28 w-full rounded-xl bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center text-3xl shadow-inner mb-3">
            <span>☁️</span>
          </div>
          <h4 className="text-sm font-black text-white">{currentMap.nameKo}</h4>
          <span className="text-[11px] text-slate-400 font-bold">
            {modeId === 'team_battle_3v3' ? '3 vs 3 대결' : '4인 협동 운반'}
          </span>
        </div>
      </div>

      {/* Bottom Bar: Spinner + Progress Bar + 매칭 취소 Button (matching Panel 4) */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl bg-slate-900/90 border border-slate-800 p-4 shadow-2xl">
        <div className="flex items-center gap-3 flex-1 w-full">
          <Loader2 className="h-5 w-5 animate-spin text-sky-400 shrink-0" />
          <span className="text-xs font-bold text-slate-200 shrink-0">매칭 중...</span>

          {/* Progress Bar */}
          <div className="h-3 flex-1 rounded-full bg-slate-800 overflow-hidden border border-slate-700/60 p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-500 to-blue-500 transition-all duration-300 shadow"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <button
          onClick={onCancel}
          className="rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 px-5 py-2.5 text-xs font-bold text-slate-300 transition shrink-0"
        >
          매칭 취소
        </button>
      </div>
    </div>
  );
};
