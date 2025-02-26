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

    create() {
        this.add.image(0, 0, "background").setOrigin(0, 0);

        this.startButton = this.add
            .text(400, 300, "Start Game", {
                fontSize: "32px",
                color: "#fff",
                backgroundColor: "#000",
                padding: { x: 10, y: 5 },
            })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        this.startButton.on("pointerdown", () => {
            this.scene.start("PlayGame", { config: this.config });
        });

        EventBus.emit("current-scene-ready", this);
    }

    update() {}
}

