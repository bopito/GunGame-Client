import * as BABYLON from "@babylonjs/core";
import { Weapon } from "./weapon";

export class Box {
    public mesh: BABYLON.Mesh;
    public hp: number;
    public weapon: Weapon;
    public labelPlane: BABYLON.Mesh;

    constructor(scene: BABYLON.Scene, x: number, z: number, weapon: Weapon, hp: number = 100) {
        this.hp = hp;
        this.weapon = weapon;

        // ✅ Create box
        this.mesh = BABYLON.MeshBuilder.CreateBox(`box_${x}_${z}`, { size: 2 }, scene);
        this.mesh.position.set(x, 1, -z);

        // ✅ Set material
        const boxMaterial = new BABYLON.StandardMaterial(`boxMaterial_${x}_${z}`, scene);
        boxMaterial.diffuseColor = new BABYLON.Color3(1, 0.5, 0);
        this.mesh.material = boxMaterial;

        // ✅ Create label plane above the box
        this.labelPlane = BABYLON.MeshBuilder.CreatePlane(`label_${x}_${z}`, { width: 4, height: 2 }, scene);
        this.labelPlane.position.set(x, 5, -z);
        this.labelPlane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;

        console.log(`[Box] Created at (${x}, ${z}) with ${weapon.name}, HP: ${hp}`);
    }

    // ✅ Reduce HP when the box is damaged
    takeDamage(damage: number): void {
        this.hp -= damage;
        console.log(`[Box] Damaged! Remaining HP: ${this.hp}`);

        if (this.hp <= 0) {
            this.destroy();
        }
    }

    // ✅ Destroy box and remove from scene
    destroy(): void {
        this.mesh.dispose();
        this.labelPlane.dispose();
        console.log(`[Box] Destroyed at (${this.mesh.position.x}, ${this.mesh.position.z})`);
    }
}
