import { Application, Assets, Sprite } from "pixi.js";

(async () => {
    const isLocalhost = window.location.hostname === "localhost";
    const SERVER_URL = isLocalhost ? "ws://192.168.1.108:8080/game" : "wss://your-server.com/game";
    const socket = new WebSocket(SERVER_URL);

    const players: Record<string, Sprite> = {};

    const app = new Application();
    await app.init({ background: "#1099ab", resizeTo: window });

    // Append the application canvas to the document body
    document.getElementById("pixi-container")?.appendChild(app.canvas);

    // Load the bunny texture
    const playerTexture = await Assets.load("/assets/bunny.png");

    // Create a bunny Sprite
    const player = new Sprite(playerTexture);
    player.anchor.set(0.5);
    player.position.set(app.screen.width / 2, app.screen.height / 2);
    app.stage.addChild(player);

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

    // Local Game loop
    app.ticker.add(() => {
        // graphics
        // music
        //
    });

    // Send player input to server
    document.addEventListener("keydown", (event) => {
        let direction: string | null = null;

        switch (event.key) {
            case "ArrowRight": 
                direction = "right";
                break;
            case "ArrowLeft": 
                direction = "left"; 
                break;
            case "ArrowUp": 
                direction = "up"; 
                break;
            case "ArrowDown": 
                direction = "down"; 
                break;
        }

        if (direction) {
            socket.send(JSON.stringify({ action: "move", direction }));
        }
    });


})();




