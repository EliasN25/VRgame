import * as THREE from "three";

export class Box extends THREE.Mesh {
    constructor({
                    width,
                    height,
                    depth,
                    color,
                    velocity = {
                        x: 0,
                        y: 0,
                        z: 0
                    },
                    position = {
                        x: 0,
                        y: 0,
                        z: 0
                    },
                    zAcceleration = false
                }) {
        super(
            new THREE.BoxGeometry(width, height, depth),
            new THREE.MeshStandardMaterial({color})
        )

        this.width = width
        this.height = height
        this.depth = depth
        this.canJump = false

        this.position.set(position.x, position.y, position.z)

        this.right = this.position.x + this.width / 2
        this.left = this.position.x - this.width / 2

        this.bottom = this.position.y - this.height / 2
        this.top = this.position.y + this.height / 2

        this.front = this.position.z + this.depth / 2
        this.back = this.position.z - this.depth / 2

        this.velocity = velocity
        this.gravity = -0.002

        this.zAcceleration = zAcceleration
    }

    updateSides() {
        this.right = this.position.x + this.width / 2
        this.left = this.position.x - this.width / 2

        this.bottom = this.position.y - this.height / 2
        this.top = this.position.y + this.height / 2

        this.front = this.position.z + this.depth / 2
        this.back = this.position.z - this.depth / 2
    }

    update(ground) {
        this.updateSides()

        if (this.zAcceleration) this.velocity.z += 0.0003

        this.position.x += this.velocity.x
        this.position.z += this.velocity.z

        this.applyGravity(ground)
    }

    applyGravity(ground) {
        this.velocity.y += this.gravity

        // GROUND COLLISION
        if (
            (this.collision(ground))
        ) {
            const friction = 0.5
            this.velocity.y *= friction
            this.velocity.y = -this.velocity.y
            this.canJump = true
        } else this.position.y += this.velocity.y
    }

    collision(other) {
        const xCollision = this.right >= other.left && this.left <= other.right
        const yCollision =
            this.bottom + this.velocity.y <= other.top && this.top >= other.bottom
        const zCollision = this.front >= other.back && this.back <= other.front

        return xCollision && yCollision && zCollision
    }
}