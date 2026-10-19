/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ForcePower, ForcePowerConfig, GameModeConfig, GameModeId, MapConfig, MapId } from '../types/game';

export const FORCE_POWERS: Record<ForcePower, ForcePowerConfig> = {
  gravity: {
    id: 'gravity',
    name: 'Gravity Alteration',
    nameKo: '중력 제어 (저중력)',
    iconName: 'Orbit',
    color: '#818cf8', // soft indigo
    auraColor: 0x818cf8,
    description: '물체와 캐릭터의 질량과 중력 가속도를 대폭 낮춥니다.',
    effectSummary: '점프력 2.5배 증가, 상자가 깃털처럼 가벼워져 오르막길을 손쉽게 운반',
    multiplier: 0.35,
  },
  friction: {
    id: 'friction',
    name: 'Friction Control',
    nameKo: '마찰력 제어 (초미끄럼/극마찰)',
    iconName: 'Wind',
    color: '#38bdf8', // soft sky cyan
    auraColor: 0x38bdf8,
    description: '접촉면의 마찰력을 0으로 만들어 끝없이 미끄러지거나 급정지합니다.',
    effectSummary: '상자를 컬링 스톤처럼 고속으로 밀어 이동시키며 빙판길에서 미끄러지지 않음',
    multiplier: 0.05,
  },
  elasticity: {
    id: 'elasticity',
    name: 'Super Elasticity',
    nameKo: '탄성력 제어 (슈퍼 바운스)',
    iconName: 'Sparkles',
    color: '#f472b6', // soft pink
    auraColor: 0xf472b6,
    description: '반발계수(Restitution)를 극대화하여 물체를 용수철처럼 튕겨냅니다.',
    effectSummary: '상자를 튕겨 높은 절벽을 넘기거나, 트램펄린처럼 도약하여 협곡 횡단',
    multiplier: 0.96,
  },
  buoyancy: {
    id: 'buoyancy',
    name: 'Buoyancy Field',
    nameKo: '부력 제어 (상승 기류/수면 부양)',
    iconName: 'Droplets',
    color: '#34d399', // soft emerald
    auraColor: 0x34d399,
    description: '상승하는 공기/유체 부력장을 형성하여 무거운 물체를 공중으로 부양시킵니다.',
    effectSummary: '물이나 수렁에 빠지지 않고 떠오르며, 낭떠러지 위로 떠오르는 발판 생성',
    multiplier: 1.8,
  },
};

export const MAPS: Record<MapId, MapConfig> = {
  sky_stairway: {
    id: 'sky_stairway',
    name: 'Sky Stairway',
    nameKo: '하늘 계단',
    tagline: '구름 위에 떠 있는 신비로운 공중 사원과 끝없이 이어지는 나선형 계단',
    difficulty: '쉬움',
    themeColor: '#60a5fa',
    skyColor: 0xdbeafe,
    fogColor: 0xbfdbfe,
    groundColor: 0xf1f5f9,
    hazards: ['강풍 돌풍', '움직이는 구름 발판', '낙하 낭떠러지', '회전 방망이'],
    recommendedForce: 'gravity',
    boxTargetCount: 3,
  },
  glacier_canyon: {
    id: 'glacier_canyon',
    name: 'Glacier Canyon',
    nameKo: '빙하 협곡',
    tagline: '극저온의 얼음 협곡, 미끄러운 빙판길과 얼어붙은 호수를 건너는 험로',
    difficulty: '보통',
    themeColor: '#38bdf8',
    skyColor: 0xe0f2fe,
    fogColor: 0xbae6fd,
    groundColor: 0xe0f7fa,
    hazards: ['미끄러운 빙판', '얼음 균열', '얼음 호수', '빙산 충돌체'],
    recommendedForce: 'buoyancy',
    boxTargetCount: 3,
  },
  desert_ruins: {
    id: 'desert_ruins',
    name: 'Desert Ruins',
    nameKo: '사막 유적',
    tagline: '모래바람 부는 고대 피라미드와 가파른 모래 언덕, 삼켜버리는 유사 지대',
    difficulty: '어려움',
    themeColor: '#fbbf24',
    skyColor: 0xfef3c7,
    fogColor: 0xfde68a,
    groundColor: 0xfef08a,
    hazards: ['모래 미끄럼', '유사 늪(Quicksand)', '구르는 둥근 바위', '무너지는 기둥'],
    recommendedForce: 'friction',
    boxTargetCount: 3,
  },
  urban_construction: {
    id: 'urban_construction',
    name: 'Urban Construction',
    nameKo: '도시 공사장',
    tagline: '초고층 마천루 건설 현장, 아슬아슬한 철골 빔과 유압 리프트, 타워크레인',
    difficulty: '매우 어려움',
    themeColor: '#f97316',
    skyColor: 0xffedd5,
    fogColor: 0xfed7aa,
    groundColor: 0x94a3b8,
    hazards: ['흔들리는 크레인 빔', '점프 패드', '수직 리프트', '고압 배관'],
    recommendedForce: 'elasticity',
    boxTargetCount: 3,
  },
};

export const GAME_MODES: Record<GameModeId, GameModeConfig> = {
  coop_haul: {
    id: 'coop_haul',
    name: 'Co-op Box Haul',
    nameKo: '협동 상자 운반 모드',
    description: '팀원과 힘을 합쳐 무거운 과학 에너지 상자 3개를 온갖 난관을 뚫고 정상의 포털 패드까지 모두 운반하세요!',
    playersPerTeam: 4,
    targetBoxes: 3,
    winCondition: '에너지 상자 3개를 목표 포털에 모두 배치하면 협동 미션 성공!',
  },
  team_battle_3v3: {
    id: 'team_battle_3v3',
    name: '3 vs 3 Team Battle',
    nameKo: '3대3 팀 대결 모드',
    description: '레드 팀과 블루 팀으로 나뉘어 상대보다 먼저 3개의 에너지 상자를 아군 골대로 운반하세요. 상대를 밀쳐 방해할 수 있습니다!',
    playersPerTeam: 3,
    targetBoxes: 3,
    winCondition: '먼저 상자 3개를 아군 베이스에 꽂아 넣는 팀이 최종 승리!',
  },
};

export const BOT_NAMES = [
  '말랑이',
  '비틀비틀',
  '중력마스터',
  '통통이',
  '빙판요정',
  '바운스킹',
  '부력술사',
  '우당탕탕',
  '흔들흔들',
  '안전모맨',
];

export const CHARACTER_COLORS = [
  { name: '코랄 핑크', hex: '#fb7185' },
  { name: '스카이 블루', hex: '#38bdf8' },
  { name: '민트 그린', hex: '#34d399' },
  { name: '버터 옐로우', hex: '#fde047' },
  { name: '라벤더 퍼플', hex: '#c084fc' },
  { name: '살구 오렌지', hex: '#fb923c' },
];

export const CHARACTER_HATS = [
  { id: 'none', name: '기본' },
  { id: 'hardhat', name: '노란 안전모' },
  { id: 'beanie', name: '털 방울모자' },
  { id: 'crown', name: '황금 왕관' },
  { id: 'halo', name: '천사 헤일로' },
  { id: 'propeller', name: '프로펠러 캡' },
];
