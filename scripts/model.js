import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { FilmPass } from 'three/addons/postprocessing/FilmPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';



let scene, camera, renderer, clock, controls, composer;
let loadedModel, mixer, actions, secondModelMixer, secondModelActions;
let isWireframe = false;
let useEffects = true;
let lastTime = 0, deltaTime = 0;
let models = ["models/ships/tie-fighter.glb", "models/ships/spacejet.glb"]
let cur_model = 0;
let flyingOut = false, flyingIn = false, flightProgress = 0, flightSpeed = 0.8;

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


    const textureLoader = new THREE.TextureLoader();
    //hdri from https://svs.gsfc.nasa.gov/3895
    textureLoader.load("assets/starmap_g8k.jpg", (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        texture.colorSpace = THREE.SRGBColorSpace;

        scene.background = texture;
        scene.environment = texture;

    });

    composer = new EffectComposer(renderer);
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

    const time = clock.getElapsedTime();
    const delta = time - lastTime;
    lastTime = time;

    //switch model flight stuff
    if (loadedModel) {
        if (flyingOut) {
            flightProgress += delta * flightSpeed;
            let t = Math.min(flightProgress, 1.0);
            loadedModel.position.x = lerp(0, -20, t);
            loadedModel.scale.lerpVectors(new THREE.Vector3(1, 1, 1), new THREE.Vector3(0, 0, 0), t);
            if (t >= 1.0) {

                cur_model += 1
                if (cur_model >= models.length) {
                    cur_model = 0;
                }
                loadModel(models[cur_model]);
                flyingOut = false;
                flyingIn = true;
                flightProgress = 0;
                loadedModel.position.x = 20;
            }
        }
        if (flyingIn) {
            flightProgress += delta * flightSpeed;
            let t = Math.min(flightProgress, 1.0);
            loadedModel.position.x = lerp(20, 0, t);
            loadedModel.scale.lerpVectors(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 1, 1), t);

            if (t >= 1.0) {
                flyingIn = false;
                flightProgress = 0;
                loadedModel.position.x = 0;
            }
        }

    }

    //render the scene
    useEffects ? composer.render() : renderer.render(scene, camera);

}

function lerp(x, y, a) {
    const safeA = Math.max(0, Math.min(1, a));
    return x * (1 - safeA) + y * safeA;

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
    composer.setSize(width, height);
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


const wireframeButton = document.getElementById("wireframe-btn");
wireframeButton.addEventListener('click', function () {
    isWireframe = !isWireframe;
    toggleWireframe(isWireframe);
});

function toggleWireframe(b) {
    scene.traverse(function (object) {
        if (object.isMesh) {
            object.material.wireframe = b;
        }
    });
}


const rotateButton = document.getElementById("rotate-btn");
rotateButton.addEventListener('click', function () {
    if (loadedModel) {
        const axis = new THREE.Vector3(0, 1, 0);
        const angle = Math.PI / 8;
        loadedModel.rotateOnAxis(axis, angle);
    }
})


const effectsButton = document.getElementById("effects-btn");
effectsButton.addEventListener('click', function () {
    useEffects = !useEffects;
})

const switchButton = document.getElementById("switch-btn");
switchButton.addEventListener('click', function () {
    if (!flyingIn && !flyingOut) {
        doSwithModel();

    }
})


function doSwithModel() {
    flyingOut = true;
}


init();