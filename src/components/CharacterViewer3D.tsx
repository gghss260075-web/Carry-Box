/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { createCharacter, CharacterRig } from '../game/character';

interface CharacterViewer3DProps {
  color: string;
  hat?: string;
  shirt?: string;
  pants?: string;
  activePower?: 'gravity' | 'friction' | 'elasticity' | 'buoyancy';
}

export const CharacterViewer3D: React.FC<CharacterViewer3DProps> = ({
  color,
  hat = 'hardhat',
  shirt = 'basic_hoodie',
  pants = 'denim_jeans',
  activePower = 'gravity',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rigRef = useRef<CharacterRig | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 50);
    camera.position.set(0, 1.25, 3.4);
    camera.lookAt(0, 0.7, 0);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 3. Studio Environment Reflection
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    // 4. Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xcbd5e1, 0.85);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfffbeb, 1.6);
    keyLight.position.set(6, 9, 6);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x818cf8, 0.8);
    rimLight.position.set(-6, 4, -4);
    scene.add(rimLight);

    // 5. Character
    const rig = createCharacter({ color, hat, shirt, pants });
    rig.setPower(activePower);
    scene.add(rig.root);
    rigRef.current = rig;

    // Pedestal ring
    const pedestalGeom = new THREE.CylinderGeometry(0.95, 1.05, 0.08, 32);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.35,
      metalness: 0.25,
    });
    const pedestal = new THREE.Mesh(pedestalGeom, pedestalMat);
    pedestal.position.y = -0.04;
    pedestal.receiveShadow = true;
    scene.add(pedestal);

    // 6. Animation Loop
    let animId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const dt = clock.getDelta();

      // Gentle rotation & wobble
      rig.root.rotation.y += dt * 0.65;
      rig.updateAnimation(dt, 0, true, false);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update properties on change
  useEffect(() => {
    if (rigRef.current) {
      rigRef.current.setColor(color);
      rigRef.current.setHat(hat);
      rigRef.current.setShirt(shirt);
      rigRef.current.setPants(pants);
      rigRef.current.setPower(activePower);
    }
  }, [color, hat, shirt, pants, activePower]);

  return <div ref={mountRef} className="h-full w-full" />;
};
