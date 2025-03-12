import { GameObjects, Scene } from "phaser";
import { EventBus } from "../EventBus";
import { config } from "../main";

type DifficultyLevels = "EASY" | "MEDIUM" | "HARD";

const resumeDetails: string[] = [
    "Frontend Developer - 3 Years Experience (Web & Mobile)",
    "Expert in React, Next.js, and React Native",
    "QA Advocate - Implemented Playwright for Automated Testing",
    "Optimized Dev Workflow with Reusable Components (Bit)",
    "Integrated Figma Designs into Scalable UI Components",
    "Game Developer - Built Phaser-Based Interactive Projects",
];
const difficultyLevels: Record<
    DifficultyLevels,
    {
        pipeHorizontalDistanceRange: [number, number];
        pipeVerticalDistanceRange: [number, number];
    }
> = {
    EASY: {
        pipeHorizontalDistanceRange: [400, 450],
        pipeVerticalDistanceRange: [150, 200],
    },
    MEDIUM: {
        pipeHorizontalDistanceRange: [280, 330],
        pipeVerticalDistanceRange: [140, 190],
    },
    HARD: {
        pipeHorizontalDistanceRange: [250, 310],
        pipeVerticalDistanceRange: [120, 150],
    },
};

export class PlayGame extends Scene {
    background: GameObjects.Image;
    logo: GameObjects.Image;
    bird: GameObjects.Sprite;
    title: GameObjects.Text;
    logoTween: Phaser.Tweens.Tween | null;
    upperPipe: GameObjects.Sprite;
    lowerPipe: GameObjects.Sprite;
    upperPipes: GameObjects.Sprite[] = [];
    lowerPipes: GameObjects.Sprite[] = [];
    pipes: GameObjects.Group;
    config: Phaser.Types.Core.GameConfig;
    diedFromCollision: boolean = false;
    score: number = 0;
    scoreText: GameObjects.Text;
    bestScore: number = 0;
    bestScoreText: GameObjects.Text;
    pauseButton: GameObjects.Image;
    readyText: GameObjects.Text;
    steadyText: GameObjects.Text;
    goText: GameObjects.Text;
    gameStarted: boolean = false;
    star: GameObjects.Image;
    pipeCounter: number = 0;
    currentResumeIndex = 0;
    isPaused: boolean = false;
    backgroundMusic: Phaser.Sound.BaseSound;
    powerUpSound: Phaser.Sound.BaseSound;
    hitSound: Phaser.Sound.BaseSound;
    starCollected: boolean = false;
    currentDifficulty: DifficultyLevels = "EASY";
    resumeItem: GameObjects.Sprite | null = null;

    constructor() {
        super("PlayGame");
    }

    init() {
        this.config = this.sys.game
            .config as unknown as Phaser.Types.Core.GameConfig;
        this.diedFromCollision = false;

        const storedBestScore = localStorage.getItem("bestScore");
        if (storedBestScore) {
            this.bestScore = parseInt(storedBestScore, 10);
        } else {
            this.bestScore = 0;
        }
    }

