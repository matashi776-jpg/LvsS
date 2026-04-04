import { Calculator } from '../utils/Calculator.js';

/**
 * WaveManager.js — Менеджер хвиль ворогів.
 * Відповідає ТІЛЬКИ за стан хвилі: не торкається груп Phaser напряму.
 * Взаємодіє з BattleScene через scene.spawnEnemy() та scene.events.
 */
export class WaveManager {
    /**
     * @param {Phaser.Scene} scene — BattleScene
     */
    constructor(scene) {
        this.scene = scene;
        this.currentWave = 0;
        this.enemiesSpawned = 0;
        this.enemiesRemoved = 0;  // вбиті + ті, що пройшли
        this.totalForWave = 0;
        this.isActive = false;
        this.isDestroyed = false;
        this._spawnTimer = null;
    }

    /** Кількість ворогів у хвилі: 4, 6, 8, 10... */
    _enemyCount(wave) {
        return 4 + (wave - 1) * 2;
    }

    /** Запустити наступну хвилю. Ігнорується, якщо хвиля ще активна. */
    startNextWave() {
        if (this.isActive || this.isDestroyed) return;

        this.currentWave++;
        this.isActive = true;
        this.enemiesSpawned = 0;
        this.enemiesRemoved = 0;
        this.totalForWave = this._enemyCount(this.currentWave);

        this.scene.events.emit('waveStart', this.currentWave);

        this._spawnTimer = this.scene.time.addEvent({
            delay: 1500,
            callback: this._spawnNext,
            callbackScope: this,
            loop: true
        });
    }

    /** Викликається таймером — спавнить одного ворога за раз. */
    _spawnNext() {
        if (this.isDestroyed) return;

        if (this.enemiesSpawned < this.totalForWave) {
            this.scene.spawnEnemy(Calculator.getEnemyHealth(this.currentWave));
            this.enemiesSpawned++;
        }

        // Зупинити таймер після спавну всіх
        if (this.enemiesSpawned >= this.totalForWave) {
            this._spawnTimer.remove(false);
            this._spawnTimer = null;
        }
    }

    /**
     * Викликати при кожному знищенні або виході ворога за межі.
     * Коли всі вороги хвилі видалені — емітує 'waveComplete'.
     */
    onEnemyRemoved() {
        if (this.isDestroyed || !this.isActive) return;

        this.enemiesRemoved++;

        const allSpawned = this.enemiesSpawned >= this.totalForWave;
        const allGone = this.enemiesRemoved >= this.totalForWave;

        if (allSpawned && allGone) {
            this.isActive = false;
            this.scene.events.emit('waveComplete', this.currentWave);
        }
    }

    /** Зупинити та очистити всі ресурси. Виклик — при game over або destroy сцени. */
    destroy() {
        this.isDestroyed = true;
        this.isActive = false;
        if (this._spawnTimer) {
            this._spawnTimer.remove(false);
            this._spawnTimer = null;
        }
    }
}
