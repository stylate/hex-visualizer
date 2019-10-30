import * as THREE from "three";

let camera, scene, renderer, geometry, material, mesh, audio;
let teardown = false;

export function init() {
  teardown = false;
  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.01,
    10
  );
  camera.position.z = 1;

  scene = new THREE.Scene();

  geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
  material = new THREE.MeshNormalMaterial();

  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);

  return renderer.domElement;
}

export function renderLoop() {
  if (!teardown) {
    requestAnimationFrame(renderLoop);
  }
  // Work with audio here
  mesh.rotation.x += 0.01;
  mesh.rotation.y += 0.02;
  renderer.render(scene, camera);
}

export function setAudio(audioNode) {
  audio = audioNode;
}

export function reset() {
  teardown = true;
}
