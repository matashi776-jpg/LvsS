import Phaser from 'phaser';
import { TOWERS, TOWER_KEYS } from '../data/TowerRegistry.js';

const SLOT_W   = 72;
const SLOT_H   = 82;
const SLOT_GAP = 10;
const PANEL_X  = 16;
const PANEL_Y  = 498;   // знизу канвасу (600 - panel height ≈ 102)

/**
 * UIScene — HUD overlay та Drag & Drop інвентар.
 *
 * Запускається через scene.launch('UIScene', { battleScene }) у BattleScene.
 * Спілкується з BattleScene ТІЛЬКИ через:
 *   — this.battleScene.events  (підписка на 'ui:goldChanged', 'ui:waveChanged')
 *   — this.battleScene.placeTower(x, y, key)  (виклик при drop)
 *   — this.battleScene.gold  (читання для перевірки при drag-start)
 *
 * Cleanup: слухачі знімаються в 'shutdown', тому перезапуск UIScene безпечний.
 */
export class UIScene extends Phaser.Scene {
    constructor() { super('UIScene'); }

    // ─── LIFECYCLE ────────────────────────────────────────────────────────────

    init(data) {
        this.battleScene = data.battleScene;
    }

    create() {
        // --- HUD ---
        this.goldText = this.add.text(16, 14, `🥇 ${this.battleScene.gold}`, {
            fontSize: '22px', fill: '#ffcc00', fontStyle: 'bold'
        });

        this.waveText = this.add.text(16, 46, 'Хвиля: 1', {
            fontSize: '16px', fill: '#ffffff'
        });

        if (this.battleScene.playerData) {
            const { hero, vyshyvanka } = this.battleScene.playerData;
            this.add.text(784, 14, `${hero}: ${vyshyvanka}`, {
                fontSize: '13px', fill: '#888888', fontStyle: 'italic'
            }).setOrigin(1, 0);
        }

        // --- Wave announcement banner (прихований за замовчуванням) ---
        this.waveBanner = this.add.text(400, 300, '', {
            fontSize: '40px', fill: '#ffcc00', fontStyle: 'bold',
            stroke: '#000000', strokeThickness: 4
        }).setOrigin(0.5).setAlpha(0).setDepth(50);

        // --- Drag state ---
        this.dragGhost   = null;
        this.draggingKey = null;
        this.dropHint    = null;

        // --- Inventory panel ---
        this._buildInventory();

        // --- BattleScene event listeners ---
        this.battleScene.events.on('ui:goldChanged', this._onGoldChanged,  this);
        this.battleScene.events.on('ui:waveChanged', this._onWaveChanged,  this);

        // Глобальні pointer-події для drag (не прив'язані до конкретного GameObject)
        this.input.on('pointermove', this._onDragMove, this);
        this.input.on('pointerup',   this._onDragEnd,  this);

        // Очистка крос-сцен слухачів при зупинці UIScene
        this.events.once('shutdown', () => {
            this.battleScene.events.off('ui:goldChanged', this._onGoldChanged, this);
            this.battleScene.events.off('ui:waveChanged', this._onWaveChanged, this);
        });
    }

    // ─── INVENTORY ────────────────────────────────────────────────────────────

    _buildInventory() {
        const slotCount = TOWER_KEYS.length;
        const panelW    = slotCount * (SLOT_W + SLOT_GAP) + SLOT_GAP;
        const panelH    = SLOT_H + SLOT_GAP * 2;
        const panelCX   = PANEL_X + panelW / 2;
        const panelCY   = PANEL_Y + panelH / 2;

        // Напівпрозорий фон панелі
        this.add.rectangle(panelCX, panelCY, panelW, panelH, 0x000000, 0.72)
            .setDepth(10);

        // Підказка
        this.add.text(PANEL_X + panelW + 14, PANEL_Y + 10, '← перетягни на доріжку', {
            fontSize: '11px', fill: '#666666'
        }).setDepth(10);

        this.slots = TOWER_KEYS.map((key, i) => {
            const def = TOWERS[key];
            const cx  = PANEL_X + SLOT_GAP + i * (SLOT_W + SLOT_GAP) + SLOT_W / 2;
            const cy  = PANEL_Y + SLOT_GAP + SLOT_H / 2;

            // Слот-рамка
            const slot = this.add.rectangle(cx, cy, SLOT_W, SLOT_H, 0x2a2a2a)
                .setDepth(11)
                .setStrokeStyle(2, 0x555555)
                .setInteractive({ useHandCursor: true });

            // Іконка вежі (реальна текстура або кольоровий квадрат-замінник)
            const icon = this.textures.exists(key)
                ? this.add.image(cx, cy - 10, key).setScale(0.11).setDepth(12)
                : this.add.rectangle(cx, cy - 10, 30, 30, def.bulletColor).setDepth(12);

            // Вартість
            this.add.text(cx, cy + 26, `${def.cost} 🥇`, {
                fontSize: '11px', fill: '#ffcc00'
            }).setOrigin(0.5).setDepth(12);

            // Назва (коротка) — з явного поля shortName
            this.add.text(cx, cy - SLOT_H / 2 + 5, def.shortName, {
                fontSize: '10px', fill: '#cccccc'
            }).setOrigin(0.5, 0).setDepth(12);

            // Drag-events
            slot.on('pointerdown', (ptr) => this._startDrag(ptr, key, def));
            slot.on('pointerover', ()      => {
                if (this.battleScene.gold >= def.cost) slot.setFillStyle(0x3a3a3a);
            });
            slot.on('pointerout',  ()      => {
                slot.setFillStyle(this.battleScene.gold >= def.cost ? 0x2a2a2a : 0x1a1a1a);
            });

            return { slot, icon, key, def };
        });

        this._refreshAffordability(this.battleScene.gold);
    }

