/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  getDocFromServer,
  collection,
  addDoc,
} from 'firebase/firestore';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { PlayerStats } from '../types/game';

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test Connection on boot
export async function testFirebaseConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client offline, check configuration.');
    }
  }
}

// Save or Update User Profile in Firestore
export async function saveUserProfileToFirestore(userId: string, stats: PlayerStats) {
  const path = `users/${userId}`;
  try {
    await setDoc(
      doc(db, 'users', userId),
      {
        username: stats.username || '플레이어',
        color: stats.selectedColor || '#fb7185',
        hat: stats.selectedHat || 'hardhat',
        shirt: stats.selectedShirt || 'basic_hoodie',
        pants: stats.selectedPants || 'denim_jeans',
        unlockedCosmetics: stats.unlockedCosmetics || ['hardhat', 'basic_hoodie', 'denim_jeans'],
        wins: stats.wins || 0,
        losses: stats.losses || 0,
        boxesDelivered: stats.boxesDelivered || 0,
        coopClears: stats.coopClears || 0,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// Load User Profile from Firestore
export async function loadUserProfileFromFirestore(userId: string): Promise<Partial<PlayerStats> | null> {
  const path = `users/${userId}`;
  try {
    const snap = await getDoc(doc(db, 'users', userId));
    if (snap.exists()) {
      const data = snap.data();
      return {
        username: data.username,
        selectedColor: data.color,
        selectedHat: data.hat,
        selectedShirt: data.shirt,
        selectedPants: data.pants,
        unlockedCosmetics: data.unlockedCosmetics || [],
        wins: data.wins || 0,
        losses: data.losses || 0,
        boxesDelivered: data.boxesDelivered || 0,
        coopClears: data.coopClears || 0,
      };
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return null;
  }
}

// Record Completed Match in Firestore
export async function recordMatchToFirestore(
  userId: string,
  matchData: {
    mapId: string;
    modeId: string;
    winnerTeam: string;
    clearTimeSeconds: number;
    boxesDelivered: number;
  }
) {
  const path = `users/${userId}/matches`;
  try {
    await addDoc(collection(db, 'users', userId, 'matches'), {
      ...matchData,
      userId,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

testFirebaseConnection();
