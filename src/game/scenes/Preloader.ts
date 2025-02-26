import { Scene } from "phaser";

export class Preloader extends Scene {
    constructor() {
        super("Preloader");
    }

    init() {
        this.add.image(512, 384, "background");

        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);

        this.load.on("progress", (progress: number) => {
            bar.width = 4 + 460 * progress;
        });
    }

    preload() {
        this.load.setPath("src");

        this.load.spritesheet("bird", "assets/birdSprite.png", {
            frameWidth: 16,
            frameHeight: 16,
        });
        this.load.image("star", "assets/star.png");
        this.load.audio("backgroundMusic", "assets/happy.mp3");
        this.load.audio("powerUp", "assets/coin.mp3");
        this.load.audio("hit", "assets/downer.mp3");

        this.load.image("pipe", "assets/pipe.png");
        this.load.image("pause", "assets/pause.png");
    }

    create() {
        this.scene.start("MainMenu");
    }
}

