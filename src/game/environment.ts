/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { MapId } from '../types/game';

export interface DynamicHazard {
  mesh: THREE.Object3D;
  body: CANNON.Body;
  update: (time: number, dt: number) => void;
}

export interface WaterZone {
  mesh: THREE.Mesh;
  min: THREE.Vector3;
  max: THREE.Vector3;
  buoyantForce: number;
}

export interface MapEnvironment {
  sceneGroup: THREE.Group;
  physicsBodies: CANNON.Body[];
  hazards: DynamicHazard[];
  waterZones: WaterZone[];
  checkpoints: THREE.Vector3[];
  boxSpawns: THREE.Vector3[];
  goalPosition: THREE.Vector3;
  redGoalPosition?: THREE.Vector3;
  blueGoalPosition?: THREE.Vector3;
  playerSpawn: THREE.Vector3;
  redSpawn?: THREE.Vector3;
  blueSpawn?: THREE.Vector3;
  skyColor: number;
  fogColor: number;
  dispose: () => void;
}

// Helper to create a physics-enabled static box platform
function createPlatform(
  width: number,
  height: number,
  depth: number,
  pos: THREE.Vector3,
  rot: THREE.Euler,
  material: THREE.Material,
  cannonMaterial?: CANNON.Material,
  group?: THREE.Group,
  bodies?: CANNON.Body[]
): { mesh: THREE.Mesh; body: CANNON.Body } {
  const geom = new THREE.BoxGeometry(width, height, depth);
  const mesh = new THREE.Mesh(geom, material);
  mesh.position.copy(pos);
  mesh.rotation.copy(rot);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  const shape = new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2));
  const body = new CANNON.Body({
    mass: 0,
    material: cannonMaterial,
    shape,
  });
  body.position.set(pos.x, pos.y, pos.z);
  const q = new THREE.Quaternion().setFromEuler(rot);
  body.quaternion.set(q.x, q.y, q.z, q.w);

  if (group) group.add(mesh);
  if (bodies) bodies.push(body);

  return { mesh, body };
}

// Create a glowing Checkpoint Beacon
export function createCheckpointMesh(pos: THREE.Vector3): THREE.Group {
  const group = new THREE.Group();
  group.position.copy(pos);

  const baseGeom = new THREE.CylinderGeometry(1.2, 1.4, 0.2, 16);
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.5 });
  const base = new THREE.Mesh(baseGeom, baseMat);
  base.position.y = 0.1;
  base.receiveShadow = true;
  group.add(base);

  const ringGeom = new THREE.TorusGeometry(1.0, 0.06, 8, 24);
  ringGeom.rotateX(Math.PI / 2);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  const ring = new THREE.Mesh(ringGeom, ringMat);
  ring.position.y = 0.22;
  group.add(ring);

  const crystalGeom = new THREE.OctahedronGeometry(0.35, 0);
  const crystalMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    roughness: 0.2,
    metalness: 0.8,
  });
  const crystal = new THREE.Mesh(crystalGeom, crystalMat);
  crystal.position.y = 1.3;
  crystal.name = 'beaconCrystal';
  group.add(crystal);

  return group;
}

// Create Goal Delivery Zone pad with glowing rings
export function createGoalZoneMesh(pos: THREE.Vector3, colorHex: number = 0x10b981): THREE.Group {
  const group = new THREE.Group();
  group.position.copy(pos);

  const padGeom = new THREE.CylinderGeometry(2.2, 2.5, 0.3, 24);
  const padMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.2 });
  const pad = new THREE.Mesh(padGeom, padMat);
  pad.position.y = 0.15;
  pad.receiveShadow = true;
  group.add(pad);

  // Concentric glowing rings
  const ringGeom1 = new THREE.TorusGeometry(1.8, 0.08, 8, 32);
  ringGeom1.rotateX(Math.PI / 2);
  const ringMat = new THREE.MeshBasicMaterial({ color: colorHex });
  const ring1 = new THREE.Mesh(ringGeom1, ringMat);
  ring1.position.y = 0.31;
  group.add(ring1);

  const ringGeom2 = new THREE.TorusGeometry(1.0, 0.06, 8, 32);
  ringGeom2.rotateX(Math.PI / 2);
  const ring2 = new THREE.Mesh(ringGeom2, ringMat);
  ring2.position.y = 0.31;
  group.add(ring2);

  // Hologram pillar
  const pillarGeom = new THREE.CylinderGeometry(0.8, 0.8, 2.5, 16, 1, true);
  const pillarMat = new THREE.MeshBasicMaterial({
    color: colorHex,
    transparent: true,
    opacity: 0.25,
    side: THREE.DoubleSide,
  });
  const pillar = new THREE.Mesh(pillarGeom, pillarMat);
  pillar.position.y = 1.5;
  group.add(pillar);

  return group;
}

