import * as THREE from 'three'
import {AnimationMixer, LoopOnce, LoopRepeat, Vector3} from 'three'
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js'

export class Player {
    constructor(scene, position = {x: 0, y: 0, z: 0}, velocity = {x: 0, y: 0, z: 0}, scale = 1) {
        this.scene = scene;
        this.scale = scale;

        this.position = new Vector3(position.x, position.y, position.z);
        this.velocity = velocity;
        this.gravity = -0.002
        this.zAcceleration = true

        this.width = 1
        this.height = 1
        this.depth = 1

        this.canJump = false

        this.lastFrameTime = performance.now()

        this.isAlive = false

        this.loadModel();
    }

    loadModel() {
        const loader = new GLTFLoader();

        loader.load("../models/player/scene.gltf", (gltf) => {
            this.model = gltf.scene;
            this.model.position.copy(this.position);
            this.model.scale.set(this.scale, this.scale, this.scale);
            this.model.rotation.set(0, Math.PI, 0);

            // const boundingBox = new THREE.Box3().setFromObject(this.model);


            if (gltf.animations && gltf.animations.length > 0) {
                this.mixer = new AnimationMixer(this.model);
                this.animations = gltf.animations;
                this.animation = this.mixer.clipAction(this.animations[4]);

                if (this.animation) {
                    this.animation.setLoop(LoopRepeat);
                    // this.animation.clampWhenFinished = true;
                    this.animation.play();
                }
            }

            this.scene.add(this.model);
        });
    }

    update(ground) {
        this.updateAnimation()

        this.model.position.copy(this.position)

        this.updateSides()

        if (this.zAcceleration) this.velocity.z += 0.0003

        this.position.x += this.velocity.x
        this.position.z += this.velocity.z

        this.applyGravity(ground)
    }

    updateAnimation() {
        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastFrameTime) / 1000;

        if (this.mixer) {
            if (this.velocity.z === 0) {
                this.mixer.update(deltaTime)
            } else if (this.velocity.z < 0) {
                this.mixer.update(deltaTime * 1.5)
            } else {
                this.mixer.update(deltaTime * (2 / 3))
            }
        }

        this.lastFrameTime = performance.now()
    }

    die() {
        this.isAlive = false;
        this.animation = this.mixer.clipAction(this.animations[2]);
        this.animation.setLoop(LoopOnce);
        this.animation.play();

    }

    updateSides() {
        this.right = this.position.x + this.width / 2
        this.left = this.position.x - this.width / 2

        this.bottom = this.position.y - this.height / 2
        this.top = this.position.y + this.height / 2

        this.front = this.position.z + this.depth / 2
        this.back = this.position.z - this.depth / 2
    }

    applyGravity(ground) {
        this.velocity.y += this.gravity

        if (this.collision(ground)) {
            const friction = 0.5
            this.velocity.y *= friction
            this.velocity.y = -this.velocity.y
            this.canJump = true
        } else this.position.y += this.velocity.y
    }

    collision(other) {
        const xCollision = this.right - 0.25 >= other.left && this.left + 0.25 <= other.right
        const yCollision =
            this.bottom + 0.5 + this.velocity.y <= other.top && this.top >= other.bottom
        const zCollision = this.front >= other.back && this.back <= other.front

        return xCollision && yCollision && zCollision
    }

    reset() {
        this.isAlive = true
        this.position.set(0, 0, 0);
        this.velocity.x = 0;
        this.velocity.y = -0.01;
        this.velocity.z = 0;
    }
}