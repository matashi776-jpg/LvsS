import Phaser from 'phaser';
import { CONFIG } from '../data/config.js';
import { Calculator } from '../utils/Calculator.js';
import WaveManager from '../utils/WaveManager.js';

export default class BattleScene extends Phaser.Scene {
  constructor() {
    super('BattleScene');
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────

  create() {
    this._initState();
    this._drawBackground();
    this._drawLanes();
    this._createHero();
    this._createInitialGeese();
    this._setupProjectilePool();
    this._setupOverlaps();
    this._setupInventoryDrag();
    this._listenAbilityEvent();
    this._updateRegistry();

    // Start first wave after short delay
    this.time.delayedCall(2200, () => this._launchNextWave());
  }

  update() {
    if (this._gameOver) return;
    this._tickEnemies();
    this._recycleOffscreenProjectiles();
  }

  // ── Initialise state ───────────────────────────────────────────────────

  _initState() {
    this._gameOver   = false;
    this._abilityOn  = false;
    this.gold        = CONFIG.startGold;
    this.health      = CONFIG.startHealth;
    this.currentWave = 0;
    this.laneGeese   = [];      // active goose sprites indexed by lane
    this.waveManager = new WaveManager(this);
  }

  // ── Background & lanes ────────────────────────────────────────────────

  _drawBackground() {
    const { width: W, height: H } = this.sys.game.canvas;
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x5a9464, 0x5a9464, 0x3d6b40, 0x3d6b40, 1);
    bg.fillRect(0, 0, W, H);

    // Sky strip at top
    const sky = this.add.graphics();
    sky.fillGradientStyle(0x87CEEB, 0x87CEEB, 0x5a9464, 0x5a9464, 1);
    sky.fillRect(0, 0, W, 80);
  }

  _drawLanes() {
    const W = this.sys.game.canvas.width;
    const g = this.add.graphics();

    CONFIG.lanes.forEach((y, i) => {
      // Lane track
      g.fillStyle(0x3a5c38, 0.45);
      g.fillRect(CONFIG.gooseStartX - 20, y - 38, W - CONFIG.gooseStartX + 20, 76);

      // Dashed dividers
      g.lineStyle(1, 0x2a4a28, 0.4);
      g.strokeRect(CONFIG.gooseStartX - 20, y - 38, W - CONFIG.gooseStartX + 20, 76);

      // Lane label
      this.add.text(8, y, `Лінія ${i + 1}`, {
        fontSize: '10px', fill: '#aaffaa', alpha: 0.6
      }).setOrigin(0, 0.5).setDepth(1);
    });

    // Base line (left wall)
    g.lineStyle(3, 0xFFD700, 0.8);
    g.strokeRect(CONFIG.baseX - 2, CONFIG.lanes[0] - 50,
      CONFIG.gooseStartX - CONFIG.baseX + 15,
      CONFIG.lanes[CONFIG.lanes.length - 1] - CONFIG.lanes[0] + 100);
  }

  // ── Hero ──────────────────────────────────────────────────────────────

  _createHero() {
    const y = 300;
    const key = this.textures.exists('hero') ? 'hero' : 'hero';
    this.hero = this.add.sprite(CONFIG.heroX, y, key);

    if (this.textures.exists('hero') && this.textures.get('hero').source[0].width > 2) {
      this.hero.setScale(0.2);
    } else {
      this.hero.setDisplaySize(50, 80);
    }

    this.hero.setDepth(5);

    // Limping idle tween
    this.tweens.add({
      targets: this.hero,
      y: y + 8,
      duration: 2000,
      yoyo: true,
      loop: -1,
      ease: 'Sine.easeInOut'
    });
  }

  // ── Geese ─────────────────────────────────────────────────────────────

  _createInitialGeese() {
    CONFIG.lanes.forEach((y, i) => {
      this._placeGoose(CONFIG.gooseStartX, y, i, false);
    });
  }

