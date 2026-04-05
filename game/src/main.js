import Phaser from 'phaser';
import KhutirScene    from './scenes/KhutirScene.js';
import PreloadScene   from './scenes/PreloadScene.js';
import BattleScene    from './scenes/BattleScene.js';
import UIScene        from './scenes/UIScene.js';
import GameOverScene  from './scenes/GameOverScene.js';
import { CONFIG }     from './data/config.js';

const gameConfig = {
  type: Phaser.AUTO,
  width:  CONFIG.width,
  height: CONFIG.height,
  backgroundColor: '#1a1a2e',
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false }
  },
  scene: [KhutirScene, PreloadScene, BattleScene, UIScene, GameOverScene]
};

// Initialise registry defaults before the first scene runs
const game = new Phaser.Game(gameConfig);
game.events.once('ready', () => {
  game.registry.set('gold',   CONFIG.startGold);
  game.registry.set('health', CONFIG.startHealth);
  game.registry.set('wave',   0);
  game.registry.set('score',  0);
});
