import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";
import { GameGUI } from "./gui.ts";
import { Player } from "./player.ts";

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
    const players: Record<string, Player> = {};


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

    // Create Fixed Camera (45-degree Angle)
    const camera = new BABYLON.FollowCamera("FixedCamera", new BABYLON.Vector3(0, 80, -80), scene);
    camera.rotation.set(Math.PI / 4, 0, 0); // 45-degree downward angle
    camera.attachControl()

    // Lighting
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.8;

    // Create Ground (500x500)
    const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 500, height: 500 }, scene);
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
    

    

    // Handle WebSocket Messages
    function handleWebSocketMessage(event: MessageEvent): void {
        const data = JSON.parse(event.data);

        // Step 1: Assign player ID when received from the server
        if (data.type === "assign_id") {
            playerId = data.playerId;
            console.log(`Assigned Player ID: ${playerId}`);
        }

        // Step 2: Process all players
        if (data.players) {
            const serverPlayers = Object.values(data.players) as Player[];

            for (const playerData of serverPlayers) {

                // Add New players
                if (!players[playerData.id]) {
                    console.log(`Creating new player: ${playerData.id}`);
                    // Instantiate an instance of Player
                    const newPlayer = new Player(
                        playerData.id,
                        playerData.x,
                        playerData.y,
                        playerData.angle,
                        playerData.team,
                        playerData.health,
                        playerData.score
                    );
                    // Create 3D object
                    const newPlayerMesh = BABYLON.MeshBuilder.CreateBox(`player_${playerData.id}`, { size: 2 }, scene);
                    newPlayerMesh.position.set(playerData.x, 1, -playerData.y);
                    newPlayer.mesh = newPlayerMesh;
                    players[playerData.id] = newPlayer;
                }

                // Update position & rotation
                players[playerData.id].x = playerData.x;
                players[playerData.id].y = playerData.y;
                players[playerData.id].angle = playerData.angle;
                players[playerData.id].health = playerData.health;
                players[playerData.id].score = playerData.score;

                // Update mesh position
                if (players[playerData.id].mesh) {
                    players[playerData.id].mesh!.position.set(playerData.x, 1, -playerData.y);
                    players[playerData.id].mesh!.rotation.y = playerData.angle;
                }

                // Update GUI Player List
                gui.updatePlayer(playerData.id, playerData.x, playerData.y, playerData.health, playerData.score);
            }

            // Only update camera if the player exists
            if (players[playerId]?.mesh) {
                updateCamera(players[playerId].mesh!);
            }
        }
    }

    
    
    

    // Handle Player Input
    const keys: Record<string, boolean> = {};
    scene.onKeyboardObservable.add((kbInfo) => {
        const key = kbInfo.event.key.toLowerCase();
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
    });

    function sendMovementUpdate(): void {
        if (!isWebSocketConnected || playerId === null) return;
        socket.send(JSON.stringify({ action: "move", keys }));
    }

    function updateCamera(playerMesh: BABYLON.Mesh): void {
        if (!playerMesh) return;
    
        camera.position.x += (playerMesh.position.x - camera.position.x); // * 0.9; // smooth
        camera.position.z += (playerMesh.position.z - camera.position.z - 40);
        camera.position.y = 40;
        camera.rotation.set(Math.PI / 4, 0, 0);
    }
    

    engine.runRenderLoop(() => {
        try {
            scene.render();
        } catch (error) {
            //console.error("Error in render loop:", error);
        }
    });

    window.addEventListener("resize", () => {
        engine.resize();
    });
});
