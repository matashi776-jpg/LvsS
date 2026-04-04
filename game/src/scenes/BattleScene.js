import Phaser from 'phaser';
import { Calculator } from '../utils/Calculator.js';
import { TOWERS } from '../data/TowerRegistry.js';
import { WaveManager } from '../logic/WaveManager.js';

const LANES     = [150, 300, 450];   // Y-координати доріжок
const POOL_SIZE = 80;                 // Максимум снарядів у пулі

/**
 * BattleScene — Оркестратор бойового рівня.
 *
 * ПРАВИЛА ЦІЄї СЦЕНИ:
 *  1. Ніколи не викликати .destroy() прямо в overlap-callback.
 *     Завжди: disableBody → setActive(false) → delayedCall(0, destroy).
 *  2. Знаряди повертаються в пул через killAndHide(), а не destroy().
 *  3. Ніяких alert(). Game Over — лише in-game overlay + scene transition.
 *  4. Вся математика — через Calculator. Нульових магічних чисел.
 *  5. UIScene запускається як overlay через scene.launch().
 */
export class BattleScene extends Phaser.Scene {
    constructor() { super('BattleScene'); }

    // ─── LIFECYCLE ──────────────────────────────────────────────────────────

    create() {
        this.gold      = 300;
        this.gameOver  = false;
        this.playerData = this.game.registry.get('playerData');

        // --- Object Pool для снарядів ---
        // classType: Phaser.Physics.Arcade.Image → повна підтримка фізики та пулу
        this.projectiles = this.physics.add.group({
            classType:     Phaser.Physics.Arcade.Image,
            defaultKey:    'bullet',
            maxSize:       POOL_SIZE,
            runChildUpdate: false,
            createCallback: (obj) => {
                // Новий об'єкт одразу прихований і без фізики
                obj.setActive(false).setVisible(false);
                if (obj.body) obj.body.enable = false;
            }
        });

        // --- Група ворогів (Arcade Sprites через group.create()) ---
        this.enemies = this.physics.add.group();

        // --- Група башт-турелей (розміщені гравцем через D&D) ---
        this.towers = this.add.group();

        // --- Група юнітів-гравця (HoMM: розставлені на початку на лініях) ---
        this.playerUnits = this.add.group();

        // --- Візуалізація доріжок ---
        const g = this.add.graphics();
        g.lineStyle(3, 0x2a2a2a);
        LANES.forEach(y => g.lineBetween(0, y, 800, y));

        // --- Overlap: processCallback фільтрує вже неактивні пари ---
        this.physics.add.overlap(
            this.projectiles,
            this.enemies,
            this.onHit,
            (proj, enemy) => proj.active && enemy.active,
            this
        );

        // --- Попередньо розставити юніти на лініях (HoMM-стиль) ---
        LANES.forEach((y, i) => this.spawnUnit(y, i));

        // --- Wave Manager ---
        this.waveManager = new WaveManager(this);

        this.events.on('waveStart', (wave) => {
            // Пробрасуємо в UIScene через зарезервований простір імен 'ui:'
            this.events.emit('ui:waveChanged', wave);
        });

        this.events.on('waveComplete', (wave) => {
            if (this.gameOver) return;
            // Бонус золота між хвилями: нагорода × 3
            this.addGold(Calculator.getGoldReward(wave) * 3);
            // Пауза перед наступною хвилею
            this.time.delayedCall(4000, () => {
                if (!this.gameOver) this.waveManager.startNextWave();
            });
        });

        // --- Запуск UIScene як overlay ---
        this.scene.launch('UIScene', { battleScene: this });

        // --- Стартуємо першу хвилю після короткого intro ---
        this.time.delayedCall(1500, () => this.waveManager.startNextWave());
    }

    // ─── PUBLIC API (для UIScene) ────────────────────────────────────────────

