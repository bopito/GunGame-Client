import { Application, Assets, Sprite } from "pixi.js";

(async () => {
    const isLocalhost = window.location.hostname === "localhost";
    const assetBasePath = isLocalhost ? "/" : "/GunGame-Client/";
    const SERVER_URL = isLocalhost 
        ? "ws://localhost:6969/game" 
        : "wss://your-server.com/game";  

    const socket = new WebSocket(SERVER_URL);
   
    let isWebSocketConnected = false;
    const messageQueue: string[] = []; // ✅ Queue messages while waiting for connection

    socket.onopen = () => {
        console.log("✅ WebSocket connected!");
        isWebSocketConnected = true;

        // ✅ Send any messages that were queued while connecting
        while (messageQueue.length > 0) {
            socket.send(messageQueue.shift()!);
        }
    };

    socket.onerror = (error) => console.error("❌ WebSocket error:", error);
    socket.onclose = () => {
        console.warn("⚠️ WebSocket closed!");
        isWebSocketConnected = false;
    };



    const players: Record<string, Sprite> = {};

    // Correct PixiJS 8 initialization
    const app = new Application();
    await app.init({ background: "#1099ab", resizeTo: window });

    // Append canvas properly
    document.getElementById("pixi-container")?.appendChild(app.canvas);

    // Ensure asset path is correct
    const playerTexture = await Assets.load(`${assetBasePath}assets/bunny.png`);

    // Create player sprite
    const player = new Sprite(playerTexture);
    const playerIDText = new Text('undefined');
    player.anchor.set(0.5);
    player.position.set(app.screen.width / 2, app.screen.height / 2);
    app.stage.addChild(player);
    //player.addChild(playerIDText);

    // Handle WebSocket messages (game state updates)
    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        for (const id in data.players) {
            if (id === "self") {
                player.position.set(data.players[id].x, data.players[id].y);
            } else {
                if (!players[id]) {
                    players[id] = new Sprite(playerTexture);
                    players[id].anchor.set(0.5);
                    app.stage.addChild(players[id]);
                }
                players[id].position.set(data.players[id].x, data.players[id].y);
            }
        }
    };

    // Local Game Loop
    app.ticker.add(() => {
        // Graphics
        // Music
    });

    // Handle Player Input
    document.addEventListener("keydown", (event) => {
        let direction: string | null = null;
    
        switch (event.key) {
            case "ArrowRight": direction = "right"; break;
            case "ArrowLeft": direction = "left"; break;
            case "ArrowUp": direction = "up"; break;
            case "ArrowDown": direction = "down"; break;
        }
    
        if (direction) {
            const message = JSON.stringify({ action: "move", direction });
    
            if (isWebSocketConnected) {
                socket.send(message);
            } else {
                console.warn("⏳ WebSocket not connected yet. Queuing message:", message);
                messageQueue.push(message); // ✅ Store messages until connection is ready
            }
        }
    });

})();
