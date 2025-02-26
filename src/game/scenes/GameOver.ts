import { EventBus } from "../EventBus";
import { Scene } from "phaser";

export class GameOver extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameOverText: Phaser.GameObjects.Text;
    restartButton: Phaser.GameObjects.Text;

    constructor() {
        super("GameOver");
    }

    create() {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0xff0000);

        this.background = this.add.image(400, 300, "background");
        this.background.setAlpha(0.5);

        this.gameOverText = this.add
            .text(400, 300, "Game Over", {
                fontFamily: "Arial Black",
                fontSize: 64,
                color: "#ffffff",
                stroke: "#000000",
                strokeThickness: 8,
                align: "center",
            })
            .setOrigin(0.5)
            .setDepth(100);

        this.restartButton = this.add
            .text(400, 400, "Restart Game / Main Menu", {
                fontFamily: "Arial",
                fontSize: 32,
                color: "#ffffff",
                backgroundColor: "#000000",
                padding: { x: 10, y: 5 },
                align: "center",
            })
            .setOrigin(0.5)
            .setDepth(100)
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", () => this.changeScene());

        EventBus.emit("current-scene-ready", this);
    }

    changeScene() {
        this.scene.start("PlayGame");
    }
}

