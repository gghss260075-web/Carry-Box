/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GameModeId, LobbyChatMessage, MapId, PlayerSlot } from '../../types/game';
import { CharacterViewer3D } from '../CharacterViewer3D';
import { Send, Settings, Palette, Play } from 'lucide-react';

interface TeamLobbyScreenProps {
  mapId: MapId;
  modeId: GameModeId;
  roster: PlayerSlot[];
  onStartGame: () => void;
  onOpenCustomization: () => void;
}

export const TeamLobbyScreen: React.FC<TeamLobbyScreenProps> = ({
  mapId,
  modeId,
  roster,
  onStartGame,
  onOpenCustomization,
}) => {
  const [messages, setMessages] = useState<LobbyChatMessage[]>([
    { id: '1', sender: 'Player_1234', text: '준비됐어요!' },
    { id: '2', sender: 'BOT-1', text: '잡아요!' },
    { id: '3', sender: 'BOT-2', text: '가자!' },
    { id: '4', sender: 'BOT-3', text: '힘 내보자구요!' },
  ]);
  const [inputText, setInputText] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: LobbyChatMessage = {
      id: String(Date.now()),
      sender: roster[0]?.name || 'Player_1234',
      text: inputText.trim(),
    };
    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
  };

  const localPlayer = roster[0];

  return (
    <div className="relative h-screen w-screen overflow-hidden select-none bg-slate-900 font-sans text-slate-100">
      {/* 3D Atmospheric Sky & Castle Background (matching Panel 5) */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-400 via-sky-300 to-amber-200">
        {/* Clouds */}
        <div className="absolute top-10 left-12 h-36 w-80 rounded-full bg-white/70 blur-2xl" />
        <div className="absolute top-20 right-24 h-48 w-96 rounded-full bg-white/60 blur-3xl" />

        {/* Castle Silhouettes */}
        <div className="absolute inset-x-0 bottom-16 flex justify-between items-end opacity-40 pointer-events-none">
          <div className="h-64 w-44 bg-amber-200/90 rounded-t-3xl ml-10" />
          <div className="h-80 w-60 bg-amber-300/90 rounded-t-3xl ml-60" />
          <div className="h-72 w-52 bg-amber-200/80 rounded-t-3xl mr-24" />
        </div>

        {/* Castle Stone Platform Ground */}
        <div className="absolute bottom-0 inset-x-0 h-44 bg-gradient-to-t from-stone-400 via-stone-300 to-transparent">
          {/* Bridge wooden railing */}
          <div className="absolute bottom-16 inset-x-0 h-4 bg-amber-800/60 border-y border-amber-900/40" />
          {Array.from({ length: 22 }).map((_, i) => (
            <div
              key={i}
              className="absolute bottom-8 h-12 w-2.5 bg-amber-900/50 rounded-sm"
              style={{ left: `${i * 4.6 + 1}%` }}
            />
          ))}
        </div>
      </div>

      {/* TOP BAR: Customization & Settings (matching gear icon in Panel 5) */}
      <div className="relative z-20 flex items-center justify-between p-6">
        {/* Room Info */}
        <div className="rounded-2xl bg-black/40 backdrop-blur-md px-4 py-2 border border-white/20 text-xs font-bold text-white shadow">
          <span>팀 로비 대기실 · </span>
          <span className="text-sky-300">전원 준비 완료</span>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenCustomization}
            className="flex items-center gap-2 rounded-2xl bg-black/40 hover:bg-black/60 backdrop-blur-md px-4 py-2 text-xs font-bold text-white border border-white/20 shadow transition hover:scale-105"
            title="캐릭터 커스터마이징 (모자, 의상, 컬러)"
          >
            <Palette className="h-4 w-4 text-amber-400" />
            <span>의상 변경</span>
          </button>

          <button
            onClick={onOpenCustomization}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black/40 hover:bg-black/60 backdrop-blur-md text-white border border-white/20 shadow transition hover:scale-105"
            title="설정"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* CENTER 3D STAGE: Characters Standing with Speech Bubbles (matching Panel 5) */}
      <div className="relative z-10 my-auto flex h-[50vh] w-full items-end justify-center gap-8 px-10">
        {/* Character 1 (Player) */}
        <div className="relative flex flex-col items-center">
          {/* Speech Bubble */}
          <div className="relative mb-2 rounded-2xl bg-white px-4 py-1.5 text-xs font-black text-slate-900 shadow-xl border-2 border-slate-900 animate-bounce">
            준비됐어요!
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white" />
          </div>
          <div className="h-48 w-32">
            <CharacterViewer3D
              color={localPlayer?.color || '#fb7185'}
              hat={localPlayer?.hat || 'hardhat'}
              shirt={localPlayer?.shirt || 'basic_hoodie'}
              pants={localPlayer?.pants || 'denim_jeans'}
            />
          </div>
          <span className="mt-1 rounded-md bg-black/50 px-2 py-0.5 text-[11px] font-bold text-white shadow">
            {localPlayer?.name || '나'}
          </span>
        </div>

        {/* Character 2 (BOT-1) */}
        <div className="relative flex flex-col items-center">
          <div className="relative mb-2 rounded-2xl bg-white px-4 py-1.5 text-xs font-black text-slate-900 shadow-xl border-2 border-slate-900">
            좋아요!
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white" />
          </div>
          <div className="h-44 w-28">
            <CharacterViewer3D color="#38bdf8" hat="hardhat" shirt="basic_hoodie" pants="denim_jeans" />
          </div>
          <span className="mt-1 rounded-md bg-black/50 px-2 py-0.5 text-[11px] font-bold text-white shadow">
            BOT-1
          </span>
        </div>

        {/* Character 3 (BOT-2) */}
        <div className="relative flex flex-col items-center">
          <div className="relative mb-2 rounded-2xl bg-white px-4 py-1.5 text-xs font-black text-slate-900 shadow-xl border-2 border-slate-900">
            가자!
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white" />
          </div>
          <div className="h-44 w-28">
            <CharacterViewer3D color="#f87171" hat="beanie" shirt="striped_tee" pants="cargo_pants" />
          </div>
          <span className="mt-1 rounded-md bg-black/50 px-2 py-0.5 text-[11px] font-bold text-white shadow">
            BOT-2
          </span>
        </div>
      </div>

      {/* BOTTOM AREA: Chat Box on Left + '준비 완료!' Button on Right (matching Panel 5) */}
      <div className="relative z-20 flex items-end justify-between p-6 md:p-8">
        {/* Bottom Left: Chat Box (matching Panel 5) */}
        <div className="w-80 rounded-2xl bg-black/60 backdrop-blur-md p-3.5 border border-white/20 shadow-2xl">
          {/* Chat Messages */}
          <div className="h-28 overflow-y-auto space-y-1.5 text-xs pr-1 font-medium">
            {messages.map((msg) => (
              <div key={msg.id} className="leading-tight">
                <span className="font-bold text-sky-300">{msg.sender}</span>
                <span className="text-white/70"> : </span>
                <span className="text-white">{msg.text}</span>
              </div>
            ))}
          </div>

          {/* Chat Input Form */}
          <form onSubmit={handleSendMessage} className="mt-2.5 flex items-center gap-1.5">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="메시지를 입력하세요..."
              className="flex-1 rounded-xl bg-white/20 border border-white/30 px-3 py-1.5 text-xs text-white placeholder-white/50 focus:bg-white/30 focus:outline-none"
            />
            <button
              type="submit"
              className="flex h-7 w-7 items-center justify-center rounded-xl bg-sky-500 hover:bg-sky-400 text-white shrink-0 shadow"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>

        {/* Bottom Right: Big Vibrant Blue '준비 완료!' Button (matching Panel 5) */}
        <button
          onClick={onStartGame}
          className="rounded-2xl bg-blue-600 hover:bg-blue-500 px-10 py-5 text-xl font-black text-white shadow-2xl shadow-blue-600/50 hover:scale-105 active:scale-95 transition flex items-center gap-3 border-2 border-white/30"
        >
          <Play className="h-6 w-6 fill-current" />
          <span>준비 완료!</span>
        </button>
      </div>
    </div>
  );
};
