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
        const { width, height } = this.scale;

        this.background = this.add.image(0, 0, "background").setOrigin(0, 0);
        this.background.setDisplaySize(width, height);

        this.resumeButton = this.add
            .text(width / 2, height * 0.4, "Resume Game", {
                fontSize: `${Math.max(width * 0.04, 24)}px`,
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
            .text(width / 2, height * 0.5, "Restart Game", {
                fontSize: `${Math.max(width * 0.04, 24)}px`,
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
            .text(width / 2, height * 0.6, "Main Menu", {
                fontSize: `${Math.max(width * 0.04, 24)}px`,
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

        this.scale.on("resize", this.resize, this);
    }

    resize(gameSize: Phaser.Structs.Size) {
        const { width, height } = gameSize;

        this.background.setDisplaySize(width, height);

        this.resumeButton.setPosition(width / 2, height * 0.4);
        this.resumeButton.setFontSize(`${Math.max(width * 0.04, 24)}px`);

        this.restartButton.setPosition(width / 2, height * 0.5);
        this.restartButton.setFontSize(`${Math.max(width * 0.04, 24)}px`);

        this.mainMenuButton.setPosition(width / 2, height * 0.6);
        this.mainMenuButton.setFontSize(`${Math.max(width * 0.04, 24)}px`);
    }

    update() {}
}

