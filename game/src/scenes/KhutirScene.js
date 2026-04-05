import Phaser from 'phaser';
import { CONFIG } from '../data/config.js';

export default class KhutirScene extends Phaser.Scene {
  constructor() {
    super('KhutirScene');
  }

  create() {
    const W = this.sys.game.canvas.width;
    const H = this.sys.game.canvas.height;

    // Sky + ground gradient
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x87CEEB, 0x87CEEB, 0x4a7c59, 0x4a7c59, 1);
    bg.fillRect(0, 0, W, H);

    // Animated sun
    const sun = this.add.circle(660, 75, 38, 0xFFD700);
    this.tweens.add({ targets: sun, y: 88, duration: 3000, yoyo: true, loop: -1, ease: 'Sine.easeInOut' });

    // Ground
    const ground = this.add.graphics();
    ground.fillStyle(0x3d6b40);
    ground.fillRect(0, 400, W, H - 400);

    // Fence
    for (let x = 20; x < W; x += 60) {
      this.add.rectangle(x, 392, 8, 38, 0x8B4513);
    }
    this.add.rectangle(W / 2, 376, W, 8, 0x8B4513);

    // Title
    const title = this.add.text(W / 2, 148, 'ХУТІР vs БЮРОКРАТИ', {
      fontSize: '38px',
      fill: '#FFD700',
      stroke: '#5a2d00',
      strokeThickness: 6,
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.tweens.add({ targets: title, y: 158, duration: 2200, yoyo: true, loop: -1, ease: 'Sine.easeInOut' });

    // Sub-title
    this.add.text(W / 2, 210, 'Захисти хутір від бюрократів!', {
      fontSize: '18px', fill: '#ffffff', stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5);

    // High-score
    const hs = localStorage.getItem('lvsHiScore') || 0;
    this.add.text(W / 2, 256, `🏆 Рекорд: Хвиля ${hs}`, {
      fontSize: '20px', fill: '#FFD700', stroke: '#000', strokeThickness: 2
    }).setOrigin(0.5);

    // Start button
    const btn = this.add.text(W / 2, 336, '▶  ПОЧАТИ  ◀', {
      fontSize: '30px',
      fill: '#ffffff',
      backgroundColor: '#2ecc71',
      padding: { x: 28, y: 14 },
      stroke: '#1a6b3a',
      strokeThickness: 3
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => btn.setStyle({ backgroundColor: '#27ae60' }));
    btn.on('pointerout',  () => btn.setStyle({ backgroundColor: '#2ecc71' }));
    btn.on('pointerdown', () => {
      this.cameras.main.fade(400, 0, 0, 0, false, (_cam, progress) => {
        if (progress >= 1) this.scene.start('PreloadScene');
      });
    });
    this.tweens.add({ targets: btn, scaleX: 1.05, scaleY: 1.05, duration: 900, yoyo: true, loop: -1, ease: 'Sine.easeInOut' });

    // Controls hint
    this.add.text(W / 2, 420, '🪿 Перетягуй гусей на лінії  |  💊 "Мазь" = 2× вогонь на 5 с', {
      fontSize: '12px', fill: '#ccffcc', stroke: '#000', strokeThickness: 1
    }).setOrigin(0.5);
    this.add.text(W / 2, 442, '💰 Збирай золото за ворогів  |  🛡️ Не дай бюрократам пройти!', {
      fontSize: '12px', fill: '#ccffcc', stroke: '#000', strokeThickness: 1
    }).setOrigin(0.5);

    // Decorative geese
    this._drawGeese();
    // Decorative bureaucrat
    this._drawBureaucrat();
  }

  _drawGeese() {
    [{ x: 130, y: 418 }, { x: 195, y: 430 }, { x: 162, y: 448 }].forEach((pos, i) => {
      const g = this.add.graphics();
      g.fillStyle(0xFFFFFF);
      g.fillEllipse(pos.x, pos.y, 30, 40);
      g.fillCircle(pos.x + 5, pos.y - 22, 12);
      g.fillStyle(0xFFA500);
      g.fillTriangle(pos.x + 14, pos.y - 22, pos.x + 27, pos.y - 19, pos.x + 19, pos.y - 15);
      this.tweens.add({ targets: g, y: '-=6', duration: 1100 + i * 250, yoyo: true, loop: -1, ease: 'Sine.easeInOut' });
    });
  }

  _drawBureaucrat() {
    const x = 630, y = 408;
    const g = this.add.graphics();
    g.fillStyle(0x1a1a6e);
    g.fillRect(x - 14, y - 28, 28, 48);
    g.fillStyle(0xffe0bd);
    g.fillCircle(x, y - 38, 17);
    g.fillStyle(0x222222);
    g.fillRect(x - 16, y - 58, 32, 10);
    const stamp = this.add.text(x, y - 55, '📋', { fontSize: '18px' }).setOrigin(0.5);
    this.tweens.add({ targets: stamp, y: y - 42, duration: 700, yoyo: true, loop: -1 });
  }
}
