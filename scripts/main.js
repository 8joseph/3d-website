import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Player } from './player.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);
//const controls = new OrbitControls(camera, renderer.domElement);

const loader = new GLTFLoader();

const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
scene.add(ambientLight);
loader.load('models/city.glb', function (gltf) { scene.add(gltf.scene) });

const player = new Player(camera, scene);

const movement = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    boost: false,
};


function animate(time) {
    player.update(movement);
    //controls.update();
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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