  _placeGoose(x, y, laneIndex, paid) {
    const key = this.textures.exists('goose') && this.textures.get('goose').source[0].width > 2
      ? 'goose' : 'goose';
    const goose = this.add.sprite(x, y, key);

    if (this.textures.exists('goose') && this.textures.get('goose').source[0].width > 2) {
      goose.setScale(0.15);
    } else {
      goose.setDisplaySize(42, 52);
    }

    goose.setDepth(4);
    goose.laneIndex = laneIndex;
    goose.level     = 0;
    goose.baseY     = y;

    // Breathing animation with phase offset
    this.tweens.add({
      targets: goose,
      y: y + 5,
      duration: 1500,
      yoyo: true,
      loop: -1,
      delay: laneIndex * 200,
      ease: 'Sine.easeInOut'
    });

    // Auto-fire timer
    const timer = this.time.addEvent({
      delay: CONFIG.goose.fireRate,
      loop: true,
      callback: () => this._tryFire(goose)
    });
    goose.fireTimer = timer;

    this.laneGeese.push(goose);
    return goose;
  }

  _tryFire(goose) {
    if (this._gameOver) return;
    const laneY = CONFIG.lanes[goose.laneIndex];
    const hasTarget = this.enemies.getChildren().some(
      e => e.active && Math.abs(e.y - laneY) < 45 && e.x > goose.x
    );
    if (hasTarget) this._fireProjectile(goose);
  }

  // ── Projectile pool ───────────────────────────────────────────────────

  _setupProjectilePool() {
    const key = this.textures.exists('borshch') && this.textures.get('borshch').source[0].width > 2
      ? 'borshch' : 'borshch';
    this.projectiles = this.physics.add.group({
      defaultKey: key,
      maxSize: 80,
      runChildUpdate: false
    });
    this.enemies = this.physics.add.group();
  }

  _fireProjectile(goose) {
    const laneY = CONFIG.lanes[goose.laneIndex];
    const proj = this.projectiles.get(goose.x + 28, laneY);
    if (!proj) return;

    proj.setActive(true).setVisible(true);

    const isReal = this.textures.exists('borshch') && this.textures.get('borshch').source[0].width > 2;
    if (isReal) {
      proj.setScale(0.06);
    } else {
      proj.setDisplaySize(18, 18);
    }

    proj.body.reset(goose.x + 28, laneY);
    proj.setVelocityX(420);
    proj.setDepth(6);
    proj.damage    = Calculator.towerDamage(CONFIG.goose.damage, goose.level);
    proj.laneIndex = goose.laneIndex;

    if (this._abilityOn) proj.damage = Math.floor(proj.damage * 1.5);

    // Rotation tween
    this.tweens.add({ targets: proj, angle: 360, duration: 700, loop: -1 });
  }

  // ── Physics overlaps ──────────────────────────────────────────────────

  _setupOverlaps() {
    this.physics.add.overlap(
      this.projectiles,
      this.enemies,
      this._onHit,
      null,
      this
    );
  }

  _onHit(proj, enemy) {
    if (!proj.active || !enemy.active) return;

    // Deactivate projectile
    this.tweens.killTweensOf(proj);
    proj.setActive(false).setVisible(false);
    proj.body.reset(-200, -200);

    // Apply damage
    enemy.hp -= proj.damage;
    this._updateHPBar(enemy);
    this._spawnHitParticles(proj.x, proj.y);

    if (enemy.hp <= 0) {
      this._killEnemy(enemy, true);
    }
  }

  // ── Enemy spawning ────────────────────────────────────────────────────

  spawnEnemy(type, laneIndex, wave) {
    if (this._gameOver) return;
    const laneY = CONFIG.lanes[laneIndex];
    const fbKey = `${type}_fb`;
    const texKey = this.textures.exists(fbKey) ? fbKey : 'intern_fb';

    const enemy = this.physics.add.sprite(CONFIG.enemySpawnX, laneY, texKey);
    enemy.setDisplaySize(32, 52);
    enemy.setVelocityX(-Calculator.enemySpeed(type, wave));
    enemy.setDepth(3);

    enemy.hp         = Calculator.enemyHP(wave);
    enemy.maxHp      = enemy.hp;
    enemy.type       = type;
    enemy.laneIndex  = laneIndex;
    enemy.goldReward = Calculator.goldReward(type);
    enemy.waveNum    = wave;

    this.enemies.add(enemy);
    this._addHPBar(enemy);
    this._scheduleSpeechBubble(enemy);

    return enemy;
  }

