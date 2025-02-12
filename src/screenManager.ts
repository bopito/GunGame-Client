import { Application, Container } from "pixi.js";

export class ScreenManager {
    private app: Application;
    private currentScreen: Container | null = null;
    private screens: Record<string, Container> = {};

    constructor(app: Application) {
        this.app = app;
    }

    addScreen(name: string, screen: Container) {
        this.screens[name] = screen;
    }

    switchScreen(name: string) {
        if (this.currentScreen) {
            this.app.stage.removeChild(this.currentScreen); // Remove previous screen
        }
        this.currentScreen = this.screens[name];
        if (this.currentScreen) {
            this.app.stage.addChild(this.currentScreen); // Show new screen
        }
    }
}
