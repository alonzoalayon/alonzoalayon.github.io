import { Scene } from "phaser";

export class Preloader extends Scene {
    private bar!: Phaser.GameObjects.Rectangle;
    private background!: Phaser.GameObjects.Image;

    constructor() {
        super("Preloader");
    }

    init() {
        this.createBackground();
        this.createLoadingBar();
    }

    createBackground() {
        const { width, height } = this.cameras.main;

        this.background = this.add
            .image(0, 0, "background")
            .setOrigin(0, 0)
            .setDisplaySize(width, height)
            .setName("background");
    }

    createLoadingBar() {
        const { width, height } = this.cameras.main;
        const centerX = width / 2;
        const centerY = height / 2;

        this.add
            .rectangle(centerX, centerY, width * 0.6, 32)
            .setStrokeStyle(1, 0xffffff);

        this.bar = this.add
            .rectangle(
                centerX - (width * 0.6) / 2 + 2,
                centerY,
                4,
                28,
                0xffffff
            )
            .setOrigin(0, 0.5);

        this.load.on("progress", (progress: number) => {
            this.bar.width = 4 + (width * 0.6 - 4) * progress;
        });

        this.scale.on("resize", this.resize, this);
    }

    preload() {
        this.load.setPath("assets");

        this.load.spritesheet("bird", "birdSprite.png", {
            frameWidth: 16,
            frameHeight: 16,
        });
        this.load.image("star", "star.png");
        this.load.audio("backgroundMusic", "happy.mp3");
        this.load.audio("powerUp", "coin.mp3");
        this.load.audio("hit", "downer.mp3");
        this.load.image("background", "sky.png");
        this.load.image("pipe", "pipe.png");
        this.load.image("pause", "pause.png");
    }

    create() {
        this.scale.off("resize", this.resize, this);
        this.scene.start("MainMenu");
    }

    resize(gameSize: Phaser.Structs.Size) {
        const { width, height } = gameSize;

        if (this.cameras.main) {
            this.cameras.main.setSize(width, height);
        }

        if (this.background) {
            this.background.setDisplaySize(width, height);
        }

        if (this.bar) {
            const centerX = width / 2;
            const centerY = height / 2;
            this.bar.setPosition(centerX - (width * 0.6) / 2 + 2, centerY);
        }
    }
}

