import * as GUI from "@babylonjs/gui";

export class GameGUI {
    private advancedTexture: GUI.AdvancedDynamicTexture;
    private playerListPanel: GUI.StackPanel;
    private playerTextBlocks: Record<string, GUI.TextBlock> = {};

    constructor() {
        this.advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

        // Create Player List Panel
        this.playerListPanel = new GUI.StackPanel();
        this.playerListPanel.width = "350px";
        this.playerListPanel.height = "300px";
        this.playerListPanel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.playerListPanel.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        this.playerListPanel.paddingTop = "20px";
        this.playerListPanel.paddingLeft = "10px";
        this.playerListPanel.background = "rgba(0, 0, 0, 0.2)"; // Transparent black background

        this.advancedTexture.addControl(this.playerListPanel);

        // Player List Header
        const playerListHeader = new GUI.TextBlock();
        playerListHeader.text = "Players:";
        playerListHeader.height = "30px";
        playerListHeader.color = "white";
        playerListHeader.fontSize = 18;
        playerListHeader.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        playerListHeader.paddingBottom = "10px";

        this.playerListPanel.addControl(playerListHeader);
    }

    // **Add or Update a Player in GUI**
    updatePlayer(playerId: string, x: number, y: number, z: number, score: number, health: number): void {
        if (!this.playerTextBlocks[playerId]) {
            // **Create a new text block for the player**
            const playerText = new GUI.TextBlock();
            playerText.height = "30px";
            playerText.color = "white";
            playerText.fontSize = 11;
            playerText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;

            this.playerListPanel.addControl(playerText);
            this.playerTextBlocks[playerId] = playerText;
        }

        // **Update Player's Info**
        this.playerTextBlocks[playerId].text = `ID: ${playerId.substring(0,20)} | X: ${x} | Y: ${y} | Z: ${z} | SCORE: ${score} | HEALTH: ${health}`;
    }

    // **Remove a Player from GUI**
    removePlayer(playerId: string): void {
        if (this.playerTextBlocks[playerId]) {
            this.playerListPanel.removeControl(this.playerTextBlocks[playerId]);
            delete this.playerTextBlocks[playerId];
        }
    }
}

// **Ensure this is a named export**
export default GameGUI;
