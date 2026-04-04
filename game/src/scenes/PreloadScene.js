import Phaser from 'phaser';
import { TOWER_KEYS } from '../data/TowerRegistry.js';

/**
 * PreloadScene — єдине місце завантаження ассетів.
 * Якщо файл відсутній — генерує запасну (fallback) текстуру програмно.
 * Ніяка інша сцена не повинна містити this.load.*
 */
export class PreloadScene extends Phaser.Scene {
    constructor() { super('PreloadScene'); }

    preload() {
        const { width, height } = this.scale;

        // --- Loading bar UI ---
        this.add.rectangle(width / 2, height / 2, 304, 24, 0x444444);
        const bar = this.add.rectangle(width / 2 - 150, height / 2, 0, 20, 0xffcc00);
        bar.setOrigin(0, 0.5);

        this.add.text(width / 2, height / 2 - 36, 'Завантаження Хутора...', {
            fill: '#ffffff', fontSize: '18px'
        }).setOrigin(0.5);

        this.load.on('progress', (p) => bar.setSize(300 * p, 20));

        // --- Tower sprites from /public ---
        TOWER_KEYS.forEach(key => this.load.image(key, `/${key}.png`));

        // --- Enemy sprite ---
        this.load.image('bureaucrat', 'https://labs.phaser.io/assets/sprites/behold.png');
    }

    create() {
        this._generateFallbacks();
        this.scene.start('KhutirScene');
    }

    /**
     * Для кожного ключа, який не вдалося завантажити або відсутній,
     * генеруємо просту кольорову текстуру-замінник.
     * Також генеруємо 'bullet' — єдину текстуру для пула снарядів.
     */
    _generateFallbacks() {
        const fallbacks = {
            goose:      0xffee00,
            borshch:    0x8b0000,
            bureaucrat: 0x777777
        };

        Object.entries(fallbacks).forEach(([key, color]) => {
            if (!this.textures.exists(key)) {
                const g = this.make.graphics({ add: false });
                g.fillStyle(color);
                g.fillRect(0, 0, 32, 32);
                g.generateTexture(key, 32, 32);
                g.destroy();
            }
        });

        // Білий кружечок для пула снарядів; тінтується під колір вежі під час пострілу
        if (!this.textures.exists('bullet')) {
            const g = this.make.graphics({ add: false });
            g.fillStyle(0xffffff);
            g.fillCircle(8, 8, 8);
            g.generateTexture('bullet', 16, 16);
            g.destroy();
        }
    }
}
