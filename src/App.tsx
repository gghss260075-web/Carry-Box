/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { ForcePower, GameModeId, MapId, MatchResult, PlayerSlot, PlayerStats, TeamColor } from './types/game';
import { auth } from './services/auth';
import { multiplayer } from './services/multiplayer';
import { recordMatchToFirestore } from './services/firebase';
import { LoginScreen } from './components/screens/LoginScreen';
import { MapSelectScreen } from './components/screens/MapSelectScreen';
import { ModeSelectScreen } from './components/screens/ModeSelectScreen';
import { MatchingScreen } from './components/screens/MatchingScreen';
import { TeamLobbyScreen } from './components/screens/TeamLobbyScreen';
import { GameplayHUD } from './components/screens/GameplayHUD';
import { CustomizationModal } from './components/CustomizationModal';
import { ResultModal } from './components/ResultModal';
import { GameEngine } from './game/GameEngine';

type GameScreen = 'login' | 'map_select' | 'mode_select' | 'matching' | 'team_lobby' | 'in_game';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('login');
  const [userStats, setUserStats] = useState<PlayerStats>(auth.getCurrentStats());
  const [selectedMap, setSelectedMap] = useState<MapId>('sky_stairway');
  const [selectedMode, setSelectedMode] = useState<GameModeId>('coop_haul');
  const [matchRoster, setMatchRoster] = useState<PlayerSlot[]>([]);
  const [isCustomizationOpen, setIsCustomizationOpen] = useState(false);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);

  // In-Game Live HUD States
  const [activePower, setActivePower] = useState<ForcePower>('gravity');
  const [redScore, setRedScore] = useState(0);
  const [blueScore, setBlueScore] = useState(0);
  const [coopDelivered, setCoopDelivered] = useState(0);
  const [targetBoxes, setTargetBoxes] = useState(3);
  const [distanceToGoal, setDistanceToGoal] = useState(68);
  const [checkpointIndex, setCheckpointIndex] = useState(0);
  const [isGrabbingBox, setIsGrabbingBox] = useState(false);

  // GameEngine Reference
  const gameMountRef = useRef<HTMLDivElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);

  // Subscribe to Auth changes
  useEffect(() => {
    const unsub = auth.subscribe((stats) => {
      if (stats) setUserStats(stats);
    });
    return unsub;
  }, []);

  // Manage GameEngine lifecycle when entering or leaving in_game
  useEffect(() => {
    if (currentScreen === 'in_game') {
      const container = gameMountRef.current;
      if (!container) return;

      setRedScore(0);
      setBlueScore(0);
      setCoopDelivered(0);
      setCheckpointIndex(0);
      setIsGrabbingBox(false);
      setMatchResult(null);

      const userColor = userStats.selectedColor || '#fb7185';
      const userHat = userStats.selectedHat || 'hardhat';
      const userShirt = userStats.selectedShirt || 'basic_hoodie';
      const userPants = userStats.selectedPants || 'denim_jeans';
      const userName = userStats.username || '플레이어';

      const userSlot = matchRoster.find((s) => !s.isBot);
      const team: TeamColor = userSlot?.team || (selectedMode === 'team_battle_3v3' ? 'blue' : 'neutral');

      // Connect to WebSocket room
      const roomId = `room_${selectedMap}_${selectedMode}`;
      multiplayer.connect(roomId, {
        id: `player_${Math.random().toString(36).substring(2, 7)}`,
        name: userName,
        team,
        color: userColor,
        hat: userHat,
      });

      const botList = matchRoster.filter((s) => s.isBot);

      const engine = new GameEngine({
        canvasContainer: container,
        mapId: selectedMap,
        modeId: selectedMode,
        playerColor: userColor,
        playerHat: userHat,
        playerShirt: userShirt,
        playerPants: userPants,
        playerName: userName,
        playerTeam: team,
        botRoster: botList.map((b) => ({
          id: b.id,
          name: b.name,
          team: b.team,
          color: b.color,
          hat: b.hat,
          shirt: b.shirt,
          pants: b.pants,
        })),
        onScoreUpdate: (red, blue, coop, target) => {
          setRedScore(red);
          setBlueScore(blue);
          setCoopDelivered(coop);
          setTargetBoxes(target);
        },
        onPowerChange: (pow) => {
          setActivePower(pow);
        },
        onCheckpointReached: (cp) => {
          setCheckpointIndex(cp);
        },
        onGameFinished: (res) => {
          setMatchResult(res);

          // Save match record to Firebase Firestore
          const firebaseUser = auth.getFirebaseUser();
          if (firebaseUser) {
            recordMatchToFirestore(firebaseUser.uid, {
              mapId: selectedMap,
              modeId: selectedMode,
              winnerTeam: res.winnerTeam,
              clearTimeSeconds: res.clearTimeSeconds,
              boxesDelivered: res.boxesDelivered,
            }).catch(() => {});
          }
        },
        onDistanceToGoalUpdate: (dist) => {
          setDistanceToGoal(dist);
        },
        onGrabStateChange: (grabbing) => {
          setIsGrabbingBox(grabbing);
        },
      });

      gameEngineRef.current = engine;

      return () => {
        multiplayer.disconnect();
        if (gameEngineRef.current) {
          gameEngineRef.current.dispose();
          gameEngineRef.current = null;
        }
      };
    } else {
      if (gameEngineRef.current) {
        multiplayer.disconnect();
        gameEngineRef.current.dispose();
        gameEngineRef.current = null;
      }
    }
  }, [currentScreen, selectedMap, selectedMode, matchRoster, userStats]);

  const handleSwitchPower = (power: ForcePower) => {
    if (gameEngineRef.current) {
      gameEngineRef.current.switchPower(power);
    }
  };

  const handleToggleGrab = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.toggleGrabBox();
    }
  };

  const handleRespawn = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.respawnToCheckpoint();
    }
  };

  const handleExitGame = () => {
    setCurrentScreen('map_select');
  };

  const handlePlayAgain = () => {
    setMatchResult(null);
    setCurrentScreen('matching');
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-950 font-sans antialiased text-slate-100">
      {/* SCREEN 1: LOGIN (Matching Panel 1 in image) */}
      {currentScreen === 'login' && (
        <LoginScreen onLoginSuccess={() => setCurrentScreen('map_select')} />
      )}

      {/* SCREEN 2: MAP SELECT (Matching Panel 2 in image) */}
      {currentScreen === 'map_select' && (
        <MapSelectScreen
          selectedMap={selectedMap}
          onSelectMap={(id) => setSelectedMap(id)}
          onConfirm={() => setCurrentScreen('mode_select')}
          onBack={() => setCurrentScreen('login')}
        />
      )}

      {/* SCREEN 3: GAME MODE SELECT (Matching Panel 3 in image) */}
      {currentScreen === 'mode_select' && (
        <ModeSelectScreen
          selectedMode={selectedMode}
          onSelectMode={(id) => setSelectedMode(id)}
          onConfirm={() => setCurrentScreen('matching')}
          onBack={() => setCurrentScreen('map_select')}
        />
      )}

      {/* SCREEN 4: AI BOT TEAM MATCHING (Matching Panel 4 in image) */}
      {currentScreen === 'matching' && (
        <MatchingScreen
          mapId={selectedMap}
          modeId={selectedMode}
          playerName={userStats.username}
          playerColor={userStats.selectedColor}
          playerHat={userStats.selectedHat}
          playerShirt={userStats.selectedShirt}
          playerPants={userStats.selectedPants}
          onMatchComplete={(roster) => {
            setMatchRoster(roster);
            setCurrentScreen('team_lobby');
          }}
          onCancel={() => setCurrentScreen('mode_select')}
        />
      )}

      {/* SCREEN 5: TEAM LOBBY WAITING ROOM (Matching Panel 5 in image) */}
      {currentScreen === 'team_lobby' && (
        <TeamLobbyScreen
          mapId={selectedMap}
          modeId={selectedMode}
          roster={matchRoster}
          onStartGame={() => setCurrentScreen('in_game')}
          onOpenCustomization={() => setIsCustomizationOpen(true)}
        />
      )}

      {/* SCREEN 6: IN-GAME PLAY (Matching Panel 6 in image) */}
      {currentScreen === 'in_game' && (
        <div className="relative h-full w-full">
          {/* 3D WebGL Canvas Viewport */}
          <div ref={gameMountRef} className="absolute inset-0 h-full w-full" />

          {/* Low-Occlusion World-Matched HUD */}
          <GameplayHUD
            mapId={selectedMap}
            modeId={selectedMode}
            playerTeam={matchRoster.find((s) => !s.isBot)?.team || 'blue'}
            activePower={activePower}
            redScore={redScore}
            blueScore={blueScore}
            coopDelivered={coopDelivered}
            targetBoxes={targetBoxes}
            distanceToGoal={distanceToGoal}
            checkpointIndex={checkpointIndex}
            isGrabbingBox={isGrabbingBox}
            onSwitchPower={handleSwitchPower}
            onToggleGrab={handleToggleGrab}
            onRespawn={handleRespawn}
            onExitGame={handleExitGame}
          />
        </div>
      )}

      {/* Character Customization Modal */}
      <CustomizationModal
        isOpen={isCustomizationOpen}
        onClose={() => setIsCustomizationOpen(false)}
        stats={userStats}
      />

      {/* Match Result Modal */}
      {matchResult && (
        <ResultModal
          result={matchResult}
          mapId={selectedMap}
          modeId={selectedMode}
          playerTeam={matchRoster.find((s) => !s.isBot)?.team || 'blue'}
          onPlayAgain={handlePlayAgain}
          onReturnToWaitingRoom={() => {
            setMatchResult(null);
            setCurrentScreen('team_lobby');
          }}
          onReturnToLobby={() => {
            setMatchResult(null);
            setCurrentScreen('map_select');
          }}
        />
      )}
    </div>
  );
}
