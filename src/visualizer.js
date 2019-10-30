import * as THREE from "three";
import OrbitControls from "three-orbitcontrols";

let camera, controls, scene, light, renderer, geometry, material, mesh, audio;
let uniforms, group, planeGeometry, planeMaterial, plane, plane2;
let teardown = false;

export function init() {
  teardown = false;
  scene = new THREE.Scene();

  // camera
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 100;
  camera.lookAt(scene.position);
  controls = new OrbitControls(camera);
  controls.autoRotate = true;
  controls.enabled = false;
  controls.update();

  // scene
  scene.fog = new THREE.Fog( 0x000000, 1, 1000 );
  scene.add( new THREE.AmbientLight( 0x222222 ) );

  // light
  light = new THREE.DirectionalLight( 0xffffff );
	light.position.set( 1, 1, 1 );
  scene.add( light );

  // plane
  planeGeometry = new THREE.PlaneGeometry(800, 800, 20, 20);
  planeMaterial = new THREE.MeshLambertMaterial({
      color: 0xb19cd9,
      side: THREE.DoubleSide,
      wireframe: true
  });

  plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.rotation.x = -0.5 * Math.PI;
  plane.position.set(0, 40, 0);

  plane2 = new THREE.Mesh(planeGeometry, planeMaterial);
  plane2.rotation.x = -0.5 * Math.PI;
  plane2.position.set(0, -40, 0);

  // uniforms
  uniforms = {
      scale: { type: "f", value: 30.0 },
      displacement: { type: "f", value: 300.0}
  };

  // shader components / material
  material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    color: 0xb7ff00,
    wireframe: true
  });

  // mesh
  geometry = new THREE.SphereBufferGeometry( 8, 10, 10 );
  mesh = new THREE.Mesh(geometry, material);

  // renderer
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  group = new THREE.Group();
  group.add(plane);
  group.add(plane2);
  group.add(mesh);

  scene.add(group);
  scene.add(camera);

  return renderer.domElement;
}

export function renderLoop() {
  if (!teardown) {
    requestAnimationFrame(renderLoop);
  }
  // Work with audio here
  mesh.rotation.x += 0.01;
  mesh.rotation.y += 0.02;
  controls.update();
  renderer.render(scene, camera);
}

export function setAudio(audioNode) {
  audio = audioNode;
}

export function reset() {
  teardown = true;
}
