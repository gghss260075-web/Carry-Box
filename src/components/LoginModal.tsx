/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { auth } from '../services/auth';
import { ShieldCheck, User, Lock, Sparkles, LogIn, UserPlus } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsLoading(true);

    try {
      if (tab === 'register') {
        const res = await auth.register(username, password);
        setMessage({ text: res.message, isError: !res.success });
        if (res.success) {
          setTimeout(() => onClose(), 800);
        }
      } else {
        const res = await auth.login(username, password);
        setMessage({ text: res.message, isError: !res.success });
        if (res.success) {
          setTimeout(() => onClose(), 800);
        }
      }
    } catch {
      setMessage({ text: '오류가 발생했습니다. 다시 시도해 주세요.', isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuest = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    auth.guestLogin(`게스트_${randomNum}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-700/80 bg-slate-900 p-6 shadow-2xl text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">계정 로그인 & 저장</h2>
              <p className="text-xs text-slate-400">진행 상황 및 경기 기록을 영구 보관합니다</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
          >
            ✕
          </button>
        </div>

        {/* Security badge */}
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-indigo-950/40 border border-indigo-500/30 px-3 py-2 text-xs text-indigo-300">
          <ShieldCheck className="h-4 w-4 shrink-0 text-indigo-400" />
          <span>Web Crypto SHA-256 암호화 (비밀번호 평문 미저장 & 안전 인증)</span>
        </div>

        {/* Tabs */}
        <div className="mt-4 flex rounded-lg bg-slate-800/80 p-1">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setMessage(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition ${
              tab === 'login' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            로그인
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setMessage(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition ${
              tab === 'register' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            회원가입
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">아이디</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="2자 이상의 아이디 입력"
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-800/90 pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">비밀번호</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="4자 이상의 비밀번호 입력"
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-800/90 pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {message && (
            <div
              className={`rounded-lg px-3 py-2 text-xs font-medium ${
                message.isError
                  ? 'bg-rose-950/50 border border-rose-500/30 text-rose-300'
                  : 'bg-emerald-950/50 border border-emerald-500/30 text-emerald-300'
              }`}
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
          >
            {tab === 'login' ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
            {isLoading ? '처리 중...' : tab === 'login' ? '로그인하기' : '회원가입 완료하기'}
          </button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-slate-900 px-2 text-slate-500">또는</span>
          </div>
        </div>

        {/* Guest Play */}
        <button
          type="button"
          onClick={handleGuest}
          className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 hover:bg-slate-800 py-2.5 text-sm font-medium text-slate-300 transition"
        >
          로그인 없이 게스트로 시작
        </button>
      </div>
    </div>
  );
};
