/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { ForcePower, GameModeId, MapId, MatchResult, PlayerInput, TeamColor } from '../types/game';
import { createCharacter, CharacterRig } from './character';
import { buildMapEnvironment, MapEnvironment } from './environment';
import { initPhysicsSystem, PhysicsBox, PhysicsSystem } from './physics';
import { BotAgent, createBotAgent, updateBotAI } from './botAI';
import { multiplayer, PeerPlayerInfo } from '../services/multiplayer';
import { sounds } from '../services/sound';
import { MAPS } from '../data/constants';

// Pre-allocated reusable math scratch vectors (Zero GC in loop)
const _vec3A = new THREE.Vector3();
const _vec3B = new THREE.Vector3();
const _vec3C = new THREE.Vector3();

export interface GameEngineOptions {
  canvasContainer: HTMLElement;
  mapId: MapId;
  modeId: GameModeId;
  playerColor: string;
  playerHat: string;
  playerShirt?: string;
  playerPants?: string;
  playerName: string;
  playerTeam: TeamColor;
  botRoster: Array<{ id: string; name: string; team: TeamColor; color: string; hat: string; shirt?: string; pants?: string }>;
  onScoreUpdate: (red: number, blue: number, coopDelivered: number, target: number) => void;
  onPowerChange: (power: ForcePower) => void;
  onCheckpointReached: (index: number) => void;
  onGameFinished: (result: MatchResult) => void;
  onDistanceToGoalUpdate: (distance: number) => void;
  onGrabStateChange?: (isGrabbing: boolean) => void;
}

export class GameEngine {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private pmrem: THREE.PMREMGenerator;

  private physics: PhysicsSystem;
  private mapEnv: MapEnvironment;

  // Local Player
  private playerRig: CharacterRig;
  private playerBody: CANNON.Body;
  private playerTeam: TeamColor;
  private activePower: ForcePower = 'gravity';
  private carriedBox: PhysicsBox | null = null;
  private currentCheckpoint: THREE.Vector3;
  private jumpCooldown: number = 0;
  private canJump: boolean = true;

  // AI Bots
  private bots: BotAgent[] = [];

  // Multiplayer Peer Rigs
  private peerRigs: Map<string, CharacterRig> = new Map();

  // Match State
  private mapId: MapId;
  private modeId: GameModeId;
  private isRunning: boolean = false;
  private animationFrameId: number = 0;
  private clock: THREE.Clock;
  private redScore: number = 0;
  private blueScore: number = 0;
  private coopDelivered: number = 0;
  private targetBoxes: number = 3;
  private startTime: number = 0;
  private matchFinished: boolean = false;

