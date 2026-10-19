/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PlayerStats } from '../types/game';
import { COSMETIC_COLORS, COSMETIC_HATS, COSMETIC_SHIRTS, COSMETIC_PANTS } from '../data/cosmetics';
import { CharacterViewer3D } from './CharacterViewer3D';
import { auth } from '../services/auth';
import { Sparkles, Palette, Shirt, Check, Lock, Save, Trophy } from 'lucide-react';

interface CustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: PlayerStats;
}

export const CustomizationModal: React.FC<CustomizationModalProps> = ({ isOpen, onClose, stats }) => {
  const [activeTab, setActiveTab] = useState<'color' | 'hat' | 'shirt' | 'pants'>('color');
  const [selectedColor, setSelectedColor] = useState(stats.selectedColor || '#fb7185');
  const [selectedHat, setSelectedHat] = useState(stats.selectedHat || 'hardhat');
  const [selectedShirt, setSelectedShirt] = useState(stats.selectedShirt || 'basic_hoodie');
  const [selectedPants, setSelectedPants] = useState(stats.selectedPants || 'denim_jeans');
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const playerWins = stats.wins || 0;

  const handleSave = () => {
    auth.updateCustomization(selectedColor, selectedHat, selectedShirt, selectedPants);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
      <div className="relative flex h-[90vh] max-h-[720px] w-full max-w-4xl flex-col md:flex-row overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl text-slate-100">
        {/* Left Side: 3D Character Live Preview */}
        <div className="relative flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-slate-850 to-slate-950 p-6">
          <div className="absolute top-4 left-4 flex items-center gap-2 rounded-xl bg-slate-900/80 px-3 py-1.5 border border-slate-850 text-xs">
            <Trophy className="h-4 w-4 text-amber-400" />
            <span>내 승리: <strong>{playerWins}승</strong></span>
          </div>

          <div className="h-[280px] md:h-[420px] w-full max-w-sm">
            <CharacterViewer3D
              color={selectedColor}
              hat={selectedHat}
              shirt={selectedShirt}
              pants={selectedPants}
            />
          </div>

          <div className="text-center mt-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">LIVE PREVIEW</span>
            <p className="text-sm font-black text-white">{stats.username}</p>
          </div>
        </div>

        {/* Right Side: Cosmetic Selection Tabs & Grid */}
        <div className="flex w-full md:w-[420px] flex-col justify-between border-t md:border-t-0 md:border-l border-slate-800 bg-slate-900 p-6">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">캐릭터 커스터마이징</h2>
                  <p className="text-xs text-slate-400">의상과 컬러를 조합해 개성을 표현하세요</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            {/* Category Tabs */}
            <div className="mt-4 grid grid-cols-4 gap-1 rounded-xl bg-slate-800/80 p-1">
              <button
                onClick={() => setActiveTab('color')}
                className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition ${
                  activeTab === 'color' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Palette className="h-3.5 w-3.5" />
                <span>컬러</span>
              </button>
              <button
                onClick={() => setActiveTab('hat')}
                className={`py-2 text-xs font-bold rounded-lg transition ${
                  activeTab === 'hat' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                모자
              </button>
              <button
                onClick={() => setActiveTab('shirt')}
                className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition ${
                  activeTab === 'shirt' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Shirt className="h-3.5 w-3.5" />
                <span>상의</span>
              </button>
              <button
                onClick={() => setActiveTab('pants')}
                className={`py-2 text-xs font-bold rounded-lg transition ${
                  activeTab === 'pants' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                하의
              </button>
            </div>

            {/* Items Grid */}
            <div className="mt-4 max-h-[300px] overflow-y-auto pr-1 space-y-2">
              {/* COLORS */}
              {activeTab === 'color' && (
                <div className="grid grid-cols-2 gap-2.5">
                  {COSMETIC_COLORS.map((col) => {
                    const isSelected = selectedColor === col.previewColor;
                    const isLocked = !col.unlockedByDefault && (col.requiredWins || 0) > playerWins;

                    return (
                      <button
                        key={col.id}
                        disabled={isLocked}
                        onClick={() => setSelectedColor(col.previewColor!)}
                        className={`flex items-center gap-3 rounded-2xl border p-2.5 text-left transition ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-950/40 ring-1 ring-indigo-500'
                            : isLocked
                            ? 'border-slate-800 bg-slate-900/40 opacity-50 cursor-not-allowed'
                            : 'border-slate-800 bg-slate-850 hover:border-slate-700'
                        }`}
                      >
                        <div
                          className="h-9 w-9 rounded-full border-2 border-white/20 shadow-inner flex items-center justify-center shrink-0"
                          style={{ backgroundColor: col.previewColor }}
                        >
                          {isSelected && <Check className="h-4 w-4 text-slate-950 font-bold" />}
                          {isLocked && <Lock className="h-4 w-4 text-slate-900" />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{col.name}</p>
                          <span className="text-[10px] text-slate-400 block">
                            {isLocked ? `${col.requiredWins}승 필요` : col.description}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* HATS */}
              {activeTab === 'hat' && (
                <div className="space-y-2">
                  {COSMETIC_HATS.map((hat) => {
                    const isSelected = selectedHat === hat.id;
                    const isLocked = !hat.unlockedByDefault && (hat.requiredWins || 0) > playerWins;

                    return (
                      <button
                        key={hat.id}
                        disabled={isLocked}
                        onClick={() => setSelectedHat(hat.id)}
                        className={`flex w-full items-center justify-between rounded-2xl border p-3 text-left transition ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-950/40 ring-1 ring-indigo-500'
                            : isLocked
                            ? 'border-slate-800 bg-slate-900/40 opacity-50 cursor-not-allowed'
                            : 'border-slate-800 bg-slate-850 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{hat.name}</span>
                            {isSelected && <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-bold text-indigo-400">선택됨</span>}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{hat.description}</p>
                        </div>
                        {isLocked ? (
                          <div className="flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-[10px] text-amber-400 shrink-0">
                            <Lock className="h-3 w-3" />
                            <span>{hat.requiredWins}승 필요</span>
                          </div>
                        ) : isSelected ? (
                          <Check className="h-4 w-4 text-indigo-400" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* SHIRTS */}
              {activeTab === 'shirt' && (
                <div className="space-y-2">
                  {COSMETIC_SHIRTS.map((shirt) => {
                    const isSelected = selectedShirt === shirt.id;
                    const isLocked = !shirt.unlockedByDefault && (shirt.requiredWins || 0) > playerWins;

                    return (
                      <button
                        key={shirt.id}
                        disabled={isLocked}
                        onClick={() => setSelectedShirt(shirt.id)}
                        className={`flex w-full items-center justify-between rounded-2xl border p-3 text-left transition ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-950/40 ring-1 ring-indigo-500'
                            : isLocked
                            ? 'border-slate-800 bg-slate-900/40 opacity-50 cursor-not-allowed'
                            : 'border-slate-800 bg-slate-850 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{shirt.name}</span>
                            {isSelected && <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-bold text-indigo-400">선택됨</span>}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{shirt.description}</p>
                        </div>
                        {isLocked ? (
                          <div className="flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-[10px] text-amber-400 shrink-0">
                            <Lock className="h-3 w-3" />
                            <span>{shirt.requiredWins}승 필요</span>
                          </div>
                        ) : isSelected ? (
                          <Check className="h-4 w-4 text-indigo-400" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* PANTS */}
              {activeTab === 'pants' && (
                <div className="space-y-2">
                  {COSMETIC_PANTS.map((pants) => {
                    const isSelected = selectedPants === pants.id;
                    const isLocked = !pants.unlockedByDefault && (pants.requiredWins || 0) > playerWins;

                    return (
                      <button
                        key={pants.id}
                        disabled={isLocked}
                        onClick={() => setSelectedPants(pants.id)}
                        className={`flex w-full items-center justify-between rounded-2xl border p-3 text-left transition ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-950/40 ring-1 ring-indigo-500'
                            : isLocked
                            ? 'border-slate-800 bg-slate-900/40 opacity-50 cursor-not-allowed'
                            : 'border-slate-800 bg-slate-850 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{pants.name}</span>
                            {isSelected && <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-bold text-indigo-400">선택됨</span>}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{pants.description}</p>
                        </div>
                        {isLocked ? (
                          <div className="flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-[10px] text-amber-400 shrink-0">
                            <Lock className="h-3 w-3" />
                            <span>{pants.requiredWins}승 필요</span>
                          </div>
                        ) : isSelected ? (
                          <Check className="h-4 w-4 text-indigo-400" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Footer Save Button */}
          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={handleSave}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition"
            >
              <Save className="h-4 w-4" />
              <span>{isSaved ? '저장 완료!' : '커스터마이징 저장 (Firebase 동기화)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
