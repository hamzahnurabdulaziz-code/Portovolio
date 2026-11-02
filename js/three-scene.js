/**
 * HAMZAH NUR ABDUL AZIZ - 3D WEBGL ENGINE & PLAYABLE CYBER GAME (THREE.JS)
 * Features:
 * - Ultra HD 3D Quantum Hologram with Anamorphic Pop-Out depth
 * - Cinematic 3D Intro sequence with hyperspace camera warp
 * - Playable 3D IT Mini-Game: "Cyber Runner 3D" (Laravel, Rust, Vue, Next.js nodes)
 * - Multi-mode 3D geometry switcher (Core, Torus, Neural)
 * - Ambient 1500+ particle galaxy with depth warp on scroll & movement
 * - Dynamic RGB orbiting point lights & specular shaders
 */

(function () {
  'use strict';

  let scene, camera, renderer;
  let particles, particlePositions, particleColors;
  let activeMeshGroup, holoPopoutGroup;
  let currentMode = 'core'; // 'core' | 'torus' | 'neural'
  
  // Lighting
  let light1, light2, light3, hemiLight;
  
  // Mouse & Scroll coordinates with smoothing
  let mouseX = 0, mouseY = 0;
  let targetX = 0, targetY = 0;
  let scrollSpeed = 0, lastScrollY = window.scrollY;
  let isHeroHovered = false;

  // Intro Cinematic State & 4K Hyperspace Dive
  let isIntroActive = true;
  let introProgress = 0;
  let introCameraZ = 22;
  let introPortalGroup = null;
  let isWarpDiving = false;
  let warpStartTime = 0;

  // ===================================================================
  // 3D MINI-GAME STATE & VARIABLES
  // ===================================================================
  let isGameActive = false;
  let gameScore = 0;
  let gameShield = 100;
  let gameSpeed = 0.35;
  let playerShipGroup = null;
  let playerPos = { x: 0, y: 0 };
  let playerTargetPos = { x: 0, y: 0 };
  let playerVelocity = { x: 0, y: 0 };
  let collectibles = [];
  let obstacles = [];
  let explosionParticles = [];
  let collectedTechs = new Set();
  let keys = { left: false, right: false, up: false, down: false, boost: false };

  const canvas = document.getElementById('three-canvas');

  function initThree() {
    if (!window.THREE) {
      console.warn('Three.js library not detected. Running fallback.');
      return;
    }

    // 1. Scene setup
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x07090e, 0.032);

    // 2. Camera setup
    const aspect = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
    camera.position.z = introCameraZ;

    // 3. Renderer setup
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.5));

    // 4. Lights
    hemiLight = new THREE.HemisphereLight(0x00f2fe, 0x07090e, 0.6);
    scene.add(hemiLight);

    light1 = new THREE.PointLight(0x00f2fe, 3.5, 25);
    light1.position.set(4, 3, 5);
    scene.add(light1);

    light2 = new THREE.PointLight(0xff6b4a, 3.5, 25);
    light2.position.set(-4, -3, 4);
    scene.add(light2);

    light3 = new THREE.PointLight(0xff2d20, 2.5, 20); // Laravel red accent
    light3.position.set(0, 5, -2);
    scene.add(light3);

    // 5. Starfield / Dynamic Warp Particle Cloud
    createParticleCloud();

    // 6. Active 3D Geometry
    activeMeshGroup = new THREE.Group();
    scene.add(activeMeshGroup);
    buildGeometry(currentMode);
    activeMeshGroup.visible = false; // Initially hidden during 3D intro

    // 7. Anamorphic 3D Pop-Out Hologram Group
    createHoloPopoutGroup();
    if (holoPopoutGroup) holoPopoutGroup.visible = false; // Initially hidden during 3D intro

    // 8. 4K 3D Intro Quantum Portal Gateway
    createIntroPortalGroup();

    // 9. Build Player Drone for Mini-Game
    createPlayerShip();

    // 9. Event Listeners
    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('keydown', onKeyDown, false);
    window.addEventListener('keyup', onKeyUp, false);

    // Mobile orientation support
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', onDeviceOrientation, false);
    }

    // Connect mode switcher buttons
    setupModeControls();
    setupHeroHoverDepth();

    // Start Animation Loop
    animate();
  }

  // Particle cloud generation with warp capabilities
  function createParticleCloud() {
    const particleCount = 1500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const colorCyan = new THREE.Color(0x00f2fe);
    const colorRust = new THREE.Color(0xff6b4a);
    const colorLaravel = new THREE.Color(0xff2d20);
    const colorVue = new THREE.Color(0x42b883);

    for (let i = 0; i < particleCount; i++) {
      const radius = 8 + Math.random() * 26;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const rand = Math.random();
      const chosenColor = rand < 0.35 ? colorCyan : (rand < 0.6 ? colorRust : (rand < 0.8 ? colorLaravel : colorVue));
      colors[i * 3] = chosenColor.r;
      colors[i * 3 + 1] = chosenColor.g;
      colors[i * 3 + 2] = chosenColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.085,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);
  }

  // Anamorphic 3D Pop-Out Hologram (Layered floating 3D elements)
  function createHoloPopoutGroup() {
    holoPopoutGroup = new THREE.Group();
    holoPopoutGroup.name = 'holoPopoutGroup';
    holoPopoutGroup.position.set(1.4, 0, -0.4);

    // Holographic diamond prism
    const prismGeo = new THREE.OctahedronGeometry(1.2, 0);
    const prismMat = new THREE.MeshStandardMaterial({
      color: 0x00f2fe,
      emissive: 0x002233,
      metalness: 0.9,
      roughness: 0.1,
      wireframe: false,
      transparent: true,
      opacity: 0.75
    });
    const prismMesh = new THREE.Mesh(prismGeo, prismMat);
    prismMesh.name = 'holoPrism';
    holoPopoutGroup.add(prismMesh);

    // Outer chromatic wireframe cage
    const cageGeo = new THREE.IcosahedronGeometry(1.5, 0);
    const cageMat = new THREE.MeshBasicMaterial({
      color: 0xff6b4a,
      wireframe: true,
      transparent: true,
      opacity: 0.4
    });
    const cageMesh = new THREE.Mesh(cageGeo, cageMat);
    cageMesh.name = 'holoCage';
    holoPopoutGroup.add(cageMesh);

    // Orbiting mini tech glyphs
    const glyphColors = [0xff2d20, 0x00f2fe, 0x42b883, 0xff6b4a]; // Laravel, Cyan, Vue, Rust
    for (let i = 0; i < 4; i++) {
      const gGeo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
      const gMat = new THREE.MeshStandardMaterial({
        color: glyphColors[i],
        emissive: glyphColors[i],
        roughness: 0.2
      });
      const gMesh = new THREE.Mesh(gGeo, gMat);
      const angle = (i / 4) * Math.PI * 2;
      gMesh.position.set(Math.cos(angle) * 2.2, Math.sin(angle) * 2.2, 0);
      gMesh.name = 'glyph' + i;
      holoPopoutGroup.add(gMesh);
    }

    scene.add(holoPopoutGroup);
  }

  // ===================================================================
  // 4K 3D INTRO QUANTUM PORTAL & HYPERSPACE GATEWAY
  // ===================================================================
  function createIntroPortalGroup() {
    introPortalGroup = new THREE.Group();
    introPortalGroup.name = 'introPortalGroup';
    introPortalGroup.position.set(0, 0, 0);

    // 1. Dual Concentric 3D Torus Knots
    // Outer Torus Knot (Cyan Cyber Gateway)
    const knotOuterGeo = new THREE.TorusKnotGeometry(2.7, 0.22, 128, 32, 2, 3);
    const knotOuterMat = new THREE.MeshStandardMaterial({
      color: 0x00f2fe,
      emissive: 0x003344,
      metalness: 0.9,
      roughness: 0.15,
      wireframe: false
    });
    const knotOuter = new THREE.Mesh(knotOuterGeo, knotOuterMat);
    knotOuter.name = 'knotOuter';
    introPortalGroup.add(knotOuter);

    // Outer Knot Wireframe Shell (Holographic scanline effect)
    const wireOuterMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    const knotOuterWire = new THREE.Mesh(knotOuterGeo, wireOuterMat);
    knotOuterWire.scale.set(1.025, 1.025, 1.025);
    knotOuterWire.name = 'knotOuterWire';
    introPortalGroup.add(knotOuterWire);

    // Inner Counter-Rotating Torus Ring (Laravel Red & Fire)
    const ringInnerGeo = new THREE.TorusGeometry(3.6, 0.08, 16, 64);
    const ringInnerMat = new THREE.MeshStandardMaterial({
      color: 0xff2d20,
      emissive: 0xff2d20,
      metalness: 0.9,
      roughness: 0.1
    });
    const ringInner = new THREE.Mesh(ringInnerGeo, ringInnerMat);
    ringInner.name = 'ringInner';
    introPortalGroup.add(ringInner);

    // Second inclined Ring (Vue Emerald Glow)
    const ringEmeraldGeo = new THREE.TorusGeometry(3.3, 0.06, 16, 64);
    const ringEmeraldMat = new THREE.MeshStandardMaterial({
      color: 0x42b883,
      emissive: 0x10b981,
      metalness: 0.8,
      roughness: 0.2
    });
    const ringEmerald = new THREE.Mesh(ringEmeraldGeo, ringEmeraldMat);
    ringEmerald.rotation.x = Math.PI / 3;
    ringEmerald.name = 'ringEmerald';
    introPortalGroup.add(ringEmerald);

    // 2. Central Hyper-Core Polyhedron (Chrome & Neon)
    const coreGeo = new THREE.IcosahedronGeometry(0.95, 0);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x00f2fe,
      emissiveIntensity: 0.45,
      metalness: 0.95,
      roughness: 0.05
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.name = 'portalCore';
    introPortalGroup.add(coreMesh);

    // Core Wireframe Cage
    const coreCageGeo = new THREE.SphereGeometry(1.35, 14, 14);
    const coreCageMat = new THREE.MeshBasicMaterial({
      color: 0xff6b4a,
      wireframe: true,
      transparent: true,
      opacity: 0.55
    });
    const coreCage = new THREE.Mesh(coreCageGeo, coreCageMat);
    coreCage.name = 'portalCoreCage';
    introPortalGroup.add(coreCage);

    // 3. Four Orbiting Tech Satellite Crystals (Laravel 13, Rust, Next.js, WebGL)
    const satellites = [
      { geo: new THREE.DodecahedronGeometry(0.3, 0), color: 0xff2d20, radius: 4.3, speed: 1.3, name: 'satLaravel' },
      { geo: new THREE.TorusGeometry(0.26, 0.08, 8, 16), color: 0xff6b4a, radius: 4.7, speed: -1.0, name: 'satRust' },
      { geo: new THREE.OctahedronGeometry(0.28, 0), color: 0xffffff, radius: 5.1, speed: 0.85, name: 'satNext' },
      { geo: new THREE.IcosahedronGeometry(0.28, 0), color: 0x00f2fe, radius: 3.9, speed: -1.5, name: 'satThree' }
    ];

    satellites.forEach((sat) => {
      const mat = new THREE.MeshStandardMaterial({
        color: sat.color,
        emissive: sat.color,
        roughness: 0.2,
        metalness: 0.85
      });
      const mesh = new THREE.Mesh(sat.geo, mat);
      mesh.name = sat.name;
      mesh.userData = sat;
      introPortalGroup.add(mesh);
    });

    // 4. Intro Warp Tunnel Stream (High speed forward streaks)
    const warpCount = 650;
    const warpGeo = new THREE.BufferGeometry();
    const warpPos = new Float32Array(warpCount * 3);
    const warpColors = new Float32Array(warpCount * 3);
    const colCyan = new THREE.Color(0x00f2fe);
    const colRust = new THREE.Color(0xff6b4a);
    const colLaravel = new THREE.Color(0xff2d20);

    for (let i = 0; i < warpCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 1.8 + Math.random() * 8.5;
      warpPos[i * 3] = Math.cos(angle) * radius;
      warpPos[i * 3 + 1] = Math.sin(angle) * radius;
      warpPos[i * 3 + 2] = -15 + Math.random() * 45;

      const pick = Math.random();
      const col = pick < 0.5 ? colCyan : (pick < 0.8 ? colRust : colLaravel);
      warpColors[i * 3] = col.r;
      warpColors[i * 3 + 1] = col.g;
      warpColors[i * 3 + 2] = col.b;
    }

    warpGeo.setAttribute('position', new THREE.BufferAttribute(warpPos, 3));
    warpGeo.setAttribute('color', new THREE.BufferAttribute(warpColors, 3));

    const warpMat = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    const warpPoints = new THREE.Points(warpGeo, warpMat);
    warpPoints.name = 'introWarpPoints';
    introPortalGroup.add(warpPoints);

    scene.add(introPortalGroup);
  }

  // Clear previous mesh group and construct new 3D model
  function buildGeometry(mode) {
    while (activeMeshGroup.children.length > 0) {
      const obj = activeMeshGroup.children[0];
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
        else obj.material.dispose();
      }
      activeMeshGroup.remove(obj);
    }

    if (mode === 'core') {
      // MODE 1: Quantum Core (Icosahedron + Floating Wireframe + Orbital Rings)
      const outerGeo = new THREE.IcosahedronGeometry(2.0, 1);
      const wireframeMat = new THREE.MeshStandardMaterial({
        color: 0x00f2fe,
        wireframe: true,
        transparent: true,
        opacity: 0.7,
        emissive: 0x003344,
        roughness: 0.2
      });
      const outerMesh = new THREE.Mesh(outerGeo, wireframeMat);
      outerMesh.name = 'outerCore';
      activeMeshGroup.add(outerMesh);

      // Inner Core
      const innerGeo = new THREE.OctahedronGeometry(1.0, 0);
      const innerMat = new THREE.MeshStandardMaterial({
        color: 0xff6b4a,
        roughness: 0.1,
        metalness: 0.8,
        emissive: 0x441100
      });
      const innerMesh = new THREE.Mesh(innerGeo, innerMat);
      innerMesh.name = 'innerCore';
      activeMeshGroup.add(innerMesh);

      // Orbital Ring 1
      const ring1Geo = new THREE.TorusGeometry(2.7, 0.025, 16, 100);
      const ring1Mat = new THREE.MeshBasicMaterial({ color: 0x00f2fe, transparent: true, opacity: 0.6 });
      const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
      ring1.rotation.x = Math.PI / 3;
      ring1.name = 'ring1';
      activeMeshGroup.add(ring1);

      // Orbital Ring 2 (Laravel Red & Rust)
      const ring2Geo = new THREE.TorusGeometry(3.1, 0.025, 16, 100);
      const ring2Mat = new THREE.MeshBasicMaterial({ color: 0xff4438, transparent: true, opacity: 0.6 });
      const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
      ring2.rotation.y = Math.PI / 4;
      ring2.rotation.x = -Math.PI / 4;
      ring2.name = 'ring2';
      activeMeshGroup.add(ring2);

      // Satellites
      for (let s = 0; s < 4; s++) {
        const satGeo = new THREE.SphereGeometry(0.09, 16, 16);
        const satColors = [0x00f2fe, 0xff2d20, 0x42b883, 0xff6b4a];
        const satMat = new THREE.MeshBasicMaterial({ color: satColors[s] });
        const sat = new THREE.Mesh(satGeo, satMat);
        sat.position.set(Math.cos(s * 1.57) * 2.8, Math.sin(s * 1.57) * 2.8, 0);
        sat.name = 'sat' + s;
        activeMeshGroup.add(sat);
      }

    } else if (mode === 'torus') {
      // MODE 2: Torus Knot Cyber Ribbon
      const torusGeo = new THREE.TorusKnotGeometry(1.6, 0.45, 120, 24, 2, 3);
      const torusMat = new THREE.MeshStandardMaterial({
        color: 0x00f2fe,
        metalness: 0.85,
        roughness: 0.15,
        wireframe: false,
        emissive: 0x001122
      });
      const torusMesh = new THREE.Mesh(torusGeo, torusMat);
      torusMesh.name = 'torusMesh';
      activeMeshGroup.add(torusMesh);

      const wireGeo = new THREE.TorusKnotGeometry(1.62, 0.46, 60, 12, 2, 3);
      const wireMat = new THREE.MeshBasicMaterial({
        color: 0xff6b4a,
        wireframe: true,
        transparent: true,
        opacity: 0.35
      });
      const wireMesh = new THREE.Mesh(wireGeo, wireMat);
      wireMesh.name = 'torusWire';
      activeMeshGroup.add(wireMesh);

    } else if (mode === 'neural') {
      // MODE 3: Neural Constellation Nodes & Connecting Rays
      const nodeCount = 42;
      const nodePositions = [];
      const nodeGroup = new THREE.Group();

      for (let i = 0; i < nodeCount; i++) {
        const x = (Math.random() - 0.5) * 5.5;
        const y = (Math.random() - 0.5) * 4.5;
        const z = (Math.random() - 0.5) * 4.5;
        nodePositions.push(new THREE.Vector3(x, y, z));

        const sphereGeo = new THREE.SphereGeometry(0.08, 12, 12);
        const rand = Math.random();
        const col = rand < 0.4 ? 0x00f2fe : (rand < 0.7 ? 0xff2d20 : 0x42b883);
        const sphereMat = new THREE.MeshBasicMaterial({ color: col });
        const sphere = new THREE.Mesh(sphereGeo, sphereMat);
        sphere.position.set(x, y, z);
        nodeGroup.add(sphere);
      }

      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x00f2fe,
        transparent: true,
        opacity: 0.28
      });
      const lineGeo = new THREE.BufferGeometry();
      const linePoints = [];

      for (let i = 0; i < nodeCount; i++) {
        for (let j = i + 1; j < nodeCount; j++) {
          const dist = nodePositions[i].distanceTo(nodePositions[j]);
          if (dist < 2.2) {
            linePoints.push(nodePositions[i].x, nodePositions[i].y, nodePositions[i].z);
            linePoints.push(nodePositions[j].x, nodePositions[j].y, nodePositions[j].z);
          }
        }
      }
      lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePoints, 3));
      const lineMesh = new THREE.LineSegments(lineGeo, lineMaterial);
      nodeGroup.add(lineMesh);

      nodeGroup.name = 'neuralMesh';
      activeMeshGroup.add(nodeGroup);
    }
  }

  // ===================================================================
  // PLAYABLE 3D MINI-GAME CREATION
  // ===================================================================
  function createPlayerShip() {
    playerShipGroup = new THREE.Group();
    playerShipGroup.name = 'playerShipGroup';
    playerShipGroup.visible = false;

    // Fuselage / Hull (Sleek Delta Fighter)
    const hullGeo = new THREE.ConeGeometry(0.45, 1.4, 4);
    const hullMat = new THREE.MeshStandardMaterial({
      color: 0x00f2fe,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0x002233
    });
    const hull = new THREE.Mesh(hullGeo, hullMat);
    hull.rotation.x = Math.PI / 2;
    playerShipGroup.add(hull);

    // Wings
    const wingGeo = new THREE.BufferGeometry();
    const wingVertices = new Float32Array([
      0, 0, 0.4,
      -1.1, 0, -0.6,
      0, 0, -0.3,
      0, 0, 0.4,
      1.1, 0, -0.6,
      0, 0, -0.3
    ]);
    wingGeo.setAttribute('position', new THREE.BufferAttribute(wingVertices, 3));
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0xff6b4a,
      side: THREE.DoubleSide,
      metalness: 0.7,
      roughness: 0.3
    });
    const wings = new THREE.Mesh(wingGeo, wingMat);
    playerShipGroup.add(wings);

    // Cockpit Glow
    const cockpitGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const cockpitMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const cockpit = new THREE.Mesh(cockpitGeo, cockpitMat);
    cockpit.position.set(0, 0.12, 0.2);
    playerShipGroup.add(cockpit);

    // Dual Plasma Thrusters
    const thrusterMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe });
    const t1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.02, 0.3, 8), thrusterMat);
    t1.rotation.x = Math.PI / 2;
    t1.position.set(-0.25, 0, -0.7);
    playerShipGroup.add(t1);

    const t2 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.02, 0.3, 8), thrusterMat);
    t2.rotation.x = Math.PI / 2;
    t2.position.set(0.25, 0, -0.7);
    playerShipGroup.add(t2);

    scene.add(playerShipGroup);
  }

  // Spawn dynamic collectible tech gem
  function spawnCollectible() {
    const techTypes = [
      { name: 'Laravel 13', color: 0xff2d20, geo: new THREE.IcosahedronGeometry(0.35, 0) },
      { name: 'Livewire 3', color: 0xfb7185, geo: new THREE.DodecahedronGeometry(0.32, 0) },
      { name: 'Rust Engine', color: 0xff6b4a, geo: new THREE.TorusGeometry(0.3, 0.1, 8, 16) },
      { name: 'Vue 3', color: 0x42b883, geo: new THREE.ConeGeometry(0.35, 0.6, 5) },
      { name: 'Next.js 15', color: 0xffffff, geo: new THREE.OctahedronGeometry(0.35, 0) },
      { name: 'MySQL DB', color: 0x00758f, geo: new THREE.CylinderGeometry(0.28, 0.28, 0.45, 8) }
    ];

    const pick = techTypes[Math.floor(Math.random() * techTypes.length)];
    const mat = new THREE.MeshStandardMaterial({
      color: pick.color,
      emissive: pick.color,
      roughness: 0.1,
      metalness: 0.8
    });
    const mesh = new THREE.Mesh(pick.geo, mat);
    mesh.position.set(
      (Math.random() - 0.5) * 8,
      (Math.random() - 0.5) * 5,
      -35 - Math.random() * 10
    );
    mesh.userData = { type: 'token', name: pick.name, color: pick.color };
    scene.add(mesh);
    collectibles.push(mesh);
  }

  // Spawn firewall obstacle
  function spawnObstacle() {
    const geo = new THREE.BoxGeometry(0.9, 0.9, 0.9);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xff0044,
      wireframe: true
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(
      (Math.random() - 0.5) * 8,
      (Math.random() - 0.5) * 5,
      -35 - Math.random() * 10
    );
    mesh.userData = { type: 'hazard' };
    scene.add(mesh);
    obstacles.push(mesh);
  }

  // Create explosion particle burst
  function triggerExplosion(pos, colorHex) {
    const count = 30;
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = [];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = pos.x;
      positions[i * 3 + 1] = pos.y;
      positions[i * 3 + 2] = pos.z;

      velocities.push(new THREE.Vector3(
        (Math.random() - 0.5) * 0.4,
        (Math.random() - 0.5) * 0.4,
        (Math.random() - 0.5) * 0.4
      ));
    }
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: colorHex,
      size: 0.12,
      transparent: true,
      opacity: 1
    });
    const pMesh = new THREE.Points(geom, mat);
    pMesh.userData = { velocities, life: 1.0 };
    scene.add(pMesh);
    explosionParticles.push(pMesh);
  }

  // Start mini-game
  window.start3DGame = function () {
    isGameActive = true;
    gameScore = 0;
    gameShield = 100;
    collectedTechs.clear();

    const hud = document.getElementById('game-hud');
    if (hud) hud.classList.add('active');

    if (playerShipGroup) {
      playerShipGroup.visible = true;
      playerShipGroup.position.set(0, 0, 0);
    }
    if (activeMeshGroup) activeMeshGroup.visible = false;
    if (holoPopoutGroup) holoPopoutGroup.visible = false;

    // Spawn initial collectibles
    for (let i = 0; i < 8; i++) spawnCollectible();
    for (let i = 0; i < 4; i++) spawnObstacle();

    if (window.showToast) window.showToast('🎮 Mode Game 3D Aktif! Kendalikan dengan W/A/S/D atau Panah.', 'gamepad-2');
    if (window.AudioController) window.AudioController.playSuccess();
  };

  // Exit mini-game
  window.exit3DGame = function () {
    isGameActive = false;
    const hud = document.getElementById('game-hud');
    if (hud) hud.classList.remove('active');

    const victoryModal = document.getElementById('game-victory-modal');
    if (victoryModal) victoryModal.classList.remove('active');

    if (playerShipGroup) playerShipGroup.visible = false;
    if (activeMeshGroup) activeMeshGroup.visible = true;
    if (holoPopoutGroup) holoPopoutGroup.visible = true;

    // Clean up game items
    collectibles.forEach(c => { scene.remove(c); if (c.geometry) c.geometry.dispose(); });
    obstacles.forEach(o => { scene.remove(o); if (o.geometry) o.geometry.dispose(); });
    collectibles = [];
    obstacles = [];

    // Reset camera position smoothly
    camera.position.set(0, 0, 7);
    camera.lookAt(0, 0, 0);
  };

  // Mobile virtual joystick triggers
  window.triggerGameMove = function (dir) {
    if (!isGameActive) return;
    if (dir === 'left') playerTargetPos.x -= 1.0;
    if (dir === 'right') playerTargetPos.x += 1.0;
    if (dir === 'up') playerTargetPos.y += 1.0;
    if (dir === 'down') playerTargetPos.y -= 1.0;
    if (dir === 'boost') gameSpeed = 0.65;
  };

  function onKeyDown(e) {
    if (!isGameActive) return;
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = true;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = true;
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') keys.up = true;
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') keys.down = true;
    if (e.key === ' ') keys.boost = true;
    if (e.key === 'Escape') window.exit3DGame();
  }

  function onKeyUp(e) {
    if (!isGameActive) return;
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = false;
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') keys.up = false;
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') keys.down = false;
    if (e.key === ' ') keys.boost = false;
  }

  // Cinematic Hyperspace Plunge through 3D Quantum Portal
  window.diveIntoPortfolio = function () {
    if (!isIntroActive) return;
    if (isWarpDiving) return;

    isWarpDiving = true;
    warpStartTime = Date.now();

    if (window.AudioController) {
      if (typeof window.AudioController.playWarp === 'function') {
        window.AudioController.playWarp();
      } else if (typeof window.AudioController.playSuccess === 'function') {
        window.AudioController.playSuccess();
      }
    }

    const overlay = document.getElementById('cyber-intro-overlay');
    if (overlay) {
      overlay.classList.add('diving-active');
      setTimeout(() => {
        overlay.classList.add('hide-intro');
        setTimeout(() => {
          overlay.style.display = 'none';
        }, 400);
      }, 550);
    }
    document.body.style.overflow = '';
  };

  // Dismiss intro immediately (e.g. Skip button)
  window.dismissIntro = function () {
    isIntroActive = false;
    isWarpDiving = false;
    if (introPortalGroup) introPortalGroup.visible = false;
    if (activeMeshGroup) activeMeshGroup.visible = true;
    if (holoPopoutGroup) holoPopoutGroup.visible = true;

    const overlay = document.getElementById('cyber-intro-overlay');
    if (overlay) {
      overlay.classList.add('hide-intro');
      setTimeout(() => {
        overlay.style.display = 'none';
      }, 350);
    }
    document.body.style.overflow = '';
    if (camera) {
      camera.position.set(0, 0, 7);
      camera.fov = 60;
      camera.updateProjectionMatrix();
      camera.lookAt(0, 0, 0);
    }
    if (window.AudioController && window.AudioController.playSuccess) {
      try { window.AudioController.playSuccess(); } catch (e) {}
    }
  };

  // Replay cinematic intro
  window.playCinematicIntro = function (callback) {
    isIntroActive = true;
    isWarpDiving = false;
    introCameraZ = 22;
    if (introPortalGroup) {
      introPortalGroup.visible = true;
      introPortalGroup.scale.set(1, 1, 1);
    }
    if (activeMeshGroup) activeMeshGroup.visible = false;
    if (holoPopoutGroup) holoPopoutGroup.visible = false;

    if (camera) {
      camera.position.set(0, 0, 22);
      camera.fov = 60;
      camera.updateProjectionMatrix();
      camera.lookAt(0, 0, 0);
    }

    const overlay = document.getElementById('cyber-intro-overlay');
    if (overlay) {
      overlay.style.display = 'flex';
      overlay.classList.remove('hide-intro', 'diving-active');
    }
    if (callback) {
      setTimeout(callback, 1200);
    }
  };

  function setupHeroHoverDepth() {
    const heroCard = document.getElementById('avatar-card');
    if (heroCard) {
      heroCard.addEventListener('mouseenter', () => isHeroHovered = true);
      heroCard.addEventListener('mouseleave', () => isHeroHovered = false);
    }
  }

  function setupModeControls() {
    const buttons = document.querySelectorAll('.scene-mode-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const mode = btn.getAttribute('data-mode');
        if (mode && mode !== currentMode) {
          currentMode = mode;
          buildGeometry(mode);
          if (window.AudioController) window.AudioController.playClick();
        }
      });
    });
  }

  function onMouseMove(event) {
    targetX = (event.clientX / window.innerWidth - 0.5) * 2;
    targetY = (event.clientY / window.innerHeight - 0.5) * 2;

    if (isGameActive) {
      playerTargetPos.x = targetX * 4.5;
      playerTargetPos.y = -targetY * 3.0;
    }
  }

  function onDeviceOrientation(event) {
    if (event.gamma !== null && event.beta !== null) {
      targetX = (event.gamma / 45) * 1.5;
      targetY = ((event.beta - 45) / 45) * 1.5;
      if (isGameActive) {
        playerTargetPos.x = targetX * 4.0;
        playerTargetPos.y = -targetY * 2.5;
      }
    }
  }

  function onScroll() {
    const currentY = window.scrollY;
    scrollSpeed = (currentY - lastScrollY) * 0.005;
    lastScrollY = currentY;
  }

  function onWindowResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  // ===================================================================
  // MAIN RENDER LOOP & SIMULATION
  // ===================================================================
  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // Smooth lerping of mouse coords
    mouseX += (targetX - mouseX) * 0.06;
    mouseY += (targetY - mouseY) * 0.06;
    scrollSpeed *= 0.92;

    // 1. Intro 4K 3D Quantum Portal & Hyperspace Dive
    if (isIntroActive) {
      if (introPortalGroup) {
        introPortalGroup.visible = true;

        // Animate outer quantum torus knot
        const knotOuter = introPortalGroup.getObjectByName('knotOuter');
        const knotOuterWire = introPortalGroup.getObjectByName('knotOuterWire');
        if (knotOuter) {
          knotOuter.rotation.x = elapsedTime * 0.45;
          knotOuter.rotation.y = elapsedTime * 0.6;
          knotOuter.rotation.z = elapsedTime * 0.25;
        }
        if (knotOuterWire && knotOuter) {
          knotOuterWire.rotation.copy(knotOuter.rotation);
        }

        // Animate counter rings
        const ringInner = introPortalGroup.getObjectByName('ringInner');
        if (ringInner) {
          ringInner.rotation.z = -elapsedTime * 0.8;
          ringInner.rotation.x = Math.sin(elapsedTime * 0.5) * 0.4;
        }
        const ringEmerald = introPortalGroup.getObjectByName('ringEmerald');
        if (ringEmerald) {
          ringEmerald.rotation.z = elapsedTime * 0.9;
          ringEmerald.rotation.y = Math.cos(elapsedTime * 0.6) * 0.5;
        }

        // Breathing hyper-core
        const portalCore = introPortalGroup.getObjectByName('portalCore');
        const portalCoreCage = introPortalGroup.getObjectByName('portalCoreCage');
        const coreScale = 1.0 + Math.sin(elapsedTime * 3) * 0.08;
        if (portalCore) {
          portalCore.rotation.x = elapsedTime * 0.8;
          portalCore.rotation.y = elapsedTime * 1.2;
          portalCore.scale.set(coreScale, coreScale, coreScale);
        }
        if (portalCoreCage) {
          portalCoreCage.rotation.x = -elapsedTime * 0.5;
          portalCoreCage.rotation.y = -elapsedTime * 0.7;
        }

        // Orbiting satellites (Laravel 13, Rust, Next.js, WebGL)
        ['satLaravel', 'satRust', 'satNext', 'satThree'].forEach((name, i) => {
          const sat = introPortalGroup.getObjectByName(name);
          if (sat && sat.userData) {
            const angle = elapsedTime * sat.userData.speed + (i * Math.PI / 2);
            sat.position.x = Math.cos(angle) * sat.userData.radius;
            sat.position.y = Math.sin(angle) * (sat.userData.radius * 0.7) + Math.sin(elapsedTime * 2 + i) * 0.3;
            sat.position.z = Math.sin(angle) * (sat.userData.radius * 0.5);
            sat.rotation.x += 0.02;
            sat.rotation.y += 0.03;
          }
        });

        // Warp particle stream
        const warpPoints = introPortalGroup.getObjectByName('introWarpPoints');
        if (warpPoints) {
          const positions = warpPoints.geometry.attributes.position.array;
          const streamSpeed = isWarpDiving ? 2.2 : 0.4;
          for (let i = 0; i < positions.length / 3; i++) {
            positions[i * 3 + 2] += streamSpeed;
            if (positions[i * 3 + 2] > 28) {
              positions[i * 3 + 2] = -15;
            }
          }
          warpPoints.geometry.attributes.position.needsUpdate = true;
          warpPoints.rotation.z = elapsedTime * (isWarpDiving ? 0.6 : 0.12);
        }
      }

      // If diving into portfolio (hyperspace dive)
      if (isWarpDiving) {
        const diveElapsed = (Date.now() - warpStartTime) / 1000;
        const diveDuration = 0.85;
        const progress = Math.min(1.0, diveElapsed / diveDuration);
        const easeExp = progress * progress * (3 - 2 * progress); // smoothstep

        // Camera accelerates and plunges straight through center of quantum gateway
        camera.position.z = 22 + (4 - 22) * easeExp;
        camera.position.x *= 0.85;
        camera.position.y *= 0.85;
        camera.lookAt(0, 0, 0);

        // Portal expands outward around camera
        if (introPortalGroup) {
          const expandScale = 1.0 + easeExp * 4.2;
          introPortalGroup.scale.set(expandScale, expandScale, expandScale);
          introPortalGroup.rotation.z += 0.08;
        }

        // Camera FOV expansion (hyperdrive lens sensation)
        camera.fov = 60 + Math.sin(progress * Math.PI) * 22;
        camera.updateProjectionMatrix();

        if (progress >= 1.0) {
          isIntroActive = false;
          isWarpDiving = false;
          camera.fov = 60;
          camera.updateProjectionMatrix();
          if (introPortalGroup) introPortalGroup.visible = false;
          if (activeMeshGroup) activeMeshGroup.visible = true;
          if (holoPopoutGroup) holoPopoutGroup.visible = true;
          introCameraZ = 7;
          camera.position.set(0, 0, 7);
          camera.lookAt(0, 0, 0);
        }
      } else {
        // Natural pre-dive float
        introCameraZ += (16 - introCameraZ) * 0.03;
        camera.position.z = introCameraZ;
        camera.position.x = Math.sin(elapsedTime * 0.8) * 0.6 + mouseX * 0.8;
        camera.position.y = Math.cos(elapsedTime * 0.6) * 0.4 + mouseY * 0.6;
        camera.lookAt(0, 0, 0);
      }

      if (particles) {
        particles.rotation.z = elapsedTime * 0.08;
      }

      renderer.render(scene, camera);
      return;
    }

    // 2. Playable 3D Mini-Game Engine
    if (isGameActive) {
      // Input movement
      const moveSpeed = keys.boost ? 0.22 : 0.14;
      if (keys.left) playerTargetPos.x -= moveSpeed;
      if (keys.right) playerTargetPos.x += moveSpeed;
      if (keys.up) playerTargetPos.y += moveSpeed;
      if (keys.down) playerTargetPos.y -= moveSpeed;

      // Clamp player within boundaries
      playerTargetPos.x = Math.max(-4.2, Math.min(4.2, playerTargetPos.x));
      playerTargetPos.y = Math.max(-2.8, Math.min(2.8, playerTargetPos.y));

      playerPos.x += (playerTargetPos.x - playerPos.x) * 0.15;
      playerPos.y += (playerTargetPos.y - playerPos.y) * 0.15;

      if (playerShipGroup) {
        playerShipGroup.position.set(playerPos.x, playerPos.y, 0);
        // Bank roll when turning
        const targetRoll = (playerTargetPos.x - playerPos.x) * -0.6;
        playerShipGroup.rotation.z += (targetRoll - playerShipGroup.rotation.z) * 0.12;
        playerShipGroup.rotation.x = Math.PI / 2 + (playerPos.y * 0.06);
      }

      // Camera chases behind ship
      camera.position.x += (playerPos.x * 0.65 - camera.position.x) * 0.1;
      camera.position.y += (playerPos.y * 0.65 + 1.2 - camera.position.y) * 0.1;
      camera.position.z = 4.2;
      camera.lookAt(playerPos.x * 0.4, playerPos.y * 0.4, -5);

      // Starfield forward speed sensation
      if (particles) {
        particles.position.z = (elapsedTime * 18 * (keys.boost ? 2.5 : 1.0)) % 30 - 15;
      }

      // Move collectibles toward player
      const forwardVelocity = gameSpeed * (keys.boost ? 1.8 : 1.0);
      for (let i = collectibles.length - 1; i >= 0; i--) {
        const item = collectibles[i];
        item.position.z += forwardVelocity;
        item.rotation.x += 0.03;
        item.rotation.y += 0.04;

        // Collision check
        const dist = item.position.distanceTo(new THREE.Vector3(playerPos.x, playerPos.y, 0));
        if (dist < 0.95) {
          // Collected!
          triggerExplosion(item.position, item.userData.color);
          gameScore += 50;
          collectedTechs.add(item.userData.name);

          if (window.AudioController) window.AudioController.playSuccess();

          // Update HUD
          const scoreEl = document.getElementById('game-hud-score-val');
          if (scoreEl) scoreEl.innerText = gameScore;

          // Check victory milestone (350+ pts)
          if (gameScore >= 350) {
            const vModal = document.getElementById('game-victory-modal');
            if (vModal) vModal.classList.add('active');
            if (window.AudioController) window.AudioController.playSuccess();
          }

          scene.remove(item);
          collectibles.splice(i, 1);
          spawnCollectible();
          continue;
        }

        // Passed player
        if (item.position.z > 8) {
          scene.remove(item);
          collectibles.splice(i, 1);
          spawnCollectible();
        }
      }

      // Move obstacles
      for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        obs.position.z += forwardVelocity;
        obs.rotation.x += 0.02;
        obs.rotation.z += 0.03;

        const dist = obs.position.distanceTo(new THREE.Vector3(playerPos.x, playerPos.y, 0));
        if (dist < 0.85) {
          // Hit hazard!
          triggerExplosion(obs.position, 0xff0044);
          gameShield = Math.max(0, gameShield - 25);
          const shieldBar = document.getElementById('game-shield-fill');
          if (shieldBar) shieldBar.style.width = gameShield + '%';

          if (window.AudioController) window.AudioController.playClick();

          scene.remove(obs);
          obstacles.splice(i, 1);
          spawnObstacle();
          continue;
        }

        if (obs.position.z > 8) {
          scene.remove(obs);
          obstacles.splice(i, 1);
          spawnObstacle();
        }
      }

      // Animate explosion particles
      for (let i = explosionParticles.length - 1; i >= 0; i--) {
        const pObj = explosionParticles[i];
        pObj.userData.life -= 0.04;
        pObj.material.opacity = pObj.userData.life;

        const posAttr = pObj.geometry.attributes.position;
        const vels = pObj.userData.velocities;
        for (let j = 0; j < vels.length; j++) {
          posAttr.array[j * 3] += vels[j].x;
          posAttr.array[j * 3 + 1] += vels[j].y;
          posAttr.array[j * 3 + 2] += vels[j].z;
        }
        posAttr.needsUpdate = true;

        if (pObj.userData.life <= 0) {
          scene.remove(pObj);
          pObj.geometry.dispose();
          pObj.material.dispose();
          explosionParticles.splice(i, 1);
        }
      }

      renderer.render(scene, camera);
      return;
    }

    // 3. Normal Portfolio 3D Mode
    camera.position.x = mouseX * 1.2;
    camera.position.y = -mouseY * 1.0;
    camera.position.z = 7;
    camera.lookAt(0, 0, 0);

    // 4. Background Starfield Orbit & Pulse
    if (particles) {
      particles.rotation.y = elapsedTime * 0.03 + mouseX * 0.2;
      particles.rotation.x = mouseY * 0.15;
      particles.position.z = Math.sin(elapsedTime * 0.5) * 0.5 + scrollSpeed * 2.0;
    }

    // 5. Dynamic Orbiting Point Lights
    if (light1) {
      light1.position.x = Math.sin(elapsedTime * 0.7) * 5;
      light1.position.z = Math.cos(elapsedTime * 0.7) * 5;
    }
    if (light2) {
      light2.position.x = Math.sin(-elapsedTime * 0.5) * 5;
      light2.position.y = Math.cos(elapsedTime * 0.6) * 4;
    }
    if (light3) {
      light3.position.y = Math.sin(elapsedTime * 1.2) * 4;
      light3.position.z = Math.cos(elapsedTime * 0.9) * 4;
    }

    // 6. Animate Active Central Mesh
    if (activeMeshGroup) {
      activeMeshGroup.rotation.y = elapsedTime * 0.25 + mouseX * 0.6;
      activeMeshGroup.rotation.x = Math.sin(elapsedTime * 0.2) * 0.2 + mouseY * 0.5;

      const outerCore = activeMeshGroup.getObjectByName('outerCore');
      if (outerCore) {
        outerCore.rotation.z = elapsedTime * 0.15;
        const scale = 1.0 + Math.sin(elapsedTime * 2.0) * 0.04;
        outerCore.scale.set(scale, scale, scale);
      }

      const innerCore = activeMeshGroup.getObjectByName('innerCore');
      if (innerCore) {
        innerCore.rotation.x = -elapsedTime * 0.4;
        innerCore.rotation.y = -elapsedTime * 0.3;
      }

      const ring1 = activeMeshGroup.getObjectByName('ring1');
      if (ring1) ring1.rotation.z = elapsedTime * 0.3;

      const ring2 = activeMeshGroup.getObjectByName('ring2');
      if (ring2) ring2.rotation.z = -elapsedTime * 0.25;

      const torusMesh = activeMeshGroup.getObjectByName('torusMesh');
      if (torusMesh) torusMesh.rotation.z = elapsedTime * 0.2;

      const torusWire = activeMeshGroup.getObjectByName('torusWire');
      if (torusWire) torusWire.rotation.z = -elapsedTime * 0.15;

      const neuralMesh = activeMeshGroup.getObjectByName('neuralMesh');
      if (neuralMesh) neuralMesh.rotation.y = elapsedTime * 0.1;
    }

    // 7. Anamorphic Pop-Out Hologram Animation
    if (holoPopoutGroup) {
      // Pop out along Z when Hero is hovered
      const targetPopZ = isHeroHovered ? 1.6 : -0.4;
      holoPopoutGroup.position.z += (targetPopZ - holoPopoutGroup.position.z) * 0.08;
      holoPopoutGroup.position.x = 1.4 + mouseX * 0.35;
      holoPopoutGroup.position.y = -mouseY * 0.35;

      const prism = holoPopoutGroup.getObjectByName('holoPrism');
      if (prism) {
        prism.rotation.y = elapsedTime * 0.6;
        prism.rotation.x = elapsedTime * 0.3;
      }

      const cage = holoPopoutGroup.getObjectByName('holoCage');
      if (cage) {
        cage.rotation.y = -elapsedTime * 0.4;
        cage.rotation.z = elapsedTime * 0.2;
      }

      // Orbiting glyphs
      for (let i = 0; i < 4; i++) {
        const glyph = holoPopoutGroup.getObjectByName('glyph' + i);
        if (glyph) {
          const angle = (i / 4) * Math.PI * 2 + elapsedTime * 0.8;
          glyph.position.set(Math.cos(angle) * 2.0, Math.sin(angle) * 2.0, Math.sin(elapsedTime * 2 + i) * 0.4);
          glyph.rotation.x = elapsedTime * 1.5;
          glyph.rotation.y = elapsedTime * 1.5;
        }
      }
    }

    renderer.render(scene, camera);
  }

  // Initialize once DOM is ready or Three.js is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThree);
  } else {
    initThree();
  }
})();
