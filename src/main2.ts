import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";
import { GameGUI } from "./gui.ts";

document.addEventListener("DOMContentLoaded", async () => {
    const isLocalhost: boolean = window.location.hostname === "localhost";
    const assetBasePath: string = isLocalhost ? "/" : "/GunGame-Client/";
    const SERVER_URL: string = isLocalhost
        ? "ws://localhost:6969/game"
        : "wss://your-server.com/game";

    let socket: WebSocket;
    let isWebSocketConnected: boolean = false;
    let playerId: string | null = null;
    const messageQueue: string[] = [];
    const players: Record<string, BABYLON.Mesh> = {};
    console.log(Object.keys(players).length);

    // connect to server
    // server create new player
    // server send player.id --> but only to the client that just joined
    // client set player.id

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
    const camera = new BABYLON.FreeCamera("FixedCamera", new BABYLON.Vector3(0, 80, -80), scene);
    camera.rotation.set(Math.PI / 4, 0, 0); // 45-degree downward angle
    camera.attachControl(canvas, false);

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
    function handleWebSocketMessage(event: MessageEvent): void {
        const data = JSON.parse(event.data);
    
        // Step 1: Assign player ID when received from server
        if (data.type === "assign_id") {
            playerId = data.playerId;
            console.log(`Assigned Player ID: ${playerId}`);
            return;
        }
    
        // Step 2: Process all players
        if (data.players) {
            // Get the list of player IDs currently received from the server
            const serverPlayerIds = new Set(Object.keys(data.players));
        
            for (const id in data.players) {
                const { x, y, angle } = data.players[id];
        
                if (!players[id]) {
                    console.log(`Creating new player: ${id}`);
        
                    // Create a cube player
                    const newPlayerMesh = BABYLON.MeshBuilder.CreateBox(`player_${id}`, { size: 2 }, scene);
                    newPlayerMesh.position.set(x, 1, -y);
        
                    // Store the player
                    players[id] = newPlayerMesh;
                }
        
                // Update position & rotation every time
                players[id].position.set(x, 1, -y);
                players[id].rotation.y = angle;
        
                // Update GUI Player List
                gui.updatePlayer(id, x, y);

            }
        
            // **Remove Disconnected Players** (if they're not in the server data anymore)
            for (const id in players) {
                if (!serverPlayerIds.has(id)) {
                    console.log(`Removing player: ${id}`);
        
                    // Remove from scene
                    players[id].dispose();
                    delete players[id];
        
                    // Remove from GUI
                    gui.removePlayer(id);
                }
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

    function updateCamera(): void {
        
        if (!playerId  ) return; // Ensure playerId is valid
        if (Object.keys(players).length !== 0 ) return; // Ensure playerId is valid
        const player = players[0]; // Get the correct player from the server
        console.log("test:" + players[0]);
        
    
        camera.position.x = player.position.x;
        camera.position.z = player.position.z - 40;
        camera.position.y = 40;
    
        camera.rotation.set(Math.PI / 4, 0, 0);
    }

    engine.runRenderLoop(() => {
        try {
            updateCamera();
            scene.render();
        } catch (error) {
            console.error("❌ Error in render loop:", error);
        }
    });

    window.addEventListener("resize", () => {
        engine.resize();
    });
});
