import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";

export class Player {
    id: string;
    x: number;
    y: number;
    angle: number;
    team: number;
    health: number;
    score: number;
    mesh?: BABYLON.Mesh; // Attach Babylon.js Mesh to the player

    constructor(id: string, x: number, y: number, angle: number, team: number, health: number, score: number) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.team = team;
        this.health = health;
        this.score = score;
    }

    takeDamage(amount: number): void {
        this.health = Math.max(0, this.health - amount); // Prevent negative health
    }

    isAlive(): boolean {
        return this.health > 0;
    }
}

export default Player;