    create() {
        const PIPES_TO_RENDER = 4;
        this.pipes = this.physics.add.group();

        this.background = this.add.image(
            (config.width as number) / 2,
            (config.height as number) / 2,
            "background"
        );
        this.resizeBackground();

        this.backgroundMusic = this.sound.add("backgroundMusic", {
            loop: true,
            volume: 0.5,
        });
        this.powerUpSound = this.sound.add("powerUp", {
            loop: false,
            volume: 1,
        });
        this.hitSound = this.sound.add("hit", {
            loop: false,
            volume: 1,
        });

        this.backgroundMusic.play();

        this.bird = this.physics.add
            .sprite(
                (config.width as number) * 0.1,
                (config.height as number) * 0.27,
                "bird"
            )
            .setGravityY(600)
            .setScale(3)
            .setFlipX(true);

        this.startCountdown();

        this.input.on("pointerdown", () => this.flap());

        this.input.keyboard?.on("keydown-SPACE", () => this.flap());

        for (let i = 0; i < PIPES_TO_RENDER; i++) {
            this.upperPipe = this.pipes
                .create(0, 0, "pipe")
                .setImmovable(true)
                .setOrigin(0, 1);
            this.lowerPipe = this.pipes
                .create(0, 0, "pipe")
                .setImmovable(true)
                .setOrigin(0, 0);

            this.placePipe(this.upperPipe, this.lowerPipe);
        }

        (this.pipes as Phaser.Physics.Arcade.Group).setVelocityX(-200);

        this.createColliders();

        this.createScore();

        this.pauseButton = this.add
            .image(
                (window.innerWidth as number) - 10,
                (window.innerHeight as number) - 10,
                "pause"
            )
            .setScale(3)
            .setOrigin(1)
            .setInteractive();

        this.pauseButton.on("pointerdown", () => {
            this.pauseGame();
        });

        this.anims.create({
            key: "fly",
            frames: this.anims.generateFrameNumbers("bird", {
                start: 8,
                end: 15,
            }),
            frameRate: 8,
            repeat: -1,
        });

        this.anims.create({
            key: "dead",
            frames: [{ key: "bird", frame: 16 }],
            frameRate: 1,
        });

        this.bird.play("fly");

        this.scale.on("resize", this.handleResize, this);
        this.handleResize(this.scale.gameSize);
        this.events.on("shutdown", this.shutdown, this);
        EventBus.emit("current-scene-ready", this);
    }

    shutdown() {
        this.scale.off("resize", this.handleResize, this);
    }

    update() {
        const { height } = this.scale.gameSize;
        if (
            !this.diedFromCollision &&
            (this.bird.getBounds().bottom >= (height as number) ||
                this.bird.y <= 0)
        ) {
            this.physics.pause();
            this.bird.setTint(0xff0000);
            this.handleGameOver();
        }

        if (
            this.diedFromCollision &&
            (this.bird.y > (height as number) ||
                this.bird.y < -this.bird.height)
        ) {
            this.handleGameOver();
        }

        this.recyclePipes();
    }

    createColliders() {
        this.physics.add.collider(this.bird, this.pipes, () => {
            this.pipes.getChildren().forEach((pipe) => {
                const pipeSprite = pipe as GameObjects.Sprite;
                pipeSprite.body!.velocity.x = 0;
            });

            this.children.list.forEach((child) => {
                const sprite = child as Phaser.GameObjects.Sprite;
                if (sprite.texture && sprite.texture.key === "star") {
                    (sprite.body as Phaser.Physics.Arcade.Body).velocity.x = 0;
                }
            });

            this.diedFromCollision = true;

            this.bird.body!.velocity.x = 0;
            this.hitSound.play();

            this.bird.anims.stop();

            this.bird.setFrame(16);
            this.bird.setFlipY(true);
            this.scene.pause();

            this.bird.setTint(0xff0000);

            setTimeout(() => {
                this.scene.resume();
            }, 1000);

            setTimeout(() => {
                if (this.bird.body!.velocity.y === 0) {
                    this.scene.start("GameOver");
                }
            }, 1500);
        });
    }

    createScore() {
        this.score = 0;
        this.scoreText = this.add.text(16, 16, `Score: ${this.score}`, {
            fontSize: "32px",
            color: "#000",
        });

        this.bestScoreText = this.add.text(
            16,
            48,
            `Best Score: ${this.bestScore}`,
            {
                fontSize: "18px",
                color: "#000",
            }
        );
    }

