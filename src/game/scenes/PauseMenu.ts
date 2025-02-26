import { GameObjects, Scene } from "phaser";
import { EventBus } from "../EventBus";

type PlayGameScene = {
    scene: {
        resume: () => void;
    };
    startCountdown: () => void;
};

export class PauseMenu extends Scene {
    background: GameObjects.Image;
    resumeButton: GameObjects.Text;
    restartButton: GameObjects.Text;
    mainMenuButton: GameObjects.Text;

    constructor() {
        super("PauseMenu");
    }

    create() {
        this.add.image(0, 0, "background").setOrigin(0, 0);

        this.resumeButton = this.add
            .text(400, 200, "Resume Game", {
                fontSize: "32px",
                color: "#fff",
                backgroundColor: "#000",
                padding: { x: 10, y: 5 },
            })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        this.resumeButton.on("pointerdown", () => {
            const playGameScene = this.scene.get(
                "PlayGame"
            ) as unknown as PlayGameScene;
            this.scene.stop();
            playGameScene.scene.resume();
            playGameScene.startCountdown();
        });

        this.restartButton = this.add
            .text(400, 300, "Restart Game", {
                fontSize: "32px",
                color: "#fff",
                backgroundColor: "#000",
                padding: { x: 10, y: 5 },
            })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        this.restartButton.on("pointerdown", () => {
            this.scene.start("PlayGame");
        });

        this.mainMenuButton = this.add
            .text(400, 400, "Main Menu", {
                fontSize: "32px",
                color: "#fff",
                backgroundColor: "#000",
                padding: { x: 10, y: 5 },
            })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        this.mainMenuButton.on("pointerdown", () => {
            this.scene.stop("PlayGame");
            this.scene.stop("PauseMenu");
            this.scene.start("MainMenu");
        });

        EventBus.emit("current-scene-ready", this);
    }

    update() {}
}

