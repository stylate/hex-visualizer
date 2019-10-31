import * as THREE from "three";
import OrbitControls from "three-orbitcontrols";

/* three.js */
let camera, controls, scene, light, light2, renderer, geometry, material, mesh, audio;
let uniforms, group, planeGeometry, planeMaterial, plane, plane2;
let noise;
let listener, sound, analyser, data, loader;



let teardown = false;

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

  return renderer.domElement;
}

function initRenderer() {
  renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight);
  renderer.setClearColor(0xededed);
}

function initScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0xc8a2c8 );
  scene.fog = new THREE.Fog( 0x000000, 1, 1000 );
}

function initCamera() {
  camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 100;
  camera.lookAt(scene.position);
  camera.add(listener);
  controls = new OrbitControls(camera);
  controls.autoRotate = true;
  controls.enabled = false;
  controls.update();
}

function initGroup() {
  group = new THREE.Group();
  group.add(plane);
  group.add(plane2);
  group.add(mesh);

  scene.add(group);
  scene.add(camera);
}

function initLight() {
  scene.add( new THREE.AmbientLight( 0x222222 ) );
  light = new THREE.DirectionalLight( 0x590D82, 0.5 );
  light.position.set( 200, 300, 400 );
  scene.add( light );

  light2 = light.clone();
  light2.position.set( -200, 300, 400 );
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

function initMesh() {
  // uniforms
  uniforms = {
      scale: { type: "f", value: 30.0 },
      displacement: { type: "f", value: 300.0}
  };

  // shader components / material
  material = new THREE.MeshPhongMaterial({
    emissive: 0xffc2cd,
    emissiveIntensity: 0.4,
    shininess: 0
  });

  // mesh
  geometry = new THREE.IcosahedronGeometry( 10, 5 );
  for (var i = 0; i < geometry.vertices.length; i++) {
    var vector = geometry.vertices[i];
    vector._o = vector.clone();
  }
  mesh = new THREE.Mesh(geometry, material);
}

export function render() {
  if (!teardown) {
    requestAnimationFrame(render);
  }
  // Work with audio here
  // data = analyser.getAverageFrequency();
  

  mesh.rotation.x += 0.01;
  mesh.rotation.y += 0.02;
  // mesh.rotation.z += 0.01;
  controls.update();
  renderer.render(scene, camera);
}

export function setAudio(audioNode) {
  audio = audioNode;
  initAudio(audio);
}

function initAudio(audio) {
  loader = new THREE.AudioLoader();
  sound = new THREE.Audio(listener);
  loader.load(audio.src, function(buffer) {
    sound.setBuffer(buffer);
    // sound.setRefDistance(20);
    sound.play();
  })
  analyser = new THREE.AudioAnalyser(sound, 32);
  
}

function vibrate() {
}

export function reset() {
  teardown = true;
}
