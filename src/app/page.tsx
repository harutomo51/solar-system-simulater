"use client"

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { Label, Input, Button } from "@/components/ui";

const SolarSystem: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [timeSpeed, setTimeSpeed] = useState(1);
  const [exaggeratedSize, setExaggeratedSize] = useState(false);

  const planets = [
    { name: '水星', distance: 5, speed: 4.1, size: 0.38, color: '#A0522D' },
    { name: '金星', distance: 7, speed: 1.6, size: 0.95, color: '#DEB887' },
    { name: '地球', distance: 10, speed: 1, size: 1, color: '#4169E1' },
    { name: '火星', distance: 15, speed: 0.53, size: 0.53, color: '#CD5C5C' },
    { name: '木星', distance: 52, speed: 0.084, size: 11.2, color: '#DAA520' },
    { name: '土星', distance: 95, speed: 0.034, size: 9.5, color: '#F4A460' },
    { name: '天王星', distance: 192, speed: 0.012, size: 4, color: '#87CEEB' },
    { name: '海王星', distance: 301, speed: 0.006, size: 3.9, color: '#4682B4' }
  ];

  const bloomParams = {
    /** トーンマッピング: 露光量 */
    exposure: 1.8,
  
    /** 発光エフェクト: 強さ */
    bloomStrength: 3.0,
  
    /** 発光エフェクト: 半径 */
    bloomRadius: 1.2,
  
    /** 発光エフェクト: 閾値 */
    bloomThreshold: 0.0,
  };

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = bloomParams.exposure;
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    camera.position.set(0, 30, 100);
    controls.update();

    const composer = new EffectComposer(renderer);
    composer.setSize(window.innerWidth, window.innerHeight);
    const renderPass = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      bloomParams.bloomStrength,
      bloomParams.bloomRadius,
      bloomParams.bloomThreshold
    );
    composer.addPass(renderPass);
    composer.addPass(bloomPass);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
      bloomPass.resolution.set(window.innerWidth, window.innerHeight);
    };

    handleResize(); // 初期サイズを設定
    window.addEventListener('resize', handleResize);

    const sunGeometry = new THREE.SphereGeometry(3, 32, 32);
    const sunMaterial = new THREE.MeshStandardMaterial({
      color: '#FDB813',
      emissive: '#FDB813',
      emissiveIntensity: 2,
      toneMapped: false
    });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    const planetObjects: THREE.Mesh[] = [];
    const orbitLines: THREE.Line[] = [];

    planets.forEach((planet) => {
      const size = exaggeratedSize ? planet.size : planet.size * 0.3;
      const geometry = new THREE.SphereGeometry(size, 32, 32);
      const material = new THREE.MeshStandardMaterial({
        color: planet.color,
        emissive: planet.color,
        emissiveIntensity: 2,
        toneMapped: false
      });
      const mesh = new THREE.Mesh(geometry, material);
      
      const orbitGeometry = new THREE.BufferGeometry();
      const orbitPoints = [];
      for (let i = 0; i <= 64; i++) {
        const angle = (i / 64) * Math.PI * 2;
        orbitPoints.push(
          planet.distance * Math.cos(angle),
          0,
          planet.distance * Math.sin(angle)
        );
      }
      orbitGeometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(orbitPoints, 3)
      );
      const orbitLine = new THREE.Line(
        orbitGeometry,
        new THREE.LineBasicMaterial({ color: '#ffffff', opacity: 0.3, transparent: true })
      );
      
      scene.add(mesh);
      scene.add(orbitLine);
      planetObjects.push(mesh);
      orbitLines.push(orbitLine);
    });

    const ambientLight = new THREE.AmbientLight('#ffffff', 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight('#ffffff', 2);
    scene.add(pointLight);

    const starGeometry = new THREE.BufferGeometry();
    const starVertices = [];
    for (let i = 0; i < 10000; i++) {
      const x = THREE.MathUtils.randFloatSpread(2000);
      const y = THREE.MathUtils.randFloatSpread(2000);
      const z = THREE.MathUtils.randFloatSpread(2000);
      starVertices.push(x, y, z);
    }
    starGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(starVertices, 3)
    );
    const starMaterial = new THREE.PointsMaterial({
      color: '#ffffff',
      size: 0.5,
      toneMapped: false
    });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.01 * timeSpeed;

      planetObjects.forEach((planet, index) => {
        const planetData = planets[index];
        planet.position.x = Math.cos(time * planetData.speed) * planetData.distance;
        planet.position.z = Math.sin(time * planetData.speed) * planetData.distance;
      });

      composer.render();
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
      scene.clear();
    };
  }, [timeSpeed, exaggeratedSize]);

  return (
    <div className="flex flex-row items-start gap-4 bg-[#1a1a1a] min-h-screen">
      <div ref={mountRef} className="flex-grow" />
      <div className="flex flex-col gap-4 p-6 rounded bg-[#2a2a2a] text-white min-w-[250px] absolute top-4 right-4">
        <h2 className="text-xl font-bold mb-4">コントロールパネル</h2>
        <div className="flex flex-col gap-4">
          <div>
            <Label htmlFor="timeSpeed">時間の進行速度</Label>
            <Input
              id="timeSpeed"
              type="range"
              min="0.1"
              max="10"
              step="0.1"
              value={timeSpeed}
              onChange={(e) => setTimeSpeed(parseFloat(e.target.value))}
            />
            <span className="mt-1 block">{timeSpeed}x</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="exaggeratedSize"
              type="checkbox"
              checked={exaggeratedSize}
              onChange={(e) => setExaggeratedSize(e.target.checked)}
              className="w-4 h-4"
            />
            <Label htmlFor="exaggeratedSize">惑星サイズを誇張</Label>
          </div>
          <Button
            onClick={() => {
              setTimeSpeed(1);
              setExaggeratedSize(false);
            }}
            className="mt-4"
          >
            リセット
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SolarSystem;