export function buildMapEnvironment(
  mapId: MapId,
  physicsMaterials: {
    ground: CANNON.Material;
    ice: CANNON.Material;
    bouncy: CANNON.Material;
    sticky: CANNON.Material;
  }
): MapEnvironment {
  const sceneGroup = new THREE.Group();
  const physicsBodies: CANNON.Body[] = [];
  const hazards: DynamicHazard[] = [];
  const waterZones: WaterZone[] = [];
  const checkpoints: THREE.Vector3[] = [];
  const boxSpawns: THREE.Vector3[] = [];

  let playerSpawn = new THREE.Vector3(0, 3, 0);
  let redSpawn = new THREE.Vector3(-4, 3, 0);
  let blueSpawn = new THREE.Vector3(4, 3, 0);
  let goalPosition = new THREE.Vector3(0, 16, 68);
  let redGoalPosition = new THREE.Vector3(-8, 16, 68);
  let blueGoalPosition = new THREE.Vector3(8, 16, 68);
  let skyColor = 0xdbeafe;
  let fogColor = 0xbfdbfe;

  // 1. SKY STAIRWAY
  if (mapId === 'sky_stairway') {
    skyColor = 0xdbeafe;
    fogColor = 0xbfdbfe;

    const marbleMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4, metalness: 0.05 });
    const cloudMat = new THREE.MeshStandardMaterial({ color: 0xe0f2fe, roughness: 0.9, metalness: 0.0 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.25, metalness: 0.85 });

    // Starting Plaza
    createPlatform(14, 2, 14, new THREE.Vector3(0, 0, 0), new THREE.Euler(), marbleMat, physicsMaterials.ground, sceneGroup, physicsBodies);
    playerSpawn = new THREE.Vector3(0, 2.5, -3);
    redSpawn = new THREE.Vector3(-4, 2.5, -3);
    blueSpawn = new THREE.Vector3(4, 2.5, -3);

    // Initial Boxes
    boxSpawns.push(new THREE.Vector3(-2, 2.5, 1));
    boxSpawns.push(new THREE.Vector3(0, 2.5, 2));
    boxSpawns.push(new THREE.Vector3(2, 2.5, 1));

    // First Flight of Stairs (ascending z: 8 to 22, y: 0 to 5)
    for (let i = 0; i < 7; i++) {
      const stepY = i * 0.7;
      const stepZ = 8 + i * 2.0;
      createPlatform(8, 0.7, 2.2, new THREE.Vector3(0, stepY, stepZ), new THREE.Euler(), marbleMat, physicsMaterials.ground, sceneGroup, physicsBodies);
    }

    // Mid Checkpoint Plaza 1 (y: 5.2, z: 25)
    createPlatform(12, 1.5, 10, new THREE.Vector3(0, 5, 26), new THREE.Euler(), marbleMat, physicsMaterials.ground, sceneGroup, physicsBodies);
    checkpoints.push(new THREE.Vector3(0, 6.2, 26));

    // Rotating Wind Baton Hazard
    const batonGeom = new THREE.BoxGeometry(9, 0.6, 0.6);
    const batonMesh = new THREE.Mesh(batonGeom, goldMat);
    batonMesh.position.set(0, 6.8, 26);
    batonMesh.castShadow = true;
    sceneGroup.add(batonMesh);

    const batonBody = new CANNON.Body({
      mass: 0,
      type: CANNON.Body.KINEMATIC,
      shape: new CANNON.Box(new CANNON.Vec3(4.5, 0.3, 0.3)),
    });
    batonBody.position.set(0, 6.8, 26);
    physicsBodies.push(batonBody);

    hazards.push({
      mesh: batonMesh,
      body: batonBody,
      update: (time) => {
        const angle = time * 1.5;
        batonMesh.rotation.y = angle;
        batonBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), angle);
      },
    });

    // Moving Cloud Platform (y: 6.5, z: 36)
    const cloudGeom = new THREE.BoxGeometry(6, 1.2, 5);
    const cloudMesh = new THREE.Mesh(cloudGeom, cloudMat);
    cloudMesh.position.set(0, 6.5, 36);
    cloudMesh.castShadow = true;
    cloudMesh.receiveShadow = true;
    sceneGroup.add(cloudMesh);

    const cloudBody = new CANNON.Body({
      mass: 0,
      type: CANNON.Body.KINEMATIC,
      shape: new CANNON.Box(new CANNON.Vec3(3, 0.6, 2.5)),
    });
    cloudBody.position.set(0, 6.5, 36);
    physicsBodies.push(cloudBody);

    hazards.push({
      mesh: cloudMesh,
      body: cloudBody,
      update: (time) => {
        const xOffset = Math.sin(time * 1.2) * 5;
        cloudMesh.position.x = xOffset;
        cloudBody.position.x = xOffset;
      },
    });

    // Second Stairs & Slopes (ascending z: 42 to 56, y: 7 to 13)
    createPlatform(7, 1.2, 6, new THREE.Vector3(-3, 8.5, 43), new THREE.Euler(0.2, 0, 0), marbleMat, physicsMaterials.ground, sceneGroup, physicsBodies);
    createPlatform(7, 1.2, 6, new THREE.Vector3(3, 11, 49), new THREE.Euler(0.2, 0, 0), marbleMat, physicsMaterials.ground, sceneGroup, physicsBodies);
    createPlatform(8, 1.2, 6, new THREE.Vector3(0, 13.5, 56), new THREE.Euler(), marbleMat, physicsMaterials.ground, sceneGroup, physicsBodies);
    checkpoints.push(new THREE.Vector3(0, 14.5, 56));

    // Summit Temple Platform (y: 16, z: 68)
    createPlatform(16, 2, 14, new THREE.Vector3(0, 15, 68), new THREE.Euler(), marbleMat, physicsMaterials.ground, sceneGroup, physicsBodies);
    goalPosition = new THREE.Vector3(0, 16.2, 68);
    redGoalPosition = new THREE.Vector3(-4, 16.2, 68);
    blueGoalPosition = new THREE.Vector3(4, 16.2, 68);

    // Decorative floating clouds around
    for (let c = 0; c < 12; c++) {
      const decCloud = new THREE.Mesh(new THREE.DodecahedronGeometry(2.5 + Math.random() * 2), cloudMat);
      decCloud.position.set((Math.random() - 0.5) * 50, Math.random() * 12 - 2, Math.random() * 70);
      sceneGroup.add(decCloud);
    }
  }

  // 2. GLACIER CANYON
  else if (mapId === 'glacier_canyon') {
    skyColor = 0xe0f2fe;
    fogColor = 0xbae6fd;

    const snowMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.6 });
    const iceMat = new THREE.MeshStandardMaterial({
      color: 0x7dd3fc,
      roughness: 0.1,
      metalness: 0.2,
      transparent: true,
      opacity: 0.88,
    });
    const bouncyIceMat = new THREE.MeshStandardMaterial({ color: 0xa5f3fc, roughness: 0.2, metalness: 0.3 });

    // Spawn Snow Plain
    createPlatform(14, 2, 12, new THREE.Vector3(0, 0, 0), new THREE.Euler(), snowMat, physicsMaterials.ground, sceneGroup, physicsBodies);
    playerSpawn = new THREE.Vector3(0, 2.5, -2);
    redSpawn = new THREE.Vector3(-4, 2.5, -2);
    blueSpawn = new THREE.Vector3(4, 2.5, -2);

    boxSpawns.push(new THREE.Vector3(-2, 2.5, 2));
    boxSpawns.push(new THREE.Vector3(0, 2.5, 2.5));
    boxSpawns.push(new THREE.Vector3(2, 2.5, 2));

    // Ultra-Slippery Frozen Ramp (y: 0 to 4, z: 8 to 22)
    createPlatform(10, 1.0, 15, new THREE.Vector3(0, 2, 15), new THREE.Euler(0.28, 0, 0), iceMat, physicsMaterials.ice, sceneGroup, physicsBodies);

    // Plateau 1
    createPlatform(12, 1.5, 8, new THREE.Vector3(0, 4.5, 26), new THREE.Euler(), snowMat, physicsMaterials.ground, sceneGroup, physicsBodies);
    checkpoints.push(new THREE.Vector3(0, 5.5, 26));

    // Freezing Water Hazard Channel (z: 32 to 44)
    // Water basin visual
    const waterGeom = new THREE.BoxGeometry(16, 0.4, 12);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.75,
      roughness: 0.05,
    });
    const waterMesh = new THREE.Mesh(waterGeom, waterMat);
    waterMesh.position.set(0, 3.8, 38);
    sceneGroup.add(waterMesh);

    waterZones.push({
      mesh: waterMesh,
      min: new THREE.Vector3(-8, 1, 32),
      max: new THREE.Vector3(8, 4.2, 44),
      buoyantForce: 28, // lifts objects with buoyancy power!
    });

    // High Elasticity Bouncing Ice Floe (z: 38)
    const bouncer = createPlatform(4, 0.8, 4, new THREE.Vector3(0, 4.2, 38), new THREE.Euler(), bouncyIceMat, physicsMaterials.bouncy, sceneGroup, physicsBodies);
    bouncer.mesh.name = 'bouncerIce';

    // Glacier Pass (z: 48 to 58)
    createPlatform(10, 1.2, 10, new THREE.Vector3(0, 6, 50), new THREE.Euler(), snowMat, physicsMaterials.ground, sceneGroup, physicsBodies);
    checkpoints.push(new THREE.Vector3(0, 7, 50));

    // Final Ascent to Ice Cavern Summit
    createPlatform(12, 2, 12, new THREE.Vector3(0, 8.5, 64), new THREE.Euler(), iceMat, physicsMaterials.ice, sceneGroup, physicsBodies);
    goalPosition = new THREE.Vector3(0, 9.8, 64);
    redGoalPosition = new THREE.Vector3(-4, 9.8, 64);
    blueGoalPosition = new THREE.Vector3(4, 9.8, 64);
  }

  // 3. DESERT RUINS
  else if (mapId === 'desert_ruins') {
    skyColor = 0xfef3c7;
    fogColor = 0xfde68a;

    const sandMat = new THREE.MeshStandardMaterial({ color: 0xfcd34d, roughness: 0.8 });
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.6 });

    // Oasis / Plaza
    createPlatform(14, 2, 12, new THREE.Vector3(0, 0, 0), new THREE.Euler(), sandMat, physicsMaterials.ground, sceneGroup, physicsBodies);
    playerSpawn = new THREE.Vector3(0, 2.5, -2);
    redSpawn = new THREE.Vector3(-4, 2.5, -2);
    blueSpawn = new THREE.Vector3(4, 2.5, -2);

    boxSpawns.push(new THREE.Vector3(-2, 2.5, 2));
    boxSpawns.push(new THREE.Vector3(0, 2.5, 3));
    boxSpawns.push(new THREE.Vector3(2, 2.5, 2));

    // Steep Sand Dunes with Pillars
    createPlatform(10, 1.2, 12, new THREE.Vector3(0, 2.5, 12), new THREE.Euler(0.35, 0, 0), sandMat, physicsMaterials.sticky, sceneGroup, physicsBodies);

    // Ancient Columns
    for (let p = -1; p <= 1; p += 2) {
      const colGeom = new THREE.CylinderGeometry(0.7, 0.8, 6, 12);
      const col = new THREE.Mesh(colGeom, stoneMat);
      col.position.set(p * 4.5, 4.5, 12);
      col.castShadow = true;
      sceneGroup.add(col);
    }

    // Mid Oasis Checkpoint
    createPlatform(12, 1.5, 8, new THREE.Vector3(0, 4.8, 24), new THREE.Euler(), stoneMat, physicsMaterials.ground, sceneGroup, physicsBodies);
    checkpoints.push(new THREE.Vector3(0, 5.8, 24));

    // Rolling Stone Trap Hazard
    const boulderGeom = new THREE.SphereGeometry(1.4, 16, 16);
    const boulderMesh = new THREE.Mesh(boulderGeom, stoneMat);
    boulderMesh.position.set(0, 6.5, 34);
    boulderMesh.castShadow = true;
    sceneGroup.add(boulderMesh);

    const boulderBody = new CANNON.Body({
      mass: 0,
      type: CANNON.Body.KINEMATIC,
      shape: new CANNON.Sphere(1.4),
    });
    boulderBody.position.set(0, 6.5, 34);
    physicsBodies.push(boulderBody);

    hazards.push({
      mesh: boulderMesh,
      body: boulderBody,
      update: (time) => {
        const x = Math.sin(time * 2.0) * 4.2;
        boulderMesh.position.x = x;
        boulderBody.position.x = x;
        boulderMesh.rotation.z = -x;
      },
    });

    // Quicksand Pit Zone (z: 32 to 44)
    const quicksandGeom = new THREE.BoxGeometry(14, 0.4, 12);
    const quicksandMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.95 });
    const quicksandMesh = new THREE.Mesh(quicksandGeom, quicksandMat);
    quicksandMesh.position.set(0, 4.8, 38);
    sceneGroup.add(quicksandMesh);

    waterZones.push({
      mesh: quicksandMesh,
      min: new THREE.Vector3(-7, 2, 32),
      max: new THREE.Vector3(7, 5.2, 44),
      buoyantForce: 24, // Requires buoyancy to traverse
    });

    // Pyramid Steps to Temple Summit (z: 48 to 65, y: 5 to 12)
    for (let s = 0; s < 5; s++) {
      createPlatform(12 - s * 1.5, 0.8, 3, new THREE.Vector3(0, 5.5 + s * 1.3, 48 + s * 3.2), new THREE.Euler(), stoneMat, physicsMaterials.ground, sceneGroup, physicsBodies);
    }
    checkpoints.push(new THREE.Vector3(0, 11, 56));

    // Temple Altar Summit
    createPlatform(14, 2, 12, new THREE.Vector3(0, 12, 68), new THREE.Euler(), stoneMat, physicsMaterials.ground, sceneGroup, physicsBodies);
    goalPosition = new THREE.Vector3(0, 13.2, 68);
    redGoalPosition = new THREE.Vector3(-4, 13.2, 68);
    blueGoalPosition = new THREE.Vector3(4, 13.2, 68);
  }

  // 4. URBAN CONSTRUCTION
  else {
    skyColor = 0xffedd5;
    fogColor = 0xfed7aa;

    const steelMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3, metalness: 0.7 });
    const girderMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.4, metalness: 0.5 });
    const bouncePadMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.2, metalness: 0.4 });

    // Ground Construction Depot
    createPlatform(14, 2, 12, new THREE.Vector3(0, 0, 0), new THREE.Euler(), steelMat, physicsMaterials.ground, sceneGroup, physicsBodies);
    playerSpawn = new THREE.Vector3(0, 2.5, -2);
    redSpawn = new THREE.Vector3(-4, 2.5, -2);
    blueSpawn = new THREE.Vector3(4, 2.5, -2);

    boxSpawns.push(new THREE.Vector3(-2, 2.5, 2));
    boxSpawns.push(new THREE.Vector3(0, 2.5, 3));
    boxSpawns.push(new THREE.Vector3(2, 2.5, 2));

    // Hydraulic Lift Platform (moves up/down from y: 0.5 to 7.0, z: 12)
    const liftGeom = new THREE.BoxGeometry(7, 0.8, 6);
    const liftMesh = new THREE.Mesh(liftGeom, girderMat);
    liftMesh.position.set(0, 1, 12);
    liftMesh.castShadow = true;
    liftMesh.receiveShadow = true;
    sceneGroup.add(liftMesh);

    const liftBody = new CANNON.Body({
      mass: 0,
      type: CANNON.Body.KINEMATIC,
      shape: new CANNON.Box(new CANNON.Vec3(3.5, 0.4, 3)),
    });
    liftBody.position.set(0, 1, 12);
    physicsBodies.push(liftBody);

    hazards.push({
      mesh: liftMesh,
      body: liftBody,
      update: (time) => {
        const y = 3.5 + Math.sin(time * 1.1) * 3.0;
        liftMesh.position.y = y;
        liftBody.position.y = y;
      },
    });

    // Elevated Scaffolding Bridge (y: 7, z: 24)
    createPlatform(10, 1.2, 10, new THREE.Vector3(0, 7, 24), new THREE.Euler(), steelMat, physicsMaterials.ground, sceneGroup, physicsBodies);
    checkpoints.push(new THREE.Vector3(0, 8.2, 24));

    // Super Elasticity Bounce Pad to cross large gap (z: 32)
    createPlatform(4, 0.6, 4, new THREE.Vector3(0, 7, 32), new THREE.Euler(), bouncePadMat, physicsMaterials.bouncy, sceneGroup, physicsBodies);

    // Swinging Crane Arm Hazard (z: 42)
    const craneArmGeom = new THREE.BoxGeometry(10, 0.8, 0.8);
    const craneMesh = new THREE.Mesh(craneArmGeom, girderMat);
    craneMesh.position.set(0, 8.5, 42);
    craneMesh.castShadow = true;
    sceneGroup.add(craneMesh);

    const craneBody = new CANNON.Body({
      mass: 0,
      type: CANNON.Body.KINEMATIC,
      shape: new CANNON.Box(new CANNON.Vec3(5, 0.4, 0.4)),
    });
    craneBody.position.set(0, 8.5, 42);
    physicsBodies.push(craneBody);

    hazards.push({
      mesh: craneMesh,
      body: craneBody,
      update: (time) => {
        const angle = Math.sin(time * 1.4) * 0.9;
        craneMesh.rotation.y = angle;
        craneBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), angle);
      },
    });

    // High Steel I-Beams (z: 48 to 58, narrow walking paths)
    createPlatform(3, 0.8, 12, new THREE.Vector3(0, 9.5, 52), new THREE.Euler(), steelMat, physicsMaterials.ground, sceneGroup, physicsBodies);
    checkpoints.push(new THREE.Vector3(0, 10.5, 52));

    // Rooftop Helipad Summit (y: 12, z: 66)
    createPlatform(15, 2, 15, new THREE.Vector3(0, 11, 66), new THREE.Euler(), steelMat, physicsMaterials.ground, sceneGroup, physicsBodies);
    goalPosition = new THREE.Vector3(0, 12.2, 66);
    redGoalPosition = new THREE.Vector3(-4, 12.2, 66);
    blueGoalPosition = new THREE.Vector3(4, 12.2, 66);
  }

  // Add Visual Checkpoint Beacons
  checkpoints.forEach((cp) => {
    const cpMesh = createCheckpointMesh(cp);
    sceneGroup.add(cpMesh);
  });

  // Add Visual Goal Zones
  const mainGoal = createGoalZoneMesh(goalPosition, 0x10b981);
  sceneGroup.add(mainGoal);

  const redGoal = createGoalZoneMesh(redGoalPosition, 0xef4444);
  sceneGroup.add(redGoal);

  const blueGoal = createGoalZoneMesh(blueGoalPosition, 0x3b82f6);
  sceneGroup.add(blueGoal);

  const dispose = () => {
    // cleanup
  };

  return {
    sceneGroup,
    physicsBodies,
    hazards,
    waterZones,
    checkpoints,
    boxSpawns,
    goalPosition,
    redGoalPosition,
    blueGoalPosition,
    playerSpawn,
    redSpawn,
    blueSpawn,
    skyColor,
    fogColor,
    dispose,
  };
}
