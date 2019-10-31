import * as THREE from "three";
import OrbitControls from "three-orbitcontrols";

/* three.js */
let camera, controls, scene, light, renderer, geometry, material, mesh, audio;
let uniforms, group, planeGeometry, planeMaterial, plane, plane2;
let teardown = false;

/* webaudio api */
let audioContext, gainNode, boost, isMuted, source;
let analyser, bufferLength, dataArray;

export function init() {
  teardown = false;

  // scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0xc8a2c8 );
  scene.fog = new THREE.Fog( 0x000000, 1, 1000 );
  // scene.add( new THREE.AmbientLight( 0x222222 ) );

  // light
  light = new THREE.DirectionalLight( 0xffffff );
  light.position.set( 1, 1, 1 );
  scene.add( light );

  // camera
  camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 100;
  camera.lookAt(scene.position);
  controls = new OrbitControls(camera);
  controls.autoRotate = true;
  controls.enabled = false;
  controls.update();

  // plane
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

  // uniforms
  uniforms = {
      scale: { type: "f", value: 30.0 },
      displacement: { type: "f", value: 300.0}
  };

  // shader components / material
  material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    color: 0xfff7e4,
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
  // mesh.rotation.z += 0.01;
  controls.update();
  renderer.render(scene, camera);
}

export function setAudio(audioNode) {
  audio = audioNode;
  // initialization
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  isMuted = false;
  boost = 0;
  
  // create js node
  audio.crossOrigin = "anonymous";
  source = audioContext.createMediaElementSource(audio);
  source.connect(audioContext.destination);
  
  // analyser
  analyser = audioContext.createAnalyser();
  analyser.smoothingTimeConstant = 0.3;
  analyser.fftSize = 512;
  bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);
  
  // gainNode
  gainNode = audioContext.createGain();
  gainNode.gain.value = 1;
  
  // connections
  source.connect(analyser);
  analyser.connect(audioContext.destination);
  analyser.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  source.mediaElement.play();
}

export function reset() {
  teardown = true;
}
