import * as GUI from "@babylonjs/gui";
import * as BABYLON from "@babylonjs/core";
import Player from "./player";

export class GameGUI {
    private advancedTexture: GUI.AdvancedDynamicTexture;
    private playerListPanel: GUI.StackPanel;
    private playerTextBlocks: Record<string, GUI.TextBlock> = {};
    private hpText: GUI.TextBlock;
    private ammoText: GUI.TextBlock;
    private weaponNameText: GUI.TextBlock;

    // 🔹 Added for box labels
    private boxLabels: Record<string, { weaponText: GUI.TextBlock; hpText: GUI.TextBlock }> = {};

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
            // Create a new text block for the player
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

    //
    // Create labels for a box (Weapon Name & HP)
    //
    createBoxLabel(boxId: string, labelPlane: BABYLON.Mesh, weaponName: string, initialHP: number) {
        console.log(`[GameGUI] Creating UI for box: ${boxId}, Weapon: ${weaponName}, HP: ${initialHP}`);

        // 🔹 Move the labelPlane even higher above the box
        labelPlane.position.y = 4.7;

        // 🔹 Scale the label plane for better text fitting
        labelPlane.scaling = new BABYLON.Vector3(8.0, 3.5, 1); // Increased size for better visibility

        // 🔹 Create a high-resolution texture for clarity
        const advancedTexture = GUI.AdvancedDynamicTexture.CreateForMesh(labelPlane, 4096, 2048);

        // 🔹 Weapon Name Label (Doubled size)
        const weaponText = new GUI.TextBlock();
        weaponText.text = weaponName;
        weaponText.color = "white";
        weaponText.fontSize = 160; // Increased font size
        weaponText.fontWeight = "bold";
        weaponText.outlineWidth = 25;
        weaponText.outlineColor = "black";
        weaponText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        weaponText.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        weaponText.top = "-100px"; // Move up for better spacing
        advancedTexture.addControl(weaponText);

        // 🔹 HP Label (Doubled size and positioned below weapon name)
        const hpText = new GUI.TextBlock();
        hpText.text = `HP: ${initialHP}`;
        hpText.color = "red";
        hpText.fontSize = 160; // Increased font size
        hpText.fontWeight = "bold";
        hpText.outlineWidth = 30;
        hpText.outlineColor = "black";
        hpText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        hpText.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        hpText.top = "140px"; // Maintain proper spacing
        advancedTexture.addControl(hpText);

        // 🔹 Store labels
        this.boxLabels[boxId] = { weaponText, hpText };
    }


    //
    // Update box HP in the UI
    //
    updateBoxHP(boxId: string, hp: number) {
        if (this.boxLabels[boxId]) {
            this.boxLabels[boxId].hpText.text = `HP: ${hp}`;
            console.log(`[GameGUI] Updated Box ${boxId} HP: ${hp}`);
        } else {
            console.warn(`[GameGUI] Box ${boxId} UI not found!`);
        }
    }


    //
    // Remove box UI when destroyed
    //
    removeBoxLabel(boxId: string) {
        if (this.boxLabels[boxId]) {
            console.log(`[GameGUI] Removing UI for box: ${boxId}`);

            // 🔹 Dispose text controls
            this.boxLabels[boxId].weaponText.dispose();
            this.boxLabels[boxId].hpText.dispose();

            // 🔹 Remove box UI from tracking
            delete this.boxLabels[boxId];
        } else {
            console.warn(`[GameGUI] Tried to remove non-existing box UI: ${boxId}`);
        }
    }

}

// Ensure this is a named export
export default GameGUI;
