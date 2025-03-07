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

        const { width, height } = this.scale;

        this.background = this.add.image(0, 0, "background").setOrigin(0, 0);
        this.background.setDisplaySize(width, height);
        this.background.setAlpha(0.5);

        this.gameOverText = this.add
            .text(width / 2, height * 0.4, "Game Over", {
                fontFamily: "Arial Black",
                fontSize: `${Math.max(width * 0.08, 32)}px`,
                color: "#ffffff",
                stroke: "#000000",
                strokeThickness: 8,
                align: "center",
            })
            .setOrigin(0.5)
            .setDepth(100);

        this.restartButton = this.add
            .text(width / 2, height * 0.6, "Restart Game / Main Menu", {
                fontFamily: "Arial",
                fontSize: `${Math.max(width * 0.04, 24)}px`,
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

        this.scale.on("resize", this.resize, this);
    }

    resize(gameSize: Phaser.Structs.Size) {
        const { width, height } = gameSize;

        this.background.setDisplaySize(width, height);

        this.gameOverText.setPosition(width / 2, height * 0.4);
        this.gameOverText.setFontSize(`${Math.max(width * 0.08, 32)}px`);

        this.restartButton.setPosition(width / 2, height * 0.6);
        this.restartButton.setFontSize(`${Math.max(width * 0.04, 24)}px`);
    }

    changeScene() {
        this.scene.start("PlayGame");
    }
}

