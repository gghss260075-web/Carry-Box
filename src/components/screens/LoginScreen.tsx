/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { auth } from '../../services/auth';
import { User, Lock, Sparkles, LogIn, ShieldCheck } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsLoading(true);

    try {
      if (isRegisterMode) {
        const res = await auth.register(username, password);
        setMessage({ text: res.message, isError: !res.success });
        if (res.success) {
          setTimeout(() => onLoginSuccess(), 600);
        }
      } else {
        const res = await auth.login(username, password);
        setMessage({ text: res.message, isError: !res.success });
        if (res.success) {
          setTimeout(() => onLoginSuccess(), 600);
        }
      }
    } catch {
      setMessage({ text: '오류가 발생했습니다. 다시 시도해 주세요.', isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setMessage(null);
    const res = await auth.loginWithGoogle();
    setIsLoading(false);
    if (res.success) {
      onLoginSuccess();
    } else {
      setMessage({ text: res.message, isError: true });
    }
  };

  const handleGuestPlay = () => {
    auth.guestLogin(`Player_${Math.floor(1000 + Math.random() * 9000)}`);
    onLoginSuccess();
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden select-none bg-slate-900 font-sans">
      {/* 3D Atmospheric Sky Castle Backdrop matching image Panel 1 */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-sky-200 to-amber-100">
        {/* Distant Clouds */}
        <div className="absolute top-12 left-10 h-32 w-80 rounded-full bg-white/70 blur-2xl" />
        <div className="absolute top-24 right-20 h-44 w-96 rounded-full bg-white/60 blur-3xl" />
        <div className="absolute bottom-20 left-1/4 h-52 w-[600px] rounded-full bg-white/80 blur-2xl" />

        {/* Castle Silhouettes */}
        <div className="absolute inset-x-0 bottom-0 flex justify-between items-end opacity-45 pointer-events-none">
          <div className="h-72 w-48 bg-amber-200/80 rounded-t-3xl ml-12" />
          <div className="h-96 w-64 bg-amber-300/80 rounded-t-3xl -ml-20" />
          <div className="h-80 w-52 bg-amber-200/70 rounded-t-3xl mr-32" />
        </div>

        {/* Castle Stone Wall & Wooden Bridge */}
        <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-stone-400 via-stone-300 to-transparent">
          {/* Bridge Rails */}
          <div className="absolute bottom-16 inset-x-0 h-4 bg-amber-800/60 border-y border-amber-900/40" />
          <div className="absolute bottom-8 inset-x-0 h-3 bg-amber-800/50" />
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="absolute bottom-8 h-12 w-2.5 bg-amber-900/50 rounded-sm"
              style={{ left: `${i * 4.3 + 1}%` }}
            />
          ))}
        </div>

        {/* 3D Character Illustration Pushing Box (matching Panel 1) */}
        <div className="absolute bottom-12 left-1/3 -translate-x-12 hidden md:flex items-end">
          {/* Cute Character with Yellow Hardhat */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Hardhat */}
            <div className="relative -mb-3 h-14 w-20 rounded-t-full bg-amber-400 shadow-md border-b-4 border-amber-500">
              <div className="absolute -bottom-1.5 -left-2 h-3 w-24 rounded-full bg-amber-400" />
            </div>
            {/* Head */}
            <div className="h-16 w-16 rounded-full bg-amber-100 shadow-inner flex items-center justify-center relative">
              <div className="absolute top-6 left-3.5 h-2 w-2 rounded-full bg-slate-900" />
              <div className="absolute top-6 right-3.5 h-2 w-2 rounded-full bg-slate-900" />
            </div>
            {/* Torso pushing */}
            <div className="h-20 w-16 rounded-2xl bg-amber-100 rotate-6 shadow-md -mt-1" />
            {/* Pushing Arm */}
            <div className="absolute top-20 right-[-14px] h-6 w-16 rounded-full bg-amber-100 rotate-[-15deg] shadow" />
          </div>

          {/* Heavy Physics Cardboard Box */}
          <div className="relative z-10 ml-3 h-28 w-28 rounded-xl bg-amber-700/85 border-2 border-amber-800/80 shadow-2xl flex flex-col items-center justify-center p-3">
            <div className="h-14 w-14 border border-dashed border-amber-900/60 rounded flex items-center justify-center">
              <span className="text-2xl text-amber-950 font-black">📦</span>
            </div>
            <div className="absolute inset-x-0 bottom-2 text-center text-[10px] font-bold text-amber-950">
              FRAGILE FORCE
            </div>
          </div>
        </div>
      </div>

      {/* FOREGROUND UI OVERLAY */}
      <div className="relative z-20 flex h-full w-full items-center justify-between px-8 md:px-20 lg:px-28">
        {/* Left Side: Game Logo Lockup (matching Panel 1) */}
        <div className="flex flex-col items-start max-w-md">
          {/* Bubble 3D Title */}
          <div className="relative filter drop-shadow-[0_8px_12px_rgba(15,23,42,0.4)] transform -rotate-2">
            <div className="rounded-3xl bg-sky-500/90 border-4 border-slate-900 px-6 py-4 shadow-2xl text-center">
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none drop-shadow-[0_4px_0_#0f172a]">
                험난한
              </h1>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none drop-shadow-[0_4px_0_#0f172a] mt-1">
                힘의 탑
              </h1>
              <div className="mt-2 inline-block rounded-full bg-slate-950 px-4 py-1 text-xs font-bold tracking-widest text-sky-300">
                Human Force Fall
              </div>
            </div>
          </div>

          <p className="mt-6 text-sm font-bold text-slate-800/90 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm border border-white/60">
            실시간 3D 물리 협동 & 대전 게임 · Firebase 계정 연동
          </p>
        </div>

        {/* Right Side: Sleek White Login Card (matching Panel 1) */}
        <div className="w-full max-w-sm rounded-3xl bg-white/95 backdrop-blur-md p-7 shadow-2xl border border-white/80 text-slate-800">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h2 className="text-lg font-black text-slate-900">
              {isRegisterMode ? '신규 회원가입' : '계정 로그인'}
            </h2>
            <div className="flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-bold text-sky-700">
              <ShieldCheck className="h-3.5 w-3.5 text-sky-600" />
              <span>Firebase 연동</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* 아이디 Input */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">아이디</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="아이디를 입력하세요"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition font-medium"
                />
              </div>
            </div>

            {/* 비밀번호 Input */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">비밀번호</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition font-medium"
                />
              </div>
            </div>

            {message && (
              <div
                className={`rounded-xl p-2.5 text-xs font-semibold ${
                  message.isError
                    ? 'bg-rose-50 text-rose-600 border border-rose-200'
                    : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                }`}
              >
                {message.text}
              </div>
            )}

            {/* 로그인 / 회원가입 Button (matching bright blue button in image) */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 py-3 text-sm font-black text-white shadow-lg shadow-blue-600/30 transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {isLoading ? '처리 중...' : isRegisterMode ? '회원가입 완료' : '로그인'}
            </button>
          </form>

          {/* Links: 회원가입 | 비밀번호 찾기 */}
          <div className="mt-3.5 flex items-center justify-center gap-2 text-xs font-medium text-slate-500">
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setMessage(null);
              }}
              className="hover:text-blue-600 underline font-semibold"
            >
              {isRegisterMode ? '기존 계정으로 로그인' : '회원가입'}
            </button>
            <span>|</span>
            <button
              type="button"
              onClick={() => setMessage({ text: '비밀번호 재설정 링크는 지원팀으로 문의하세요.', isError: false })}
              className="hover:text-blue-600 font-semibold"
            >
              비밀번호 찾기
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-3.5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-slate-400 font-semibold">또는</span>
            </div>
          </div>

          {/* Fast Options: Google Sign In & Guest Play */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Google 계정으로 원클릭 로그인</span>
            </button>

            <button
              type="button"
              onClick={handleGuestPlay}
              className="w-full rounded-xl bg-slate-100 hover:bg-slate-200 py-2.5 text-xs font-bold text-slate-700 transition"
            >
              게스트로 바로 시작하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
