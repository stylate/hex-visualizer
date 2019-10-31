import * as THREE from "three";
import OrbitControls from "three-orbitcontrols";

let camera, controls, scene, light, light2, renderer, audio;

// texture
let texture, geometry, material, mesh;

let group, planeGeometry, planeMaterial, plane, plane2;
// audio
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

  window.addEventListener('resize', resize);
  return renderer.domElement;
}

function initRenderer() {
  renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight);
  // renderer.setClearColor(0xededed);
}

function initScene() {
  scene = new THREE.Scene();
  scene.fog = new THREE.Fog( 0x000000, 1, 1000 );
}

function initCamera() {
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
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
  var directionalLight = new THREE.DirectionalLight(0xffffff, .7);
  directionalLight.position.set(1, -1, 0).normalize();
  directionalLight.castShadow = true;
  var ambientLight = new THREE.AmbientLight(0xffffff);
  
  scene.add(ambientLight);
  scene.add(directionalLight);
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

  geometry = new THREE.SphereBufferGeometry(1, 256, 256);

  // load texture
  texture = new THREE.TextureLoader().load('assets/rgb_noise.png');
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

  material = new THREE.ShaderMaterial({
    uniforms: {
      freq: { type: "f", value: 0.0},
      time: { type: "f", value: 0.0},
      speed: { type: "f", value: 0.0},
      opacity: { type: "f", value: 0.1},
      perlin: { type: "t", value: texture },
    },
    wireframe: true,

    transparent: true,
    depthTest: false,
    vertexShader: `
      uniform sampler2D perlin;
      uniform float freq;
      uniform float opacity;
      varying vec2 vUv;

      void main() {
        vUv = uv;
        vec4 color = texture2D(perlin, uv); // get texture's UV coordinate
        vec4 color2 = texture2D(perlin, vec2(color.r, color.b) + freq); // update color based on audio
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position + color.rgb, 1.0); // convert position
      }
    `,
    fragmentShader: `
      uniform sampler2D perlin;
      uniform float freq;
      uniform float opacity;
      varying vec2 vUv;

      void main() {
        vec4 color = texture2D(perlin, vUv + freq);
        gl_FragColor = vec4(vec3(color), opacity); 
      }
    `
  })

  // mesh
  mesh = new THREE.Mesh(geometry, material);
  mesh.scale.set(25, 25, 25);
}

export function render() {
  if (!teardown) {
    requestAnimationFrame(render);
  }
  // analysis - make vertices spike?
  data = analyser.getAverageFrequency();
  console.log(data);

  // standard update
  mesh.material.uniforms['time'].value += 0.02;

  // differentiate frequencies
  if (data < 90) {
    mesh.material.uniforms['opacity'].value = 0.05;
    mesh.material.uniforms['freq'].value = data * 0.00000025;
  } else if (data < 130) {
    mesh.material.uniforms['freq'].value = data * 0.00000025;
    mesh.material.uniforms['opacity'].value = data / 500;
  } else {
    mesh.material.uniforms['freq'].value = data * 0.00000025;
    mesh.material.uniforms['opacity'].value = data / 200;
  }
  
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
    sound.play();
  })
  analyser = new THREE.AudioAnalyser(sound, 32);
}

function resize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

export function reset() {
  teardown = true;
}