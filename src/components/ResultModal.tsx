/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { GameModeId, MapId, MatchResult, TeamColor } from '../types/game';
import { auth } from '../services/auth';
import { Trophy, Clock, PackageCheck, Award, RotateCcw, Home, Sparkles } from 'lucide-react';
import { MAPS } from '../data/constants';

interface ResultModalProps {
  result: MatchResult;
  mapId: MapId;
  modeId: GameModeId;
  playerTeam: TeamColor;
  onPlayAgain: () => void;
  onReturnToWaitingRoom: () => void;
  onReturnToLobby: () => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({
  result,
  mapId,
  modeId,
  playerTeam,
  onPlayAgain,
  onReturnToWaitingRoom,
  onReturnToLobby,
}) => {
  const isCoop = modeId === 'coop_haul';
  const isWinner = isCoop
    ? result.winnerTeam === 'coop_clear'
    : result.winnerTeam === playerTeam;

  useEffect(() => {
    // Record match stats in player account
    auth.updateStats((prev) => {
      const isWin = isWinner;
      const coopClears = isCoop && isWin ? prev.coopClears + 1 : prev.coopClears;

      // Update best time for map
      let bestTimeSky = prev.bestTimeSky;
      let bestTimeGlacier = prev.bestTimeGlacier;
      let bestTimeDesert = prev.bestTimeDesert;
      let bestTimeUrban = prev.bestTimeUrban;

      if (isWin) {
        if (mapId === 'sky_stairway') {
          bestTimeSky = bestTimeSky === 0 ? result.clearTimeSeconds : Math.min(bestTimeSky, result.clearTimeSeconds);
        } else if (mapId === 'glacier_canyon') {
          bestTimeGlacier = bestTimeGlacier === 0 ? result.clearTimeSeconds : Math.min(bestTimeGlacier, result.clearTimeSeconds);
        } else if (mapId === 'desert_ruins') {
          bestTimeDesert = bestTimeDesert === 0 ? result.clearTimeSeconds : Math.min(bestTimeDesert, result.clearTimeSeconds);
        } else if (mapId === 'urban_construction') {
          bestTimeUrban = bestTimeUrban === 0 ? result.clearTimeSeconds : Math.min(bestTimeUrban, result.clearTimeSeconds);
        }
      }

      return {
        ...prev,
        totalMatches: prev.totalMatches + 1,
        wins: isWin ? prev.wins + 1 : prev.wins,
        losses: !isWin ? prev.losses + 1 : prev.losses,
        coopClears,
        boxesDelivered: prev.boxesDelivered + result.boxesDelivered,
        bestTimeSky,
        bestTimeGlacier,
        bestTimeDesert,
        bestTimeUrban,
      };
    });
  }, [result, mapId, isCoop, isWinner]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
      <div className="w-full max-w-lg rounded-3xl border border-slate-700/80 bg-slate-900 p-7 shadow-2xl text-slate-100 text-center">
        {/* Banner */}
        <div className="flex flex-col items-center">
          <div
            className={`flex h-20 w-20 items-center justify-center rounded-3xl shadow-xl ${
              isWinner
                ? 'bg-amber-500/20 text-amber-400 ring-4 ring-amber-500/30'
                : 'bg-rose-500/20 text-rose-400 ring-4 ring-rose-500/30'
            }`}
          >
            {isWinner ? <Trophy className="h-10 w-10" /> : <Award className="h-10 w-10" />}
          </div>

          <h2 className="mt-4 text-3xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            {isWinner ? (
              <>
                <Sparkles className="h-6 w-6 text-amber-400" />
                <span>승리 (VICTORY)!</span>
              </>
            ) : (
              <span>아쉬운 패배 (DEFEAT)</span>
            )}
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            {isCoop
              ? `${MAPS[mapId].nameKo} 협동 상자 운반 미션을 완수했습니다!`
              : isWinner
              ? `${playerTeam.toUpperCase()} 팀이 목표 상자를 먼저 운반하여 승리했습니다!`
              : '상대 팀이 먼저 상자를 모두 운반했습니다. 다음 판에 설욕하세요!'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 my-6">
          <div className="rounded-2xl bg-slate-800/80 p-3.5 border border-slate-700/60">
            <Clock className="h-5 w-5 text-sky-400 mx-auto mb-1" />
            <span className="text-[11px] text-slate-400">소요 시간</span>
            <p className="font-mono text-lg font-bold text-white tabular-nums">
              {result.clearTimeSeconds}초
            </p>
          </div>

          <div className="rounded-2xl bg-slate-800/80 p-3.5 border border-slate-700/60">
            <PackageCheck className="h-5 w-5 text-emerald-400 mx-auto mb-1" />
            <span className="text-[11px] text-slate-400">운반한 상자</span>
            <p className="font-mono text-lg font-bold text-white tabular-nums">
              {result.boxesDelivered}개
            </p>
          </div>

          <div className="rounded-2xl bg-slate-800/80 p-3.5 border border-slate-700/60">
            <Award className="h-5 w-5 text-amber-400 mx-auto mb-1" />
            <span className="text-[11px] text-slate-400">MVP</span>
            <p className="text-xs font-bold text-white truncate mt-1">
              {result.mvpName}
            </p>
          </div>
        </div>

        {/* Account Save Notice */}
        <div className="rounded-xl bg-indigo-950/40 border border-indigo-500/30 px-3 py-2 text-xs text-indigo-300 mb-6">
          경기 기록과 통계가 계정에 안전하게 저장되었습니다.
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={onPlayAgain}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition"
          >
            <RotateCcw className="h-4 w-4" />
            <span>바로 다시 하기</span>
          </button>

          <button
            onClick={onReturnToWaitingRoom}
            className="w-full rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 py-3 text-sm font-bold text-slate-200 transition"
          >
            대기실로 복귀
          </button>

          <button
            onClick={onReturnToLobby}
            className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-850 hover:bg-slate-800 py-3 text-sm font-bold text-slate-300 transition"
          >
            <Home className="h-4 w-4" />
            <span>메인 로비</span>
          </button>
        </div>
      </div>
    </div>
  );
};