  // ── HP bars ───────────────────────────────────────────────────────────

  _addHPBar(enemy) {
    enemy.hpBar = this.add.graphics();
    enemy.hpBar.setDepth(7);
    this._updateHPBar(enemy);
  }

  _updateHPBar(enemy) {
    if (!enemy.hpBar || !enemy.active) return;
    const bar = enemy.hpBar;
    bar.clear();
    const w = 32, h = 5;
    const x = enemy.x - w / 2;
    const y = enemy.y - 34;
    bar.fillStyle(0x333333);
    bar.fillRect(x, y, w, h);
    const ratio = Phaser.Math.Clamp(enemy.hp / enemy.maxHp, 0, 1);
    const col = ratio > 0.6 ? 0x33cc33 : ratio > 0.3 ? 0xffcc00 : 0xff3333;
    bar.fillStyle(col);
    bar.fillRect(x, y, w * ratio, h);
    bar.x = 0;
    bar.y = 0;
  }

  // ── Speech bubbles ────────────────────────────────────────────────────

  _scheduleSpeechBubble(enemy) {
    this.time.delayedCall(Phaser.Math.Between(600, 3000), () => {
      if (!enemy.active || !enemy.scene) return;
      const phrase = Phaser.Utils.Array.GetRandom(CONFIG.phrases);
      const bubble = this.add.text(enemy.x, enemy.y - 46, phrase, {
        fontSize: '9px',
        fill: '#222222',
        backgroundColor: '#ffffcc',
        padding: { x: 4, y: 2 },
        wordWrap: { width: 85 }
      }).setOrigin(0.5, 1).setDepth(9);

      enemy.speechBubble = bubble;

      this.time.delayedCall(2600, () => {
        if (!bubble.scene) return;
        this.tweens.add({
          targets: bubble,
          alpha: 0,
          duration: 400,
          onComplete: () => this.time.delayedCall(0, () => bubble.destroy())
        });
        enemy.speechBubble = null;
      });
    });
  }

  // ── Hit VFX ───────────────────────────────────────────────────────────

  _spawnHitParticles(x, y) {
    for (let i = 0; i < 6; i++) {
      const dot = this.add.graphics();
      dot.fillStyle(0xCC2222);
      dot.fillCircle(0, 0, 3 + Math.random() * 2);
      dot.x = x;
      dot.y = y;
      dot.setDepth(10);

      const angle = Math.random() * Math.PI * 2;
      const dist  = 18 + Math.random() * 28;
      this.tweens.add({
        targets: dot,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        alpha: 0,
        duration: 380,
        ease: 'Power2',
        onComplete: () => this.time.delayedCall(0, () => dot.destroy())
      });
    }
  }

  // ── Enemy death ───────────────────────────────────────────────────────

  _killEnemy(enemy, giveGold) {
    if (!enemy.active) return;

    // Screen shake on kill
    this.cameras.main.shake(160, 0.006);

    if (giveGold) {
      this.gold += enemy.goldReward;
      this._updateRegistry();
      this._floatText(enemy.x, enemy.y, `+${enemy.goldReward}💰`, '#FFD700');
    }

    this._cleanupEnemy(enemy);
    this.waveManager.onEnemyRemoved();
  }

  _cleanupEnemy(enemy) {
    this.time.delayedCall(0, () => {
      if (enemy.hpBar && enemy.hpBar.scene)       enemy.hpBar.destroy();
      if (enemy.speechBubble && enemy.speechBubble.scene) enemy.speechBubble.destroy();
    });
    enemy.setActive(false).setVisible(false);
    this.time.delayedCall(0, () => { if (enemy.scene) enemy.destroy(); });
  }

  // ── Floating text ──────────────────────────────────────────────────────

