import Phaser from 'phaser';

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene', active: false });
  }

  create() {
    const W = this.sys.game.canvas.width;
    const H = this.sys.game.canvas.height;
    const wave = this.registry.get('score') || this.registry.get('wave') || 0;

    // Overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.72);
    overlay.fillRect(0, 0, W, H);

    // Panel
    const panel = this.add.graphics();
    panel.fillStyle(0x1a1a2e, 1);
    panel.fillRoundedRect(W / 2 - 200, H / 2 - 180, 400, 360, 20);
    panel.lineStyle(3, 0xFFD700);
    panel.strokeRoundedRect(W / 2 - 200, H / 2 - 180, 400, 360, 20);

    // Title
    this.add.text(W / 2, H / 2 - 140, '💀 ГРА ЗАКІНЧЕНА', {
      fontSize: '32px', fill: '#FF4444', stroke: '#000', strokeThickness: 4, fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(W / 2, H / 2 - 90, `Ви дійшли до Хвилі ${wave}`, {
      fontSize: '22px', fill: '#ffffff', stroke: '#000', strokeThickness: 2
    }).setOrigin(0.5);

    // High score
    const prev = parseInt(localStorage.getItem('lvsHiScore') || '0', 10);
    const isNew = wave > prev;
    if (isNew) {
      localStorage.setItem('lvsHiScore', String(wave));
      this.add.text(W / 2, H / 2 - 52, '🏆 НОВИЙ РЕКОРД!', {
        fontSize: '20px', fill: '#FFD700', stroke: '#000', strokeThickness: 2
      }).setOrigin(0.5);
    } else {
      this.add.text(W / 2, H / 2 - 52, `🏆 Рекорд: Хвиля ${Math.max(prev, wave)}`, {
        fontSize: '18px', fill: '#FFD700', stroke: '#000', strokeThickness: 2
      }).setOrigin(0.5);
    }

    this.add.text(W / 2, H / 2 - 10, 'Бюрократи перемогли цього разу…', {
      fontSize: '14px', fill: '#aaaaaa'
    }).setOrigin(0.5);

    // Restart button
    const restart = this.add.text(W / 2, H / 2 + 50, '🔄 Грати знову', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#2ecc71',
      padding: { x: 24, y: 12 },
      stroke: '#145a32',
      strokeThickness: 2
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    restart.on('pointerover', () => restart.setStyle({ backgroundColor: '#27ae60' }));
    restart.on('pointerout',  () => restart.setStyle({ backgroundColor: '#2ecc71' }));
    restart.on('pointerdown', () => {
      this.registry.set('gold',   150);
      this.registry.set('health', 10);
      this.registry.set('wave',   0);
      this.registry.set('score',  0);
      this.scene.stop('GameOverScene');
      this.scene.stop('UIScene');
      this.scene.stop('BattleScene');
      this.scene.start('BattleScene');
      this.scene.launch('UIScene');
    });

    // Main menu button
    const menu = this.add.text(W / 2, H / 2 + 115, '🏠 Головне меню', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#2980b9',
      padding: { x: 18, y: 10 },
      stroke: '#1a5276',
      strokeThickness: 2
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    menu.on('pointerover', () => menu.setStyle({ backgroundColor: '#3498db' }));
    menu.on('pointerout',  () => menu.setStyle({ backgroundColor: '#2980b9' }));
    menu.on('pointerdown', () => {
      this.registry.set('gold',   150);
      this.registry.set('health', 10);
      this.registry.set('wave',   0);
      this.registry.set('score',  0);
      this.scene.stop('GameOverScene');
      this.scene.stop('UIScene');
      this.scene.stop('BattleScene');
      this.scene.start('KhutirScene');
    });
  }
}
