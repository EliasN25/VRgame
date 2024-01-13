import * as THREE from 'three'
import {AnimationMixer, LoopRepeat} from 'three'
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js'

export class Player {
    constructor(scene, position = {x: 0, y: -1.75, z: 0}, velocity = {x: 0, y: 0, z: 0}, scale = 1) {
        this.scene = scene;
        this.position = position;
        this.velocity = velocity;
        this.scale = scale;

        this.loadModel();
    }

    loadModel() {
        const loader = new GLTFLoader();

        loader.load("../models/player/scene.gltf", (gltf) => {
            this.model = gltf.scene;
            this.model.position.copy(this.position);
            this.model.scale.set(this.scale, this.scale, this.scale);
            this.model.rotation.set(0, Math.PI, 0);

            if (gltf.animations && gltf.animations.length > 0) {
                this.mixer = new AnimationMixer(this.model);
                this.animations = gltf.animations;

                // You can play a specific animation by index
                const animationIndex = 4;
                const animation = this.mixer.clipAction(this.animations[animationIndex]);

                if (animation) {
                    animation.setLoop(LoopRepeat);
                    animation.play();
                }
            }

            this.scene.add(this.model);
        });
    }

    update() {
        if (this.mixer) {
            this.mixer.update(0.0167); // Pass the elapsed time since the last frame
        }
    }
}