  // Input
  private input: PlayerInput = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
    grab: false,
    respawn: false,
    powerIndex: 0,
  };

  // Callbacks
  private onScoreUpdate: (red: number, blue: number, coopDelivered: number, target: number) => void;
  private onPowerChange: (power: ForcePower) => void;
  private onCheckpointReached: (index: number) => void;
  private onGameFinished: (result: MatchResult) => void;
  private onDistanceToGoalUpdate: (distance: number) => void;
  private onGrabStateChange?: (isGrabbing: boolean) => void;

  // Unsubscribe listeners
  private cleanupMultiplayer: Array<() => void> = [];

  constructor(options: GameEngineOptions) {
    this.container = options.canvasContainer;
    this.mapId = options.mapId;
    this.modeId = options.modeId;
    this.playerTeam = options.playerTeam;
    this.onScoreUpdate = options.onScoreUpdate;
    this.onPowerChange = options.onPowerChange;
    this.onCheckpointReached = options.onCheckpointReached;
    this.onGameFinished = options.onGameFinished;
    this.onDistanceToGoalUpdate = options.onDistanceToGoalUpdate;
    this.onGrabStateChange = options.onGrabStateChange;

    this.clock = new THREE.Clock();

    // 1. Scene & Camera
    this.scene = new THREE.Scene();
    const aspect = this.container.clientWidth / this.container.clientHeight || 1;
    this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 200);

    // 2. Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // 3. Studio Environment Map (PMREMGenerator + RoomEnvironment)
    this.pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = this.pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    // 4. Physics System
    this.physics = initPhysicsSystem(this.scene);

    // 5. Map Environment
    this.mapEnv = buildMapEnvironment(this.mapId, this.physics.materials);
    this.scene.add(this.mapEnv.sceneGroup);

    // Map fog & background
    this.scene.background = new THREE.Color(this.mapEnv.skyColor);
    this.scene.fog = new THREE.FogExp2(this.mapEnv.fogColor, 0.012);

    // Add physical bodies from map into Cannon world
    this.mapEnv.physicsBodies.forEach((body) => this.physics.world.addBody(body));

    // 6. Studio Lighting Rig (Warm key light + cool hemisphere fill)
    const hemiLight = new THREE.HemisphereLight(0xffffff, this.mapEnv.fogColor, 0.65);
    this.scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfffbeb, 1.4);
    keyLight.position.set(25, 45, 20);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 5;
    keyLight.shadow.camera.far = 120;
    const d = 35;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    this.scene.add(keyLight);

    // 7. Spawn Local Player
    const spawnPos =
      this.modeId === 'team_battle_3v3'
        ? this.playerTeam === 'red'
          ? this.mapEnv.redSpawn || this.mapEnv.playerSpawn
          : this.mapEnv.blueSpawn || this.mapEnv.playerSpawn
        : this.mapEnv.playerSpawn;

    this.currentCheckpoint = spawnPos.clone();
    this.playerRig = createCharacter({
      color: options.playerColor,
      hat: options.playerHat,
      shirt: options.playerShirt,
      pants: options.playerPants,
    });
    this.playerRig.setPower(this.activePower);
    this.scene.add(this.playerRig.root);

    this.playerBody = this.physics.createCharacterBody(spawnPos);

    // 8. Spawn Energy Boxes
    this.mapEnv.boxSpawns.forEach((pos, idx) => {
      const boxTeam: TeamColor =
        this.modeId === 'team_battle_3v3' ? (idx % 2 === 0 ? 'red' : 'blue') : 'neutral';
      this.physics.createBox(pos, `box_${idx}`, boxTeam);
    });

    // 9. Spawn AI Bots
    options.botRoster.forEach((botInfo, idx) => {
      const bSpawn =
        botInfo.team === 'red'
          ? (this.mapEnv.redSpawn || spawnPos).clone().add(new THREE.Vector3(-1.5 * (idx + 1), 0, 0))
          : botInfo.team === 'blue'
          ? (this.mapEnv.blueSpawn || spawnPos).clone().add(new THREE.Vector3(1.5 * (idx + 1), 0, 0))
          : spawnPos.clone().add(new THREE.Vector3((idx % 2 === 0 ? 1 : -1) * (idx + 1.2), 0, 0));

      const botRig = createCharacter({
        color: botInfo.color,
        hat: botInfo.hat,
        shirt: botInfo.shirt,
        pants: botInfo.pants,
        isBot: true,
      });
      this.scene.add(botRig.root);

      const botBody = this.physics.createCharacterBody(bSpawn);
      const agent = createBotAgent(botInfo.id, botInfo.name, botInfo.team, botRig, botBody, bSpawn);
      this.bots.push(agent);
    });

    // 10. Setup Multiplayer Listeners
    this.setupMultiplayerSync();

    // 11. Event Listeners (Keyboard & Window Resize)
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);

    // Pre-warm WebGL shader compilation
    this.renderer.compile(this.scene, this.camera);

    this.startTime = performance.now();
    this.isRunning = true;
    this.animate();
  }

  private setupMultiplayerSync() {
    this.cleanupMultiplayer.push(
      multiplayer.onPeerJoin((peer: PeerPlayerInfo) => {
        if (this.peerRigs.has(peer.id)) return;
        const rig = createCharacter({
          color: peer.color,
          hat: peer.hat,
        });
        this.scene.add(rig.root);
        this.peerRigs.set(peer.id, rig);
      })
    );

    this.cleanupMultiplayer.push(
      multiplayer.onPeerLeave((peerId: string) => {
        const rig = this.peerRigs.get(peerId);
        if (rig) {
          this.scene.remove(rig.root);
          this.peerRigs.delete(peerId);
        }
      })
    );

    this.cleanupMultiplayer.push(
      multiplayer.onPeerState((state) => {
        const rig = this.peerRigs.get(state.id);
        if (rig) {
          rig.root.position.set(state.x, state.y - 0.55, state.z);
          rig.root.rotation.y = state.rotY;
          rig.updateAnimation(0.016, state.speed, state.isGrounded, state.isGrabbing);
          rig.setPower((state.power as ForcePower) || null);
        }
      })
    );

    this.cleanupMultiplayer.push(
      multiplayer.onPeerBoxEvent((event) => {
        const targetBox = this.physics.boxes.find((b) => b.id === event.boxId);
        if (targetBox) {
          if (event.action === 'grab') {
            targetBox.carrierId = event.carrierId;
          } else if (event.action === 'drop') {
            targetBox.carrierId = null;
          } else if (event.action === 'deliver') {
            targetBox.delivered = true;
          }
        }
      })
    );
  }

  private handleResize = () => {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private handleKeyDown = (e: KeyboardEvent) => {
    const key = e.code;
    if (key === 'KeyW' || key === 'ArrowUp') this.input.forward = true;
    if (key === 'KeyS' || key === 'ArrowDown') this.input.backward = true;
    if (key === 'KeyA' || key === 'ArrowLeft') this.input.left = true;
    if (key === 'KeyD' || key === 'ArrowRight') this.input.right = true;

    if (key === 'Space') {
      if (this.canJump && this.jumpCooldown <= 0) {
        this.input.jump = true;
        this.executeJump();
      }
    }

    if (key === 'KeyE') {
      this.toggleGrabBox();
    }

    if (key === 'KeyR') {
      this.respawnToCheckpoint();
    }

    // Force power selection keys: 1, 2, 3, 4
    if (key === 'Digit1') this.switchPower('gravity');
    if (key === 'Digit2') this.switchPower('friction');
    if (key === 'Digit3') this.switchPower('elasticity');
    if (key === 'Digit4') this.switchPower('buoyancy');
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    const key = e.code;
    if (key === 'KeyW' || key === 'ArrowUp') this.input.forward = false;
    if (key === 'KeyS' || key === 'ArrowDown') this.input.backward = false;
    if (key === 'KeyA' || key === 'ArrowLeft') this.input.left = false;
    if (key === 'KeyD' || key === 'ArrowRight') this.input.right = false;
    if (key === 'Space') this.input.jump = false;
  };

  public switchPower(power: ForcePower) {
    if (this.activePower === power) return;
    this.activePower = power;
    this.playerRig.setPower(power);
    sounds.playPowerSwitch(power);
    this.onPowerChange(power);

    // Apply active power directly to carried box as well
    if (this.carriedBox) {
      this.physics.applyForcePowerToBox(this.carriedBox, power);
      multiplayer.sendBoxEvent(this.carriedBox.id, 'grab', 'player', power);
    }
  }

  private executeJump() {
    // Jump force depends on Scientific Force Power (Gravity makes jump 2.3x higher!)
    let jumpImpulse = 8.5;
    if (this.activePower === 'gravity') {
      jumpImpulse = 14.5;
    } else if (this.activePower === 'elasticity') {
      jumpImpulse = 12.0;
    }

    this.playerBody.velocity.y = jumpImpulse;
    this.jumpCooldown = 0.35;
    this.canJump = false;
    sounds.playJump();
  }

  public toggleGrabBox() {
    if (this.carriedBox) {
      // Release box
      sounds.playDrop();
      const dropPower = this.activePower;
      this.carriedBox.carrierId = null;
      this.physics.applyForcePowerToBox(this.carriedBox, dropPower);
      multiplayer.sendBoxEvent(this.carriedBox.id, 'drop', null, dropPower);
      this.carriedBox = null;
      this.onGrabStateChange?.(false);
    } else {
      // Search for nearby box within 2.2m
      const pPos = this.playerBody.position;
      let closest: PhysicsBox | null = null;
      let closestDist = 2.4;

      for (const box of this.physics.boxes) {
        if (box.delivered || box.carrierId) continue;
        const bPos = box.body.position;
        const dist = Math.sqrt(
          (pPos.x - bPos.x) ** 2 + (pPos.y - bPos.y) ** 2 + (pPos.z - bPos.z) ** 2
        );
        if (dist < closestDist) {
          closestDist = dist;
          closest = box;
        }
      }

      if (closest) {
        this.carriedBox = closest;
        closest.carrierId = 'local_player';
        this.physics.applyForcePowerToBox(closest, this.activePower);
        sounds.playGrab();
        multiplayer.sendBoxEvent(closest.id, 'grab', 'local_player', this.activePower);
        this.onGrabStateChange?.(true);
      }
    }
  }

  public respawnToCheckpoint() {
    this.playerBody.position.set(
      this.currentCheckpoint.x,
      this.currentCheckpoint.y + 1.2,
      this.currentCheckpoint.z
    );
    this.playerBody.velocity.set(0, 0, 0);

    if (this.carriedBox) {
      this.carriedBox.carrierId = null;
      this.carriedBox = null;
    }
    sounds.playCheckpoint();
  }

  private animate = () => {
    if (!this.isRunning) return;

    this.animationFrameId = requestAnimationFrame(this.animate);
    const dt = Math.min(this.clock.getDelta(), 0.05);
    const time = this.clock.getElapsedTime();

    this.update(dt, time);
    this.renderer.render(this.scene, this.camera);
  };

  private update(dt: number, time: number) {
    if (this.jumpCooldown > 0) {
      this.jumpCooldown -= dt;
    }

    // 1. Process Player Input & Movement Physics
    const pBody = this.playerBody;
    const isGrounded = Math.abs(pBody.velocity.y) < 0.3;
    if (isGrounded && this.jumpCooldown <= 0) {
      this.canJump = true;
    }

    // Direction calculation
    let moveX = 0;
    let moveZ = 0;
    if (this.input.forward) moveZ += 1;
    if (this.input.backward) moveZ -= 1;
    if (this.input.left) moveX -= 1;
    if (this.input.right) moveX += 1;

    let targetSpeed = this.carriedBox ? 4.8 : 6.8;

    // Scientific Force Modifications to Character
    if (this.activePower === 'friction') {
      // Ice slide / Super friction: very slippery sliding acceleration
      targetSpeed = 9.5;
    } else if (this.activePower === 'gravity') {
      // Light gravity: nimble agile movement
      targetSpeed = 7.8;
      // Upward anti-gravity counter force
      pBody.applyForce(new CANNON.Vec3(0, 500, 0));
    }

    if (moveX !== 0 || moveZ !== 0) {
      const len = Math.sqrt(moveX * moveX + moveZ * moveZ);
      moveX /= len;
      moveZ /= len;

      const accel = this.activePower === 'friction' ? 3.5 : 12.0;
      pBody.velocity.x = THREE.MathUtils.damp(pBody.velocity.x, moveX * targetSpeed, accel, dt);
      pBody.velocity.z = THREE.MathUtils.damp(pBody.velocity.z, moveZ * targetSpeed, accel, dt);

      // Face movement direction smoothly
      const targetAngle = Math.atan2(moveX, moveZ);
      this.playerRig.root.rotation.y = THREE.MathUtils.damp(
        this.playerRig.root.rotation.y,
        targetAngle,
        12,
        dt
      );
    } else {
      const damping = this.activePower === 'friction' ? 1.0 : 10.0;
      pBody.velocity.x = THREE.MathUtils.damp(pBody.velocity.x, 0, damping, dt);
      pBody.velocity.z = THREE.MathUtils.damp(pBody.velocity.z, 0, damping, dt);
    }

    // Buoyancy in water/quicksand zones
    const pPosVec = _vec3A.set(pBody.position.x, pBody.position.y, pBody.position.z);
    this.mapEnv.waterZones.forEach((w) => {
      if (
        pPosVec.x >= w.min.x &&
        pPosVec.x <= w.max.x &&
        pPosVec.y >= w.min.y &&
        pPosVec.y <= w.max.y &&
        pPosVec.z >= w.min.z &&
        pPosVec.z <= w.max.z
      ) {
        // Buoyancy upward force
        const force = this.activePower === 'buoyancy' ? 1400 : 700;
        pBody.applyForce(new CANNON.Vec3(0, force, 0));
      }
    });

    // 2. Carried Box Kinematics & Physics Coupling
    if (this.carriedBox) {
      const forward = _vec3B
        .set(0, 0, 1)
        .applyAxisAngle(new THREE.Vector3(0, 1, 0), this.playerRig.root.rotation.y);
      const holdPos = _vec3C.copy(pPosVec).add(forward.multiplyScalar(0.95));
      holdPos.y += 0.45;

      this.carriedBox.body.position.set(holdPos.x, holdPos.y, holdPos.z);
      this.carriedBox.body.velocity.set(pBody.velocity.x, pBody.velocity.y, pBody.velocity.z);
      this.carriedBox.mesh.position.copy(holdPos);
      this.carriedBox.mesh.rotation.y = this.playerRig.root.rotation.y;
    }

    // Fall off map boundary check
    if (pBody.position.y < -10) {
      this.respawnToCheckpoint();
    }

    // 3. Step Physics World & Hazards
    this.physics.step(dt);

    this.mapEnv.hazards.forEach((h) => h.update(time, dt));

    // 4. Update Local Character Rig & Animation
    this.playerRig.root.position.set(pBody.position.x, pBody.position.y - 0.55, pBody.position.z);
    const horizontalSpeed = Math.sqrt(pBody.velocity.x ** 2 + pBody.velocity.z ** 2);
    this.playerRig.updateAnimation(dt, horizontalSpeed, isGrounded, !!this.carriedBox);

    // 5. Update AI Bots
    const targetGoalPos =
      this.modeId === 'team_battle_3v3'
        ? (bot: BotAgent) =>
            bot.team === 'red'
              ? this.mapEnv.redGoalPosition || this.mapEnv.goalPosition
              : this.mapEnv.blueGoalPosition || this.mapEnv.goalPosition
        : () => this.mapEnv.goalPosition;

    this.bots.forEach((bot) => {
      updateBotAI(bot, dt, this.physics.boxes, targetGoalPos(bot), time);
    });

    // 6. Check Checkpoints
    this.mapEnv.checkpoints.forEach((cp, idx) => {
      if (pPosVec.distanceTo(cp) < 2.0 && cp.distanceTo(this.currentCheckpoint) > 1.0) {
        this.currentCheckpoint.copy(cp);
        sounds.playCheckpoint();
        this.onCheckpointReached(idx + 1);
      }
    });

    // 7. Check Goal Zones for Delivered Boxes
    this.checkGoalDeliveries();

    // 8. Camera Smooth Tracking with Exponential Damping
    const camOffset = _vec3A.set(0, 5.5, -8.5);
    const targetCamPos = _vec3B.copy(this.playerRig.root.position).add(camOffset);
    this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, targetCamPos.x, 8, dt);
    this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, targetCamPos.y, 8, dt);
    this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, targetCamPos.z, 8, dt);

    const lookTarget = _vec3C.copy(this.playerRig.root.position);
    lookTarget.y += 1.2;
    this.camera.lookAt(lookTarget);

    // Distance to goal readout for HUD
    const distToGoal = this.playerRig.root.position.distanceTo(this.mapEnv.goalPosition);
    this.onDistanceToGoalUpdate(Math.round(distToGoal));

    // 9. Send Network Position Updates (~20Hz)
    if (Math.random() < 0.35) {
      multiplayer.sendPlayerState({
        x: pBody.position.x,
        y: pBody.position.y,
        z: pBody.position.z,
        rotY: this.playerRig.root.rotation.y,
        speed: horizontalSpeed,
        isGrounded,
        isGrabbing: !!this.carriedBox,
        power: this.activePower,
      });
    }
  }

  private checkGoalDeliveries() {
    if (this.matchFinished) return;

    this.physics.boxes.forEach((box) => {
      if (box.delivered) return;

      const boxPos = box.mesh.position;

      if (this.modeId === 'coop_haul') {
        // Co-op mode: any box delivered to main goal pad
        if (boxPos.distanceTo(this.mapEnv.goalPosition) < 2.2) {
          box.delivered = true;
          box.carrierId = null;
          box.body.type = CANNON.Body.STATIC; // lock in place at goal
          sounds.playBoxDelivered();
          this.coopDelivered++;
          this.onScoreUpdate(this.redScore, this.blueScore, this.coopDelivered, this.targetBoxes);

          if (this.coopDelivered >= this.targetBoxes) {
            this.finishMatch('coop_clear');
          }
        }
      } else {
        // 3v3 Team Battle mode
        const redGoalPos = this.mapEnv.redGoalPosition || this.mapEnv.goalPosition;
        const blueGoalPos = this.mapEnv.blueGoalPosition || this.mapEnv.goalPosition;

        if (boxPos.distanceTo(redGoalPos) < 2.2) {
          box.delivered = true;
          box.carrierId = null;
          box.body.type = CANNON.Body.STATIC;
          sounds.playBoxDelivered();
          this.redScore++;
          this.onScoreUpdate(this.redScore, this.blueScore, this.coopDelivered, this.targetBoxes);

          if (this.redScore >= this.targetBoxes) {
            this.finishMatch('red');
          }
        } else if (boxPos.distanceTo(blueGoalPos) < 2.2) {
          box.delivered = true;
          box.carrierId = null;
          box.body.type = CANNON.Body.STATIC;
          sounds.playBoxDelivered();
          this.blueScore++;
          this.onScoreUpdate(this.redScore, this.blueScore, this.coopDelivered, this.targetBoxes);

          if (this.blueScore >= this.targetBoxes) {
            this.finishMatch('blue');
          }
        }
      }
    });
  }

  private finishMatch(winner: TeamColor | 'coop_clear') {
    this.matchFinished = true;
    sounds.playVictory();

    const elapsed = Math.round((performance.now() - this.startTime) / 1000);
    const result: MatchResult = {
      winnerTeam: winner,
      redScore: this.redScore,
      blueScore: this.blueScore,
      clearTimeSeconds: elapsed,
      boxesDelivered: this.modeId === 'coop_haul' ? this.coopDelivered : this.redScore + this.blueScore,
      mvpName: winner === 'coop_clear' ? '우리 팀 협동단' : winner === 'red' ? '레드 팀 에이스' : '블루 팀 에이스',
    };

    setTimeout(() => {
      this.onGameFinished(result);
    }, 1200);
  }

  public dispose() {
    this.isRunning = false;
    cancelAnimationFrame(this.animationFrameId);

    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);

    this.cleanupMultiplayer.forEach((fn) => fn());
    this.cleanupMultiplayer = [];

    this.physics.dispose();
    this.mapEnv.dispose();
    this.pmrem.dispose();
    this.renderer.dispose();

    if (this.container && this.renderer.domElement) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