  _floatText(x, y, text, color = '#ffffff') {
    const t = this.add.text(x, y, text, {
      fontSize: '15px', fill: color, stroke: '#000', strokeThickness: 2
    }).setOrigin(0.5).setDepth(11);

    this.tweens.add({
      targets: t,
      y: y - 55,
      alpha: 0,
      duration: 1200,
      ease: 'Power2',
      onComplete: () => this.time.delayedCall(0, () => t.destroy())
    });
  }

  // ── Wave management ───────────────────────────────────────────────────

  _launchNextWave() {
    if (this._gameOver) return;
    const wave = this.waveManager.startNextWave();
    this.currentWave = wave;
    this._updateRegistry();
    this._floatText(
      this.sys.game.canvas.width / 2,
      this.sys.game.canvas.height / 2 - 40,
      `⚠ Хвиля ${wave}!`,
      '#FF4444'
    );
  }

  onWaveComplete() {
    if (this._gameOver) return;
    const bonus = Calculator.waveClearBonus(this.currentWave);
    this.gold += bonus;
    this._updateRegistry();
    this._floatText(
      this.sys.game.canvas.width / 2,
      90,
      `✅ Хвиля ${this.currentWave} пройдена!  +${bonus}💰`,
      '#00FF88'
    );
    this.time.delayedCall(3000, () => this._launchNextWave());
  }

  // ── Hero ability ──────────────────────────────────────────────────────

  activateAbility() {
    if (this._abilityOn || this.gold < CONFIG.ability.cost) return;
    this.gold -= CONFIG.ability.cost;
    this._abilityOn = true;
    this._updateRegistry();

    // 2× fire rate
    this.laneGeese.forEach(g => {
      if (g.fireTimer) g.fireTimer.delay = CONFIG.goose.fireRate / CONFIG.ability.fireRateMultiplier;
    });

    // Visual flash + heal text
    this.cameras.main.flash(300, 0, 200, 80);
    this._floatText(this.hero.x, this.hero.y - 30, '💊 Мазь! 2× вогонь!', '#00FF88');

    this.time.delayedCall(CONFIG.ability.duration, () => {
      this._abilityOn = false;
      this.laneGeese.forEach(g => {
        if (g.fireTimer) g.fireTimer.delay = CONFIG.goose.fireRate;
      });
      this._floatText(this.hero.x, this.hero.y - 30, '⌛ Мазь скінчилась', '#FF8888');
    });
  }

  _listenAbilityEvent() {
    // UIScene emits this on the shared EventEmitter
    this.game.events.on('activateAbility', this.activateAbility, this);
  }

  // ── Inventory drag & drop ─────────────────────────────────────────────

