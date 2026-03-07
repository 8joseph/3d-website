import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class Player {
    constructor(camera, scene) {
        this.camera = camera;
        this.scene = scene;
        this.container = new THREE.Group();
        this.container.position.set(0, 100, 200);
        this.scene.add(this.container);
        this.position = this.container.position;
        const loader = new GLTFLoader();
        this.model = null;
        loader.load('models/ship.glb', (gltf) => {
            this.model = gltf.scene;
            this.model.scale.set(30, 30, 30);
            this.container.add(this.model);
        });
        this.camOffset = new THREE.Vector3(0, 100, -500);

        this.noBoostSpeed = 8;
        this.boostSpeed = 19;
        this.moveSpeed = this.noBoostSpeed;

    }

    processInput(movement) {
        const turnSpeed = THREE.MathUtils.degToRad(2);

        if (movement.forward) { this.container.rotateX(+turnSpeed); }
        if (movement.backward) { this.container.rotateX(-turnSpeed); }

        if (movement.left) {
            this.container.rotateZ(-turnSpeed)
        }
        if (movement.right) {
            this.container.rotateZ(turnSpeed)
        }

        if (movement.boost) { this.moveSpeed = this.boostSpeed; } else { this.moveSpeed = this.noBoostSpeed; }
        console.log(this.moveSpeed);
    }

    update(movement) {
        this.camera.lookAt(this.position);

        this.processInput(movement);
        this.container.translateZ(this.moveSpeed);

        const idealCameraPos = this.camOffset.clone();
        this.container.localToWorld(idealCameraPos);

        this.camera.position.copy(idealCameraPos);

        const shipUp = new THREE.Vector3(0, 1, 0);
        shipUp.applyQuaternion(this.container.quaternion);
        this.camera.up.copy(shipUp);
        this.camera.lookAt(this.position);
    }



}


