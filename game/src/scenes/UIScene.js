import Phaser from 'phaser';
import { CONFIG } from '../data/config.js';

export default class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene', active: false });
  }

  create() {
    const W = this.sys.game.canvas.width;

    // ── Top HUD bar ───────────────────────────────────────────────────
    const topBar = this.add.graphics();
    topBar.fillStyle(0x000000, 0.55);
    topBar.fillRect(0, 0, W, 44);

    // Gold
    this._goldIcon = this.add.text(12, 8, '💰', { fontSize: '20px' });
    this._goldText = this.add.text(36, 10, '0', {
      fontSize: '18px', fill: '#FFD700', stroke: '#000', strokeThickness: 2
    });

    // Wave
    this._waveIcon = this.add.text(W / 2 - 60, 8, '⚡', { fontSize: '20px' });
    this._waveText = this.add.text(W / 2 - 36, 10, 'Хвиля 0', {
      fontSize: '18px', fill: '#ffffff', stroke: '#000', strokeThickness: 2
    });

    // Health hearts
    this._healthText = this.add.text(W - 10, 10, '', {
      fontSize: '18px', fill: '#ff5555', stroke: '#000', strokeThickness: 2
    }).setOrigin(1, 0);

    // ── Ability button ────────────────────────────────────────────────
    this._abilityBtn = this.add.text(W - 12, 52, `💊 Мазь (${CONFIG.ability.cost}💰)`, {
      fontSize: '13px',
      fill: '#ffffff',
      backgroundColor: '#1a7a3a',
      padding: { x: 10, y: 6 },
      stroke: '#0a3a1a',
      strokeThickness: 2
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true }).setDepth(20);

    this._abilityBtn.on('pointerover', () => this._abilityBtn.setStyle({ backgroundColor: '#27ae60' }));
    this._abilityBtn.on('pointerout',  () => this._abilityBtn.setStyle({ backgroundColor: '#1a7a3a' }));
    this._abilityBtn.on('pointerdown', () => {
      this.game.events.emit('activateAbility');
      // brief flash feedback
      this._abilityBtn.setStyle({ backgroundColor: '#00ff88' });
      this.time.delayedCall(300, () => {
        if (this._abilityBtn && this._abilityBtn.scene) {
          this._abilityBtn.setStyle({ backgroundColor: '#1a7a3a' });
        }
      });
    });

    // ── Poll registry changes ─────────────────────────────────────────
    this.registry.events.on('changedata', this._onRegistryChange, this);
    this._refresh();
  }

  _onRegistryChange() {
    this._refresh();
  }

  _refresh() {
    const gold   = this.registry.get('gold')   ?? CONFIG.startGold;
    const health = this.registry.get('health') ?? CONFIG.startHealth;
    const wave   = this.registry.get('wave')   ?? 0;

    this._goldText.setText(String(gold));
    this._waveText.setText(`Хвиля ${wave}`);

    // Draw heart icons
    const hearts = '❤️'.repeat(Math.max(0, health)) + '🖤'.repeat(Math.max(0, CONFIG.startHealth - health));
    this._healthText.setText(hearts);

    // Grey out ability button if not enough gold
    const canAfford = gold >= CONFIG.ability.cost;
    this._abilityBtn.setAlpha(canAfford ? 1 : 0.45);
  }
}
