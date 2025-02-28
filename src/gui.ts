import * as GUI from "@babylonjs/gui";
import Player from "./player";

export class GameGUI {
    private advancedTexture: GUI.AdvancedDynamicTexture;
    private playerListPanel: GUI.StackPanel;
    private playerTextBlocks: Record<string, GUI.TextBlock> = {};
    private hpText: GUI.TextBlock;
    private ammoText: GUI.TextBlock;
    private weaponNameText: GUI.TextBlock;

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

        // HP Display (Central Bottom)
        this.hpText = new GUI.TextBlock();
        this.hpText.text = "HP: 100"; // Default text
        this.hpText.color = "red";
        this.hpText.fontSize = 24;
        this.hpText.fontWeight = "bold";
        this.hpText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.hpText.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        this.hpText.top = "-50"; // Move slightly above the bottom edge
        this.advancedTexture.addControl(this.hpText);

        // ✅ Weapon Name Display (Above Ammo)
        this.weaponNameText = new GUI.TextBlock();
        this.weaponNameText.text = "Weapon: None"; // Default text
        this.weaponNameText.color = "yellow";
        this.weaponNameText.fontSize = 22;
        this.weaponNameText.fontWeight = "bold";
        this.weaponNameText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this.weaponNameText.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        this.weaponNameText.left = "-20"; // Move left slightly
        this.weaponNameText.top = "-80";  // Move above the ammo text
        this.advancedTexture.addControl(this.weaponNameText);

        // Ammo Display (Bottom Right)
        this.ammoText = new GUI.TextBlock();
        this.ammoText.text = "Ammo: 30 / 90"; // Default text
        this.ammoText.color = "white";
        this.ammoText.fontSize = 20;
        this.ammoText.fontWeight = "bold";
        this.ammoText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this.ammoText.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        this.ammoText.left = "-20"; // Move left slightly
        this.ammoText.top = "-50";  // Move up slightly
        this.advancedTexture.addControl(this.ammoText);
    }

    // **Add or Update a Player in GUI**
    updatePlayer(player: Player): void {
        if (!this.playerTextBlocks[player.id]) {
            // **Create a new text block for the player**
            const playerText = new GUI.TextBlock();
            playerText.height = "30px";
            playerText.color = "white";
            playerText.fontSize = 11;
            playerText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;

            this.playerListPanel.addControl(playerText);
            this.playerTextBlocks[player.id] = playerText;
        }

        // **Update Player's Info**
        this.playerTextBlocks[player.id].text = `ID: ${player.id.substring(0,20)} | X: ${player.x} | Y: ${player.y} | Z: ${player.z} | SCORE: ${player.score} | HEALTH: ${player.health}`;
    }

    // **Remove a Player from GUI**
    removePlayer(playerId: string): void {
        if (this.playerTextBlocks[playerId]) {
            this.playerListPanel.removeControl(this.playerTextBlocks[playerId]);
            delete this.playerTextBlocks[playerId];
        }
    }

    // Update HP & Ammo UI
    updateHUD(player: Player): void {
        this.hpText.text = `HP: ${player.health}`;
        if (player.currentWeapon) {
            this.weaponNameText.text = `Weapon: ${player.currentWeapon.name}`;
            this.ammoText.text = `Ammo: ${player.currentWeapon.currentAmmo} / ${player.currentWeapon.reserveAmmo}`;
        } else {
            this.weaponNameText.text = "Weapon: None";
            this.ammoText.text = "Ammo: - / -"; // No weapon equipped
        }
    }
}

// **Ensure this is a named export**
export default GameGUI;
