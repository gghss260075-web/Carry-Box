/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { ForcePower } from '../types/game';

export interface CharacterRig {
  root: THREE.Group;
  torso: THREE.Group;
  head: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  hatGroup: THREE.Group;
  shirtGroup: THREE.Group;
  pantsGroup: THREE.Group;
  auraMesh: THREE.Mesh;
  shadowMesh: THREE.Mesh;
  leftEyePupil: THREE.Mesh;
  rightEyePupil: THREE.Mesh;
  setPower: (power: ForcePower | null) => void;
  updateAnimation: (dt: number, speed: number, isGrounded: boolean, isGrabbing: boolean) => void;
  setColor: (colorHex: string) => void;
  setHat: (hatId: string) => void;
  setShirt: (shirtId: string) => void;
  setPants: (pantsId: string) => void;
}

// Procedural soft contact shadow texture
function createRadialShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
  grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.35)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

const shadowTexture = createRadialShadowTexture();

export function createCharacter(options: {
  color: string;
  hat?: string;
  shirt?: string;
  pants?: string;
  isBot?: boolean;
}): CharacterRig {
  const root = new THREE.Group();

  // Core Body Skin Material
  const skinMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(options.color || '#fed7aa'),
    roughness: 0.6,
    metalness: 0.05,
  });

  const eyeWhiteMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.15,
    metalness: 0.05,
  });

  const eyePupilMaterial = new THREE.MeshStandardMaterial({
    color: 0x1e1b4b,
    roughness: 0.1,
    metalness: 0.2,
  });

  const shoeMaterial = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.75,
    metalness: 0.1,
  });

  // 1. Torso Group
  const torso = new THREE.Group();
  torso.position.y = 0.85;
  root.add(torso);

  // Base inner torso mesh
  const innerTorsoGeom = new THREE.CylinderGeometry(0.3, 0.34, 0.6, 16);
  const innerTorso = new THREE.Mesh(innerTorsoGeom, skinMaterial);
  innerTorso.castShadow = true;
  innerTorso.receiveShadow = true;
  torso.add(innerTorso);

  // Shirt Cosmetic Group
  const shirtGroup = new THREE.Group();
  torso.add(shirtGroup);

  // Pants Cosmetic Group
  const pantsGroup = new THREE.Group();
  pantsGroup.position.y = -0.3;
  torso.add(pantsGroup);

  // 2. Head Group
  const head = new THREE.Group();
  head.position.y = 0.52;
  torso.add(head);

  const headGeom = new THREE.SphereGeometry(0.3, 16, 16);
  const headMesh = new THREE.Mesh(headGeom, skinMaterial);
  headMesh.castShadow = true;
  head.add(headMesh);

  // Googly Eyes
  const eyeGeom = new THREE.SphereGeometry(0.08, 12, 12);
  const pupilGeom = new THREE.SphereGeometry(0.04, 10, 10);

  // Left Eye
  const leftEye = new THREE.Mesh(eyeGeom, eyeWhiteMaterial);
  leftEye.position.set(-0.1, 0.05, 0.24);
  const leftEyePupil = new THREE.Mesh(pupilGeom, eyePupilMaterial);
  leftEyePupil.position.set(0, 0, 0.06);
  leftEye.add(leftEyePupil);
  head.add(leftEye);

  // Right Eye
  const rightEye = new THREE.Mesh(eyeGeom, eyeWhiteMaterial);
  rightEye.position.set(0.1, 0.05, 0.24);
  const rightEyePupil = new THREE.Mesh(pupilGeom, eyePupilMaterial);
  rightEyePupil.position.set(0, 0, 0.06);
  rightEye.add(rightEyePupil);
  head.add(rightEye);

  // Cute Blushing Cheeks
  const blushMat = new THREE.MeshBasicMaterial({ color: 0xf472b6, transparent: true, opacity: 0.55 });
  const blushGeom = new THREE.PlaneGeometry(0.06, 0.035);
  const leftBlush = new THREE.Mesh(blushGeom, blushMat);
  leftBlush.position.set(-0.15, -0.05, 0.26);
  head.add(leftBlush);
  const rightBlush = new THREE.Mesh(blushGeom, blushMat);
  rightBlush.position.set(0.15, -0.05, 0.26);
  head.add(rightBlush);

  // Hat Group
  const hatGroup = new THREE.Group();
  hatGroup.position.set(0, 0.25, 0);
  head.add(hatGroup);

  // 3. Arms (Floppy wobbly joints)
  const armGeom = new THREE.CylinderGeometry(0.08, 0.09, 0.45, 12);
  const handGeom = new THREE.SphereGeometry(0.095, 10, 10);

  // Left arm
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.38, 0.2, 0);
  const leftArmMesh = new THREE.Mesh(armGeom, skinMaterial);
  leftArmMesh.position.y = -0.22;
  leftArmMesh.castShadow = true;
  leftArm.add(leftArmMesh);
  const leftHand = new THREE.Mesh(handGeom, skinMaterial);
  leftHand.position.y = -0.44;
  leftArm.add(leftHand);
  torso.add(leftArm);

  // Right arm
  const rightArm = new THREE.Group();
  rightArm.position.set(0.38, 0.2, 0);
  const rightArmMesh = new THREE.Mesh(armGeom, skinMaterial);
  rightArmMesh.position.y = -0.22;
  rightArmMesh.castShadow = true;
  rightArm.add(rightArmMesh);
  const rightHand = new THREE.Mesh(handGeom, skinMaterial);
  rightHand.position.y = -0.44;
  rightArm.add(rightHand);
  torso.add(rightArm);

  // 4. Legs
  const legGeom = new THREE.CylinderGeometry(0.09, 0.1, 0.4, 12);
  const shoeGeom = new THREE.BoxGeometry(0.16, 0.12, 0.24);

  // Left leg
  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.16, -0.32, 0);
  const leftLegMesh = new THREE.Mesh(legGeom, skinMaterial);
  leftLegMesh.position.y = -0.2;
  leftLegMesh.castShadow = true;
  leftLeg.add(leftLegMesh);
  const leftShoe = new THREE.Mesh(shoeGeom, shoeMaterial);
  leftShoe.position.set(0, -0.4, 0.04);
  leftLeg.add(leftShoe);
  torso.add(leftLeg);

  // Right leg
  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.16, -0.32, 0);
  const rightLegMesh = new THREE.Mesh(legGeom, skinMaterial);
  rightLegMesh.position.y = -0.2;
  rightLegMesh.castShadow = true;
  rightLeg.add(rightLegMesh);
  const rightShoe = new THREE.Mesh(shoeGeom, shoeMaterial);
  rightShoe.position.set(0, -0.4, 0.04);
  rightLeg.add(rightShoe);
  torso.add(rightLeg);

  // 5. Scientific Force Aura Ring
  const auraGeom = new THREE.TorusGeometry(0.55, 0.04, 12, 32);
  auraGeom.rotateX(Math.PI / 2);
  const auraMat = new THREE.MeshBasicMaterial({
    color: 0x818cf8,
    transparent: true,
    opacity: 0,
  });
  const auraMesh = new THREE.Mesh(auraGeom, auraMat);
  auraMesh.position.y = 0.08;
  root.add(auraMesh);

  // 6. Ground Shadow Plane
  const shadowGeom = new THREE.PlaneGeometry(1.2, 1.2);
  shadowGeom.rotateX(-Math.PI / 2);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTexture,
    transparent: true,
    depthWrite: false,
    opacity: 0.55,
  });
  const shadowMesh = new THREE.Mesh(shadowGeom, shadowMat);
  shadowMesh.position.y = 0.02;
  root.add(shadowMesh);

  // --- Cosmetic Builders ---
  const buildHat = (hatId: string) => {
    while (hatGroup.children.length > 0) {
      hatGroup.remove(hatGroup.children[0]);
    }

    if (hatId === 'hardhat') {
      const mat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3, metalness: 0.1 });
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.33, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat);
      const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.37, 0.37, 0.03, 16), mat);
      hatGroup.add(cap);
      hatGroup.add(brim);
    } else if (hatId === 'beanie') {
      const mat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.85 });
      const dome = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 12, 0, Math.PI * 2, 0, Math.PI / 1.7), mat);
      const pomMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });
      const pom = new THREE.Mesh(new THREE.SphereGeometry(0.085, 10, 10), pomMat);
      pom.position.y = 0.33;
      hatGroup.add(dome);
      hatGroup.add(pom);
    } else if (hatId === 'catears') {
      const bandMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
      const earMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.7 });
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.025, 8, 24, Math.PI), bandMat);
      band.rotation.x = Math.PI / 2;
      hatGroup.add(band);

      for (let s = -1; s <= 1; s += 2) {
        const ear = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.18, 4), earMat);
        ear.position.set(s * 0.18, 0.12, 0);
        ear.rotation.z = -s * 0.25;
        hatGroup.add(ear);
      }
    } else if (hatId === 'pirate') {
      const mat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 });
      const goldTrim = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3, metalness: 0.7 });
      const hatMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.32, 0.22, 3), mat);
      hatMesh.rotation.y = Math.PI / 6;
      hatGroup.add(hatMesh);
      const trim = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.02, 6, 24), goldTrim);
      trim.rotation.x = Math.PI / 2;
      hatGroup.add(trim);
    } else if (hatId === 'crown') {
      const crownMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.2, metalness: 0.9 });
      const crownBase = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.26, 0.1, 16), crownMat);
      hatGroup.add(crownBase);
      for (let i = 0; i < 5; i++) {
        const spike = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.15, 6), crownMat);
        const angle = (i / 5) * Math.PI * 2;
        spike.position.set(Math.cos(angle) * 0.25, 0.13, Math.sin(angle) * 0.25);
        hatGroup.add(spike);
      }
    } else if (hatId === 'propeller') {
      const capMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.4 });
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.31, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), capMat);
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.1), new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 }));
      stem.position.y = 0.34;
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.015, 0.06), new THREE.MeshStandardMaterial({ color: 0xef4444 }));
      blade.position.y = 0.38;
      blade.name = 'propBlade';
      hatGroup.add(cap);
      hatGroup.add(stem);
      hatGroup.add(blade);
    } else if (hatId === 'halo') {
      const haloMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
      const halo = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.03, 8, 24), haloMat);
      halo.rotation.x = Math.PI / 2;
      halo.position.y = 0.2;
      hatGroup.add(halo);
    }
  };

  const buildShirt = (shirtId: string) => {
    while (shirtGroup.children.length > 0) {
      shirtGroup.remove(shirtGroup.children[0]);
    }

    if (shirtId === 'work_vest') {
      const vestMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.5 });
      const stripeMat = new THREE.MeshBasicMaterial({ color: 0x84cc16 });
      const vest = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.36, 0.58, 16), vestMat);
      vest.castShadow = true;
      shirtGroup.add(vest);
      // Neon stripes
      const stripe1 = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.02, 8, 24), stripeMat);
      stripe1.rotation.x = Math.PI / 2;
      stripe1.position.y = 0.08;
      shirtGroup.add(stripe1);
      const stripe2 = new THREE.Mesh(new THREE.TorusGeometry(0.345, 0.02, 8, 24), stripeMat);
      stripe2.rotation.x = Math.PI / 2;
      stripe2.position.y = -0.12;
      shirtGroup.add(stripe2);
    } else if (shirtId === 'striped_tee') {
      const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6 });
      const blueStripeMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.6 });
      const shirt = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.35, 0.55, 16), whiteMat);
      shirt.castShadow = true;
      shirtGroup.add(shirt);
      for (let s = -2; s <= 2; s++) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.015, 8, 24), blueStripeMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = s * 0.1;
        shirtGroup.add(ring);
      }
    } else if (shirtId === 'hero_suit') {
      const suitMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.3, metalness: 0.2 });
      const emblemMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.2, metalness: 0.7 });
      const suit = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.35, 0.58, 16), suitMat);
      suit.castShadow = true;
      shirtGroup.add(suit);
      // Hero Emblem Diamond
      const emblem = new THREE.Mesh(new THREE.OctahedronGeometry(0.12, 0), emblemMat);
      emblem.position.set(0, 0.1, 0.34);
      emblem.scale.set(1, 1, 0.2);
      shirtGroup.add(emblem);
    } else if (shirtId === 'winter_sweater') {
      const knitMat = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.9 });
      const collarMat = new THREE.MeshStandardMaterial({ color: 0xecfdf5, roughness: 0.8 });
      const sweater = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.37, 0.58, 16), knitMat);
      sweater.castShadow = true;
      shirtGroup.add(sweater);
      const collar = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.05, 8, 20), collarMat);
      collar.rotation.x = Math.PI / 2;
      collar.position.y = 0.28;
      shirtGroup.add(collar);
    } else {
      // Basic Hoodie
      const hoodieMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.7 });
      const hoodie = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.36, 0.56, 16), hoodieMat);
      hoodie.castShadow = true;
      shirtGroup.add(hoodie);
      // Front pocket
      const pocketMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.7 });
      const pocket = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.16, 0.08), pocketMat);
      pocket.position.set(0, -0.1, 0.32);
      shirtGroup.add(pocket);
    }
  };

  const buildPants = (pantsId: string) => {
    while (pantsGroup.children.length > 0) {
      pantsGroup.remove(pantsGroup.children[0]);
    }

    if (pantsId === 'cargo_pants') {
      const cargoMat = new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.8 });
      const beltMat = new THREE.MeshStandardMaterial({ color: 0x292524, roughness: 0.4 });
      const waist = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.33, 0.22, 16), cargoMat);
      pantsGroup.add(waist);
      const belt = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.02, 6, 24), beltMat);
      belt.rotation.x = Math.PI / 2;
      belt.position.y = 0.08;
      pantsGroup.add(belt);
      // Side pocket pouches
      for (let s = -1; s <= 1; s += 2) {
        const pouch = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.14, 0.16), cargoMat);
        pouch.position.set(s * 0.36, -0.06, 0);
        pantsGroup.add(pouch);
      }
    } else if (pantsId === 'sport_shorts') {
      const shortsMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.7 });
      const waist = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.32, 0.16, 16), shortsMat);
      pantsGroup.add(waist);
    } else if (pantsId === 'track_joggers') {
      const joggerMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
      const stripeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const waist = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.33, 0.22, 16), joggerMat);
      pantsGroup.add(waist);
      for (let s = -1; s <= 1; s += 2) {
        const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.2, 0.02), stripeMat);
        stripe.position.set(s * 0.34, 0, 0);
        pantsGroup.add(stripe);
      }
    } else if (pantsId === 'overalls') {
      const denimMat = new THREE.MeshStandardMaterial({ color: 0x1e40af, roughness: 0.65 });
      const strapMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.65 });
      const waist = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.34, 0.24, 16), denimMat);
      pantsGroup.add(waist);
      // Bib
      const bib = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.2, 0.04), denimMat);
      bib.position.set(0, 0.18, 0.33);
      pantsGroup.add(bib);
      // Straps
      for (let s = -1; s <= 1; s += 2) {
        const strap = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.4, 0.02), strapMat);
        strap.position.set(s * 0.12, 0.25, 0.2);
        strap.rotation.x = 0.2;
        pantsGroup.add(strap);
      }
    } else {
      // Default Denim Jeans
      const jeansMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.7 });
      const waist = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.33, 0.22, 16), jeansMat);
      pantsGroup.add(waist);
    }
  };

  buildHat(options.hat || 'hardhat');
  buildShirt(options.shirt || 'basic_hoodie');
  buildPants(options.pants || 'denim_jeans');

  let walkCycle = 0;
  let wobbleTime = 0;

  const updateAnimation = (dt: number, speed: number, isGrounded: boolean, isGrabbing: boolean) => {
    wobbleTime += dt;
    const isMoving = speed > 0.2;

    if (isMoving && isGrounded) {
      walkCycle += dt * (speed * 4.5);
    } else {
      walkCycle = THREE.MathUtils.damp(walkCycle, 0, 8, dt);
    }

    const propBlade = hatGroup.getObjectByName('propBlade');
    if (propBlade) {
      propBlade.rotation.y += dt * 15;
    }

    const pupilJiggleX = Math.sin(wobbleTime * 8) * 0.012;
    const pupilJiggleY = Math.cos(wobbleTime * 7) * 0.012;
    leftEyePupil.position.x = pupilJiggleX;
    leftEyePupil.position.y = pupilJiggleY;
    rightEyePupil.position.x = pupilJiggleX;
    rightEyePupil.position.y = pupilJiggleY;

    if (isGrounded) {
      if (isMoving) {
        const legAngle = Math.sin(walkCycle) * 0.55;
        leftLeg.rotation.x = legAngle;
        rightLeg.rotation.x = -legAngle;

        torso.rotation.z = Math.sin(walkCycle * 0.5) * 0.08;
        torso.rotation.x = 0.12;
        head.rotation.x = -0.1;
        head.rotation.z = -Math.sin(walkCycle * 0.5) * 0.05;

        if (isGrabbing) {
          leftArm.rotation.x = THREE.MathUtils.damp(leftArm.rotation.x, -1.35, 10, dt);
          rightArm.rotation.x = THREE.MathUtils.damp(rightArm.rotation.x, -1.35, 10, dt);
          leftArm.rotation.z = THREE.MathUtils.damp(leftArm.rotation.z, 0.25, 10, dt);
          rightArm.rotation.z = THREE.MathUtils.damp(rightArm.rotation.z, -0.25, 10, dt);
        } else {
          leftArm.rotation.x = -legAngle * 0.7;
          rightArm.rotation.x = legAngle * 0.7;
          leftArm.rotation.z = 0.2 + Math.abs(Math.sin(walkCycle)) * 0.1;
          rightArm.rotation.z = -0.2 - Math.abs(Math.sin(walkCycle)) * 0.1;
        }
      } else {
        const breath = Math.sin(wobbleTime * 2.5) * 0.02;
        torso.position.y = 0.85 + breath;
        torso.rotation.x = THREE.MathUtils.damp(torso.rotation.x, 0, 6, dt);
        torso.rotation.z = Math.sin(wobbleTime * 1.5) * 0.02;
        leftLeg.rotation.x = THREE.MathUtils.damp(leftLeg.rotation.x, 0, 6, dt);
        rightLeg.rotation.x = THREE.MathUtils.damp(rightLeg.rotation.x, 0, 6, dt);

        if (isGrabbing) {
          leftArm.rotation.x = THREE.MathUtils.damp(leftArm.rotation.x, -1.35, 10, dt);
          rightArm.rotation.x = THREE.MathUtils.damp(rightArm.rotation.x, -1.35, 10, dt);
          leftArm.rotation.z = 0.2;
          rightArm.rotation.z = -0.2;
        } else {
          leftArm.rotation.x = THREE.MathUtils.damp(leftArm.rotation.x, 0, 6, dt);
          rightArm.rotation.x = THREE.MathUtils.damp(rightArm.rotation.x, 0, 6, dt);
          leftArm.rotation.z = THREE.MathUtils.damp(leftArm.rotation.z, 0.15, 6, dt);
          rightArm.rotation.z = THREE.MathUtils.damp(rightArm.rotation.z, -0.15, 6, dt);
        }
      }
    } else {
      leftLeg.rotation.x = 0.4;
      rightLeg.rotation.x = -0.3;
      if (isGrabbing) {
        leftArm.rotation.x = -1.4;
        rightArm.rotation.x = -1.4;
      } else {
        leftArm.rotation.x = -1.8 + Math.sin(wobbleTime * 12) * 0.3;
        rightArm.rotation.x = -1.8 - Math.sin(wobbleTime * 12) * 0.3;
        leftArm.rotation.z = 0.6;
        rightArm.rotation.z = -0.6;
      }
      torso.rotation.x = 0.2;
    }

    if ((auraMat as THREE.MeshBasicMaterial).opacity > 0) {
      auraMesh.rotation.y += dt * 3;
    }
  };

  const setPower = (power: ForcePower | null) => {
    if (!power) {
      auraMat.opacity = 0;
      return;
    }
    const colors: Record<ForcePower, number> = {
      gravity: 0x818cf8,
      friction: 0x38bdf8,
      elasticity: 0xf472b6,
      buoyancy: 0x34d399,
    };
    auraMat.color.setHex(colors[power]);
    auraMat.opacity = 0.85;
  };

  const setColor = (colorHex: string) => {
    skinMaterial.color.set(new THREE.Color(colorHex));
  };

  const setHat = (hatId: string) => {
    buildHat(hatId);
  };

  const setShirt = (shirtId: string) => {
    buildShirt(shirtId);
  };

  const setPants = (pantsId: string) => {
    buildPants(pantsId);
  };

  return {
    root,
    torso,
    head,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    hatGroup,
    shirtGroup,
    pantsGroup,
    auraMesh,
    shadowMesh,
    leftEyePupil,
    rightEyePupil,
    setPower,
    updateAnimation,
    setColor,
    setHat,
    setShirt,
    setPants,
  };
}
