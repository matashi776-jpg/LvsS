import Phaser from 'phaser';

/**
 * KhutirScene — Головне меню.
 * Не містить ігрової логіки. Тільки UI та перехід до BattleScene.
 */
export class KhutirScene extends Phaser.Scene {
    constructor() { super('KhutirScene'); }

    create() {
        const { width, height } = this.scale;

        this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a1a);

        this.add.text(width / 2, 80, '🏡 ХУТІР / LANCHYN', {
            fontSize: '36px',
            fill: '#ffcc00',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(width / 2, 135, 'Ніка проти Савка', {
            fontSize: '20px',
            fill: '#888888',
            fontStyle: 'italic'
        }).setOrigin(0.5);

        this.add.text(width / 2, 230, [
            '⚔️  Захисти Хутір від бюрократів-заочників!',
            '',
            '🪿  Бойовий Гусак (50 🥇)  — швидко, клювом',
            '🍲  Борщова Гармата (150 🥇) — важко, гаряче',
            '',
            'Перетягни вежу з панелі інвентарю на доріжку.'
        ].join('\n'), {
            fontSize: '15px',
            fill: '#cccccc',
            lineSpacing: 6,
            align: 'center'
        }).setOrigin(0.5);

        const btn = this.add.rectangle(width / 2, 390, 240, 58, 0x006600)
            .setInteractive({ useHandCursor: true })
            .setStrokeStyle(2, 0x00cc00);

        this.add.text(width / 2, 390, 'ПОЧАТИ ЗМІНУ', {
            fontSize: '22px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        btn.on('pointerover', () => btn.setFillStyle(0x009900));
        btn.on('pointerout',  () => btn.setFillStyle(0x006600));
        btn.on('pointerdown', () => this.scene.start('BattleScene'));

        this.add.text(width / 2, height - 20, 'v0.1 | Lanchyn vs Savok', {
            fontSize: '12px', fill: '#444444'
        }).setOrigin(0.5);
    }
}