    /**
     * Розмістити башту-турель на доріжці (D&D з інвентарю).
     * @param {number} x
     * @param {number} y
     * @param {string} towerKey — ключ з TowerRegistry
     * @returns {boolean} true якщо вдало
     */
    placeTower(x, y, towerKey) {
        const def = TOWERS[towerKey];
        if (!def || this.gold < def.cost || this.gameOver) return false;

        // Прив'язка до найближчої доріжки
        const snappedY = LANES.reduce((prev, curr) =>
            Math.abs(curr - y) < Math.abs(prev - y) ? curr : prev
        );

        const tower = this.add.image(x, snappedY, towerKey).setScale(0.12);
        tower.towerKey = towerKey;
        tower.level    = 1;
        tower.def      = def;
        this.towers.add(tower);

        this.gold -= def.cost;
        this.events.emit('ui:goldChanged', this.gold);

        // Зберігаємо ref таймера — щоб скасувати при game over
        tower.shootTimer = this.time.addEvent({
            delay:    def.fireRate,
            callback: () => { if (tower.active) this._shoot(tower); },
            loop:     true
        });

        return true;
    }

    /**
     * Розставити юніта-гравця (HoMM-стиль): ліва сторона лінії.
     * Анімація "дихання" + таймер автопострілу.
     * @param {number} y — Y-координата лінії
     * @param {number} i — індекс лінії (зміщує фазу анімації)
     */
    spawnUnit(y, i) {
        const def  = TOWERS.goose;
        const unit = this.add.sprite(120, y, def.texture).setScale(0.85).setDepth(5);

        // HoMM idle «дихання» — плавний підйом/спуск зі зміщеною фазою на кожній лінії
        this.tweens.add({
            targets:  unit,
            y:        `+=${10}`,
            duration: 1500 + i * 200,
            yoyo:     true,
            loop:     -1,
            ease:     'Sine.easeInOut'
        });

        // Прив'язати def щоб _shoot() працював однаково для юнітів і башт
        unit.def   = def;
        unit.level = 1;

        // Зберігаємо таймер для можливого скасування в _endGame
        unit.shootTimer = this.time.addEvent({
            delay:    def.fireRate,
            callback: () => { if (unit.active && !this.gameOver) this._shoot(unit); },
            loop:     true
        });

        this.playerUnits.add(unit);
    }

    /**
     * Спавнить ворога з заданим HP. Викликається WaveManager.
     * @param {number} hp
     */
    spawnEnemy(hp) {
        if (this.gameOver) return;

        const y     = LANES[Math.floor(Math.random() * LANES.length)];
        const enemy = this.enemies.create(850, y, 'bureaucrat');

        enemy.hp    = hp;
        enemy.maxHp = hp;
        enemy.setScale(0.8).setDepth(4);

        if (enemy.body) {
            enemy.body.setVelocityX(-120);
            // Відключаємо gravity (на випадок глобального override)
            enemy.body.setAllowGravity(false);
        }
    }

    // ─── OVERLAP CALLBACK ────────────────────────────────────────────────────

    /**
     * Викликається фізичним рушієм при зіткненні снаряда з ворогом.
     *
     * ВАЖЛИВО: ніколи не викликати .destroy() тут — ми посеред physics step.
     * Снаряди → killAndHide (повернення в пул).
     * Вороги → _safeRemoveEnemy (disableBody + delayedCall(0, destroy)).
     */
    onHit(projectile, enemy) {
        // Читаємо значення ДО будь-якої зміни стану
        const damage = projectile.damage ?? 25;

        // ── Повернути снаряд у пул ──
        this.projectiles.killAndHide(projectile);
        if (projectile.body) {
            projectile.body.enable = false;
            projectile.body.stop();
        }

        // ── Нанести урон ──
        enemy.hp -= damage;

        // Flash-ефект попадання
        enemy.setTint(0xff3333);
        this.time.delayedCall(120, () => { if (enemy.active) enemy.clearTint(); });

        // Спливаючий текст урону
        const dmgText = this.add.text(enemy.x, enemy.y - 20, `-${damage}`, {
            fontSize: '14px', fill: '#ff4444', fontStyle: 'bold'
        });
        this.tweens.add({
            targets:  dmgText,
            y:        enemy.y - 55,
            alpha:    0,
            duration: 600,
            onComplete: () => { if (dmgText.active) dmgText.destroy(); }
        });

        // Смерть ворога
        if (enemy.hp <= 0) {
            const reward = Calculator.getGoldReward(this.waveManager.currentWave);
            this.addGold(reward);
            this._safeRemoveEnemy(enemy);
        }
    }

