/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GameModeId } from '../../types/game';
import { ArrowLeft, Users, Bot, Infinity as InfinityIcon, Check } from 'lucide-react';

interface ModeSelectScreenProps {
  selectedMode: GameModeId;
  onSelectMode: (mode: GameModeId) => void;
  onConfirm: () => void;
  onBack: () => void;
}

export const ModeSelectScreen: React.FC<ModeSelectScreenProps> = ({
  selectedMode,
  onSelectMode,
  onConfirm,
  onBack,
}) => {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-900 select-none p-6 md:p-10 flex flex-col justify-between text-slate-100">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-950 pointer-events-none" />

      {/* Top Header: ← 게임 모드 선택 (matching Panel 3) */}
      <div className="relative z-10 flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-white shadow transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">게임 모드 선택</h1>
        </div>
      </div>

      {/* Center Layout: 2 Big Mode Cards + Right Info Panel (matching Panel 3) */}
      <div className="relative z-10 my-auto flex flex-col lg:flex-row items-stretch gap-6 py-4">
        {/* Left: 2 Big Mode Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
          {/* 1. 협동 박스 운단 (Co-op) */}
          <div
            onClick={() => onSelectMode('coop_haul')}
            className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border cursor-pointer transition-all duration-200 ${
              selectedMode === 'coop_haul'
                ? 'border-sky-400 bg-slate-800/90 ring-4 ring-sky-500/30 -translate-y-1.5 shadow-2xl'
                : 'border-slate-800 bg-slate-900/80 hover:border-slate-700 hover:bg-slate-850'
            }`}
          >
            {/* Visual Graphic Banner */}
            <div className="relative h-56 w-full bg-gradient-to-b from-sky-400 to-blue-700 p-6 flex flex-col justify-between overflow-hidden">
              <div className="flex justify-between items-start">
                <span className="rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-bold text-white uppercase tracking-wider">
                  CO-OP MODE
                </span>
                {selectedMode === 'coop_haul' && (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-900 shadow">
                    <Check className="h-4 w-4 stroke-[3]" />
                  </span>
                )}
              </div>

              {/* Characters Illustration Silhouette */}
              <div className="flex items-center justify-center gap-3 my-auto">
                <span className="text-6xl drop-shadow-md">👷‍♂️</span>
                <span className="text-5xl drop-shadow-md">📦</span>
                <span className="text-6xl drop-shadow-md">👷‍♀️</span>
              </div>

              <div className="text-center">
                <h3 className="text-2xl font-black text-white drop-shadow">협동 박스 운반</h3>
              </div>
            </div>

            {/* Subtitle */}
            <div className="p-4 bg-slate-900/95 text-center">
              <p className="text-xs font-bold text-slate-300">
                팀과 함께 박스를 옮겨 목표 지점에 도달하세요!
              </p>
            </div>
          </div>

          {/* 2. 팀 대결 (3 vs 3 Team Battle) */}
          <div
            onClick={() => onSelectMode('team_battle_3v3')}
            className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border cursor-pointer transition-all duration-200 ${
              selectedMode === 'team_battle_3v3'
                ? 'border-rose-400 bg-slate-800/90 ring-4 ring-rose-500/30 -translate-y-1.5 shadow-2xl'
                : 'border-slate-800 bg-slate-900/80 hover:border-slate-700 hover:bg-slate-850'
            }`}
          >
            {/* Visual Graphic Banner */}
            <div className="relative h-56 w-full bg-gradient-to-b from-rose-400 to-red-700 p-6 flex flex-col justify-between overflow-hidden">
              <div className="flex justify-between items-start">
                <span className="rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-bold text-white uppercase tracking-wider">
                  PVP BATTLE
                </span>
                {selectedMode === 'team_battle_3v3' && (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-900 shadow">
                    <Check className="h-4 w-4 stroke-[3]" />
                  </span>
                )}
              </div>

              {/* Characters Facing Off */}
              <div className="flex items-center justify-center gap-4 my-auto">
                <span className="text-6xl drop-shadow-md">🔴</span>
                <span className="text-5xl font-black text-white italic drop-shadow-lg">VS</span>
                <span className="text-6xl drop-shadow-md">🔵</span>
              </div>

              <div className="text-center">
                <h3 className="text-2xl font-black text-white drop-shadow">팀 대결</h3>
              </div>
            </div>

            {/* Subtitle */}
            <div className="p-4 bg-slate-900/95 text-center">
              <p className="text-xs font-bold text-slate-300">
                상대 팀보다 더 많은 박스를 목표 지점에 운반하세요!
              </p>
            </div>
          </div>
        </div>

        {/* Right: Mode Info Box (matching Panel 3) */}
        <div className="w-full lg:w-80 rounded-2xl border border-slate-800 bg-slate-900/95 p-6 shadow-2xl flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-base font-black text-white pb-3 border-b border-slate-800">
              {selectedMode === 'coop_haul' ? '협동 박스 운반 모드' : '3대3 팀 대결 모드'}
            </h3>

            {/* Info rows matching icons in image */}
            <div className="space-y-3.5">
              <div className="flex items-center gap-3 rounded-xl bg-slate-800/70 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400 shrink-0">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">플레이 인원</span>
                  <p className="text-xs font-black text-white">
                    {selectedMode === 'coop_haul' ? '4인 협동' : '3 vs 3'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-slate-800/70 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">AI 봇 지원</span>
                  <p className="text-xs font-black text-white">가능 (자동 매칭)</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-slate-800/70 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
                  <InfinityIcon className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">게임 시간</span>
                  <p className="text-xs font-black text-white">무한 (제한 없음)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Blue '선택하기' Button */}
          <button
            onClick={onConfirm}
            className="mt-6 w-full rounded-xl bg-blue-600 hover:bg-blue-500 py-3.5 text-sm font-black text-white shadow-xl shadow-blue-600/30 transition hover:scale-[1.01] active:scale-[0.99]"
          >
            선택하기
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="relative z-10 flex items-center justify-between pt-4 border-t border-slate-800 text-xs text-slate-400">
        <span>두 모드 모두 AI 봇과 함께 플레이할 수 있습니다.</span>
        <span>목표: <strong>박스 3개 운반 완료</strong></span>
      </div>
    </div>
  );
};
