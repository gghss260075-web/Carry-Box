/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { ForcePower, TeamColor } from '../types/game';

export interface PhysicsBox {
  id: string;
  mesh: THREE.Group;
  body: CANNON.Body;
  carrierId: string | null;
  team: TeamColor;
  delivered: boolean;
  powerApplied: ForcePower | null;
}

export interface PhysicsSystem {
  world: CANNON.World;
  materials: {
    ground: CANNON.Material;
    ice: CANNON.Material;
    bouncy: CANNON.Material;
    sticky: CANNON.Material;
    character: CANNON.Material;
    box: CANNON.Material;
  };
  boxes: PhysicsBox[];
  createBox: (pos: THREE.Vector3, id: string, team?: TeamColor) => PhysicsBox;
  createCharacterBody: (pos: THREE.Vector3) => CANNON.Body;
  step: (dt: number) => void;
  applyForcePowerToBox: (box: PhysicsBox, power: ForcePower | null) => void;
  dispose: () => void;
}

export function initPhysicsSystem(scene: THREE.Scene): PhysicsSystem {
  const world = new CANNON.World();
  world.gravity.set(0, -18, 0); // Crisp, responsive gravity
  world.broadphase = new CANNON.NaiveBroadphase();
  if ('iterations' in world.solver) {
    (world.solver as CANNON.GSSolver).iterations = 10;
  }

  // Materials
  const groundMat = new CANNON.Material('ground');
  const iceMat = new CANNON.Material('ice');
  const bouncyMat = new CANNON.Material('bouncy');
  const stickyMat = new CANNON.Material('sticky');
  const characterMat = new CANNON.Material('character');
  const boxMat = new CANNON.Material('box');

  // Contact Materials
  // Ground - Character
  world.addContactMaterial(
    new CANNON.ContactMaterial(groundMat, characterMat, {
      friction: 0.4,
      restitution: 0.05,
    })
  );

  // Ground - Box
  world.addContactMaterial(
    new CANNON.ContactMaterial(groundMat, boxMat, {
      friction: 0.5,
      restitution: 0.15,
    })
  );

  // Ice - Character (Super Slippery)
  world.addContactMaterial(
    new CANNON.ContactMaterial(iceMat, characterMat, {
      friction: 0.02,
      restitution: 0.1,
    })
  );

  // Ice - Box
  world.addContactMaterial(
    new CANNON.ContactMaterial(iceMat, boxMat, {
      friction: 0.015,
      restitution: 0.1,
    })
  );

  // Bouncy - Character (Super High Bounce)
  world.addContactMaterial(
    new CANNON.ContactMaterial(bouncyMat, characterMat, {
      friction: 0.3,
      restitution: 0.95,
    })
  );

  // Bouncy - Box
  world.addContactMaterial(
    new CANNON.ContactMaterial(bouncyMat, boxMat, {
      friction: 0.2,
      restitution: 0.95,
    })
  );

  // Sticky - Character
  world.addContactMaterial(
    new CANNON.ContactMaterial(stickyMat, characterMat, {
      friction: 1.8,
      restitution: 0.0,
    })
  );

  const boxes: PhysicsBox[] = [];

  // Helper to create a composite 3D Energy Box model
  const createBoxModel = (team: TeamColor): THREE.Group => {
    const group = new THREE.Group();

    // Primary box body
    const baseColor = team === 'red' ? 0xf87171 : team === 'blue' ? 0x60a5fa : 0xfbbf24;
    const bodyMat = new THREE.MeshStandardMaterial({
      color: baseColor,
      roughness: 0.4,
      metalness: 0.3,
    });
    const boxMesh = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.85, 0.85), bodyMat);
    boxMesh.castShadow = true;
    boxMesh.receiveShadow = true;
    group.add(boxMesh);

    // Corner metal brackets & rivets
    const metalMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.3,
      metalness: 0.8,
    });
    const frameMesh = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.9), metalMat);
    frameMesh.scale.set(0.98, 0.98, 0.98);
    // group.add(frameMesh);

    // Glowing Scientific Core in center of faces
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      roughness: 0.1,
      metalness: 0.9,
    });
    const coreMesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.25, 0), coreMat);
    coreMesh.name = 'boxCore';
    group.add(coreMesh);

    // Grab Handles on sides
    const handleMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.9 });
    for (let s = -1; s <= 1; s += 2) {
      const handle = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.025, 6, 16), handleMat);
      handle.position.set(s * 0.45, 0, 0);
      handle.rotation.y = Math.PI / 2;
      group.add(handle);
    }

    // Force Aura Ribbon around box
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      wireframe: true,
    });
    const auraMesh = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.95, 0.95), auraMat);
    auraMesh.name = 'boxAura';
    group.add(auraMesh);

    return group;
  };

  const createBox = (pos: THREE.Vector3, id: string, team: TeamColor = 'neutral'): PhysicsBox => {
    const mesh = createBoxModel(team);
    mesh.position.copy(pos);
    scene.add(mesh);

    const shape = new CANNON.Box(new CANNON.Vec3(0.42, 0.42, 0.42));
    const body = new CANNON.Body({
      mass: 12, // 12kg: liftable, physically responsive
      shape,
      material: boxMat,
      linearDamping: 0.3,
      angularDamping: 0.4,
    });
    body.position.set(pos.x, pos.y, pos.z);
    world.addBody(body);

    const boxItem: PhysicsBox = {
      id,
      mesh,
      body,
      carrierId: null,
      team,
      delivered: false,
      powerApplied: null,
    };
    boxes.push(boxItem);
    return boxItem;
  };

  const createCharacterBody = (pos: THREE.Vector3): CANNON.Body => {
    // Sphere / Cylinder composite proxy
    const radius = 0.38;
    const height = 1.1;
    const shape = new CANNON.Cylinder(radius, radius, height, 12);
    const body = new CANNON.Body({
      mass: 55, // 55kg Human: Fall Flat character
      shape,
      material: characterMat,
      linearDamping: 0.4,
      angularDamping: 0.9,
      fixedRotation: true, // Prevents tipping over while maintaining wobbly procedural mesh
    });
    body.position.set(pos.x, pos.y + height / 2, pos.z);
    world.addBody(body);
    return body;
  };

  const applyForcePowerToBox = (box: PhysicsBox, power: ForcePower | null) => {
    box.powerApplied = power;
    const aura = box.mesh.getObjectByName('boxAura') as THREE.Mesh;
    const core = box.mesh.getObjectByName('boxCore') as THREE.Mesh;

    if (!power) {
      if (aura) (aura.material as THREE.MeshBasicMaterial).opacity = 0;
      box.body.mass = 12;
      box.body.updateMassProperties();
      return;
    }

    if (aura) {
      const auraMat = aura.material as THREE.MeshBasicMaterial;
      auraMat.opacity = 0.7;

      if (power === 'gravity') {
        auraMat.color.setHex(0x818cf8);
        box.body.mass = 2.0; // Ultra-light feather weight!
        box.body.updateMassProperties();
      } else if (power === 'friction') {
        auraMat.color.setHex(0x38bdf8);
        box.body.mass = 12;
        box.body.updateMassProperties();
      } else if (power === 'elasticity') {
        auraMat.color.setHex(0xf472b6);
        box.body.mass = 10;
        box.body.updateMassProperties();
      } else if (power === 'buoyancy') {
        auraMat.color.setHex(0x34d399);
        box.body.mass = 4;
        box.body.updateMassProperties();
      }
    }

    if (core) {
      const colors: Record<ForcePower, number> = {
        gravity: 0x818cf8,
        friction: 0x38bdf8,
        elasticity: 0xf472b6,
        buoyancy: 0x34d399,
      };
      (core.material as THREE.MeshStandardMaterial).color.setHex(colors[power]);
    }
  };

  const step = (dt: number) => {
    // Clamp delta time to avoid simulation explosion
    const safeDt = Math.min(dt, 0.05);
    world.step(1 / 60, safeDt, 3);

    // Sync box meshes with Cannon bodies
    boxes.forEach((b) => {
      if (!b.carrierId) {
        b.mesh.position.set(b.body.position.x, b.body.position.y, b.body.position.z);
        b.mesh.quaternion.set(
          b.body.quaternion.x,
          b.body.quaternion.y,
          b.body.quaternion.z,
          b.body.quaternion.w
        );
      }

      // Rotate inner glowing energy core
      const core = b.mesh.getObjectByName('boxCore');
      if (core) {
        core.rotation.y += dt * 2.0;
        core.rotation.x += dt * 1.5;
      }
    });
  };

  const dispose = () => {
    boxes.forEach((b) => {
      scene.remove(b.mesh);
      world.removeBody(b.body);
    });
    boxes.length = 0;
  };

  return {
    world,
    materials: {
      ground: groundMat,
      ice: iceMat,
      bouncy: bouncyMat,
      sticky: stickyMat,
      character: characterMat,
      box: boxMat,
    },
    boxes,
    createBox,
    createCharacterBody,
    step,
    applyForcePowerToBox,
    dispose,
  };
}
