/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CosmeticItem } from '../types/game';

export const COSMETIC_COLORS: CosmeticItem[] = [
  { id: 'cream_white', name: '크림 화이트', category: 'color', description: '부드럽고 깔끔한 기본 모델 컬러', previewColor: '#f8fafc', unlockedByDefault: true },
  { id: 'pastel_peach', name: '파스텔 피치', category: 'color', description: '따뜻한 살구빛 감성의 스킨 톤', previewColor: '#fed7aa', unlockedByDefault: true },
  { id: 'coral_rose', name: '코랄 로즈', category: 'color', description: '발랄하고 사랑스러운 핑크빛 스킨', previewColor: '#fb7185', unlockedByDefault: true },
  { id: 'sky_cyan', name: '스카이 시안', category: 'color', description: '청량한 하늘을 닮은 라이트 블루', previewColor: '#38bdf8', unlockedByDefault: true },
  { id: 'soft_mint', name: '소프트 민트', category: 'color', description: '싱그러운 페퍼민트 그린', previewColor: '#34d399', unlockedByDefault: true },
  { id: 'butter_yellow', name: '버터 옐로우', category: 'color', description: '달콤하고 포근한 파스텔 노랑', previewColor: '#fde047', unlockedByDefault: true },
  { id: 'lavender_purple', name: '라벤더 퍼플', category: 'color', description: '신비로운 보랏빛 아우라', previewColor: '#c084fc', requiredWins: 1 },
  { id: 'midnight_slate', name: '미드나잇 슬레이트', category: 'color', description: '무게감 있는 세련된 흑연색', previewColor: '#334155', requiredWins: 3 },
];

export const COSMETIC_HATS: CosmeticItem[] = [
  { id: 'hardhat', name: '노란 안전모', category: 'hat', description: '험난한 힘의 탑 건설 현장의 상징적 안전모', unlockedByDefault: true },
  { id: 'beanie', name: '털 방울모자', category: 'hat', description: '빙하 협곡의 칼바람도 막아주는 포근한 니트 모자', unlockedByDefault: true },
  { id: 'catears', name: '고양이 귀 머리띠', category: 'hat', description: '착용하면 발걸음이 가벼워질 것 같은 귀여운 귀', unlockedByDefault: true },
  { id: 'pirate', name: '해적 선장 모자', category: 'hat', description: '험난한 탑을 정복하는 위풍당당한 캡틴 모자', requiredWins: 1 },
  { id: 'crown', name: '황금 왕관', category: 'hat', description: '수많은 상자를 운반해 낸 승리자만을 위한 왕관', requiredWins: 2 },
  { id: 'propeller', name: '프로펠러 캡', category: 'hat', description: '걸을 때마다 팽팽 돌아가는 익살스러운 모자', requiredWins: 4 },
  { id: 'halo', name: '천사 헤일로', category: 'hat', description: '머리 위에 은은하게 떠다니는 성스러운 빛의 고리', requiredWins: 5 },
];

export const COSMETIC_SHIRTS: CosmeticItem[] = [
  { id: 'basic_hoodie', name: '기본 후드티', category: 'shirt', description: '말랑한 캐릭터에게 가장 편안한 시그니처 후디', unlockedByDefault: true },
  { id: 'striped_tee', name: '스트라이프 티셔츠', category: 'shirt', description: '마린 룩 감성의 깔끔한 가로 줄무늬 셔츠', unlockedByDefault: true },
  { id: 'work_vest', name: '멜빵 안전 조끼', category: 'shirt', description: '형광 반사 띠가 부착된 프로페셔널 작업 조끼', unlockedByDefault: true },
  { id: 'hero_suit', name: '히어로 슈트', category: 'shirt', description: '가슴에 힘의 심볼이 새겨진 슈퍼히어로 슈트', requiredWins: 2 },
  { id: 'winter_sweater', name: '겨울 꽈배기 스웨터', category: 'shirt', description: '북유럽 스타일의 도톰한 뜨개 스웨터', requiredWins: 3 },
];

export const COSMETIC_PANTS: CosmeticItem[] = [
  { id: 'denim_jeans', name: '기본 청바지', category: 'pants', description: '어떤 상의와도 잘 어울리는 클래식 블루 데님', unlockedByDefault: true },
  { id: 'cargo_pants', name: '카고 작업 바지', category: 'pants', description: '도구 주머니가 넉넉한 튼튼한 카키 카고 팬츠', unlockedByDefault: true },
  { id: 'sport_shorts', name: '스포티 반바지', category: 'pants', description: '활동성이 뛰어나 점프와 달리기에 최적화된 쇼츠', unlockedByDefault: true },
  { id: 'track_joggers', name: '트레이닝 조거 팬츠', category: 'pants', description: '옆선 스트라이프가 돋보이는 애슬레틱 조거', requiredWins: 2 },
  { id: 'overalls', name: '빈티지 오버롤 팬츠', category: 'pants', description: '귀여운 서스펜더가 달린 클래식 멜빵바지', requiredWins: 4 },
];
