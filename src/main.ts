import { Application, Assets, Sprite, TilingSprite, Container, Text, TextStyle } from "pixi.js";

(async () => {
    const isLocalhost = window.location.hostname === "localhost";
    const assetBasePath = isLocalhost ? "/" : "/GunGame-Client/";
    const SERVER_URL = isLocalhost 
        ? "ws://localhost:6969/game" 
        : "wss://your-server.com/game";  

    let socket: WebSocket;
    let isWebSocketConnected = false;
    let playerId: string | null = null; // Store the player's ID
    const messageQueue: string[] = [];
    const players: Record<string, Sprite> = {};

    // Initialize PixiJS 8
    const app = new Application();
    await app.init({ background: "#1099ab", resizeTo: window });
    document.getElementById("pixi-container")?.appendChild(app.canvas);

    // Create a Camera Container (for moving world instead of player)
    const camera = new Container();
    app.stage.addChild(camera);

    // Load Background as TilingSprite
    const bgTexture = await Assets.load(`${assetBasePath}assets/grass_background.png`);
    const background = new TilingSprite(bgTexture, app.screen.width * 2, app.screen.height * 2);
    camera.addChild(background); // Add to camera

    // Load Player Sprite
    const playerTexture = await Assets.load(`${assetBasePath}assets/fluff.png`);

    // Store Reference to Player's Sprite (Set when WebSocket confirms)
    let player: Sprite | null = null;
    let playerInfo: Text | null = null;

    // Handle WebSocket Connection
    function connectWebSocket() {
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
            console.warn("⚠️ WebSocket closed! Attempting to reconnect...");
            isWebSocketConnected = false;
            setTimeout(connectWebSocket, 3000);
        };

        socket.onmessage = handleWebSocketMessage;
    }

    connectWebSocket(); //Start the WebSocket connection

    // Handle Incoming WebSocket Messages
    function handleWebSocketMessage(event: MessageEvent) {
        const data = JSON.parse(event.data);

        for (const id in data.players) {
            if (!players[id]) {
                const newPlayer = new Sprite(playerTexture);
                newPlayer.anchor.set(0.5);
                newPlayer.width = 100;
                newPlayer.height = 100;
                newPlayer.position.set(data.players[id].x, data.players[id].y);
                //newPlayer.tint = data.players[id].team === 1 ? 0xff0000 : 0x0000ff;

                camera.addChild(newPlayer); // Add new players to camera
                players[id] = newPlayer;

                // If this is our player's ID, set it as the main player
                if (playerId === null) {
                    playerId = id;
                    player = newPlayer;
                    
                    // Display Player Info
                    playerInfo = new Text(
                        `ID: ${playerId}\nTeam: ${data.players[id].team}`,
                        new TextStyle({ fill: "white", fontSize: 16 })
                    );
                    playerInfo.x = player.x + 20;
                    playerInfo.y = player.y - 20;
                    camera.addChild(playerInfo);
                }
            }

            // Update position & rotation for all players
            players[id].position.set(data.players[id].x, data.players[id].y);
            players[id].rotation = data.players[id].angle;
        }
    }

    // Handle Player Input
    const keys: Record<string, boolean> = {}; 
    let mouseX = 0;
    let mouseY = 0;

    document.addEventListener("keydown", (event) => {
        const key = event.key.toLowerCase();
        if (["a", "w", "s", "d"].includes(key) && !keys[key]) {
            keys[key] = true;
            sendMovementUpdate();
        }
    });

    document.addEventListener("keyup", (event) => {
        const key = event.key.toLowerCase();
        if (["a", "w", "s", "d"].includes(key)) {
            keys[key] = false;
            sendMovementUpdate();
        }
    });

    document.addEventListener("mousemove", (event) => {
        mouseX = event.clientX;
        mouseY = event.clientY;
        sendRotationUpdate();
    });

    function sendMovementUpdate() {
        if (!isWebSocketConnected || playerId === null) return;
        socket.send(JSON.stringify({ action: "move", keys }));
    }

    function sendRotationUpdate() {
        if (!isWebSocketConnected || playerId === null || player === null) return;
    
        // Calculate from player's position, not screen center
        const rect = app.canvas.getBoundingClientRect();
        const dx = mouseX - rect.left - app.screen.width / 2;
        const dy = mouseY - rect.top - app.screen.height / 2;
        
        const angle = Math.atan2(dy, dx);
        socket.send(JSON.stringify({ action: "rotate", angle }));
    }

    function updateCamera() {
        if (!player) return;
    
        // Ensure the camera follows the player exactly
        const targetX = app.screen.width / 2 - player.x;
        const targetY = app.screen.height / 2 - player.y;
    
        camera.x += (targetX - camera.x) * 1.0; // Ensure instant snapping
        camera.y += (targetY - camera.y) * 1.0;
    
        // Synchronize background movement with the player's speed
        background.tilePosition.x = -player.x;
        background.tilePosition.y = -player.y;
    
        // Update Player Info UI
        if (playerInfo) {
            playerInfo.x = player.x + 20;
            playerInfo.y = player.y - 20;
            playerInfo.text = `ID: ${playerId}\nX: ${Math.round(player.x)}\nY: ${Math.round(player.y)}`;
        }
    }
    

    app.ticker.add(() => {
        updateCamera(); // Keep camera updated
        if (player) {
            player.position.set(player.x, player.y);
        }
    });

})();