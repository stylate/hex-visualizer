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
  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight);
}

function initScene() {
  scene = new THREE.Scene();
  scene.fog = new THREE.Fog( 0x000000, 1, 1000 );
}

function initCamera() {
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 100;
  camera.lookAt(scene.position);
  camera.add(listener);
  controls = new OrbitControls(camera);
  controls.autoRotate = true;
  controls.enabled = false;
  controls.update();
}

function initGroup() {
  scene.add(plane);
  scene.add(plane2);
  scene.add(camera);
}

function initLight() {
  scene.add( new THREE.AmbientLight( 0x222222 ) );
  light = new THREE.DirectionalLight( 0x590D82, 0.5 );
  light.position.set( 200, 300, 400 );
  scene.add(light);

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
  geometry = new THREE.SphereBufferGeometry(1, 256, 256);
  loader = new THREE.TextureLoader();
  loader.load(noise, 
    (t) => {
      texture = t;
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      material = new THREE.ShaderMaterial({ 
      uniforms: {
        freq: { type: "f", value: 0.0},
        time: { type: "f", value: 0.0},
        opacity: { type: "f", value: 0.1},
        perlin: { type: "t", value: texture },
      },
      wireframe: true,
      transparent: true,
      depthTest: false,
      vertexShader: `
        uniform sampler2D perlin;
        uniform float freq;
        uniform float time;
        varying vec2 vUv;
  
        void main() {
          vUv = uv;
          vec4 color = texture2D(perlin, uv); // get texture's UV coordinate
          vec4 color_shift = texture2D(perlin, vec2(color.r, color.b) + time * freq); // update color based on audio
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position + color_shift.rgb, 1.0); // convert position
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        uniform sampler2D perlin;
        uniform float freq;
        uniform float time;
        uniform float opacity;
  
        void main() {
          vec2 uv = vUv;
          vec4 color = texture2D(perlin, uv + time * freq);
          gl_FragColor = vec4(vec3(color), opacity); 
        }
      `
      });
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.x -= 30;
    mesh.scale.set(20, 20, 20);
    scene.add(mesh);
  }, undefined, function (err) {
    console.log(err);
  });
}

export function render() {
  if (!teardown) {
    requestAnimationFrame(render);
  }
  // console.log(mesh);
  // analysis - make vertices spike?
  data = analyser.getAverageFrequency();
  console.log(data);

  // standard update
  mesh.material.uniforms['time'].value += 0.00001;

  // differentiate frequencies. needs more fine tuning (only accurate for more "hard-hitting" songs).
  // project extension: instead of average frequency, separate by bass, treble, etc.!
  console.log(data)
  if (data === 0) {
    mesh.material.uniforms['freq'].value = 0.1;
    mesh.material.uniforms['opacity'].value = 0.1;
  } else if (data < 30) {
    mesh.material.uniforms['opacity'].value = 0.1;
    mesh.material.uniforms['freq'].value = data / 2500;
  } else if (data < 50) {
    mesh.material.uniforms['opacity'].value = data / 5000;
    mesh.material.uniforms['freq'].value = data / 1500;
  } else if (data < 70) {
    mesh.material.uniforms['opacity'].value = data / 2500;
    mesh.material.uniforms['freq'].value = data / 700;
  } else if (data < 90) {
    mesh.material.uniforms['opacity'].value = data / 1700;
    mesh.material.uniforms['freq'].value = data / 300;
  } else if (data < 110) {
    mesh.material.uniforms['opacity'].value = data / 1000;
    mesh.material.uniforms['freq'].value = data / 100;
  } else {
    mesh.material.uniforms['opacity'].value = data / 600;
    mesh.material.uniforms['freq'].value = data / 25;
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
  })
  analyser = new THREE.AudioAnalyser(sound, 512);
}

function resize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

export function reset() {
  teardown = true;
}