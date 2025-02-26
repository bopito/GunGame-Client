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
    

    

    // Handle WebSocket Messages
    function handleWebSocketMessage(event: MessageEvent): void {
        const data = JSON.parse(event.data);

        // Assign Local Player an ID
        if (data.type === "assign_id") {
            playerId = data.playerId;
            console.log(`Assigned Player ID: ${playerId}`);
        }

        // Remove Disconnected Players
        // if (data.type === "player_removed") {
        //     const disconnectedPlayerID = data.playerID;
        //     delete localPlayers.disconnectedPlayerID;
        //     console.log(`Removed Player: ${playerId}`);
        // }

        // Step 2: Process all players
        if (data.entities) {
            const serverPlayers = Object.values(data.entities.players) as Player[];
            const serverPlayerIds = new Set(serverPlayers.map(player => player.id));
            
            for (const playerData of serverPlayers) {
                // Remove disconnected players
                for (const id in localPlayers) {
                    if (!serverPlayerIds.has(id)) {
                        console.log(`Removing player not in server state: ${id}`);
                        if(localPlayers[id]) {
                            localPlayers[id].mesh!.dispose(); // Remove from Babylon.js
                            delete localPlayers[id];
                            gui.removePlayer(id);
                        }
                    }
                }

                // Add New players
                if (!localPlayers[playerData.id]) {
                    console.log(`Creating new player: ${playerData.id}`);
                    // Instantiate an instance of Player
                    const newPlayer = playerData;
                    
                    // Create 3D object
                    const newPlayerMesh = BABYLON.MeshBuilder.CreateBox(`player_${playerData.id}`, { size: 2 }, scene);
                    newPlayerMesh.position.set(playerData.x, 1, -playerData.z);
                    newPlayer.mesh = newPlayerMesh;
                    localPlayers[playerData.id] = newPlayer;

                    console.log(newPlayer);
                    
                }

                // Update position & rotation
                localPlayers[playerData.id].x = playerData.x;
                localPlayers[playerData.id].z = playerData.z;
                localPlayers[playerData.id].angle = playerData.angle;
                localPlayers[playerData.id].health = playerData.health;
                localPlayers[playerData.id].score = playerData.score;

                // Update mesh position
                if (localPlayers[playerData.id].mesh) {
                    localPlayers[playerData.id].mesh!.position.set(playerData.x, 1, -playerData.z);
                    localPlayers[playerData.id].mesh!.rotation.y = playerData.angle;
                }

                // Update GUI Player List
                gui.updatePlayer(playerData);
            }

            // Only update camera if the player exists
            if (localPlayers[playerId]?.mesh) {
                updateCamera(localPlayers[playerId].mesh!);
            }
        }
    }

    
    //
    // Handle Player Input
    //
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
    scene.onPointerDown = function (event, pickResult){
        // Left Click
        if(event.button == 0){
                const vector = pickResult.pickedPoint;
                if (vector) {
                    console.log('left mouse click: ' + vector.x + ',' + vector.y + ',' + vector.z );
                }
        }
        // Right Click
        if(event.button == 2){
                
        }
    }

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