    handleResize(gameSize: Phaser.Structs.Size) {
        const { width, height } = gameSize;

        if (this.cameras.main) {
            this.cameras.main.setSize(width, height);
        }

        this.resizeBackground();

        if (this.bird) {
            this.bird.setPosition(width * 0.1, height / 2);
        }

        if (this.scoreText) {
            this.scoreText.setPosition(16, 16);
        }

        if (this.bestScoreText) {
            this.bestScoreText.setPosition(16, 48);
        }

        this.readyText.setPosition(width / 2, height / 2);
        this.steadyText.setPosition(width / 2, height / 2);
        this.goText.setPosition(width / 2, height / 2);

        if (this.pauseButton) {
            this.pauseButton.setPosition(width - 20, height - 20);
        }

        this.pipes.getChildren().forEach((pipe) => {
            const pipeSprite = pipe as Phaser.GameObjects.Sprite;
            if (pipeSprite.y > height) {
                pipeSprite.y = height - 100;
            }
        });
    }

    resizeBackground() {
        if (!this.background) return;
        this.background.setPosition(
            this.scale.width / 2,
            this.scale.height / 2
        );

        // const scaleX = this.scale.width / this.background.width;
        // const scaleY = this.scale.height / this.background.height;
        const scaleX = window.innerWidth / this.background.width;
        const scaleY = window.innerHeight / this.background.height;
        this.background.setScale(Math.max(scaleX, scaleY));
    }

    addResumeItem(x: number, y: number) {
        this.starCollected = false;
        this.resumeItem = this.physics.add.sprite(x, y, "star").setScale(0.5);
        (this.resumeItem.body as Phaser.Physics.Arcade.Body).setVelocityX(-200);

        this.physics.add.overlap(this.bird, this.resumeItem, () => {
            this.powerUpSound.play();
            this.showResumeDetails();
            this.resumeItem?.destroy();
            this.starCollected = true;
        });
    }

    showResumeDetails() {
        const { width, height } = this.scale.gameSize;
        if (this.currentResumeIndex < resumeDetails.length) {
            const textBox = this.add
                .text(
                    (width as number) / 2,
                    (height as number) / 2,
                    resumeDetails[this.currentResumeIndex],
                    {
                        fontSize: "20px",
                        backgroundColor: "#000",
                        color: "#fff",
                        padding: { x: 10, y: 5 },
                        wordWrap: {
                            width: (config.width as number) - 40,
                            useAdvancedWrap: true,
                        },
                    }
                )
                .setOrigin(0.5)
                .setDepth(10);

            this.time.delayedCall(3000, () => textBox.destroy());

            this.currentResumeIndex++;
        }
    }

