import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

const canvas = document.getElementById("webgl-stage");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isHome = location.pathname === "/" || location.pathname === "/index.html";

if (canvas && !reduceMotion) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance"
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(46, innerWidth / innerHeight, 0.1, 100);
  camera.position.set(0, 0.2, 11);

  const world = new THREE.Group();
  world.position.x = isHome ? 2.75 : 4.2;
  scene.add(world);

  const colors = {
    cyan: new THREE.Color("#66ffe3"),
    blue: new THREE.Color("#6f8dff"),
    white: new THREE.Color("#dffcff"),
    dark: new THREE.Color("#0b1220")
  };

  const coreGeo = new THREE.IcosahedronGeometry(2.25, 5);
  const coreMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uA: { value: colors.cyan },
      uB: { value: colors.blue }
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vPos;
      uniform float uTime;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec3 p = position;
        float wave = sin(p.y * 3.2 + uTime * 1.2) * 0.05
                   + sin(p.x * 4.0 - uTime * 0.9) * 0.035;
        p += normal * wave;
        vPos = p;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      varying vec3 vPos;
      uniform vec3 uA;
      uniform vec3 uB;
      void main() {
        float fresnel = pow(1.0 - abs(dot(normalize(vNormal), vec3(0.0,0.0,1.0))), 2.2);
        float bands = 0.5 + 0.5 * sin(vPos.y * 4.5 + vPos.x * 2.0);
        vec3 col = mix(uB, uA, bands);
        float alpha = 0.055 + fresnel * 0.38;
        gl_FragColor = vec4(col, alpha);
      }
    `
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  world.add(core);

  const edgeGeo = new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(2.35, 2));
  const edgeMat = new THREE.LineBasicMaterial({
    color: colors.cyan,
    transparent: true,
    opacity: 0.23,
    blending: THREE.AdditiveBlending
  });
  const shell = new THREE.LineSegments(edgeGeo, edgeMat);
  world.add(shell);

  const knot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(3.05, 0.018, 280, 14, 2, 3),
    new THREE.MeshBasicMaterial({
      color: colors.blue,
      transparent: true,
      opacity: 0.34,
      blending: THREE.AdditiveBlending
    })
  );
  knot.rotation.x = 0.85;
  knot.rotation.y = -0.2;
  world.add(knot);

  const ringGroup = new THREE.Group();
  [
    [3.55, 0.014, 0.12, colors.cyan],
    [4.0, 0.01, -0.42, colors.blue],
    [4.45, 0.008, 0.72, colors.white]
  ].forEach(([radius, tube, tilt, color], i) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(radius, tube, 8, 220),
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: i === 0 ? 0.28 : 0.15,
        blending: THREE.AdditiveBlending
      })
    );
    ring.rotation.x = Math.PI / 2 + tilt;
    ring.rotation.z = tilt * 0.8;
    ringGroup.add(ring);
  });
  world.add(ringGroup);

  const nodeCount = 180;
  const nodePositions = new Float32Array(nodeCount * 3);
  for (let i = 0; i < nodeCount; i++) {
    const r = 2.7 + Math.random() * 1.3;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    nodePositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    nodePositions[i * 3 + 1] = r * Math.cos(phi);
    nodePositions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }
  const nodeGeo = new THREE.BufferGeometry();
  nodeGeo.setAttribute("position", new THREE.BufferAttribute(nodePositions, 3));
  const nodes = new THREE.Points(
    nodeGeo,
    new THREE.PointsMaterial({
      color: colors.white,
      size: 0.035,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.72,
      blending: THREE.AdditiveBlending
    })
  );
  world.add(nodes);

  const links = [];
  for (let i = 0; i < nodeCount; i += 3) {
    const ax = nodePositions[i * 3];
    const ay = nodePositions[i * 3 + 1];
    const az = nodePositions[i * 3 + 2];
    let nearest = -1;
    let nearestD = 2.0;
    for (let j = i + 1; j < nodeCount; j++) {
      const bx = nodePositions[j * 3];
      const by = nodePositions[j * 3 + 1];
      const bz = nodePositions[j * 3 + 2];
      const d = Math.hypot(ax - bx, ay - by, az - bz);
      if (d < nearestD) {
        nearestD = d;
        nearest = j;
      }
    }
    if (nearest >= 0) {
      links.push(
        ax, ay, az,
        nodePositions[nearest * 3],
        nodePositions[nearest * 3 + 1],
        nodePositions[nearest * 3 + 2]
      );
    }
  }
  const linkGeo = new THREE.BufferGeometry();
  linkGeo.setAttribute("position", new THREE.Float32BufferAttribute(links, 3));
  const linkMesh = new THREE.LineSegments(
    linkGeo,
    new THREE.LineBasicMaterial({
      color: colors.cyan,
      transparent: true,
      opacity: 0.11,
      blending: THREE.AdditiveBlending
    })
  );
  world.add(linkMesh);

  const starCount = innerWidth < 700 ? 520 : 1100;
  const starPositions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    starPositions[i * 3] = (Math.random() - 0.5) * 34;
    starPositions[i * 3 + 1] = (Math.random() - 0.5) * 22;
    starPositions[i * 3 + 2] = -4 - Math.random() * 24;
  }
  const starsGeo = new THREE.BufferGeometry();
  starsGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
  const stars = new THREE.Points(
    starsGeo,
    new THREE.PointsMaterial({
      color: colors.blue,
      size: 0.028,
      transparent: true,
      opacity: 0.48,
      blending: THREE.AdditiveBlending
    })
  );
  scene.add(stars);

  const grid = new THREE.GridHelper(34, 34, 0x314a74, 0x182133);
  grid.position.set(0, -4.35, -4);
  grid.material.transparent = true;
  grid.material.opacity = 0.2;
  scene.add(grid);

  const satellites = new THREE.Group();
  const satGeo = new THREE.OctahedronGeometry(0.12, 0);
  for (let i = 0; i < 14; i++) {
    const sat = new THREE.Mesh(
      satGeo,
      new THREE.MeshBasicMaterial({
        color: i % 3 === 0 ? colors.cyan : colors.blue,
        wireframe: true,
        transparent: true,
        opacity: 0.55
      })
    );
    const a = (i / 14) * Math.PI * 2;
    const r = 4.7 + (i % 4) * 0.32;
    sat.position.set(Math.cos(a) * r, Math.sin(a * 1.4) * 1.8, Math.sin(a) * r * 0.42);
    sat.userData.phase = a;
    satellites.add(sat);
  }
  world.add(satellites);

  const mouse = { x: 0, y: 0 };
  const target = { x: 0, y: 0 };
  addEventListener("pointermove", (e) => {
    target.x = (e.clientX / innerWidth - 0.5) * 2;
    target.y = (e.clientY / innerHeight - 0.5) * 2;
  }, { passive: true });

  let scrollNorm = 0;
  const onScroll = () => {
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    scrollNorm = scrollY / max;
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const clock = new THREE.Clock();
  const tick = () => {
    const t = clock.getElapsedTime();
    mouse.x += (target.x - mouse.x) * 0.035;
    mouse.y += (target.y - mouse.y) * 0.035;

    coreMat.uniforms.uTime.value = t;
    core.rotation.y = t * 0.07;
    core.rotation.x = Math.sin(t * 0.23) * 0.16;
    shell.rotation.y = -t * 0.055;
    shell.rotation.z = t * 0.03;
    knot.rotation.z = t * 0.045;
    ringGroup.rotation.y = t * 0.025;
    ringGroup.rotation.z = Math.sin(t * 0.12) * 0.18;
    nodes.rotation.y = t * 0.025;
    linkMesh.rotation.y = t * 0.025;
    satellites.rotation.y = -t * 0.04;
    satellites.children.forEach((sat, i) => {
      sat.rotation.x = t * 0.4 + i;
      sat.rotation.y = t * 0.28;
      sat.position.y += Math.sin(t * 0.7 + sat.userData.phase) * 0.0009;
    });

    world.rotation.y += ((mouse.x * 0.16 + scrollNorm * 0.72) - world.rotation.y) * 0.025;
    world.rotation.x += ((-mouse.y * 0.1 + scrollNorm * 0.22) - world.rotation.x) * 0.025;
    world.position.y = (0.35 - scrollNorm * 2.4) + mouse.y * 0.15;
    world.position.x += ((isHome ? 2.75 : 4.2) + mouse.x * 0.22 - world.position.x) * 0.025;

    camera.position.x += (mouse.x * 0.3 - camera.position.x) * 0.02;
    camera.position.y += ((0.2 - mouse.y * 0.18) - camera.position.y) * 0.02;
    camera.position.z = 11 + scrollNorm * 1.4;
    camera.lookAt(0, -scrollNorm * 0.6, 0);

    stars.rotation.y = t * 0.0025;
    grid.position.z = -4 + ((scrollNorm * 8) % 1);

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  };
  tick();

  addEventListener("resize", () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setSize(innerWidth, innerHeight);
  });
} else if (canvas) {
  canvas.style.display = "none";
}