    // ─── UPDATE ──────────────────────────────────────────────────────────────

    update() {
        if (this.gameOver) return;

        // Збираємо ворогів, що втекли, в окремий масив —
        // щоб не мутувати getChildren() під час ітерації
        const escaped = this.enemies.getChildren()
            .filter(e => e.active && e.x < -20);

        if (escaped.length > 0) {
            escaped.forEach(e => this._safeRemoveEnemy(e));
            this._endGame();
            return;
        }

        // Повернути снаряди, що вийшли за екран, в пул
        this.projectiles.getChildren().forEach(p => {
            if (p.active && p.x > 830) {
                this.projectiles.killAndHide(p);
                if (p.body) { p.body.enable = false; p.body.stop(); }
            }
        });
    }

    // ─── PRIVATE ─────────────────────────────────────────────────────────────

    /** Постріл юніта/башти. Дістаємо снаряд із пулу, НЕ створюємо новий об'єкт. */
    _shoot(unit) {
        const def   = unit.def;
        const laneY = unit.y;

        // Перевірити наявність цілі на доріжці — O(n) але з ранньою зупинкою
        const hasTarget = this.enemies.getChildren().some(
            e => e.active &&
                 Math.abs(e.y - laneY) < 30 &&
                 e.x > unit.x
        );
        if (!hasTarget) return;

        // group.get() — повертає неактивний об'єкт з пулу АБО створює новий
        // (якщо pool < maxSize). Повертає null тільки при повному переповненні.
        const tx   = unit.x + 28;
        const proj = this.projectiles.get(tx, laneY, 'bullet');
        if (!proj) return;

        proj.setActive(true).setVisible(true).setDepth(10); // depth > ворогів (4)
        proj.setTint(def.bulletColor);
        proj.setScale(def.bulletSize / 8);
        proj.damage = Calculator.getTowerDamage(def.damage, unit.level);

        if (proj.body) {
            proj.body.enable = true;
            proj.body.reset(tx, laneY);       // скидає позицію та швидкість
            proj.body.setAllowGravity(false);
            proj.body.setVelocityX(def.bulletSpeed);
        }
    }

    /**
     * Безпечне видалення ворога: відключити фізику → сховати → знищити наступного тіку.
     * Ніколи не викликати destroy() всередині overlap/update callback прямо.
     */
    _safeRemoveEnemy(enemy) {
        if (!enemy.active) return;

        this.physics.world.disable(enemy);
        enemy.setActive(false).setVisible(false);

        this.time.delayedCall(0, () => {
            enemy.destroy();
            this.waveManager.onEnemyRemoved();
        });
    }

    /** Додати золото та сповістити UIScene. */
    addGold(amount) {
        this.gold += amount;
        this.events.emit('ui:goldChanged', this.gold);
    }

    /** Game Over: зупинити все, показати overlay, повернутись у меню. */
    _endGame() {
        if (this.gameOver) return;
        this.gameOver = true;

        // Зупинити всі таймери башт (D&D)
        this.towers.getChildren().forEach(t => {
            if (t.shootTimer) t.shootTimer.remove(false);
        });

        // Зупинити всі таймери юнітів-гравця (HoMM)
        this.playerUnits.getChildren().forEach(u => {
            if (u.shootTimer) u.shootTimer.remove(false);
        });

        this.waveManager.destroy();
        this.scene.stop('UIScene');

        // Overlay
        this.add.rectangle(400, 300, 800, 600, 0x000000, 0.78);
        this.add.text(400, 230, 'ПОРАЗКА!', {
            fontSize: '58px', fill: '#ff2222', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.add.text(400, 305, 'Бюрократ пройшов через Хутір...', {
            fontSize: '20px', fill: '#aaaaaa'
        }).setOrigin(0.5);
        this.add.text(400, 350, '«Приходьте завтра» 🏛️', {
            fontSize: '16px', fill: '#666666', fontStyle: 'italic'
        }).setOrigin(0.5);

        this.time.delayedCall(3500, () => this.scene.start('KhutirScene'));
    }
}
