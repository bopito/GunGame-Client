import * as BABYLON from "@babylonjs/core";

/**
 * Represents a bullet in the game.
 */
export class Bullet {
    private scene: BABYLON.Scene;
    private bulletMesh: BABYLON.Mesh;
    private direction: BABYLON.Vector3;
    private speed: number;
    private range: number;
    private traveledDistance: number = 0;
    private isActive: boolean = true;

    constructor(scene: BABYLON.Scene, startPosition: BABYLON.Vector3, direction: BABYLON.Vector3, speed: number, range: number) {
        this.scene = scene;
        this.speed = speed;
        this.range = range;

        // 🔹 Increase bullet size for better visibility
        this.bulletMesh = BABYLON.MeshBuilder.CreateSphere("bullet", { diameter: 0.5 }, scene);
        this.bulletMesh.position.copyFrom(startPosition);
        this.bulletMesh.material = this.createBulletMaterial(scene);

        // Normalize direction
        this.direction = direction.normalize();
    }

    /**
     * Creates a glowing material for the bullet.
     */
    private createBulletMaterial(scene: BABYLON.Scene): BABYLON.StandardMaterial {
        const bulletMaterial = new BABYLON.StandardMaterial("bulletMaterial", scene);
        bulletMaterial.diffuseColor = new BABYLON.Color3(1, 0.8, 0); // 🔥 Bright orange color
        bulletMaterial.emissiveColor = new BABYLON.Color3(1, 0.5, 0); // 🔥 Glow effect
        return bulletMaterial;
    }

    /**
     * Updates bullet movement.
     */
    public update(deltaTime: number): void {
        if (!this.isActive) return;

        // Move bullet forward
        const movement = this.direction.scale(this.speed * deltaTime);
        this.bulletMesh.position.addInPlace(movement);

        // Track traveled distance
        this.traveledDistance += movement.length();

        // Check if bullet reached max range
        if (this.traveledDistance >= this.range) {
            this.dispose();
        }
    }

    /**
     * Removes the bullet from the scene.
     */
    public dispose(): void {
        this.isActive = false;
        this.bulletMesh.dispose();
    }

    /**
     * Checks if the bullet is still active.
     */
    public isBulletActive(): boolean {
        return this.isActive;
    }
}
