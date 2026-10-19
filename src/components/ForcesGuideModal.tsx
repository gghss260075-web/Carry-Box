/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ForcePower } from '../types/game';
import { FORCE_POWERS } from '../data/constants';
import { Sparkles, Orbit, Wind, Droplets, BookOpen, CheckCircle } from 'lucide-react';

interface ForcesGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ForcesGuideModal: React.FC<ForcesGuideModalProps> = ({ isOpen, onClose }) => {
  const [selectedPower, setSelectedPower] = useState<ForcePower>('gravity');

  if (!isOpen) return null;

  const current = FORCE_POWERS[selectedPower];

  const scientificDetails: Record<
    ForcePower,
    {
      formula: string;
      principle: string;
      inGameTactic: string;
      synergy: string;
    }
  > = {
    gravity: {
      formula: 'F_g = m · g',
      principle: '질량 및 중력 가속도를 조절하여 물체에 작용하는 만유인력 하향 하중을 감쇄시킵니다.',
      inGameTactic:
        '무거운 에너지 상자를 들고 가파른 언덕이나 높은 계단을 오를 때 [1번 중력 제어]를 켜면 상자가 깃털처럼 가벼워져 속도 저하 없이 도약할 수 있습니다.',
      synergy: '탄성력과 조합 시 낮은 중력 덕분에 튕겨 오른 상자가 공중에서 훨씬 멀리 날아갑니다.',
    },
    friction: {
      formula: 'f = μ · N',
      principle: '물체 표면의 마찰 계수(μ)를 극소(0.01)로 줄이거나 극대(1.8)로 높여 접촉면의 저항을 조절합니다.',
      inGameTactic:
        '평평한 통로나 얼음 다리에서 [2번 마찰력 제어]를 켜고 상자를 밀면, 컬링 스톤처럼 무한히 미끄러져 장거리 수송을 순식간에 끝낼 수 있습니다.',
      synergy: '경사로에서 미끄러지지 않고 멈추고 싶을 때는 고마찰 모드를 활용하세요.',
    },
    elasticity: {
      formula: 'e = |v₂ - v₁| / |u₁ - u₂|',
      principle: '물체 간 충돌 시 운동에너지의 보존 비율(반발계수 e)을 극대화(0.96)하여 용수철처럼 복원력을 방출합니다.',
      inGameTactic:
        '깊은 협곡이나 높은 방벽을 마주했을 때 [3번 탄성력 제어]를 활성화하고 상자를 바닥에 던지면, 상자가 수직으로 높게 튕겨 올라 윗층 발판에 안착합니다.',
      synergy: '공사장의 점프 패드 위에서 활성화하면 캐릭터가 초고공 비행을 펼칩니다.',
    },
    buoyancy: {
      formula: 'F_b = ρ · V · g (아르키메데스의 원리)',
      principle: '유체나 공기 역학적 부력장을 형성하여 물체가 밀어낸 유체의 무게만큼 수직 상방 리프트를 가합니다.',
      inGameTactic:
        '빙하 협곡의 얼음 호수나 사막의 유사(Quicksand) 늪을 건널 때 [4번 부력 제어]를 켜면 상자와 캐릭터가 가라앉지 않고 수면 위로 둥둥 떠올라 횡단할 수 있습니다.',
      synergy: '상승 기류 지대에서 부력을 가동하면 상자를 공중에 띄워 징검다리 발판으로도 활용할 수 있습니다.',
    },
  };

  const detail = scientificDetails[selectedPower];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">4대 과학적 힘 도감 및 물리 원리</h2>
              <p className="text-xs text-slate-400">Human Force Fall의 물리 법칙을 완벽히 마스터하세요</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
          >
            ✕
          </button>
        </div>

        {/* 4 Power Tabs */}
        <div className="mt-4 grid grid-cols-4 gap-2">
          {(['gravity', 'friction', 'elasticity', 'buoyancy'] as ForcePower[]).map((pKey, i) => {
            const p = FORCE_POWERS[pKey];
            const isSelected = selectedPower === pKey;
            return (
              <button
                key={pKey}
                onClick={() => setSelectedPower(pKey)}
                className={`flex flex-col items-center rounded-xl p-3 text-center transition ${
                  isSelected
                    ? 'bg-slate-800 ring-2 ring-indigo-500 shadow-md'
                    : 'bg-slate-850 hover:bg-slate-800/80 text-slate-400'
                }`}
              >
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg mb-1.5 text-slate-950"
                  style={{ backgroundColor: p.color }}
                >
                  {pKey === 'gravity' && <Orbit className="h-4 w-4" />}
                  {pKey === 'friction' && <Wind className="h-4 w-4" />}
                  {pKey === 'elasticity' && <Sparkles className="h-4 w-4" />}
                  {pKey === 'buoyancy' && <Droplets className="h-4 w-4" />}
                </div>
                <span className="text-xs font-bold text-white">{p.nameKo.split(' ')[0]}</span>
                <span className="text-[10px] text-slate-400">[{i + 1}번 키]</span>
              </button>
            );
          })}
        </div>

        {/* Detail Panel */}
        <div className="mt-5 rounded-2xl bg-slate-850 p-5 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: current.color }}></span>
              <span>{current.nameKo}</span>
            </h3>
            <span className="rounded-lg bg-slate-800 px-3 py-1 font-mono text-xs font-bold text-amber-300">
              공식: {detail.formula}
            </span>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-400">과학적 물리 원리</h4>
            <p className="mt-1 text-xs text-slate-200 leading-relaxed">{detail.principle}</p>
          </div>

          <div className="rounded-xl bg-slate-900/90 p-3.5 border border-slate-800/80">
            <h4 className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
              <CheckCircle className="h-3.5 w-3.5" />
              <span>실전 게임 공략법</span>
            </h4>
            <p className="mt-1 text-xs text-slate-300 leading-relaxed">{detail.inGameTactic}</p>
          </div>

          <div className="rounded-xl bg-slate-900/90 p-3.5 border border-slate-800/80">
            <h4 className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              <span>능력 연계 시너지</span>
            </h4>
            <p className="mt-1 text-xs text-slate-300 leading-relaxed">{detail.synergy}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-6 py-2.5 text-xs font-bold text-white transition"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
