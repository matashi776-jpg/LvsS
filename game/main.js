import Phaser from 'phaser';
import { PreloadScene } from './src/scenes/PreloadScene.js';
import { KhutirScene }  from './src/scenes/KhutirScene.js';
import { BattleScene }  from './src/scenes/BattleScene.js';
import { UIScene }      from './src/scenes/UIScene.js';

const player = {
    hero:       'Ніка',
    vyshyvanka: 'Вишиванка Першого Кроку',
    inventory:  ['smalets_jar'],
    stats:      { luck: 1, strength: 5 }
};

const config = {
    type:   Phaser.AUTO,
    width:  800,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#1a1a1a',
    physics: {
        default: 'arcade',
        arcade:  { gravity: { y: 0 }, debug: false }
    },
    // preBoot гарантує, що registry заповнений ДО того, як будь-яка сцена ініціалізується
    callbacks: {
        preBoot: (game) => game.registry.set('playerData', player)
    },
    // Порядок: PreloadScene → KhutirScene → BattleScene (+ UIScene як overlay)
    scene: [PreloadScene, KhutirScene, BattleScene, UIScene]
};

new Phaser.Game(config);
