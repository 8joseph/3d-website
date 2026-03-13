import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class Player {
    lerp = (x, y, a) => {
        const safeA = Math.max(0, Math.min(1, a));
        return x * (1 - safeA) + y * safeA;
    };
    constructor(camera, scene) {
        this.camera = camera;
        this.scene = scene;
        this.container = new THREE.Group();
        this.container.position.set(0, 4000, 1000);
        this.scene.add(this.container);
        this.position = this.container.position;
        const loader = new GLTFLoader();
        this.model = null;
        loader.load('models/ship.glb', (gltf) => {
            this.model = gltf.scene;
            this.model.scale.set(100, 100, 100);
            this.container.add(this.model);
        });
        this.camOffset = new THREE.Vector3(0, 100, -500);

        this.noBoostSpeed = 0;
        this.boostSpeed = 20;
        this.moveSpeed = this.noBoostSpeed;

        this.pitchVelocity = 0;
        this.rollVelocity = 0
        this.forwardVelocity = 0;

    }

    getTargetVelocities(movement) {
        const turnSpeed = THREE.MathUtils.degToRad(0.6);
        const sideTurnSpeed = THREE.MathUtils.degToRad(0.6);

        let targetPitch = 0;
        let targetRoll = 0;
        let targetForward = 0;

        if (movement.forward) targetPitch = turnSpeed;
        if (movement.backward) targetPitch = -turnSpeed;
        if (movement.left) targetRoll = -sideTurnSpeed;
        if (movement.right) targetRoll = sideTurnSpeed;

        if (movement.boost) {
            targetForward = this.boostSpeed;
        } else {
            targetForward = this.noBoostSpeed;
        }

        return { targetPitch, targetRoll, targetForward };
    }


    update(movement, delta) {
        const { targetPitch, targetRoll, targetForward } = this.getTargetVelocities(movement);

        this.pitchVelocity = this.lerp(this.pitchVelocity, targetPitch, delta * 0.005);
        this.rollVelocity = this.lerp(this.rollVelocity, targetRoll, delta * 0.01);

        this.container.rotateX(this.pitchVelocity);
        this.container.rotateZ(this.rollVelocity);

        this.camera.lookAt(this.position);

        this.forwardVelocity = this.lerp(this.forwardVelocity, targetForward, delta * 0.003)
        this.container.translateZ(this.forwardVelocity);

        const idealCameraPos = this.camOffset.clone();
        this.container.localToWorld(idealCameraPos);

        this.camera.position.copy(idealCameraPos);

        const shipUp = new THREE.Vector3(0, 1, 0);
        shipUp.applyQuaternion(this.container.quaternion);
        this.camera.up.copy(shipUp);
        this.camera.lookAt(this.position);
    }
}


