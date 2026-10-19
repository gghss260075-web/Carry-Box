/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MapId } from '../../types/game';
import { MAPS } from '../../data/constants';
import { ArrowLeft, Check } from 'lucide-react';

interface MapSelectScreenProps {
  selectedMap: MapId;
  onSelectMap: (id: MapId) => void;
  onConfirm: () => void;
  onBack: () => void;
}

export const MapSelectScreen: React.FC<MapSelectScreenProps> = ({
  selectedMap,
  onSelectMap,
  onConfirm,
  onBack,
}) => {
  const mapEntries: Array<{
    id: MapId;
    name: string;
    sub: string;
    gradient: string;
    accent: string;
    desc: string;
    icon: string;
  }> = [
    {
      id: 'sky_stairway',
      name: '하늘의 계단',
      sub: '기본 맵',
      gradient: 'from-sky-400 to-indigo-600',
      accent: '#38bdf8',
      desc: '가장 기본적인 구조의 맵으로, 초보자도 쉽게 즐길 수 있습니다.',
      icon: '☁️',
    },
    {
      id: 'glacier_canyon',
      name: '얼음 협곡',
      sub: '눈과 얼음의 미끄러운 길',
      gradient: 'from-cyan-400 to-blue-600',
      accent: '#06b6d4',
      desc: '극저온의 얼음 협곡, 미끄러운 빙판길과 얼어붙은 호수를 건너는 험로입니다.',
      icon: '❄️',
    },
    {
      id: 'desert_ruins',
      name: '사막 유적지',
      sub: '모래 언덕과 협곡',
      gradient: 'from-amber-400 to-orange-600',
      accent: '#f59e0b',
      desc: '모래바람 부는 고대 피라미드와 가파른 모래 언덕, 삼켜버리는 유사 지대입니다.',
      icon: '🏜️',
    },
    {
      id: 'urban_construction',
      name: '도시 공사장',
      sub: '크레인과 높은 구조물',
      gradient: 'from-orange-500 to-stone-800',
      accent: '#ea580c',
      desc: '초고층 마천루 건설 현장, 아슬아슬한 철골 빔과 유압 리프트, 타워크레인이 가득합니다.',
      icon: '🏗️',
    },
  ];

  const currentMap = mapEntries.find((m) => m.id === selectedMap) || mapEntries[0];

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-900 select-none p-6 md:p-10 flex flex-col justify-between text-slate-100">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-sky-950/40 to-slate-950 pointer-events-none" />

      {/* Top Header: ← 맵 선택 (matching Panel 2) */}
      <div className="relative z-10 flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-white shadow transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">맵 선택</h1>
        </div>
      </div>

      {/* Center Layout: 4 Horizontal Map Cards + Right Detail Panel (matching Panel 2) */}
      <div className="relative z-10 my-auto flex flex-col lg:flex-row items-stretch gap-6 py-4">
        {/* Left: 4 Horizontal Map Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
          {mapEntries.map((map) => {
            const isSelected = selectedMap === map.id;
            return (
              <div
                key={map.id}
                onClick={() => onSelectMap(map.id)}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'border-sky-400 bg-slate-800/95 ring-4 ring-sky-500/30 -translate-y-1.5 shadow-2xl'
                    : 'border-slate-800 bg-slate-900/80 hover:border-slate-700 hover:bg-slate-850'
                }`}
              >
                {/* Map Graphic Preview Box */}
                <div className={`relative h-44 w-full bg-gradient-to-br ${map.gradient} p-4 flex flex-col justify-between overflow-hidden`}>
                  <div className="flex justify-between items-start">
                    <span className="text-3xl drop-shadow">{map.icon}</span>
                    {isSelected && (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-slate-900 shadow">
                        <Check className="h-4 w-4 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <div className="text-white drop-shadow-md">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-white/80">STAGE</span>
                    <h3 className="text-lg font-black">{map.name}</h3>
                  </div>
                </div>

                {/* Map Card Footer Text */}
                <div className="p-3.5 bg-slate-900/90 text-center">
                  <h4 className="text-sm font-black text-white">{map.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{map.sub}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Selected Map Detail Card (matching Panel 2) */}
        <div className="w-full lg:w-80 rounded-2xl border border-slate-800 bg-slate-900/95 p-5 shadow-2xl flex flex-col justify-between">
          <div>
            {/* Thumbnail */}
            <div className={`h-36 w-full rounded-xl bg-gradient-to-br ${currentMap.gradient} flex items-center justify-center text-4xl shadow-inner`}>
              <span className="text-5xl drop-shadow-lg">{currentMap.icon}</span>
            </div>

            <div className="mt-4">
              <h3 className="text-lg font-black text-white">{currentMap.name}</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-300 font-medium">
                {currentMap.desc}
              </p>
            </div>
          </div>

          {/* Blue '선택하기' Button (matching Panel 2) */}
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
        <span>선택한 맵은 게임 시작 후 팀원들과 함께 플레이하게 됩니다.</span>
        <span>현재 맵: <strong className="text-sky-400">{currentMap.name}</strong></span>
      </div>
    </div>
  );
};
