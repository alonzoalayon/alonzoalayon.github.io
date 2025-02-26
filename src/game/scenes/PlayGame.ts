import { GameObjects, Scene } from "phaser";
import { EventBus } from "../EventBus";
import { config } from "../main";

const pipeVerticalDistanceRange: [number, number] = [150, 250];
const pipeHorizontalDistanceRange: [number, number] = [400, 450];
const resumeDetails: string[] = [
    "Frontend Developer - 3 Years Experience",
    "Expert in React, Next.js, and React Native",
    "QA Advocate - Implemented Playwright Tests",
    "Built Reusable Components with Bit",
    "Integrated Figma Designs into Apps",
    "Experience with Phaser for Game Dev",
];

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
        const initalBirdPosition = {
            x: (config.width as number) * 0.1,
            y: (config.height as number) / 2,
        };

        this.pipes = this.physics.add.group();

        this.background = this.add.image(400, 300, "background");
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
            .sprite(initalBirdPosition.x, initalBirdPosition.y, "bird")
            .setOrigin(0)
            .setGravityY(600)
            .setScale(3)
            .setFlipX(true);

        (this.bird as Phaser.Physics.Arcade.Sprite).setBodySize(
            this.bird.width,
            this.bird.height - 8
        );

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
                (this.config.width as number) - 10,
                (this.config.height as number) - 10,
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

        EventBus.emit("current-scene-ready", this);
    }

    update() {
        if (
            !this.diedFromCollision &&
            (this.bird.getBounds().bottom >= (config.height as number) ||
                this.bird.y <= 0)
        ) {
            this.physics.pause();
            this.bird.setTint(0xff0000);
            this.handleGameOver();
        }

        if (
            this.diedFromCollision &&
            (this.bird.y > (config.height as number) ||
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
                if (
                    (child as Phaser.GameObjects.Sprite).texture.key === "star"
                ) {
                    (
                        child as Phaser.Physics.Arcade.Sprite
                    ).body!.velocity.x = 0;
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

    addResumeItem(x: number, y: number) {
        this.starCollected = false;
        const resumeItem = this.physics.add.sprite(x, y, "star").setScale(0.5);
        resumeItem.body.setVelocityX(-200);

        this.physics.add.overlap(this.bird, resumeItem, () => {
            this.powerUpSound.play();
            this.showResumeDetails();
            resumeItem.destroy();
            this.starCollected = true;
        });
    }

    showResumeDetails() {
        if (this.currentResumeIndex < resumeDetails.length) {
            const textBox = this.add
                .text(400, 300, resumeDetails[this.currentResumeIndex], {
                    fontSize: "20px",
                    backgroundColor: "#000",
                    color: "#fff",
                    padding: { x: 10, y: 5 },
                })
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
        const rightMostXPosition = this.getRightmostPipe();

        const pipeVerticalDistance = Phaser.Math.Between(
            ...pipeVerticalDistanceRange
        );
        const pipeVerticalPosition = Phaser.Math.Between(
            0 + 20,
            (config.height as number) - 20 - pipeVerticalDistance
        );
        const pipeHorizontalDistance = Phaser.Math.Between(
            ...pipeHorizontalDistanceRange
        );

        uPipe.x = rightMostXPosition + pipeHorizontalDistance;
        uPipe.y = pipeVerticalPosition;

        lPipe.x = uPipe.x;
        lPipe.y = uPipe.y + pipeVerticalDistance;

        if (lPipe.body) {
            lPipe.body.velocity.x = -200;
        }
        if (uPipe.body) {
            uPipe.body.velocity.x = -200;
        }

        if (this.pipeCounter % 4 === 0) {
            this.addResumeItem(
                uPipe.x + 25,
                uPipe.y + pipeVerticalDistance / 2
            );
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
                }
            }
        });
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
            .text(400, 300, "Ready", {
                fontSize: "64px",
                color: "#fff",
            })
            .setOrigin(0.5)
            .setVisible(false)
            .setDepth(10);

        this.steadyText = this.add
            .text(400, 300, "Steady", {
                fontSize: "64px",
                color: "#fff",
            })
            .setOrigin(0.5)
            .setVisible(false)
            .setDepth(10);

        this.goText = this.add
            .text(400, 300, "Go", {
                fontSize: "64px",
                color: "#fff",
            })
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

