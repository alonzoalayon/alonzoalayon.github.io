import { GameObjects, Scene } from "phaser";
import { EventBus } from "../EventBus";

export class MainMenu extends Scene {
    background: GameObjects.Image;
    config: Phaser.Types.Core.GameConfig;
    startButton: GameObjects.Text;

    constructor() {
        super("MainMenu");
    }

    init(data: { config: Phaser.Types.Core.GameConfig }) {
        this.config = data.config;
    }

    preload() {
        this.load.image("background", "sky.png");
    }

    create() {
        const { width, height } = this.scale;

        this.background = this.add.image(0, 0, "background").setOrigin(0, 0);
        this.background.setDisplaySize(width, height);

        this.startButton = this.add
            .text(width / 2, height * 0.5, "Start Game", {
                fontSize: `${Math.max(width * 0.04, 24)}px`,
                color: "#fff",
                backgroundColor: "#000",
                padding: { x: 10, y: 5 },
            })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        this.startButton.on("pointerdown", () => {
            this.scene.start("PlayGame");
            this.scene.stop("MainMenu");
        });

        this.scale.on("resize", this.resize, this);
        this.events.on("shutdown", this.shutdown, this);
        EventBus.emit("current-scene-ready", this);
    }

    shutdown() {
        this.scale.off("resize", this.resize, this);
    }

    resize(gameSize: Phaser.Structs.Size) {
        const { width, height } = gameSize;
        if (this.cameras.main) {
            this.cameras.main.setSize(width, height);
        }

        if (this.background) {
            this.background.setDisplaySize(width, height);
        }

        if (this.startButton) {
            this.startButton.setPosition(width / 2, height * 0.6);
            this.startButton.setFontSize(`${Math.max(width * 0.04, 24)}px`);
        }
    }

    update() {}
}

