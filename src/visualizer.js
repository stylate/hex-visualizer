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

function initAudio(audio) {
  /* YOUR CODE HERE */
}

export function init() {
  teardown = false;
  listener = new THREE.AudioListener();
  scene = new THREE.Scene();
  initRenderer();
  initCamera();
  initLight();
  initPlane();
  initMesh();
  initGroup();

  window.addEventListener("resize", resize);
  return renderer.domElement;
}

function initRenderer() {
  /* YOUR CODE HERE */
}

function initGroup() {
  /* YOUR CODE HERE */
}

function initLight() {
  /* YOUR CODE HERE */
}

function initPlane() {
  /* YOUR CODE HERE */
}

export function render() {
  /* YOUR CODE HERE */
}

export function setAudio(audioNode) {
  audio = audioNode;
  initAudio(audio);
}

/* Resizes the camera and renderer along with browser width + height changes. */
function resize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

/* Stops rendering the canvas. */
export function reset() {
  teardown = true;
}
