/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GameModeId } from '../types/game';
import { GAME_MODES } from '../data/constants';
import { Users, Swords, Trophy, ArrowLeft, Check, Shield } from 'lucide-react';

interface ModeSelectViewProps {
  selectedMode: GameModeId;
  onSelectMode: (modeId: GameModeId) => void;
  onBack: () => void;
}

export const ModeSelectView: React.FC<ModeSelectViewProps> = ({ selectedMode, onSelectMode, onBack }) => {
  const modes = Object.values(GAME_MODES);

  return (
    <div className="flex h-full w-full flex-col justify-between p-6 md:p-10 text-slate-100 max-w-5xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <button
          onClick={onBack}
          className="flex items-center gap-2 rounded-xl bg-slate-800/80 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>로비로 돌아가기</span>
        </button>

        <div className="text-center">
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            <Trophy className="h-6 w-6 text-amber-400" />
            <span>게임 모드 선택</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">함께 목표를 달성하는 협동전 또는 긴장감 넘치는 팀 대결을 선택하세요</p>
        </div>

        <div className="w-28"></div>
      </div>

      {/* Mode Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-auto py-8">
        {modes.map((mode) => {
          const isSelected = selectedMode === mode.id;
          const isCoop = mode.id === 'coop_haul';

          return (
            <div
              key={mode.id}
              onClick={() => onSelectMode(mode.id)}
              className={`relative flex flex-col justify-between rounded-3xl border p-7 cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'border-indigo-500 bg-slate-900/95 shadow-2xl shadow-indigo-500/25 ring-2 ring-indigo-500/40 translate-y-[-4px]'
                  : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-800/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                        isCoop ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {isCoop ? <Users className="h-6 w-6" /> : <Swords className="h-6 w-6" />}
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {isCoop ? 'COOPERATIVE' : 'PVP BATTLE'}
                      </span>
                      <h3 className="text-xl font-black text-white">{mode.nameKo}</h3>
                    </div>
                  </div>

                  {isSelected && (
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500 text-white font-bold">
                      <Check className="h-4 w-4" />
                    </span>
                  )}
                </div>

                <p className="mt-5 text-sm leading-relaxed text-slate-300">{mode.description}</p>

                {/* Features list */}
                <div className="mt-6 space-y-2.5 rounded-2xl bg-slate-800/70 p-4 border border-slate-700/50">
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <Shield className="h-4 w-4 text-indigo-400 shrink-0" />
                    <span>
                      참가 인원: <strong>{isCoop ? '최대 4인 (부족 시 AI 봇 참가)' : '3 vs 3 (총 6인, AI 봇 지원)'}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <Trophy className="h-4 w-4 text-amber-400 shrink-0" />
                    <span>
                      승리 조건: <strong>{mode.winCondition}</strong>
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className={`mt-6 w-full rounded-2xl py-3 text-sm font-bold transition ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {isSelected ? '선택된 모드' : '이 모드 선택하기'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <p className="text-xs text-slate-400">
          현재 선택된 모드: <span className="font-bold text-indigo-400">{GAME_MODES[selectedMode].nameKo}</span>
        </p>
        <button
          onClick={onBack}
          className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition"
        >
          확인 및 대기실로
        </button>
      </div>
    </div>
  );
};
