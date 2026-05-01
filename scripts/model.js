import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let scene, camera, renderer, isWireframe, clock, controls;
let loadedModel, mixer, actions, secondModelMixer, secondModelActions;

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    clock = new THREE.Clock();
    const container = document.querySelector(".model-container");
    const width = container.clientWidth;
    const height = container.clientHeight || 400;

    camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(-5, 0, -2);

    const canvas = document.getElementById("model-canvas");
    renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas });
    renderer.setPixelRatio(window.devicePixelRatio);
    // Make the canvas fill the container element responsively
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';

    const ambient = new THREE.HemisphereLight(0xffffbb, 0x808020, 10);
    scene.add(ambient);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.3;

    controls.target.set(0, 0, 0);
    controls.update();

    loadModel("models/ships/tie-fighter.glb");
    window.addEventListener('resize', onResize, false);
    onResize();
    update();
}


function update() {
    requestAnimationFrame(update);
    controls.update();
    renderer.render(scene, camera);
    const time = clock.getElapsedTime();
    const delta = Math.sin(time) * 5;
}

function onResize() {
    const canvas = document.getElementById("model-canvas")
    canvas.style.display = 'none';
    const container = document.querySelector('.model-container');
    const width = container ? container.clientWidth : window.innerWidth;
    const height = container ? container.clientHeight || 400 : window.innerHeight;
    canvas.style.display = 'block';


    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
}

function loadModel(path) {
    if (loadedModel) {
        scene.remove(loadedModel);
    }
    const loader = new GLTFLoader();
    const assetPath = './';

    loader.load(assetPath + path, function (gltf) {
        const model = gltf.scene;
        model.position.set(0, 0, 0);
        scene.add(model);
        loadedModel = model;
        mixer = new THREE.AnimationMixer(model);
        const animations = gltf.animations;
        actions = [];
        animations.forEach(clip => {
            const action = mixer.clipAction(clip);
            action.loop = THREE.LoopOnce;
            action.clampWhenFinished = true;
            actions.push(action);
        })
    });
}

// Initialize the viewer when the page loads
init();