  _setupInventoryDrag() {
    const W = this.sys.game.canvas.width;

    // Background strip for inventory
    const strip = this.add.graphics();
    strip.fillStyle(0x000000, 0.5);
    strip.fillRect(0, 520, W, 80);
    strip.setDepth(12);

    this.add.text(8, 525, '📦 Запас:', {
      fontSize: '11px', fill: '#FFD700'
    }).setDepth(13);

    this._inventoryIcons = [];
    for (let i = 0; i < 3; i++) {
      const ix = 90 + i * 110;
      const iy = 557;

      const icon = this.add.sprite(ix, iy, 'goose');
      if (this.textures.exists('goose') && this.textures.get('goose').source[0].width > 2) {
        icon.setScale(0.11);
      } else {
        icon.setDisplaySize(38, 48);
      }
      icon.setDepth(14).setInteractive();

      this.add.text(ix, iy + 24, `${CONFIG.goose.cost}💰`, {
        fontSize: '10px', fill: '#FFD700', stroke: '#000', strokeThickness: 1
      }).setOrigin(0.5).setDepth(14);

      icon.origX = ix;
      icon.origY = iy;
      this._inventoryIcons.push(icon);
      this.input.setDraggable(icon);
    }

    // Ghost sprite shown while dragging
    this._ghost = this.add.sprite(-200, -200, 'goose').setAlpha(0.55).setDepth(15);
    if (this.textures.exists('goose') && this.textures.get('goose').source[0].width > 2) {
      this._ghost.setScale(0.13);
    } else {
      this._ghost.setDisplaySize(42, 52);
    }

    this.input.on('dragstart', (_ptr, obj) => {
      if (!this._inventoryIcons.includes(obj)) return;
      obj.setAlpha(0.35);
    });

    this.input.on('drag', (_ptr, obj, dragX, dragY) => {
      if (!this._inventoryIcons.includes(obj)) return;
      this._ghost.setPosition(dragX, dragY);
      this._ghost.setVisible(true);

      // Highlight closest lane
      const closest = this._closestLaneIndex(dragY);
      if (closest !== -1 && Math.abs(dragY - CONFIG.lanes[closest]) < 60) {
        this._ghost.setTint(0xAAFFAA);
      } else {
        this._ghost.clearTint();
      }
    });

    this.input.on('dragend', (ptr, obj) => {
      if (!this._inventoryIcons.includes(obj)) return;
      obj.setAlpha(1);
      this._ghost.setVisible(false);

      const laneIdx = this._closestLaneIndex(ptr.y);
      if (laneIdx !== -1 && Math.abs(ptr.y - CONFIG.lanes[laneIdx]) < 65) {
        if (this.gold >= CONFIG.goose.cost) {
          this.gold -= CONFIG.goose.cost;
          this._updateRegistry();
          const newGoose = this._placeGoose(Phaser.Math.Clamp(ptr.x, CONFIG.gooseStartX, 500), CONFIG.lanes[laneIdx], laneIdx, true);
          this._floatText(newGoose.x, CONFIG.lanes[laneIdx] - 20, '🪿 Гусак на позиції!', '#FFFFFF');
        } else {
          this._floatText(ptr.x, ptr.y, '💸 Мало золота!', '#FF4444');
        }
      }

      // Return icon to original slot
      obj.setPosition(obj.origX, obj.origY);
    });
  }

  _closestLaneIndex(y) {
    let best = -1, minD = Infinity;
    CONFIG.lanes.forEach((ly, i) => {
      const d = Math.abs(y - ly);
      if (d < minD) { minD = d; best = i; }
    });
    return best;
  }

  // ── Update tick ───────────────────────────────────────────────────────

  _tickEnemies() {
    this.enemies.getChildren().forEach(enemy => {
      if (!enemy.active) return;

      // Update HP bar position
      this._updateHPBar(enemy);

      // Update speech bubble position
      if (enemy.speechBubble && enemy.speechBubble.scene) {
        enemy.speechBubble.x = enemy.x;
        enemy.speechBubble.y = enemy.y - 46;
      }

      // Reached base
      if (enemy.x < CONFIG.baseX) {
        this._enemyReachedBase(enemy);
      }
    });
  }

  _recycleOffscreenProjectiles() {
    this.projectiles.getChildren().forEach(p => {
      if (p.active && p.x > this.sys.game.canvas.width + 60) {
        this.tweens.killTweensOf(p);
        p.setActive(false).setVisible(false);
        p.body.reset(-200, -200);
      }
    });
  }

  // ── Enemy reaches base ────────────────────────────────────────────────

  _enemyReachedBase(enemy) {
    this.health = Math.max(0, this.health - 1);
    this._updateRegistry();
    this.cameras.main.shake(300, 0.015);
    this._floatText(70, 300, '💔 -1 Здоров\'я!', '#FF0000');
    this._cleanupEnemy(enemy);
    this.waveManager.onEnemyRemoved();

    if (this.health <= 0 && !this._gameOver) {
      this._triggerGameOver();
    }
  }

  _triggerGameOver() {
    this._gameOver = true;
    this.registry.set('score', this.currentWave);
    this.time.delayedCall(600, () => {
      this.scene.pause();
      this.scene.launch('GameOverScene');
    });
  }

  // ── Registry sync ─────────────────────────────────────────────────────

  _updateRegistry() {
    this.registry.set('gold',   this.gold);
    this.registry.set('health', this.health);
    this.registry.set('wave',   this.currentWave);
  }
}
