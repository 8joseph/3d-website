import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { FilmPass } from 'three/addons/postprocessing/FilmPass.js';
import { Player } from './player.js'

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000000);

const renderer = new THREE.WebGLRenderer();

renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

const loader = new GLTFLoader();

const ambientLight = new THREE.AmbientLight(0xffffff, 2.0);
scene.add(ambientLight);

const hazeColor = new THREE.Color(0x001c42);

scene.fog = new THREE.FogExp2(hazeColor, 0.0004);
scene.background = hazeColor;


const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);
const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth / 4, window.innerHeight / 4),
    1.0,   // strength
    0.3,   // radius
    0.1  // threshold
);
composer.addPass(bloomPass);

const filmPass = new FilmPass();
composer.addPass(filmPass);


loader.load('models/city1.glb', function (gltf) {

    scene.add(gltf.scene);
    gltf.scene.scale.set(80, 80, 80);
});

//deltaaa 
let lastTime = 0;
let deltaTime = 0;



const player = new Player(camera, scene);

const movement = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    boost: false,
};



function animate(time) {
    //sort out delta time
    deltaTime = time - lastTime;
    lastTime = time;
    player.update(movement, deltaTime);

    composer.render();

}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
});


window.addEventListener("keydown", (event) => {
    switch (event.key.toLowerCase()) {
        case "w": movement.forward = true; break;
        case "s": movement.backward = true; break;
        case "a": movement.left = true; break;
        case "d": movement.right = true; break;
        case "shift": movement.boost = true; break;

    }
});

window.addEventListener("keyup", (event) => {
    switch (event.key.toLowerCase()) {
        case "w": movement.forward = false; break;
        case "s": movement.backward = false; break;
        case "a": movement.left = false; break;
        case "d": movement.right = false; break;
        case "shift": movement.boost = false; break;

    }
});