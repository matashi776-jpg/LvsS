import Phaser from 'phaser';
import { CONFIG } from '../data/config.js';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload() {
    const W = this.sys.game.canvas.width;
    const H = this.sys.game.canvas.height;

    // Loading bar background
    const barBg = this.add.graphics();
    barBg.fillStyle(0x333333);
    barBg.fillRoundedRect(W / 2 - 210, H / 2 - 20, 420, 40, 8);

    const bar = this.add.graphics();
    const label = this.add.text(W / 2, H / 2 - 50, 'Завантаження Хутору...', {
      fontSize: '24px', fill: '#ffffff', stroke: '#000', strokeThickness: 2
    }).setOrigin(0.5);

    this.load.on('progress', (value) => {
      bar.clear();
      bar.fillStyle(0x2ecc71);
      bar.fillRoundedRect(W / 2 - 208, H / 2 - 18, 416 * value, 36, 6);
    });

    // ── Images (user-supplied in /public) ──
    this.load.image('hero',    'public/hero.png');
    this.load.image('goose',   'public/goose.png');
    this.load.image('borshch', 'public/borshch.jpg');

    // Track which keys failed
    this._missing = new Set();
    this.load.on('loaderror', (file) => {
      this._missing.add(file.key);
    });
  }

  create() {
    // Generate canvas fallbacks for any missing asset
    this._missing = this._missing || new Set();

    if (this._missing.has('hero') || !this.textures.exists('hero')) {
      this._makeFallback('hero', this._drawHeroCanvas.bind(this), 60, 90);
    }
    if (this._missing.has('goose') || !this.textures.exists('goose')) {
      this._makeFallback('goose', this._drawGooseCanvas.bind(this), 50, 60);
    }
    if (this._missing.has('borshch') || !this.textures.exists('borshch')) {
      this._makeFallback('borshch', this._drawBorshchCanvas.bind(this), 24, 24);
    }

    // Pre-generate enemy fallback textures
    this._makeEnemyFallback('intern', CONFIG.colors.intern);
    this._makeEnemyFallback('clerk',  CONFIG.colors.clerk);
    this._makeEnemyFallback('boss',   CONFIG.colors.boss);

    this.scene.start('BattleScene');
    this.scene.launch('UIScene');
  }

  // ── Canvas painters ──────────────────────────────────────────────────────

  _makeFallback(key, painter, w, h) {
    const canvas = this.textures.createCanvas(key, w, h);
    painter(canvas.getCanvas().getContext('2d'), w, h);
    canvas.refresh();
  }

  _drawHeroCanvas(ctx, w, h) {
    // Body
    ctx.fillStyle = '#A0522D';
    ctx.fillRect(w * 0.25, h * 0.35, w * 0.5, h * 0.55);
    // Head
    ctx.fillStyle = '#FFE0BD';
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.22, w * 0.22, 0, Math.PI * 2);
    ctx.fill();
    // Spear
    ctx.strokeStyle = '#C0C0C0';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(w * 0.8, h * 0.05);
    ctx.lineTo(w * 0.8, h * 0.95);
    ctx.stroke();
    // Spear tip
    ctx.fillStyle = '#C0C0C0';
    ctx.beginPath();
    ctx.moveTo(w * 0.72, h * 0.18);
    ctx.lineTo(w * 0.88, h * 0.18);
    ctx.lineTo(w * 0.8,  h * 0.04);
    ctx.fill();
    // Bandage on leg (white stripe)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(w * 0.25, h * 0.72, w * 0.25, h * 0.1);
  }

  _drawGooseCanvas(ctx, w, h) {
    // Body
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(w * 0.45, h * 0.62, w * 0.38, h * 0.3, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#CCCCCC';
    ctx.lineWidth = 1;
    ctx.stroke();
    // Head
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(w * 0.68, h * 0.28, w * 0.2, 0, Math.PI * 2);
    ctx.fill();
    // Neck
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(w * 0.52, h * 0.44);
    ctx.lineTo(w * 0.62, h * 0.18);
    ctx.lineTo(w * 0.76, h * 0.18);
    ctx.lineTo(w * 0.68, h * 0.44);
    ctx.fill();
    // Beak
    ctx.fillStyle = '#FFA500';
    ctx.beginPath();
    ctx.moveTo(w * 0.84, h * 0.26);
    ctx.lineTo(w * 0.98, h * 0.30);
    ctx.lineTo(w * 0.84, h * 0.34);
    ctx.fill();
    // Eye
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(w * 0.74, h * 0.24, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  _drawBorshchCanvas(ctx, w, h) {
    ctx.fillStyle = '#CC2222';
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, w / 2 - 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FF5555';
    ctx.beginPath();
    ctx.arc(w * 0.36, h * 0.36, w * 0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  _makeEnemyFallback(type, color) {
    const key = `${type}_fb`;
    if (this.textures.exists(key)) return;
    const canvas = this.textures.createCanvas(key, 32, 52);
    const ctx = canvas.getCanvas().getContext('2d');
    const r = ((color >> 16) & 0xFF).toString(16).padStart(2, '0');
    const g = ((color >> 8)  & 0xFF).toString(16).padStart(2, '0');
    const b = ( color        & 0xFF).toString(16).padStart(2, '0');
    const hex = `#${r}${g}${b}`;
    // Body
    ctx.fillStyle = hex;
    ctx.fillRect(6, 20, 20, 30);
    // Head
    ctx.fillStyle = '#FFE0BD';
    ctx.beginPath();
    ctx.arc(16, 14, 11, 0, Math.PI * 2);
    ctx.fill();
    // Hat / badge
    ctx.fillStyle = '#222222';
    ctx.fillRect(5, 2, 22, 8);
    canvas.refresh();
  }
}
