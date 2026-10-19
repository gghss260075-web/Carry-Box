/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MapId } from '../types/game';
import { MAPS, FORCE_POWERS } from '../data/constants';
import { Compass, AlertTriangle, Zap, Check, ArrowLeft } from 'lucide-react';

interface MapSelectViewProps {
  selectedMap: MapId;
  onSelectMap: (mapId: MapId) => void;
  onBack: () => void;
}

export const MapSelectView: React.FC<MapSelectViewProps> = ({ selectedMap, onSelectMap, onBack }) => {
  const mapList = Object.values(MAPS);

  return (
    <div className="flex h-full w-full flex-col justify-between p-6 md:p-10 text-slate-100 max-w-6xl mx-auto">
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
            <Compass className="h-6 w-6 text-sky-400" />
            <span>탐험 맵 선택 (4대 스테이지)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">각 맵의 지형과 과학적 힘의 상성을 고려하여 스테이지를 선택하세요</p>
        </div>

        <div className="w-28"></div>
      </div>

      {/* Map Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 my-auto py-6">
        {mapList.map((m) => {
          const isSelected = selectedMap === m.id;
          const recForce = FORCE_POWERS[m.recommendedForce];

          return (
            <div
              key={m.id}
              onClick={() => onSelectMap(m.id)}
              className={`group relative flex flex-col justify-between rounded-2xl border p-5 cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'border-sky-400 bg-slate-900/90 shadow-xl shadow-sky-500/20 ring-2 ring-sky-500/40 translate-y-[-4px]'
                  : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-800/60'
              }`}
            >
              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                      m.difficulty === '쉬움'
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                        : m.difficulty === '보통'
                        ? 'bg-sky-950/60 text-sky-400 border border-sky-500/30'
                        : m.difficulty === '어려움'
                        ? 'bg-amber-950/60 text-amber-400 border border-amber-500/30'
                        : 'bg-rose-950/60 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    난이도: {m.difficulty}
                  </span>

                  {isSelected && (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-500 text-slate-950 font-bold">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  )}
                </div>

                {/* Map Visual Banner */}
                <div
                  className="mt-3.5 h-28 w-full rounded-xl flex items-center justify-center text-4xl font-black tracking-widest relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${m.themeColor}33, #0f172a 85%)`,
                    borderColor: `${m.themeColor}55`,
                  }}
                >
                  <div className="text-center">
                    <span className="text-2xl drop-shadow-md">{m.nameKo}</span>
                    <span className="block text-[11px] font-medium tracking-normal text-slate-400 mt-1">
                      {m.name}
                    </span>
                  </div>
                </div>

                <p className="mt-3 text-xs leading-relaxed text-slate-300 font-medium">{m.tagline}</p>

                {/* Recommended Power */}
                <div className="mt-3.5 rounded-xl bg-slate-800/80 p-2.5 border border-slate-700/60">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                    <Zap className="h-3.5 w-3.5 text-amber-400" />
                    <span>추천 과학 능력:</span>
                  </div>
                  <div className="mt-1 text-xs font-bold text-sky-300 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: recForce.color }}></span>
                    <span>{recForce.nameKo}</span>
                  </div>
                </div>

                {/* Hazards */}
                <div className="mt-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                    <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                    <span>주요 난관 및 장애물:</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {m.hazards.map((h, i) => (
                      <span key={i} className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom select button */}
              <button
                type="button"
                className={`mt-4 w-full rounded-xl py-2.5 text-xs font-bold transition ${
                  isSelected
                    ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/30'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {isSelected ? '선택됨' : '이 맵으로 결정'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer CTA */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <p className="text-xs text-slate-400">
          현재 선택된 맵: <span className="font-bold text-sky-400">{MAPS[selectedMap].nameKo}</span>
        </p>
        <button
          onClick={onBack}
          className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition"
        >
          선택 완료 및 대기실로
        </button>
      </div>
    </div>
  );
};
