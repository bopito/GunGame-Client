import * as BABYLON from "@babylonjs/core";
import { Weapon } from "./Weapon";

export class Player {
    id: string;
    x: number;
    y: number;
    z: number;
    angle: number;
    team: number;
    health: number;
    score: number;
    currentWeapon: Weapon;
    mesh?: BABYLON.Mesh;

    constructor(
        id: string,
        x: number,
        y: number,
        z: number,
        angle: number,
        team: number,
        health: number,
        score: number,
        weapon: Weapon
    ) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.z = z;
        this.angle = angle;
        this.team = team;
        this.health = health;
        this.score = score;
        this.currentWeapon = weapon;
    }

    updateData(x: number, y: number, z: number, angle: number, health: number, score: number) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.angle = angle;
        this.health = health;
        this.score = score;
    }

    decreaseHealth(amount: number): void {
        //
    }
    increaseHealth(amount: number): void {
        //
    }

    updateWeaponAmmo(newAmmo: number, newReserveAmmo: number) {
        this.currentWeapon.updateWeaponState(newAmmo, newReserveAmmo);
    }

    updateWeapon(newWeapon: Weapon, scene: BABYLON.Scene) {
        this.currentWeapon = newWeapon;
        if (this.mesh) {
            this.currentWeapon.attachToPlayer(scene, this.mesh);
        }
    }
}

export default Player;
