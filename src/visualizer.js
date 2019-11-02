import * as THREE from "three";
import OrbitControls from "three-orbitcontrols";
import noise from "./assets/rgb_noise.png";

var camera, controls, scene, light, light2, renderer, audio;

// texture
var texture, loader, geometry, material, mesh;

var planeGeometry, planeMaterial, plane, plane2;
// audio
var listener, sound, analyser, data, audioLoader;

var teardown = false;

function initCamera() {
  /* YOUR CODE HERE */
}

function initMesh() {
  /* YOUR CODE HERE */
}

export function init() {
  teardown = false;
  listener = new THREE.AudioListener();
  initRenderer();
  initScene();
  initCamera();
  initLight();
  initPlane();
  initMesh();
  initGroup();

  window.addEventListener("resize", resize);
  return renderer.domElement;
}

function initRenderer() {
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function initScene() {
  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x000000, 1, 1000);
}

function initGroup() {
  scene.add(plane);
  scene.add(plane2);
  scene.add(camera);
}

function initLight() {
  scene.add(new THREE.AmbientLight(0x222222));
  light = new THREE.DirectionalLight(0x590d82, 0.5);
  light.position.set(200, 300, 400);
  scene.add(light);

  light2 = light.clone();
  light2.position.set(-200, 300, 400);
  scene.add(light2);

  var pointLight = new THREE.PointLight(0xffffff);
  pointLight.position.set(0, 0, 0);
  scene.add(pointLight);
}

function initPlane() {
  planeGeometry = new THREE.PlaneGeometry(800, 800, 20, 20);
  planeMaterial = new THREE.MeshLambertMaterial({
    side: THREE.DoubleSide,
    wireframe: true
  });

  plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.rotation.x = -0.5 * Math.PI;
  plane.position.set(0, 40, 0);

  plane2 = new THREE.Mesh(planeGeometry, planeMaterial);
  plane2.rotation.x = -0.5 * Math.PI;
  plane2.position.set(0, -40, 0);
}

export function render() {
  if (!teardown) {
    requestAnimationFrame(render);
  }
  // console.log(mesh);
  // analysis - make vertices spike?
  data = analyser.getAverageFrequency();

  // standard update
  mesh.material.uniforms["time"].value += 0.00001;

  // differentiate frequencies. needs more fine tuning (only accurate for more "hard-hitting" songs).
  // project extension: instead of average frequency, separate by bass, treble, etc.!
  console.log(data);
  if (data === 0) {
    mesh.material.uniforms["freq"].value = 0.1;
    mesh.material.uniforms["opacity"].value = 0.1;
  } else if (data < 30) {
    mesh.material.uniforms["opacity"].value = 0.1;
    mesh.material.uniforms["freq"].value = data / 2500;
  } else if (data < 60) {
    mesh.material.uniforms["opacity"].value = data / 5000;
    mesh.material.uniforms["freq"].value = data / 1500;
  } else if (data < 90) {
    mesh.material.uniforms["opacity"].value = data / 1700;
    mesh.material.uniforms["freq"].value = data / 300;
  } else {
    mesh.material.uniforms["opacity"].value = data / 600;
    mesh.material.uniforms["freq"].value = data / 25;
  }
  controls.update();
  renderer.render(scene, camera);
}

export function setAudio(audioNode) {
  audio = audioNode;
  initAudio(audio);
}

function initAudio(audio) {
  audioLoader = new THREE.AudioLoader();
  sound = new THREE.Audio(listener);
  audioLoader.load(audio.src, function(buffer) {
    sound.setBuffer(buffer);
    sound.play();
  });
  analyser = new THREE.AudioAnalyser(sound, 2048);
}

function resize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

export function reset() {
  teardown = true;
}