    handleGameOver() {
        this.backgroundMusic.stop();
        this.time.delayedCall(500, () => {
            this.scene.start("GameOver");
            this.scene.stop("PlayGame");
        });

        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem("bestScore", this.bestScore.toString());
        }
    }

    flap() {
        if (this.isPaused) return;
        (this.bird as Phaser.Physics.Arcade.Sprite).setVelocityY(-300);
    }

    pauseGame() {
        this.isPaused = true;
        this.scene.pause();
        this.scene.launch("PauseMenu");
        this.backgroundMusic.pause();
    }

    increaseScore() {
        this.score += 1;
        this.scoreText.setText(`Score: ${this.score}`);
    }

    placePipe(uPipe: GameObjects.Sprite, lPipe: GameObjects.Sprite) {
        const height = window.innerHeight;
        const difficulty = difficultyLevels[this.currentDifficulty];

        const rightMostXPosition = this.getRightmostPipe();

        const pipeVerticalDistance = Phaser.Math.Between(
            ...difficulty.pipeVerticalDistanceRange
        );
        const pipeVerticalPosition = Phaser.Math.Between(
            0 + 20,
            (height as number) - 20 - pipeVerticalDistance
        );
        const pipeHorizontalDistance = Phaser.Math.Between(
            ...difficulty.pipeHorizontalDistanceRange
        );

        uPipe.x = rightMostXPosition + pipeHorizontalDistance;
        uPipe.y = pipeVerticalPosition;

        lPipe.x = uPipe.x;
        lPipe.y = uPipe.y + pipeVerticalDistance;

        const upperPipeHeight = uPipe.y;
        const lowerPipeHeight = (height as number) - lPipe.y;

        uPipe.setDisplaySize(uPipe.width, upperPipeHeight);
        lPipe.setDisplaySize(lPipe.width, lowerPipeHeight);

        if (lPipe.body) {
            lPipe.body.velocity.x = -200;
        }
        if (uPipe.body) {
            uPipe.body.velocity.x = -200;
        }
        const pipeCenterX = uPipe.x + uPipe.width / 2;
        if (this.pipeCounter % 4 === 0) {
            this.addResumeItem(pipeCenterX, uPipe.y + pipeVerticalDistance / 2);
        }
        this.pipeCounter++;
    }

    recyclePipes() {
        const tempPipes: GameObjects.Sprite[] = [];
        this.pipes.getChildren().forEach((pipe) => {
            const pipeSprite = pipe as GameObjects.Sprite;

            if (pipeSprite.getBounds().right <= 0) {
                tempPipes.push(pipeSprite);
                if (tempPipes.length === 2) {
                    this.placePipe(tempPipes[0], tempPipes[1]);
                    this.increaseScore();
                    this.increaseDifficulty();
                }
            }
        });
    }

    increaseDifficulty() {
        if (this.score === 5) {
            this.currentDifficulty = "MEDIUM";
        }

        if (this.score === 10) {
            this.currentDifficulty = "HARD";
        }
    }

    getRightmostPipe() {
        let rightmostPipe = 0;

        this.pipes.getChildren().forEach((value) => {
            const pipe = value as GameObjects.Sprite;
            rightmostPipe = Math.max(pipe.x, rightmostPipe);
        });

        return rightmostPipe;
    }

    changeScene() {
        if (this.logoTween) {
            this.logoTween.stop();
            this.logoTween = null;
        }

        this.scene.start("Game");
    }

    startCountdown() {
        this.backgroundMusic.resume();
        this.input.enabled = false;
        this.physics.pause();

        this.readyText = this.add
            .text(
                (window.innerWidth as number) / 2,
                (window.innerHeight as number) / 2,
                "Ready",
                {
                    fontSize: "64px",
                    color: "#fff",
                }
            )
            .setOrigin(0.5)
            .setVisible(false)
            .setDepth(10);

        this.steadyText = this.add
            .text(
                (window.innerWidth as number) / 2,
                (window.innerHeight as number) / 2,
                "Steady",
                {
                    fontSize: "64px",
                    color: "#fff",
                }
            )
            .setOrigin(0.5)
            .setVisible(false)
            .setDepth(10);

        this.goText = this.add
            .text(
                (window.innerWidth as number) / 2,
                (window.innerHeight as number) / 2,
                "Go",
                {
                    fontSize: "64px",
                    color: "#fff",
                }
            )
            .setOrigin(0.5)
            .setVisible(false)
            .setDepth(10);

        this.tweens.add({
            targets: this.readyText,
            alpha: { from: 0, to: 1 },
            ease: "Power1",
            duration: 1000,
            onStart: () => this.readyText.setVisible(true),
            onComplete: () => {
                this.readyText.setVisible(false);
                this.tweens.add({
                    targets: this.steadyText,
                    alpha: { from: 0, to: 1 },
                    ease: "Power1",
                    duration: 1000,
                    onStart: () => this.steadyText.setVisible(true),
                    onComplete: () => {
                        this.steadyText.setVisible(false);
                        this.tweens.add({
                            targets: this.goText,
                            alpha: { from: 0, to: 1 },
                            ease: "Power1",
                            duration: 1000,
                            onStart: () => this.goText.setVisible(true),
                            onComplete: () => {
                                this.goText.setVisible(false);
                                this.physics.resume();
                                this.input.enabled = true;
                                this.isPaused = false;
                            },
                        });
                    },
                });
            },
        });
    }
}

