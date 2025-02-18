import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";

export class Projectile {
    id: string;
    x: number;
    y: number;
    z: number;
    angle: number;
    team: number;
    mesh?: BABYLON.Mesh; // Attach Babylon.js Mesh to the player

    constructor(id: string, x: number, y: number, z: number, angle: number, team: number) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.z = z;
        this.angle = angle;
        this.team = team;
    }
    

    newFunction(parameter: string): void {
        //
        parameter = "hello";
    }

}

export default Projectile;
