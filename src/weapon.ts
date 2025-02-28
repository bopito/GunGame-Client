import * as BABYLON from "@babylonjs/core";

export class Weapon {
    id: string;
    name: string;
    bulletSpeed: number;
    damage: number;
    reloadTime: number;
    rateOfFire: number;
    range: number;
    maxAmmo: number; // Magazine capacity
    currentAmmo: number; // Bullets remaining in the current magazine
    reserveAmmo: number; // Total reserve bullets available
    mesh?: BABYLON.Mesh;

    constructor(
        id: string,
        name: string,
        damage: number,
        bulletSpeed: number,
        range: number,
        reloadTime: number,
        rateOfFire: number,
        maxAmmo: number,
        currentAmmo: number,
        reserveAmmo: number // Added reserve ammo field
    ) {
        this.id = id;
        this.name = name;
        this.damage = damage;
        this.bulletSpeed = bulletSpeed;
        this.range = range;
        this.reloadTime = reloadTime;
        this.rateOfFire = rateOfFire;
        this.maxAmmo = maxAmmo;
        this.currentAmmo = currentAmmo;
        this.reserveAmmo = reserveAmmo; // Initialize reserve ammo
    }

    /**
     * Update weapon state from server data.
     */
    updateWeaponState(newAmmo: number, newReserveAmmo: number) {
        this.currentAmmo = newAmmo;
        this.reserveAmmo = newReserveAmmo;
    }

    /**
     * 🔄 Reload the weapon (fills up the magazine from reserve ammo)
     */
    reload() {
        if (this.reserveAmmo <= 0) {
            console.warn(`[Weapon] ${this.name} cannot reload - no reserve ammo left!`);
            return;
        }

        const neededAmmo = this.maxAmmo - this.currentAmmo; // Bullets needed to fill the magazine

        if (this.reserveAmmo >= neededAmmo) {
            this.currentAmmo += neededAmmo;
            this.reserveAmmo -= neededAmmo;
        } else {
            this.currentAmmo += this.reserveAmmo;
            this.reserveAmmo = 0;
        }

        console.log(`[Weapon] ${this.name} reloaded: ${this.currentAmmo}/${this.reserveAmmo}`);
    }

    /**
     * 🔫 Fire a bullet from the weapon.
     */
    shoot() {
        if (this.currentAmmo > 0) {
            this.currentAmmo -= 1;
            console.log(`[Weapon] ${this.name} fired! Remaining ammo: ${this.currentAmmo}/${this.reserveAmmo}`);
        } else {
            console.warn(`[Weapon] No ammo left! Reload required.`);
        }
    }

    /**
     * Create weapon 3D model and attach it to the player.
     */
    attachToPlayer(scene: BABYLON.Scene, playerMesh: BABYLON.Mesh) {
        if (this.mesh) {
            this.mesh.dispose();
        }

        let weaponSize = { width: 1, height: 0.5, depth: 2 };
        let weaponOffset = { x: 0.5, y: 0.5, z: 1 };

        switch (this.name) {
            case "Pistol":
                weaponSize = { width: 2, height: 0.3, depth: 0.5 };
                weaponOffset = { x: 1.1, y: 0.4, z: 1 };
                break;
            case "Rifle":
                weaponSize = { width: 1.5, height: 0.5, depth: 3 };
                weaponOffset = { x: 0.7, y: 0.5, z: 1 };
                break;
            case "Sniper":
                weaponSize = { width: 1.5, height: 0.5, depth: 4 };
                weaponOffset = { x: 0.8, y: 0.6, z: 1 };
                break;
            case "Rocket Launcher":
                weaponSize = { width: 2, height: 0.7, depth: 4.5 };
                weaponOffset = { x: 1, y: 0.7, z: 1 };
                break;
            case "Knife":
                weaponSize = { width: 0.3, height: 0.3, depth: 1 };
                weaponOffset = { x: 0.5, y: 0.5, z: 1 };
                break;
        }

        this.mesh = BABYLON.MeshBuilder.CreateBox(`weapon_${this.name}`, weaponSize, scene);
        this.mesh.parent = playerMesh;
        this.mesh.position.set(weaponOffset.x, weaponOffset.y, weaponOffset.z);
        this.mesh.rotation.y = Math.PI / 2;
    }
}

export default Weapon;