    // ─── DRAG & DROP ─────────────────────────────────────────────────────────

    _startDrag(pointer, key, def) {
        if (this.battleScene.gold < def.cost || this.battleScene.gameOver) return;
        if (this.dragGhost) return; // вже тягнемо щось

        this.draggingKey = key;

        // Примара — слідує за курсором
        this.dragGhost = this.textures.exists(key)
            ? this.add.image(pointer.x, pointer.y, key)
                  .setScale(0.13).setAlpha(0.78).setDepth(20)
            : this.add.rectangle(pointer.x, pointer.y, 34, 34, def.bulletColor)
                  .setAlpha(0.78).setDepth(20);

        // Підсвічування зони скидання (ігрова зона без HUD і без панелі)
        this.dropHint = this.add.rectangle(400, 295, 800, 390, 0x00ff88, 0.04)
            .setDepth(9);
    }

    _onDragMove(pointer) {
        if (this.dragGhost) this.dragGhost.setPosition(pointer.x, pointer.y);
    }

    _onDragEnd(pointer) {
        if (!this.draggingKey || !this.dragGhost) return;

        const key = this.draggingKey;

        // Зона скидання: нижче HUD (y > 80) і вище панелі інвентарю (y < 492)
        const inDropZone = pointer.y > 80 && pointer.y < 492;

        if (inDropZone) {
            const placed = this.battleScene.placeTower(pointer.x, pointer.y, key);
            if (placed) this._playPlaceEffect(pointer.x, pointer.y);
        }

        // Прибрати примару та підсвічування
        this.dragGhost.destroy();
        this.dragGhost   = null;
        this.draggingKey = null;

        if (this.dropHint) {
            this.dropHint.destroy();
            this.dropHint = null;
        }
    }

    // ─── EVENT HANDLERS ───────────────────────────────────────────────────────

    _onGoldChanged(gold) {
        this.goldText.setText(`🥇 ${gold}`);
        this._refreshAffordability(gold);
    }

    _onWaveChanged(wave) {
        this.waveText.setText(`Хвиля: ${wave}`);
        this._showWaveBanner(wave);
    }

    // ─── HELPERS ──────────────────────────────────────────────────────────────

    /** Dim slots that the player can no longer afford. */
    _refreshAffordability(gold) {
        if (!this.slots) return;
        this.slots.forEach(({ slot, def }) => {
            const canAfford = gold >= def.cost;
            slot.setFillStyle(canAfford ? 0x2a2a2a : 0x1a1a1a);
            slot.setStrokeStyle(2, canAfford ? 0x555555 : 0x2a2a2a);
            slot.setAlpha(canAfford ? 1.0 : 0.45);
        });
    }

    /** Жовтий спалах у точці розміщення. */
    _playPlaceEffect(x, y) {
        const flash = this.add.circle(x, y, 20, 0xffff00, 0.9).setDepth(15);
        this.tweens.add({
            targets:  flash,
            alpha:    0,
            scaleX:   2.8,
            scaleY:   2.8,
            duration: 380,
            onComplete: () => flash.destroy()
        });
    }

    /** Анімований банер назви хвилі. */
    _showWaveBanner(wave) {
        this.waveBanner.setText(`⚔️  Хвиля ${wave}  ⚔️`).setAlpha(1);
        this.tweens.add({
            targets:  this.waveBanner,
            alpha:    0,
            y:        240,
            duration: 2200,
            ease:     'Power2',
            onComplete: () => this.waveBanner.setY(300)
        });
    }
}
