import { Boot } from "./scenes/Boot";
import { GameOver } from "./scenes/GameOver";
import { Game as MainGame } from "./scenes/Game";
import { MainMenu } from "./scenes/MainMenu";
import { PlayGame } from "./scenes/PlayGame";
import { AUTO, Game } from "phaser";
import { Preloader } from "./scenes/Preloader";
import { PauseMenu } from "./scenes/PauseMenu";

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
export const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: "game-container",
    pixelArt: true,
    backgroundColor: "#028af8",
    scene: [Boot, Preloader, MainMenu, PlayGame, PauseMenu, MainGame, GameOver],
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
        default: "arcade",
        arcade: {
            debug: false,
        },
    },
};

const StartGame = (parent: string) => {
    const game = new Game({ ...config, parent });

    return game;
};

export default StartGame;

