import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";

export class Player {
    id: string;
    x: number;
    y: number;
    z: number;
    angle: number;
    team: number;
    health: number;
    score: number;
    mesh?: BABYLON.Mesh; // Attach Babylon.js Mesh to the player

    constructor(id: string, x: number, y: number, z: number, angle: number, team: number, health: number, score: number) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.z = z;
        this.angle = angle;
        this.team = team;
        this.health = health;
        this.score = score;
    }
    

    decreaseHealth(amount: number): void {
        //
    }
    increaseHealth(amount: number): void {
       //
    }

}

export default Player;
