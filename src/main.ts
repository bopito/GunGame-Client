import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";
import { GameGUI } from "./gui.ts";
import player, { Player } from "./player.ts";
import { Weapon } from "./weapon.ts";

document.addEventListener("DOMContentLoaded", async () => {

    //
    // WebSocket
    //
    const isLocalhost: boolean = window.location.hostname === "localhost";
    const assetBasePath: string = isLocalhost ? "/" : "/GunGame-Client/";
    const SERVER_URL: string = isLocalhost
        ? "ws://localhost:6969/game"
        : "wss://your-server.com/game";

    let socket: WebSocket;
    let isWebSocketConnected: boolean = false;
    const messageQueue: string[] = [];

    //
    // Entities
    //
    let playerId: string = "undefined";
    var localPlayers: Record<string, Player> = {};


    // Get canvas element
    const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
    if (!canvas) {
        throw new Error("Canvas element with id 'gameCanvas' not found.");
    }

    // Create Babylon.js Engine and Scene
    const engine = new BABYLON.Engine(canvas, true);
    const scene = new BABYLON.Scene(engine);

    // Initialize GUI
    const gui = new GameGUI();

    //
    // Camera
    //
    const camera = new BABYLON.FreeCamera("FixedCamera", new BABYLON.Vector3(0, 40, -40), scene);
    camera.setTarget(new BABYLON.Vector3(0, 0, 0)); // Look at the center of the map
    camera.rotation.set(Math.PI / 4, 0, 0); // 45-degree downward angle
    camera.inputs.clear(); // Removes all default controls
    camera.checkCollisions = false;
    camera.applyGravity = false;
    camera.attachControl(canvas, false);


    // Lighting
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.8;

    // Create Ground
    const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 100, height: 100 }, scene);
    const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
    groundMaterial.diffuseTexture = new BABYLON.Texture(`${assetBasePath}assets/grass_background.png`, scene);
    ground.material = groundMaterial;


    // WebSocket Connection
    function connectWebSocket(): void {
        socket = new WebSocket(SERVER_URL);

        socket.onopen = () => {
            console.log("WebSocket connected!");
            isWebSocketConnected = true;

            while (messageQueue.length > 0) {
                socket.send(messageQueue.shift()!);
            }
        };

        socket.onerror = (error) => console.error("WebSocket error:", error);

        socket.onclose = () => {
            console.warn("WebSocket closed! Reconnecting...");
            isWebSocketConnected = false;
            setTimeout(connectWebSocket, 3000);
        };

        socket.onmessage = handleWebSocketMessage;
    }

    connectWebSocket();

    // Handle WebSocket Messages
    function handleWebSocketMessage(event: MessageEvent): void {
        const data = JSON.parse(event.data);

        // Assign Local Player an ID
        if (data.type === "assign_id") {
            playerId = data.playerId;
            console.log(`Assigned Player ID: ${playerId}`);
        }

        // Step 2: Process all players
        if (data.type === "broadcast") {
            const serverPlayers = Object.values(data.entities.players) as player[];
            const serverPlayerIds = new Set(serverPlayers.map(player => player.id));

            for (const playerData of serverPlayers) {
                // Remove disconnected players
                for (const id in localPlayers) {
                    if (!serverPlayerIds.has(id)) {
                        console.log(`Removing player not in server state: ${id}`);
                        if (localPlayers[id]) {
                            localPlayers[id].mesh!.dispose();
                            delete localPlayers[id];
                            gui.removePlayer(id);
                        }
                    }
                }

                // Add New players
                if (!localPlayers[playerData.id]) {
                    console.log(`Creating new player: ${playerData.id}`);
                    // create new weapon object from server data
                    const newWeapon = new Weapon(
                        playerData.currentWeapon.id,
                        playerData.currentWeapon.name,
                        playerData.currentWeapon.damage,
                        playerData.currentWeapon.bulletSpeed,
                        playerData.currentWeapon.range,
                        playerData.currentWeapon.reloadTime,
                        playerData.currentWeapon.rateOfFire,
                        playerData.currentWeapon.maxAmmo,
                        playerData.currentWeapon.currentAmmo,
                        playerData.currentWeapon.reserveAmmo
                    );

                    const newPlayer = new Player(
                        playerData.id,
                        playerData.x,
                        playerData.y,
                        playerData.z,
                        playerData.angle,
                        playerData.team,
                        playerData.health,
                        playerData.score,
                        newWeapon
                    );

                    const newPlayerMesh = BABYLON.MeshBuilder.CreateBox(`player_${playerData.id}`, { size: 2 }, scene);
                    newPlayerMesh.position.set(playerData.x, 1, -playerData.z);
                    newPlayer.mesh = newPlayerMesh;

                    newPlayer.currentWeapon.attachToPlayer(scene, newPlayer.mesh);
                    localPlayers[playerData.id] = newPlayer;
                } else {
                    let player = localPlayers[playerData.id];
                    player.updateData(playerData.x, playerData.y, playerData.z, playerData.angle, playerData.health, playerData.score);

                    // update weapon data
                    player.updateWeaponAmmo(
                        playerData.currentWeapon.currentAmmo,
                        playerData.currentWeapon.reserveAmmo
                    );
                    player.updateWeapon(
                        new Weapon(
                            playerData.currentWeapon.id,
                            playerData.currentWeapon.name,
                            playerData.currentWeapon.damage,
                            playerData.currentWeapon.bulletSpeed,
                            playerData.currentWeapon.range,
                            playerData.currentWeapon.reloadTime,
                            playerData.currentWeapon.rateOfFire,
                            playerData.currentWeapon.maxAmmo,
                            playerData.currentWeapon.currentAmmo,
                            playerData.currentWeapon.reserveAmmo,
                        ),
                        scene
                    );

                    if (player.mesh) {
                        player.mesh.position.set(playerData.x, 1, -playerData.z);
                        player.mesh.rotation.y = playerData.angle;
                    }
                }
            }

            // Only update camera if the player exists
            if (localPlayers[playerId]?.mesh) {
                updateCamera(localPlayers[playerId].mesh!);
            }
        }
    }

    // Handle player inputs
    const keys: Record<string, boolean> = {};
    scene.onKeyboardObservable.add((kbInfo) => {
        const key = kbInfo.event.key.toLowerCase();
        console.log("test");
        // Movement keys
        if (["a", "w", "s", "d"].includes(key)) {
            if (kbInfo.type === BABYLON.KeyboardEventTypes.KEYDOWN) {
                keys[key] = true;
                sendMovementUpdate();
            }
            if (kbInfo.type === BABYLON.KeyboardEventTypes.KEYUP) {
                keys[key] = false;
                sendMovementUpdate();
            }
        }

        // Reload action (R key)
        if (key === "r" && kbInfo.type === BABYLON.KeyboardEventTypes.KEYDOWN) {
            console.log("Reloading weapon...");

            // Send 'reload' action to the server
            if (isWebSocketConnected && playerId !== "undefined") {
                socket.send(JSON.stringify({
                    action: "reload",
                    playerId: playerId
                }));
            }
        }
    });

    //
    // Send Keys to Server
    //
    function sendMovementUpdate(): void {
        if (!isWebSocketConnected || playerId === "undefined") return;
        socket.send(JSON.stringify({ action: "move", keys }));
    }

    //
    // Detect Cursor Movement in Scene
    //
    scene.onPointerMove = (evt) => {
        //console.log("Pointer moved:", evt.clientX, evt.clientY);

        if (!localPlayers[playerId]) {
            //console.warn("Player data not found for local player:", playerId);
            return;
        }

        // Manually cast a ray
        const pickResult = scene.pick(scene.pointerX, scene.pointerY);

        if (pickResult?.hit) {
            //console.log("Raycast hit:", pickResult.pickedMesh?.name);

            const player = localPlayers[playerId];
            const mousePosition = pickResult.pickedPoint;

            if (mousePosition) {
                const playerPos = player.mesh!.position;

                // Calculate angle between player and cursor
                const dx = mousePosition.x - playerPos.x;
                const dz = mousePosition.z - playerPos.z;
                const targetAngle = Math.atan2(dx, dz);

                // Rotate player smoothly
                player.mesh!.rotation.y = targetAngle;

                sendRotationUpdate(targetAngle);
            }
        } else {
            //console.warn("Raycast did NOT hit any object.");
        }
    };

    //
    // Send Player y-Rotation to Server
    //
    function sendRotationUpdate(angle: number) {
        if (!isWebSocketConnected || playerId === "undefined") return;
        socket.send(JSON.stringify({
            action: "rotate",
            angle: angle
        }));
    }

    //
    // Capture Mouse-Click Event in Scene
    //
    scene.onPointerDown = function (event, pickResult) {
        // Left Click (Shoot)
        if (event.button == 0) {
            const vector = pickResult.pickedPoint;
            if (vector) {
                console.log(`Left mouse click (shoot) at: ${vector.x}, ${vector.y}, ${vector.z}`);

                // Send 'shoot' action to the server
                if (isWebSocketConnected && playerId !== "undefined") {
                    socket.send(JSON.stringify({
                        action: "shoot",
                        playerId: playerId
                    }));
                }
            }
        }

        // Right Click (Reserved for future use)
        if (event.button == 2) {
            console.log("Right mouse click detected (No action assigned).");
        }
    };


    //
    // Send Mouse Event to Server
    //
    function sendMouseUpdate(angle: number) {
        if (!isWebSocketConnected || playerId === "undefined") return;
        socket.send(JSON.stringify({
            action: "mouseEvent",
            angle: angle
        }));
    }

    function updateCamera(playerMesh: BABYLON.Mesh): void {
        if (!playerMesh) return;

        camera.position.x += (playerMesh.position.x - camera.position.x); // * 0.9; // smooth
        camera.position.z += (playerMesh.position.z - camera.position.z - 40);
        camera.position.y = 40;
        camera.rotation.set(Math.PI / 4, 0, 0);
    }

    /**
     * Handles player state updates (HP, Ammo, Weapon Name)
     */
    function handlePlayerUpdate(playerData: any) {
        if (localPlayers[playerData.id]) {
            const player = localPlayers[playerData.id];
            player.health = playerData.health;
            if (playerData.currentWeapon) {
                player.currentWeapon.name = playerData.currentWeapon.name;
                player.currentWeapon.currentAmmo = playerData.currentWeapon.currentAmmo;
                player.currentWeapon.reserveAmmo = playerData.currentWeapon.reserveAmmo;
            }
            gui.updateHUD(player); //
        }
    }


    engine.runRenderLoop(() => {
        try {
            if (localPlayers[playerId]) {
                gui.updateHUD(localPlayers[playerId]);
            }
            scene.render();
        } catch (error) {
            //console.error("Error in render loop:", error);
        }
    });

    window.addEventListener("resize", () => {
        engine.resize();
    });
});
