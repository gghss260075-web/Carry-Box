/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GameModeId, MapId, PlayerSlot, TeamColor } from '../types/game';
import { MAPS, GAME_MODES, BOT_NAMES, CHARACTER_COLORS, CHARACTER_HATS } from '../data/constants';
import { Users, Bot, Play, ArrowLeft, RefreshCw, Sparkles, MapPin, Trophy, Shield } from 'lucide-react';

interface WaitingRoomViewProps {
  mapId: MapId;
  modeId: GameModeId;
  playerName: string;
  playerColor: string;
  playerHat: string;
  onStartMatch: (roster: PlayerSlot[]) => void;
  onOpenMapSelect: () => void;
  onOpenModeSelect: () => void;
  onBackToLobby: () => void;
}

export const WaitingRoomView: React.FC<WaitingRoomViewProps> = ({
  mapId,
  modeId,
  playerName,
  playerColor,
  playerHat,
  onStartMatch,
  onOpenMapSelect,
  onOpenModeSelect,
  onBackToLobby,
}) => {
  const isTeamBattle = modeId === 'team_battle_3v3';
  const totalSlots = isTeamBattle ? 6 : 4;

  const [playerTeam, setPlayerTeam] = useState<TeamColor>(isTeamBattle ? 'red' : 'neutral');
  const [isReady, setIsReady] = useState<boolean>(true);

  // Initialize bot slots
  const generateInitialSlots = (userTeam: TeamColor): PlayerSlot[] => {
    const slots: PlayerSlot[] = [];

    // Local player slot
    slots.push({
      id: 'local_player',
      name: `${playerName} (나)`,
      isBot: false,
      isHost: true,
      isReady: true,
      team: userTeam,
      color: playerColor,
      hat: playerHat,
      avatarId: 'p0',
    });

    if (isTeamBattle) {
      // 3 vs 3: 3 Red slots, 3 Blue slots
      let redCount = userTeam === 'red' ? 1 : 0;
      let blueCount = userTeam === 'blue' ? 1 : 0;

      for (let i = 1; i < totalSlots; i++) {
        const team: TeamColor = redCount < 3 ? 'red' : 'blue';
        if (team === 'red') redCount++;
        else blueCount++;

        const botName = BOT_NAMES[(i - 1) % BOT_NAMES.length];
        const randomColor = CHARACTER_COLORS[i % CHARACTER_COLORS.length].hex;
        const randomHat = CHARACTER_HATS[(i + 1) % CHARACTER_HATS.length].id;

        slots.push({
          id: `bot_${i}`,
          name: `${botName} (봇)`,
          isBot: true,
          isHost: false,
          isReady: true,
          team,
          color: randomColor,
          hat: randomHat,
          avatarId: `b${i}`,
        });
      }
    } else {
      // Co-op 4 slots
      for (let i = 1; i < totalSlots; i++) {
        const botName = BOT_NAMES[(i - 1) % BOT_NAMES.length];
        const randomColor = CHARACTER_COLORS[i % CHARACTER_COLORS.length].hex;
        const randomHat = CHARACTER_HATS[(i + 1) % CHARACTER_HATS.length].id;

        slots.push({
          id: `bot_${i}`,
          name: `${botName} (봇)`,
          isBot: true,
          isHost: false,
          isReady: true,
          team: 'neutral',
          color: randomColor,
          hat: randomHat,
          avatarId: `b${i}`,
        });
      }
    }

    return slots;
  };

  const [roster, setRoster] = useState<PlayerSlot[]>(() => generateInitialSlots(playerTeam));

  const handleShuffleBots = () => {
    setRoster((prev) => {
      return prev.map((slot, idx) => {
        if (!slot.isBot) return slot;
        const randomName = BOT_NAMES[(idx + Math.floor(Math.random() * 5)) % BOT_NAMES.length];
        const randomColor = CHARACTER_COLORS[Math.floor(Math.random() * CHARACTER_COLORS.length)].hex;
        const randomHat = CHARACTER_HATS[Math.floor(Math.random() * CHARACTER_HATS.length)].id;
        return {
          ...slot,
          name: `${randomName} (봇)`,
          color: randomColor,
          hat: randomHat,
        };
      });
    });
  };

  const handleChangeTeam = (newTeam: TeamColor) => {
    setPlayerTeam(newTeam);
    setRoster(generateInitialSlots(newTeam));
  };

  const redSlots = roster.filter((s) => s.team === 'red');
  const blueSlots = roster.filter((s) => s.team === 'blue');

  return (
    <div className="flex h-full w-full flex-col justify-between p-6 md:p-10 text-slate-100 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <button
          onClick={onBackToLobby}
          className="flex items-center gap-2 rounded-xl bg-slate-800/80 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>로비로 나가기</span>
        </button>

        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
            <span>매치 대기실 (MATCH LOBBY)</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">팀 구성 & AI 매칭 완료</h1>
        </div>

        <button
          onClick={handleShuffleBots}
          className="flex items-center gap-1.5 rounded-xl bg-slate-800/80 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition"
          title="봇 구성 다시 섞기"
        >
          <RefreshCw className="h-3.5 w-3.5 text-indigo-400" />
          <span>봇 재매칭</span>
        </button>
      </div>

      {/* Map & Mode Summary Bar */}
      <div className="my-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-medium">선택된 맵</span>
              <p className="text-sm font-bold text-white">{MAPS[mapId].nameKo}</p>
            </div>
            <button
              onClick={onOpenMapSelect}
              className="ml-2 rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-sky-400 hover:bg-slate-700 transition"
            >
              변경
            </button>
          </div>

          <div className="h-8 w-px bg-slate-800"></div>

          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-medium">게임 모드</span>
              <p className="text-sm font-bold text-white">{GAME_MODES[modeId].nameKo}</p>
            </div>
            <button
              onClick={onOpenModeSelect}
              className="ml-2 rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-indigo-400 hover:bg-slate-700 transition"
            >
              변경
            </button>
          </div>
        </div>

        {isTeamBattle && (
          <div className="flex items-center gap-2 rounded-xl bg-slate-800/80 p-1 border border-slate-700/60">
            <span className="text-xs text-slate-400 px-2 font-medium">내 팀 선택:</span>
            <button
              onClick={() => handleChangeTeam('red')}
              className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                playerTeam === 'red' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              레드 팀
            </button>
            <button
              onClick={() => handleChangeTeam('blue')}
              className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                playerTeam === 'blue' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              블루 팀
            </button>
          </div>
        )}
      </div>

      {/* Roster Layout */}
      {isTeamBattle ? (
        /* 3 vs 3 Team Layout */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-auto py-2">
          {/* Red Team */}
          <div className="rounded-3xl border border-rose-500/30 bg-rose-950/20 p-5 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-rose-500/20 mb-3">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-500"></span>
                <h3 className="text-base font-black text-rose-400">레드 팀 (RED TEAM)</h3>
              </div>
              <span className="text-xs font-bold text-rose-300">3 / 3 준비 완료</span>
            </div>

            <div className="space-y-2.5">
              {redSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center justify-between rounded-2xl bg-slate-900/80 p-3.5 border border-slate-800/80"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-full border-2 border-white/20 shadow-inner flex items-center justify-center text-xs font-bold text-slate-950"
                      style={{ backgroundColor: slot.color }}
                    >
                      {slot.isBot ? <Bot className="h-5 w-5 text-slate-900" /> : <Sparkles className="h-5 w-5 text-slate-900" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{slot.name}</span>
                        {slot.isHost && (
                          <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">
                            방장
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400">
                        모자: {CHARACTER_HATS.find((h) => h.id === slot.hat)?.name || '기본'}
                      </span>
                    </div>
                  </div>
                  <span className="rounded-lg bg-emerald-500/20 px-2.5 py-1 text-xs font-bold text-emerald-400">
                    준비됨
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Blue Team */}
          <div className="rounded-3xl border border-blue-500/30 bg-blue-950/20 p-5 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-blue-500/20 mb-3">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-blue-500"></span>
                <h3 className="text-base font-black text-blue-400">블루 팀 (BLUE TEAM)</h3>
              </div>
              <span className="text-xs font-bold text-blue-300">3 / 3 준비 완료</span>
            </div>

            <div className="space-y-2.5">
              {blueSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center justify-between rounded-2xl bg-slate-900/80 p-3.5 border border-slate-800/80"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-full border-2 border-white/20 shadow-inner flex items-center justify-center text-xs font-bold text-slate-950"
                      style={{ backgroundColor: slot.color }}
                    >
                      {slot.isBot ? <Bot className="h-5 w-5 text-slate-900" /> : <Sparkles className="h-5 w-5 text-slate-900" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{slot.name}</span>
                        {slot.isHost && (
                          <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">
                            방장
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400">
                        모자: {CHARACTER_HATS.find((h) => h.id === slot.hat)?.name || '기본'}
                      </span>
                    </div>
                  </div>
                  <span className="rounded-lg bg-emerald-500/20 px-2.5 py-1 text-xs font-bold text-emerald-400">
                    준비됨
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Co-op 4 Player Layout */
        <div className="rounded-3xl border border-emerald-500/30 bg-slate-900/90 p-6 my-auto shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-400" />
              <h3 className="text-base font-black text-white">협동 탐험 원정대 (4인 스쿼드)</h3>
            </div>
            <span className="text-xs font-bold text-emerald-400">4 / 4 전원 준비 완료</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {roster.map((slot) => (
              <div
                key={slot.id}
                className="flex flex-col items-center justify-center rounded-2xl bg-slate-800/60 p-5 border border-slate-700/60 text-center"
              >
                <div
                  className="h-14 w-14 rounded-full border-2 border-white/20 shadow-md flex items-center justify-center text-slate-950 mb-3"
                  style={{ backgroundColor: slot.color }}
                >
                  {slot.isBot ? <Bot className="h-7 w-7 text-slate-900" /> : <Sparkles className="h-7 w-7 text-slate-900" />}
                </div>
                <span className="text-sm font-bold text-white flex items-center gap-1.5">
                  {slot.name}
                </span>
                <span className="text-xs text-slate-400 mt-0.5">
                  {CHARACTER_HATS.find((h) => h.id === slot.hat)?.name || '기본'}
                </span>
                <span className="mt-3 rounded-lg bg-emerald-500/20 px-2.5 py-1 text-[11px] font-bold text-emerald-400">
                  준비 완료
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Start Controls */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsReady(!isReady)}
            className={`rounded-xl px-5 py-3 text-sm font-bold transition ${
              isReady
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {isReady ? '✓ 준비 완료 상태' : '준비 하기'}
          </button>
          <span className="text-xs text-slate-400 hidden sm:inline">
            빈자리는 똑똑하고 서툰 AI 봇이 자동으로 채워집니다.
          </span>
        </div>

        <button
          onClick={() => onStartMatch(roster)}
          className="flex items-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 px-8 py-3.5 text-base font-black text-white shadow-2xl shadow-indigo-600/40 hover:scale-[1.02] active:scale-[0.98] transition"
        >
          <Play className="h-5 w-5 fill-current" />
          <span>게임 시작 (ENTER GAME)</span>
        </button>
      </div>
    </div>
  );
};
