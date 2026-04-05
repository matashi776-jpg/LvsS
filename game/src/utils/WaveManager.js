import { Calculator } from './Calculator.js';
import { CONFIG } from '../data/config.js';

export default class WaveManager {
  constructor(scene) {
    this.scene = scene;
    this.wave = 0;
    this.remaining = 0;  // enemies still alive or queued this wave
    this.waveInProgress = false;
  }

  /** Choose enemy type based on wave difficulty */
  _pickType(wave) {
    const r = Math.random();
    if (wave <= 3) return 'intern';
    if (wave <= 6) return r < 0.60 ? 'intern' : 'clerk';
    if (wave <= 9) return r < 0.30 ? 'intern' : r < 0.70 ? 'clerk' : 'boss';
    return r < 0.20 ? 'intern' : r < 0.55 ? 'clerk' : 'boss';
  }

  /** Start the next wave; returns the new wave number */
  startNextWave() {
    this.wave++;
    this.waveInProgress = true;

    const count = 3 + Math.floor(this.wave * CONFIG.waveCountMultiplier);
    this.remaining = count;

    for (let i = 0; i < count; i++) {
      const type = this._pickType(this.wave);
      const laneIndex = Math.floor(Math.random() * CONFIG.lanes.length);
      this.scene.time.delayedCall(i * CONFIG.enemySpawnDelay, () => {
        // Scene might have been stopped/destroyed by now
        if (!this.scene.scene || !this.scene.scene.isActive('BattleScene')) return;
        this.scene.spawnEnemy(type, laneIndex, this.wave);
      });
    }

    return this.wave;
  }

  /** Call each time an enemy is destroyed or reaches the base */
  onEnemyRemoved() {
    this.remaining = Math.max(0, this.remaining - 1);
    if (this.remaining === 0 && this.waveInProgress) {
      this.waveInProgress = false;
      this.scene.time.delayedCall(CONFIG.waveCompleteDelay, () => {
        if (this.scene.scene && this.scene.scene.isActive('BattleScene')) {
          this.scene.onWaveComplete();
        }
      });
    }
  }
}
