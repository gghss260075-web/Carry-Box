/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GameModeId, MapId, PlayerStats } from '../types/game';
import { CharacterViewer3D } from './CharacterViewer3D';
import { MAPS, GAME_MODES, CHARACTER_COLORS, CHARACTER_HATS } from '../data/constants';
import {
  Play,
  Compass,
  Trophy,
  BookOpen,
  User,
  LogOut,
  Palette,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { auth } from '../services/auth';

interface LobbyViewProps {
  stats: PlayerStats | null;
  selectedMap: MapId;
  selectedMode: GameModeId;
  onEnterWaitingRoom: () => void;
  onOpenMapSelect: () => void;
  onOpenModeSelect: () => void;
  onOpenForcesGuide: () => void;
  onOpenLoginModal: () => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({
  stats,
  selectedMap,
  selectedMode,
  onEnterWaitingRoom,
  onOpenMapSelect,
  onOpenModeSelect,
  onOpenForcesGuide,
  onOpenLoginModal,
}) => {
  const currentColor = stats?.selectedColor || '#fb7185';
  const currentHat = stats?.selectedHat || 'hardhat';

  const handleColorChange = (colorHex: string) => {
    auth.updateAppearance(colorHex, currentHat);
  };

  const handleHatChange = (hatId: string) => {
    auth.updateAppearance(currentColor, hatId);
  };

  const handleLogout = () => {
    auth.logout();
  };

  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-hidden bg-slate-950 p-6 md:p-8 text-slate-100">
      {/* Background ambient radial glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-indigo-500/10 blur-[120px]" />

      {/* TOP HEADER */}
      <div className="z-10 flex items-center justify-between">
        {/* Bespoke Game Title Lockup */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-600/30">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-indigo-950 px-1.5 py-0.5 text-[10px] font-bold text-indigo-400 border border-indigo-500/30">
                HUMAN FORCE FALL
              </span>
              <span className="text-[10px] text-slate-400 font-medium">3D 물리 액션</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
              험난한 힘의 탑
            </h1>
          </div>
        </div>

        {/* User Account Bar */}
        <div className="flex items-center gap-3">
          {stats ? (
            <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/90 px-4 py-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400">
                <User className="h-4 w-4" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white">{stats.username}</span>
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <span>승리: <strong className="text-emerald-400">{stats.wins}</strong></span>
                  <span>·</span>
                  <span>상자: <strong className="text-amber-400">{stats.boxesDelivered}개</strong></span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="ml-2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
                title="로그아웃"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLoginModal}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition"
            >
              <User className="h-4 w-4" />
              <span>로그인 / 회원가입</span>
            </button>
          )}

          <button
            onClick={onOpenForcesGuide}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-bold text-slate-300 hover:bg-slate-700 hover:text-white transition"
          >
            <BookOpen className="h-4 w-4 text-amber-400" />
            <span className="hidden sm:inline">과학 도감</span>
          </button>
        </div>
      </div>

      {/* CENTER STAGE: 3D HERO CHARACTER IN THE CENTER */}
      <div className="relative z-0 flex flex-1 flex-col items-center justify-center my-2">
        <div className="h-[280px] md:h-[360px] w-full max-w-lg cursor-grab active:cursor-grabbing">
          <CharacterViewer3D color={currentColor} hat={currentHat} />
        </div>

        {/* Character Customization Bar (Color & Hat Swatches) */}
        <div className="z-10 -mt-4 flex flex-wrap items-center justify-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/90 px-5 py-2.5 shadow-xl">
          {/* Colors */}
          <div className="flex items-center gap-1.5">
            <Palette className="h-3.5 w-3.5 text-slate-400" />
            <div className="flex gap-1.5">
              {CHARACTER_COLORS.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => handleColorChange(c.hex)}
                  className={`h-6 w-6 rounded-full border-2 transition-transform ${
                    currentColor === c.hex
                      ? 'scale-110 border-white shadow-md'
                      : 'border-transparent opacity-80 hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          <div className="h-5 w-px bg-slate-800"></div>

          {/* Hats */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium text-slate-400">모자:</span>
            <div className="flex gap-1">
              {CHARACTER_HATS.map((h) => (
                <button
                  key={h.id}
                  onClick={() => handleHatChange(h.id)}
                  className={`rounded-lg px-2 py-0.5 text-[11px] font-semibold transition ${
                    currentHat === h.id
                      ? 'bg-indigo-600 text-white shadow'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {h.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM ACTION DOCK & MENU BUTTONS */}
      <div className="z-10 mx-auto w-full max-w-4xl">
        {/* Selected Config Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {/* Map Preview Card */}
          <div
            onClick={onOpenMapSelect}
            className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/80 p-3.5 hover:border-slate-700 hover:bg-slate-850 cursor-pointer transition shadow"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400">
                <Compass className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  MAP SELECTION
                </span>
                <p className="text-sm font-bold text-white">{MAPS[selectedMap].nameKo}</p>
              </div>
            </div>
            <span className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-sky-400 font-semibold">
              변경
            </span>
          </div>

          {/* Mode Preview Card */}
          <div
            onClick={onOpenModeSelect}
            className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/80 p-3.5 hover:border-slate-700 hover:bg-slate-850 cursor-pointer transition shadow"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  GAME MODE
                </span>
                <p className="text-sm font-bold text-white">{GAME_MODES[selectedMode].nameKo}</p>
              </div>
            </div>
            <span className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-amber-400 font-semibold">
              변경
            </span>
          </div>
        </div>

        {/* Primary Start CTA Button */}
        <button
          onClick={onEnterWaitingRoom}
          className="group relative flex w-full items-center justify-center gap-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 py-4 text-lg font-black text-white shadow-2xl shadow-indigo-600/40 hover:scale-[1.01] active:scale-[0.99] transition"
        >
          <Play className="h-6 w-6 fill-current" />
          <span>게임 시작 (대기실 입장)</span>
          <span className="rounded-lg bg-indigo-700/60 px-2 py-0.5 text-xs font-semibold text-indigo-200">
            ENTER
          </span>
        </button>

        {/* Flat control hint line */}
        <p className="text-center text-xs text-slate-500 mt-2.5">
          WASD 이동 · Space 점프 · E 상자 잡기/놓기 · R 체크포인트 · 1-4 과학의 힘
        </p>
      </div>
    </div>
  );
};
