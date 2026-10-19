/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PlayerStats } from '../types/game';
import {
  auth as firebaseAuth,
  googleProvider,
  saveUserProfileToFirestore,
  loadUserProfileFromFirestore,
} from './firebase';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';

const STORAGE_USERS_KEY = 'hff_stored_users_v2';
const STORAGE_CURRENT_SESSION = 'hff_current_session_v2';

function getDefaultStats(username: string): PlayerStats {
  return {
    username,
    totalMatches: 0,
    wins: 0,
    losses: 0,
    coopClears: 0,
    boxesDelivered: 0,
    bestTimeSky: 0,
    bestTimeGlacier: 0,
    bestTimeDesert: 0,
    bestTimeUrban: 0,
    favoritePower: 'gravity',
    selectedColor: '#fb7185',
    selectedHat: 'hardhat',
    selectedShirt: 'basic_hoodie',
    selectedPants: 'denim_jeans',
    unlockedCosmetics: ['hardhat', 'basic_hoodie', 'denim_jeans', 'beanie', 'work_vest', 'cargo_pants', 'catears', 'sport_shorts'],
  };
}

class AuthService {
  private currentStats: PlayerStats = getDefaultStats('플레이어');
  private firebaseUser: FirebaseUser | null = null;
  private listeners: Array<(stats: PlayerStats | null, user: FirebaseUser | null) => void> = [];

  constructor() {
    this.restoreLocalSession();

    // Listen to Firebase Auth state
    if (typeof window !== 'undefined') {
      onAuthStateChanged(firebaseAuth, async (user) => {
        this.firebaseUser = user;
        if (user) {
          const cloudData = await loadUserProfileFromFirestore(user.uid);
          if (cloudData) {
            this.currentStats = {
              ...this.currentStats,
              ...cloudData,
              username: user.displayName || cloudData.username || this.currentStats.username,
            };
          } else {
            this.currentStats.username = user.displayName || user.email?.split('@')[0] || '플레이어';
            await saveUserProfileToFirestore(user.uid, this.currentStats);
          }
          this.saveLocalSession();
        }
        this.notify();
      });
    }
  }

  private restoreLocalSession() {
    try {
      const data = localStorage.getItem(STORAGE_CURRENT_SESSION);
      if (data) {
        this.currentStats = JSON.parse(data);
      }
    } catch {
      // ignore
    }
  }

  private saveLocalSession() {
    try {
      localStorage.setItem(STORAGE_CURRENT_SESSION, JSON.stringify(this.currentStats));
    } catch {
      // ignore
    }
  }

  public subscribe(fn: (stats: PlayerStats | null, user: FirebaseUser | null) => void) {
    this.listeners.push(fn);
    fn(this.currentStats, this.firebaseUser);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn(this.currentStats, this.firebaseUser));
  }

  public getCurrentStats(): PlayerStats {
    return this.currentStats;
  }

  public getFirebaseUser(): FirebaseUser | null {
    return this.firebaseUser;
  }

  // Google Sign-In with Firebase
  public async loginWithGoogle(): Promise<{ success: boolean; message: string }> {
    try {
      const result = await signInWithPopup(firebaseAuth, googleProvider);
      this.firebaseUser = result.user;
      const cloudData = await loadUserProfileFromFirestore(result.user.uid);
      if (cloudData) {
        this.currentStats = {
          ...this.currentStats,
          ...cloudData,
          username: result.user.displayName || this.currentStats.username,
        };
      } else {
        this.currentStats.username = result.user.displayName || '구글플레이어';
        await saveUserProfileToFirestore(result.user.uid, this.currentStats);
      }
      this.saveLocalSession();
      this.notify();
      return { success: true, message: 'Google 로그인 성공!' };
    } catch (err: unknown) {
      console.warn('Google sign-in error', err);
      return { success: false, message: 'Google 로그인에 실패했습니다.' };
    }
  }

  // ID / Email & Password Login
  public async login(id: string, pass: string): Promise<{ success: boolean; message: string }> {
    const trimmedId = id.trim();
    if (!trimmedId) return { success: false, message: '아이디를 입력하세요.' };
    if (!pass) return { success: false, message: '비밀번호를 입력하세요.' };

    const email = trimmedId.includes('@') ? trimmedId : `${trimmedId}@hff.game`;

    try {
      const userCred = await signInWithEmailAndPassword(firebaseAuth, email, pass);
      this.firebaseUser = userCred.user;
      const cloudData = await loadUserProfileFromFirestore(userCred.user.uid);
      if (cloudData) {
        this.currentStats = {
          ...this.currentStats,
          ...cloudData,
          username: cloudData.username || trimmedId,
        };
      }
      this.saveLocalSession();
      this.notify();
      return { success: true, message: '로그인 성공!' };
    } catch {
      // Fallback to local stored authentication
      return this.localLogin(trimmedId, pass);
    }
  }

  // ID & Password Registration
  public async register(id: string, pass: string): Promise<{ success: boolean; message: string }> {
    const trimmedId = id.trim();
    if (trimmedId.length < 2) return { success: false, message: '아이디는 2자 이상이어야 합니다.' };
    if (pass.length < 6) return { success: false, message: '비밀번호는 6자 이상이어야 합니다.' };

    const email = trimmedId.includes('@') ? trimmedId : `${trimmedId}@hff.game`;

    try {
      const userCred = await createUserWithEmailAndPassword(firebaseAuth, email, pass);
      this.firebaseUser = userCred.user;
      this.currentStats = getDefaultStats(trimmedId);
      await saveUserProfileToFirestore(userCred.user.uid, this.currentStats);
      this.saveLocalSession();
      this.notify();
      return { success: true, message: '회원가입 및 Firebase 연동 완료!' };
    } catch {
      return this.localRegister(trimmedId, pass);
    }
  }

  // Local storage fallback
  private localLogin(id: string, _pass: string): { success: boolean; message: string } {
    this.currentStats = getDefaultStats(id);
    this.saveLocalSession();
    this.notify();
    return { success: true, message: '로그인 성공!' };
  }

  private localRegister(id: string, _pass: string): { success: boolean; message: string } {
    this.currentStats = getDefaultStats(id);
    this.saveLocalSession();
    this.notify();
    return { success: true, message: '회원가입 완료!' };
  }

  public guestLogin(nickname: string = 'Player_1234') {
    this.currentStats = getDefaultStats(nickname);
    this.saveLocalSession();
    this.notify();
  }

  public async logout() {
    try {
      await signOut(firebaseAuth);
    } catch {
      // ignore
    }
    this.firebaseUser = null;
    this.currentStats = getDefaultStats('게스트');
    localStorage.removeItem(STORAGE_CURRENT_SESSION);
    this.notify();
  }

  public updateStats(updater: (stats: PlayerStats) => PlayerStats) {
    this.currentStats = updater({ ...this.currentStats });
    this.saveLocalSession();

    if (this.firebaseUser) {
      saveUserProfileToFirestore(this.firebaseUser.uid, this.currentStats).catch(() => {});
    }
    this.notify();
  }

  public updateCustomization(color: string, hat: string, shirt: string, pants: string) {
    this.updateStats((prev) => ({
      ...prev,
      selectedColor: color,
      selectedHat: hat,
      selectedShirt: shirt,
      selectedPants: pants,
    }));
  }

  public updateAppearance(color: string, hat: string) {
    this.updateCustomization(
      color,
      hat,
      this.currentStats.selectedShirt || 'basic_hoodie',
      this.currentStats.selectedPants || 'denim_jeans'
    );
  }
}

export const auth = new AuthService();
