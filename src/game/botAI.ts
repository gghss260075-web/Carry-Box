/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { CharacterRig } from './character';
import { PhysicsBox } from './physics';
import { ForcePower, TeamColor } from '../types/game';

export interface BotAgent {
  id: string;
  name: string;
  team: TeamColor;
  rig: CharacterRig;
  body: CANNON.Body;
  carriedBox: PhysicsBox | null;
  targetBox: PhysicsBox | null;
  currentPower: ForcePower;
  respawnPoint: THREE.Vector3;
  thinkTimer: number;
  jumpCooldown: number;
  stumbleTimer: number;
}

export function createBotAgent(
  id: string,
  name: string,
  team: TeamColor,
  rig: CharacterRig,
  body: CANNON.Body,
  spawnPoint: THREE.Vector3
): BotAgent {
  return {
    id,
    name,
    team,
    rig,
    body,
    carriedBox: null,
    targetBox: null,
    currentPower: 'gravity',
    respawnPoint: spawnPoint.clone(),
    thinkTimer: Math.random() * 0.5,
    jumpCooldown: 0,
    stumbleTimer: 0,
  };
}

export function updateBotAI(
  bot: BotAgent,
  dt: number,
  allBoxes: PhysicsBox[],
  goalPosition: THREE.Vector3,
  time: number
) {
  bot.thinkTimer -= dt;
  bot.jumpCooldown -= dt;
  bot.stumbleTimer -= dt;

  const botPos = new THREE.Vector3(bot.body.position.x, bot.body.position.y, bot.body.position.z);

  // Fall off map check
  if (botPos.y < -8) {
    bot.body.position.set(bot.respawnPoint.x, bot.respawnPoint.y + 1, bot.respawnPoint.z);
    bot.body.velocity.set(0, 0, 0);
    if (bot.carriedBox) {
      bot.carriedBox.carrierId = null;
      bot.carriedBox = null;
    }
    return;
  }

  // Periodic decision making
  if (bot.thinkTimer <= 0) {
    bot.thinkTimer = 0.4 + Math.random() * 0.3;

    // If not carrying a box, find closest undelivered box
    if (!bot.carriedBox) {
      let closest: PhysicsBox | null = null;
      let closestDist = Infinity;

      for (const box of allBoxes) {
        if (box.delivered) continue;
        // If box is carried by ally, let them carry
        if (box.carrierId && box.carrierId !== bot.id) continue;

        const boxPos = new THREE.Vector3(box.body.position.x, box.body.position.y, box.body.position.z);
        const dist = botPos.distanceTo(boxPos);
        if (dist < closestDist) {
          closestDist = dist;
          closest = box;
        }
      }
      bot.targetBox = closest;
    }

    // Adaptive scientific force selection
    if (botPos.y > 6 && Math.random() < 0.25) {
      bot.currentPower = 'elasticity';
    } else if (botPos.z > 30 && botPos.z < 45) {
      bot.currentPower = 'buoyancy';
    } else if (bot.carriedBox) {
      bot.currentPower = 'gravity';
    } else {
      bot.currentPower = 'friction';
    }
    bot.rig.setPower(bot.currentPower);
  }

  // Navigation target
  let targetPoint: THREE.Vector3 | null = null;

  if (bot.carriedBox) {
    // Navigate towards goal
    targetPoint = goalPosition;

    // Check if goal reached
    if (botPos.distanceTo(goalPosition) < 2.5) {
      // Release box at goal!
      bot.carriedBox.carrierId = null;
      bot.carriedBox = null;
    }
  } else if (bot.targetBox && !bot.targetBox.delivered) {
    targetPoint = new THREE.Vector3(
      bot.targetBox.body.position.x,
      bot.targetBox.body.position.y,
      bot.targetBox.body.position.z
    );

    // If close enough to target box, grab it!
    if (botPos.distanceTo(targetPoint) < 1.6 && !bot.targetBox.carrierId) {
      bot.carriedBox = bot.targetBox;
      bot.targetBox.carrierId = bot.id;
    }
  }

  // Movement physics
  if (targetPoint) {
    const dir = new THREE.Vector3().subVectors(targetPoint, botPos);
    dir.y = 0; // horizontal only
    const len = dir.length();

    if (len > 0.4) {
      dir.normalize();

      // Bot speed with goofy wobble
      const speed = bot.carriedBox ? 4.2 : 5.8;
      const wobble = Math.sin(time * 6 + bot.id.length) * 0.15;
      const moveX = dir.x * speed + wobble;
      const moveZ = dir.z * speed;

      bot.body.velocity.x = THREE.MathUtils.damp(bot.body.velocity.x, moveX, 8, dt);
      bot.body.velocity.z = THREE.MathUtils.damp(bot.body.velocity.z, moveZ, 8, dt);

      // Face movement direction
      const angle = Math.atan2(dir.x, dir.z);
      bot.rig.root.rotation.y = THREE.MathUtils.damp(bot.rig.root.rotation.y, angle, 10, dt);

      // Jump over obstacles / steps
      if (bot.jumpCooldown <= 0 && Math.abs(bot.body.velocity.y) < 0.2) {
        // If target is above us, or we bumped into a step
        if (targetPoint.y > botPos.y + 0.5 || Math.random() < 0.05) {
          bot.body.velocity.y = 7.5;
          bot.jumpCooldown = 1.4 + Math.random() * 0.5;
        }
      }
    }
  }

  // Update carried box physics position to match bot hands
  if (bot.carriedBox) {
    const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), bot.rig.root.rotation.y);
    const holdPos = botPos.clone().add(forward.multiplyScalar(0.95));
    holdPos.y += 0.4;

    bot.carriedBox.body.position.set(holdPos.x, holdPos.y, holdPos.z);
    bot.carriedBox.body.velocity.set(bot.body.velocity.x, bot.body.velocity.y, bot.body.velocity.z);
    bot.carriedBox.mesh.position.copy(holdPos);
  }

  // Sync Rig visual transform with Cannon body
  bot.rig.root.position.set(bot.body.position.x, bot.body.position.y - 0.55, bot.body.position.z);

  const horizontalSpeed = Math.sqrt(
    bot.body.velocity.x * bot.body.velocity.x + bot.body.velocity.z * bot.body.velocity.z
  );
  const isGrounded = Math.abs(bot.body.velocity.y) < 0.35;

  bot.rig.updateAnimation(dt, horizontalSpeed, isGrounded, !!bot.carriedBox);
}
